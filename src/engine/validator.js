export function validateTransitionFunction(states, inputAlphabet, tapeAlphabet, delta) {
  const errors = [];

  // Check if input alphabet is a subset of tape alphabet
  for (let symbol of inputAlphabet) {
    if (!tapeAlphabet.has(symbol)) {
      errors.push(`Input alphabet symbol '${symbol}' is not in tape alphabet.`);
    }
  }

  // Tape alphabet must contain the Blank symbol 'B'
  if (!tapeAlphabet.has('B')) {
    errors.push(`Tape alphabet must explicitly contain the Blank symbol 'B'.`);
  }

  // Input alphabet must NOT contain the Blank symbol 'B'
  if (inputAlphabet.has('B')) {
    errors.push(`Input alphabet cannot contain the Blank symbol 'B'.`);
  }

  // Validate the domains of delta: Q x Γ -> Q x Γ x {L, R}
  for (let [key, value] of delta.entries()) {
    const [q_in, sym_in] = key.split(',');
    
    if (!states.has(q_in)) {
      errors.push(`State '${q_in}' in delta left hand side is not in Q.`);
    }
    
    if (!tapeAlphabet.has(sym_in)) {
      errors.push(`Symbol '${sym_in}' in delta left hand side is not in Γ.`);
    }

    const [q_next, sym_write, dir] = value;

    if (!states.has(q_next)) {
      errors.push(`Next state '${q_next}' in delta right hand side is not in Q.`);
    }

    if (!tapeAlphabet.has(sym_write)) {
      errors.push(`Write symbol '${sym_write}' in delta right hand side is not in Γ.`);
    }

    if (dir !== 'L' && dir !== 'R') {
      errors.push(`Direction '${dir}' must be either 'L' or 'R'.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
