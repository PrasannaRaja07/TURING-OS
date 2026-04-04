export const PalindromeChecker = {
  name: "Palindrome Checker (The Mirror Test)",
  description: "Recognises palindromes over {0, 1}. Uses zig-zag head movement.",
  states: ['q0', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q_accept', 'q_reject'],
  inputAlphabet: ['0', '1'],
  tapeAlphabet: ['0', '1', 'B'],
  startState: 'q0',
  acceptState: 'q_accept',
  rejectState: 'q_reject',
  // delta is an array of [state, read, nextState, write, move] to easily convert to Map
  deltaRaw: [
    // Read 0 at start, move right to find matching 0
    ['q0', '0', 'q1', 'B', 'R'],
    ['q1', '0', 'q1', '0', 'R'],
    ['q1', '1', 'q1', '1', 'R'],
    ['q1', 'B', 'q2', 'B', 'L'], // Reached end
    
    // Read 1 at start, move right to find matching 1
    ['q0', '1', 'q3', 'B', 'R'],
    ['q3', '0', 'q3', '0', 'R'],
    ['q3', '1', 'q3', '1', 'R'],
    ['q3', 'B', 'q4', 'B', 'L'], // Reached end

    // Found end matching 0
    ['q2', '0', 'q5', 'B', 'L'], // Match success, scrub and reverse
    ['q2', '1', 'q_reject', '1', 'R'], // Match fail
    ['q2', 'B', 'q_accept', 'B', 'R'], // Center of odd palindrome (blank left)

    // Found end matching 1
    ['q4', '1', 'q5', 'B', 'L'], // Match success, scrub and reverse
    ['q4', '0', 'q_reject', '0', 'R'], // Match fail
    ['q4', 'B', 'q_accept', 'B', 'R'], // Center of odd palindrome

    // Move left back to start
    ['q5', '0', 'q5', '0', 'L'],
    ['q5', '1', 'q5', '1', 'L'],
    ['q5', 'B', 'q0', 'B', 'R'], // Restart cycle

    // Empty or fully processed string is a palindrome
    ['q0', 'B', 'q_accept', 'B', 'R']
  ]
};

export const BinaryIncrementer = {
  name: "Binary Incrementer (The Carry Relay)",
  description: "Increments a binary number by 1. Demonstrates TM as a computer of integer functions.",
  states: ['q0', 'q1', 'q2', 'q_accept', 'q_reject'],
  inputAlphabet: ['0', '1'],
  tapeAlphabet: ['0', '1', 'B'],
  startState: 'q0',
  acceptState: 'q_accept',
  rejectState: 'q_reject',
  deltaRaw: [
    // Move to rightmost digit
    ['q0', '0', 'q0', '0', 'R'],
    ['q0', '1', 'q0', '1', 'R'],
    ['q0', 'B', 'q1', 'B', 'L'], // Hit end, start carry

    // Carry logic moving left
    ['q1', '1', 'q1', '0', 'L'], // Carry 1 + 1 = 10, write 0 move left
    ['q1', '0', 'q2', '1', 'L'], // Carry 0 + 1 = 1, finished carry
    ['q1', 'B', 'q2', '1', 'L'], // E.g., 11 -> 100

    // Return to start
    ['q2', '0', 'q2', '0', 'L'],
    ['q2', '1', 'q2', '1', 'L'],
    ['q2', 'B', 'q_accept', 'B', 'R'] // Halt
  ]
};

export const AnBnCnRecognizer = {
  name: "a^n b^n c^n Recogniser (Beyond PDA)",
  description: "Accepts languages that are context-sensitive but not context-free. A Pushdown Automaton cannot do this, as it only has one stack.",
  states: ['q0', 'q1', 'q_b', 'q2', 'q_c', 'q3', 'q_rewind', 'q_verify', 'q_accept', 'q_reject'],
  inputAlphabet: ['a', 'b', 'c'],
  tapeAlphabet: ['a', 'b', 'c', 'X', 'Y', 'Z', 'B'],
  startState: 'q0',
  acceptState: 'q_accept',
  rejectState: 'q_reject',
  deltaRaw: [
    // Start scanning for 'a'
    ['q0', 'a', 'q_b', 'X', 'R'], // Found 'a', mark as 'X', find 'b'
    ['q0', 'Y', 'q_verify', 'Y', 'R'], // No more 'a's, ensure only Ys and Zs remain
    
    // Scan right over 'a' and 'Y' looking for 'b'
    ['q_b', 'a', 'q_b', 'a', 'R'],
    ['q_b', 'Y', 'q_b', 'Y', 'R'],
    ['q_b', 'b', 'q_c', 'Y', 'R'], // Found 'b', mark as 'Y', find 'c'

    // Scan right over 'b' and 'Z' looking for 'c'
    ['q_c', 'b', 'q_c', 'b', 'R'],
    ['q_c', 'Z', 'q_c', 'Z', 'R'],
    ['q_c', 'c', 'q_rewind', 'Z', 'L'], // Found 'c', mark as 'Z', rewind to start

    // Rewind back to 'X' (or just past it)
    ['q_rewind', 'Z', 'q_rewind', 'Z', 'L'],
    ['q_rewind', 'b', 'q_rewind', 'b', 'L'],
    ['q_rewind', 'Y', 'q_rewind', 'Y', 'L'],
    ['q_rewind', 'a', 'q_rewind', 'a', 'L'],
    ['q_rewind', 'X', 'q0', 'X', 'R'], // Hit the boundary, loop perfectly

    // Verify all string consumed
    ['q_verify', 'Y', 'q_verify', 'Y', 'R'],
    ['q_verify', 'Z', 'q_verify', 'Z', 'R'],
    ['q_verify', 'B', 'q_accept', 'B', 'R']
  ]
};

export function buildDeltaMap(deltaRaw) {
    const map = new Map();
    for (const [state, read, nextState, write, dir] of deltaRaw) {
        map.set(`${state},${read}`, [nextState, write, dir]);
    }
    return map;
}

export const PRESETS = {
  palindrome: PalindromeChecker,
  incrementer: BinaryIncrementer,
  anbncn: AnBnCnRecognizer,
  custom: { // Blank template for CustomTMBuilder
    name: "Your Machine (Custom)",
    description: "Build your own Turing Machine. Transition table edits are active immediately.",
    states: ['q0', 'q_accept', 'q_reject'],
    inputAlphabet: ['0', '1'],
    tapeAlphabet: ['0', '1', 'B'],
    startState: 'q0',
    acceptState: 'q_accept',
    rejectState: 'q_reject',
    deltaRaw: []
  }
};
