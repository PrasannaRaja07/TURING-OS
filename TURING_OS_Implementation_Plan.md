# TURING.OS — Implementation Plan

**Theory of Computation — Assignment Submission**  
**Concept:** Turing Machine Simulator (Unit 5 + Unit 6)  
**Deadline:** 20 April 2026, 11:00 PM

---

## 1. Project Overview

TURING.OS is an interactive web-based simulator that brings Turing Machines to life through a retro-styled 1960s mainframe operator console. Rather than a generic academic tool, every screen element is designed to feel like operating an actual historical computing machine — monospace terminal fonts, animated ticker tape, rotating state dials, and a computation trace console.

The simulator covers two units of the syllabus in a single coherent application, because they are historically inseparable:

- **Unit 5 — Turing Machines:** Basic model, definition, representation, instantaneous descriptions, variants (Universal TM, TM as integer function computer), Church's Thesis.
- **Unit 6 — Decidability:** The Halting Problem, undecidable problems about TMs, and an interactive diagonal argument. The Halting Problem is the natural endpoint of TM theory — Turing invented the TM specifically to prove it.

---

## 2. Why This Concept

### 2.1 Academic justification

The Turing Machine is the crown jewel of the Theory of Computation syllabus. Every other model — DFAs, NFAs, PDAs, CFGs — is a restricted special case of what a TM can do. Simulating a TM therefore demonstrates mastery of the entire course, not just Unit 5.

### 2.2 Unit 5 to Unit 6 — not arbitrary, historically inevitable

The connection between Unit 5 and Unit 6 is not cross-unit padding. It is the logical sequence Turing himself followed in 1936:

