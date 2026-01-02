"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const ClientPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [clients, setClients] = useState([]);
  const [uniqueClientNames, setUniqueClientNames] = useState([]);
  const [expandedClient, setExpandedClient] = useState(null); // Dropdown handle karne ke liye
  const [formData, setFormData] = useState({
    clientName: "",
    date: "",
    amount: "",
    productionCost: "",
    platform: "Direct",
  });

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching:", error.message);
    } else {
      setClients(data);
      const names = [...new Set(data.map((item) => item.clientname))];
      setUniqueClientNames(names.sort());
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // --- Data ko Client wise group karna ---
  const groupedClients = clients.reduce((acc, client) => {
    if (!acc[client.clientname]) {
      acc[client.clientname] = [];
    }
    acc[client.clientname].push(client);
    return acc;
  }, {});

  const handleAddOrderFromRow = (e, existingName) => {
    e.stopPropagation(); // Row click dropdown ko rokne ke liye
    setFormData({
      clientName: existingName,
      date: new Date().toISOString().split("T")[0],
      amount: "",
      productionCost: "",
      platform: "Direct",
    });
    setIsAddingNew(false);
    setIsOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("clients").insert([
        {
          clientname: formData.clientName,
          platform: formData.platform,
          date: formData.date,
          amount: parseFloat(formData.amount).toFixed(2),
          productioncost: parseFloat(formData.productionCost).toFixed(2),
        },
      ]);
      if (error) throw error;
      await fetchClients();
      setFormData({
        clientName: "",
        date: "",
        amount: "",
        productionCost: "",
        platform: "Direct",
      });
      setIsOpen(false);
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const deleteClient = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete entry?")) return;
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (!error) fetchClients();
  };

  return (
    <div style={pageContainer}>
      <div style={contentWrapper}>
        <div style={headerFlex}>
          <div>
            <h1 style={mainTitle}>
              Project <span style={{ color: "#0ea5e9" }}>Manager</span>
            </h1>
            <p style={subTitle}>Click on a client to see order history</p>
          </div>
          <button
            onClick={() => {
              setFormData({ ...formData, clientName: "" });
              setIsOpen(true);
            }}
            style={btnPrimaryStyle}
          >
            + Add New Entry
          </button>
        </div>

        <div style={tableContainer}>
          <div style={tableHeader}>Transaction History</div>
          <table style={modernTable}>
            <thead>
              <tr>
                <th style={thStyle}>Client</th>
                <th style={thStyle}>Platform</th>
                <th style={thStyle}>Last Date</th>
                <th style={thStyle}>Total Entries</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(groupedClients).map((name) => (
                <React.Fragment key={name}>
                  {/* MAIN CLIENT ROW */}
                  <tr
                    onClick={() =>
                      setExpandedClient(expandedClient === name ? null : name)
                    }
                    style={{
                      ...trStyle,
                      cursor: "pointer",
                      background:
                        expandedClient === name ? "#f0f9ff" : "transparent",
                    }}
                  >
                    <td style={tdClientName}>
                      {expandedClient === name ? "▼ " : "▶ "} {name}
                    </td>
                    <td style={tdStyle}>
                      <span style={platformBadge}>
                        {groupedClients[name][0].platform}
                      </span>
                    </td>
                    <td style={tdStyle}>{groupedClients[name][0].date}</td>
                    <td style={tdStyle}>
                      {groupedClients[name].length} Orders
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <button
                        onClick={(e) => handleAddOrderFromRow(e, name)}
                        style={addRowOrderBtn}
                      >
                        + Order
                      </button>
                    </td>
                  </tr>

                  {/* DROPDOWN ORDERS TABLE */}
                  {expandedClient === name && (
                    <tr>
                      <td
                        colSpan="5"
                        style={{
                          padding: "0 0 20px 40px",
                          background: "#f8fafc",
                        }}
                      >
                        <table
                          style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            marginTop: "10px",
                          }}
                        >
                          <thead style={{ background: "#f1f5f9" }}>
                            <tr>
                              <th style={innerTh}>Date</th>
                              <th style={innerTh}>Platform</th>
                              <th style={innerTh}>Amount</th>
                              <th style={innerTh}>Cost</th>
                              <th style={{ ...innerTh, textAlign: "right" }}>
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {groupedClients[name].map((order) => (
                              <tr
                                key={order.id}
                                style={{ borderBottom: "1px solid #e2e8f0" }}
                              >
                                <td style={innerTd}>{order.date}</td>
                                <td style={innerTd}>{order.platform}</td>
                                <td
                                  style={{
                                    ...innerTd,
                                    color: "#0ea5e9",
                                    fontWeight: "700",
                                  }}
                                >
                                  ${order.amount}
                                </td>
                                <td style={innerTd}>${order.productioncost}</td>
                                <td style={{ ...innerTd, textAlign: "right" }}>
                                  <button
                                    onClick={(e) => deleteClient(e, order.id)}
                                    style={deleteBtnStyle}
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer Form (Same as before) */}
      {isOpen && (
        <>
          <div onClick={() => setIsOpen(false)} style={overlayStyle} />
          <div style={drawerStyle}>
            <h3 style={drawerTitle}>
              {formData.clientName
                ? `New Order: ${formData.clientName}`
                : "New Entry"}
            </h3>
            <form onSubmit={handleSubmit} style={formStyle}>
              <label style={labelStyle}>Client Name</label>
              {isAddingNew ||
              (!formData.clientName &&
                !uniqueClientNames.includes(formData.clientName)) ? (
                <input
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  placeholder="Type name..."
                  style={cleanInput}
                  required
                />
              ) : (
                <select
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  style={cleanSelect}
                  required
                >
                  <option value="">-- Select Client --</option>
                  {uniqueClientNames.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              )}
              {/* ... Baki inputs (Platform, Date, Amount, Cost) same rahengi ... */}
              <label style={labelStyle}>Platform</label>
              <select
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                style={cleanSelect}
              >
                <option value="Direct">Direct</option>
                <option value="Upwork">Upwork</option>
                <option value="Fiverr">Fiverr</option>
              </select>
              <label style={labelStyle}>Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                style={cleanInput}
              />
              <label style={labelStyle}>Amount ($)</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                style={cleanInput}
                step="0.01"
              />
              <label style={labelStyle}>Cost ($)</label>
              <input
                type="number"
                name="productionCost"
                value={formData.productionCost}
                onChange={handleChange}
                required
                style={cleanInput}
                step="0.01"
              />
              <button type="submit" style={btnSubmitStyle}>
                Save Order
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

// --- Styles ---
const innerTh = {
  padding: "10px",
  fontSize: "11px",
  color: "#64748b",
  textAlign: "left",
  textTransform: "uppercase",
};
const innerTd = { padding: "10px", fontSize: "13px", color: "#475569" };
const addRowOrderBtn = {
  background: "#0ea5e9",
  color: "white",
  border: "none",
  padding: "6px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "700",
};
const pageContainer = {
  padding: "48px 40px",
  minHeight: "100vh",
  fontFamily: "'Inter', sans-serif",
  background: "#f8fafc",
};
const contentWrapper = { maxWidth: "1200px", margin: "0 auto" };
const headerFlex = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "40px",
};
const mainTitle = { fontSize: "42px", fontWeight: "900", margin: 0 };
const subTitle = { color: "#64748b", fontSize: "16px", marginTop: "8px" };
const btnPrimaryStyle = {
  padding: "14px 28px",
  background: "#0ea5e9",
  color: "white",
  border: "none",
  borderRadius: "14px",
  cursor: "pointer",
  fontWeight: "700",
};
const tableContainer = {
  background: "#fff",
  borderRadius: "24px",
  padding: "32px",
  border: "1px solid #e2e8f0",
};
const tableHeader = {
  fontSize: "22px",
  fontWeight: "800",
  marginBottom: "24px",
};
const modernTable = { width: "100%", borderCollapse: "collapse" };
const thStyle = {
  padding: "18px 16px",
  textAlign: "left",
  color: "#64748b",
  fontSize: "11px",
  textTransform: "uppercase",
  borderBottom: "1px solid #f1f5f9",
};
const trStyle = { borderBottom: "1px solid #f1f5f9" };
const tdStyle = { padding: "18px 16px", fontSize: "14px", color: "#475569" };
const tdClientName = { ...tdStyle, fontWeight: "700", color: "#0f172a" };
const platformBadge = {
  background: "#e0f2fe",
  padding: "4px 10px",
  borderRadius: "6px",
  color: "#0ea5e9",
  fontWeight: "700",
  fontSize: "12px",
};
const deleteBtnStyle = {
  color: "#f43f5e",
  background: "none",
  border: "1px solid #fecdd3",
  padding: "4px 8px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "11px",
};
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  zIndex: 99,
};
const drawerStyle = {
  position: "fixed",
  top: 0,
  right: 0,
  width: "400px",
  height: "100%",
  background: "#fff",
  padding: "40px",
  zIndex: 100,
  boxShadow: "-4px 0 15px rgba(0,0,0,0.1)",
};
const drawerTitle = { fontSize: "24px", marginBottom: "24px" };
const labelStyle = {
  fontSize: "12px",
  fontWeight: "700",
  display: "block",
  marginBottom: "5px",
};
const cleanInput = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  marginBottom: "15px",
};
const cleanSelect = { ...cleanInput };
const btnSubmitStyle = {
  width: "100%",
  padding: "14px",
  background: "#0f172a",
  color: "white",
  borderRadius: "10px",
  border: "none",
  fontWeight: "700",
  cursor: "pointer",
};
const formStyle = { display: "flex", flexDirection: "column" };

export default ClientPage;
