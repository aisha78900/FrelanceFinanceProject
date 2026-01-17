"use client";
import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./page.module.css";

const MonthlyReport = () => {
  const [clients, setClients] = useState([]);
  const [marketSpendEntries, setMarketSpendEntries] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [marketSpendForm, setMarketSpendForm] = useState({
    month: "",
    year: new Date().getFullYear().toString(),
    amount: "",
  });

  const downloadMonthlyCSV = (monthReport) => {
    // Get all clients for this specific month
    const monthClients = clients.filter((c) => {
      if (!c.date) return false;
      const dateParts = c.date.split("-");
      const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
      const monthYear = dateObj.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      return monthYear === monthReport.month;
    });

    // Create CSV content
    let csvContent = "Monthly Report - " + monthReport.month + "\n\n";
    
    // Summary section
    csvContent += "Summary\n";
    csvContent += "Total Projects," + monthReport.totalProjects + "\n";
    csvContent += "Gross Revenue,$" + monthReport.grossRevenue.toFixed(2) + "\n";
    csvContent += "Production Cost,$" + monthReport.totalProdCost.toFixed(2) + "\n";
    csvContent += "Market Spend,$" + monthReport.marketSpend.toFixed(2) + "\n";
    csvContent += "Net Profit,$" + monthReport.netProfit.toFixed(2) + "\n\n";
    
    // Project details section
    if (monthClients.length > 0) {
      csvContent += "Project Details\n";
      csvContent += "Client Name,Date,Amount,Production Cost,Net Profit\n";
      
      monthClients.forEach((client) => {
        const clientProfit = (parseFloat(client.amount || 0) - parseFloat(client.productionCost || 0)).toFixed(2);
        csvContent += `"${client.clientname || 'N/A'}",${client.date},"$${parseFloat(client.amount || 0).toFixed(2)}","$${parseFloat(client.productionCost || 0).toFixed(2)}","$${clientProfit}"\n`;
      });
    }

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Monthly_Report_${monthReport.month.replace(" ", "_")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchClientsFromSupabase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching data:", error.message);
      } else {
        const mappedData = data.map((item) => ({
          ...item,
          amount: item.amount,
          productionCost: item.productioncost,
          date: item.date,
        }));
        setClients(mappedData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMarketSpend = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("market_spend")
        .select("*")
        .eq("user_id", user.id)
        .order("year", { ascending: false })
        .order("month", { ascending: false });

      if (error) {
        console.error("Error fetching market spend:", error.message);
      } else {
        setMarketSpendEntries(data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClientsFromSupabase();
    fetchMarketSpend();
  }, []);

  const { reports, totals } = useMemo(() => {
    const grouped = {};
    let overallGross = 0;
    let overallProdCost = 0;
    let overallNet = 0;
    let totalMarketingSpend = 0;

    // Group clients by month
    clients.forEach((c) => {
      if (!c.date) return;
      const dateParts = c.date.split("-");
      const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

      const monthYear = dateObj.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

      if (!grouped[monthYear]) {
        grouped[monthYear] = {
          month: monthYear,
          monthNum: dateParts[1],
          year: dateParts[0],
          totalProjects: 0,
          grossRevenue: 0,
          totalProdCost: 0,
          marketSpend: 0,
        };
      }
      grouped[monthYear].totalProjects += 1;
      grouped[monthYear].grossRevenue += parseFloat(c.amount || 0);
      grouped[monthYear].totalProdCost += parseFloat(c.productionCost || 0);
    });

    // Add market spend to each month
    marketSpendEntries.forEach((entry) => {
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const monthName = monthNames[parseInt(entry.month) - 1];
      const monthYear = `${monthName} ${entry.year}`;
      
      if (grouped[monthYear]) {
        grouped[monthYear].marketSpend += parseFloat(entry.amount || 0);
      } else {
        // Create entry for month with only market spend
        grouped[monthYear] = {
          month: monthYear,
          monthNum: entry.month,
          year: entry.year,
          totalProjects: 0,
          grossRevenue: 0,
          totalProdCost: 0,
          marketSpend: parseFloat(entry.amount || 0),
        };
      }
    });

    const reportArray = Object.values(grouped).map((m) => {
      const netProfit = Math.max(0, m.grossRevenue - m.totalProdCost - m.marketSpend);

      overallGross += m.grossRevenue;
      overallProdCost += m.totalProdCost;
      totalMarketingSpend += m.marketSpend;
      overallNet += netProfit;

      return { ...m, netProfit };
    });

    return {
      reports: reportArray.sort((a, b) => {
        // Sort by year and month
        if (a.year !== b.year) return b.year.localeCompare(a.year);
        return parseInt(b.monthNum) - parseInt(a.monthNum);
      }),
      totals: { 
        overallGross, 
        overallProdCost, 
        totalMarketingSpend, 
        overallNet
      },
    };
  }, [clients, marketSpendEntries]);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.headerFlex}>
          <h1 className={styles.mainTitle}>
            Finance <span style={{ color: "#0ea5e9" }}>Orbit</span>
          </h1>
          <div className={styles.dateBadge}>2026 Report</div>
        </div>


        <div className={styles.statsGrid} style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>
              Total Revenue
              <span className={styles.infoIcon} data-tooltip="This is total revenue coming from all the orders.">
                i
              </span>
            </p>
            <h2 className={styles.statValueBlue}>${totals.overallGross.toLocaleString()}</h2>
          </div>
          
          <div className={styles.statCard}>
            <p className={styles.statLabel}>
              Production Cost
              <span className={styles.infoIcon} data-tooltip="This is the total cost which is paid to the team or employees for the work.">
                i
              </span>
            </p>
            <h2 style={{ color: "#f43f5e" }} className={styles.statValue}>
              -${totals.overallProdCost.toLocaleString()}
            </h2>
          </div>

          <div className={styles.statCard}>
            <p className={styles.statLabel}>
              Marketing Spend
              <span className={styles.infoIcon} data-tooltip="This is market spend we spend on Upwork, Fiverr, tools, or etc. (like we spend on connects).">
                i
              </span>
            </p>
            <h2 style={{ color: "#f59e0b" }} className={styles.statValue}>
              -${totals.totalMarketingSpend.toLocaleString()}
            </h2>
          </div>

          <div className={styles.statCard}>
            <p className={styles.statLabel}>
              Total Net Profit
              <span className={styles.infoIcon} data-tooltip="This is the real profit after subtracting production cost and market spend.">
                i
              </span>
            </p>
            <h2 className={styles.statValueBlack}>${totals.overallNet.toLocaleString()}</h2>
          </div>

        </div>

        <div className={styles.tableContainer}>
          <div className={styles.tableHeaderContainer}>
            <div className={styles.tableHeader}>Monthly Breakdown</div>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className={styles.addReportButton}
            >
              Add Market Spend
            </button>
          </div>
          <table className={styles.modernTable}>
            <thead>
              <tr>
                <th className={styles.thStyle}>Month & Year</th>
                <th className={styles.thStyle}>Projects</th>
                <th className={styles.thStyle}>Revenue</th>
                <th className={styles.thStyle}>Production Cost</th>
                <th className={styles.thStyle}>Market Spend</th>
                <th className={styles.thStyle} style={{ textAlign: "right" }}>Profit</th>
                <th className={styles.thStyle} style={{ textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.length > 0 ? (
                reports.map((r, i) => (
                  <tr key={i} className={styles.trStyle}>
                    <td className={styles.tdMonth}>{r.month}</td>
                    <td className={styles.tdStyle}>{r.totalProjects}</td>
                    <td className={styles.tdStyle}>${r.grossRevenue.toFixed(0)}</td>
                    <td className={styles.tdStyle}>${r.totalProdCost.toFixed(0)}</td>
                    <td className={styles.tdStyle} style={{ color: "#f59e0b", fontWeight: "600" }}>
                      ${r.marketSpend.toFixed(0)}
                    </td>
                    <td className={styles.tdProfit} style={{ textAlign: "right" }}>
                      ${r.netProfit.toFixed(0)}
                    </td>
                    <td className={styles.tdStyle} style={{ textAlign: "center" }}>
                      <button
                        onClick={() => downloadMonthlyCSV(r)}
                        className={styles.downloadButton}
                        title="Download CSV"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
                    No data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Drawer */}
      {isDrawerOpen && (
        <>
          <div
            onClick={() => setIsDrawerOpen(false)}
            className={styles.overlay}
          />
          <div className={styles.drawer}>
            <div className={styles.drawerHeader}>
              <h3 className={styles.drawerTitle}>Add Market Spend</h3>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>

            {/* Market Spend Entries List */}
            <div className={styles.entriesList}>
              <h4 className={styles.formSectionTitle}>Existing Market Spend</h4>
              {marketSpendEntries.length > 0 ? (
                <div className={styles.entriesContainer}>
                  {marketSpendEntries.map((entry, index) => {
                    const monthNames = [
                      "January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"
                    ];
                    const monthName = monthNames[parseInt(entry.month) - 1];
                    return (
                      <div key={entry.id || index} className={styles.entryItem}>
                        <div className={styles.entryInfo}>
                          <span className={styles.entryMonth}>{monthName} {entry.year}</span>
                          <span className={styles.entryAmount}>${parseFloat(entry.amount || 0).toFixed(0)}</span>
                        </div>
                        <button
                          onClick={async () => {
                            const { error } = await supabase
                              .from("market_spend")
                              .delete()
                              .eq("id", entry.id);
                            if (!error) fetchMarketSpend();
                          }}
                          className={styles.deleteEntryButton}
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className={styles.noEntries}>No market spend entries yet.</p>
              )}
            </div>

            {/* Add New Market Spend Form */}
            <div className={styles.formSection}>
              <h4 className={styles.formSectionTitle}>Add New Market Spend</h4>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Month</label>
                  <select
                    value={marketSpendForm.month}
                    onChange={(e) =>
                      setMarketSpendForm({ ...marketSpendForm, month: e.target.value })
                    }
                    className={styles.cleanSelect}
                    required
                  >
                    <option value="">Select Month</option>
                    <option value="01">January</option>
                    <option value="02">February</option>
                    <option value="03">March</option>
                    <option value="04">April</option>
                    <option value="05">May</option>
                    <option value="06">June</option>
                    <option value="07">July</option>
                    <option value="08">August</option>
                    <option value="09">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Year</label>
                  <input
                    type="number"
                    value={marketSpendForm.year}
                    onChange={(e) =>
                      setMarketSpendForm({ ...marketSpendForm, year: e.target.value })
                    }
                    className={styles.cleanInput}
                    placeholder="2026"
                    min="2020"
                    max="2100"
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Market Spend Amount ($)</label>
                <div className={styles.inputContainer}>
                  <span className={styles.inputPrefix}>$</span>
                  <input
                    type="number"
                    value={marketSpendForm.amount}
                    onChange={(e) =>
                      setMarketSpendForm({
                        ...marketSpendForm,
                        amount: e.target.value,
                      })
                    }
                    className={styles.cleanInput}
                    placeholder="0.00"
                    step="1"
                    required
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  if (!marketSpendForm.month || !marketSpendForm.year || !marketSpendForm.amount) {
                    alert("Please fill in all fields");
                    return;
                  }

                  const { data: { user } } = await supabase.auth.getUser();
                  if (!user) {
                    alert("Please login to add market spend");
                    return;
                  }

                  const { error } = await supabase.from("market_spend").insert([
                    {
                      month: marketSpendForm.month,
                      year: marketSpendForm.year,
                      amount: Math.round(parseFloat(marketSpendForm.amount)),
                      user_id: user.id,
                    },
                  ]);

                  if (error) {
                    alert("Error: " + error.message);
                  } else {
                    setMarketSpendForm({
                      month: "",
                      year: new Date().getFullYear().toString(),
                      amount: "",
                    });
                    fetchMarketSpend();
                  }
                }}
                className={styles.submitButton}
              >
                Add Market Spend
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MonthlyReport;