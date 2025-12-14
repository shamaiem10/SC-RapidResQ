/**
 * Chatbot Service - Optimized Implementation
 * Addresses recursive implementation issues:
 * - Uses loops instead of deep recursion
 * - Implements caching for common emergency answers
 * - Separates concerns (intent detection, response generation, logging)
 * - Clear stopping conditions
 * - No side effects on global data
 */

// Cache for common emergency responses (memoization)
const responseCache = new Map();

// Common emergency responses cache
const commonResponses = {
  'cpr': '🚨 CPR Steps: 1) Call emergency services 2) Place hands on center of chest 3) Push hard and fast (100-120/min) 4) Continue until help arrives',
  'fire': '🔥 Fire Safety: 1) Stay low to avoid smoke 2) Check doors before opening 3) Use stairs, not elevators 4) Call 911 immediately',
  'earthquake': '🌍 Earthquake: 1) Drop to ground 2) Cover head and neck 3) Hold on to sturdy furniture 4) Stay away from windows',
  'panic attack': '💙 Panic Attack: 1) Breathe: Inhale 4s, hold 4s, exhale 6s 2) Focus on 5 things you see 3) Repeat calming phrase 4) You are safe',
  'bleeding': '🩸 Bleeding: 1) Apply direct pressure with clean cloth 2) Elevate injured area 3) Keep pressure until help arrives 4) Call emergency services',
  'choking': '😮 Choking: 1) Encourage coughing if possible 2) Perform Heimlich maneuver 3) Call 911 immediately 4) Continue until object is dislodged'
};

// Emergency keywords for intent detection
const emergencyKeywords = {
  'cpr': ['cpr', 'cardiac', 'heart stopped', 'not breathing'],
  'fire': ['fire', 'burning', 'smoke', 'flame'],
  'earthquake': ['earthquake', 'shaking', 'tremor'],
  'panic attack': ['panic', 'anxiety', 'overwhelmed', 'can\'t breathe'],
  'bleeding': ['bleeding', 'blood', 'cut', 'wound'],
  'choking': ['choking', 'can\'t breathe', 'stuck in throat']
};

// Configuration with clear limits (not hard-coded in logic)
const CONFIG = {
  MAX_MESSAGE_LENGTH: 500,
  MAX_CACHE_SIZE: 100,
  MAX_CONVERSATION_TURNS: 50, // Clear stopping condition
  CACHE_TTL: 3600000 // 1 hour in milliseconds
};

/**
 * Intent Detection - Separated responsibility
 * Detects emergency type from user message
 * @param {string} message - User message
 * @returns {string|null} - Detected emergency type or null
 */
function detectIntent(message) {
  if (!message || typeof message !== 'string') {
    return null;
  }

  const lowerMessage = message.toLowerCase();
  
  // Loop through emergency types (no recursion)
  for (const [emergencyType, keywords] of Object.entries(emergencyKeywords)) {
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword)) {
        return emergencyType;
      }
    }
  }
  
  return null;
}

/**
 * Get Cached Response - Memoization to avoid repeated computations
 * @param {string} intent - Emergency intent type
 * @returns {string|null} - Cached response or null
 */
function getCachedResponse(intent) {
  if (!intent) return null;
  
  const cached = responseCache.get(intent);
  if (cached && (Date.now() - cached.timestamp) < CONFIG.CACHE_TTL) {
    return cached.response;
  }
  
  // Check common responses
  if (commonResponses[intent]) {
    // Cache it for future use
    responseCache.set(intent, {
      response: commonResponses[intent],
      timestamp: Date.now()
    });
    return commonResponses[intent];
  }
  
  return null;
}

/**
 * Log Interaction - Separated logging responsibility
 * @param {string} userId - User ID
 * @param {string} message - User message
 * @param {string} response - Bot response
 * @param {string} intent - Detected intent
 */
function logInteraction(userId, message, response, intent) {
  // Log without side effects on global data
  console.log(`[Chatbot] User: ${userId}, Intent: ${intent || 'general'}, Message length: ${message.length}`);
  // In production, this could write to a separate logging service
}

/**
 * Clean Cache - Prevents memory overflow
 * Removes old cache entries when cache size exceeds limit
 */
function cleanCache() {
  if (responseCache.size > CONFIG.MAX_CACHE_SIZE) {
    const entries = Array.from(responseCache.entries());
    // Sort by timestamp and remove oldest entries
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toRemove = entries.slice(0, entries.length - CONFIG.MAX_CACHE_SIZE);
    toRemove.forEach(([key]) => responseCache.delete(key));
  }
}

/**
 * Process Message - Main service function using loops (not recursion)
 * This replaces recursive implementations with iterative approach
 * @param {string} message - User message
 * @param {string} userId - User ID
 * @param {Array} conversationHistory - Previous messages (limited size)
 * @returns {Object} - { response: string, intent: string, fromCache: boolean }
 */
function processMessage(message, userId, conversationHistory = []) {
  // Clear stopping condition: Check message length
  if (!message || message.length > CONFIG.MAX_MESSAGE_LENGTH) {
    return {
      response: 'Please provide a clear, concise message (max 500 characters).',
      intent: null,
      fromCache: false
    };
  }

  // Clear stopping condition: Check conversation length
  if (conversationHistory.length >= CONFIG.MAX_CONVERSATION_TURNS) {
    return {
      response: 'This conversation has reached the maximum length. Please start a new conversation.',
      intent: null,
      fromCache: false
    };
  }

  // Step 1: Detect intent (separated responsibility)
  const intent = detectIntent(message);
  
  // Step 2: Check cache first (memoization - avoids repeated computations)
  const cachedResponse = getCachedResponse(intent);
  if (cachedResponse) {
    logInteraction(userId, message, cachedResponse, intent);
    return {
      response: cachedResponse,
      intent: intent,
      fromCache: true
    };
  }

  // Step 3: If no cache, return null to indicate AI should generate response
  // The actual AI call remains in chat.js to maintain existing functionality
  logInteraction(userId, message, 'AI-generated', intent);
  
  return {
    response: null, // Signal to use AI
    intent: intent,
    fromCache: false
  };
}

/**
 * Generate Response with AI - Separated AI generation responsibility
 * This can be called from chat.js when cache miss occurs
 * @param {Array} messages - Conversation messages for AI
 * @param {Function} aiClient - AI client function (from chat.js)
 * @returns {Promise<string>} - AI generated response
 */
async function generateAIResponse(messages, aiClient) {
  if (!aiClient || typeof aiClient !== 'function') {
    throw new Error('AI client function is required');
  }

  // Use loop-based approach, not recursion
  try {
    const response = await aiClient(messages);
    
    // Cache the response if intent was detected
    const lastUserMessage = messages[messages.length - 2]?.content || '';
    const intent = detectIntent(lastUserMessage);
    if (intent && response) {
      responseCache.set(intent, {
        response: response,
        timestamp: Date.now()
      });
      cleanCache(); // Prevent memory overflow
    }
    
    return response;
  } catch (error) {
    console.error('[Chatbot Service] AI generation error:', error);
    throw error;
  }
}

module.exports = {
  processMessage,
  detectIntent,
  getCachedResponse,
  generateAIResponse,
  logInteraction,
  cleanCache,
  CONFIG
};
