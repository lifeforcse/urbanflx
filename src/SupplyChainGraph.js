import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * ============================================
 * NEURAL SUPPLY CHAIN GRAPH
 * Custom Physics Simulation Engine
 * ============================================
 */

// Physics Constants
const COULOMB_CONSTANT = 5000; // Node repulsion strength
const HOOKE_CONSTANT = 0.05;   // Spring stiffness
const SPRING_LENGTH = 120;     // Rest length of springs
const DAMPING = 0.92;          // Velocity damping factor
const MAX_VELOCITY = 15;       // Maximum velocity cap
const TIME_STEP = 0.016;       // Approximate 60fps timestep
const SHOCKWAVE_DECAY = 0.95;  // Shockwave energy decay per frame
const STRESS_THRESHOLD = 0.7;  // Threshold for high stress nodes

/**
 * Node Types Configuration
 */
const NODE_TYPES = {
  SUPPLIER: { color: '#3b82f6', label: 'Supplier', stressColor: '#ef4444' },
  WAREHOUSE: { color: '#a855f7', label: 'Warehouse', stressColor: '#f97316' },
  RETAILER: { color: '#14b8a6', label: 'Retailer', stressColor: '#eab308' },
};

/**
 * Initial Network Data - Supply Chain Topology
 */
const INITIAL_NODES = [
  { id: 0, type: 'SUPPLIER', x: 400, y: 100, stress: 0.2, label: 'Raw Materials S1' },
  { id: 1, type: 'SUPPLIER', x: 600, y: 100, stress: 0.4, label: 'Raw Materials S2' },
  { id: 2, type: 'SUPPLIER', x: 500, y: 200, stress: 0.1, label: 'Raw Materials S3' },
  { id: 3, type: 'WAREHOUSE', x: 300, y: 350, stress: 0.6, label: 'Central Hub W1' },
  { id: 4, type: 'WAREHOUSE', x: 700, y: 350, stress: 0.3, label: 'Central Hub W2' },
  { id: 5, type: 'WAREHOUSE', x: 500, y: 450, stress: 0.8, label: 'Distribution D1' },
  { id: 6, type: 'RETAILER', x: 150, y: 550, stress: 0.2, label: 'Store R1' },
  { id: 7, type: 'RETAILER', x: 350, y: 550, stress: 0.5, label: 'Store R2' },
  { id: 8, type: 'RETAILER', x: 500, y: 580, stress: 0.4, label: 'Store R3' },
  { id: 9, type: 'RETAILER', x: 650, y: 550, stress: 0.3, label: 'Store R4' },
  { id: 10, type: 'RETAILER', x: 800, y: 520, stress: 0.7, label: 'Store R5' },
];

const INITIAL_EDGES = [
  { source: 0, target: 3 },
  { source: 0, target: 2 },
  { source: 1, target: 2 },
  { source: 1, target: 4 },
  { source: 2, target: 3 },
  { source: 2, target: 4 },
  { source: 2, target: 5 },
  { source: 3, target: 5 },
  { source: 3, target: 6 },
  { source: 3, target: 7 },
  { source: 4, target: 5 },
  { source: 4, target: 9 },
  { source: 4, target: 10 },
  { source: 5, target: 7 },
  { source: 5, target: 8 },
  { source: 5, target: 9 },
  { id: 16, source: 6, target: 7 },
  { id: 17, source: 7, target: 8 },
  { id: 18, source: 8, target: 9 },
  { id: 19, source: 9, target: 10 },
];

/**
 * ============================================
 * CUSTOM PHYSICS ENGINE HOOK
 * ============================================
 */
