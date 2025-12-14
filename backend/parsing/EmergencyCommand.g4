/*
 * ANTLR4 Grammar for Emergency Command Language
 * ============================================
 * 
 * This grammar defines the formal syntax for emergency commands in the
 * RapidResQ system, supporting Pakistani emergency service context.
 * 
 * Software Construction Concepts Demonstrated:
 * - Parser Generators: ANTLR4 automatic parser generation
 * - Context-Free Grammar: Formal language specification
 * - Lexical Analysis: Token definition and recognition
 * - Syntactic Analysis: Hierarchical rule structure
 * - Error Recovery: Built-in ANTLR error handling
 * 
 * Grammar Coverage:
 * - Emergency alerts (fire, medical, accident, etc.)
 * - Service queries (ambulance, hospital, police)
 * - Status updates and tracking
 * - Pakistani locations and contact formats
 * - GPS coordinates and addresses
 */

grammar EmergencyCommand;

/*
 * PARSER RULES (Syntactic Structure)
 * =================================
 */

// Main entry point - complete emergency command
emergencyCommand
    : alertCommand EOF
    | queryCommand EOF
    | statusCommand EOF
    | helpCommand EOF
    ;

// ALERT command: "ALERT fire at Lahore Hospital HIGH priority contact 1122"
alertCommand
    : ALERT alertType (AT | NEAR | IN) location priority? contact?
    ;

// QUERY command: "QUERY ambulance near Karachi University"
queryCommand
    : QUERY serviceType (AT | NEAR | IN) location
    ;

// STATUS command: "STATUS request-12345"
statusCommand
    : STATUS requestId
    ;

// HELP command: "HELP" or "HELP fire emergencies"
helpCommand
    : HELP topic?
    ;

// Alert types - what kind of emergency
alertType
    : FIRE          // Fire emergency
    | MEDICAL       // Medical emergency
    | ACCIDENT      // Traffic/vehicle accident
    | FLOOD         // Flood/water emergency
    | EARTHQUAKE    // Seismic emergency
    | CRIME         // Security/crime emergency
    | DISASTER      // General disaster
    | WORD+         // Custom emergency description
    ;

// Service types for queries
serviceType
    : AMBULANCE     // Emergency medical services
    | HOSPITAL      // Medical facilities
    | POLICE        // Law enforcement
    | FIRE_STATION  // Fire department
    | RESCUE        // Rescue services
    ;

// Location specification
location
    : namedLocation     // Named place (Lahore, Karachi University)
    | gpsLocation       // GPS coordinates
    | address          // Street address
    ;

// Named locations (cities, landmarks, areas)
namedLocation
    : WORD+
    ;

// GPS coordinates: GPS:31.5497,74.3436
gpsLocation
    : GPS_COORDS
    ;

// Street addresses
address
    : (WORD | NUMBER)+ (STREET_TYPE)?
    ;

// Priority levels
priority
    : PRIORITY_MARKER priorityLevel
    ;

priorityLevel
    : HIGH | MEDIUM | LOW | URGENT | CRITICAL
    ;

// Contact information
contact
    : CONTACT_MARKER contactInfo
    ;

contactInfo
    : PHONE_NUMBER      // Pakistani phone numbers
    | EMAIL             // Email addresses
    | EMERGENCY_NUMBER  // Short emergency numbers (1122, 15, 16)
    ;

// Request ID for status tracking
requestId
    : REQUEST_ID
    ;

// Help topics
topic
    : alertType | serviceType | WORD
    ;

/*
 * LEXER RULES (Token Definitions)
 * ==============================
 */

// Command keywords
ALERT           : 'ALERT' | 'alert' | 'EMERGENCY' | 'emergency' ;
QUERY           : 'QUERY' | 'query' | 'FIND' | 'find' | 'SEARCH' | 'search' ;
STATUS          : 'STATUS' | 'status' | 'CHECK' | 'check' ;
HELP            : 'HELP' | 'help' | 'INFO' | 'info' ;

// Location prepositions
AT              : 'at' | 'AT' ;
NEAR            : 'near' | 'NEAR' | 'close to' | 'CLOSE TO' ;
IN              : 'in' | 'IN' | 'inside' | 'INSIDE' ;

// Alert types
FIRE            : 'fire' | 'FIRE' | 'burning' | 'BURNING' ;
MEDICAL         : 'medical' | 'MEDICAL' | 'health' | 'HEALTH' | 'injury' | 'INJURY' ;
ACCIDENT        : 'accident' | 'ACCIDENT' | 'crash' | 'CRASH' | 'collision' | 'COLLISION' ;
FLOOD           : 'flood' | 'FLOOD' | 'water' | 'WATER' | 'flooding' | 'FLOODING' ;
EARTHQUAKE      : 'earthquake' | 'EARTHQUAKE' | 'quake' | 'QUAKE' | 'seismic' | 'SEISMIC' ;
CRIME           : 'crime' | 'CRIME' | 'theft' | 'THEFT' | 'robbery' | 'ROBBERY' | 'security' | 'SECURITY' ;
DISASTER        : 'disaster' | 'DISASTER' | 'emergency' | 'EMERGENCY' ;

