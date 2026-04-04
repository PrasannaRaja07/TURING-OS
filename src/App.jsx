import React, { useState, useEffect, useRef } from 'react';
import './styles/global.css';

import { useTuringMachine } from './hooks/useTuringMachine';
import { PRESETS } from './presets/index';

import { Tape } from './components/Tape';
import { DualTape } from './components/DualTape';
import { IDConsole } from './components/IDConsole';
import { ControlPanel } from './components/ControlPanel';
import { StateDiagram } from './components/StateDiagram';
import { CaseFilePanel } from './components/CaseFilePanel';
import { CustomTMBuilder } from './components/CustomTMBuilder';
import { HaltingDossier } from './components/HaltingDossier';

function App() {
  const [activePresetKey, setActivePresetKey] = useState('palindrome');
  const [customPreset, setCustomPreset] = useState(PRESETS.custom);
  const [isUtmMode, setIsUtmMode] = useState(false);
  const [showDossier, setShowDossier] = useState(false);
  
  const activePresetData = activePresetKey === 'custom' ? customPreset : PRESETS[activePresetKey];

  const { tm, config, loadInput, step, rewindToStep } = useTuringMachine(activePresetData, isUtmMode);
  const [autoRun, setAutoRun] = useState(false);
  const [runSpeed, setRunSpeed] = useState(400); // ms per step
  const prevStateRef = useRef(null);
  const [prevState, setPrevState] = useState(null);

  // Track the previous state for edge highlighting in StateDiagram
  // prevStateRef holds the state from the PREVIOUS render cycle
  useEffect(() => {
    if (config?.state) {
      setPrevState(prevStateRef.current);
      prevStateRef.current = config.state;
    }
  }, [config?.state, config?.step]);

  // Auto execution logic
  useEffect(() => {
    let intervalId;
    if (autoRun && config && config.status === 'running') {
      intervalId = setInterval(() => {
        const result = step();
        if (result && result.status !== 'running') {
          setAutoRun(false); // Halt execution
        }
      }, runSpeed);
    } else if (autoRun && config?.status !== 'running') {
      setAutoRun(false);
    }
    
    return () => clearInterval(intervalId);
  }, [autoRun, config?.status, step, runSpeed]);

  const handleRun = () => setAutoRun(true);
  const handleStep = () => { setAutoRun(false); step(); };
  
  const handleReset = () => { 
    setAutoRun(false);
    // Provide sensible default inputs per preset
    if (activePresetKey === 'palindrome') loadInput("11011");
    else if (activePresetKey === 'incrementer') loadInput("1011");
    else if (activePresetKey === 'anbncn') loadInput("aabbcc");
    else loadInput("");
  };

  // Setup initial input on preset change
  useEffect(() => {
    handleReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePresetKey, customPreset.deltaRaw.length]);

  return (
    <div className="turing-os-container">
      <div className="app-topbar">
        <h1 className="retro-text">TURING.OS v9.42</h1>
        <div className="app-topbar-controls">
          <button className="btn-dossier" onClick={() => setShowDossier(true)}>
            [ CLASSIFIED: HALTING DOSSIER ]
          </button>
          <div className="utm-toggle-group">
            <span>UNIVERSAL MACHINE CO-PROCESSOR:</span>
            <button
              className={`btn-utm ${isUtmMode ? 'engaged' : 'offline'}`}
              onClick={() => setIsUtmMode(!isUtmMode)}
            >
              {isUtmMode ? 'ENGAGED' : 'OFFLINE'}
            </button>
          </div>
        </div>
      </div>

      {showDossier && (
        <HaltingDossier
          onClose={() => setShowDossier(false)}
          activePresetKey={activePresetKey}
          activePresetData={activePresetData}
        />
      )}

      {isUtmMode ? <DualTape config={config} /> : <Tape config={config} />}

      <div className="app-main-grid">
        <div className="app-left-col">
          <CaseFilePanel
            presets={PRESETS}
            activePresetKey={activePresetKey}
            onSelectPreset={setActivePresetKey}
          />
          <ControlPanel
            onStep={handleStep}
            onRun={handleRun}
            onReset={handleReset}
            onLoadInput={loadInput}
            status={config?.status || 'idle'}
            historyLength={tm ? tm.history.length : 0}
            currentStep={config ? config.step : 0}
            onRewind={rewindToStep}
            runSpeed={runSpeed}
            onSpeedChange={setRunSpeed}
          />
        </div>

        <div className="app-right-col">
          <StateDiagram
            states={activePresetData.states}
            deltaRaw={activePresetData.deltaRaw}
            activeState={config?.state}
            prevState={prevState}
          />
          <CustomTMBuilder
            activePresetKey={activePresetKey}
            customPreset={customPreset}
            onUpdateCustom={setCustomPreset}
          />
          <IDConsole traceHistory={tm ? tm.history.history : []} />
        </div>
      </div>
    </div>
  );
}

export default App;