const usePhysicsEngine = (nodes, edges, width, height) => {
  const physicsState = useRef({
    nodes: nodes.map(n => ({
      ...n,
      vx: 0,
      vy: 0,
      ax: 0,
      ay: 0,
      mass: 1 + n.stress * 0.5, // Higher stress = more mass
    })),
    edges: edges.map(e => ({ ...e })),
    shockwaves: [],
    running: true,
  });

  const [stats, setStats] = useState({
    kineticEnergy: 0,
    tension: 0,
    networkEntropy: 0,
  });

  // Calculate distance between two nodes
  const distance = useCallback((n1, n2) => {
    const dx = n2.x - n1.x;
    const dy = n2.y - n1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Calculate angle between two nodes
  const angle = useCallback((n1, n2) => {
    return Math.atan2(n2.y - n1.y, n2.x - n1.x);
  }, []);

  // Coulomb's Law: Repulsion between all node pairs
  const calculateCoulombRepulsion = useCallback((nodeIndex, allNodes) => {
    const node = allNodes[nodeIndex];
    let fx = 0, fy = 0;

    for (let i = 0; i < allNodes.length; i++) {
      if (i === nodeIndex) continue;
      
      const other = allNodes[i];
      const dx = node.x - other.x;
      const dy = node.y - other.y;
      const dist = Math.sqrt(dx * dx + dy * dy) + 1; // Avoid division by zero
      
      // Coulomb's Law: F = k / r²
      // Stress multiplier increases repulsion for high-stress nodes
      const stressFactor = 1 + node.stress * STRESS_THRESHOLD;
      const force = (COULOMB_CONSTANT * stressFactor) / (dist * dist);
      
      fx += (dx / dist) * force;
      fy += (dy / dist) * force;
    }

    return { fx, fy };
  }, []);

  // Hooke's Law: Spring force for connected nodes
  const calculateHookeAttraction = useCallback((edge, allNodes) => {
    const source = allNodes[edge.source];
    const target = allNodes[edge.target];
    
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Hooke's Law: F = k * (x - x₀)
    const displacement = dist - SPRING_LENGTH;
    const force = HOOKE_CONSTANT * displacement;
    
    const fx = (dx / dist) * force;
    const fy = (dy / dist) * force;

    return { fx, fy, tension: Math.abs(displacement) };
  }, []);

  // Boundary forces to keep nodes in view
  const calculateBoundaryForces = useCallback((node) => {
    const margin = 50;
    const boundaryK = 0.1;
    let fx = 0, fy = 0;

    if (node.x < margin) fx += (margin - node.x) * boundaryK;
    if (node.x > width - margin) fx += (width - margin - node.x) * boundaryK;
    if (node.y < margin) fy += (margin - node.y) * boundaryK;
    if (node.y > height - margin) fy += (height - margin - node.y) * boundaryK;

    return { fx, fy };
  }, [width, height]);

  // Apply shockwave forces
  const applyShockwaves = useCallback((node, nodeIndex) => {
    let fx = 0, fy = 0;
    
    physicsState.current.shockwaves.forEach(sw => {
      const dx = node.x - sw.x;
      const dy = node.y - sw.y;
      const dist = Math.sqrt(dx * dx + dy * dy) + 1;
      
      // Inverse square law for shockwave propagation
      const impact = sw.force / (dist * dist);
      const decay = Math.pow(SHOCKWAVE_DECAY, sw.age);
      
      fx += (dx / dist) * impact * decay;
      fy += (dy / dist) * impact * decay;
    });

    return { fx, fy };
  }, []);

  // Main physics simulation step
  const simulationStep = useCallback(() => {
    const { nodes, edges, shockwaves } = physicsState.current;
    let totalKineticEnergy = 0;
    let totalTension = 0;

    // Reset accelerations
    nodes.forEach(node => {
      node.ax = 0;
      node.ay = 0;
    });

    // Apply Coulomb repulsion (all pairs)
    nodes.forEach((_, i) => {
      const { fx, fy } = calculateCoulombRepulsion(i, nodes);
      nodes[i].ax += fx;
      nodes[i].ay += fy;
    });

    // Apply Hooke attraction (connected pairs)
    edges.forEach(edge => {
      const { fx, fy, tension } = calculateHookeAttraction(edge, nodes);
      nodes[edge.source].ax += fx;
      nodes[edge.source].ay += fy;
      nodes[edge.target].ax -= fx;
      nodes[edge.target].ay -= fy;
      totalTension += tension;
    });

    // Apply boundary forces
    nodes.forEach((node, i) => {
      const { fx, fy } = calculateBoundaryForces(node);
      nodes[i].ax += fx;
      nodes[i].ay += fy;
    });

    // Apply shockwave forces
    nodes.forEach((node, i) => {
      const { fx, fy } = applyShockwaves(node, i);
      nodes[i].ax += fx;
      nodes[i].ay += fy;
    });

    // Update velocities and positions (Euler integration)
    nodes.forEach(node => {
      // Acceleration to velocity
      node.vx += node.ax * TIME_STEP;
      node.vy += node.ay * TIME_STEP;

      // Apply damping
      node.vx *= DAMPING;
      node.vy *= DAMPING;

      // Cap velocity
      const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
      if (speed > MAX_VELOCITY) {
        node.vx = (node.vx / speed) * MAX_VELOCITY;
        node.vy = (node.vy / speed) * MAX_VELOCITY;
      }

      // Update position
      node.x += node.vx * TIME_STEP;
      node.y += node.vy * TIME_STEP;

      // Calculate kinetic energy: KE = 0.5 * m * v²
      totalKineticEnergy += 0.5 * node.mass * (node.vx * node.vx + node.vy * node.vy);
    });

    // Update shockwaves (age and remove dead ones)
    physicsState.current.shockwaves = shockwaves
      .map(sw => ({ ...sw, age: sw.age + 1 }))
      .filter(sw => sw.force > 0.1 && sw.age < 300);

    // Calculate network entropy (measure of disorder)
    const avgVelocity = totalKineticEnergy / nodes.length;
    const entropy = Math.log(avgVelocity + 0.001) * -1;

    setStats({
      kineticEnergy: totalKineticEnergy,
      tension: totalTension,
      networkEntropy: entropy,
    });

    return nodes.map(n => ({
      id: n.id,
      x: n.x,
      y: n.y,
      stress: n.stress,
      type: n.type,
      label: n.label,
    }));
  }, [calculateCoulombRepulsion, calculateHookeAttraction, calculateBoundaryForces, applyShockwaves]);

  // Animation loop
  useEffect(() => {
    let animationId;
    let lastTime = performance.now();

    const animate = (currentTime) => {
      if (!physicsState.current.running) return;

      const deltaTime = currentTime - lastTime;
      if (deltaTime >= 16) { // Cap at ~60fps
        lastTime = currentTime;
        simulationStep();
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [simulationStep]);

  // Trigger shockwave
  const triggerShockwave = useCallback((x, y, force = 1000) => {
    physicsState.current.shockwaves.push({
      x,
      y,
      force,
      age: 0,
    });
  }, []);

  // Get current node positions
  const getNodes = useCallback(() => {
    return physicsState.current.nodes.map(n => ({
      id: n.id,
      x: n.x,
      y: n.y,
      stress: n.stress,
      type: n.type,
      label: n.label,
      vx: n.vx,
      vy: n.vy,
    }));
  }, []);

  // Get edges
  const getEdges = useCallback(() => {
    return physicsState.current.edges;
  }, []);

  return {
    nodes: getNodes(),
    edges: getEdges(),
    stats,
    triggerShockwave,
    physicsState: physicsState.current,
  };
};

/**
 * ============================================
 * SUPPLY CHAIN GRAPH COMPONENT
 * ============================================
 */
const SupplyChainGraph = () => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 700 });
  const [selectedNode, setSelectedNode] = useState(null);
  const [draggingNode, setDraggingNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Initialize physics engine
  const { nodes, edges, stats, triggerShockwave, physicsState } = usePhysicsEngine(
    INITIAL_NODES,
    INITIAL_EDGES,
    dimensions.width,
    dimensions.height
  );

  // Handle container resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({ width: clientWidth, height: clientHeight });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Handle node interaction
  const handleNodeMouseDown = useCallback((e, node) => {
    e.stopPropagation();
    setSelectedNode(node);
    setDraggingNode(node);
    setDragOffset({
      x: e.clientX - node.x,
      y: e.clientY - node.y,
    });
  }, []);

  // Handle mouse move for dragging
  const handleMouseMove = useCallback((e) => {
    if (draggingNode) {
      const rect = containerRef.current.getBoundingClientRect();
      const newX = e.clientX - rect.left - dragOffset.x;
      const newY = e.clientY - rect.top - dragOffset.y;
      
      // Update node position directly
      const nodeIndex = physicsState.nodes.findIndex(n => n.id === draggingNode.id);
      if (nodeIndex !== -1) {
        physicsState.nodes[nodeIndex].x = newX;
        physicsState.nodes[nodeIndex].y = newY;
        physicsState.nodes[nodeIndex].vx = 0;
        physicsState.nodes[nodeIndex].vy = 0;
      }

      // Trigger shockwave on drag
      triggerShockwave(newX, newY, 500);
    }
  }, [draggingNode, dragOffset, triggerShockwave, physicsState]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    if (draggingNode) {
      // Final shockwave on release
      triggerShockwave(draggingNode.x, draggingNode.y, 2000);
      setDraggingNode(null);
    }
  }, [draggingNode, triggerShockwave]);

  // Handle background click (clear selection)
  const handleBackgroundClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      setSelectedNode(null);
      // Trigger ambient shockwave
      const rect = containerRef.current.getBoundingClientRect();
      triggerShockwave(e.clientX - rect.left, e.clientY - rect.top, 800);
    }
  }, [triggerShockwave]);

  // Memoized node positions for smooth rendering
  const memoizedNodes = useMemo(() => nodes, [nodes]);
  const memoizedEdges = useMemo(() => edges, [edges]);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>🧠 Neural Supply Chain Graph</h2>
        <p style={styles.subtitle}>Real-time physics simulation of supply chain network</p>
      </div>

      <div style={styles.content}>
        {/* Main Graph Area */}
        <div 
          ref={containerRef}
          style={styles.graphContainer}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleBackgroundClick}
        >
          <svg width={dimensions.width} height={dimensions.height} style={styles.svg}>
            {/* Grid Background */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="pulseGlow">
                <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Edges */}
            {memoizedEdges.map((edge, i) => {
              const source = memoizedNodes.find(n => n.id === edge.source);
              const target = memoizedNodes.find(n => n.id === edge.target);
              if (!source || !target) return null;

              const isTensionHigh = Math.abs(source.x - target.x) > SPRING_LENGTH * 1.5;

              return (
                <line
                  key={`edge-${edge.id || i}`}
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={isTensionHigh ? "#f97316" : "#475569"}
                  strokeWidth={isTensionHigh ? 3 : 1.5}
                  strokeOpacity={isTensionHigh ? 1 : 0.6}
                  style={{
                    transition: 'stroke 0.3s, stroke-width 0.3s',
                  }}
                />
              );
            })}

            {/* Nodes */}
            {memoizedNodes.map((node) => {
              const nodeType = NODE_TYPES[node.type];
              const isHighStress = node.stress > STRESS_THRESHOLD;
              const isSelected = selectedNode?.id === node.id;

              return (
                <g 
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onMouseDown={(e) => handleNodeMouseDown(e, node)}
                  style={{ cursor: 'grab' }}
                >
                  {/* Outer glow for high stress nodes */}
                  {isHighStress && (
                    <circle
                      r="35"
                      fill={nodeType.stressColor}
                      opacity="0.3"
                      style={{
                        animation: 'pulse 1.5s ease-in-out infinite',
                      }}
                    />
                  )}

                  {/* Main node circle */}
                  <circle
                    r={isSelected ? 22 : 18}
                    fill={isHighStress ? nodeType.stressColor : nodeType.color}
                    filter={isHighStress ? "url(#pulseGlow)" : (isSelected ? "url(#glow)" : null)}
                    stroke={isSelected ? "#fff" : "#1e293b"}
                    strokeWidth={isSelected ? 3 : 2}
                    style={{
                      transition: 'r 0.2s, fill 0.3s',
                      filter: isHighStress ? `drop-shadow(0 0 ${10 + node.stress * 10}px ${nodeType.stressColor})` : undefined,
                    }}
                  />

                  {/* Velocity indicator */}
                  {(Math.abs(node.vx) > 0.5 || Math.abs(node.vy) > 0.5) && (
                    <line
                      x1={0}
                      y1={0}
                      x2={node.vx * 3}
                      y2={node.vy * 3}
                      stroke="#fff"
                      strokeWidth={2}
                      opacity={0.8}
                    />
                  )}

                  {/* Label */}
                  <text
                    y={35}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="11"
                    fontFamily="monospace"
                    style={{ pointerEvents: 'none' }}
                  >
                    {node.label}
                  </text>

                  {/* Stress indicator */}
                  <text
                    y={48}
                    textAnchor="middle"
                    fill={isHighStress ? nodeType.stressColor : nodeType.color}
                    fontSize="9"
                    fontFamily="monospace"
                    style={{ pointerEvents: 'none' }}
                  >
                    STRESS: {(node.stress * 100).toFixed(0)}%
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Node Type Legend */}
          <div style={styles.legend}>
            {Object.entries(NODE_TYPES).map(([key, value]) => (
              <div key={key} style={styles.legendItem}>
                <div style={{ ...styles.legendColor, background: value.color }} />
                <span style={styles.legendLabel}>{value.label}</span>
              </div>
            ))}
            <div style={styles.legendItem}>
              <div style={{ ...styles.legendColor, background: '#ef4444', animation: 'pulse 1.5s infinite' }} />
              <span style={styles.legendLabel}>High Stress</span>
            </div>
          </div>
        </div>

        {/* Real-Time Physics Stats Panel */}
        <div style={styles.statsPanel}>
          <h3 style={styles.statsTitle}>📊 Real-Time Physics Stats</h3>
          
          <div style={styles.statItem}>
            <span style={styles.statLabel}>System Kinetic Energy</span>
            <div style={styles.statBar}>
              <div 
                style={{ 
                  ...styles.statFill, 
                  width: `${Math.min(stats.kineticEnergy / 50, 100)}%`,
                  background: stats.kineticEnergy > 100 ? '#ef4444' : '#3b82f6'
                }} 
              />
            </div>
            <span style={styles.statValue}>{stats.kineticEnergy.toFixed(2)} J</span>
          </div>

          <div style={styles.statItem}>
            <span style={styles.statLabel}>Network Tension</span>
            <div style={styles.statBar}>
              <div 
                style={{ 
                  ...styles.statFill, 
                  width: `${Math.min(stats.tension / 10, 100)}%`,
                  background: stats.tension > 5 ? '#f97316' : '#a855f7'
                }} 
              />
            </div>
            <span style={styles.statValue}>{stats.tension.toFixed(2)} N</span>
          </div>

          <div style={styles.statItem}>
            <span style={styles.statLabel}>Network Entropy</span>
            <div style={styles.statBar}>
              <div 
                style={{ 
                  ...styles.statFill, 
                  width: `${Math.min(Math.abs(stats.networkEntropy) * 20, 100)}%`,
                  background: '#14b8a6'
                }} 
              />
            </div>
            <span style={styles.statValue}>{stats.networkEntropy.toFixed(3)}</span>
          </div>

          <div style={styles.statsDivider} />

          <div style={styles.statsInfo}>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Active Nodes</span>
              <span style={styles.infoValue}>{nodes.length}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Active Edges</span>
              <span style={styles.infoValue}>{edges.length}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Shockwaves</span>
              <span style={styles.infoValue}>{physicsState.shockwaves.length}</span>
            </div>
          </div>

          <div style={styles.controls}>
            <button 
              style={styles.button}
              onClick={() => {
                // Reset physics
                physicsState.nodes.forEach((node, i) => {
                  node.x = INITIAL_NODES[i].x;
                  node.y = INITIAL_NODES[i].y;
                  node.vx = 0;
                  node.vy = 0;
                });
                physicsState.shockwaves = [];
              }}
            >
              🔄 Reset Network
            </button>
            <button 
              style={styles.button}
              onClick={() => {
                // Randomize stresses
                physicsState.nodes.forEach(node => {
                  node.stress = Math.random();
                  node.mass = 1 + node.stress * 0.5;
                });
              }}
            >
              🎲 Randomize Stress
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div style={styles.instructions}>
        <span style={styles.instructionIcon}>💡</span>
        <span style={styles.instructionText}>
          Drag nodes to create shockwaves • Click empty space for ambient shock • High stress nodes pulse red
        </span>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

/**
 * ============================================
 * STYLES - Dark Mode AI Command Center
 * ============================================
 */
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    color: '#e2e8f0',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  header: {
    padding: '20px 24px',
    borderBottom: '1px solid #334155',
    background: 'rgba(15, 23, 42, 0.8)',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '600',
    color: '#f1f5f9',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    margin: '4px 0 0',
    fontSize: '14px',
    color: '#64748b',
  },
  content: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  graphContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    background: '#0b1120',
  },
  svg: {
    display: 'block',
  },
  legend: {
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '12px 16px',
    background: 'rgba(15, 23, 42, 0.9)',
    borderRadius: '8px',
    border: '1px solid #334155',
    backdropFilter: 'blur(8px)',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  legendColor: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
  },
  legendLabel: {
    fontSize: '12px',
    color: '#94a3b8',
  },
  statsPanel: {
    width: '280px',
    padding: '20px',
    background: 'rgba(15, 23, 42, 0.95)',
    borderLeft: '1px solid #334155',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    overflowY: 'auto',
  },
  statsTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#f1f5f9',
    paddingBottom: '12px',
    borderBottom: '1px solid #334155',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  statLabel: {
    fontSize: '12px',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statBar: {
    height: '6px',
    background: '#1e293b',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  statFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  statValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#e2e8f0',
    fontFamily: 'monospace',
  },
  statsDivider: {
    height: '1px',
    background: '#334155',
    margin: '8px 0',
  },
  statsInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: '13px',
    color: '#94a3b8',
  },
  infoValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#3b82f6',
    fontFamily: 'monospace',
  },
  controls: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: 'auto',
  },
  button: {
    padding: '10px 16px',
    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  instructions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: 'rgba(15, 23, 42, 0.8)',
    borderTop: '1px solid #334155',
  },
  instructionIcon: {
    fontSize: '16px',
  },
  instructionText: {
    fontSize: '13px',
    color: '#64748b',
  },
};

export default SupplyChainGraph;
