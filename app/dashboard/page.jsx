"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import styles from "./page.module.css";

const Dashboard = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setClients([]);
        setLoading(false);
        return;
      }

      // 2. Fetch only THIS user's data
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", user.id) // <--- ONLY your data
        .order("created_at", { ascending: false });

      if (error) throw error;

      setClients(data || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error.message);
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
      0,
    );
    const totalProjects = clients.length;
    const totalCost = clients.reduce(
      (acc, curr) => acc + Number(curr.productioncost || 0),
      0,
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

  // Hover Handlers for Stat Cards
  const handleMouseEnter = (e) => {
    e.currentTarget.style.transform = "translateY(-6px)";
    e.currentTarget.style.boxShadow = "0 15px 45px rgba(14, 165, 233, 0.2)";
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.06)";
  };

  if (loading)
    return (
      <div className={styles.loaderStyle}>
        <div className={styles.spinner}></div>
      </div>
    );

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.headerSection}>
          <h1 className={styles.mainTitle}>
            Dashboard <span style={{ color: "#0ea5e9" }}>Overview</span>
          </h1>
          <p className={styles.subTitle}>
            Tracking {clients.length} projects in real-time.
          </p>
        </div>

        {/* Improved Stats Grid */}
        <div className={styles.statsGrid}>
          <div
            className={styles.statCard}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <p className={styles.statLabel}>Lifetime Revenue</p>
            <h2 className={styles.statValue}>${stats.totalRevenue}</h2>
            <div className={styles.cardFooter}>Total cash inflow</div>
          </div>
          <div
            className={styles.statCard}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <p className={styles.statLabel}>Net Profit</p>
            <h2
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: "32px",
                fontWeight: "800",
                margin: 0,
              }}
            >
              ${stats.netProfit}
            </h2>
            <div className={styles.cardFooter}>After production costs</div>
          </div>
          <div
            className={styles.statCard}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <p className={styles.statLabel}>Total Projects</p>
            <h2 className={styles.statValueBlack}>{stats.totalProjects}</h2>
            <div className={styles.cardFooter}>Completed orders</div>
          </div>
          <div
            className={styles.statCard}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <p className={styles.statLabel}>Avg. Project Value</p>
            <h2 className={styles.statValueBlack}>${stats.avgProjectValue}</h2>
            <div className={styles.cardFooter}>Per project average</div>
          </div>
        </div>

        {/* Detailed Activity Table */}
        <div className={styles.activityCard}>
          <div className={styles.headerFlex}>
            <h3 className={styles.cardTitle}>Recent Client Activity</h3>
            <span className={styles.viewAllBadge}>
              Latest {clients.length} entries
            </span>
          </div>

          <div className={styles.activityContainer}>
            {clients.length > 0 ? (
              clients.map((c, i) => (
                <div key={i} className={styles.activityRow}>
                  <div className={styles.activityRowContent}>
                    <div className={styles.avatarCircle}>
                      {c.clientname?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span className={styles.clientNameText}>
                        {c.clientname}
                      </span>
                      <span className={styles.dateText}>
                        {c.date} •{" "}
                        <span style={{ color: "#0ea5e9" }}>
                          {c.platform || "Direct"}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className={styles.amountValue}>
                      +${Number(c.amount).toLocaleString()}
                    </div>
                    <div className={styles.costText}>
                      Cost: ${c.productioncost || 0}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateContent}>
                  <p className={styles.emptyStateMessage}>
                    Add your first client to see the data.
                  </p>
                  <Link href="/clients" className={styles.emptyStateButton}>
                    Add Client Entry
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
