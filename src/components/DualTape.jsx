import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import '../styles/Tape.css';

const CELL_WIDTH = 54;
const HALF = 20;

function TapeStrip({ head, tapeMap, label, color, prevHeadRef, stepKey }) {
  const stripRef = useRef(null);

  const cells = [];
  for (let i = head - HALF; i <= head + HALF; i++) {
    cells.push({
      index: i,
      symbol: tapeMap.has(i) ? tapeMap.get(i) : 'B',
      isHead: i === head
    });
  }

  // Scroll animation — tape slides under the stationary head
  useEffect(() => {
    if (!stripRef.current) return;
    const delta = head - (prevHeadRef.current ?? head);
    if (delta !== 0) {
      gsap.fromTo(stripRef.current,
        { x: delta * CELL_WIDTH },
        { x: 0, duration: 0.25, ease: 'power2.out' }
      );
    }
    prevHeadRef.current = head;
  }, [head, stepKey]);

  // Write-flash on head cell
  useEffect(() => {
    if (!stripRef.current) return;
    const headCell = stripRef.current.querySelector('.head-active');
    if (headCell) {
      gsap.fromTo(headCell,
        { boxShadow: `0 0 20px ${color}` },
        { boxShadow: `0 0 8px ${color}`, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [head, stepKey, color]);

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ fontSize: '0.8em', color, marginBottom: '5px', letterSpacing: '1px' }}>{label}</div>
      <div className="tape-strip" ref={stripRef}>
        {cells.map(cell => (
          <div
            key={cell.index}
            className={`tape-cell ${cell.isHead ? 'head-active' : ''}`}
            style={{
              borderColor: cell.isHead ? color : 'var(--tape-border)',
              borderWidth: cell.isHead ? '2px' : '1px',
              boxShadow: cell.isHead ? `0 0 10px ${color}` : 'none',
              color: cell.isHead ? color : undefined
            }}
          >
            <div className="cell-index">{cell.index}</div>
            <div className="cell-value">{cell.symbol}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '5px', fontSize: '0.8em', color, textAlign: 'center' }}>
        ▲ OVERWRITE HEAD
      </div>
    </div>
  );
}

export function DualTape({ config }) {
  const utmPrevHeadRef = useRef(null);
  const virtualPrevHeadRef = useRef(null);

  const {
    head: vHead = 0,
    tape: vTape = new Map(),
    utmHead = 0,
    utmTape = new Map(),
    step = 0,
    microState = ''
  } = config || {};

  const microLabel =
    microState === 'SCAN_FOR_RULE' ? '> SCANNING ENCODED TRANSITION RULE...' :
    microState === 'APPLY_RULE'    ? '> EXECUTING TRANSITION INSTRUCTION...' :
    '>';

  return (
    <div className="tape-module">
      <div className="tape-header retro-text">DUAL TAPE (UTM MODE)</div>
      <div className="tape-viewer-container" style={{ padding: '10px 0' }}>
        <TapeStrip
          head={utmHead}
          tapeMap={utmTape}
          label="PHYSICAL TAPE: UNIVERSAL MACHINE"
          color="#00ffff"
          prevHeadRef={utmPrevHeadRef}
          stepKey={step}
        />
        <TapeStrip
          head={vHead}
          tapeMap={vTape}
          label="VIRTUAL TAPE: SIMULATED MACHINE"
          color="var(--phosphor-green)"
          prevHeadRef={virtualPrevHeadRef}
          stepKey={step}
        />
      </div>
      <div style={{ textAlign: 'center', fontSize: '0.8em', color: '#ff0' }}>
        {microLabel}
      </div>
    </div>
  );
}
