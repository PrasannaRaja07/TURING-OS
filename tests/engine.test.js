import { describe, it, expect, beforeEach } from 'vitest';
import { TuringMachine } from '../src/engine/TuringMachine.js';
import { ConfigHistory } from '../src/engine/ConfigHistory.js';
import { validateTransitionFunction } from '../src/engine/validator.js';
import { PalindromeChecker, BinaryIncrementer, AnBnCnRecognizer, PRESETS, buildDeltaMap } from '../src/presets/index.js';

// ─────────────────────────────────────────────
//  Helper: build a TuringMachine from a preset
// ─────────────────────────────────────────────
function makeTM(preset) {
  return new TuringMachine({
    ...preset,
    delta: buildDeltaMap(preset.deltaRaw)
  });
}

// ═══════════════════════════════════════════════
//  1. TuringMachine class – 7-tuple model
// ═══════════════════════════════════════════════
describe('TuringMachine – 7-tuple model', () => {

  it('should initialise with correct 7-tuple members', () => {
    const tm = makeTM(PalindromeChecker);
    expect(tm.states).toBeInstanceOf(Set);
    expect(tm.inputAlphabet).toBeInstanceOf(Set);
    expect(tm.tapeAlphabet).toBeInstanceOf(Set);
    expect(tm.delta).toBeInstanceOf(Map);
    expect(tm.startState).toBe('q0');
    expect(tm.acceptState).toBe('q_accept');
    expect(tm.rejectState).toBe('q_reject');
  });

  it('reset() loads input onto tape correctly', () => {
    const tm = makeTM(PalindromeChecker);
    tm.reset('101');
    expect(tm.tape.get(0)).toBe('1');
    expect(tm.tape.get(1)).toBe('0');
    expect(tm.tape.get(2)).toBe('1');
    expect(tm.head).toBe(0);
    expect(tm.currentState).toBe('q0');
    expect(tm.status).toBe('running');
  });

  it('reset() throws on invalid input symbols', () => {
    const tm = makeTM(PalindromeChecker);
    expect(() => tm.reset('abc')).toThrow();
  });

  it('step() returns a config with ID format (αqβ)', () => {
    const tm = makeTM(PalindromeChecker);
    tm.reset('1');
    const cfg = tm.step();
    expect(cfg).toHaveProperty('step');
    expect(cfg).toHaveProperty('state');
    expect(cfg).toHaveProperty('head');
    expect(cfg).toHaveProperty('tape');
    expect(cfg).toHaveProperty('left');
    expect(cfg).toHaveProperty('right');
    expect(cfg).toHaveProperty('status');
  });

  it('run() executes until halt', () => {
    const tm = makeTM(PalindromeChecker);
    tm.reset('101');
    const result = tm.run(500);
    expect(['accepted', 'rejected', 'looping']).toContain(result.status);
  });
});

// ═══════════════════════════════════════════════
//  2. Palindrome Checker preset
// ═══════════════════════════════════════════════
describe('Palindrome Checker', () => {

  it('accepts "11011" (odd palindrome)', () => {
    const tm = makeTM(PalindromeChecker);
    tm.reset('11011');
    expect(tm.run(500).status).toBe('accepted');
  });

  it('accepts "1001" (even palindrome)', () => {
    const tm = makeTM(PalindromeChecker);
    tm.reset('1001');
    expect(tm.run(500).status).toBe('accepted');
  });

  it('accepts single character "0"', () => {
    const tm = makeTM(PalindromeChecker);
    tm.reset('0');
    expect(tm.run(500).status).toBe('accepted');
  });

  it('accepts empty string', () => {
    const tm = makeTM(PalindromeChecker);
    tm.reset('');
    expect(tm.run(500).status).toBe('accepted');
  });

  it('rejects "1010" (not a palindrome)', () => {
    const tm = makeTM(PalindromeChecker);
    tm.reset('1010');
    expect(tm.run(500).status).toBe('rejected');
  });

  it('rejects "110" (not a palindrome)', () => {
    const tm = makeTM(PalindromeChecker);
    tm.reset('110');
    expect(tm.run(500).status).toBe('rejected');
  });
});

// ═══════════════════════════════════════════════
//  3. Binary Incrementer – TM as integer function
// ═══════════════════════════════════════════════
describe('Binary Incrementer – integer function computer', () => {

  it('increments "10" (2) → "11" (3)', () => {
    const tm = makeTM(BinaryIncrementer);
    tm.reset('10');
    tm.run(500);
    const keys = Array.from(tm.tape.keys()).sort((a, b) => a - b);
    const result = keys.map(k => tm.tape.get(k)).join('');
    expect(result).toBe('11');
  });

  it('increments "1011" (11) → "1100" (12)', () => {
    const tm = makeTM(BinaryIncrementer);
    tm.reset('1011');
    tm.run(500);
    const keys = Array.from(tm.tape.keys()).sort((a, b) => a - b);
    const result = keys.map(k => tm.tape.get(k)).join('');
    expect(result).toBe('1100');
  });

  it('increments "111" (7) → "1000" (8) with carry propagation', () => {
    const tm = makeTM(BinaryIncrementer);
    tm.reset('111');
    tm.run(500);
    const keys = Array.from(tm.tape.keys()).sort((a, b) => a - b);
    const result = keys.map(k => tm.tape.get(k)).join('');
    expect(result).toBe('1000');
  });

  it('increments "0" (0) → "1" (1)', () => {
    const tm = makeTM(BinaryIncrementer);
    tm.reset('0');
    tm.run(500);
    expect(tm.tape.get(0)).toBe('1');
  });
});

