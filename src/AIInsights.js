import React, { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
} from "recharts";

const AIInsights = () => {
  const [activeTab, setActiveTab] = useState("All");

  const aiEngineData = [
    { day: "Mon", value: 65 },
    { day: "Tue", value: 72 },
    { day: "Wed", value: 78 },
    { day: "Thu", value: 82 },
    { day: "Fri", value: 85 },
    { day: "Sat", value: 88 },
    { day: "Sun", value: 84 },
  ];

  const predictionsData = [
    { day: "Mon", predicted: 28, actual: 26 },
    { day: "Tue", predicted: 32, actual: 31 },
    { day: "Wed", predicted: 25, actual: 24 },
    { day: "Thu", predicted: 30, actual: 29 },
    { day: "Fri", predicted: 35, actual: 34 },
    { day: "Sat", predicted: 28, actual: 27 },
    { day: "Sun", predicted: 26, actual: 25 },
  ];

  const recommendationData = [
    { category: "Labor", score: 88 },
    { category: "Fuel", score: 92 },
    { category: "Routes", score: 85 },
    { category: "Inventory", score: 79 },
    { category: "Suppliers", score: 81 },
  ];

  const allAlerts = [
    {
      type: "warning",
      title: "High Congestion Alert - East Plaza",
      description:
        "Traffic congestion expected to peak at 5PM. Recommend rerouting through Harbor Zone.",
      severity: 87,
      time: "11:35:18 AM",
      action: "Avoid 25min delay",
      category: "warning",
    },
    {
      type: "info",
      title: "Spoilage Risk - Urban Foods",
      description:
        "Predicted 18% spoilage risk if delivery exceeds 45 minutes. Current ETA: 42 minutes.",
      severity: 72,
      time: "10:22:45 AM",
      action: "Monitor closely",
      category: "warning",
    },
    {
      type: "success",
      title: "Optimal Route Identified",
      description:
        "New routing algorithm identified 12% efficiency gain for North District routes.",
      severity: 95,
      time: "09:15:30 AM",
      action: "Implement now",
      category: "optimization",
    },
    {
      type: "info",
      title: "Prediction Update: Delivery Times",
      description:
        "New model iteration shows 84% accuracy in delivery time predictions. Confidence improving.",
      severity: 84,
      time: "08:45:20 AM",
      action: "View model",
      category: "prediction",
    },
    {
      type: "success",
      title: "Recommendation Accepted",
      description:
        "Supplier rotation recommendation accepted. Expected 8% improvement in delivery metrics.",
      severity: 78,
      time: "07:30:15 AM",
      action: "Track results",
      category: "recommendation",
    },
  ];

  const optimizationAlerts = allAlerts.filter(a => a.category === "optimization");
  const warningAlerts = allAlerts.filter(a => a.category === "warning");
  const predictionAlerts = allAlerts.filter(a => a.category === "prediction");
  const recommendationAlerts = allAlerts.filter(a => a.category === "recommendation");

  const getDisplayedAlerts = () => {
    switch(activeTab) {
      case "Optimization":
        return optimizationAlerts;
      case "Warnings":
        return warningAlerts;
      case "Predictions":
        return predictionAlerts;
      case "Recommendations":
        return recommendationAlerts;
      default:
        return allAlerts;
    }
  };

  const displayedAlerts = getDisplayedAlerts();

  const recommendations = [
    {
      title: "Increase Metro Market Allocation",
      description: "AI analysis shows 15% demand increase potential with optimal stock levels",
      impact: "Cost Savings",
    },
    {
      title: "Optimize Supplier Rotation",
      description: "Rotate suppliers based on performance metrics to reduce delivery times",
      impact: "Time Savings",
    },
    {
      title: "Dynamic Pricing Strategy",
      description: "Adjust pricing during peak hours to maximize revenue and reduce congestion",
      impact: "Revenue Growth",
    },
    {
      title: "Predictive Maintenance Schedule",
      description: "Schedule vehicle maintenance during low-demand periods to prevent disruptions",
      impact: "Reliability",
    },
  ];

  const tabs = ["All", "Optimization", "Warnings", "Predictions", "Recommendations"];

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <div style={styles.header}>
        <h2>AI Insights</h2>
        <p style={styles.subtitle}>Intelligence-driven recommendations and predictions</p>
      </div>

      {/* AI Engine Status */}
      <div style={styles.statusCard}>
        <div style={styles.statusContent}>
          <div style={styles.statusIndicator}>🟢 AI Engine Active</div>
          <div style={styles.statusLabel}>Simulation Run #1</div>
        </div>
        <div style={styles.weights}>
          <div style={styles.weightItem}>
            <span>Delivery Weight</span>
            <span style={styles.weightValue}>39%</span>
          </div>
          <div style={styles.weightItem}>
            <span>Spoilage Weight</span>
            <span style={styles.weightValue}>31%</span>
          </div>
          <div style={styles.weightItem}>
            <span>Cost Weight</span>
            <span style={styles.weightValue}>30%</span>
          </div>
          <div style={styles.adaptiveLabel}>Adaptive Learning: Active</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...styles.tab,
              ...(activeTab === tab ? styles.activeTab : {}),
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Alerts Section */}
      <div style={styles.alertsGrid}>
        {displayedAlerts.map((alert, idx) => (
          <div
            key={idx}
            style={{
              ...styles.alertCard,
              borderLeft:
                alert.type === "warning"
                  ? "4px solid #f59e0b"
                  : alert.type === "info"
                    ? "4px solid #2563eb"
                    : "4px solid #16a34a",
            }}
          >
            <div style={styles.alertHeader}>
              <h4 style={styles.alertTitle}>
                {alert.title}
              </h4>
              <span style={styles.severity}>{alert.severity}%</span>
            </div>
            <p style={styles.alertDescription}>{alert.description}</p>
            <div style={styles.alertFooter}>
              <span style={styles.actionBadge}>{alert.action}</span>
              <span style={styles.time}>{alert.time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div style={styles.chartsGrid}>
        {/* AI Engine Performance */}
        <div style={styles.chartBox}>
          <h4>AI Engine Performance</h4>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={aiEngineData}>
              <defs>
                <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#2563eb"
                fillOpacity={1}
                fill="url(#colorAI)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Prediction Accuracy */}
        <div style={styles.chartBox}>
          <h4>Prediction Accuracy</h4>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={predictionsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#9ca3af"
                strokeDasharray="5 5"
                name="Predicted"
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#16a34a"
                strokeWidth={3}
                name="Actual"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recommendation Scores */}
        <div style={styles.chartBox}>
          <h4>Recommendation Impact Scores</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={recommendationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="score" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Learning Progress */}
        <div style={styles.statsBox}>
          <h4>Model Learning Progress</h4>
          <div style={styles.progressItems}>
            <div style={styles.progressItem}>
              <div style={styles.progressLabel}>
                <span>Training Iterations</span>
                <span style={styles.progressValue}>10</span>
              </div>
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: "100%" }} />
              </div>
            </div>

            <div style={styles.progressItem}>
              <div style={styles.progressLabel}>
                <span>Accuracy Score</span>
                <span style={styles.progressValue}>84%</span>
              </div>
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: "84%" }} />
              </div>
            </div>

            <div style={styles.progressItem}>
              <div style={styles.progressLabel}>
                <span>Optimization Rate</span>
                <span style={styles.progressValue}>81%</span>
              </div>
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: "81%" }} />
              </div>
            </div>

            <div style={styles.progressItem}>
              <div style={styles.progressLabel}>
                <span>Prediction Confidence</span>
                <span style={styles.progressValue}>78%</span>
              </div>
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: "78%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      <div style={styles.recommendationsSection}>
        <h3 style={styles.sectionTitle}>💡 AI Recommendations</h3>
        <div style={styles.recommendationsGrid}>
          {recommendations.map((rec, idx) => (
            <div key={idx} style={styles.recommendationCard}>
              <h5 style={styles.recTitle}>{rec.title}</h5>
              <p style={styles.recDescription}>{rec.description}</p>
              <div style={styles.recFooter}>
                <span style={styles.impactBadge}>{rec.impact}</span>
              </div>
            </div>
          ))}
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
  },
  statusCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  statusContent: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  statusIndicator: {
    fontSize: "18px",
    fontWeight: "bold",
  },
  statusLabel: {
    color: "#6b7280",
    fontSize: "13px",
  },
  weights: {
    display: "flex",
    gap: "40px",
    alignItems: "center",
  },
  weightItem: {
    display: "flex",
    flexDirection: "column",
    fontSize: "13px",
    color: "#6b7280",
  },
  weightValue: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#2563eb",
    marginTop: "3px",
  },
  adaptiveLabel: {
    background: "#dcfce7",
    padding: "8px 12px",
    borderRadius: "6px",
    color: "#166534",
    fontSize: "12px",
    fontWeight: "600",
  },
  tabsContainer: {
    display: "flex",
    gap: "15px",
    marginBottom: "30px",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "0",
  },
  tab: {
    padding: "12px 24px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#6b7280",
    borderBottom: "3px solid transparent",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.3s ease",
    textDecoration: "none",
  },
  activeTab: {
    color: "#2563eb",
    borderBottomColor: "#2563eb",
    backgroundColor: "transparent",
  },
  alertsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(1, 1fr)",
    gap: "15px",
    marginBottom: "30px",
  },
  alertCard: {
    background: "#fff",
    padding: "18px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  alertHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  alertTitle: {
    margin: "0",
    fontSize: "15px",
    fontWeight: "600",
  },
  severity: {
    fontSize: "13px",
    color: "#9ca3af",
    fontWeight: "500",
  },
  alertDescription: {
    margin: "10px 0",
    color: "#6b7280",
    fontSize: "14px",
  },
  alertFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "12px",
  },
  actionBadge: {
    background: "#e0f2fe",
    color: "#0369a1",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
  },
  time: {
    color: "#9ca3af",
    fontSize: "12px",
  },
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
    marginBottom: "30px",
  },
  chartBox: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    height: "320px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  statsBox: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    gridColumn: "1 / -1",
  },
  progressItems: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
    marginTop: "20px",
  },
  progressItem: {
    padding: "15px",
    background: "#f3f4f6",
    borderRadius: "8px",
  },
  progressLabel: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    marginBottom: "8px",
    color: "#6b7280",
  },
  progressValue: {
    fontWeight: "bold",
    color: "#2563eb",
  },
  progressBar: {
    height: "6px",
    background: "#e5e7eb",
    borderRadius: "3px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "#2563eb",
    borderRadius: "3px",
  },
  recommendationsSection: {
    marginTop: "30px",
  },
  sectionTitle: {
    marginBottom: "20px",
    fontSize: "18px",
    fontWeight: "bold",
  },
  recommendationsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
  },
  recommendationCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  recTitle: {
    margin: "0 0 10px 0",
    fontSize: "15px",
    fontWeight: "600",
  },
  recDescription: {
    margin: "0 0 15px 0",
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: "1.5",
  },
  recFooter: {
    display: "flex",
    justifyContent: "flex-start",
  },
  impactBadge: {
    background: "#e0f2fe",
    color: "#0369a1",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
  },
};

export default AIInsights;
