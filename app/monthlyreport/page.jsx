"use client";
import React, { useState, useEffect, useMemo } from "react";
// 1. Supabase import karein
import { supabase } from "@/lib/supabase";

const MonthlyReport = () => {
  const [clients, setClients] = useState([]);
  const [sadqaRate, setSadqaRate] = useState(0.1);
  const [manualMarketing, setManualMarketing] = useState(0);

  // 2. LocalStorage ki jagah Supabase se data fetch karne ka function
  const fetchClientsFromSupabase = async () => {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching data:", error.message);
    } else {
      // Supabase columns lowercase hain, isliye mapping zaroori hai
      const mappedData = data.map((item) => ({
        ...item,
        amount: item.amount,
        productionCost: item.productioncost, // lowercase check karein
        date: item.date,
      }));
      setClients(mappedData);
    }
  };

  useEffect(() => {
    fetchClientsFromSupabase();
  }, []);

  const { reports, totals } = useMemo(() => {
    const grouped = {};
    let overallGross = 0,
      overallSadqa = 0,
      overallNet = 0;

    clients.forEach((c) => {
      if (!c.date) return;

      // Date string ko sahi format mein convert karna (YYYY-MM-DD)
      const dateParts = c.date.split("-");
      const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

      const monthYear = dateObj.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

      if (!grouped[monthYear]) {
        grouped[monthYear] = {
          month: monthYear,
          totalProjects: 0,
          grossRevenue: 0,
          totalProdCost: 0,
        };
      }
      grouped[monthYear].totalProjects += 1;
      grouped[monthYear].grossRevenue += parseFloat(c.amount || 0);
      grouped[monthYear].totalProdCost += parseFloat(c.productionCost || 0);
    });

    const reportArray = Object.values(grouped).map((m) => {
      // Har month ke liye marketing expense minus ho rahi hai
      const netProfit = Math.max(
        0,
        m.grossRevenue - m.totalProdCost - manualMarketing
      );
      const sadqaVal = netProfit > 0 ? netProfit * sadqaRate : 0;

      overallGross += m.grossRevenue;
      overallSadqa += sadqaVal;
      overallNet += netProfit;

      return { ...m, netProfit, sadqa: sadqaVal };
    });

    return {
      reports: reportArray,
      totals: { overallGross, overallNet, overallSadqa },
    };
  }, [clients, sadqaRate, manualMarketing]);

  return (
    <div style={pageContainer}>
      {/* Baaki saara UI same rahega jo aapne pehle diya tha */}
      <div style={contentWrapper}>
        <div style={headerFlex}>
          <h1 style={mainTitle}>
            Finance <span style={{ color: "#0ea5e9" }}>Orbit</span>
          </h1>
          <div style={dateBadge}>2026 Report</div>
        </div>

        <div style={configSection}>
          <div style={lightCard}>
            <label style={configLabel}>Monthly Marketing Expense</label>
            <div style={inputContainer}>
              <span style={inputPrefix}>$</span>
              <input
                type="number"
                value={manualMarketing}
                onChange={(e) =>
                  setManualMarketing(
                    Math.max(0, parseFloat(e.target.value) || 0)
                  )
                }
                style={cleanInput}
                placeholder="0.00"
              />
            </div>
          </div>
          <div style={lightCard}>
            <label style={configLabel}>Sadqa Percentage (%)</label>
            <select
              value={sadqaRate}
              onChange={(e) => setSadqaRate(parseFloat(e.target.value))}
              style={cleanSelect}
            >
              <option value={0.1}>10% - Recommended</option>
              <option value={0.05}>5% - Basic</option>
            </select>
          </div>
        </div>

        <div style={statsGrid}>
          <div style={statCard}>
            <p style={statLabel}>Total Revenue</p>
            <h2 style={statValueBlue}>
              ${totals.overallGross.toLocaleString()}
            </h2>
          </div>
          <div style={statCard}>
            <p style={statLabel}>Total Net Profit</p>
            <h2 style={statValueBlack}>
              ${totals.overallNet.toLocaleString()}
            </h2>
          </div>
          <div style={statCard}>
            <p style={statLabel}>Total Sadqa Fund</p>
            <h2 style={statValueBlue}>
              ${totals.overallSadqa.toLocaleString()}
            </h2>
          </div>
        </div>

        <div style={tableContainer}>
          <div style={tableHeader}>Monthly Breakdown</div>
          <table style={modernTable}>
            <thead>
              <tr>
                <th style={thStyle}>Month & Year</th>
                <th style={thStyle}>Projects</th>
                <th style={thStyle}>Revenue</th>
                <th style={thStyle}>Total Cost</th>
                <th style={thStyle}>Profit</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Sadqa Fund</th>
              </tr>
            </thead>
            <tbody>
              {reports.length > 0 ? (
                reports.map((r, i) => (
                  <tr key={i} style={trStyle}>
                    <td style={tdMonth}>{r.month}</td>
                    <td style={tdStyle}>{r.totalProjects}</td>
                    <td style={tdStyle}>${r.grossRevenue.toFixed(0)}</td>
                    <td style={tdStyle}>
                      ${(r.totalProdCost + manualMarketing).toFixed(0)}
                    </td>
                    <td
                      style={{
                        ...tdStyle,
                        color: "#0f172a",
                        fontWeight: "800",
                      }}
                    >
                      ${r.netProfit.toFixed(0)}
                    </td>
                    <td style={tdSadqa}>${r.sadqa.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      padding: "20px",
                      textAlign: "center",
                      color: "#64748b",
                    }}
                  >
                    No data found in Supabase.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Styles (Aapne jo diye thay wohi same hain...)
const pageContainer = {
  padding: "48px 40px",
  minHeight: "100vh",
  fontFamily: "'Inter', sans-serif",
  background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)",
};
const contentWrapper = { maxWidth: "1200px", margin: "0 auto" };
const headerFlex = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "40px",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "20px",
};
const mainTitle = {
  fontSize: "42px",
  fontWeight: "900",
  color: "#0f172a",
  margin: 0,
  letterSpacing: "-1px",
  background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  lineHeight: "1.2",
};
const configSection = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "24px",
  marginBottom: "40px",
};
const lightCard = {
  background: "linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)",
  padding: "28px",
  borderRadius: "20px",
  border: "1px solid rgba(226, 232, 240, 0.8)",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)",
  transition: "all 0.3s ease",
};
const configLabel = {
  fontSize: "12px",
  fontWeight: "700",
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "1px",
  marginBottom: "12px",
  display: "block",
};
const inputContainer = {
  display: "flex",
  alignItems: "center",
  position: "relative",
};
const inputPrefix = {
  position: "absolute",
  left: "16px",
  color: "#0ea5e9",
  fontWeight: "800",
  fontSize: "16px",
  zIndex: 1,
};
const cleanInput = {
  width: "100%",
  padding: "14px 16px 14px 32px",
  borderRadius: "12px",
  border: "2px solid rgba(241, 245, 249, 0.8)",
  outline: "none",
  fontSize: "15px",
  fontWeight: "600",
  background: "#ffffff",
  color: "#0f172a",
  transition: "all 0.2s ease",
};
const cleanSelect = { ...cleanInput, padding: "14px 16px", cursor: "pointer" };
const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "24px",
  marginBottom: "40px",
};
const statCard = {
  background: "linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)",
  padding: "32px 28px",
  borderRadius: "20px",
  border: "1px solid rgba(226, 232, 240, 0.8)",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  overflow: "hidden",
};
const statLabel = {
  color: "#64748b",
  fontSize: "12px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "1px",
  marginBottom: "12px",
  display: "block",
};
const statValueBlue = {
  fontSize: "36px",
  fontWeight: "900",
  margin: 0,
  background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  letterSpacing: "-1px",
  lineHeight: "1.1",
};
const statValueBlack = {
  fontSize: "36px",
  fontWeight: "900",
  margin: 0,
  color: "#0f172a",
  letterSpacing: "-1px",
  lineHeight: "1.1",
};
const tableContainer = {
  background: "linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)",
  borderRadius: "24px",
  padding: "32px",
  border: "1px solid rgba(226, 232, 240, 0.8)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
};
const tableHeader = {
  fontSize: "22px",
  fontWeight: "800",
  marginBottom: "24px",
  color: "#0f172a",
  letterSpacing: "-0.5px",
};
const modernTable = { width: "100%", borderCollapse: "collapse" };
const thStyle = {
  padding: "18px 16px",
  textAlign: "left",
  fontSize: "11px",
  color: "#64748b",
  textTransform: "uppercase",
  fontWeight: "800",
  letterSpacing: "1px",
  borderBottom: "2px solid rgba(241, 245, 249, 0.8)",
  background: "rgba(248, 250, 252, 0.5)",
};
const trStyle = {
  borderBottom: "1px solid rgba(241, 245, 249, 0.6)",
  transition: "all 0.2s ease",
};
const tdStyle = {
  padding: "18px 16px",
  fontSize: "14px",
  color: "#475569",
  fontWeight: "500",
};
const tdMonth = {
  ...tdStyle,
  fontWeight: "700",
  color: "#0f172a",
  fontSize: "15px",
};
const tdSadqa = {
  ...tdStyle,
  textAlign: "right",
  background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  fontWeight: "800",
  fontSize: "15px",
};
const dateBadge = {
  background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
  color: "white",
  padding: "10px 20px",
  borderRadius: "12px",
  fontSize: "14px",
  fontWeight: "700",
  boxShadow: "0 4px 16px rgba(15, 23, 42, 0.3)",
  letterSpacing: "-0.3px",
};

export default MonthlyReport;
