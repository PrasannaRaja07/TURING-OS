import { ConfigHistory } from './ConfigHistory.js';

export class UniversalTM {
  constructor(tmConfig) {
    this.innerTmConfig = tmConfig;
    
    // Create unary maps
    this.stateToUnary = new Map();
    this.symbolToUnary = new Map();
    
    // Assign unary IDs
    let id = 1;
    for (const state of tmConfig.states) {
      this.stateToUnary.set(state, '0'.repeat(id++));
    }
    
    id = 1;
    for (const symbol of tmConfig.tapeAlphabet) {
      this.symbolToUnary.set(symbol, '0'.repeat(id++));
    }
    
    this.dirToUnary = { 'L': '0', 'R': '00' };

    // Build encoded rule tape
    this.utmTape = new Map();
    let tapeIndex = 0;
    
    // Write rules separated by '11'
    for (const [key, value] of tmConfig.delta.entries()) {
      const [q_in, sym_in] = key.split(',');
      const [q_next, sym_write, dir] = value;
      
      const quintuple = [
        this.stateToUnary.get(q_in),
        this.symbolToUnary.get(sym_in),
        this.stateToUnary.get(q_next),
        this.symbolToUnary.get(sym_write),
        this.dirToUnary[dir]
      ].join('1');
      
      for (const char of quintuple) {
        this.utmTape.set(tapeIndex++, char);
      }
      this.utmTape.set(tapeIndex++, '1');
      this.utmTape.set(tapeIndex++, '1');
    }

    this.rulesEndIndex = tapeIndex;
    
    // Setup Virtual TM environment
    this.virtualTape = new Map();
    this.utmHead = 0;
    this.virtualHead = 0;
    this.virtualState = tmConfig.startState;
    this.stepCount = 0;
    this.status = 'idle';
    this.history = new ConfigHistory();
    this.MAX_STEPS = 10000;

    // UTM Internal Micro-State Machine
    this.microState = 'INIT'; // INIT, SCAN_FOR_RULE, APPLY_RULE, EXEC_VIRTUAL
    this.currentScanTarget = '';
    this.scanIndex = 0;
  }

  reset(inputString = "") {
    this.virtualTape.clear();
    for (let i = 0; i < inputString.length; i++) {
        this.virtualTape.set(i, inputString[i]);
    }
    this.virtualHead = 0;
    this.virtualState = this.innerTmConfig.startState;
    this.utmHead = 0;
    this.stepCount = 0;
    this.status = 'running';
    this.microState = 'INIT';
    this.history.clear();
    this.history.push(this.getConfig());
  }

  // Micro-step the UTM. Returns true if virtual machine made 1 full transition.
  step() {
    if (this.status !== 'running' && this.status !== 'idle') return this.getConfig();
    if (this.status === 'idle') this.status = 'running';

    if (this.virtualState === this.innerTmConfig.acceptState) {
        this.status = 'accepted';
        this.history.push(this.getConfig());
        return this.getConfig();
    }
    if (this.virtualState === this.innerTmConfig.rejectState) {
        this.status = 'rejected';
        this.history.push(this.getConfig());
        return this.getConfig();
    }
    if (this.stepCount >= this.MAX_STEPS) {
        this.status = 'looping';
        this.history.push(this.getConfig());
        return this.getConfig();
    }

    // MICRO STATE LOGIC for visual simulation:
    // This allows the user to see the UTM head physically scanning the rules.
    const currentSymbol = this.virtualTape.has(this.virtualHead) ? this.virtualTape.get(this.virtualHead) : 'B';
    const transitionKey = `${this.virtualState},${currentSymbol}`;
    
    if (this.microState === 'INIT') {
       // UTM moves head to start of encoded rules
       if (this.utmHead > 0) this.utmHead--;
       else {
           this.microState = 'SCAN_FOR_RULE';
           this.scanIndex = 0;
       }
       this.stepCount++;
    } 
    else if (this.microState === 'SCAN_FOR_RULE') {
       // Visual scan effect: sweep across the encoded tape
       if (this.utmHead < this.rulesEndIndex - 1) {
           this.utmHead++;
       } else {
           // Assume rule found conceptually
           this.microState = 'APPLY_RULE';
       }
       this.stepCount++;
    }
    else if (this.microState === 'APPLY_RULE') {
        // Execute the inner transition
        if (!this.innerTmConfig.delta.has(transitionKey)) {
            this.status = 'rejected';
        } else {
            const [nextState, writeSymbol, dir] = this.innerTmConfig.delta.get(transitionKey);
            this.virtualState = nextState;
            if (writeSymbol === 'B') this.virtualTape.delete(this.virtualHead);
            else this.virtualTape.set(this.virtualHead, writeSymbol);
            
            if (dir === 'R') this.virtualHead++;
            else if (dir === 'L') this.virtualHead--;
        }
        this.microState = 'INIT';
        this.stepCount++;
    }

    // Check halt status directly after virtual run
    if (this.virtualState === this.innerTmConfig.acceptState) this.status = 'accepted';
    else if (this.virtualState === this.innerTmConfig.rejectState) this.status = 'rejected';

    const config = this.getConfig();
    this.history.push(config);
    return config;
  }

  run(maxSteps = 500) {
    let s = 0;
    while (this.status === 'running' || this.status === 'idle') {
      if (s >= maxSteps) break;
      this.step();
      s++;
    }
    return this.getConfig();
  }

  getConfig() {
    return {
        step: this.stepCount,
        state: this.virtualState,
        microState: this.microState,
        head: this.virtualHead,
        utmHead: this.utmHead,
        utmTape: new Map(this.utmTape),
        tape: new Map(this.virtualTape),
        status: this.status
    };
  }
}
