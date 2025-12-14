NATIONAL UNIVERSITY OF SCIENCES AND TECHNOLOGY
School of Electrical Engineering and Computer Sciences

SE-314: Software Construction
BESE-14B

Assignment # 02:

SUBMITTED TO:
Dr. Sidra Sultana

SUBMITTED BY:
Kiran Waqar
470611
Shamaiem Shabbir
460642
Maryam Sheraz
466050

10) Concurrency (Two models for Concurrent Programming, Race Condition, Concurrency is hard to Test and Debug)

**(General)** What are the two main models for concurrent programming, and how do they differ in terms of communication and synchronization between concurrent processes?

**(Case-specific)** In RapidResQ's emergency system, multiple users might simultaneously request ambulance services or report emergencies. How would you implement concurrent processing to handle multiple emergency alerts while avoiding race conditions on shared resources like emergency ID counters and parser instances?

**(General)** What are race conditions in concurrent programming, and why are they particularly dangerous in critical systems? Provide an example of how a race condition could lead to incorrect program behavior.

**(Case-specific)** RapidResQ's emergency alert system uses a global counter to generate unique emergency IDs (`EMG-${counter}-${timestamp}`). If multiple emergency alerts arrive simultaneously, how could race conditions cause duplicate or skipped emergency IDs, and what would be the consequences in a real emergency response scenario?

**(General)** Why is concurrent programming particularly difficult to test and debug compared to sequential programming? What strategies can developers use to identify and reproduce concurrency issues?

## ANSWERS:

### 1. **(General)** Two Main Models for Concurrent Programming

**The two primary models for concurrent programming are:**

**Shared Memory Model:**
- **Communication**: Concurrent processes communicate by reading and writing shared variables/data structures
- **Synchronization**: Uses locks, semaphores, monitors, or other synchronization primitives
- **Example**: Multiple threads accessing a shared counter variable
- **Advantages**: Direct data sharing, efficient communication
- **Disadvantages**: Race conditions, deadlocks, complex synchronization

**Message Passing Model:**
- **Communication**: Processes communicate by sending and receiving messages through channels or queues
- **Synchronization**: Implicit synchronization through message ordering and delivery
- **Example**: Actor model, Go channels, MPI (Message Passing Interface)
- **Advantages**: No shared state, easier to reason about, safer from race conditions
- **Disadvantages**: Message overhead, potential for deadlock through blocking operations

**Key Differences:**
```
Aspect              | Shared Memory        | Message Passing
--------------------|---------------------|------------------
Data Access         | Direct via variables| Through messages
Synchronization     | Explicit (locks)    | Implicit (channels)
Memory Management   | Shared heap         | Private memory spaces
Debugging           | Race conditions     | Message ordering issues
Scalability         | Limited by memory   | Better distributed scaling
```

### 2. **(Case-specific)** RapidResQ Concurrent Emergency Processing

**Implementation for Handling Multiple Emergency Alerts:**

**Shared Memory Model Implementation:**
```javascript
// Global shared resources (race condition prone)
let emergencyAlertCounter = 0;
let activeRequests = 0;
const emergencyLocks = new Map(); // Per-location locks

// Mutex simulation for critical sections
let parserLock = false;

// Thread-safe parser access
async function safeParserAccess(command) {
  // Wait for parser lock
  while (parserLock) {
    await new Promise(resolve => setTimeout(resolve, 1));
  }
  
  // Acquire lock
  parserLock = true;
  
  try {
    // Critical section - parser usage
    const result = emergencyParser.parse(command);
    return result;
  } finally {
    // Release lock
    parserLock = false;
  }
}

// Race condition prone counter increment
async function processEmergencyConcurrently(emergencyData) {
  const originalCounter = emergencyAlertCounter;
  
  // Simulate processing delay (race condition window)
  await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
  
  // Race condition: multiple requests can read same counter value
  emergencyAlertCounter = originalCounter + 1;
  
  return `EMG-${emergencyAlertCounter}-${Date.now()}`;
}
```

