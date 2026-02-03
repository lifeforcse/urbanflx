import React, { useState, useMemo } from "react";

/**
 * ============================================
 * CUSTOMER WAITLIST COMPONENT
 * AI-Powered Supply Allocation Queue
 * ============================================
 */

// Constants for AI calculations
const TOTAL_FLEET_CAPACITY = 5000; // kg
const DISTRICT_DISTANCES = {
  "Downtown": 1.2,
  "North District": 1.5,
  "East Plaza": 1.8,
  "South Market": 2.0,
  "West End": 1.6,
  "Central Hub": 1.0,
  "Airport Zone": 2.5,
  "Industrial Park": 1.9,
  "Suburban": 2.2,
};

const INITIAL_WAITLIST = [
  { id: 1, name: "Fresh Mart", location: "Downtown", volume: 450, impact: 0, status: "pending" },
  { id: 2, name: "Urban Foods", location: "North District", volume: 320, impact: 0, status: "pending" },
  { id: 3, name: "City Store", location: "South Market", volume: 580, impact: 0, status: "pending" },
  { id: 4, name: "Prime Hub", location: "West End", volume: 210, impact: 0, status: "approved" },
];

const CustomerWaitlist = () => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    volume: "",
  });
  const [waitlist, setWaitlist] = useState(INITIAL_WAITLIST);
  const [impactWarning, setImpactWarning] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");

  // AI Impact Score Calculation: Impact = (Volume / TotalCapacity) * DistanceFactor
  const calculateImpactScore = useMemo(() => {
    if (!formData.volume || !formData.location) return null;

    const volume = parseFloat(formData.volume);
    if (isNaN(volume) || volume <= 0) return null;

    const distanceFactor = DISTRICT_DISTANCES[formData.location] || 1.5;
    const impactScore = (volume / TOTAL_FLEET_CAPACITY) * distanceFactor * 100;
    
    let warningLevel = "low";
    let warningMessage = "Minimal fleet load increase";
    let warningColor = "#16a34a";
    let icon = "✅";

    if (impactScore > 15) {
      warningLevel = "high";
      warningMessage = "⚠️ Significant fleet load increase";
      warningColor = "#ef4444";
      icon = "🚨";
    } else if (impactScore > 8) {
      warningLevel = "medium";
      warningMessage = "⚠️ Moderate fleet load increase";
      warningColor = "#f59e0b";
      icon = "⚠️";
    }

    return {
      score: impactScore,
      volume,
      location: formData.location,
      warningLevel,
      warningMessage,
      warningColor,
      icon,
    };
  }, [formData.volume, formData.location]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Add customer to waitlist
  const handleAddCustomer = () => {
    if (!formData.name || !formData.location || !formData.volume) return;

    const newCustomer = {
      id: Date.now(),
      name: formData.name,
      location: formData.location,
      volume: parseFloat(formData.volume),
      impact: calculateImpactScore?.score || 0,
      status: "pending",
    };

    setWaitlist(prev => [...prev, newCustomer]);
    setFormData({ name: "", location: "", volume: "" });
    setImpactWarning(null);
  };

  // Approve and route customer
  const handleApprove = (id) => {
    setWaitlist(prev => prev.map(customer => 
      customer.id === id 
        ? { ...customer, status: "approved" }
        : customer
    ));
  };

  // Filter customers by tab
  const filteredWaitlist = waitlist.filter(customer => {
    if (activeTab === "pending") return customer.status === "pending";
    if (activeTab === "approved") return customer.status === "approved";
    return true;
  });

  // Calculate totals
  const pendingCount = waitlist.filter(c => c.status === "pending").length;
  const approvedCount = waitlist.filter(c => c.status === "approved").length;
  const totalPendingVolume = waitlist
    .filter(c => c.status === "pending")
    .reduce((sum, c) => sum + c.volume, 0);
  const totalImpact = waitlist
    .filter(c => c.status === "pending")
    .reduce((sum, c) => sum + c.impact, 0);

  return (
    <div style={styles.container}>
      <div style={styles.main}>
        <h2 style={styles.title}>👥 Customer Waitlist</h2>
        <p style={styles.subtitle}>
          AI-powered queue management with network impact prediction
        </p>

        {/* Stats Row */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Pending</span>
            <span style={{...styles.statValue, color: "#f59e0b"}}>{pendingCount}</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Approved</span>
            <span style={{...styles.statValue, color: "#16a34a"}}>{approvedCount}</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Pending Volume</span>
            <span style={styles.statValue}>{totalPendingVolume} kg</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Network Impact</span>
            <span style={{
              ...styles.statValue,
              color: totalImpact > 20 ? "#ef4444" : totalImpact > 10 ? "#f59e0b" : "#16a34a"
            }}>
              {totalImpact.toFixed(1)}%
            </span>
          </div>
        </div>

        <div style={styles.contentRow}>
          {/* Add Customer Form */}
          <div style={styles.formCard}>
            <h3 style={styles.cardTitle}>➕ Add New Customer</h3>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Customer Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter customer name"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Location (District)</label>
              <select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                style={styles.select}
              >
                <option value="">Select district</option>
                {Object.keys(DISTRICT_DISTANCES).map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Requested Volume (kg)</label>
              <input
                type="number"
                name="volume"
                value={formData.volume}
                onChange={handleInputChange}
                placeholder="Enter volume in kg"
                style={styles.input}
              />
            </div>

            {/* AI Impact Warning */}
            {calculateImpactScore && (
              <div style={{
                ...styles.impactBox,
                background: calculateImpactScore.warningLevel === "high" ? "#fef2f2" :
                           calculateImpactScore.warningLevel === "medium" ? "#fef3c7" : "#dcfce7",
                borderColor: calculateImpactScore.warningColor,
              }}>
                <div style={styles.impactHeader}>
                  <span style={styles.impactIcon}>{calculateImpactScore.icon}</span>
                  <span style={styles.impactTitle}>Network Impact Prediction</span>
                </div>
                <div style={styles.impactScore}>
                  <span style={{ color: calculateImpactScore.warningColor }}>
                    +{calculateImpactScore.score.toFixed(2)}%
                  </span>
                  <span style={styles.impactDesc}>
                    Adding {calculateImpactScore.volume}kg to {calculateImpactScore.location}
                  </span>
                </div>
                <p style={styles.impactMessage}>
                  {calculateImpactScore.warningMessage}
                </p>
              </div>
            )}

            <button
              style={{
                ...styles.addButton,
                opacity: calculateImpactScore ? 1 : 0.5,
                cursor: calculateImpactScore ? "pointer" : "not-allowed",
              }}
              onClick={handleAddCustomer}
              disabled={!calculateImpactScore}
            >
              Add to Waitlist
            </button>
          </div>

          {/* Waitlist Table */}
          <div style={styles.tableCard}>
            <div style={styles.tabRow}>
              <button
                style={{
                  ...styles.tab,
                  background: activeTab === "pending" ? "#e0f2fe" : "transparent",
                  color: activeTab === "pending" ? "#0369a1" : "#64748b",
                }}
                onClick={() => setActiveTab("pending")}
              >
                ⏳ Pending ({pendingCount})
              </button>
              <button
                style={{
                  ...styles.tab,
                  background: activeTab === "approved" ? "#dcfce7" : "transparent",
                  color: activeTab === "approved" ? "#15803d" : "#64748b",
                }}
                onClick={() => setActiveTab("approved")}
              >
                ✅ Approved ({approvedCount})
              </button>
              <button
                style={{
                  ...styles.tab,
                  background: activeTab === "all" ? "#f3f4f6" : "transparent",
                  color: activeTab === "all" ? "#374151" : "#64748b",
                }}
                onClick={() => setActiveTab("all")}
              >
                📋 All ({waitlist.length})
              </button>
            </div>

            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Customer</th>
                    <th style={styles.th}>Location</th>
                    <th style={styles.th}>Volume</th>
                    <th style={styles.th}>Impact</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWaitlist.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{...styles.td, textAlign: "center", color: "#64748b"}}>
                        No customers in this category
                      </td>
                    </tr>
                  ) : (
                    filteredWaitlist.map(customer => (
                      <tr key={customer.id} style={styles.tr}>
                        <td style={styles.td}>
                          <span style={styles.customerName}>{customer.name}</span>
                        </td>
                        <td style={styles.td}>{customer.location}</td>
                        <td style={styles.td}>
                          <span style={styles.volumeBadge}>{customer.volume} kg</span>
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.impactBadge,
                            background: customer.impact > 15 ? "#fef2f2" :
                                       customer.impact > 8 ? "#fef3c7" : "#dcfce7",
                            color: customer.impact > 15 ? "#dc2626" :
                                   customer.impact > 8 ? "#d97706" : "#16a34a",
                          }}>
                            +{customer.impact.toFixed(1)}%
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusBadge,
                            background: customer.status === "approved" ? "#dcfce7" : "#fef3c7",
                            color: customer.status === "approved" ? "#15803d" : "#d97706",
                          }}>
                            {customer.status === "approved" ? "✓ Approved" : "◷ Pending"}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {customer.status === "pending" && (
                            <button
                              style={styles.approveButton}
                              onClick={() => handleApprove(customer.id)}
                            >
                              Approve & Route
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
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
    maxWidth: "1200px",
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
    textAlign: "center",
  },
  statLabel: {
    display: "block",
    fontSize: "12px",
    color: "#64748b",
    marginBottom: "4px",
  },
  statValue: {
    fontSize: "24px",
    fontWeight: "700",
    fontFamily: "monospace",
  },
  contentRow: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr",
    gap: "24px",
  },
  formCard: {
    background: "#ffffff",
    padding: "24px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    height: "fit-content",
  },
  cardTitle: {
    margin: "0 0 20px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e293b",
  },
  formGroup: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    background: "#fff",
    cursor: "pointer",
  },
  impactBox: {
    padding: "14px",
    borderRadius: "8px",
    border: "2px solid",
    marginBottom: "16px",
  },
  impactHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
  },
  impactIcon: {
    fontSize: "16px",
  },
  impactTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
  },
  impactScore: {
    display: "flex",
    alignItems: "baseline",
    gap: "8px",
    marginBottom: "4px",
  },
  impactDesc: {
    fontSize: "12px",
    color: "#64748b",
  },
  impactMessage: {
    fontSize: "12px",
    color: "#64748b",
    margin: 0,
  },
  addButton: {
    width: "100%",
    padding: "12px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    transition: "opacity 0.2s",
  },
  tableCard: {
    background: "#ffffff",
    padding: "24px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  tabRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "20px",
  },
  tab: {
    padding: "8px 16px",
    border: "none",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    borderBottom: "2px solid #e2e8f0",
    color: "#64748b",
    fontWeight: "600",
    fontSize: "11px",
    textTransform: "uppercase",
  },
  tr: {
    borderBottom: "1px solid #f1f5f9",
  },
  td: {
    padding: "12px",
    fontSize: "13px",
    color: "#374151",
  },
  customerName: {
    fontWeight: "600",
    color: "#1e293b",
  },
  volumeBadge: {
    display: "inline-block",
    padding: "2px 8px",
    background: "#e0f2fe",
    color: "#0369a1",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "600",
  },
  impactBadge: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "600",
  },
  statusBadge: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "600",
  },
  approveButton: {
    padding: "6px 12px",
    background: "#dcfce7",
    color: "#15803d",
    border: "none",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default CustomerWaitlist;
