#!/bin/bash

# ANTLR Setup Script for Team Members
# Run this script to download required ANTLR tool

echo "🔧 Setting up ANTLR for RapidResQ Project"
echo "========================================"

ANTLR_VERSION="4.9.3"
ANTLR_JAR="antlr-${ANTLR_VERSION}-complete.jar"
PARSING_DIR="backend/parsing"

# Check if we're in the right directory
if [ ! -d "$PARSING_DIR" ]; then
    echo "Error: Run this script from the project root directory"
    echo "   Expected directory: $PARSING_DIR"
    exit 1
fi

# Check if ANTLR jar already exists
if [ -f "$PARSING_DIR/$ANTLR_JAR" ]; then
    echo "ANTLR $ANTLR_VERSION already exists!"
    echo "Location: $PARSING_DIR/$ANTLR_JAR"
else
    echo "Downloading ANTLR $ANTLR_VERSION..."
    
    # Try wget first, then curl
    if command -v wget > /dev/null; then
        wget -O "$PARSING_DIR/$ANTLR_JAR" "https://www.antlr.org/download/$ANTLR_JAR"
    elif command -v curl > /dev/null; then
        curl -L -o "$PARSING_DIR/$ANTLR_JAR" "https://www.antlr.org/download/$ANTLR_JAR"
    else
        echo "Error: Please install wget or curl to download ANTLR"
        echo "   Or download manually from: https://www.antlr.org/download.html"
        echo "   Save as: $PARSING_DIR/$ANTLR_JAR"
        exit 1
    fi
    
    if [ -f "$PARSING_DIR/$ANTLR_JAR" ]; then
        echo "ANTLR $ANTLR_VERSION downloaded successfully!"
    else
        echo "Download failed. Please download manually:"
        echo "   URL: https://www.antlr.org/download/$ANTLR_JAR"
        echo "   Save to: $PARSING_DIR/$ANTLR_JAR"
        exit 1
    fi
fi

echo ""
echo "🔨 Generating JavaScript parser files from grammar..."
cd $PARSING_DIR

# Check if Java is available
if ! command -v java > /dev/null; then
    echo "Error: Java is required to run ANTLR"
    echo "   Please install Java and try again"
    exit 1
fi

# Generate JavaScript parser files
echo "   Running: java -cp $ANTLR_JAR org.antlr.v4.Tool -Dlanguage=JavaScript -visitor EmergencyCommand.g4"
java -cp $ANTLR_JAR org.antlr.v4.Tool -Dlanguage=JavaScript -visitor EmergencyCommand.g4

# Check if generation was successful
if [ -f "EmergencyCommandLexer.js" ] && [ -f "EmergencyCommandParser.js" ]; then
    echo "Successfully generated:"
    echo "   - EmergencyCommandLexer.js"
    echo "   - EmergencyCommandParser.js" 
    echo "   - EmergencyCommandVisitor.js"
else
    echo "ANTLR generation failed"
    exit 1
fi

cd ../..
echo ""
echo "Testing ANTLR setup..."
cd backend && npm run test-parsing

echo ""
echo "Setup complete! ANTLR parsing is ready to use."
echo "   Grammar: EmergencyCommand.g4"
echo "   Generated: EmergencyCommandLexer.js, EmergencyCommandParser.js, EmergencyCommandVisitor.js"
echo "   Implementation: EmergencyCommandANTLRParser.js"