**Message Passing Model Implementation:**
```javascript
// Emergency processing queue (safer communication)
const emergencyQueue = [];
const MAX_QUEUE_SIZE = 100;

// Queue-based emergency processing (no shared state)
function enqueueEmergency(emergencyMessage) {
  if (emergencyQueue.length >= MAX_QUEUE_SIZE) {
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
```

**Concurrent Request Tracking:**
```javascript
function trackConcurrentRequest() {
  activeRequests++;
  
  // Cleanup function to decrement counter
  return () => {
    activeRequests = Math.max(0, activeRequests - 1);
  };
}

// Usage in emergency endpoints
async function parseEmergencyCommand(req, res) {
  const cleanup = trackConcurrentRequest();
  
  try {
    // Safe parser access to avoid conflicts
    const parseResult = await safeParserAccess(command);
    
    // Generate emergency ID (potential race condition)
    const emergencyId = await processEmergencyConcurrently({ command });
    
    // Add to message queue for processing
    const queueResult = enqueueEmergency(command);
    
    return res.json({ parseResult, emergencyId, queueResult });
  } finally {
    cleanup();
  }
}
```

### 3. **(General)** Race Conditions in Concurrent Programming

**Definition:**
A race condition occurs when the correctness of a program depends on the relative timing of concurrent operations. Multiple processes/threads access shared resources simultaneously, and the final result depends on which process "wins the race."

**Why Race Conditions are Dangerous:**
- **Non-deterministic behavior**: Same input can produce different outputs
- **Data corruption**: Inconsistent state due to partial updates
- **Lost updates**: One process overwrites another's changes
- **Critical system failures**: Especially dangerous in safety-critical applications

**Example - Bank Account Transfer:**
```javascript
// DANGEROUS: Race condition in money transfer
let accountA = 1000;
let accountB = 500;

async function transfer(from, to, amount) {
  // Race condition window here
  let fromBalance = from;           // Read operation
  let toBalance = to;               // Read operation
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 10));
  
  from = fromBalance - amount;      // Write operation
  to = toBalance + amount;          // Write operation
}

// Two simultaneous transfers
transfer(accountA, accountB, 200);  // Transfer 1
transfer(accountA, accountB, 300);  // Transfer 2

// Expected: accountA = 500, accountB = 1000
// Actual result: UNPREDICTABLE due to race condition
// Could be: accountA = 700, accountB = 800 (lost update)
```

**Race Condition Consequences:**
- **Lost updates**: Only the last write survives
- **Dirty reads**: Reading partially updated data
- **Inconsistent state**: System state violates business rules

### 4. **(Case-specific)** RapidResQ Emergency ID Race Condition

**Race Condition in Emergency ID Generation:**

```javascript
// PROBLEMATIC CODE - Race condition prone
let emergencyAlertCounter = 0;

async function generateEmergencyId() {
  // Step 1: Read current counter
  const currentCounter = emergencyAlertCounter;
  
  // Step 2: Processing delay (race condition window)
  await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
  
  // Step 3: Increment and write back
  emergencyAlertCounter = currentCounter + 1;
  
  // Step 4: Generate ID
  return `EMG-${emergencyAlertCounter}-${Date.now()}`;
}
```

**Race Condition Scenario:**
```
Time | Request A          | Request B          | Counter Value
-----|--------------------|--------------------|-------------
T1   | Read counter (0)   |                    | 0
T2   |                    | Read counter (0)   | 0
T3   | counter = 0 + 1    |                    | 1
T4   |                    | counter = 0 + 1    | 1 (LOST UPDATE!)
T5   | Return EMG-1-...   | Return EMG-1-...   | 1
```

**Consequences in Emergency Response:**

**1. Duplicate Emergency IDs:**
- Two different emergencies get same ID (`EMG-1-timestamp`)
- Dispatch system cannot differentiate between emergencies
- Emergency responders might be sent to wrong location

