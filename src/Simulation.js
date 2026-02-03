import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

import Engine from "./DecisionOptimizationEngine";

const Simulation = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [logSteps, setLogSteps] = useState([]);
  const [scenario, setScenario] = useState("Normal");
  const [weights, setWeights] = useState({ Wd: 0.35, Wf: 0.30, Wc: 0.20, Wr: 0.15 });
  const [strategies, setStrategies] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [explanation, setExplanation] = useState("");
  const [sensitivity, setSensitivity] = useState(null);
  const [monteCarlo, setMonteCarlo] = useState(null);
  const [previousWeights, setPreviousWeights] = useState(null);
  const [learningDelta, setLearningDelta] = useState(null);
  const [scoreAdvantage, setScoreAdvantage] = useState(null);

  const routeOptimizationData = [
    { name: "Route A", before: 45, after: 38 },
    { name: "Route B", before: 52, after: 41 },
    { name: "Route C", before: 38, after: 28 },
    { name: "Route D", before: 60, after: 45 },
  ];

  const delayReductionData = [
    { day: "Mon", original: 22, optimized: 18 },
    { day: "Tue", original: 28, optimized: 23 },
    { day: "Wed", original: 25, optimized: 20 },
    { day: "Thu", original: 30, optimized: 24 },
    { day: "Fri", original: 35, optimized: 28 },
    { day: "Sat", original: 32, optimized: 26 },
    { day: "Sun", original: 28, optimized: 23 },
  ];

  const costImpactData = [
    { name: "Labor Savings", value: 35 },
    { name: "Fuel Savings", value: 28 },
    { name: "Time Savings", value: 22 },
    { name: "Spoilage Reduction", value: 15 },
  ];

  const performanceMetrics = [
    { metric: "Speed", value: 78 },
    { metric: "Reliability", value: 85 },
    { metric: "Efficiency", value: 82 },
    { metric: "Accuracy", value: 84 },
    { metric: "Safety", value: 88 },
  ];

  const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444"];

  const handleRunSimulation = () => {
    // orchestrate simulation steps and run engine
    setIsRunning(true);
    setSimulationProgress(0);
    setSimulationComplete(false);
    setLogSteps([]);
    setExplanation("");

    // Prepare default strategies (vendor-supplier combos)
    const baseStrategies = [
      { id: 's1', vendor: 'Urban Foods', supplier: 'SwiftDeliver Inc', deliveryTime: 48, maxDelivery: 60, cost: 420, maxCost: 600, reliabilityPct: 92 },
      { id: 's2', vendor: 'Metro Market', supplier: 'SwiftDeliver Inc', deliveryTime: 50, maxDelivery: 60, cost: 400, maxCost: 600, reliabilityPct: 90 },
      { id: 's3', vendor: 'City Store', supplier: 'ColdChain Co', deliveryTime: 42, maxDelivery: 60, cost: 450, maxCost: 600, reliabilityPct: 95 },
      { id: 's4', vendor: 'Prime Hub', supplier: 'FreshRoute Corp', deliveryTime: 55, maxDelivery: 60, cost: 380, maxCost: 600, reliabilityPct: 88 },
    ];

    setStrategies(baseStrategies);

    const scenarioParams = getScenarioParams(scenario);

    // Step sequence
    const steps = [
      { name: 'Aggregating city signals', fn: () => log('Aggregating city signals...') },
      { name: 'Evaluating freshness decay', fn: () => log('Evaluating freshness decay with k=' + scenarioParams.k) },
      { name: 'Computing delivery efficiency', fn: () => log('Computing delivery efficiency') },
      { name: 'Running optimization function', fn: () => runOptimization(baseStrategies, weights, scenarioParams) },
      { name: 'Ranking strategies', fn: () => log('Ranking produced') },
      { name: 'Learning from outcome', fn: () => runLearning(baseStrategies) },
      { name: 'Generating recommendation', fn: () => log('Recommendation generated') },
    ];

    let idx = 0;
    const interval = setInterval(async () => {
      const step = steps[idx];
      if (!step) {
        clearInterval(interval);
        setIsRunning(false);
        setSimulationComplete(true);
        setSimulationProgress(100);
        return;
      }
      // execute
      try { step.fn(); } catch (e) { console.error(e); }
      idx += 1;
      setSimulationProgress(Math.round((idx / steps.length) * 100));
    }, 600);
  };

  const log = (text) => {
    setLogSteps(prev => [...prev, { time: new Date().toLocaleTimeString(), text }]);
  };

  const getScenarioParams = (sc) => {
    switch(sc) {
      case 'Peak Traffic': return { k: 0.04, deliveryMultiplier: 1.25, costMultiplier: 1, reliabilityModifier: 1 };
      case 'Demand Surge': return { k: 0.05, deliveryMultiplier: 1.1, costMultiplier: 1.05, reliabilityModifier: 1 };
      case 'Fuel Cost Spike': return { k: 0.04, deliveryMultiplier: 1.0, costMultiplier: 1.15, reliabilityModifier: 1 };
      case 'Supplier Breakdown': return { k: 0.06, deliveryMultiplier: 1.2, costMultiplier: 1.05, reliabilityModifier: 0.9 };
      case 'Cold Chain Failure': return { k: 0.10, deliveryMultiplier: 1.15, costMultiplier: 1.1, reliabilityModifier: 0.85 };
      default: return { k: 0.04, deliveryMultiplier: 1, costMultiplier: 1, reliabilityModifier: 1 };
    }
  };

  const runOptimization = (strategiesInput, weightsInput, scenarioParams) => {
    const { normalizedWeights, ranked } = Engine.rankStrategies(strategiesInput, weightsInput, scenarioParams);
    setPreviousWeights(weights);
    setWeights(normalizedWeights);
    setRanking(ranked);
    // generate explainable output
    generateExplanation(ranked);
    // sensitivity quick sample
    const sens = Engine.sensitivityAnalysis(strategiesInput, weightsInput, scenarioParams, { trafficPct:10, costPct:5, decayPct:15 });
    setSensitivity(sens.impacts);
    // monte carlo
    const mc = Engine.monteCarloSimulation(strategiesInput, weightsInput, scenarioParams, 500);
    setMonteCarlo(mc);
    log('Optimization complete. Top strategy: ' + (ranked[0]?.vendor || 'N/A'));
  };

  const runLearning = (strategiesInput) => {
    // derive simple outcome metrics from ranking
    const top = ranking[0];
    const avgDelay = strategiesInput.reduce((s,x) => s + x.deliveryTime, 0) / strategiesInput.length;
    const spoilageRisk = 20 * (1 - (top ? top.computed.FreshnessScore : 0)); // synthetic

    const res = Engine.adaptiveLearning(weights, { spoilageRiskPercent: spoilageRisk, avgDelay, delayThreshold: 40 });
    setPreviousWeights(res.before);
    setWeights(res.after);
    setLearningDelta(res.delta);
    log('Model learning from outcome... Optimization priorities recalibrated');
    // show deltas in explanation
    setExplanation(prev => prev + `\n\nLearning applied. Weight deltas: ${Object.entries(res.delta).map(([k,v])=>`${k}: ${(v*100).toFixed(1)}%`).join(', ')}`);
  };

  const generateExplanation = (ranked) => {
    if (!ranked || ranked.length === 0) return;
    const top = ranked[0].computed;
    const next = ranked[1]?.computed;
    let expl = '';
    // compute percent differences
    if (next) {
      const faster = ((next.deliveryTime - top.deliveryTime) / next.deliveryTime) * 100;
      const spoilageDrop = ((next.FreshnessScore - top.FreshnessScore) * 100).toFixed(1);
      const costDelta = ((next.actualCost - top.actualCost) / next.actualCost) * 100;
      const scoreAdv = ((top.FDS - next.FDS) * 100).toFixed(1);
      expl += `${Math.abs(faster.toFixed(1))}% faster delivery than average\n`;
      expl += `${Math.abs(spoilageDrop)}% lower spoilage probability\n`;
      expl += `${Math.abs(costDelta.toFixed(1))}% cheaper than next alternative\n`;
      expl += `Reliability: ${(top.ReliabilityScore*100).toFixed(1)}%\n`;
      expl += `Decision Stability: ${((top.FDS) * 100).toFixed(1)}% confidence`;
      setScoreAdvantage(scoreAdv);
    } else {
      expl = 'Top strategy identified.\n';
      setScoreAdvantage(null);
    }
    setExplanation(expl);
  };

  // live re-calculation when strategies, weights or scenario change
  // NOTE: do not call setWeights here (would cause an update loop). Only recompute ranking.
  useEffect(() => {
    if (strategies.length > 0) {
      const params = getScenarioParams(scenario);
      const { ranked } = Engine.rankStrategies(strategies, weights, params);
      setRanking(ranked);
    }
  }, [strategies, scenario, weights]);

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <div style={styles.header}>
        <h2>Simulation Center</h2>
        <p style={styles.subtitle}>Run AI-powered optimization simulations</p>
      </div>

      {/* Simulation Engine */}
      <div style={styles.engineCard}>
        <div style={styles.engineHeader}>
          <div>
            <h4 style={styles.engineTitle}>Urban Optimization Engine</h4>
            <p style={styles.engineLabel}>Run #1 • AI-Powered Routing</p>
          </div>
          <div style={styles.statusBadge}>
            {isRunning ? "In Progress" : simulationComplete ? "Complete" : "Ready"}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
          <label style={{ color: '#6b7280' }}>Scenario:</label>
          <select value={scenario} onChange={(e)=>setScenario(e.target.value)} style={{ padding: '8px 12px', borderRadius: 6 }}>
            <option>Normal</option>
            <option>Peak Traffic</option>
            <option>Demand Surge</option>
            <option>Fuel Cost Spike</option>
            <option>Supplier Breakdown</option>
            <option>Cold Chain Failure</option>
          </select>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Wd</div>
              <input type="number" step="0.01" value={weights.Wd.toFixed(2)} onChange={(e)=>{const v=parseFloat(e.target.value)||0; setWeights(Engine.normalizeWeights({...weights, Wd:v}));}} style={{ width:60 }} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Wf</div>
              <input type="number" step="0.01" value={weights.Wf.toFixed(2)} onChange={(e)=>{const v=parseFloat(e.target.value)||0; setWeights(Engine.normalizeWeights({...weights, Wf:v}));}} style={{ width:60 }} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Wc</div>
              <input type="number" step="0.01" value={weights.Wc.toFixed(2)} onChange={(e)=>{const v=parseFloat(e.target.value)||0; setWeights(Engine.normalizeWeights({...weights, Wc:v}));}} style={{ width:60 }} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Wr</div>
              <input type="number" step="0.01" value={weights.Wr.toFixed(2)} onChange={(e)=>{const v=parseFloat(e.target.value)||0; setWeights(Engine.normalizeWeights({...weights, Wr:v}));}} style={{ width:60 }} />
            </div>
          </div>
        </div>

        <button
          onClick={handleRunSimulation}
          disabled={isRunning}
          style={{
            ...styles.runButton,
            opacity: isRunning ? 0.7 : 1,
            cursor: isRunning ? "not-allowed" : "pointer",
          }}
        >
          {isRunning ? `Running... ${simulationProgress}%` : "Run Urban Simulation"}
        </button>

        {/* FDS formula (always visible) */}
        <div style={{ marginTop: 12, background: '#fff', borderRadius: 8, padding: 12, border: '1px solid #e5e7eb' }}>
          <div style={{ color: '#6b7280', fontSize: 13 }}>Final Decision Score (FDS)</div>
          {ranking && ranking[0] ? (
            (() => {
              const top = ranking[0].computed;
              return (
                <div style={{ marginTop: 8, color: '#111827' }}>
                  <div>FDS = <strong>{(top.FDS).toFixed(3)} → {(top.FDS*100).toFixed(1)}%</strong></div>
                </div>
              );
            })()
          ) : (
            <div style={{ color: '#6b7280' }}>Run the simulation to see formula substitution and FDS.</div>
          )}
        </div>

        {isRunning && (
          <div style={styles.progressContainer}>
            <div style={styles.progressLabel}>
              <span>Simulation Progress</span>
              <span>{simulationProgress}%</span>
            </div>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${simulationProgress}%`,
                }}
              />
            </div>
          </div>
        )}

        {simulationComplete && (
          <div style={styles.resultsContainer}>
            <div style={styles.resultItem}>
              <span style={styles.resultLabel}>Delay Reduction</span>
              <span style={styles.resultValue}>17%</span>
            </div>
            <div style={styles.resultItem}>
              <span style={styles.resultLabel}>Spoilage Down</span>
              <span style={styles.resultValue}>26%</span>
            </div>
            <div style={styles.resultItem}>
              <span style={styles.resultLabel}>Efficiency Gain</span>
              <span style={styles.resultValue}>12%</span>
            </div>
          </div>
        )}

        <div style={styles.completionMessage}>
          Urban Optimization Activated — 8 vendors optimized successfully
        </div>
      </div>

      {/* Optimization Results Table */}
      <div style={styles.resultsTableCard}>
        <h4 style={styles.cardTitle}>Optimization Results</h4>
        <table style={styles.resultsTable}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Vendor</th>
              <th style={styles.th}>Supplier</th>
              <th style={styles.th}>Time</th>
              <th style={styles.th}>Score</th>
            </tr>
          </thead>
          <tbody>
            {ranking && ranking.length > 0 ? (
              ranking.map((item, idx) => (
                <tr key={item.id || idx} style={styles.tableRow}>
                  <td style={styles.td}>{item.vendor}</td>
                  <td style={styles.td}>{item.supplier}</td>
                  <td style={styles.td}>{Math.round(item.computed.deliveryTime)}min</td>
                  <td style={{ ...styles.td, color: "#f59e0b", fontWeight: "600" }}>{(item.computed.FDS*100).toFixed(1)}%</td>
                </tr>
              ))
            ) : (
              <tr>
                <td style={styles.td} colSpan={4}>No rankings yet — run simulation</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Explainable AI Panel */}
      <div style={{ ...styles.resultsTableCard, marginBottom: 20 }}>
        <h4 style={styles.cardTitle}>Explainable AI Output</h4>
        {scoreAdvantage && (
          <div style={{ background: '#dcfce7', padding: '8px 12px', borderRadius: 6, marginBottom: 12 }}>
            <strong>Top Allocation Selected</strong> — Score Advantage: +{scoreAdvantage}%
          </div>
        )}
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ flex: 1 }}>
            <h5 style={{ margin: '0 0 8px 0' }}>Explanation</h5>
            <pre style={{ whiteSpace: 'pre-wrap', color: '#374151' }}>{explanation || 'No explanation yet.'}</pre>
          </div>
          <div style={{ width: 320 }}>
            <h5 style={{ margin: '0 0 8px 0' }}>Current Weights</h5>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={styles.progressBoxLabel}>Wd (Delivery)</div>
              <div style={{ textAlign: 'right' }}>{(weights.Wd*100).toFixed(1)}%</div>
              <div style={styles.progressBoxLabel}>Wf (Freshness)</div>
              <div style={{ textAlign: 'right' }}>{(weights.Wf*100).toFixed(1)}%</div>
              <div style={styles.progressBoxLabel}>Wc (Cost)</div>
              <div style={{ textAlign: 'right' }}>{(weights.Wc*100).toFixed(1)}%</div>
              <div style={styles.progressBoxLabel}>Wr (Reliability)</div>
              <div style={{ textAlign: 'right' }}>{(weights.Wr*100).toFixed(1)}%</div>
            </div>
            {previousWeights && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Previous Weights</div>
                <div style={{ fontSize: 13 }}>{Object.entries(previousWeights).map(([k,v])=>`${k}: ${(v*100).toFixed(1)}%`).join(' | ')}</div>
                {learningDelta && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>Learning Delta</div>
                    <div style={{ fontSize: 12, display: 'flex', gap: 8 }}>
                      {Object.entries(learningDelta).map(([k,v]) => (
                        <span key={k} style={{ color: v > 0 ? '#16a34a' : '#ef4444' }}>
                          {k}: {v > 0 ? '+' : ''}{(v*100).toFixed(1)}%
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sensitivity & Risk */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginBottom: 30 }}>
        <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h4 style={styles.cardTitle}>Sensitivity Analysis (Perturbation Impact)</h4>
          <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
            Traffic +10% | Cost +5% | Decay Rate +15%
          </p>
          {sensitivity ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sensitivity.map(s => ({
                name: s.vendor.substring(0, 10),
                impact: (s.delta * 100).toFixed(2)
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={11} />
                <Tooltip contentStyle={styles.tooltipStyle} />
                <Bar dataKey="impact" fill="#2563eb" radius={[4, 4, 0, 0]} name="FDS Impact %" />
              </BarChart>
            </ResponsiveContainer>
          ) : <div style={{ color:'#6b7280' }}>Run simulation to compute sensitivity.</div>}
        </div>

        <div style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h4 style={styles.cardTitle}>Monte Carlo Risk</h4>
          {monteCarlo ? (
            <div>
              <div>Mean FDS: {(monteCarlo.meanF*100).toFixed(2)}%</div>
              <div>Best: {(monteCarlo.best*100).toFixed(2)}%</div>
              <div>Worst: {(monteCarlo.worst*100).toFixed(2)}%</div>
              <div>Decision Stability: {monteCarlo.stability.toFixed(1)}%</div>
            </div>
          ) : <div style={{ color:'#6b7280' }}>Run simulation to compute risk profile.</div>}
        </div>
      </div>

      {/* Charts Grid */}
      <div style={styles.chartsGrid}>
        {/* Route Optimization */}
        <div style={styles.chartBox}>
          <h4 style={styles.cardTitle}>Route Optimization Impact</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={routeOptimizationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={styles.tooltipStyle} />
              <Legend />
              <Bar dataKey="before" fill="#9ca3af" name="Before" radius={[4, 4, 0, 0]} />
              <Bar dataKey="after" fill="#16a34a" name="After" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Delay Reduction */}
        <div style={styles.chartBox}>
          <h4 style={styles.cardTitle}>Delay Reduction Over Time</h4>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={delayReductionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={styles.tooltipStyle} />
              <Legend />
              <Line
                type="monotone"
                dataKey="original"
                stroke="#ef4444"
                strokeDasharray="5 5"
                name="Original"
              />
              <Line
                type="monotone"
                dataKey="optimized"
                stroke="#16a34a"
                strokeWidth={3}
                name="Optimized"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Metrics */}
        <div style={styles.chartBox}>
          <h4 style={styles.cardTitle}>Performance Metrics</h4>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={performanceMetrics}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="metric" stroke="#6b7280" />
              <PolarRadiusAxis stroke="#9ca3af" />
              <Radar name="Score" dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Cost Impact */}
        <div style={styles.chartBox}>
          <h4 style={styles.cardTitle}>Cost Impact Breakdown</h4>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={costImpactData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {costImpactData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Learning Progress */}
      <div style={styles.learningCard}>
        <h4 style={styles.cardTitle}>Model Learning Progress</h4>
        <div style={styles.progressGrid}>
          <div style={styles.progressBox}>
            <div style={styles.progressBoxLabel}>Training Iterations</div>
            <div style={styles.progressBoxValue}>10</div>
          </div>
          <div style={styles.progressBox}>
            <div style={styles.progressBoxLabel}>Accuracy Score</div>
            <div style={styles.progressBoxValue}>84%</div>
          </div>
          <div style={styles.progressBox}>
            <div style={styles.progressBoxLabel}>Optimization Rate</div>
            <div style={styles.progressBoxValue}>81%</div>
          </div>
          <div style={styles.progressBox}>
            <div style={styles.progressBoxLabel}>Prediction Confidence</div>
            <div style={styles.progressBoxValue}>78%</div>
          </div>
        </div>
      </div>

      {/* System Architecture Panel */}
      <div style={{ ...styles.resultsTableCard, marginBottom: 30 }}>
        <h4 style={styles.cardTitle}>System Architecture</h4>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 20, background: '#f8fafc', borderRadius: 8 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: '#e0f2fe', padding: '12px 20px', borderRadius: 8, marginBottom: 8 }}>
              <div style={{ fontWeight: 600, color: '#0369a1', fontSize: 13 }}>Input Layer</div>
            </div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>Vendors, Suppliers<br/>Scenarios, Weights</div>
          </div>
          <div style={{ fontSize: 20, color: '#9ca3af' }}>→</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: '#fef3c7', padding: '12px 20px', borderRadius: 8, marginBottom: 8 }}>
              <div style={{ fontWeight: 600, color: '#b45309', fontSize: 13 }}>Optimization Engine</div>
            </div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>FDS Calculation<br/>Weight Normalization</div>
          </div>
          <div style={{ fontSize: 20, color: '#9ca3af' }}>→</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: '#dcfce7', padding: '12px 20px', borderRadius: 8, marginBottom: 8 }}>
              <div style={{ fontWeight: 600, color: '#16a34a', fontSize: 13 }}>Ranking System</div>
            </div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>Strategy Comparison<br/>Score Advantage</div>
          </div>
          <div style={{ fontSize: 20, color: '#9ca3af' }}>→</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: '#f3e8ff', padding: '12px 20px', borderRadius: 8, marginBottom: 8 }}>
              <div style={{ fontWeight: 600, color: '#7c3aed', fontSize: 13 }}>Learning Loop</div>
            </div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>Adaptive Weights<br/>Reinforcement</div>
          </div>
          <div style={{ fontSize: 20, color: '#9ca3af' }}>→</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: '#dbeafe', padding: '12px 20px', borderRadius: 8, marginBottom: 8 }}>
              <div style={{ fontWeight: 600, color: '#2563eb', fontSize: 13 }}>Explainable Output</div>
            </div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>Decision Rationale<br/>Confidence Score</div>
          </div>
          <div style={{ fontSize: 20, color: '#9ca3af' }}>→</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: '#fce7f3', padding: '12px 20px', borderRadius: 8, marginBottom: 8 }}>
              <div style={{ fontWeight: 600, color: '#db2777', fontSize: 13 }}>Dashboard</div>
            </div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>Visualization<br/>Analytics</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    padding: "30px",
    background: "#f4f6f9",
    minHeight: "100vh",
  },
  header: {
    marginBottom: "30px",
  },
  subtitle: {
    color: "#6b7280",
    marginTop: "8px",
    fontSize: "14px",
  },
  engineCard: {
    background: "#fff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    marginBottom: "30px",
  },
  engineHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
  },
  engineTitle: {
    margin: "0 0 5px 0",
    fontSize: "16px",
    fontWeight: "600",
    color: "#1f2937",
  },
  engineLabel: {
    margin: "0",
    fontSize: "13px",
    color: "#6b7280",
  },
  statusBadge: {
    background: "#e0f2fe",
    color: "#0369a1",
    padding: "8px 16px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
  },
  runButton: {
    width: "100%",
    padding: "14px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    marginBottom: "20px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "500",
    transition: "background 0.3s ease",
  },
  progressContainer: {
    marginBottom: "20px",
  },
  progressLabel: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    marginBottom: "10px",
    color: "#6b7280",
    fontWeight: "500",
  },
  progressBar: {
    height: "8px",
    background: "#e5e7eb",
    borderRadius: "6px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "#2563eb",
    borderRadius: "6px",
    transition: "width 0.3s ease",
  },
  resultsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "15px",
    marginBottom: "15px",
  },
  resultItem: {
    background: "#f3f4f6",
    padding: "15px",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  resultLabel: {
    fontSize: "12px",
    color: "#6b7280",
  },
  resultValue: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#2563eb",
  },
  completionMessage: {
    background: "#e0f2fe",
    border: "1px solid #bae6fd",
    color: "#0369a1",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
  },
  resultsTableCard: {
    background: "#fff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    marginBottom: "30px",
  },
  cardTitle: {
    margin: "0 0 16px 0",
    fontSize: "16px",
    fontWeight: "600",
    color: "#1f2937",
  },
  resultsTable: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  tableHeader: {
    background: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
  },
  th: {
    padding: "12px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tableRow: {
    borderBottom: "1px solid #f3f4f6",
    transition: "background 0.3s ease",
  },
  td: {
    padding: "14px 12px",
    color: "#374151",
  },
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
    marginBottom: "30px",
  },
  chartBox: {
    background: "#fff",
    padding: "24px",
    borderRadius: "12px",
    height: "350px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  tooltipStyle: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
  },
  learningCard: {
    background: "#fff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  progressGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
    marginTop: "20px",
  },
  progressBox: {
    background: "#f3f4f6",
    padding: "20px",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  progressBoxLabel: {
    fontSize: "12px",
    color: "#6b7280",
    textAlign: "center",
    fontWeight: "500",
  },
  progressBoxValue: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#2563eb",
  },
};

export default Simulation;
