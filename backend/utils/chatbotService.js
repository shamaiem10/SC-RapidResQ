/**
 * Chatbot Service - Full Implementation for RapidResQ
 * Features:
 * - Handles layered/multi-part emergencies (recursive)
 * - Caching of common emergency responses
 * - AI fallback for unknown emergencies
 * - Logging and clear stopping conditions
 * - No side effects on global data
 */

const responseCache = new Map();

// Common emergency responses
const commonResponses = {
  'cpr': '🚨 CPR Steps: 1) Call emergency services 2) Place hands on center of chest 3) Push hard and fast (100-120/min) 4) Continue until help arrives',
  'fire': '🔥 Fire Safety: 1) Stay low to avoid smoke 2) Check doors before opening 3) Use stairs, not elevators 4) Call 911 immediately',
  'earthquake': '🌍 Earthquake: 1) Drop to ground 2) Cover head and neck 3) Hold on to sturdy furniture 4) Stay away from windows',
  'panic attack': '💙 Panic Attack: 1) Breathe: Inhale 4s, hold 4s, exhale 6s 2) Focus on 5 things you see 3) Repeat calming phrase 4) You are safe',
  'bleeding': '🩸 Bleeding: 1) Apply direct pressure with clean cloth 2) Elevate injured area 3) Keep pressure until help arrives 4) Call emergency services',
  'choking': '😮 Choking: 1) Encourage coughing if possible 2) Perform Heimlich maneuver 3) Call 911 immediately 4) Continue until object is dislodged'
};

// Emergency keywords
const emergencyKeywords = {
  'cpr': ['cpr', 'cardiac', 'heart stopped', 'not breathing'],
  'fire': ['fire', 'burning', 'smoke', 'flame'],
  'earthquake': ['earthquake', 'shaking', 'tremor'],
  'panic attack': ['panic', 'anxiety', 'overwhelmed', 'can\'t breathe'],
  'bleeding': ['bleeding', 'blood', 'cut', 'wound', 'injured'],
  'choking': ['choking', 'can\'t breathe', 'stuck in throat']
};

// Configuration
const CONFIG = {
  MAX_MESSAGE_LENGTH: 500,
  MAX_CACHE_SIZE: 100,
  MAX_CONVERSATION_TURNS: 50,
  CACHE_TTL: 3600000 // 1 hour
};

/**
 * Detect single intent from message
 */
function detectIntent(message) {
  if (!message || typeof message !== 'string') return null;

  const lowerMessage = message.toLowerCase();

  for (const [emergencyType, keywords] of Object.entries(emergencyKeywords)) {
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword)) return emergencyType;
    }
  }

  return null;
}

/**
 * Get cached response
 */
function getCachedResponse(intent) {
  if (!intent) return null;

  const cached = responseCache.get(intent);
  if (cached && (Date.now() - cached.timestamp) < CONFIG.CACHE_TTL) {
    return cached.response;
  }

  if (commonResponses[intent]) {
    responseCache.set(intent, { response: commonResponses[intent], timestamp: Date.now() });
    return commonResponses[intent];
  }

  return null;
}

/**
 * Clean cache to avoid memory overflow
 */
function cleanCache() {
  if (responseCache.size > CONFIG.MAX_CACHE_SIZE) {
    const entries = Array.from(responseCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toRemove = entries.slice(0, entries.length - CONFIG.MAX_CACHE_SIZE);
    toRemove.forEach(([key]) => responseCache.delete(key));
  }
}

/**
 * Log interaction
 */
function logInteraction(userId, message, response, intent) {
  console.log(`[Chatbot] User: ${userId}, Intent: ${intent || 'general'}, Message length: ${message.length}`);
}

/**
 * Recursive detection for layered emergencies
 */
function detectLayeredEmergencies(message, detectedIntents = new Set()) {
  if (!message || message.length === 0) return [];

  const responses = [];

  for (const [intent, keywords] of Object.entries(emergencyKeywords)) {
    if (detectedIntents.has(intent)) continue;

    for (const keyword of keywords) {
      if (message.toLowerCase().includes(keyword)) {
        detectedIntents.add(intent);
        const response = getCachedResponse(intent) || commonResponses[intent];
        if (response) responses.push(response);

        const remainingMessage = message.toLowerCase().replace(keyword, '');
        responses.push(...detectLayeredEmergencies(remainingMessage, detectedIntents));
        return responses;
      }
    }
  }

  return responses;
}

/**
 * Process message (with layered emergency support)
 */
function processMessage(message, userId, conversationHistory = []) {
  if (!message || message.length > CONFIG.MAX_MESSAGE_LENGTH) {
    return {
      response: 'Please provide a clear, concise message (max 500 characters).',
      intent: null,
      fromCache: false
    };
  }

  if (conversationHistory.length >= CONFIG.MAX_CONVERSATION_TURNS) {
    return {
      response: 'This conversation has reached the maximum length. Please start a new conversation.',
      intent: null,
      fromCache: false
    };
  }

  const layeredResponses = detectLayeredEmergencies(message);

  if (layeredResponses.length > 0) {
    const combinedResponse = layeredResponses.join('\n\n');
    logInteraction(userId, message, combinedResponse, 'layered-emergency');
    return {
      response: combinedResponse,
      intent: 'layered-emergency',
      fromCache: true
    };
  }

  // Single intent fallback
  const intent = detectIntent(message);
  const cachedResponse = getCachedResponse(intent);
  if (cachedResponse) {
    logInteraction(userId, message, cachedResponse, intent);
    return { response: cachedResponse, intent, fromCache: true };
  }

  logInteraction(userId, message, 'AI-generated', intent);
  return { response: null, intent, fromCache: false };
}

/**
 * Generate AI response if no cached response exists
 */
async function generateAIResponse(messages, aiClient) {
  if (!aiClient || typeof aiClient !== 'function') {
    throw new Error('AI client function is required');
  }

  try {
    const response = await aiClient(messages);

    const lastUserMessage = messages[messages.length - 2]?.content || '';
    const intent = detectIntent(lastUserMessage);
    if (intent && response) {
      responseCache.set(intent, { response, timestamp: Date.now() });
      cleanCache();
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
