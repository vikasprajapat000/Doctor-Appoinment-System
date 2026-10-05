/**
 * AI Routes — Secured, role-aware AI endpoints
 * All routes require authentication via authMiddleware.
 * The old keyword-matcher has been replaced with a real LLM backend.
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const aiController = require('../controllers/aiController');

// Apply authentication to ALL AI routes
// No unauthenticated access to AI features
router.use(authMiddleware);

// POST /api/ai/chat — Main AI chat (all authenticated roles)
router.post('/chat', aiController.chat);

// POST /api/ai/clear — Clear conversation history
router.post('/clear', aiController.clearConversation);

// GET /api/ai/welcome — Role-specific welcome message
router.get('/welcome', aiController.getWelcomeMessage);

// GET /api/ai/suggestions — Role-specific suggested questions
router.get('/suggestions', aiController.getSuggestions);

module.exports = router;
