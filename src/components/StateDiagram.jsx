import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import '../styles/StateDiagram.css';

export function StateDiagram({ states, deltaRaw, activeState, prevState }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const simulationRef = useRef(null);

  useEffect(() => {
    if (!states || !deltaRaw || !containerRef.current) return;

    // 1. Data Prep
    const nodes = states.map(s => ({ id: s }));
    
    const multiLinks = [];
    deltaRaw.forEach(([source, read, target, write, dir]) => {
      multiLinks.push({ source, target, label: `${read}→${write},${dir}` });
    });

    const links = multiLinks.map(d => ({ ...d }));

    const width = containerRef.current.clientWidth || 500;
    const height = containerRef.current.clientHeight || 300;

    // Clear old SVG
    d3.select(containerRef.current).selectAll('*').remove();

    const svg = d3.select(containerRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Force Simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(250))
      .force('charge', d3.forceManyBody().strength(-1000))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(80));

    simulationRef.current = simulation;

    // Arrow definitions
    svg.append('defs').append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 35)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('fill', '#39FF14')
      .attr('d', 'M0,-5L10,0L0,5');

    // Bright arrow for active edges
    svg.select('defs').append('marker')
      .attr('id', 'arrow-active')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 35)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('fill', '#00ffff')
      .attr('d', 'M0,-5L10,0L0,5');

    // Draw Links as paths (supports self-loops and curves)
    const link = svg.append('g')
      .attr('class', 'link-group')
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('class', d => {
        const src = d.source.id || d.source;
        const tgt = d.target.id || d.target;
        return `edge edge-${src}-${tgt}`;
      })
      .attr('fill', 'none')
      .attr('stroke', '#7f7b76')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1.5)
      .attr('marker-end', 'url(#arrow)');

    // Draw Link Labels
    const linkLabels = svg.append('g')
      .selectAll('text')
      .data(links)
      .join('text')
      .attr('class', d => `edge-label edge-label-${d.source.id || d.source}-${d.target.id || d.target}`)
      .attr('font-size', '12px')
      .attr('fill', '#aaa')
      .text(d => d.label);

    // Draw Nodes
    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 35)
      .attr('fill', '#0D0D1A')
      .attr('stroke', '#39FF14')
      .attr('stroke-width', 2);

    // Draw Node Labels
    const nodeLabels = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 4)
      .attr('font-size', d => d.id.length > 5 ? '10px' : '14px')
      .attr('fill', '#fff')
      .text(d => d.id);

    simulation.on('tick', () => {
      // Hard clamp nodes within the visible SVG bounds to prevent clipping
      // Add generous top padding (120px) so the self-loop Bezier curves aren't cut off by the top edge
      nodes.forEach(d => {
        d.x = Math.max(45, Math.min(width - 45, d.x));
        d.y = Math.max(120, Math.min(height - 45, d.y));
      });

      // Build path for each edge: self-loop gets a teardrop, others get a slight curve
      link.attr('d', d => {
        const sx = d.source.x, sy = d.source.y;
        const tx = d.target.x, ty = d.target.y;

        if (d.source.id === d.target.id || d.source === d.target) {
          // Self-loop: cubic bezier that forms a loop above the node
          return `M${sx},${sy - 35} C${sx + 65},${sy - 110} ${sx - 65},${sy - 110} ${sx},${sy - 35}`;
        }

        // Slight curve so parallel edges (A→B and B→A) don't overlap
        const dx = tx - sx, dy = ty - sy;
        const dr = Math.sqrt(dx * dx + dy * dy);
        // Perpendicular offset for curvature
        const cx = (sx + tx) / 2 - (dy / dr) * 30;
        const cy = (sy + ty) / 2 + (dx / dr) * 30;
        return `M${sx},${sy} Q${cx},${cy} ${tx},${ty}`;
      });

      linkLabels
        .attr('x', d => {
          if (d.source.id === d.target.id || d.source === d.target) {
            return d.source.x;
          }
          const sx = d.source.x, sy = d.source.y, tx = d.target.x, ty = d.target.y;
          const dx = tx - sx, dy = ty - sy, dr = Math.sqrt(dx * dx + dy * dy);
          return (sx + tx) / 2 - (dy / dr) * 30;
        })
        .attr('y', d => {
          if (d.source.id === d.target.id || d.source === d.target) {
            return d.source.y - 95;
          }
          const sx = d.source.x, sy = d.source.y, tx = d.target.x, ty = d.target.y;
          const dx = tx - sx, dy = ty - sy, dr = Math.sqrt(dx * dx + dy * dy);
          return (sy + ty) / 2 + (dx / dr) * 30 - 5;
        });

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      nodeLabels
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    });

    return () => simulation.stop();
  }, [states, deltaRaw]);

  // Handle active state + active edge highlight WITHOUT restarting simulation
  useEffect(() => {
    if (!containerRef.current) return;
    const svg = d3.select(containerRef.current).select('svg');
    if (svg.empty()) return;

    // ---- Node highlighting ----
    svg.selectAll('circle')
      .transition().duration(200)
      .attr('fill', d => d.id === activeState ? '#39FF14' : '#0D0D1A')
      .attr('stroke', d => d.id === activeState ? '#fff' : '#39FF14');

    // Only color node labels that are nodes (have .id), skip edge labels
    svg.selectAll('g').filter(function() {
      // Select the last g that contains node text
      return d3.select(this).selectAll('circle').size() > 0 ||
             d3.select(this).datum()?.id !== undefined;
    });

    // Simpler: just re-select by parent group
    const allGs = svg.selectAll('g');
    // Node labels are in the 4th <g> (index 3)
    const nodeLabelsG = allGs.filter((_, i) => i === 3);
    if (!nodeLabelsG.empty()) {
      nodeLabelsG.selectAll('text')
        .transition().duration(200)
        .attr('fill', d => d && d.id === activeState ? '#000' : '#fff');
    }

    // ---- Edge highlighting ----
    // Reset all edges to default
    svg.selectAll('.edge')
      .transition().duration(150)
      .attr('stroke', '#7f7b76')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1.5)
      .attr('marker-end', 'url(#arrow)');

    svg.selectAll('[class*="edge-label"]')
      .transition().duration(150)
      .attr('fill', '#aaa')
      .attr('font-size', '12px');

    // If we know the previous state, light up the transition edge
    if (prevState && activeState && prevState !== activeState) {
      const edgeClass = `.edge-${prevState}-${activeState}`;
      svg.selectAll(edgeClass)
        .transition().duration(200)
        .attr('stroke', '#00ffff')
        .attr('stroke-opacity', 1)
        .attr('stroke-width', 3)
        .attr('marker-end', 'url(#arrow-active)');

      const labelClass = `.edge-label-${prevState}-${activeState}`;
      svg.selectAll(labelClass)
        .transition().duration(200)
        .attr('fill', '#00ffff')
        .attr('font-size', '14px');
    }

  }, [activeState, prevState]);

  return (
    <div className="state-module">
      <div className="state-header retro-text">STATE GRAPH TRANSITIONS</div>
      <div className="d3-container" ref={containerRef}></div>
    </div>
  );
}
