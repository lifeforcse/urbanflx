import React from "react";

const About = () => {
  const teamMembers = [
    {
      name: "Manoj D",
      role: "Project Lead",
      description: "Leads project strategy, coordination, and delivery",
    },
    {
      name: "Mohamed Bashid J",
      role: "Integration Engineer",
      description: "Ensures seamless integration of system components",
    },
    {
      name: "Rishikumaaar R",
      role: "Front-End Developer",
      description: "Designs and implements the user interface and experience",
    },
    {
      name: "Sridharshan M K",
      role: "Back-End Developer",
      description: "Builds server-side architecture and APIs",
    },
    {
      name: "Lakshminarayana R",
      role: "AI/ML Engineer",
      description: "Develops and fine-tunes machine learning models",
    },
    {
      name: "Thamilkumaran G",
      role: "Simulation & Optimization Engineer",
      description: "Designs simulations and optimization algorithms",
    },
  ];

  return (
    <div style={styles.wrapper}>
      {/* Header Section */}
      <div style={styles.headerSection}>
        <h1 style={styles.mainTitle}>About UrbanFlux AI</h1>
        <p style={styles.tagline}>City Intelligence Platform</p>
      </div>

      {/* Mission Section */}
      <div style={styles.sectionCard}>
        <h2 style={styles.sectionTitle}>Our Mission</h2>
        <p style={styles.sectionText}>
          At UrbanFlux AI, we are dedicated to revolutionizing urban logistics and supply chain
          optimization through advanced artificial intelligence and data-driven insights. Our
          platform empowers businesses to make intelligent decisions that reduce delays, minimize
          spoilage, and maximize efficiency in every delivery.
        </p>
      </div>

      {/* Project Dedication */}
      <div style={styles.sectionCard}>
        <h2 style={styles.sectionTitle}>Our Commitment</h2>
        <p style={styles.sectionText}>
          We are deeply committed to this project and believe in the power of collaboration and
          innovation. As a dedicated team, we work together with precision and passion to deliver
          cutting-edge solutions that transform urban supply chains. Every feature, every
          optimization, and every insight in UrbanFlux AI represents our collective effort to make
          logistics smarter, faster, and more sustainable.
        </p>
      </div>

      {/* Team Section */}
      <div style={styles.teamSection}>
        <h2 style={styles.sectionTitle}>Our Team</h2>
        <p style={styles.teamIntro}>
          Meet the talented individuals who are driving UrbanFlux AI forward
        </p>
        <div style={styles.teamGrid}>
          {teamMembers.map((member, index) => (
            <div key={index} style={styles.teamCard}>
              <div style={styles.teamCardHeader}>
                <h3 style={styles.teamName}>{member.name}</h3>
                <span style={styles.teamRole}>{member.role}</span>
              </div>
              <p style={styles.teamDescription}>{member.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Values Section */}
      <div style={styles.valuesSection}>
        <h2 style={styles.sectionTitle}>Our Core Values</h2>
        <div style={styles.valuesGrid}>
          <div style={styles.valueCard}>
            <h4 style={styles.valueTitle}>Innovation</h4>
            <p style={styles.valueDescription}>
              Constantly pushing boundaries to create smarter solutions
            </p>
          </div>
          <div style={styles.valueCard}>
            <h4 style={styles.valueTitle}>Collaboration</h4>
            <p style={styles.valueDescription}>
              Working as a unified team toward common goals
            </p>
          </div>
          <div style={styles.valueCard}>
            <h4 style={styles.valueTitle}>Excellence</h4>
            <p style={styles.valueDescription}>
              Delivering high-quality results in everything we do
            </p>
          </div>
          <div style={styles.valueCard}>
            <h4 style={styles.valueTitle}>Reliability</h4>
            <p style={styles.valueDescription}>
              Building trust through consistent and dependable service
            </p>
          </div>
        </div>
      </div>

      {/* Impact Section */}
      <div style={styles.sectionCard}>
        <h2 style={styles.sectionTitle}>Impact & Vision</h2>
        <div style={styles.impactGrid}>
          <div style={styles.impactItem}>
            <div style={styles.impactNumber}>17%</div>
            <div style={styles.impactLabel}>Average Delay Reduction</div>
          </div>
          <div style={styles.impactItem}>
            <div style={styles.impactNumber}>26%</div>
            <div style={styles.impactLabel}>Spoilage Reduction</div>
          </div>
          <div style={styles.impactItem}>
            <div style={styles.impactNumber}>12%</div>
            <div style={styles.impactLabel}>Efficiency Improvement</div>
          </div>
          <div style={styles.impactItem}>
            <div style={styles.impactNumber}>8</div>
            <div style={styles.impactLabel}>Vendors Optimized</div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div style={styles.contactSection}>
        <h2 style={styles.sectionTitle}>Join Us on This Journey</h2>
        <p style={styles.contactText}>
          We're passionate about transforming urban logistics. Whether you're a partner, customer,
          or team member, we'd love to hear from you and explore how UrbanFlux AI can benefit your
          organization.
        </p>
        <button style={styles.contactButton}>Get In Touch</button>
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
  headerSection: {
    marginBottom: "40px",
    textAlign: "center",
  },
  mainTitle: {
    fontSize: "36px",
    fontWeight: "700",
    color: "#1f2937",
    margin: "0 0 10px 0",
  },
  tagline: {
    fontSize: "16px",
    color: "#6b7280",
    margin: "0",
  },
  sectionCard: {
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    marginBottom: "30px",
  },
  sectionTitle: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#1f2937",
    margin: "0 0 16px 0",
    borderBottom: "2px solid #2563eb",
    paddingBottom: "12px",
    display: "inline-block",
  },
  sectionText: {
    fontSize: "15px",
    color: "#4b5563",
    lineHeight: "1.8",
    margin: "0",
  },
  teamSection: {
    marginBottom: "30px",
  },
  teamIntro: {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "24px",
    fontStyle: "italic",
  },
  teamGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginTop: "24px",
  },
  teamCard: {
    background: "#fff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    borderLeft: "4px solid #2563eb",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  teamCardHeader: {
    marginBottom: "12px",
  },
  teamName: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1f2937",
    margin: "0 0 6px 0",
  },
  teamRole: {
    display: "inline-block",
    background: "#e0f2fe",
    color: "#0369a1",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
  },
  teamDescription: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "0",
    lineHeight: "1.6",
  },
  valuesSection: {
    marginBottom: "30px",
  },
  valuesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginTop: "24px",
  },
  valueCard: {
    background: "#fff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    textAlign: "center",
  },
  valueTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#2563eb",
    margin: "0 0 10px 0",
  },
  valueDescription: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "0",
    lineHeight: "1.6",
  },
  impactGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "20px",
    marginTop: "24px",
  },
  impactItem: {
    background: "#f3f4f6",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center",
  },
  impactNumber: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#2563eb",
    margin: "0 0 8px 0",
  },
  impactLabel: {
    fontSize: "13px",
    color: "#6b7280",
    margin: "0",
  },
  contactSection: {
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    textAlign: "center",
  },
  contactText: {
    fontSize: "15px",
    color: "#4b5563",
    lineHeight: "1.8",
    marginBottom: "20px",
  },
  contactButton: {
    background: "#2563eb",
    color: "#fff",
    padding: "12px 32px",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.3s ease",
  },
};

export default About;