// ═══════════════════════════════════════════════
//  4. aⁿbⁿcⁿ Recogniser – beyond PDA
// ═══════════════════════════════════════════════
describe('aⁿbⁿcⁿ Recogniser', () => {

  it('accepts "abc"', () => {
    const tm = makeTM(AnBnCnRecognizer);
    tm.reset('abc');
    expect(tm.run(1000).status).toBe('accepted');
  });

  it('accepts "aabbcc"', () => {
    const tm = makeTM(AnBnCnRecognizer);
    tm.reset('aabbcc');
    expect(tm.run(2000).status).toBe('accepted');
  });

  it('rejects "aabbc" (unbalanced)', () => {
    const tm = makeTM(AnBnCnRecognizer);
    tm.reset('aabbc');
    expect(tm.run(1000).status).toBe('rejected');
  });

  it('rejects "abcc" (unbalanced)', () => {
    const tm = makeTM(AnBnCnRecognizer);
    tm.reset('abcc');
    expect(tm.run(1000).status).toBe('rejected');
  });
});

// ═══════════════════════════════════════════════
//  5. ConfigHistory – snapshot store
// ═══════════════════════════════════════════════
describe('ConfigHistory', () => {

  it('push and get work correctly', () => {
    const h = new ConfigHistory();
    h.push({ step: 0, state: 'q0', head: 0, tape: new Map(), status: 'running' });
    h.push({ step: 1, state: 'q1', head: 1, tape: new Map(), status: 'running' });
    expect(h.length).toBe(2);
    expect(h.get(0).state).toBe('q0');
    expect(h.get(1).state).toBe('q1');
  });

  it('scrub truncates forward history', () => {
    const h = new ConfigHistory();
    h.push({ step: 0, state: 'q0', head: 0, tape: new Map(), status: 'running' });
    h.push({ step: 1, state: 'q1', head: 1, tape: new Map(), status: 'running' });
    h.push({ step: 2, state: 'q2', head: 2, tape: new Map(), status: 'running' });
    h.scrub(1);
    expect(h.length).toBe(2);
    expect(h.get(2)).toBeNull();
  });

  it('latest returns the most recent', () => {
    const h = new ConfigHistory();
    h.push({ step: 0, state: 'q0', head: 0, tape: new Map(), status: 'running' });
    h.push({ step: 1, state: 'q1', head: 1, tape: new Map(), status: 'running' });
    expect(h.latest.state).toBe('q1');
  });

  it('deep-copies tape on push', () => {
    const h = new ConfigHistory();
    const tape = new Map([[0, '1']]);
    h.push({ step: 0, state: 'q0', head: 0, tape, status: 'running' });
    tape.set(0, '0'); // mutate original
    expect(h.get(0).tape.get(0)).toBe('1'); // snapshot unchanged
  });
});

// ═══════════════════════════════════════════════
//  6. Transition function validator
// ═══════════════════════════════════════════════
describe('Transition function validator', () => {

  it('accepts a valid delta', () => {
    const tm = makeTM(PalindromeChecker);
    const result = tm.validate();
    expect(result.isValid).toBe(true);
  });

  it('rejects delta with unknown state', () => {
    const delta = new Map();
    delta.set('UNKNOWN,0', ['q1', '1', 'R']);
    const result = validateTransitionFunction(
      new Set(['q0', 'q1']), new Set(['0', '1']), new Set(['0', '1', 'B']), delta
    );
    expect(result.isValid).toBe(false);
  });

  it('rejects delta with invalid direction', () => {
    const delta = new Map();
    delta.set('q0,0', ['q1', '1', 'UP']);
    const result = validateTransitionFunction(
      new Set(['q0', 'q1']), new Set(['0', '1']), new Set(['0', '1', 'B']), delta
    );
    expect(result.isValid).toBe(false);
  });
});

// ═══════════════════════════════════════════════
//  7. Halt detection
// ═══════════════════════════════════════════════
describe('Halt detection', () => {

  it('detects implicit reject (no transition)', () => {
    const tm = new TuringMachine({
      states: ['q0', 'q_accept', 'q_reject'],
      inputAlphabet: ['0'], tapeAlphabet: ['0', 'B'],
      delta: new Map(), startState: 'q0',
      acceptState: 'q_accept', rejectState: 'q_reject'
    });
    tm.reset('0');
    expect(tm.step().status).toBe('rejected');
  });

  it('detects looping via MAX_STEPS guard', () => {
    const delta = new Map();
    delta.set('q0,B', ['q0', 'B', 'R']);
    const tm = new TuringMachine({
      states: ['q0', 'q_accept', 'q_reject'],
      inputAlphabet: ['0'], tapeAlphabet: ['0', 'B'],
      delta, startState: 'q0',
      acceptState: 'q_accept', rejectState: 'q_reject'
    });
    tm.MAX_STEPS = 50;
    tm.reset('');
    expect(tm.run(100).status).toBe('looping');
  });
});
