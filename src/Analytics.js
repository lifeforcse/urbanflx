import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ReferenceLine,
} from "recharts";

/**
 * ============================================
 * MATH ENGINE: LINEAR REGRESSION CLASS
 * ============================================
 */
class LinearRegression {
  constructor() {
    this.slope = 0;
    this.intercept = 0;
    this.rSquared = 0;
    this.isValid = false;
  }

  // Least Squares method to calculate slope (m) and intercept (b)
  fit(data) {
    if (!data || data.length < 2) {
      this.isValid = false;
      return this;
    }

    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

    data.forEach(point => {
      sumX += point.x;
      sumY += point.y;
      sumXY += point.x * point.y;
      sumX2 += point.x * point.x;
      sumY2 += point.y * point.y;
    });

    // Calculate slope (m) and intercept (b)
    const denominator = n * sumX2 - sumX * sumX;
    if (denominator === 0) {
      this.isValid = false;
      return this;
    }

    this.slope = (n * sumXY - sumX * sumY) / denominator;
    this.intercept = (sumY - this.slope * sumX) / n;

    // Calculate R-Squared (Confidence Score)
    const meanY = sumY / n;
    let ssTotal = 0, ssResidual = 0;

    data.forEach(point => {
      const predictedY = this.predict(point.x);
      ssTotal += Math.pow(point.y - meanY, 2);
      ssResidual += Math.pow(point.y - predictedY, 2);
    });

    this.rSquared = ssTotal === 0 ? 0 : 1 - (ssResidual / ssTotal);
    this.isValid = true;

    return this;
  }

  // Prediction function: y = mx + b
  predict(x) {
    return this.slope * x + this.intercept;
  }

  // Generate predicted points for charting
  generateTrendline(data, futurePoints = 5) {
    if (!this.isValid) return [];

    const trendline = [];
    const maxX = Math.max(...data.map(d => d.x));
    const minX = Math.min(...data.map(d => d.x));

    // Historical points
    data.forEach(point => {
      trendline.push({
        x: point.x,
        y: this.predict(point.x),
        type: 'historical',
      });
    });

    // Future predictions
    for (let i = 1; i <= futurePoints; i++) {
      trendline.push({
        x: maxX + i,
        y: this.predict(maxX + i),
        type: 'predicted',
      });
    }

    return trendline;
  }
}

/**
 * ============================================
 * MATH ENGINE: ANOMALY DETECTOR (Z-Score)
 * ============================================
 */