**2. Skipped Emergency IDs:**
- Counter jumps from 1 to 3, missing 2
- Audit trail shows gaps in emergency sequence
- Compliance issues with emergency response protocols

**3. Database Conflicts:**
- Primary key violations if emergency ID is used as database key
- Emergency records could be overwritten
- Critical emergency data lost

**4. Real-world Impact:**
```javascript
// Emergency A: House fire in Lahore
// Emergency B: Medical emergency in Karachi
// Both get ID: EMG-1-1703123456789

// Result: 
// - Ambulance dispatched to fire location
// - Fire truck sent to medical emergency  
// - Response time increased, lives at risk
```

**Solution - Atomic Counter Operations:**
```javascript
// SAFE VERSION - Atomic increment
const crypto = require('crypto');

function generateSafeEmergencyId() {
  // Use atomic UUID generation instead of counter
  const uuid = crypto.randomUUID();
  const timestamp = Date.now();
  return `EMG-${uuid.slice(0, 8)}-${timestamp}`;
}

// Or use database auto-increment for guaranteed uniqueness
```

### 5. **(General)** Why Concurrency is Hard to Test and Debug

**Challenges in Concurrent Programming:**

**1. Non-deterministic Behavior:**
- Same input can produce different outputs on each run
- Bugs may not appear consistently
- "Heisenbugs" - bugs that disappear when you try to observe them

**2. Timing Dependencies:**
- Race conditions depend on exact timing of operations
- Debug output can change timing and hide bugs
- Production vs. development environment differences

**3. Complex State Spaces:**
- Exponential number of possible execution interleavings
- Traditional testing covers only small subset of possibilities
- Edge cases are rare but catastrophic

**4. Debugging Difficulties:**
```javascript
// Adding debug output changes timing!
async function problematicFunction() {
  let value = sharedVariable;
  
  // This debug line changes the race condition timing
  console.log("Debug: value =", value); 
  
  await someAsyncOperation();
  sharedVariable = value + 1;
}
```

**Testing and Debugging Strategies:**

**1. Stress Testing:**
```javascript
// Test with high concurrency to expose race conditions
async function stressTesting() {
  const promises = [];
  
  // Launch 1000 concurrent operations
  for (let i = 0; i < 1000; i++) {
    promises.push(generateEmergencyId());
  }
  
  const results = await Promise.all(promises);
  
  // Check for duplicates
  const uniqueIds = new Set(results);
  if (uniqueIds.size !== results.length) {
    console.log("RACE CONDITION DETECTED: Duplicate IDs found");
  }
}
```

**2. Deterministic Testing:**
```javascript
// Control timing to reproduce race conditions
class MockTimer {
  constructor() {
    this.time = 0;
  }
  
  async delay(ms) {
    this.time += ms;
    // Controlled delay for deterministic testing
  }
}
```

**3. Concurrency Statistics Monitoring:**
```javascript
const concurrencyStats = {
  totalRequests: 0,
  concurrentPeaks: 0,
  raceConditions: 0,
  lockContentions: 0
};

function trackConcurrencyIssues() {
  return {
    ...concurrencyStats,
    timestamp: new Date().toISOString()
  };
}
```

**4. Formal Verification Tools:**
- Model checkers (TLA+, SPIN)
- Static analysis tools
- Property-based testing
- Bounded model checking

**5. Best Practices:**
- **Minimize shared state**: Prefer message passing
- **Use immutable data structures**: Prevent accidental mutations  
- **Atomic operations**: Use database constraints, atomic primitives
- **Timeouts and deadlock detection**: Prevent infinite waits
- **Comprehensive logging**: Track concurrent operations without changing timing

This implementation demonstrates all three concurrency concepts in the context of RapidResQ's emergency response system, showing both the theoretical principles and practical challenges of concurrent programming in critical systems.