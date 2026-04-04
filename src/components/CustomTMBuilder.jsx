import React, { useState, useRef } from 'react';
import '../styles/CustomTMBuilder.css';

export function CustomTMBuilder({ activePresetKey, customPreset, onUpdateCustom }) {
  // ALL hooks must be called before any conditional return (Rules of Hooks)
  const [newRule, setNewRule] = useState({ state: '', read: '', nextState: '', write: '', dir: 'R' });
  const fileInputRef = useRef(null);

  if (activePresetKey !== 'custom') return null;

  const handleAddRule = () => {
    if (!newRule.state || !newRule.read || !newRule.nextState || !newRule.write) return;
    const updatedDelta = [...customPreset.deltaRaw, [newRule.state, newRule.read, newRule.nextState, newRule.write, newRule.dir]];
    
    // Auto-add new states if they don't exist
    const updatedStates = new Set([...customPreset.states, newRule.state, newRule.nextState]);
    const updatedTapeAlphabet = new Set([...customPreset.tapeAlphabet, newRule.read, newRule.write, 'B']);

    onUpdateCustom({
      ...customPreset,
      states: Array.from(updatedStates),
      tapeAlphabet: Array.from(updatedTapeAlphabet),
      deltaRaw: updatedDelta
    });

    setNewRule({ state: '', read: '', nextState: '', write: '', dir: 'R' });
  };

  const handleRemoveRule = (index) => {
    const updatedDelta = customPreset.deltaRaw.filter((_, i) => i !== index);
    onUpdateCustom({ ...customPreset, deltaRaw: updatedDelta });
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(customPreset, null, 2));
    const exportNode = document.createElement('a');
    exportNode.setAttribute("href", dataStr);
    exportNode.setAttribute("download", "custom_tm_preset.json");
    document.body.appendChild(exportNode);
    exportNode.click();
    exportNode.remove();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const obj = JSON.parse(event.target.result);
        onUpdateCustom(obj);
      } catch (err) {
        console.error("Invalid TM config JSON", err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="builder-module">
      <div className="builder-header retro-text" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>CUSTOM TM BUILDER (δ-FUNCTION)</span>
        <div style={{ display: 'flex', gap: '10px' }}>
           <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".json" onChange={handleImport} />
           <button className="retro-btn" onClick={() => fileInputRef.current.click()} style={{ padding: '2px 8px', fontSize: '0.8em' }}>[ IMPORT JSON ]</button>
           <button className="retro-btn" onClick={handleExport} style={{ padding: '2px 8px', fontSize: '0.8em' }}>[ EXPORT ]</button>
        </div>
      </div>
      <div style={{ padding: '0 10px 10px 10px', fontSize: '0.8em', color: '#ffaaaa', borderBottom: '1px solid #336' }}>
        <strong>INSTRUCTION:</strong> Define your custom transition rules table below. Add valid states (e.g. q0), symbols, and directions, then provide your own input via the Operator Terminal to execute your custom Turing Machine logic. 
      </div>
      
      <div className="rules-list">
        <table className="retro-table">
          <thead>
            <tr>
              <th>STATE</th>
              <th>READ</th>
              <th></th>
              <th>NEXT</th>
              <th>WRITE</th>
              <th>DIR</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {customPreset.deltaRaw.map((rule, idx) => (
              <tr key={idx}>
                <td>{rule[0]}</td>
                <td>{rule[1]}</td>
                <td>→</td>
                <td>{rule[2]}</td>
                <td>{rule[3]}</td>
                <td>{rule[4]}</td>
                <td>
                  <button className="delete-btn" onClick={() => handleRemoveRule(idx)}>X</button>
                </td>
              </tr>
            ))}
            <tr className="add-rule-row">
              <td><input type="text" value={newRule.state} onChange={e => setNewRule({...newRule, state: e.target.value})} placeholder="q0" /></td>
              <td><input type="text" value={newRule.read} onChange={e => setNewRule({...newRule, read: e.target.value})} placeholder="0" /></td>
              <td>→</td>
              <td><input type="text" value={newRule.nextState} onChange={e => setNewRule({...newRule, nextState: e.target.value})} placeholder="q1" /></td>
              <td><input type="text" value={newRule.write} onChange={e => setNewRule({...newRule, write: e.target.value})} placeholder="1" /></td>
              <td>
                <select value={newRule.dir} onChange={e => setNewRule({...newRule, dir: e.target.value})}>
                  <option value="R">R</option>
                  <option value="L">L</option>
                </select>
              </td>
              <td>
                <button className="add-btn" onClick={handleAddRule}>ADD</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
