import React, { useEffect, useRef } from 'react';
import '../styles/IDConsole.css';

export function IDConsole({ traceHistory }) {
  const containerRef = useRef(null);

  // Auto-scroll to bottom on new step
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [traceHistory?.length]);

  const renderStatusHex = (status) => {
    if (status === 'accepted') return <span className="status-acc">[ACC]</span>;
    if (status === 'rejected') return <span className="status-rej">[REJ]</span>;
    if (status === 'looping') return <span className="status-err">[ERR:INF]</span>;
    return <span className="status-run">[RUN]</span>;
  };

  if (!traceHistory || traceHistory.length === 0) {
    return <div className="id-module">
      <div className="id-header retro-text">TRACE CONSOLE</div>
      <div className="id-console">AWAITING SYSINIT...</div>
    </div>;
  }

  return (
    <div className="id-module">
      <div className="id-header retro-text">TRACE CONSOLE</div>
      <div className="id-console" ref={containerRef}>
        {traceHistory.map((snap, idx) => (
          <div className={`trace-line trace-status-${snap.status}`} key={idx}>
              <span className="step-count">IDX:{String(snap.step).padStart(4, '0')}</span>
              {'  '}
              <span className="alpha">{snap.left}</span>
              <span className="state-q">{'<'}{snap.state}{'>'}</span>
              <span className="beta">{snap.right}</span>
              {'  '}
              {renderStatusHex(snap.status)}
          </div>
        ))}
      </div>
    </div>
  );
}
