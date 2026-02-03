import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItem = (label, icon, path) => (
    <div
      onClick={() => navigate(path)}
      style={
        location.pathname === path
          ? styles.activeMenu
          : styles.menu
      }
    >
      {icon} {label}
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>⚡</span>
          <div>
            <div style={styles.logoTitle}>UrbanFlux AI</div>
            <div style={styles.logoSubtitle}>City Intelligence</div>
          </div>
        </div>

        <div style={styles.menuGroup}>
          <div style={styles.menuLabel}>MAIN</div>
          {menuItem("Dashboard", "📊", "/dashboard")}
          {menuItem("Analytics", "📈", "/analytics")}
        </div>

        <div style={styles.menuGroup}>
          <div style={styles.menuLabel}>TOOLS</div>
          {menuItem("Simulation", "🧪", "/simulation")}
          {menuItem("AI Insights", "🤖", "/insights")}
          {menuItem("Customer Queue", "📋", "/waitlist")}
        </div>

        <div style={styles.menuGroup}>
          <div style={styles.menuLabel}>INFO</div>
          {menuItem("About Us", "ℹ️", "/about")}
        </div>

        <div style={styles.bottomSidebar}>
          <div style={styles.menu}>⚙️ Settings</div>
        </div>

        <div style={styles.userStatus}>
          <div style={styles.statusIndicator}>🟢</div>
          <div>
            <div style={styles.userRole}>System Online</div>
            <div style={styles.userName}>Admin Operator</div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div style={styles.main}>
        <Outlet />
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    background: "#f4f6f9",
    minHeight: "100vh",
  },
  sidebar: {
    width: "260px",
    background: "#fff",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "2px 0 10px rgba(0,0,0,0.05)",
    borderRight: "1px solid #e5e7eb",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "30px",
    padding: "10px",
    borderRadius: "8px",
    background: "#f3f4f6",
  },
  logoIcon: {
    fontSize: "24px",
  },
  logoTitle: {
    fontWeight: "bold",
    fontSize: "14px",
    color: "#1f2937",
  },
  logoSubtitle: {
    fontSize: "11px",
    color: "#6b7280",
  },
  menuGroup: {
    marginBottom: "20px",
  },
  menuLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "8px",
    paddingLeft: "10px",
  },
  activeMenu: {
    padding: "12px 10px",
    background: "#e0e7ff",
    color: "#2563eb",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    marginBottom: "4px",
    borderLeft: "3px solid #2563eb",
    transition: "all 0.3s ease",
  },
  menu: {
    padding: "12px 10px",
    cursor: "pointer",
    borderRadius: "8px",
    marginBottom: "4px",
    color: "#6b7280",
    transition: "all 0.3s ease",
  },
  bottomSidebar: {
    marginTop: "auto",
    marginBottom: "15px",
  },
  userStatus: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    background: "#f3f4f6",
    borderRadius: "8px",
    borderTop: "1px solid #e5e7eb",
    paddingTop: "15px",
  },
  statusIndicator: {
    fontSize: "12px",
    animation: "pulse 2s infinite",
  },
  userRole: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#16a34a",
  },
  userName: {
    fontSize: "11px",
    color: "#6b7280",
  },
  main: {
    flex: 1,
    overflowY: "auto",
  },
};

export default Layout;
