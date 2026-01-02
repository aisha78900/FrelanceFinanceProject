"use client";
import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";

const Dashboard = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = useMemo(() => {
    const totalRevenue = clients.reduce(
      (acc, curr) => acc + Number(curr.amount || 0),
      0
    );
    const totalProjects = clients.length;
    const totalCost = clients.reduce(
      (acc, curr) => acc + Number(curr.productioncost || 0),
      0
    );
    const netProfit = totalRevenue - totalCost;

    return {
      totalRevenue: totalRevenue.toLocaleString(),
      totalProjects,
      netProfit: netProfit.toLocaleString(),
      avgProjectValue:
        totalProjects > 0 ? (totalRevenue / totalProjects).toFixed(0) : 0,
    };
  }, [clients]);

  // Hover Handlers
  const handleMouseEnter = (e) => {
    e.currentTarget.style.transform = "translateY(-6px)";
    e.currentTarget.style.boxShadow = "0 15px 45px rgba(14, 165, 233, 0.2)";
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.06)";
  };

  if (loading)
    return <div style={loaderStyle}>Refreshing Finance Orbit Stats...</div>;

  return (
    <div style={pageContainer}>
      <div style={contentWrapper}>
        <div style={headerSection}>
          <h1 style={mainTitle}>
            Dashboard <span style={{ color: "#0ea5e9" }}>Overview</span>
          </h1>
          <p style={subTitle}>
            Tracking {clients.length} projects in real-time.
          </p>
        </div>

        {/* Improved Stats Grid */}
        <div style={statsGrid}>
          <div
            style={statCard}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <p style={statLabel}>Lifetime Revenue</p>
            <h2 style={statValue}>${stats.totalRevenue}</h2>
            <div style={cardFooter}>Total cash inflow</div>
          </div>
          <div
            style={statCard}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <p style={statLabel}>Net Profit</p>
            <h2
              style={{
                ...statValue,
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              ${stats.netProfit}
            </h2>
            <div style={cardFooter}>After production costs</div>
          </div>
          <div
            style={statCard}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <p style={statLabel}>Total Projects</p>
            <h2 style={statValueBlack}>{stats.totalProjects}</h2>
            <div style={cardFooter}>Completed orders</div>
          </div>
          <div
            style={statCard}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <p style={statLabel}>Avg. Value</p>
            <h2 style={statValueBlack}>${stats.avgProjectValue}</h2>
            <div style={cardFooter}>Per project average</div>
          </div>
        </div>

        {/* Detailed Activity Table */}
        <div style={activityCard}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "25px",
            }}
          >
            <h3 style={cardTitle}>Recent Client Activity</h3>
            <span style={viewAllBadge}>Latest {clients.length} entries</span>
          </div>

          <div style={activityContainer}>
            {clients.length > 0 ? (
              clients.map((c, i) => (
                <div key={i} style={activityRow}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                    }}
                  >
                    <div style={avatarCircle}>
                      {c.clientname?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={clientNameText}>{c.clientname}</span>
                      <span style={dateText}>
                        {c.date} •{" "}
                        <span style={{ color: "#0ea5e9" }}>
                          {c.platform || "Direct"}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={amountValue}>
                      +${Number(c.amount).toLocaleString()}
                    </div>
                    <div style={costText}>Cost: ${c.productioncost || 0}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={emptyState}>No data found in Supabase.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Styles ---
const pageContainer = {
  padding: "40px",
  minHeight: "100vh",
  background: "#f8fafc",
  fontFamily: "'Inter', sans-serif",
};
const contentWrapper = { maxWidth: "1200px", margin: "0 auto" };
const headerSection = { marginBottom: "40px" };
const mainTitle = {
  fontSize: "36px",
  fontWeight: "800",
  color: "#0f172a",
  margin: 0,
};
const subTitle = { color: "#64748b", marginTop: "8px", fontSize: "16px" };

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "20px",
  marginBottom: "40px",
};
const statCard = {
  background: "#fff",
  padding: "25px",
  borderRadius: "16px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
  transition: "all 0.3s ease",
  cursor: "pointer",
};
const statLabel = {
  color: "#64748b",
  fontSize: "13px",
  fontWeight: "600",
  textTransform: "uppercase",
  marginBottom: "10px",
};
const statValue = {
  fontSize: "32px",
  fontWeight: "800",
  background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  margin: 0,
};
const statValueBlack = {
  fontSize: "32px",
  fontWeight: "800",
  color: "#0f172a",
  margin: 0,
};
const cardFooter = { fontSize: "12px", color: "#94a3b8", marginTop: "8px" };

const activityCard = {
  background: "#fff",
  padding: "30px",
  borderRadius: "20px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
};
const cardTitle = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#0f172a",
  margin: 0,
};
const viewAllBadge = {
  background: "#f1f5f9",
  color: "#64748b",
  padding: "5px 12px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: "600",
};

const activityContainer = {
  display: "flex",
  flexDirection: "column",
  maxHeight: "500px",
  overflowY: "auto",
};
const activityRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "15px 0",
  borderBottom: "1px solid #f1f5f9",
};
const avatarCircle = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  background: "#0ea5e9",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
};

const clientNameText = {
  fontWeight: "700",
  color: "#1e293b",
  fontSize: "16px",
};
const dateText = { fontSize: "13px", color: "#94a3b8" };
const amountValue = { fontWeight: "800", color: "#0ea5e9", fontSize: "18px" };
const costText = { fontSize: "12px", color: "#f43f5e", fontWeight: "500" };

const loaderStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  color: "#0ea5e9",
  fontWeight: "bold",
};
const emptyState = { textAlign: "center", padding: "40px", color: "#94a3b8" };

export default Dashboard;
