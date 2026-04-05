# TURING.OS v9.42 — Formally Complete Turing Machine Simulator

TURING.OS is an interactive web-based Turing Machine simulator styled as a retro 1960s mainframe console. It executes and visualizes formal computer science computations locally in your browser with a unique, immersive aesthetic.

---

## Syllabus Units Covered

This simulator directly implements theory covered in two primary computer science syllabus units:

- **Unit 5 (Turing Machines):** Instantaneous description traces, state transition graph dynamics, 7-tuple architecture mapping, Universal TM (computation within computation simulation), and integer functional properties (Binary incrementing).
- **Unit 6 (Decidability & Halting Problem):** Includes a classified interactive dialogue mathematically proving Cantor's Diagonal Argument and simulating the logical contradictions forcing a Universal Decider (H) to fail inherently. Contains empirical step-complexity charts spanning O(n).

---

## Features

### 🖥️ Core Simulation Engine
- **Deterministic TM Engine** (`TuringMachine.js`) — Full 7-tuple architecture `(Q, Σ, Γ, δ, q₀, q_accept, q_reject)` with strict validation before execution.
- **Animated Ticker Tape** (`Tape.jsx`) — A horizontally scrolling tape with a highlighted read/write head, animated via GSAP.
- **ID Console** (`IDConsole.jsx`) — Displays real-time `αqβ` Instantaneous Descriptions at each computation step.
- **Control Panel** (`ControlPanel.jsx`) — Play, Pause, Step, and Reset controls with adjustable execution speed.
- **Timeline Scrubber** — Rewind and fast-forward through the computation history. The tape, head, and state diagram all update simultaneously.

### 📊 State Transition Diagram
- **D3.js-powered Graph** (`StateDiagram.jsx`) — Real-time visualization of states and transitions using force-directed layout with collision boundaries. The active state and transition are highlighted as the machine runs.

### 🧪 Built-In Presets (Case Files)
Three academically rigorous preset machines are included:
1. **Palindrome Checker (The Mirror Test)** — Recognises binary palindromes using zig-zag head movement.
2. **Binary Incrementer (The Carry Relay)** — Adds 1 to a binary number, demonstrating TMs as integer function computers.
3. **aⁿbⁿcⁿ Recogniser (Beyond PDA)** — Accepts a context-sensitive language that no Pushdown Automaton can handle.

### 🛠️ Custom TM Builder
- **Custom Transition Table Editor** (`CustomTMBuilder.jsx`) — Define your own states, tape alphabet, and transition rules via a dynamic input grid.
- **JSON Import / Export** — Import pre-built TM configurations from `.json` files or export your custom machines. Example files are included in the `custom_examples/` folder.
- **Input Validation** (`validator.js`) — Validates `Q × Γ → Q × Γ × {L, R}` domain integrity, alphabet subset rules, and blank symbol constraints before execution begins.

### 🌍 Universal Turing Machine Mode
- **Universal TM Engine** (`UniversalTM.js`) — A co-processor that reads any `activePreset` and generates a rigid Unary encoded sequence (`100100...`) describing all state transition logic.
- **Dual-Tape Subsystem** (`DualTape.jsx`):
  - **Physical Tape** — Scrolls linearly across the Unary transition encodings representing the UTM hardware parsing instruction rules.
  - **Virtual Tape** — Displays the contextual I/O operations of the inner target machine being simulated.

### 🔒 Halting Dossier (Decidability Proof)
- **Interactive Halting Problem Proof** (`HaltingDossier.jsx`) — A classified-file styled overlay that walks the user through:
  1. Evaluating inputs across generic Turing Machines `M₁–M₆` in a matrix.
  2. Constructing the Decider `D(M)` which inverts states (Halt ↔ Loop).
  3. Computing `D(wD)`, causing a structural collapse and a **"PARADOX DETECTED"** exception — visually proving Cantor's Diagonal Argument and the undecidability of the Halting Problem.

---

## Project Structure

```
turing-os/
├── index.html                  # Entry point
├── custom_examples/            # Importable JSON TM configs
│   ├── unary_adder.json
│   └── bit_flipper.json
├── src/
│   ├── App.jsx                 # Main application shell
│   ├── main.jsx                # React entry point
│   ├── engine/                 # Pure JS computation layer
│   │   ├── TuringMachine.js    # Core 7-tuple TM engine
│   │   ├── UniversalTM.js      # UTM co-processor engine
│   │   ├── ConfigHistory.js    # Snapshot history for rewind
│   │   └── validator.js        # Transition function validator
│   ├── hooks/
│   │   └── useTuringMachine.js # React hook bridging engine ↔ UI
│   ├── presets/
│   │   └── index.js            # Palindrome, Incrementer, aⁿbⁿcⁿ presets
│   ├── components/             # React UI components
│   │   ├── Tape.jsx            # Animated ticker tape
│   │   ├── DualTape.jsx        # Physical + Virtual tape (UTM)
│   │   ├── IDConsole.jsx       # Instantaneous Description log
│   │   ├── ControlPanel.jsx    # Play/Pause/Step/Reset controls
│   │   ├── StateDiagram.jsx    # D3 force-directed state graph
│   │   ├── CustomTMBuilder.jsx # Custom transition table editor
│   │   ├── CaseFilePanel.jsx   # Preset info & Chomsky metadata
│   │   └── HaltingDossier.jsx  # Interactive Halting Problem proof
│   └── styles/                 # CSS modules (retro phosphor-green theme)
└── vite.config.js
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Build Tool | Vite |
| State Graph | D3.js (force-directed layout) |
| Animations | GSAP (tape & UI transitions) |
| Styling | Vanilla CSS (retro phosphor-green dark mode) |
| Hosting | Vercel |

No Tailwind, no component libraries — pure CSS-native design.

---

## Developer Instructions

### Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Boot the simulator
npm run dev

# 3. Run unit tests
npm test
```

### Production Build

```bash
npm run build
```

---

## Example Inputs for Presets

| Preset | Input | Expected Result |
|--------|-------|-----------------|
| Palindrome Checker | `10101` | ✅ Accept |
| Palindrome Checker | `1011` | ❌ Reject |
| Binary Incrementer | `11` | `100` (carry-over) |
| Binary Incrementer | `1011` | `1100` |
| aⁿbⁿcⁿ Recogniser | `aabbcc` | ✅ Accept |
| aⁿbⁿcⁿ Recogniser | `aabcc` | ❌ Reject |

---

## 🔗 Project Links

- **Final Submission Video:** [Google Drive](https://drive.google.com/file/d/17D7qKeGH3ymb3sFZZ9xyZhioO2hJMfbA/view?usp=sharing)
- **Live Simulation (Vercel):** [https://turing-os-swart.vercel.app](https://turing-os-swart.vercel.app)
- **GitHub Repository:** [https://github.com/PrasannaRaja07/TURING-OS](https://github.com/PrasannaRaja07/TURING-OS)
