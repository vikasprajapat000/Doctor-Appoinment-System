/**
 * AI Controller
 * Handles HTTP requests for the AI chat system.
 * All routes require authentication via authMiddleware.
 */

const { processChat, clearConversationHistory } = require('../services/aiService');
const { WELCOME_MESSAGES, SUGGESTED_QUESTIONS } = require('../services/aiRolePrompts');

// Simple in-memory rate limiting (keyed by userId)
// For production, use Redis with express-rate-limit
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = parseInt(process.env.AI_RATE_LIMIT_WINDOW_MS) || 900000; // 15 min
const RATE_LIMIT_MAX = parseInt(process.env.AI_RATE_LIMIT_MAX) || 20;

function checkRateLimit(userId) {
  const now = Date.now();
  const userData = rateLimitStore.get(userId);

  if (!userData || now > userData.resetAt) {
    rateLimitStore.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (userData.count >= RATE_LIMIT_MAX) {
    const resetIn = Math.ceil((userData.resetAt - now) / 1000 / 60);
    return { allowed: false, resetIn };
  }

  userData.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - userData.count };
}

/**
 * POST /api/ai/chat
 * Main AI chat endpoint — requires authentication
 */
exports.chat = async (req, res) => {
  try {
    const { message } = req.body;

    // Validate input
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be a string'
      });
    }

    if (message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty'
      });
    }

    // Get user context from JWT (set by authMiddleware)
    const userId = req.user.id;
    const role = req.user.role;
    const userEmail = req.user.email;

    // Validate role
    const validRoles = ['patient', 'doctor', 'admin', 'superadmin'];
    if (!validRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: 'Your account role is not supported by the AI assistant'
      });
    }

    // Rate limit check
    const rateCheck = checkRateLimit(userId);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        message: `You've sent too many messages. Please wait ${rateCheck.resetIn} minutes before trying again.`
      });
    }

    // Get user's name for personalization
    const User = require('../models/User');
    const user = await User.findById(userId).select('name');
    const userName = user?.name || userEmail || 'User';

    const userContext = {
      userId,
      role,
      name: userName
    };

    // Process the chat through AI service
    const result = await processChat(userContext, message, req);

    return res.json({
      success: true,
      data: {
        type: result.type,
        text: result.text,
        data: result.data,
        requiresConfirmation: result.requiresConfirmation || false,
        confirmationData: result.confirmationData || null,
        toolsUsed: result.toolsUsed || [],
        timestamp: new Date().toISOString(),
        remaining: rateCheck.remaining
      }
    });

  } catch (error) {
    console.error('AI Chat Controller Error:', error.message);

    // Never expose stack traces to users
    return res.status(500).json({
      success: false,
      message: "I'm sorry, something went wrong. Please try again in a moment.",
      // Only include error details in development
      ...(process.env.NODE_ENV === 'development' && { debug: error.message })
    });
  }
};

/**
 * POST /api/ai/clear
 * Clear conversation history for the authenticated user
 */
exports.clearConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    clearConversationHistory(userId);

    return res.json({
      success: true,
      message: 'Conversation history cleared'
    });
  } catch (error) {
    console.error('Clear conversation error:', error);
    return res.status(500).json({ success: false, message: 'Failed to clear conversation' });
  }
};

/**
 * GET /api/ai/welcome
 * Get role-specific welcome message
 */
exports.getWelcomeMessage = async (req, res) => {
  try {
    const role = req.user.role;
    const User = require('../models/User');
    const user = await User.findById(req.user.id).select('name');

    const welcomeText = WELCOME_MESSAGES[role] || WELCOME_MESSAGES.patient;
    const userName = user?.name || 'there';

    return res.json({
      success: true,
      data: {
        message: welcomeText,
        userName,
        role
      }
    });
  } catch (error) {
    console.error('Welcome message error:', error);
    return res.status(500).json({ success: false, message: 'Failed to get welcome message' });
  }
};

/**
 * GET /api/ai/suggestions
 * Get role-specific suggested questions
 */
exports.getSuggestions = async (req, res) => {
  try {
    const role = req.user.role;
    const questions = SUGGESTED_QUESTIONS[role] || SUGGESTED_QUESTIONS.patient;

    return res.json({
      success: true,
      data: {
        role,
        questions
      }
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    return res.status(500).json({ success: false, message: 'Failed to get suggestions' });
  }
};
