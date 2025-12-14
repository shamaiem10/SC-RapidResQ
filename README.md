# RapidResq

Steps to run the RapidResq MERN project locally:

---

## 1. Clone the repository

```bash
git clone https://github.com/shamaiem10/RapidResq.git
cd RapidResq
```
## 2. Install dependencies
- Backend (Node/Express)
```bash
cd backend
npm install
```
- Frontend (React)
```bash
cd ../frontend
npm install
```

## 3. Setup environment variables

Create a .env file in the backend folder:

```bash
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret
```
## 4. Setup ANTLR Parser (Required for Development)

**Automatic Setup (Recommended):**
```bash
# Run setup script (downloads ANTLR + generates parser files)
./setup-antlr.sh
```

**Manual Setup:**
```bash
# 1. Download ANTLR 4.9.3
cd backend/parsing
wget https://www.antlr.org/download/antlr-4.9.3-complete.jar

# 2. Generate JavaScript parser files from grammar

- Bash / macOS (single line or with backslash continuation):

```bash
java -cp antlr-4.9.3-complete.jar org.antlr.v4.Tool \
  -Dlanguage=JavaScript -visitor EmergencyCommand.g4
```

- Windows PowerShell (recommended on Windows):

```powershell
# Single-line (recommended)
java -jar .\antlr-4.9.3-complete.jar -Dlanguage=JavaScript -visitor EmergencyCommand.g4

# Or multiline with PowerShell backtick ` continuation
java -jar .\antlr-4.9.3-complete.jar `
  -Dlanguage=JavaScript `
  -visitor EmergencyCommand.g4
```

Note: PowerShell does not accept Bash-style `\` line continuations; use the backtick `` ` `` or run the command on one line. Also `java -jar ...` avoids classpath differences on Windows.
```

**Note:** Generated parser files are excluded from git - they're created fresh from the grammar file.

## 5. Test ANTLR Parsing Implementation (IMPORTANT!)

**Before running the full application, verify the ANTLR parsing is working:**

```bash
cd backend
node test-parsing.js
```

**Expected Output:**
- ✅ Success rate should be 70%+ 
- 🎯 All ANTLR concepts demonstrated
- 📊 Parser statistics displayed

**Manual Testing (Alternative):**
```bash
cd backend
node -e "
const { EmergencyCommandANTLRParser } = require('./parsing/EmergencyCommandANTLRParser');
const parser = new EmergencyCommandANTLRParser();
console.log(parser.parse('ALERT fire at Lahore Hospital'));
"
```

## 6. Run the Full Project

- **Start Backend Server:**
```bash
cd backend
npm run dev   # or npm start
```

- **Start React Frontend:**
```bash
cd ../frontend
npm start
```

## 7. ANTLR Parsing Endpoints

Once the backend is running, test parsing via API:

```bash
# Test parsing endpoint
curl -X POST http://localhost:5000/api/emergency/parse \
  -H "Content-Type: application/json" \
  -d '{"command": "ALERT fire at Lahore Hospital"}'

# Test emergency commands
curl -X POST http://localhost:5000/api/emergency/command \
  -H "Content-Type: application/json" \
  -d '{"command": "QUERY ambulance near Karachi University"}'
```
