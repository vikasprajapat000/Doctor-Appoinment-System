/**
 * AI Service — Main Orchestrator
 *
 * Flow:
 * 1. Receive message + history + user context (from JWT)
 * 2. Load role-specific system prompt + knowledge base
 * 3. Call AI provider with tool definitions for the role
 * 4. If AI requests a tool: validate auth + execute through tool registry
 * 5. Send tool results back to AI for final response
 * 6. Return structured response
 *
 * Security: role is always from req.user.role (JWT-verified), never from AI output.
 */

const aiProvider = require('./aiProvider');
const { ROLE_PROMPTS } = require('./aiRolePrompts');
const { KNOWLEDGE_BASE } = require('./aiKnowledgeBase');
const { getToolDefinitionsForRole, executeTool } = require('./aiTools');
const { logActivity } = require('../utils/activityLogger');

// In-memory conversation store (keyed by userId)
// For production at scale, replace with Redis or DB persistence
const conversationStore = new Map();

const MAX_HISTORY_MESSAGES = 20; // Keep last 20 messages for context

// Security: Maximum message length to prevent prompt injection overload
const MAX_MESSAGE_LENGTH = 1000;

// Sensitive data patterns to detect in AI output before sending to user
const SENSITIVE_PATTERNS = [
  /password/i,
  /api[_\s]?key/i,
  /jwt[_\s]?secret/i,
  /mongodb[_\s]?uri/i,
  /access[_\s]?token/i,
  /auth[_\s]?header/i
];

/**
 * Sanitize user input to prevent prompt injection
 */
function sanitizeInput(message) {
  if (!message || typeof message !== 'string') return '';

  // Trim and limit length
  let sanitized = message.trim().substring(0, MAX_MESSAGE_LENGTH);

  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Detect and neutralize common injection patterns
  const injectionPatterns = [
    /ignore (all )?(previous|prior|above) instructions?/i,
    /forget (everything|all|your instructions?)/i,
    /you are now/i,
    /act as (a|an|the) (super ?admin|admin|doctor|different|another)/i,
    /pretend (to be|you are)/i,
    /jailbreak/i,
    /dan mode/i,
    /developer mode/i
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.test(sanitized)) {
      return '__INJECTION_DETECTED__';
    }
  }

  return sanitized;
}

/**
 * Check if AI response contains sensitive information
 */
function filterSensitiveOutput(text) {
  if (!text) return text;
  for (const pattern of SENSITIVE_PATTERNS) {
    if (pattern.test(text)) {
      return 'I cannot share that information for security reasons. Please contact your system administrator if you need assistance.';
    }
  }
  return text;
}

/**
 * Get or create conversation history for a user
 */
function getConversationHistory(userId) {
  if (!conversationStore.has(userId)) {
    conversationStore.set(userId, []);
  }
  return conversationStore.get(userId);
}

/**
 * Clear conversation history for a user
 */
function clearConversationHistory(userId) {
  conversationStore.delete(userId);
}

/**
 * Add message to conversation history (with size limit)
 */
function addToHistory(userId, role, content) {
  const history = getConversationHistory(userId);
  history.push({ role, content });

  // Keep history within limit
  if (history.length > MAX_HISTORY_MESSAGES) {
    history.splice(0, history.length - MAX_HISTORY_MESSAGES);
  }
}

/**
 * Build the full system prompt for a role
 */
function buildSystemPrompt(role, userName) {
  const rolePrompt = ROLE_PROMPTS[role] || ROLE_PROMPTS.patient;
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return `${rolePrompt}

=== SYSTEM CONTEXT ===
Current Date: ${currentDate}
Logged-in User: ${userName}
User Role: ${role.toUpperCase()}

=== APPLICATION KNOWLEDGE BASE ===
${KNOWLEDGE_BASE}

=== RESPONSE GUIDELINES ===
- Be conversational, helpful, and concise
- Use bullet points and formatting for lists
- For appointment data, present it clearly (date, time, doctor name, status)
- For statistics, present numbers clearly
- Always use tool results — never invent or fabricate data
- If you don't have data for something, say so honestly
- Keep responses focused on the user's question
`;
}

