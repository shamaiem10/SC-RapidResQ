const fetch = require('node-fetch');
const { EmergencyCommandANTLRParser } = require('../parsing/EmergencyCommandANTLRParser');

// Initialize ANTLR4 Emergency Command Parser (uses generated JavaScript classes)
const emergencyParser = new EmergencyCommandANTLRParser();

/**
 * CONCURRENCY IMPLEMENTATION
 * =========================
 * Demonstrates: Two Models, Race Conditions, Testing & Debugging Challenges
 */

// SHARED MEMORY MODEL - Global counters (race condition prone)
let emergencyAlertCounter = 0;
let activeRequests = 0;
let parserUsageCount = 0;

// MESSAGE PASSING MODEL - Event queue for emergency processing
const emergencyQueue = [];
const MAX_QUEUE_SIZE = 100;

// Mutex simulation for critical sections
let parserLock = false;
const emergencyLocks = new Map(); // Per-location locks

// Concurrency statistics for debugging
const concurrencyStats = {
  totalRequests: 0,
  concurrentPeaks: 0,
  raceConditions: 0,
  queueOverflows: 0,
  lockContentions: 0
};

// Pakistan fallback data
const fallbackData = {
  hospitals: [
    { name: 'Pakistan Institute of Medical Sciences (PIMS)', phone: '+92-51-9260601', address: 'G-8/3, Islamabad', lat: 33.6693, lon: 73.0762, amenity: 'hospital' },
    { name: 'Shifa International Hospital', phone: '+92-51-8464646', address: 'Sector H-8/4, Islamabad', lat: 33.6566, lon: 73.0645, amenity: 'hospital' },
    { name: 'Armed Forces Institute of Cardiology', phone: '+92-51-9271858', address: 'Rawalpindi', lat: 33.6007, lon: 73.0679, amenity: 'hospital' },
    { name: 'Holy Family Hospital', phone: '+92-51-5560394', address: 'Rawalpindi', lat: 33.5939, lon: 73.0479, amenity: 'hospital' },
    { name: 'Combined Military Hospital (CMH)', phone: '+92-51-9270463', address: 'Rawalpindi', lat: 33.5951, lon: 73.0560, amenity: 'hospital' },
    { name: 'Benazir Bhutto Hospital', phone: '+92-51-9290301', address: 'Rawalpindi', lat: 33.5978, lon: 73.0444, amenity: 'hospital' },
    { name: 'Poly Clinic Hospital', phone: '+92-51-9218944', address: 'G-6/2, Islamabad', lat: 33.6944, lon: 73.0638, amenity: 'hospital' },
    { name: 'Capital Hospital CDA', phone: '+92-51-9252371', address: 'G-6/4, Islamabad', lat: 33.6889, lon: 73.0583, amenity: 'hospital' }
  ],
  emergencyServices: [
    { name: 'Pakistan Police Emergency', phone: '15', address: 'Nationwide', lat: 33.6362, lon: 72.9837, amenity: 'police' },
    { name: 'Rescue 1122', phone: '1122', address: 'Emergency Medical Services', lat: 33.6362, lon: 72.9837, amenity: 'ambulance_station' },
    { name: 'Fire Brigade', phone: '16', address: 'Fire Emergency', lat: 33.6362, lon: 72.9837, amenity: 'fire_station' },
    { name: 'Motorway Police', phone: '130', address: 'Highway Emergency', lat: 33.6362, lon: 72.9837, amenity: 'police' }
  ]
};

// Free Nominatim search for places
async function searchNominatim(lat, lon, amenity, radius = 25000) {
  try {
    const radiusKm = Math.min(radius / 1000, 50); // Convert to km, max 50km
    const url = `https://nominatim.openstreetmap.org/search?format=json&amenity=${amenity}&lat=${lat}&lon=${lon}&bounded=1&viewbox=${lon-0.5},${lat+0.5},${lon+0.5},${lat-0.5}&limit=20`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RapidResq Emergency App (https://github.com/shamaiem10/RapidResq)'
      }
    });
    
    if (!response.ok) {
      console.log('Nominatim API error:', response.status);
      return [];
    }
    
    const data = await response.json();
    return data.filter(place => {
      const distance = calculateDistance(lat, lon, parseFloat(place.lat), parseFloat(place.lon));
      return distance <= radiusKm;
    }).map(place => ({
      id: place.place_id,
      type: 'nominatim',
      name: place.display_name.split(',')[0],
      amenity: amenity,
      phone: null,
      address: place.display_name,
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon)
    }));
  } catch (error) {
    console.log('Nominatim API error:', error.message);
    return [];
  }
}

