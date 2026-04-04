import React, { useState, useEffect, useMemo } from 'react';
import { TuringMachine } from '../engine/TuringMachine';
import { buildDeltaMap } from '../presets/index';
import '../styles/HaltingDossier.css';

const GRID_SIZE = 6;
const INITIAL_GRID = [
  ['H', 'L', 'L', 'H', 'L', 'L'],
  ['L', 'H', 'H', 'L', 'H', 'H'],
  ['H', 'H', 'L', 'L', 'L', 'H'],
  ['L', 'L', 'H', 'H', 'L', 'H'],
  ['H', 'H', 'L', 'L', 'H', 'L'],
  ['L', 'L', 'H', 'L', 'H', 'H'],
];

const STEP_NARRATIVE = [
  null,
  'The diagonal cells M1(w1), M2(w2)... show what H says about each machine running on its own description. These are the critical entries.',
  'Machine D is constructed to do the OPPOSITE of the diagonal: if H says Mi halts on wi, D loops on Mi — and vice versa.',
  'Feed Machine D its own description wD. D must either halt or loop — but either answer directly contradicts its definition. H cannot exist.',
];

const PRESET_LAYER_MAP = {
  palindrome:  ['layer-cfl', 'layer-rec', 'layer-re'],
  incrementer: ['layer-rec', 'layer-re'],
  anbncn:      ['layer-csl', 'layer-rec', 'layer-re'],
  custom:      ['layer-re'],
};

