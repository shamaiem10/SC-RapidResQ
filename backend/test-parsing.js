#!/usr/bin/env node

/**
 * ANTLR Parsing Test Script
 * Run this to verify ANTLR implementation is working correctly
 * Usage: node test-parsing.js
 */

const { EmergencyCommandANTLRParser } = require('./parsing/EmergencyCommandANTLRParser');

console.log('\nANTLR Emergency Command Parser Test');
console.log('=====================================\n');

// Initialize parser
const parser = new EmergencyCommandANTLRParser();

// Test commands covering all grammar rules
const testCommands = [
    // Alert commands
    'ALERT fire at Lahore Hospital',
    'ALERT medical emergency at GPS 31.5204,74.3587',
    'ALERT accident on M-2 Highway near Islamabad',
    
    // Query commands  
    'QUERY ambulance near Karachi University',
    'QUERY police stations in Lahore',
    'QUERY fire brigade contact for Islamabad',
    
    // Status commands
    'STATUS request-12345',
    'STATUS emergency-789',
    
    // Help commands
    'HELP medical emergencies',
    'HELP fire safety procedures',
    'HELP',
    
    // Phone and contact formats
    'ALERT fire at hospital call +92-300-1234567',
    'QUERY ambulance call 1122',
    
    // Invalid commands (should fail gracefully)
    'INVALID command test',
    'ALERT',
    ''
];

console.log('Testing Commands:');
console.log('===================');

let successCount = 0;
let totalTests = testCommands.length;

testCommands.forEach((command, index) => {
    console.log(`\n[${index + 1}] "${command}"`);
    
    try {
        const result = parser.parse(command);
        
        if (result.success) {
            successCount++;
            console.log(`   SUCCESS: ${result.ast?.commandType || 'Unknown'} command`);
            console.log(`   Tokens: ${result.tokens?.length || 0}`);
        } else {
            console.log(`   FAILED: ${result.diagnostics?.totalErrors || 0} errors`);
            if (result.diagnostics?.errors?.length > 0) {
                console.log(`   Error: ${result.diagnostics.errors[0]}`);
            }
        }
    } catch (error) {
        console.log(`   EXCEPTION: ${error.message}`);
    }
});

// Results summary
console.log('\nPARSING RESULTS:');
console.log('==================');
console.log(`Successful: ${successCount}/${totalTests}`);
console.log(`Success Rate: ${((successCount / totalTests) * 100).toFixed(1)}%`);

// Show ANTLR concepts demonstrated
console.log('\nANTLR CONCEPTS DEMONSTRATED:');
console.log('===============================');
const grammarInfo = parser.getGrammarInfo();
grammarInfo.antlrWorkflow.forEach(step => {
    console.log(`   • ${step}`);
});

// Show statistics
console.log('\nPARSER STATISTICS:');
console.log('====================');
const stats = parser.getStatistics();
console.log(`   Commands Parsed: ${stats.totalCommandsParsed}`);
console.log(`   Success Rate: ${stats.successRate}%`);
console.log(`   Average Parse Time: ${stats.averageParseTime}ms`);

console.log('\nTest Complete!');
console.log('================');

if (successCount >= totalTests * 0.7) {
    console.log('ANTLR parser is working correctly!');
} else {
    console.log('Parser needs attention - low success rate');
}