// Improved Overpass query with more comprehensive search
async function searchOverpass(lat, lon, radius) {
  try {
    const query = `[out:json][timeout:25];
    (
      node["amenity"~"^(hospital|clinic|doctors|pharmacy)$"](around:${radius},${lat},${lon});
      way["amenity"~"^(hospital|clinic|doctors|pharmacy)$"](around:${radius},${lat},${lon});
      relation["amenity"~"^(hospital|clinic|doctors|pharmacy)$"](around:${radius},${lat},${lon});
      node["amenity"~"^(police|fire_station)$"](around:${radius},${lat},${lon});
      way["amenity"~"^(police|fire_station)$"](around:${radius},${lat},${lon});
      relation["amenity"~"^(police|fire_station)$"](around:${radius},${lat},${lon});
      node["healthcare"~"^(hospital|clinic)$"](around:${radius},${lat},${lon});
      way["healthcare"~"^(hospital|clinic)$"](around:${radius},${lat},${lon});
    );
    out center geom;`;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'text/plain',
        'User-Agent': 'RapidResq Emergency App'
      }
    });

    if (!response.ok) {
      console.log('Overpass API error:', response.status);
      return { hospitals: [], emergencyServices: [] };
    }

    const data = await response.json();
    const hospitals = [];
    const emergencyServices = [];

    (data.elements || []).forEach(element => {
      const lat = element.lat || (element.center && element.center.lat);
      const lon = element.lon || (element.center && element.center.lon);
      
      if (!lat || !lon) return;

      const item = {
        id: element.id,
        type: element.type,
        name: element.tags?.name || element.tags?.['name:en'] || 'Unnamed',
        amenity: element.tags?.amenity || element.tags?.healthcare,
        phone: element.tags?.phone || element.tags?.['contact:phone'] || element.tags?.['emergency:phone'],
        address: [
          element.tags?.['addr:housenumber'],
          element.tags?.['addr:street'],
          element.tags?.['addr:city']
        ].filter(Boolean).join(', ') || null,
        lat,
        lon
      };

      if (['hospital', 'clinic', 'doctors', 'pharmacy'].includes(item.amenity)) {
        hospitals.push(item);
      } else if (['police', 'fire_station'].includes(item.amenity)) {
        emergencyServices.push(item);
      }
    });

    return { hospitals, emergencyServices };
  } catch (error) {
    console.log('Overpass error:', error.message);
    return { hospitals: [], emergencyServices: [] };
  }
}

// Check if coordinates are in Pakistan
function isInPakistan(lat, lon) {
  return lat >= 23.5 && lat <= 37.5 && lon >= 60.5 && lon <= 77.5;
}

