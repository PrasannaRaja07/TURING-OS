import { useState, useRef, useCallback, useEffect } from 'react';
import { TuringMachine } from '../engine/TuringMachine';
import { UniversalTM } from '../engine/UniversalTM';
import { buildDeltaMap } from '../presets/index';

export function useTuringMachine(presetConfig, isUtmMode = false) {
  const tmRef = useRef(null);
  const [config, setConfig] = useState(null);
  
  // Initialize on mount or preset change
  useEffect(() => {
    if (presetConfig) {
      const deltaMap = buildDeltaMap(presetConfig.deltaRaw);
      const conf = { ...presetConfig, delta: deltaMap };
      
      if (isUtmMode) {
         tmRef.current = new UniversalTM(conf);
      } else {
         tmRef.current = new TuringMachine(conf);
      }
      
      // Default reset
      tmRef.current.reset("");
      setConfig(tmRef.current.getConfig());
    }
  }, [presetConfig, isUtmMode]);

  const loadInput = useCallback((input) => {
    if (tmRef.current) {
      tmRef.current.reset(input);
      setConfig(tmRef.current.getConfig());
    }
  }, []);

  const step = useCallback(() => {
    if (tmRef.current) {
      const newConfig = tmRef.current.step();
      setConfig(newConfig);
      return newConfig;
    }
  }, []);

  const rewindToStep = useCallback((index) => {
    if (tmRef.current && tmRef.current.history) {
      const snapshot = tmRef.current.history.get(index);
      if (snapshot) {
        // Restore machine state from snapshot — tape, head, state all rewind simultaneously
        tmRef.current.stepCount = snapshot.step;
        tmRef.current.currentState = snapshot.state;
        tmRef.current.head = snapshot.head;
        tmRef.current.tape = new Map(snapshot.tape);
        
        // Allow the machine to continue running from this rewound point
        tmRef.current.status = snapshot.status === 'running' || snapshot.status === 'idle' ? 'running' : snapshot.status;
        
        // Removed destructive history scrub! Wait for diverging step action to truncate via push() natively.
        
        
        // Trigger React re-render — tape, head, state diagram all update simultaneously
        setConfig({ ...tmRef.current.getConfig() });
      }
    }
  }, []);

  return {
    tm: tmRef.current,
    config, // The current instantaneous description
    loadInput,
    step,
    rewindToStep
  };
}
