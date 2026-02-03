import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@urbanflux.ai");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Admin");

  const handleSubmit = (e) => {
    e.preventDefault();

    // No UI change — only navigation added
    if (email && password) {
      navigate("/dashboard");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoContainer}>
          <img
            src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d"
            alt="Urban Analytics"
            style={styles.logoImage}
          />
        </div>

        <h1 style={styles.title}>UrbanFlux AI</h1>
        <p style={styles.subtitle}>
          Urban Analytics & Decision Support
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={styles.input}
            >
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Analyst">Analyst</option>
            </select>
          </div>

          <button type="submit" style={styles.button}>
            Sign In
          </button>
        </form>

        <p style={styles.forgot}>Forgot password?</p>
      </div>

      <div style={styles.footer}>
        Secure access · Role-based permissions · Enterprise-grade
      </div>
    </div>
  );
};

const styles = {
  page: {
    height: "100vh",
    background: "linear-gradient(to bottom, #e6ebf2, #f4f6f9)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    width: "420px",
    background: "#ffffff",
    borderRadius: "14px",
    padding: "40px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    textAlign: "center",
  },
  logoContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
  },
  logoImage: {
    width: "70px",
    height: "40px",
    borderRadius: "6px",
    objectFit: "cover",
  },
  title: {
    margin: "10px 0 5px",
    fontSize: "28px",
    fontWeight: "600",
    color: "#1f2937",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "30px",
  },
  form: {
    width: "100%",
    textAlign: "left",
  },
  inputGroup: {
    marginBottom: "18px",
  },
  label: {
    fontSize: "13px",
    marginBottom: "6px",
    display: "block",
    color: "#374151",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "12px",
    marginTop: "10px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2f5edb",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background 0.3s",
  },
  forgot: {
    marginTop: "18px",
    fontSize: "13px",
    color: "#2f5edb",
    cursor: "pointer",
  },
  footer: {
    marginTop: "30px",
    fontSize: "13px",
    color: "#6b7280",
  },
};

export default Login;