export function HaltingDossier({ onClose, activePresetKey, activePresetData }) {
  const [step, setStep] = useState(0);
  const [paradoxFlicker, setParadoxFlicker] = useState(false);
  const [activeTab, setActiveTab] = useState('halting');

  // FIX 1: build delta map before constructing TM — previously empty Map → 0 steps every bar
  const complexityData = useMemo(() => {
    if (!activePresetData) return [];
    const deltaMap = buildDeltaMap(activePresetData.deltaRaw);
    const sym = activePresetData.inputAlphabet?.[0] || '1';
    const testCases = [];

    for (let n = 2; n <= 10; n++) {
      let str = '';
      if (activePresetKey === 'anbncn') {
        str = 'a'.repeat(n) + 'b'.repeat(n) + 'c'.repeat(n);
      } else if (activePresetKey === 'palindrome') {
        str = sym.repeat(n) + (sym === '1' ? '0' : '1') + sym.repeat(n);
      } else {
        str = sym.repeat(n * 2);
      }
      const tm = new TuringMachine({ ...activePresetData, delta: deltaMap });
      tm.reset(str);
      const result = tm.run(500);
      testCases.push({ len: str.length, steps: result.step });
    }
    return testCases;
  }, [activePresetData, activePresetKey]);

  // FIX 2: reset proof
  const handleResetProof = () => { setStep(0); setParadoxFlicker(false); };

  useEffect(() => {
    let interval;
    if (step === 3) interval = setInterval(() => setParadoxFlicker(p => !p), 100);
    else setParadoxFlicker(false);
    return () => clearInterval(interval);
  }, [step]);

  // FIX 5: Y-axis ticks for complexity chart
  const stepMax = Math.max(...complexityData.map(d => d.steps), 10);
  const yTicks = [stepMax, Math.round(stepMax * 0.75), Math.round(stepMax * 0.5), Math.round(stepMax * 0.25), 0];

  // FIX 4: outer layers also highlight
  const activeLayers = PRESET_LAYER_MAP[activePresetKey] || ['layer-re'];

  return (
    <div className="dossier-overlay">
      <div className={`dossier-modal ${paradoxFlicker ? 'paradox-flash' : ''}`}>

        <div className="dossier-header">
          <h2 className="retro-text dossier-title">CLASSIFIED: THEORETICAL DEEP DIVE</h2>
          <button className="delete-btn dossier-close-btn" onClick={onClose}>CLOSE [X]</button>
        </div>

        <div className="dossier-tabs">
          <button className={`retro-btn ${activeTab === 'halting'    ? 'active-tab' : ''}`} onClick={() => setActiveTab('halting')}>I. THE HALTING PROBLEM</button>
          <button className={`retro-btn ${activeTab === 'complexity' ? 'active-tab' : ''}`} onClick={() => setActiveTab('complexity')}>II. COMPLEXITY METER</button>
          <button className={`retro-btn ${activeTab === 'chomsky'    ? 'active-tab' : ''}`} onClick={() => setActiveTab('chomsky')}>III. CHOMSKY HIERARCHY</button>
        </div>

        {/* TAB I */}
        {activeTab === 'halting' && (
          <>
            <div className="dossier-narrative">
              <p>
                Alan Turing proved in 1936 that a general algorithm to solve the halting problem cannot exist.
                We demonstrate this using <strong>Cantor's Diagonal Argument</strong>.
              </p>
              <p style={{ marginTop: '10px' }}>
                Assume a hypothetical decider <code>H(M, w)</code> exists that returns{' '}
                <strong style={{ color: 'var(--phosphor-green)' }}>H (Halts)</strong> or{' '}
                <strong style={{ color: '#ff3333' }}>L (Loops)</strong> for any machine <code>M</code> on input <code>w</code>.
              </p>
            </div>

            {step > 0 && (
              <div className="step-callout">
                <span className="step-callout-label">STEP {step}:</span> {STEP_NARRATIVE[step]}
              </div>
            )}

            <div className="dossier-grid-container">
              <table className="halting-grid">
                <thead>
                  <tr>
                    <th>Machine \ Input</th>
                    {Array.from({ length: GRID_SIZE }).map((_, i) => <th key={i}>w{i+1}</th>)}
                    {step >= 2 && <th className="new-d-col">wD</th>}
                  </tr>
                </thead>
                <tbody>
                  {INITIAL_GRID.map((row, i) => (
                    <tr key={i}>
                      <th>M{i+1}</th>
                      {row.map((cell, j) => {
                        const isDiag = i === j && step >= 1;
                        return (
                          <td key={j} className={[isDiag ? 'diagonal-cell' : '', cell === 'H' ? 'cell-halts' : 'cell-loops'].filter(Boolean).join(' ')}>
                            {cell}
                          </td>
                        );
                      })}
                      {step >= 2 && <td className="cell-ellipsis">...</td>}
                    </tr>
                  ))}

                  {step >= 2 && (
                    <tr className="machine-d-row">
                      <th>Machine D</th>
                      {INITIAL_GRID.map((row, i) => {
                        const inv = row[i] === 'H' ? 'L' : 'H';
                        return <td key={i} className={inv === 'H' ? 'cell-halts' : 'cell-loops'}>{inv}</td>;
                      })}
                      <td className={step === 3 ? 'paradox-cell' : 'cell-question'}>
                        {step < 3 ? '?' : '\u2297'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="dossier-controls">
              {/* FIX 2: reset always available mid-proof */}
              {step > 0 && step < 3 && (
                <button className="retro-btn reset-proof-btn" onClick={handleResetProof}>[ RESTART PROOF ]</button>
              )}

              {/* FIX 3: no raw backticks in JSX text */}
              {step === 0 && <button className="retro-btn" onClick={() => setStep(1)}>STEP 1 — IDENTIFY DIAGONAL EVALUATIONS</button>}
              {step === 1 && <button className="retro-btn" onClick={() => setStep(2)}>STEP 2 — CONSTRUCT DECIDER D(M)</button>}
              {step === 2 && <button className="retro-btn delete-btn" onClick={() => setStep(3)}>STEP 3 — EVALUATE D(wD)</button>}

              {step === 3 && (
                <>
                  <div className="dossier-conclusion">
                    <h3 className="conclusion-title">FATAL LOGIC EXCEPTION: PARADOX DETECTED</h3>
                    <p>Machine D is defined to do the exact <em>opposite</em> of whatever <code>H</code> says. Feed D its own description <code>wD</code>:</p>
                    <ul className="paradox-list">
                      <li>If <code>H</code> says D halts on <code>wD</code> — D must loop — contradiction.</li>
                      <li>If <code>H</code> says D loops on <code>wD</code> — D must halt — contradiction.</li>
                    </ul>
                    <p style={{ marginTop: '12px', color: '#ff3333', fontWeight: 'bold' }}>
                      Therefore H(M, w) cannot structurally exist. The Halting Problem is undecidable. ∎
                    </p>
                  </div>
                  <button className="retro-btn" style={{ marginTop: '15px' }} onClick={handleResetProof}>[ RUN PROOF AGAIN ]</button>
                </>
              )}
            </div>
          </>
        )}

        {/* TAB II */}
        {activeTab === 'complexity' && (
          <div className="complexity-module">
            <h3 className="retro-text complexity-title">EMPIRICAL COMPLEXITY ANALYSIS</h3>
            <p className="dossier-narrative">
              Runs the active TM on inputs of increasing length and plots real step counts.
              Active preset: <strong style={{ color: '#00ffff' }}>{activePresetData?.name}</strong>
            </p>

            {/* FIX 5: chart with Y-axis scale */}
            <div className="chart-wrapper">
              <div className="chart-y-axis">
                {yTicks.map((tick, i) => <div key={i} className="y-tick">{tick}</div>)}
              </div>
              <div className="chart-area">
                <div className="chart-gridlines">
                  {yTicks.map((_, i) => <div key={i} className="gridline" />)}
                </div>
                <div className="chart-bars">
                  {complexityData.map((data, idx) => {
                    const barH = stepMax > 0 ? (data.steps / stepMax) * 100 : 0;
                    return (
                      <div key={idx} className="bar-col">
                        <div className="bar-step-label">{data.steps}</div>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ height: `${barH}%` }} />
                        </div>
                        <div className="bar-n-label">N={data.len}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="chart-axis-labels">
              <span className="y-axis-label">Steps (Y)</span>
              <span className="x-axis-label">Input length N (X) →</span>
            </div>
          </div>
        )}

        {/* TAB III */}
        {activeTab === 'chomsky' && (
          <div className="chomsky-module">
            <h3 className="retro-text">CHOMSKY HIERARCHY MAP</h3>
            <p className="dossier-narrative">
              Each class is strictly contained within the one above it.
              The active preset and all enclosing classes are highlighted.
            </p>

            {/* FIX 4: all enclosing layers also glow */}
            <div className={`chomsky-layer layer-re ${activeLayers.includes('layer-re') ? 'active-layer' : ''}`}>
              <div className="layer-label">
                <span className="layer-model">[Turing Machine — may not halt]</span>
                Recursively Enumerable
                {activePresetKey === 'custom' && <span className="active-preset-badge">◀ {activePresetData?.name}</span>}
              </div>

              <div className={`chomsky-layer layer-rec ${activeLayers.includes('layer-rec') ? 'active-layer' : ''}`}>
                <div className="layer-label">
                  <span className="layer-model">[Decider TM — always halts]</span>
                  Recursive (Decidable)
                  {activePresetKey === 'incrementer' && <span className="active-preset-badge">◀ {activePresetData?.name}</span>}
                </div>

                <div className={`chomsky-layer layer-csl ${activeLayers.includes('layer-csl') ? 'active-layer' : ''}`}>
                  <div className="layer-label">
                    <span className="layer-model">[Linear Bounded Automaton]</span>
                    Context-Sensitive — e.g. a&#x207F;b&#x207F;c&#x207F;
                    {activePresetKey === 'anbncn' && <span className="active-preset-badge">◀ {activePresetData?.name}</span>}
                  </div>

                  <div className={`chomsky-layer layer-cfl ${activeLayers.includes('layer-cfl') ? 'active-layer' : ''}`}>
                    <div className="layer-label">
                      <span className="layer-model">[Pushdown Automaton]</span>
                      Context-Free — e.g. palindromes
                      {activePresetKey === 'palindrome' && <span className="active-preset-badge">◀ {activePresetData?.name}</span>}
                    </div>

                    <div className="chomsky-layer layer-reg">
                      <div className="layer-label">
                        <span className="layer-model">[DFA / NFA]</span>
                        Regular
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="chomsky-legend">
              <div className="legend-item"><span className="legend-swatch active-swatch" /> Active preset belongs here</div>
              <div className="legend-item"><span className="legend-swatch enclosing-swatch" /> Also contains this language</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
