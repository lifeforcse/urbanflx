import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

/**
 * ============================================
 * GENETIC ALGORITHM OPTIMIZATION ENGINE
 * ============================================
 */

const INITIAL_VENDORS = [
  { id: 1, name: "Fresh Mart", location: "Downtown", demand: 95, congestionLevel: 45, baseDelay: 12 },
  { id: 2, name: "Urban Foods", location: "North District", demand: 65, congestionLevel: 30, baseDelay: 8 },
  { id: 3, name: "Metro Market", location: "East Plaza", demand: 54, congestionLevel: 60, baseDelay: 15 },
  { id: 4, name: "City Store", location: "South Market", demand: 96, congestionLevel: 75, baseDelay: 18 },
  { id: 5, name: "Prime Hub", location: "West End", demand: 72, congestionLevel: 40, baseDelay: 10 },
  { id: 6, name: "Quick Center", location: "Central Hub", demand: 91, congestionLevel: 55, baseDelay: 14 },
];

const calculateFitness = (vendorOrder, vendors) => {
  let totalDelay = 0;
  let demandPriority = 0;
  
  vendorOrder.forEach((vendorId, index) => {
    const vendor = vendors.find(v => v.id === vendorId);
    if (vendor) {
      const positionDelay = vendor.baseDelay + (index * 2);
      const congestionMultiplier = 1 + (vendor.congestionLevel / 100);
      totalDelay += positionDelay * congestionMultiplier;
      demandPriority += vendor.demand;
    }
  });

  const fitness = (1 / (totalDelay + 1)) + (demandPriority * 0.01);
  return { fitness, totalDelay, demandPriority };
};

const generatePopulation = (vendors, populationSize = 50) => {
  const population = [];
  for (let i = 0; i < populationSize; i++) {
    const shuffled = [...vendors].sort(() => Math.random() - 0.5);
    population.push(shuffled.map(v => v.id));
  }
  return population;
};

const tournamentSelect = (population, vendors, tournamentSize = 5) => {
  const tournament = [];
  for (let i = 0; i < tournamentSize; i++) {
    const randomIndex = Math.floor(Math.random() * population.length);
    tournament.push(population[randomIndex]);
  }
  
  let best = tournament[0];
  let bestFitness = calculateFitness(best, vendors).fitness;
  
  tournament.forEach(individual => {
    const { fitness } = calculateFitness(individual, vendors);
    if (fitness > bestFitness) {
      best = individual;
      bestFitness = fitness;
    }
  });
  
  return best;
};

const crossover = (parent1, parent2) => {
  const start = Math.floor(Math.random() * parent1.length);
  const end = Math.floor(Math.random() * (parent1.length - start)) + start;
  
  const child = new Array(parent1.length).fill(null);
  
  for (let i = start; i <= end; i++) {
    child[i] = parent1[i];
  }
  
  let currentIndex = 0;
  for (let i = 0; i < parent1.length; i++) {
    if (i >= start && i <= end) continue;
    while (child.includes(parent2[currentIndex])) {
      currentIndex++;
    }
    child[i] = parent2[currentIndex];
    currentIndex++;
  }
  
  return child;
};

const mutate = (individual, mutationRate = 0.1) => {
  if (Math.random() < mutationRate) {
    const i = Math.floor(Math.random() * individual.length);
    const j = Math.floor(Math.random() * individual.length);
    [individual[i], individual[j]] = [individual[j], individual[i]];
  }
  return individual;
};

const runGeneticOptimization = (vendors, generations = 20, populationSize = 50) => {
  let population = generatePopulation(vendors, populationSize);
  const history = [];
  let bestSolution = population[0];
  let bestFitness = calculateFitness(bestSolution, vendors).fitness;

  for (let gen = 0; gen < generations; gen++) {
    const newPopulation = [];
    newPopulation.push(bestSolution);
    
    while (newPopulation.length < populationSize) {
      const parent1 = tournamentSelect(population, vendors);
      const parent2 = tournamentSelect(population, vendors);
      let child = crossover(parent1, parent2);
      child = mutate(child);
      newPopulation.push(child);
    }
    
    population = newPopulation;
    
    population.forEach(individual => {
      const { fitness } = calculateFitness(individual, vendors);
      if (fitness > bestFitness) {
        bestFitness = fitness;
        bestSolution = individual;
      }
    });
    
    history.push({ generation: gen + 1, fitness: bestFitness });
  }

  return { bestSolution, bestFitness, history };
};

