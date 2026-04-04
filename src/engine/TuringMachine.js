import { validateTransitionFunction } from './validator.js';
import { ConfigHistory } from './ConfigHistory.js';

export class TuringMachine {
  constructor(config = {}) {
    this.states = new Set(config.states || []);
    this.inputAlphabet = new Set(config.inputAlphabet || []);
    this.tapeAlphabet = new Set(config.tapeAlphabet || ['B']);
    
    // delta is a Map with string keys 'state,symbol' -> [nextState, writeSymbol, direction]
    this.delta = config.delta || new Map();
    
    this.startState = config.startState || null;
    this.acceptState = config.acceptState || null;
    this.rejectState = config.rejectState || null;

    // Simulation state
    this.tape = new Map(); // Index -> symbol
    this.head = 0;
    this.currentState = this.startState;
    this.stepCount = 0;
    this.history = new ConfigHistory();
    this.status = 'idle'; // idle, running, accepted, rejected, looping

    this.MAX_STEPS = 10000; // Halting guard

    // Validate transition function on construction
    if (this.delta.size > 0) {
      const validation = validateTransitionFunction(
        this.states, this.inputAlphabet, this.tapeAlphabet, this.delta
      );
      if (!validation.isValid) {
        console.warn('[TuringMachine] Validation warnings:', validation.errors);
      }
    }
  }

  // Load a string onto the tape starting at index 0 and reset the machine
  reset(inputString = "") {
    this.tape.clear();
    this.head = 0;
    this.currentState = this.startState;
    this.stepCount = 0;
    this.history.clear();
    this.status = 'running';

    for (let i = 0; i < inputString.length; i++) {
        const symbol = inputString[i];
        if (!this.inputAlphabet.has(symbol)) {
            throw new Error(`Symbol '${symbol}' is not in the input alphabet.`);
        }
        this.tape.set(i, symbol);
    }
    
    // Save initial configuration
    this.history.push(this.getConfig());
  }

  // Read current symbol from tape
  readSymbol() {
    return this.tape.has(this.head) ? this.tape.get(this.head) : 'B';
  }

  // Write symbol to tape
  writeSymbol(symbol) {
    if (symbol === 'B') {
        this.tape.delete(this.head); // Cleanup blank symbols to keep map sparse
    } else {
        this.tape.set(this.head, symbol);
    }
  }

  // Move head
  moveHead(direction) {
    if (direction === 'R') {
      this.head += 1;
    } else if (direction === 'L') {
      this.head -= 1;
    }
  }

  // Execute one step of computation
  step() {
    if (this.status !== 'running' && this.status !== 'idle') {
        return this.getConfig(); // Already halted
    }

    if (this.status === 'idle') {
        this.status = 'running';
    }

    // Halting state checks before transition
    if (this.currentState === this.acceptState) {
        this.status = 'accepted';
        this.history.push(this.getConfig());
        return this.getConfig();
    }
    
    if (this.currentState === this.rejectState) {
        this.status = 'rejected';
        this.history.push(this.getConfig());
        return this.getConfig();
    }

    if (this.stepCount >= this.MAX_STEPS) {
        this.status = 'looping';
        this.history.push(this.getConfig());
        return this.getConfig();
    }

    const currentSymbol = this.readSymbol();
    const transitionKey = `${this.currentState},${currentSymbol}`;

    // Has transition?
    if (!this.delta.has(transitionKey)) {
        // Implicit reject - no transition defined
        this.status = 'rejected';
        this.history.push(this.getConfig());
        return this.getConfig();
    }

    const [nextState, writeSymbol, direction] = this.delta.get(transitionKey);

    // Apply transition
    this.currentState = nextState;
    this.writeSymbol(writeSymbol);
    this.moveHead(direction);
    this.stepCount += 1;

    // Check post-transition halt states to display them immediately
    if (this.currentState === this.acceptState) {
        this.status = 'accepted';
    } else if (this.currentState === this.rejectState) {
        this.status = 'rejected';
    } else if (this.stepCount >= this.MAX_STEPS) {
        this.status = 'looping';
    }

    const config = this.getConfig();
    this.history.push(config);
    return config;
  }

  // Run automatically until halting or max steps
  run(maxSteps = this.MAX_STEPS) {
    let internalSteps = 0;
    while (this.status === 'running' || this.status === 'idle') {
      if (internalSteps >= maxSteps) break;
      this.step();
      internalSteps++;
    }
    return this.getConfig();
  }

  // Formats ID as requested: { step, state, head, tape, left, right, status }
  getConfig() {
    // Determine the active tape region (min bounding box around head and non-blank symbols)
    let keys = Array.from(this.tape.keys());
    if (keys.length === 0) keys = [0]; // Tape is completely blank

    let minIndex = Math.min(...keys, this.head);
    let maxIndex = Math.max(...keys, this.head);

    // Stringify left α and right β around state q exactly for ID console trace
    let leftSide = '';
    for (let i = minIndex; i < this.head; i++) {
        leftSide += this.tape.has(i) ? this.tape.get(i) : 'B';
    }

    let rightSide = '';
    for (let i = this.head; i <= maxIndex; i++) {
        rightSide += this.tape.has(i) ? this.tape.get(i) : 'B';
    }

    return {
        step: this.stepCount,
        state: this.currentState,
        head: this.head,
        tape: new Map(this.tape),
        left: leftSide,
        right: rightSide,
        status: this.status
    };
  }

  // Validate the current machine configuration
  validate() {
     return validateTransitionFunction(
       this.states,
       this.inputAlphabet,
       this.tapeAlphabet,
       this.delta
     );
  }
}
