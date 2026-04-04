# TURING.OS — Formally Complete Turing Machine Simulator

TURING.OS is an interactive web-based simulator styled as a retro 1960s mainframe console. It executes and visualizes formal computer science computations locally in your browser.

## Syllabus Units Covered
This simulator directly implements theory covered in two primary computer science syllabus units:
* **Unit 5 (Turing Machines):** Instantaneous description traces, state transition graph dynamics, 7-tuple architecture mapping, Universal TM (computation within computation simulation), and integer functional properties (Binary incrementing).
* **Unit 6 (Decidability & Halting Problem):** Includes a classified interactive dialogue mathematically proving Cantor's Diagonal Argument and simulating the logical contradictions forcing a Universal Decider (H) to fail inherently. Contains empirical step-complexity charts spanning O(n).

## Developer Instructions (Running Locally)

This app is built natively using React 18, Vite, D3.js, and GSAP. 
No Tailwind or component library bloat is attached.

```bash
# 1. Install local dependencies
npm install

# 2. Boot the core simulator operator panel
npm run dev

# 3. Fire engine unit testing protocols
npm test
```

## Compilation 
To compress and bundle the project for a Vercel-bound production deployment:
```bash
npm run build
```