// Service types
AMBULANCE       : 'ambulance' | 'AMBULANCE' | 'ems' | 'EMS' ;
HOSPITAL        : 'hospital' | 'HOSPITAL' | 'clinic' | 'CLINIC' | 'medical center' | 'MEDICAL CENTER' ;
POLICE          : 'police' | 'POLICE' | 'law enforcement' | 'LAW ENFORCEMENT' ;
FIRE_STATION    : 'fire station' | 'FIRE STATION' | 'fire department' | 'FIRE DEPARTMENT' ;
RESCUE          : 'rescue' | 'RESCUE' | 'rescue services' | 'RESCUE SERVICES' ;

// Priority levels
PRIORITY_MARKER : 'priority' | 'PRIORITY' | 'level' | 'LEVEL' ;
HIGH            : 'HIGH' | 'high' ;
MEDIUM          : 'MEDIUM' | 'medium' | 'MODERATE' | 'moderate' ;
LOW             : 'LOW' | 'low' ;
URGENT          : 'URGENT' | 'urgent' | 'ASAP' | 'asap' ;
CRITICAL        : 'CRITICAL' | 'critical' | 'SEVERE' | 'severe' ;

// Contact markers
CONTACT_MARKER  : 'contact' | 'CONTACT' | 'call' | 'CALL' | 'phone' | 'PHONE' ;

// Complex token patterns
GPS_COORDS      : 'GPS:' [0-9]+ '.' [0-9]+ ',' [0-9]+ '.' [0-9]+ ;

// Pakistani phone number formats
PHONE_NUMBER    : ('+92' | '0092' | '0') [0-9] [0-9] [0-9] '-' [0-9] [0-9] [0-9] [0-9] [0-9] [0-9] [0-9]
                | '+92-' [0-9] [0-9] [0-9] '-' [0-9] [0-9] [0-9] [0-9] [0-9] [0-9] [0-9]
                ;

// Email addresses
EMAIL           : [a-zA-Z0-9._-]+ '@' [a-zA-Z0-9.-]+ '.' [a-zA-Z]+ ;

// Emergency numbers (1122, 15, 16, 130, etc.)
EMERGENCY_NUMBER : '1122' | '15' | '16' | '130' | '1915' | '911' ;

// Request ID patterns: request-12345, EMG-2024-001, alert-karachi-456
REQUEST_ID      : [a-zA-Z]+ '-' [a-zA-Z0-9]+ ('-' [a-zA-Z0-9]+)? ;

// Street types for addresses
STREET_TYPE     : 'Street' | 'STREET' | 'Road' | 'ROAD' | 'Lane' | 'LANE' 
                | 'Avenue' | 'AVENUE' | 'Block' | 'BLOCK' | 'Sector' | 'SECTOR' ;

// Numbers (for addresses, distances, etc.)
NUMBER          : [0-9]+ ;

// Generic words (for locations, descriptions)
WORD            : [a-zA-Z]+ ;

// Whitespace (ignored)
WS              : [ \t\r\n]+ -> skip ;

// Comments (ignored)
COMMENT         : '//' ~[\r\n]* -> skip ;

/*
 * GRAMMAR FEATURES DEMONSTRATED:
 * =============================
 * 
 * 1. PARSER GENERATORS:
 *    - Automatic parser generation from grammar specification
 *    - Lexer and parser class generation for JavaScript
 *    - Built-in error recovery and reporting mechanisms
 * 
 * 2. CONTEXT-FREE GRAMMAR:
 *    - Hierarchical rule structure (emergencyCommand -> alertCommand -> alertType)
 *    - Terminal and non-terminal symbols clearly defined
 *    - Optional elements (priority?, contact?) and repetition (WORD+)
 *    - Alternative productions using | operator
 * 
 * 3. LEXICAL ANALYSIS:
 *    - Token classification (keywords, identifiers, literals)
 *    - Regular expression patterns for complex tokens
 *    - Case-insensitive matching for user flexibility
 *    - Pakistani-specific formats (phone numbers, emergency codes)
 * 
 * 4. SYNTACTIC ANALYSIS:
 *    - Parse tree construction following grammar rules
 *    - Left-to-right parsing with lookahead
 *    - Precedence and associativity handling
 *    - Error detection at syntax level
 * 
 * 5. PAKISTANI EMERGENCY CONTEXT:
 *    - Local emergency numbers (1122, 15, 16, 130)
 *    - Pakistani phone number formats (+92-, 0-, etc.)
 *    - Common Pakistani locations and address formats
 *    - Emergency service types relevant to Pakistan
 * 
 * 6. EXTENSIBILITY:
 *    - Easy to add new command types
 *    - Flexible location specification
 *    - Support for custom emergency descriptions
 *    - Modular grammar structure for maintenance
 */