1. Define the TM as a formal model of computation.
2. Show that a Universal TM can simulate any other TM (Church's Thesis).
3. Ask: can a UTM decide whether any given TM halts on any given input?
4. Prove via diagonalization that no such TM can exist — the Halting Problem is undecidable.

Steps 1–4 are one continuous argument. A simulator that stops at Step 2 tells half the story.

---

## 3. Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Computation engine | Vanilla JavaScript (ES6 classes) | Portable, zero-dependency, runs anywhere |
| UI framework | React 18 (Vite) | Component model suits tape + state diagram + controls |
| State management | useState / useReducer | Computation history stored in React state |
| Animations | GSAP 3 | Tape scroll, head movement, cell flash — smooth 60fps |
| State diagram | D3.js force layout | Auto-positions nodes, draws curved edges |
| Styling | CSS Modules + CSS variables | Theme switching, retro terminal palette — no Tailwind |
| Build | Vite | Fast HMR, single HTML output for submission |

### Why CSS Modules over Tailwind

The retro terminal aesthetic is almost entirely custom CSS — scanline overlays, phosphor glow keyframes, ticker tape scroll animations, CRT flicker. None of that exists as a Tailwind utility. CSS variables are also load-bearing: the entire colour palette (`--phosphor-green`, `--crt-dark`, `--tape-beige`) must live in variables for the theme to stay consistent. Tailwind would be dead weight on top of custom CSS that has to be written anyway.

### Scaffold command

Run this before anything else:

```bash
npm create vite@latest turing-os -- --template react
cd turing-os
npm install
npm install gsap d3
npm run dev
```

Delete `App.css`, clear `App.jsx` to a blank component, then go straight to `src/engine/TuringMachine.js`.

---

## 4. Architecture

### 4.1 Folder structure

```
src/
  engine/           TuringMachine.js, ConfigHistory.js, UniversalTM.js
  components/       Tape.jsx, StateDiagram.jsx, IDConsole.jsx, etc.
  presets/          palindrome.js, anbn.js, binary.js, etc.
  styles/           global.css, variables.css
  hooks/            useTuringMachine.js (connects engine to React state)
```

### 4.2 Module responsibilities

| Module | File | Responsibility |
|---|---|---|
| TM Engine | `engine/TuringMachine.js` | Pure computation — no DOM, no React |
| UTM Engine | `engine/UniversalTM.js` | Encodes + simulates another TM |
| Config Store | `engine/ConfigHistory.js` | Stores every instantaneous description |
| Tape Component | `components/Tape.jsx` | Animated scrolling tape with GSAP |
| State Diagram | `components/StateDiagram.jsx` | D3 force-directed graph, live highlights |
| Transition Table | `components/TransitionTable.jsx` | Editable table, validates delta function |
| ID Console | `components/IDConsole.jsx` | Scrollable config trace, monospace |
| Halting Dossier | `components/HaltingDossier.jsx` | Diagonal proof animation + complexity chart |
| Presets | `presets/index.js` | JSON definitions of all built-in TMs |

### 4.3 Data flow

The `TuringMachine` class is the single source of truth. React components read from it and dispatch actions to it. The engine never touches the DOM.

```
User Input → TuringMachine.step() → ConfigHistory.push(snapshot) → React re-render → GSAP animation
```

---

## 5. TM Engine — Detailed Specification

### 5.1 TuringMachine class (7-tuple)

The engine models the formal 7-tuple **M = (Q, Σ, Γ, δ, q₀, q_accept, q_reject)** as a JavaScript class:

| Member | Type | Description |
|---|---|---|
| `states` | `Set<string>` | All states Q |
| `inputAlphabet` | `Set<string>` | Σ — symbols valid in input |
| `tapeAlphabet` | `Set<string>` | Γ — all symbols + blank (B) |
| `delta` | `Map<string, [next, write, dir]>` | Transition function, key = `'state,symbol'` |
| `startState` | `string` | q₀ |
| `acceptState` | `string` | q_accept |
| `rejectState` | `string` | q_reject |
| `tape` | `Map<number, string>` | Sparse map: index → symbol (infinite in both directions) |
| `head` | `number` | Current head position (can be negative) |
| `currentState` | `string` | Active state |
| `step()` | `→ StepResult` | Execute one transition, return snapshot |
| `run(maxSteps)` | `→ RunResult` | Execute until halt or max steps reached |
| `reset(input)` | `void` | Reload tape with new input string |
| `getConfig()` | `→ Config` | Return current instantaneous description αqβ |

### 5.2 Instantaneous Description (ID) format

Every step produces a Config snapshot stored in `ConfigHistory`. This enables reverse execution and the trace console:

```js
{
  step: number,
  state: string,
  head: number,
  tape: Map<number, string>,
  left: string,
  right: string,
  status: 'running' | 'accepted' | 'rejected' | 'looping'
}
```

### 5.3 Halt detection

The engine detects three halt conditions: entering `q_accept` (accepted), entering `q_reject` (rejected), or reaching a configuration with no defined transition (implicit reject). A maximum step guard of 10,000 steps fires a `'looping'` status to prevent browser hang on non-terminating inputs — this directly demonstrates the undecidability of the Halting Problem in practice.

---

## 6. Implementation Phases

### Phase 1 — Engine & Data Layer

| Task | Output | Syllabus reference |
|---|---|---|
| TuringMachine class with step()/run()/reset() | `engine/TuringMachine.js` | Unit 5: Basic model, definition |
| Transition function validator | `engine/validator.js` | Unit 5: Formal definition |
| ConfigHistory with push/get/scrub(index) | `engine/ConfigHistory.js` | Unit 5: Instantaneous description |
| Preset TM definitions (JSON) | `presets/index.js` | Unit 5: Examples |
| Unit tests for engine | `tests/engine.test.js` | Verification of correctness |

### Phase 2 — Retro Terminal UI

Visual identity: dark background `#0D0D1A`, green phosphor terminal colour `#39FF14` at 70% opacity, monospace font (JetBrains Mono or Fira Code), scanline CSS overlay for CRT effect.

| Component | Unusual feature | Syllabus reference |
|---|---|---|
| Tape | Scrolls horizontally with GSAP; head position highlighted; write-flash on cell update | Unit 5: Tape model |
| State diagram | D3 auto-layout; active state glows; transition edge lights up on each step | Unit 5: State transition graph |
| ID console | Every config printed as αqβ in monospace; colour-coded by status | Unit 5: Instantaneous description |
| Controls | Step / Auto / Speed slider / Rewind-to-step-N scrub slider | Unit 5: Computation |

### Phase 3 — Preset Examples (Case Files)

Each preset opens a case file panel with a short narrative explaining why the language matters before running the simulation.

| Preset | Narrative label | Unusual visual | Syllabus reference |
|---|---|---|---|
| Palindrome checker | The Mirror Test | Head zig-zags visibly across tape | Unit 5: TM examples |
| aⁿbⁿcⁿ recogniser | Beyond the PDA | Side-by-side PDA rejection proof shown live | Unit 5: Language acceptance |
| Binary incrementer | The Carry Relay | Shows TM as integer function computer | Unit 5: TM as computer of integer functions |
| Custom TM builder | Your Machine | Drag-edit transition table, export/import JSON | Unit 5: Formal definition |

### Phase 4 — Universal TM Mode (Crown Jewel)

A Universal TM takes as input the encoded description of another TM M plus an input string w, and simulates M on w.

**Encoding scheme**
- States encoded as unary: q₀ = `0`, q₁ = `00`, q₂ = `000` etc., separated by 1-separators
- Tape alphabet symbols similarly encoded in unary
- Transition rules encoded as quintuples: `(state, read, write, direction, next_state)`
- Full encoding placed on UTM tape preceded by a delimiter

**Dual-tape visualisation**
- UTM's real tape scrolls at the top — shows the encoded description being scanned
- Simulated TM's virtual tape updates at the bottom — shows the inner computation
- Both tapes animate in sync; step counter counts UTM steps, not inner TM steps
- This visually demonstrates computation within computation — the basis of all modern stored-program computers

**Reverse execution**
- `ConfigHistory` stores every snapshot; scrub slider seeks to any step index
- Tape, head position, and state diagram all rewind simultaneously
- Framed as: "Rewind the machine" — a feature no other student simulator has

### Phase 5 — Halting Dossier (Unit 6 Bridge)

A dedicated screen connecting the TM simulator to decidability theory.

**5a. Diagonal argument visualiser**
- A grid is built: rows = TMs M₁, M₂, M₃...; columns = inputs w₁, w₂, w₃...
- Each cell shows H (halts) or L (loops) — filled in step-by-step with animation
- The diagonal is highlighted, then flipped — contradiction lights up in red
- User clicks through each step of the proof with a Next button

**5b. Complexity meter**
- Runs the active TM on inputs of length 1 to 20 automatically
- Plots a chart: input length (x-axis) vs steps taken (y-axis)
- Curve-fits and labels the growth rate: O(n), O(n²), O(n log n) etc.
- Connects to Unit 6 Complexity: Time Complexity, Problem classes P, NP

**5c. Chomsky hierarchy map**
- An interactive nested diagram: Regular ⊂ CFL ⊂ Recursive ⊂ RE ⊂ All Languages
- As user switches presets, the active language's region highlights
- Shows what each model (DFA, PDA, TM-always-halts, TM-may-loop) can and cannot decide

---

## 7. Syllabus Coverage Map

Every feature maps directly to the given syllabus. Nothing is outside scope.

### Unit 5 — Turing Machines

| Syllabus topic | Feature in TURING.OS |
|---|---|
| Basic model, definition and representation | TuringMachine class (7-tuple), transition table editor |
| Instantaneous Description | ID console — prints αqβ at every step |
| Variants: TM as computer of integer functions | Binary incrementer preset — TM computes +1 |
| Universal TM | Phase 4 — UTM mode with dual-tape visualisation |
| Church's Thesis | Case file narrative for UTM preset; complexity meter |
| Language acceptance by TM | Accept / reject / loop status on all presets |
| Recursive and recursively enumerable languages | Chomsky hierarchy map; max-step looping indicator |

### Unit 6 — Decidability

| Syllabus topic | Feature in TURING.OS |
|---|---|
| Halting Problem | Halting Dossier — dedicated screen |
| Introduction to Undecidability | Diagonal argument visualiser (animated proof) |
| Undecidable problems about TMs | Max-step guard demonstrating non-termination; looping detector |
| Time Complexity | Complexity meter — empirical step chart with curve fitting |
| Problem classes P, NP, NP-Hard, NP-Complete | Complexity chart labels and Chomsky map extension |

---

## 8. Timeline

**16 days available** (4 April → 20 April 2026)

| Days | Phase | Deliverable |
|---|---|---|
| 4–6 Apr (3 days) | Phase 1: Engine | TuringMachine.js, ConfigHistory.js, all presets, unit tests passing |
| 7–10 Apr (4 days) | Phase 2: UI | Tape animation, state diagram (D3), ID console, retro theme |
| 11–13 Apr (3 days) | Phase 3: Presets | All 4 case files with narratives, custom TM builder |
| 14–16 Apr (3 days) | Phase 4: UTM + Reverse | Universal TM dual-tape view, scrub slider |
| 17–18 Apr (2 days) | Phase 5: Halting Dossier | Diagonal animation, complexity meter, Chomsky map |
| 19–20 Apr (2 days) | Polish + Submission | Bug fixes, mobile layout, Vercel deploy, final submission |

---

## 9. What Makes This Submission Unusual

- **Visual identity:** Retro 1960s mainframe terminal aesthetic — not a plain white academic UI
- **UTM:** Universal TM mode with two tapes animating simultaneously — computation within computation
- **Rewind:** Reverse execution — scrub through computation history like a video timeline
- **Halting:** Diagonal argument visualiser — animated step-by-step undecidability proof
- **Complexity:** Empirical complexity meter — runs TM on increasing input lengths and plots the curve
- **Hierarchy:** Chomsky hierarchy map — interactive nesting that lights up per preset
- **Narrative:** Case file framing — each preset explains why the language matters before running
- **Builder:** Custom TM builder with JSON export — user can design and save their own TMs

---

## 10. Submission Form — Required Fields

| Field | Answer |
|---|---|
| **Module / Chapter number of the topic chosen** | Unit 5 (primary) — Turing Machines; Unit 6 (secondary) — Decidability & Halting Problem |
| **Describe the simulation in 1–2 sentences** | TURING.OS is an interactive Turing Machine simulator styled as a 1960s mainframe console, featuring an animated ticker tape, live state transition diagram, and a Universal TM mode that runs one TM inside another. It also includes an animated diagonal argument that proves the Halting Problem is undecidable, directly connecting Unit 5 to Unit 6. |
| **GitHub link of the simulation** | `https://github.com/<your-username>/turing-os` |
| **Simulation link (Vercel / Render etc.)** | `https://turing-os.vercel.app` |

> Update the GitHub and deployment links once the project is live. The description above is ready to paste as-is.

### Vercel deployment steps

1. Push project to a GitHub repo named `turing-os`
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Framework preset: **Vite** — Vercel detects it automatically
4. Build command: `npm run build` | Output directory: `dist`
5. Click Deploy — live URL appears within ~60 seconds
6. Optional: rename to `turing-os.vercel.app` in project settings

Every subsequent `git push` to `main` auto-redeploys. No manual steps needed after initial setup.

---

## 11. Submission Checklist

- [ ] Module/Chapter filled: Unit 5 + Unit 6
- [ ] 1–2 sentence description copied from Section 10
- [ ] GitHub repo live and public: `github.com/<username>/turing-os`
- [ ] Vercel deployment live: `turing-os.vercel.app`
- [ ] Vite build verified: `npm run build` produces clean `dist/` folder
- [ ] This implementation plan submitted alongside the project
- [ ] Short demo video (2–3 min) showing UTM mode and Halting Dossier
