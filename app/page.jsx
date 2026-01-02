"use client";
import Link from "next/link";

export default function HomePage() {
  return (
    <div style={pageContainer}>
      <div style={contentWrapper}>
        <div style={heroSection}>
          <h1 style={heroTitle}>
            Welcome to <span style={gradientText}>Finance Orbit</span>
          </h1>
          <p style={heroSubtitle}>
            Your comprehensive dashboard for managing clients, tracking revenue,
            and generating financial reports.
          </p>
          <div style={buttonGroup}>
            <Link href="/dashboard" style={primaryButton}>
              Go to Dashboard
            </Link>
            <Link href="/clients" style={secondaryButton}>
              View Clients
            </Link>
          </div>
        </div>

        <div style={featuresGrid}>
          <div
            style={featureCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow =
                "0 16px 48px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)";
            }}
          >
            <div style={featureIcon}>📊</div>
            <h3 style={featureTitle}>Dashboard Overview</h3>
            <p style={featureDescription}>
              Get real-time insights into your business performance with
              comprehensive metrics and analytics.
            </p>
          </div>
          <div
            style={featureCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow =
                "0 16px 48px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)";
            }}
          >
            <div style={featureIcon}>👥</div>
            <h3 style={featureTitle}>Client Management</h3>
            <p style={featureDescription}>
              Easily track and manage all your client projects, transactions,
              and revenue streams.
            </p>
          </div>
          <div
            style={featureCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
              e.currentTarget.style.boxShadow =
                "0 16px 48px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)";
            }}
          >
            <div style={featureIcon}>📈</div>
            <h3 style={featureTitle}>Monthly Reports</h3>
            <p style={featureDescription}>
              Generate detailed monthly financial reports with profit
              calculations and Sadqa fund tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const pageContainer = {
  padding: "48px 40px",
  minHeight: "100vh",
  fontFamily: "'Inter', sans-serif",
  background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)",
};

const contentWrapper = {
  maxWidth: "1200px",
  margin: "0 auto",
};

const heroSection = {
  textAlign: "center",
  padding: "80px 20px",
  marginBottom: "80px",
};

const heroTitle = {
  fontSize: "64px",
  fontWeight: "900",
  margin: "0 0 24px 0",
  letterSpacing: "-2px",
  lineHeight: "1.1",
  color: "#0f172a",
};

const gradientText = {
  background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

const heroSubtitle = {
  fontSize: "20px",
  color: "#64748b",
  margin: "0 0 40px 0",
  fontWeight: "500",
  maxWidth: "600px",
  marginLeft: "auto",
  marginRight: "auto",
  lineHeight: "1.6",
};

const buttonGroup = {
  display: "flex",
  gap: "16px",
  justifyContent: "center",
  flexWrap: "wrap",
};

const primaryButton = {
  padding: "16px 32px",
  background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
  color: "white",
  textDecoration: "none",
  borderRadius: "14px",
  fontWeight: "700",
  fontSize: "16px",
  boxShadow: "0 4px 16px rgba(14, 165, 233, 0.3)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  display: "inline-block",
  letterSpacing: "-0.2px",
};

const secondaryButton = {
  padding: "16px 32px",
  background: "linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)",
  color: "#0f172a",
  textDecoration: "none",
  borderRadius: "14px",
  fontWeight: "700",
  fontSize: "16px",
  border: "2px solid rgba(226, 232, 240, 0.8)",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  display: "inline-block",
  letterSpacing: "-0.2px",
};

const featuresGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "32px",
};

const featureCard = {
  background: "linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)",
  padding: "40px 32px",
  borderRadius: "24px",
  border: "1px solid rgba(226, 232, 240, 0.8)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  textAlign: "center",
};

const featureIcon = {
  fontSize: "48px",
  marginBottom: "20px",
};

const featureTitle = {
  fontSize: "22px",
  fontWeight: "800",
  color: "#0f172a",
  margin: "0 0 12px 0",
  letterSpacing: "-0.5px",
};

const featureDescription = {
  fontSize: "15px",
  color: "#64748b",
  lineHeight: "1.6",
  margin: 0,
  fontWeight: "500",
};