// Validate lat/lon
function isValidCoords(lat, lon) {
  return Number.isFinite(lat) && Number.isFinite(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

// GET /api/emergency/nearby?lat=..&lon=..&radius=25000
async function getNearby(req, res) {
  const lat = parseFloat(req.query.lat);
  const lon = parseFloat(req.query.lon);
  const radius = Math.min(Math.max(parseInt(req.query.radius || '25000', 10), 500), 50000);

  if (!isValidCoords(lat, lon)) {
    return res.status(400).json({ success: false, message: 'Invalid coordinates' });
  }

  try {
    let hospitals = [];
    let emergencyServices = [];
    let dataSource = 'fallback';

    // Try Overpass API first (completely free)
    console.log('Searching Overpass API...');
    const overpassResults = await searchOverpass(lat, lon, radius);
    
    if (overpassResults.hospitals.length > 0 || overpassResults.emergencyServices.length > 0) {
      hospitals = overpassResults.hospitals;
      emergencyServices = overpassResults.emergencyServices;
      dataSource = 'overpass_osm';
      console.log(`Found ${hospitals.length} hospitals, ${emergencyServices.length} emergency services via Overpass`);
    }

    // If no Overpass results, try Nominatim API (also free)
    if (hospitals.length === 0) {
      console.log('Trying Nominatim API...');
      const [nominatimHospitals, nominatimPolice, nominatimFire] = await Promise.all([
        searchNominatim(lat, lon, 'hospital', radius),
        searchNominatim(lat, lon, 'police', radius),
        searchNominatim(lat, lon, 'fire_station', radius)
      ]);

      if (nominatimHospitals.length > 0 || nominatimPolice.length > 0 || nominatimFire.length > 0) {
        hospitals = nominatimHospitals;
        emergencyServices = [...nominatimPolice, ...nominatimFire];
        dataSource = 'nominatim_osm';
        console.log(`Found ${hospitals.length} hospitals, ${emergencyServices.length} emergency services via Nominatim`);
      }
    }

    // Always include Pakistan fallback data if in Pakistan
    if (isInPakistan(lat, lon)) {
      // Add nearby hospitals from fallback if within range
      const nearbyFallbackHospitals = fallbackData.hospitals.filter(h => {
        const distance = calculateDistance(lat, lon, h.lat, h.lon);
        return distance <= radius / 1000; // Convert to km
      });

      // Merge results: API results + fallback data
      hospitals = [...hospitals, ...nearbyFallbackHospitals];
      emergencyServices = [...emergencyServices, ...fallbackData.emergencyServices];

      // Remove duplicates
      hospitals = hospitals.filter((h, index, self) => 
        index === self.findIndex(t => t.name === h.name)
      );
      emergencyServices = emergencyServices.filter((s, index, self) => 
        index === self.findIndex(t => t.phone === s.phone)
      );
    }

    return res.json({ 
      success: true, 
      hospitals, 
      emergencyServices, 
      radius,
      dataSource: hospitals.length > 0 || emergencyServices.length > 0 ? dataSource : 'fallback_only',
      location: { lat, lon }
    });
  } catch (err) {
    console.error('Emergency services error:', err);
    
    // Final fallback - return Pakistan emergency numbers if in Pakistan
    const emergencyServices = isInPakistan(lat, lon) ? fallbackData.emergencyServices : [];
    
    return res.json({
      success: true,
      hospitals: [],
      emergencyServices,
      radius,
      dataSource: 'emergency_fallback',
      error: 'Limited data available'
    });
  }
}

/**
 * ANTLR PARSING ENDPOINTS
 * ======================
 * Demonstrates: Parser Generators, Grammar Implementation, 
 * Parse Tree Construction, AST Building, Error Handling
 */

// Parse emergency command using ANTLR-style parser (with concurrency demo)
async function parseEmergencyCommand(req, res) {
  // Track concurrent access for demonstration
  const cleanup = trackConcurrentRequest();
  
  try {
    const { command } = req.body;
    
    if (!command || typeof command !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Command text is required',
        example: 'ALERT fire at Lahore priority HIGH contact 1122'
      });
    }

    // ANTLR-Style Parsing Pipeline (with safe concurrent access)
    const parseResult = await safeParserAccess(command.trim());
    
    // Generate emergency ID with potential race condition
    const emergencyId = await processEmergencyConcurrently({ command });
    
    // Add to message queue for processing
    const queueResult = enqueueEmergency(command);
    
    // Process successful parse
    if (parseResult.success && parseResult.ast) {
      const response = {
        success: true,
        command: command,
        ast: parseResult.ast,
        parseTree: parseResult.parseTree,
        tokens: parseResult.tokens,
        semantics: extractSemanticInfo(parseResult.ast),
        diagnostics: parseResult.diagnostics,
        metadata: {
          ...parseResult.metadata,
          concepts: [
            'Parser Generators: ANTLR-style lexer and parser classes',
            'ANTLR Grammar: EmergencyCommand.g4 formal grammar rules',
            'Parse Tree: Hierarchical syntax tree from grammar rules', 
            'AST Construction: Semantic tree via visitor pattern',
            'Error Handling: Lexer, parser, and semantic error recovery'
          ]
        },
        // Concurrency demonstration data
        concurrency: {
          emergencyId: emergencyId,
          queueStatus: queueResult,
          activeRequests: activeRequests,
          parserLocked: parserLock,
          stats: getConcurrencyStats()
        }
      };

      // Execute command if semantically valid
      if (!parseResult.diagnostics.semanticErrors.length) {
        response.execution = await executeEmergencyCommand(parseResult.ast);
      }

      return res.json(response);
    }
    
    // Handle parsing errors
    return res.status(400).json({
      success: false,
      command: command,
      parseTree: parseResult.parseTree,
      tokens: parseResult.tokens,
      diagnostics: parseResult.diagnostics,
      suggestions: generateErrorSuggestions(parseResult.diagnostics),
      examples: [
        'ALERT medical at Karachi University',
        'QUERY hospital near Lahore',
        'STATUS request-12345',
        'HELP fire emergencies'
      ]
    });

  } catch (error) {
    console.error('Parse endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal parsing error',
      message: error.message
    });
  } finally {
    // Always cleanup concurrent tracking
    cleanup();
  }
}

