import React from 'react';
import '../styles/CaseFilePanel.css';

export function CaseFilePanel({ presets, activePresetKey, onSelectPreset }) {
  const activePreset = presets[activePresetKey];

  return (
    <div className="casefile-module">
      <div className="casefile-header retro-text">MISSION LOG - CASE FILES</div>
      
      <div className="casefile-selector">
        <label>ACTIVE CASE:</label>
        <select 
          value={activePresetKey} 
          onChange={(e) => onSelectPreset(e.target.value)}
          className="retro-select"
        >
          {Object.entries(presets).map(([key, p]) => (
            <option key={key} value={key}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="casefile-narrative">
        <div className="narrative-title">{activePreset?.name}</div>
        <div className="narrative-body">{activePreset?.description}</div>
        
        {activePresetKey === 'incrementer' && (
          <div style={{ marginTop: '15px', border: '1px dashed #00ffff', padding: '10px', background: 'rgba(0,255,255,0.05)' }}>
             <div style={{ color: '#00ffff', fontSize: '0.8em', marginBottom: '8px' }}>TM AS INTEGER FUNCTION COMPUTER: f(n) = n + 1</div>
             <div style={{ display: 'flex', gap: '20px', alignItems: 'center', fontSize: '0.85em' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#aaa' }}>Input (binary)</div>
                  <div style={{ color: '#fff', fontSize: '1.2em', fontWeight: 'bold' }}>1011</div>
                  <div style={{ color: '#aaa' }}>= 11 (decimal)</div>
                </div>
                <div style={{ color: '#00ffff', fontSize: '1.5em' }}>→ f(n) →</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#aaa' }}>Output (binary)</div>
                  <div style={{ color: '#0f0', fontSize: '1.2em', fontWeight: 'bold' }}>1100</div>
                  <div style={{ color: '#aaa' }}>= 12 (decimal)</div>
                </div>
             </div>
             <div style={{ color: '#888', fontSize: '0.75em', marginTop: '8px' }}>
               The TM computes integer functions by treating tape symbols as binary digits. This proves TMs are equivalent to integer function computers (Unit 5: Church's Thesis).
             </div>
          </div>
        )}

        {activePresetKey === 'anbncn' && (
          <div style={{ marginTop: '15px', border: '1px dashed #ff3333', padding: '10px', background: 'rgba(255,51,51,0.1)' }}>
             <div style={{ color: '#ff3333', fontSize: '0.8em', marginBottom: '8px' }}>PDA STACK SIMULATION [REJECTED]</div>
             <div style={{ display: 'flex', gap: '15px', alignItems: 'center', minHeight: '60px' }}>
                <div style={{ width: '30px', minHeight: '40px', border: '1px solid #666', borderTop: 'none', display: 'flex', flexDirection: 'column-reverse', background: '#000' }}>
                   <div style={{ borderTop: '1px solid #333', textAlign: 'center', padding: '2px 0', fontSize: '10px' }}>A</div>
                   <div style={{ borderTop: '1px solid #333', textAlign: 'center', padding: '2px 0', fontSize: '10px' }}>A</div>
                </div>
                <div style={{ flex: 1, fontSize: '0.85em', color: '#ffaaaa', lineHeight: '1.5' }}>
                   1. Push matched 'a's.<br/>
                   2. Pop 'a's for 'b's.<br/>
                   3. Empty stack at 'c' elements.<br/>
                   <span style={{ fontWeight: 'bold' }}>FATAL: Cannot count 3rd dependent variable.</span>
                </div>
             </div>
          </div>
        )}
      </div>
      
      <div className="casefile-specs">
        <div><strong>Σ (Input):</strong> {`{${activePreset?.inputAlphabet?.join(', ')}}`}</div>
        <div><strong>Γ (Tape):</strong> {`{${activePreset?.tapeAlphabet?.join(', ')}}`}</div>
        <div><strong>Q (States):</strong> {activePreset?.states?.length} Total</div>
      </div>
    </div>
  );
}