const AnomalyDetector = {
  // Calculate Mean
  calculateMean(data) {
    if (!data || data.length === 0) return 0;
    return data.reduce((sum, val) => sum + val, 0) / data.length;
  },

  // Calculate Standard Deviation
  calculateStdDev(data, mean) {
    if (!data || data.length < 2) return 0;
    const squaredDiffs = data.map(val => Math.pow(val - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / data.length;
    return Math.sqrt(avgSquaredDiff);
  },

  // Detect anomalies using Z-Score
  detect(data) {
    if (!data || data.length < 2) return { anomalies: [], mean: 0, stdDev: 0 };

    const values = data.map(d => d.y);
    const mean = this.calculateMean(values);
    const stdDev = this.calculateStdDev(values, mean);

    const anomalies = data.map((point, index) => {
      const zScore = stdDev === 0 ? 0 : (point.y - mean) / stdDev;
      return {
        ...point,
        zScore,
        isAnomaly: Math.abs(zScore) > 2.0,
        index,
      };
    });

    return { anomalies, mean, stdDev };
  },

  // Get anomaly alerts
  getAlerts(anomalies) {
    return anomalies
      .filter(a => a.isAnomaly)
      .map(a => ({
        x: a.x,
        y: a.y,
        zScore: a.zScore,
        message: `Z-Score: ${a.zScore.toFixed(2)}`,
      }));
  },
};

/**
 * ============================================
 * INITIAL DATA
 * ============================================
 */
const INITIAL_DATA = [
  { x: 1, y: 120, label: "08:00" },
  { x: 2, y: 135, label: "09:00" },
  { x: 3, y: 128, label: "10:00" },
  { x: 4, y: 142, label: "11:00" },
  { x: 5, y: 138, label: "12:00" },
  { x: 6, y: 155, label: "13:00" },
  { x: 7, y: 148, label: "14:00" }, // Slight anomaly
  { x: 8, y: 162, label: "15:00" },
  { x: 9, y: 175, label: "16:00" },
  { x: 10, y: 168, label: "17:00" },
];

const BENCHMARK_DATA = [
  { subject: 'Delivery Time', A: 85, fullMark: 100 },
  { subject: 'Cost Efficiency', A: 78, fullMark: 100 },
  { subject: 'Freshness', A: 92, fullMark: 100 },
  { subject: 'Inventory', A: 70, fullMark: 100 },
  { subject: 'Vendor Perf', A: 88, fullMark: 100 },
  { subject: 'Route Opt', A: 82, fullMark: 100 },
];

/**
 * ============================================
 * MAIN ANALYTICS COMPONENT
 * ============================================
 */
const Analytics = () => {
  const [data, setData] = useState(INITIAL_DATA.map(d => ({ ...d })));
  const [isStreaming, setIsStreaming] = useState(false);
  const [regression, setRegression] = useState(new LinearRegression());
  const [anomalyResult, setAnomalyResult] = useState({ anomalies: [], mean: 0, stdDev: 0 });
  const [trendline, setTrendline] = useState([]);
  const [insights, setInsights] = useState([]);
  const [nextX, setNextX] = useState(11);

  // Run regression and anomaly detection
  const analyzeData = useCallback((dataPoints) => {
    // Fit regression
    const reg = new LinearRegression().fit(dataPoints);
    setRegression(reg);

    // Detect anomalies
    const anomalies = AnomalyDetector.detect(dataPoints);
    setAnomalyResult(anomalies);

    // Generate trendline
    const trend = reg.generateTrendline(dataPoints, 5);
    setTrendline(trend);

    // Generate insights
    const newInsights = [];

    // Trend insight
    if (reg.isValid) {
      const trendDirection = reg.slope > 0 ? "rising" : "falling";
      const trendAmount = Math.abs(reg.slope * 24).toFixed(2); // Daily rate
      newInsights.push({
        type: reg.slope > 0 ? "warning" : "success",
        icon: reg.slope > 0 ? "📈" : "📉",
        text: `Trend: Costs ${trendDirection} by $${trendAmount}/day (Confidence: ${(reg.rSquared * 100).toFixed(0)}%)`,
      });
    }

    // Anomaly alerts
    const alerts = AnomalyDetector.getAlerts(anomalies.anomalies);
    if (alerts.length > 0) {
      alerts.forEach(alert => {
        newInsights.push({
          type: "danger",
          icon: "🚨",
          text: `Anomaly: Spike at ${dataPoints.find(d => d.x === alert.x)?.label || alert.x} (Z-Score: ${alert.zScore.toFixed(2)})`,
        });
      });
    } else {
      newInsights.push({
        type: "success",
        icon: "✅",
        text: "No anomalies detected - System operating within normal parameters",
      });
    }

    // Prediction insight
    if (reg.isValid && trend.length > 0) {
      const lastPrediction = trend[trend.length - 1];
      newInsights.push({
        type: "info",
        icon: "🔮",
        text: `Prediction: Next peak cost projected at $${lastPrediction.y.toFixed(0)}`,
      });
    }

    setInsights(newInsights);
  }, []);

  // Initial analysis
  useEffect(() => {
    analyzeData(data);
  }, [data, analyzeData]);

  // Data stream simulation
  useEffect(() => {
    let interval;
    if (isStreaming) {
      interval = setInterval(() => {
        const newPoint = {
          x: nextX,
          y: Math.floor(Math.random() * 60) + 150, // Random between 150-210
          label: `${8 + Math.floor(nextX / 2)}:00`,
        };

        setData(prev => {
          // Keep last 15 points
          const newData = [...prev.slice(-14), newPoint];
          return newData;
        });

        setNextX(prev => prev + 1);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isStreaming, nextX]);

  // Prepare chart data
  const chartData = useMemo(() => {
    return data.map((point, index) => {
      const anomaly = anomalyResult.anomalies.find(a => a.index === index);
      return {
        ...point,
        barFill: anomaly?.isAnomaly ? "#ef4444" : "#3b82f6",
        anomaly: anomaly?.isAnomaly,
        zScore: anomaly?.zScore?.toFixed(2) || null,
      };
    });
  }, [data, anomalyResult]);

  // Merge trendline with chart data
  const composedData = useMemo(() => {
    return chartData.map(point => {
      const trendPoint = trendline.find(t => t.x === point.x);
      return {
        ...point,
        trendline: trendPoint ? trendPoint.y : null,
      };
    });
  }, [chartData, trendline]);

  // Format time labels
  const formatXAxis = useCallback((value) => {
    const point = data.find(d => d.x === value);
    return point ? point.label : value;
  }, [data]);

  return (
    <div style={styles.container}>
      <div style={styles.main}>
        <h2 style={styles.title}>🔮 Predictive Supply Chain Analytics</h2>
        <p style={styles.subtitle}>
          AI-powered forecasting with Linear Regression & Anomaly Detection
        </p>

        {/* Top Stats */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>R² Confidence</span>
            <span style={styles.statValue}>{(regression.rSquared * 100).toFixed(1)}%</span>
            <div style={styles.statBar}>
              <div style={{ ...styles.statFill, width: `${regression.rSquared * 100}%` }} />
            </div>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Trend Slope</span>
            <span style={{ ...styles.statValue, color: regression.slope > 0 ? "#ef4444" : "#16a34a" }}>
              {regression.slope > 0 ? "+" : ""}{regression.slope.toFixed(2)}
            </span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Anomalies</span>
            <span style={{ ...styles.statValue, color: anomalyResult.anomalies.filter(a => a.isAnomaly).length > 0 ? "#ef4444" : "#16a34a" }}>
              {anomalyResult.anomalies.filter(a => a.isAnomaly).length}
            </span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Data Points</span>
            <span style={styles.statValue}>{data.length}</span>
          </div>
        </div>

        {/* Main Charts Row */}
        <div style={styles.chartsRow}>
          {/* Predictive Cost Forecast */}
          <div style={styles.chartCard}>
            <div style={styles.chartHeader}>
              <h3 style={styles.chartTitle}>📊 Predictive Cost Forecast</h3>
              <button
                style={{
                  ...styles.streamButton,
                  background: isStreaming ? "#ef4444" : "#16a34a",
                }}
                onClick={() => setIsStreaming(!isStreaming)}
              >
                {isStreaming ? "⏹ Stop Stream" : "▶ Start Data Stream"}
              </button>
            </div>
            
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={composedData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="x" 
                  tickFormatter={formatXAxis}
                  stroke="#64748b"
                  fontSize={11}
                />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={styles.tooltip}
                  formatter={(value, name) => [
                    `$${value?.toFixed(2) || value}`,
                    name === 'barFill' ? 'Cost' : name === 'trendline' ? 'Trendline' : name
                  ]}
                />
                <Legend />
                {/* Historical Data Bars */}
                <Bar
                  dataKey="y"
                  fill="#3b82f6"
                  shape={(props) => {
                    const { x, y, width, height, payload } = props;
                    const isAnomaly = payload.anomaly;
                    return (
                      <rect
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        fill={payload.barFill || "#3b82f6"}
                        opacity={isAnomaly ? 1 : 0.7}
                        rx={2}
                      />
                    );
                  }}
                  name="Historical Cost"
                />
                {/* Regression Trendline */}
                <Line
                  type="monotone"
                  dataKey="trendline"
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Regression Trend"
                />
                {/* Predicted Points */}
                <Bar
                  dataKey={(data) => data.type === 'predicted' ? data.y : null}
                  fill="#f97316"
                  opacity={0.5}
                  name="Predicted"
                />
              </ComposedChart>
            </ResponsiveContainer>

            {/* Regression Formula Display */}
            <div style={styles.formulaBox}>
              <span style={styles.formulaLabel}>Linear Regression Model:</span>
              <code style={styles.formula}>
                y = {regression.slope.toFixed(4)}x + {regression.intercept.toFixed(2)}
              </code>
              <span style={styles.rsquared}>
                R² = {(regression.rSquared * 100).toFixed(2)}%
              </span>
            </div>
          </div>

          {/* System Health Radar */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>🛡️ System Health Radar</h3>
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={BENCHMARK_DATA}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#64748b" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Radar
                  name="Current Performance"
                  dataKey="A"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Radar
                  name="Golden Benchmark"
                  dataKey="fullMark"
                  stroke="#16a34a"
                  fill="none"
                  strokeDasharray="3 3"
                  strokeWidth={2}
                />
                <Legend />
                <Tooltip contentStyle={styles.tooltip} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Insights Panel */}
        <div style={styles.insightsPanel}>
          <h3 style={styles.insightsTitle}>🧠 Live AI Insights</h3>
          <div style={styles.insightsList}>
            {insights.map((insight, index) => (
              <div
                key={index}
                style={{
                  ...styles.insightItem,
                  background: insight.type === "danger" ? "#fef2f2" :
                             insight.type === "warning" ? "#fef3c7" :
                             insight.type === "success" ? "#dcfce7" : "#e0f2fe",
                  borderLeft: `4px solid ${
                    insight.type === "danger" ? "#ef4444" :
                    insight.type === "warning" ? "#f59e0b" :
                    insight.type === "success" ? "#16a34a" : "#3b82f6"
                  }`,
                }}
              >
                <span style={styles.insightIcon}>{insight.icon}</span>
                <span style={styles.insightText}>{insight.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Anomaly Details */}
        <div style={styles.anomalyPanel}>
          <h3 style={styles.anomalyTitle}>🔍 Anomaly Detection Analysis</h3>
          <div style={styles.anomalyStats}>
            <div style={styles.anomalyStat}>
              <span style={styles.anomalyStatLabel}>Mean (μ)</span>
              <span style={styles.anomalyStatValue}>${anomalyResult.mean.toFixed(2)}</span>
            </div>
            <div style={styles.anomalyStat}>
              <span style={styles.anomalyStatLabel}>Standard Deviation (σ)</span>
              <span style={styles.anomalyStatValue}>${anomalyResult.stdDev.toFixed(2)}</span>
            </div>
            <div style={styles.anomalyStat}>
              <span style={styles.anomalyStatLabel}>Z-Score Threshold</span>
              <span style={styles.anomalyStatValue}>&gt; ±2.0</span>
            </div>
            <div style={styles.anomalyStat}>
              <span style={styles.anomalyStatLabel}>Flagged Points</span>
              <span style={{...styles.anomalyStatValue, color: "#ef4444"}}>
                {anomalyResult.anomalies.filter(a => a.isAnomaly).length}
              </span>
            </div>
          </div>

          <table style={styles.anomalyTable}>
            <thead>
              <tr>
                <th style={styles.th}>Time</th>
                <th style={styles.th}>Actual Cost</th>
                <th style={styles.th}>Predicted</th>
                <th style={styles.th}>Residual</th>
                <th style={styles.th}>Z-Score</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((point, index) => {
                const predicted = regression.predict(point.x);
                const residual = point.y - predicted;
                const anomaly = anomalyResult.anomalies.find(a => a.index === index);
                const zScore = anomaly?.zScore || 0;

                return (
                  <tr key={index} style={{ background: anomaly?.isAnomaly ? "#fef2f2" : "transparent" }}>
                    <td style={styles.td}>{point.label}</td>
                    <td style={styles.td}>${point.y}</td>
                    <td style={styles.td}>${predicted.toFixed(2)}</td>
                    <td style={{...styles.td, color: Math.abs(residual) > 20 ? "#ef4444" : "#16a34a"}}>
                      {residual > 0 ? "+" : ""}{residual.toFixed(2)}
                    </td>
                    <td style={styles.td}>{zScore.toFixed(3)}</td>
                    <td style={styles.td}>
                      {anomaly?.isAnomaly ? (
                        <span style={styles.flaggedBadge}>🚨 Flagged</span>
                      ) : (
                        <span style={styles.normalBadge}>✓ Normal</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ---------------- STYLES ---------------- */
const styles = {
  container: {
    background: "#f8fafc",
    minHeight: "100vh",
    padding: "30px",
  },
  main: {
    maxWidth: "1400px",
    margin: "0 auto",
  },
  title: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "700",
    color: "#1e293b",
  },
  subtitle: {
    color: "#64748b",
    marginBottom: "24px",
    fontSize: "14px",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    background: "#ffffff",
    padding: "16px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  statLabel: {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "500",
  },
  statValue: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "monospace",
  },
  statBar: {
    height: "4px",
    background: "#e2e8f0",
    borderRadius: "2px",
    overflow: "hidden",
  },
  statFill: {
    height: "100%",
    background: "#3b82f6",
    borderRadius: "2px",
  },
  chartsRow: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "20px",
    marginBottom: "24px",
  },
  chartCard: {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  chartHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  chartTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e293b",
  },
  streamButton: {
    padding: "8px 16px",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  formulaBox: {
    marginTop: "16px",
    padding: "12px 16px",
    background: "#f8fafc",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  formulaLabel: {
    fontSize: "12px",
    color: "#64748b",
  },
  formula: {
    fontSize: "14px",
    fontFamily: "monospace",
    background: "#e2e8f0",
    padding: "4px 8px",
    borderRadius: "4px",
    color: "#1e293b",
  },
  rsquared: {
    fontSize: "12px",
    color: "#16a34a",
    fontWeight: "600",
    marginLeft: "auto",
  },
  tooltip: {
    background: "#1e293b",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "12px",
  },
  insightsPanel: {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    marginBottom: "24px",
  },
  insightsTitle: {
    margin: "0 0 16px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e293b",
  },
  insightsList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  insightItem: {
    padding: "12px 16px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  insightIcon: {
    fontSize: "18px",
  },
  insightText: {
    fontSize: "13px",
    color: "#374151",
    fontWeight: "500",
  },
  anomalyPanel: {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  anomalyTitle: {
    margin: "0 0 16px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e293b",
  },
  anomalyStats: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    marginBottom: "20px",
  },
  anomalyStat: {
    background: "#f8fafc",
    padding: "12px",
    borderRadius: "8px",
    textAlign: "center",
  },
  anomalyStatLabel: {
    display: "block",
    fontSize: "11px",
    color: "#64748b",
    marginBottom: "4px",
  },
  anomalyStatValue: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "monospace",
  },
  anomalyTable: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px",
  },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    background: "#f8fafc",
    borderBottom: "2px solid #e2e8f0",
    color: "#64748b",
    fontWeight: "600",
    fontSize: "11px",
  },
  td: {
    padding: "10px 12px",
    borderBottom: "1px solid #f1f5f9",
    color: "#374151",
    fontFamily: "monospace",
  },
  flaggedBadge: {
    display: "inline-block",
    padding: "2px 8px",
    background: "#fef2f2",
    color: "#dc2626",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "600",
  },
  normalBadge: {
    display: "inline-block",
    padding: "2px 8px",
    background: "#dcfce7",
    color: "#16a34a",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "600",
  },
};

export default Analytics;
