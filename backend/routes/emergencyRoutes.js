const express = require('express');
const router = express.Router();
const { 
  getNearby, 
  parseEmergencyCommand, 
  getParserInfo, 
  testParsingExamples,
  testConcurrencyDemo,
  getConcurrencyStats
} = require('../controllers/emergencyController');

// Nearby hospitals and emergency services
router.get('/nearby', getNearby);

// ANTLR Parsing Endpoints - Software Construction Concepts
router.post('/parse', parseEmergencyCommand);        // Parse emergency commands
router.get('/parser-info', getParserInfo);           // Grammar and parser statistics  
router.get('/parser-test', testParsingExamples);     // Test parsing with examples

// Concurrency Demonstration Endpoints - Software Construction Concepts  
router.get('/concurrency-demo', testConcurrencyDemo);  // Demonstrate concurrent processing
router.get('/concurrency-stats', (req, res) => {       // Get concurrency statistics
  res.json({ success: true, stats: getConcurrencyStats() });
});

module.exports = router;
