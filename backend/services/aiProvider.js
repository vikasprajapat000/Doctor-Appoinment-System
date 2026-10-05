/**
 * AI Provider Abstraction — Google Gemini Implementation (Updated)
 * Easily swap to another provider by changing this file.
 */

const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

function getClient() {
  dotenv.config({ override: true });
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE' || apiKey.includes('YOUR_GEMINI_API_KEY')) {
    const err = new Error('AI_API_KEY is not configured with a valid Google Gemini API key (currently using placeholder YOUR_GEMINI_API_KEY_HERE in backend/.env)');
    err.code = 'INVALID_API_KEY';
    throw err;
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Convert our internal message format to Gemini's format.
 * Gemini uses: [{ role: 'user'|'model', parts: [{ text }] }]
 */
function toGeminiHistory(messages) {
  return messages.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content || '' }]
  }));
}

/**
 * Build a tool call description string for the system prompt,
 * since Gemini function calling is available but we handle it
 * via structured output parsing for simplicity with the existing flow.
 *
 * For the current scale we inject tools as JSON in the system prompt
 * and parse the model's structured response.
 */
function buildToolsPrompt(tools) {
  if (!tools || tools.length === 0) return '';

  const toolList = tools.map(t => {
    const params = Object.entries(t.parameters || {})
      .map(([k, v]) => `  - ${k} (${v.type || 'str'}${v.required === false ? ', optional' : ''}): ${v.description}`)
      .join('\n');
    return `### ${t.name}\n${t.description}${params ? '\nParameters:\n' + params : ''}`;
  }).join('\n\n');

  return `\n\n=== AVAILABLE TOOLS ===
You can call these tools to retrieve real data. When you need data, respond with ONLY a JSON object in this exact format (no markdown, no other text):
{"tool_call": {"name": "<tool_name>", "parameters": {<params>}}}

If you do NOT need a tool, respond normally in plain text.

${toolList}
=== END TOOLS ===`;
}

/**
 * Helper to get list of candidate model names in priority order
 */
function getCandidateModels() {
  const envModel = process.env.AI_MODEL;
  const defaults = [
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-2.5-pro',
    'gemini-pro-latest',
    'gemini-3.6-flash',
    'gemini-2.5-flash-lite'
  ];

  if (envModel) {
    return [...new Set([envModel, ...defaults])];
  }
  return defaults;
}

/**
 * Send a message to Google Gemini.
 * @param {string} systemPrompt
 * @param {Array} messages - [{role, content}]
 * @param {Array} tools
 * @returns {Object} { text, toolCalls, finishReason }
 */
async function chat(systemPrompt, messages, tools = []) {
  const client = getClient();
  const candidateModels = getCandidateModels();
  const maxTokens = parseInt(process.env.AI_MAX_TOKENS) || 1024;

  const fullSystemPrompt = systemPrompt + buildToolsPrompt(tools);
  const history = toGeminiHistory(messages.slice(0, -1));
  const lastMessage = messages[messages.length - 1]?.content || '';

  let lastError = null;

  for (const modelName of candidateModels) {
    try {
      const model = client.getGenerativeModel({
        model: modelName,
        systemInstruction: fullSystemPrompt,
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.3
        }
      });

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(lastMessage);
      const responseText = result.response.text().trim();

      // Try to detect a tool call response
      let toolCalls = [];
      try {
        const jsonStr = responseText.replace(/^```json\n?|^```\n?|\n?```$/gm, '').trim();
        const parsed = JSON.parse(jsonStr);
        if (parsed.tool_call && parsed.tool_call.name) {
          toolCalls = [{
            name: parsed.tool_call.name,
            parameters: parsed.tool_call.parameters || {}
          }];
          return { text: '', toolCalls, finishReason: 'TOOL_CALL' };
        }
      } catch (e) {
        // Not a tool call — normal text response
      }

      return {
        text: responseText,
        toolCalls: [],
        finishReason: 'COMPLETE'
      };

    } catch (err) {
      console.warn(`[Gemini Model] Model '${modelName}' failed:`, err.message);
      lastError = err;
      // If error is not a 404 / model missing error, stop trying other models and throw
      const isNotFound = err.message.includes('404') || 
        err.message.includes('not found') || 
        err.message.includes('is not supported for generateContent');
      
      if (!isNotFound) {
        throw err;
      }
    }
  }

  throw lastError;
}

/**
 * Send second-turn message with tool results to get final response.
 * @param {string} systemPrompt
 * @param {Array} messages
 * @param {Array} tools
 * @param {Array} toolResults - [{ name, parameters, result }]
 * @returns {Object} { text, finishReason }
 */
async function chatWithToolResults(systemPrompt, messages, tools, toolResults) {
  const client = getClient();
  const candidateModels = getCandidateModels();
  const maxTokens = parseInt(process.env.AI_MAX_TOKENS) || 1024;

  const fullSystemPrompt = systemPrompt + buildToolsPrompt(tools);
  const history = toGeminiHistory(messages.slice(0, -1));
  const lastUserMessage = messages[messages.length - 1]?.content || '';

  const toolResultsText = toolResults.map(tr =>
    `TOOL RESULT for "${tr.name}":\n${JSON.stringify(tr.result, null, 2)}`
  ).join('\n\n');

  const followUpMessage = `${lastUserMessage}\n\n[SYSTEM: Tool results are below. Use them to answer the user's question directly.]\n\n${toolResultsText}`;

  let lastError = null;

  for (const modelName of candidateModels) {
    try {
      const model = client.getGenerativeModel({
        model: modelName,
        systemInstruction: fullSystemPrompt,
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.3
        }
      });

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(followUpMessage);
      const responseText = result.response.text().trim();

      return {
        text: responseText,
        finishReason: 'COMPLETE'
      };

    } catch (err) {
      console.warn(`[Gemini Model] Model '${modelName}' failed on second turn:`, err.message);
      lastError = err;
      const isNotFound = err.message.includes('404') || 
        err.message.includes('not found') || 
        err.message.includes('is not supported for generateContent');

      if (!isNotFound) {
        throw err;
      }
    }
  }

  throw lastError;
}

module.exports = { chat, chatWithToolResults };