// Get parser statistics and grammar information
async function getParserInfo(req, res) {
  try {
    const stats = emergencyParser.getStatistics();
    const grammar = emergencyParser.getGrammarInfo();
    
    return res.json({
      success: true,
      statistics: stats,
      grammar: grammar,
      antlrConcepts: {
        'Parser Generators': 'Automated parser creation from formal grammar',
        'ANTLR Grammar': 'Context-free grammar defining language syntax',
        'Generating the Parser': 'Lexer and parser class generation from grammar',
        'Traversing the Parse Tree': 'Visitor pattern for tree traversal',
        'Constructing an AST': 'Semantic analysis and abstract syntax tree building',
        'Handling Errors': 'Comprehensive error detection and recovery strategies'
      },
      examples: {
        alerts: [
          'ALERT fire at Mall Road Lahore priority CRITICAL contact 1122',
          'ALERT medical emergency near Karachi University contact +92-321-1234567',
          'ALERT accident at GPS:31.5497,74.3436 priority HIGH'
        ],
        queries: [
          'QUERY hospital near Islamabad',
          'QUERY ambulance at Gulberg Lahore', 
          'QUERY police near GPS:24.8607,67.0011'
        ],
        status: [
          'STATUS request-2024-001',
          'STATUS EMG-12345'
        ],
        help: [
          'HELP medical',
          'HELP fire emergencies',
          'HELP'
        ]
      }
    });
    
  } catch (error) {
    console.error('Parser info error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get parser information'
    });
  }
}

// Test multiple parsing examples
async function testParsingExamples(req, res) {
  try {
    const examples = [
      'ALERT fire at Lahore Central Hospital HIGH priority contact 1122',
      'QUERY ambulance near Karachi University',
      'STATUS request-12345', 
      'HELP medical emergencies',
      'ALERT medical emergency at GPS:31.5497,74.3436 contact +92-321-1234567',
      'INVALID COMMAND with bad syntax'
    ];

    const results = examples.map(example => {
      const parseResult = emergencyParser.parse(example);
      return {
        input: example,
        success: parseResult.success,
        ast: parseResult.ast,
        tokens: parseResult.tokens?.length || 0,
        errors: parseResult.diagnostics?.totalErrors || 0,
        warnings: parseResult.diagnostics?.totalWarnings || 0,
        semantics: parseResult.success ? extractSemanticInfo(parseResult.ast) : null
      };
    });

    return res.json({
      success: true,
      testResults: results,
      statistics: emergencyParser.getStatistics(),
      summary: {
        totalTests: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });

  } catch (error) {
    console.error('Test parsing error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to run parsing tests'
    });
  }
}

// Helper: Extract semantic information from AST
function extractSemanticInfo(ast) {
  if (!ast || !ast.attributes) return null;

  const semantics = {
    commandType: ast.attributes.commandType || ast.commandType,
    extractedData: {}
  };

  // Extract command-specific semantics
  switch (semantics.commandType) {
    case 'ALERT':
      semantics.extractedData = {
        alertType: ast.attributes.alertType,
        location: ast.attributes.location,
        priority: ast.attributes.priority || 'MEDIUM',
        contact: ast.attributes.contact,
        requiresResponse: true,
        urgencyLevel: mapPriorityToUrgency(ast.attributes.priority)
      };
      break;
      
    case 'QUERY':
      semantics.extractedData = {
        serviceType: ast.attributes.serviceType,
        location: ast.attributes.location,
        searchRadius: determineSearchRadius(ast.attributes.location),
        requiresResponse: true
      };
      break;
      
    case 'STATUS':
      semantics.extractedData = {
        requestId: ast.attributes.requestId,
        requiresLookup: true
      };
      break;
      
    case 'HELP':
      semantics.extractedData = {
        topic: ast.attributes.topic || 'general',
        requiresInformation: true
      };
      break;
  }

  return semantics;
}

// Helper: Execute parsed emergency command
async function executeEmergencyCommand(ast) {
  const commandType = ast.attributes?.commandType || ast.commandType;
  
  switch (commandType) {
    case 'ALERT':
      return await processAlert(ast.attributes);
    case 'QUERY':
      return await processQuery(ast.attributes);
    case 'STATUS':
      return await processStatus(ast.attributes);
    case 'HELP':
      return await processHelp(ast.attributes);
    default:
      return { error: 'Unknown command type' };
  }
}

