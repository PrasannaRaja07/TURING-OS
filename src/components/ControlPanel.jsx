import React, { useState } from 'react';
import '../styles/ControlPanel.css';

export function ControlPanel({ onStep, onRun, onReset, onLoadInput, status, historyLength, currentStep, onRewind, runSpeed, onSpeedChange }) {
  const [inputStr, setInputStr] = useState('');
  const isHalted = status !== 'running' && status !== 'idle';

  const handleLoad = () => {
    if (onLoadInput) onLoadInput(inputStr);
  };
  
  return (
    <div className="control-module">
      <div className="control-header retro-text">OPERATOR TERMINAL</div>

      <div className="input-group">
        <label>INPUT STRING <span style={{fontSize: '0.7em', color: '#888'}}>(INITIAL TAPE STATE - PRESS LOAD BEFORE RUNNING)</span></label>
        <div className="input-row">
          <input
            type="text"
            className="retro-input"
            value={inputStr}
            onChange={e => setInputStr(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLoad()}
            placeholder="e.g. 11011"
            spellCheck={false}
          />
          <button className="retro-btn" onClick={handleLoad}>[ LOAD ]</button>
        </div>
      </div>

      <div className="control-buttons">
        <button 
          className="retro-btn" 
          onClick={onStep} 
          disabled={isHalted}
        >
          [ STEP ]
        </button>
        <button 
          className="retro-btn start-btn" 
          onClick={onRun} 
          disabled={isHalted}
        >
          [ EXECUTE ]
        </button>
        <button 
          className="retro-btn reset-btn" 
          onClick={onReset}
        >
          [ RESET ]
        </button>
      </div>
      <div className="status-indicator" style={{ marginBottom: '15px' }}>
        SYS.STATUS: <span className={`status-${status}`}>{status.toUpperCase()}</span>
      </div>

      <div className="slider-group">
        <label style={{ lineHeight: '1.5' }}>
          SPEED: {runSpeed}ms <br/>
          <span style={{fontSize: '0.85em', color: '#888', display: 'inline-block', marginTop: '4px'}}>(ADJUST ANIMATION DELAY BETWEEN STEPS)</span>
        </label>
        <input 
          style={{ marginTop: '5px' }}
          type="range" 
          min="50" max="1000" step="50" 
          value={runSpeed} 
          onChange={(e) => onSpeedChange(Number(e.target.value))} 
        />
      </div>

      <div className="slider-group">
        <label style={{ lineHeight: '1.5' }}>
          ⏪ TIME-TRAVEL TRACE REWIND (STEP: {currentStep}) <br/>
          <span style={{fontSize: '0.9em', color: '#aaa', fontWeight: 'normal', display: 'inline-block', marginTop: '4px'}}>Scrub back through history to reverse the tape and state diagram.</span>
        </label>
        <input 
          style={{ marginTop: '5px' }}
          type="range" 
          min="0" max={Math.max(0, historyLength - 1)} 
          value={currentStep} 
          onChange={(e) => onRewind(Number(e.target.value))} 
        />
      </div>
    </div>
  );
}