/**
 * Main chat function — called by the AI controller
 *
 * @param {Object} userContext - { userId, role, name } from verified JWT
 * @param {string} message - User's message
 * @param {Object} req - Express request for logging
 * @returns {Object} { text, type, data, requiresConfirmation, confirmationData }
 */
async function processChat(userContext, message, req) {
  const { userId, role, name } = userContext;
  const startTime = Date.now();

  // 1. Sanitize input
  const sanitizedMessage = sanitizeInput(message);

  if (!sanitizedMessage) {
    return {
      type: 'error',
      text: 'Please enter a message to continue.',
      data: null
    };
  }

  if (sanitizedMessage === '__INJECTION_DETECTED__') {
    // Log the attempt
    await logActivity(userId, 'ai_injection_attempt', 'User attempted prompt injection in AI chat', null, { message: message.substring(0, 100) }, req);

    return {
      type: 'text',
      text: "I'm sorry, I can't process that request. I'm bound by my role-specific instructions to help you with appointment management. What appointment-related question can I help you with?",
      data: null
    };
  }

  // 2. Get conversation history
  const history = getConversationHistory(userId);

  // 3. Add user message to history
  addToHistory(userId, 'user', sanitizedMessage);

  // 4. Build system prompt
  const systemPrompt = buildSystemPrompt(role, name);

  // 5. Get tools for this role
  const tools = getToolDefinitionsForRole(role);

  let finalResponse = null;
  let toolsUsed = [];
  let toolResults = [];

  try {
    // 6. First AI call — AI may request tool calls
    const aiResponse = await aiProvider.chat(
      systemPrompt,
      [...history],
      tools
    );

    // 7. If AI requested tool calls, execute them
    if (aiResponse.toolCalls && aiResponse.toolCalls.length > 0) {
      for (const toolCall of aiResponse.toolCalls) {
        const toolName = toolCall.name;
        const toolParams = toolCall.parameters || {};

        toolsUsed.push(toolName);

        try {
          // AUTHORIZATION GATE: executeTool validates role before executing
          const result = await executeTool(role, toolName, toolParams, {
            userId,
            role
          });

          toolResults.push({
            name: toolName,
            parameters: toolParams,
            result
          });

          // Log tool usage
          await logActivity(
            userId,
            'ai_tool_call',
            `AI tool called: ${toolName}`,
            null,
            { tool: toolName, role },
            req
          );

        } catch (toolError) {
          console.error(`Tool execution error [${toolName}]:`, toolError.message);
          toolResults.push({
            name: toolName,
            parameters: toolParams,
            result: { error: `Unable to retrieve this information: ${toolError.message}` }
          });
        }
      }

      // 8. Second AI call with tool results to get final response
      const finalAiResponse = await aiProvider.chatWithToolResults(
        systemPrompt,
        [...history],
        tools,
        toolResults
      );

      finalResponse = filterSensitiveOutput(finalAiResponse.text);

    } else {
      // No tool calls needed — direct response
      finalResponse = filterSensitiveOutput(aiResponse.text);
    }

  } catch (providerError) {
    console.error('AI provider error:', providerError.message);

    // Log the error
    await logActivity(userId, 'ai_error', `AI provider error: ${providerError.message}`, null, { role }, req);

    const isApiKeyError = providerError.code === 'INVALID_API_KEY' || 
      providerError.message.includes('YOUR_GEMINI_API_KEY_HERE') || 
      providerError.message.includes('API_KEY_INVALID') || 
      providerError.message.includes('API key not valid') ||
      providerError.message.includes('AI_API_KEY');

    // Attempt intelligent fallback tool execution if API key is not configured!
    if (isApiKeyError) {
      const lowerMsg = sanitizedMessage.toLowerCase();
      
      // Smart Fallback for common user queries:
      if (lowerMsg.includes('doctor') || lowerMsg.includes('available')) {
        try {
          const doctorResult = await executeTool(role, 'getAvailableDoctors', {}, { userId, role });
          if (doctorResult && doctorResult.count > 0) {
            const docListStr = doctorResult.doctors.map(d => `• **${d.name}** (${d.specialization || 'General'}) - ${d.experience || 0} years experience`).join('\n');
            return {
              type: 'doctor_list',
              text: `Here are the available doctors in the system:\n\n${docListStr}\n\n*Note: To enable full Gemini AI, please set a valid AI_API_KEY in backend/.env.*`,
              data: doctorResult,
              toolsUsed: ['getAvailableDoctors']
            };
          }
        } catch (fbErr) {
          // ignore fallback error
        }
      } else if (lowerMsg.includes('appointment')) {
        try {
          const apptResult = await executeTool(role, 'getMyAppointments', {}, { userId, role });
          if (apptResult) {
            return {
              type: 'appointment_list',
              text: `Retrieved your appointment data.\n\n*Note: To enable full Gemini AI, please set a valid AI_API_KEY in backend/.env.*`,
              data: apptResult,
              toolsUsed: ['getMyAppointments']
            };
          }
        } catch (fbErr) {
          // ignore fallback error
        }
      }

      return {
        type: 'error',
        text: "⚠️ **Google Gemini API Key Required**\n\nThe `@google/generative-ai` package is installed, but `AI_API_KEY` in `backend/.env` is set to the default placeholder `YOUR_GEMINI_API_KEY_HERE`.\n\n**To fix this:**\n1. Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/)\n2. Open `backend/.env` and replace `YOUR_GEMINI_API_KEY_HERE` with your API key (`AI_API_KEY=AIzaSy...`)\n3. Restart the backend server (`npm run dev`).",
        data: null
      };
    }

    return {
      type: 'error',
      text: `I'm sorry, I'm having trouble connecting right now (${providerError.message}). Please check your API key in backend/.env and try again.`,
      data: null
    };
  }

  // 9. Add AI response to history
  addToHistory(userId, 'assistant', finalResponse);

  // 10. Parse structured response if any tool returned confirmation needed
  let requiresConfirmation = false;
  let confirmationData = null;
  let responseType = 'text';
  let responseData = null;

  // Check if any tool result requires confirmation
  const confirmationResult = toolResults.find(tr =>
    tr.result && tr.result.requiresConfirmation === true
  );

  if (confirmationResult) {
    requiresConfirmation = true;
    confirmationData = confirmationResult.result;
    responseType = 'confirmation';
  }

  // Detect response type for rich rendering
  if (toolsUsed.includes('getAvailableDoctors') || toolsUsed.includes('getDoctorDetails')) {
    responseType = 'doctor_list';
    responseData = toolResults.find(tr => tr.name.includes('Doctor'))?.result;
  } else if (toolsUsed.some(t => t.toLowerCase().includes('appointment') || t.toLowerCase().includes('upcoming'))) {
    responseType = 'appointment_list';
    responseData = toolResults[0]?.result;
  } else if (toolsUsed.includes('getAppointmentStatistics') || toolsUsed.includes('getSystemStatistics') || toolsUsed.includes('getUserStatistics')) {
    responseType = 'statistics';
    responseData = toolResults[0]?.result;
  }

  // 11. Log AI interaction (safe fields only)
  const duration = Date.now() - startTime;
  await logActivity(
    userId,
    'ai_chat',
    `AI chat interaction (${role})`,
    null,
    {
      role,
      toolsUsed,
      duration,
      messageLength: sanitizedMessage.length
    },
    req
  );

  return {
    type: requiresConfirmation ? 'confirmation' : responseType,
    text: finalResponse,
    data: responseData,
    requiresConfirmation,
    confirmationData,
    toolsUsed
  };
}

module.exports = { processChat, clearConversationHistory, getConversationHistory };