// Helper: Process alert command
async function processAlert(attributes) {
  const { alertType, location, priority, contact } = attributes;
  
  // Generate unique request ID
  const requestId = `EMG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    action: 'ALERT_CREATED',
    requestId: requestId,
    details: {
      type: alertType,
      location: location,
      priority: priority,
      contact: contact,
      status: 'DISPATCHING',
      estimatedResponse: mapPriorityToResponseTime(priority)
    },
    message: `Emergency alert created with ID ${requestId}. Response units being dispatched.`
  };
}

// Helper: Process query command  
async function processQuery(attributes) {
  const { serviceType, location } = attributes;
  
  // Convert location for search
  let searchLat, searchLon;
  if (location?.type === 'GPS') {
    searchLat = location.coordinates.latitude;
    searchLon = location.coordinates.longitude;
  } else {
    // Default to Lahore coordinates for named locations
    searchLat = 31.5204;
    searchLon = 74.3587;
  }
  
  // Map service type to amenity
  const amenityMap = {
    'HOSPITAL': 'hospital',
    'AMBULANCE': 'ambulance_station', 
    'POLICE': 'police',
    'FIRE_STATION': 'fire_station',
    'RESCUE': 'ambulance_station'
  };
  
  const amenity = amenityMap[serviceType] || 'hospital';
  
  try {
    const services = await searchNominatim(searchLat, searchLon, amenity);
    return {
      action: 'QUERY_EXECUTED',
      serviceType: serviceType,
      location: location,
      results: services.slice(0, 5), // Top 5 results
      message: `Found ${services.length} ${serviceType.toLowerCase()} services near ${location?.name || 'specified location'}`
    };
  } catch (error) {
    return {
      action: 'QUERY_FAILED',
      error: error.message,
      fallback: fallbackData.hospitals.slice(0, 3)
    };
  }
}

// Helper: Process status command
async function processStatus(attributes) {
  const { requestId } = attributes;
  
  // Simulate status lookup
  return {
    action: 'STATUS_RETRIEVED',
    requestId: requestId,
    status: 'IN_PROGRESS',
    details: {
      created: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      assignedUnit: 'UNIT-1122-A',
      estimatedArrival: '8-12 minutes'
    },
    message: `Request ${requestId} is in progress. Emergency unit dispatched.`
  };
}

// Helper: Process help command
async function processHelp(attributes) {
  const { topic } = attributes;
  
  const helpTopics = {
    'FIRE': 'Fire emergencies: Call 16 or 1122. Evacuate safely, don\'t use elevators.',
    'MEDICAL': 'Medical emergencies: Call 1122 for ambulance. Provide clear location.',
    'ACCIDENT': 'Accidents: Call 1122, secure area, don\'t move injured unless dangerous.',
    'POLICE': 'Police emergencies: Call 15. Provide location and nature of incident.',
    'general': 'Emergency numbers: Police (15), Fire (16), Medical (1122), Motorway (130)'
  };
  
  return {
    action: 'HELP_PROVIDED',
    topic: topic,
    information: helpTopics[topic?.toUpperCase()] || helpTopics['general'],
    emergencyNumbers: {
      'Police': '15',
      'Fire': '16', 
      'Medical/Rescue': '1122',
      'Motorway Police': '130'
    }
  };
}

// Helper functions
function mapPriorityToUrgency(priority) {
  const urgencyMap = {
    'CRITICAL': 10, 'URGENT': 8, 'HIGH': 6, 'MEDIUM': 4, 'LOW': 2
  };
  return urgencyMap[priority] || 4;
}

function mapPriorityToResponseTime(priority) {
  const responseMap = {
    'CRITICAL': '2-4 minutes', 'URGENT': '4-6 minutes', 'HIGH': '6-8 minutes', 
    'MEDIUM': '8-12 minutes', 'LOW': '12-20 minutes'
  };
  return responseMap[priority] || '8-12 minutes';
}

function determineSearchRadius(location) {
  if (location?.type === 'GPS') return 5000; // 5km for GPS
  return 25000; // 25km for named locations
}

function generateErrorSuggestions(diagnostics) {
  const suggestions = [];
  
  if (diagnostics.lexerErrors?.length > 0) {
    suggestions.push('Check for typos in command keywords (ALERT, QUERY, STATUS, HELP)');
  }
  
  if (diagnostics.parseErrors?.length > 0) {
    suggestions.push('Ensure proper command structure: COMMAND <type> <preposition> <location>');
    suggestions.push('Valid prepositions: AT, NEAR, IN');
  }
  
  if (diagnostics.semanticErrors?.length > 0) {
    suggestions.push('Verify location format (use GPS:lat,lng for coordinates)');
    suggestions.push('Check contact format (Pakistani phone: +92-xxx-xxxxxxx)');
  }
  
  return suggestions;
}

// Calculate distance between two points in kilometers
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * CONCURRENCY HELPER FUNCTIONS
 * ============================
 */

// Simulate concurrent emergency processing with race conditions
async function processEmergencyConcurrently(emergencyData) {
  // SHARED MEMORY MODEL - Race condition on counter
  const originalCounter = emergencyAlertCounter;
  
  // Simulate processing delay (race condition window)
  await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
  
  // Race condition: multiple requests can read same counter value
  emergencyAlertCounter = originalCounter + 1;
  
  // Track race condition if counter doesn't match expected sequence
  if (emergencyAlertCounter !== originalCounter + 1) {
    concurrencyStats.raceConditions++;
  }
  
  return `EMG-${emergencyAlertCounter}-${Date.now()}`;
}

// MESSAGE PASSING MODEL - Queue-based emergency processing
function enqueueEmergency(emergencyMessage) {
  if (emergencyQueue.length >= MAX_QUEUE_SIZE) {
    concurrencyStats.queueOverflows++;
    return { success: false, reason: 'Queue full' };
  }
  
  emergencyQueue.push({
    id: Date.now(),
    message: emergencyMessage,
    timestamp: new Date().toISOString()
  });
  
  return { success: true, queueSize: emergencyQueue.length };
}

function dequeueEmergency() {
  const emergency = emergencyQueue.shift();
  return emergency || null;
}

// Critical section with mutex simulation
async function safeParserAccess(command) {
  // Wait for parser lock
  while (parserLock) {
    concurrencyStats.lockContentions++;
    await new Promise(resolve => setTimeout(resolve, 1));
  }
  
  // Acquire lock
  parserLock = true;
  parserUsageCount++;
  
  try {
    // Critical section - parser usage
    const result = emergencyParser.parse(command);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 5));
    
    return result;
  } finally {
    // Release lock
    parserLock = false;
  }
}

// Track concurrent request statistics
function trackConcurrentRequest() {
  activeRequests++;
  concurrencyStats.totalRequests++;
  
  if (activeRequests > concurrencyStats.concurrentPeaks) {
    concurrencyStats.concurrentPeaks = activeRequests;
  }
  
  // Cleanup function
  return () => {
    activeRequests = Math.max(0, activeRequests - 1);
  };
}

// Get concurrency debugging info
function getConcurrencyStats() {
  return {
    ...concurrencyStats,
    currentActiveRequests: activeRequests,
    parserUsageCount: parserUsageCount,
    queueLength: emergencyQueue.length,
    emergencyAlertCounter: emergencyAlertCounter,
    timestamp: new Date().toISOString()
  };
}

// Demo concurrent processing (for testing)
async function testConcurrencyDemo(req, res) {
  const testCommands = [
    'ALERT fire at Lahore Hospital',
    'QUERY ambulance near Karachi',
    'STATUS request-12345',
    'HELP medical emergency'
  ];
  
  // Simulate concurrent requests
  const promises = testCommands.map(async (command, index) => {
    const cleanup = trackConcurrentRequest();
    
    try {
      // Race condition demo
      const emergencyId = await processEmergencyConcurrently({ command });
      
      // Message passing demo
      const queueResult = enqueueEmergency(command);
      
      // Safe parser access demo
      const parseResult = await safeParserAccess(command);
      
      return {
        requestId: index,
        command,
        emergencyId,
        queueResult,
        parseSuccess: parseResult.success,
        processingTime: Math.random() * 100
      };
    } finally {
      cleanup();
    }
  });
  
  const results = await Promise.all(promises);
  
  res.json({
    success: true,
    concurrencyDemo: {
      results,
      stats: getConcurrencyStats(),
      concepts: {
        'Shared Memory Model': 'emergencyAlertCounter - race condition prone',
        'Message Passing Model': 'emergencyQueue - safe communication',
        'Race Conditions': 'Counter increments can be lost with concurrent access',
        'Hard to Test/Debug': 'Non-deterministic behavior, timing-dependent bugs'
      }
    }
  });
}

module.exports = { 
  getNearby, 
  parseEmergencyCommand, 
  getParserInfo, 
  testParsingExamples,
  testConcurrencyDemo,
  getConcurrencyStats
};
