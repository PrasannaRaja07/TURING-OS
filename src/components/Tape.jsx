import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import '../styles/Tape.css';

const CELL_WIDTH = 54; // 50px width + 4px margins
const TOTAL_CELLS = 51; // Render 51 cells (-25 to +25 around head)

export function Tape({ config }) {
  const stripRef = useRef(null);
  const prevHeadRef = useRef(0);

  const { head = 0, tape = new Map(), step = 0 } = config || {};

  // Build a wide physical tape strip centred on head
  const halfCells = Math.floor(TOTAL_CELLS / 2);
  const cells = [];
  for (let i = head - halfCells; i <= head + halfCells; i++) {
    cells.push({
      index: i,
      symbol: tape.has(i) ? tape.get(i) : 'B',
      isHead: i === head
    });
  }

  // Animate horizontal scroll via GSAP whenever head moves
  useEffect(() => {
    if (!stripRef.current) return;

    // The head cell is always in the centre of the array, so we scroll
    // the strip so the centre cell aligns with the container centre.
    // Because we rebuild around the head every render, we animate a
    // shift equal to the delta between the old and new head positions.
    const delta = head - prevHeadRef.current;
    if (delta !== 0) {
      // Start offset then animate back to 0 — gives the illusion 
      // that the tape physically slid under a stationary head.
      gsap.fromTo(stripRef.current,
        { x: delta * CELL_WIDTH },
        { x: 0, duration: 0.25, ease: 'power2.out' }
      );
    }
    prevHeadRef.current = head;
  }, [head, step]);

  // Flash the head cell on every write — bright white flash settling to green
  useEffect(() => {
    if (!stripRef.current) return;
    const headCell = stripRef.current.querySelector('.head-active');
    if (headCell) {
      gsap.fromTo(headCell,
        { boxShadow: '0 0 20px var(--phosphor-green)' },
        { boxShadow: '0 0 8px var(--phosphor-green)', duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [head, step]);

  return (
    <div className="tape-module">
      <div className="tape-header retro-text">TAPE UNIT [LTO-9]</div>
      <div className="tape-viewer-container">
        <div className="tape-strip" ref={stripRef}>
          {cells.map((cell) => (
            <div
              key={cell.index}
              className={`tape-cell ${cell.isHead ? 'head-active' : ''}`}
            >
              <div className="cell-index">{cell.index}</div>
              <div className="cell-value">{cell.symbol}</div>
            </div>
          ))}
        </div>
        <div className="head-pointer">▲ OVERWRITE HEAD</div>
      </div>
    </div>
  );
}