/**
 * ============================================
 * SPARKLINE COMPONENT
 * ============================================
 */
const Sparkline = ({ data, color = "#2563eb" }) => {
  if (!data || data.length < 2) return null;
  
  const maxValue = Math.max(...data.map(d => d.fitness));
  const minValue = Math.min(...data.map(d => d.fitness));
  const range = maxValue - minValue || 1;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 30 - ((d.fitness - minValue) / range) * 25;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width="120" height="35" style={styles.sparkline}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
      />
      {data.map((d, i) => (
        <circle
          key={i}
          cx={(i / (data.length - 1)) * 100}
          cy={30 - ((d.fitness - minValue) / range) * 25}
          r={i === data.length - 1 ? 4 : 0}
          fill={color}
        />
      ))}
    </svg>
  );
};

/**
 * ============================================
 * DASHBOARD COMPONENT
 * ============================================
 */

const Dashboard = () => {
  /* ---------------- SEPARATE STATE ---------------- */
  
  const [deliveryData, setDeliveryData] = useState([
    { time: "08:00", value: 28 },
    { time: "09:00", value: 35 },
    { time: "10:00", value: 42 },
    { time: "11:00", value: 38 },
    { time: "12:00", value: 32 },
    { time: "13:00", value: 29 },
    { time: "14:00", value: 25 },
    { time: "15:00", value: 22 },
  ]);

  const [costData, setCostData] = useState([
    { category: "Fuel", value: 75 },
    { category: "Labor", value: 88 },
    { category: "Storage", value: 62 },
    { category: "Maintenance", value: 45 },
    { category: "Insurance", value: 38 },
    { category: "Other", value: 28 },
  ]);

  // Optimization state
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationComplete, setOptimizationComplete] = useState(false);
  const [fitnessHistory, setFitnessHistory] = useState([]);
  const [generation, setGeneration] = useState(0);
  const [efficiencyGain, setEfficiencyGain] = useState(0);
  const [delayReduction, setDelayReduction] = useState(0);
  const [optimizedVendors, setOptimizedVendors] = useState(INITIAL_VENDORS.map((v, i) => ({ ...v, rank: i + 1 })));

  /* ---------------- INDEPENDENT INTERVALS ---------------- */

  useEffect(() => {
    const deliveryInterval = setInterval(() => {
      setDeliveryData(prev => {
        const newData = [...prev.slice(1)];
        const lastValue = prev[prev.length - 1].value;
        const newValue = Math.max(15, Math.min(50, lastValue + (Math.random() - 0.5) * 15));
        
        const times = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
        const newTime = times[newData.length] || `${8 + newData.length}:00`;
        
        newData.push({ time: newTime, value: newValue });
        return newData;
      });
    }, 3000);

    return () => clearInterval(deliveryInterval);
  }, []);

  useEffect(() => {
    const costInterval = setInterval(() => {
      setCostData(prev => prev.map(item => ({
        ...item,
        value: Math.max(20, Math.min(100, item.value + (Math.random() - 0.5) * 20)),
      })));
    }, 5000);

    return () => clearInterval(costInterval);
  }, []);

  /* ---------------- GENETIC ALGORITHM ---------------- */

  const runOptimization = async () => {
    setIsOptimizing(true);
    setOptimizationComplete(false);
    setFitnessHistory([]);
    setGeneration(0);

    const vendorList = [...INITIAL_VENDORS];
    const initialOrder = vendorList.map(v => v.id);
    const initialStats = calculateFitness(initialOrder, vendorList);

    for (let gen = 0; gen < 20; gen++) {
      await new Promise(resolve => setTimeout(resolve, 150));
      setGeneration(gen + 1);
      
      const { bestSolution, bestFitness, history } = runGeneticOptimization(vendorList, 1, 30);
      
      setFitnessHistory(prev => [...prev, { generation: gen + 1, fitness: bestFitness }]);
      
      const optimizedOrder = bestSolution.map(id => {
        const vendor = vendorList.find(v => v.id === id);
        return vendor;
      });
      
      setOptimizedVendors(optimizedOrder.map((v, i) => ({ ...v, rank: i + 1 })));
    }

    const finalStats = calculateFitness(optimizedVendors.map(v => v.id), vendorList);
    const gainPercent = ((finalStats.fitness - initialStats.fitness) / initialStats.fitness) * 100;
    const delayPercent = ((initialStats.totalDelay - finalStats.totalDelay) / initialStats.totalDelay) * 100;

    setEfficiencyGain(Math.max(0, gainPercent));
    setDelayReduction(Math.max(0, delayPercent));
    setIsOptimizing(false);
    setOptimizationComplete(true);
  };

  /* ---------------- JSX ---------------- */

  return (
    <div style={styles.wrapper}>
      {/* TOP CARDS */}
      <div style={styles.cardGrid}>
        <div style={styles.card}>
          <p style={styles.cardTitle}>Active Vendors</p>
          <h2 style={{ ...styles.cardValue, color: "#3b82f6" }}>{INITIAL_VENDORS.length}</h2>
        </div>
        <div style={styles.card}>
          <p style={styles.cardTitle}>Active Suppliers</p>
          <h2 style={{ ...styles.cardValue, color: "#a855f7" }}>3</h2>
        </div>
        <div style={styles.card}>
          <p style={styles.cardTitle}>Avg Delivery Time</p>
          <h2 style={{ ...styles.cardValue, color: "#f59e0b" }}>36 min</h2>
        </div>
        <div style={styles.card}>
          <p style={styles.cardTitle}>Spoilage Risk</p>
          <h2 style={{ ...styles.cardValue, color: "#ef4444" }}>30%</h2>
        </div>
        <div style={styles.card}>
          <p style={styles.cardTitle}>AI Optimization</p>
          <h2 style={{
            ...styles.cardValue,
            color: optimizationComplete ? "#16a34a" : "#6b7280"
          }}>
            {optimizationComplete ? `${efficiencyGain.toFixed(1)}%` : "Standby"}
          </h2>
        </div>
        <div style={styles.card}>
          <p style={styles.cardTitle}>Cost Optimization</p>
          <h2 style={{ ...styles.cardValue, color: "#14b8a6" }}>77%</h2>
        </div>
      </div>

      {/* SEPARATE CHARTS */}
      <div style={styles.chartRow}>
        {/* Graph 1: Delivery Trends - AreaChart with smooth curve */}
        <div style={styles.chartBox}>
          <div style={styles.chartHeader}>
            <h4 style={styles.chartTitle}>📈 Delivery Trends (Live)</h4>
            <span style={styles.chartUpdate}>Updates every 3s</span>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={deliveryData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="deliveryGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={styles.tooltip}
                formatter={(value) => [`${value} min`, "Delivery Time"]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={3}
                fill="url(#deliveryGradient)"
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Graph 2: Cost Efficiency - BarChart with jagged data */}
        <div style={styles.chartBox}>
          <div style={styles.chartHeader}>
            <h4 style={styles.chartTitle}>💰 Cost Efficiency (Live)</h4>
            <span style={styles.chartUpdate}>Updates every 5s</span>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={costData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="category" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={styles.tooltip}
                formatter={(value) => [`${value}%`, "Efficiency"]}
              />
              <Bar
                dataKey="value"
                fill="#16a34a"
                radius={[4, 4, 0, 0]}
                animationDuration={500}
              >
                {costData.map((entry, index) => (
                  <rect
                    key={`bar-${index}`}
                    fill={entry.value > 80 ? "#16a34a" : entry.value > 60 ? "#f59e0b" : "#ef4444"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* OPTIMIZATION + TRAFFIC */}
      <div style={styles.middleRow}>
        <div style={styles.optimizationBox}>
          <h4 style={styles.boxTitle}>🧠 Urban Optimization Engine</h4>
          
          <div style={styles.simulationControls}>
            <button
              style={{
                ...styles.runButton,
                background: isOptimizing ? "#6b7280" : "#2563eb",
                cursor: isOptimizing ? "not-allowed" : "pointer",
              }}
              onClick={runOptimization}
              disabled={isOptimizing}
            >
              {isOptimizing ? `⏳ Running Generation ${generation}/20...` : "▶ Run Urban Simulation"}
            </button>
            
            {fitnessHistory.length > 0 && (
              <div style={styles.sparklineContainer}>
                <span style={styles.sparklineLabel}>Fitness Progress</span>
                <Sparkline data={fitnessHistory} color={isOptimizing ? "#f59e0b" : "#16a34a"} />
              </div>
            )}
          </div>

          <div style={styles.optimizationStats}>
            <div style={{
              ...styles.statBox,
              background: delayReduction > 0 ? "#d1fae5" : "#f3f4f6"
            }}>
              <span style={styles.statIcon}>⬇</span>
              <span style={styles.statText}>Delay Reduction</span>
              <span style={styles.statValue}>{delayReduction.toFixed(1)}%</span>
            </div>
            <div style={{ ...styles.statBox, background: "#e0f2fe" }}>
              <span style={styles.statIcon}>⬇</span>
              <span style={styles.statText}>Spoilage Down</span>
              <span style={styles.statValue}>20%</span>
            </div>
            <div style={{
              ...styles.statBox,
              background: efficiencyGain > 0 ? "#d1fae5" : "#fef3c7"
            }}>
              <span style={styles.statIcon}>⬆</span>
              <span style={styles.statText}>Efficiency Gain</span>
              <span style={styles.statValue}>{efficiencyGain.toFixed(1)}%</span>
            </div>
          </div>

          <div style={{
            ...styles.successBox,
            background: optimizationComplete ? "#dcfce7" : (isOptimizing ? "#fef3c7" : "#f3f4f6"),
          }}>
            {isOptimizing ? "🔄 Genetic Algorithm Running..." : 
             optimizationComplete ? "✅ Urban Optimization Complete — 6 vendors optimized" : 
             "⏸ Optimization Ready — Click Run to begin"}
          </div>
        </div>

        <div style={styles.trafficBox}>
          <h4 style={styles.boxTitle}>🚗 Traffic Status</h4>
          <div style={styles.progressBar}>
            <div style={{
              ...styles.progressFill,
              width: "34%",
              background: "#2563eb"
            }} />
          </div>
          <p style={styles.trafficLabel}>City Congestion: 34%</p>
          <div style={styles.trafficStats}>
            <div>
              <strong style={styles.trafficStatValue}>22</strong>
              <span style={styles.trafficStatLabel}>Avg Speed (km/h)</span>
            </div>
            <div>
              <strong style={styles.trafficStatValue}>3</strong>
              <span style={styles.trafficStatLabel}>Incidents</span>
            </div>
          </div>
        </div>
      </div>

      {/* VENDORS + ALERTS */}
      <div style={styles.bottomRow}>
        <div style={styles.vendorBox}>
          <h4 style={styles.boxTitle}>🚚 Active Vendors (AI Optimized)</h4>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Rank</th>
                <th style={styles.th}>Vendor</th>
                <th style={styles.th}>Location</th>
                <th style={styles.th}>Demand</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {optimizedVendors.map((vendor) => (
                <tr key={vendor.id} style={styles.tr}>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.rankBadge,
                      background: vendor.rank <= 3 ? "#dbeafe" : "#f3f4f6",
                      color: vendor.rank <= 3 ? "#1e40af" : "#6b7280",
                    }}>
                      #{vendor.rank}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.vendorName}>{vendor.name}</span>
                  </td>
                  <td style={styles.td}>{vendor.location}</td>
                  <td style={styles.td}>
                    <div style={styles.progressWrapper}>
                      <div
                        style={{
                          ...styles.progressFill,
                          width: `${vendor.demand}%`,
                          background: vendor.demand > 80 ? "#ef4444" : "#2563eb",
                        }}
                      />
                    </div>
                    <span style={styles.progressText}>{vendor.demand}%</span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.activeStatus}>● Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={styles.alertBox}>
          <h4 style={styles.boxTitle}>🔔 Live Alerts</h4>
          <div style={{
            ...styles.alertItem,
            background: optimizationComplete ? "#dcfce7" : "#f3f4f6",
            borderLeft: optimizationComplete ? "4px solid #16a34a" : "4px solid #6b7280",
          }}>
            <span>{optimizationComplete ? "✅" : "⏸"}</span>
            <span>{optimizationComplete ? "Optimization Complete" : "AI System Ready"}</span>
          </div>
          <div style={{ ...styles.alertItem, background: "#e0f2fe", borderLeft: "4px solid #2563eb" }}>
            <span>⏱</span>
            <span>Delivery Window Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------- STYLES ---------------- */

const styles = {
  wrapper: {
    padding: "30px",
    background: "#f4f6f9",
    minHeight: "100vh",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    gap: "16px",
    marginBottom: "24px",
  },
  card: {
    background: "#fff",
    padding: "16px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  cardTitle: {
    color: "#6b7280",
    fontSize: "12px",
    margin: "0 0 8px",
  },
  cardValue: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "700",
  },
  chartRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "24px",
  },
  chartBox: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    height: "320px",
  },
  chartHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  chartTitle: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "600",
    color: "#374151",
  },
  chartUpdate: {
    fontSize: "11px",
    color: "#94a3b8",
    background: "#f3f4f6",
    padding: "2px 8px",
    borderRadius: "4px",
  },
  tooltip: {
    background: "#1e293b",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "12px",
  },
  middleRow: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "20px",
    marginBottom: "24px",
  },
  optimizationBox: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
  },
  boxTitle: {
    margin: "0 0 16px",
    fontSize: "15px",
    fontWeight: "600",
    color: "#1e293b",
  },
  simulationControls: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
    marginBottom: "16px",
  },
  runButton: {
    padding: "14px 20px",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all 0.2s",
  },
  sparklineContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  sparklineLabel: {
    fontSize: "11px",
    color: "#64748b",
  },
  sparkline: {
    display: "block",
  },
  optimizationStats: {
    display: "flex",
    gap: "12px",
    marginBottom: "15px",
  },
  statBox: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: "6px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  statIcon: {
    fontSize: "12px",
  },
  statText: {
    fontSize: "11px",
    color: "#6b7280",
  },
  statValue: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1e293b",
  },
  successBox: {
    padding: "10px 12px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#374151",
  },
  trafficBox: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
  },
  progressBar: {
    height: "10px",
    background: "#e5e7eb",
    borderRadius: "6px",
    marginBottom: "10px",
  },
  progressFill: {
    height: "100%",
    borderRadius: "6px",
    transition: "width 0.3s ease",
  },
  trafficLabel: {
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "16px",
  },
  trafficStats: {
    display: "flex",
    justifyContent: "space-between",
  },
  trafficStatValue: {
    display: "block",
    fontSize: "20px",
    fontWeight: "700",
    color: "#1e293b",
  },
  trafficStatLabel: {
    fontSize: "11px",
    color: "#64748b",
  },
  bottomRow: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "20px",
  },
  vendorBox: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "10px 8px",
    borderBottom: "2px solid #e5e7eb",
    color: "#6b7280",
    fontWeight: "600",
    fontSize: "11px",
    textTransform: "uppercase",
  },
  tr: {
    borderBottom: "1px solid #f3f4f6",
  },
  td: {
    padding: "10px 8px",
    fontSize: "13px",
    color: "#374151",
  },
  rankBadge: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "10px",
    fontSize: "11px",
    fontWeight: "600",
  },
  vendorName: {
    fontWeight: "600",
    color: "#1e293b",
  },
  progressWrapper: {
    width: "80px",
    height: "6px",
    background: "#e5e7eb",
    borderRadius: "3px",
    display: "inline-block",
    verticalAlign: "middle",
    marginRight: "6px",
  },
  progressText: {
    fontSize: "11px",
    color: "#64748b",
  },
  activeStatus: {
    color: "#16a34a",
    fontWeight: "600",
    fontSize: "12px",
  },
  alertBox: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
  },
  alertItem: {
    padding: "10px 12px",
    borderRadius: "6px",
    marginBottom: "8px",
    fontSize: "13px",
    color: "#374151",
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
};

export default Dashboard;
