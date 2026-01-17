"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./page.module.css";

const ClientPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [uniqueClientNames, setUniqueClientNames] = useState([]);
  const [expandedClient, setExpandedClient] = useState(null);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [formData, setFormData] = useState({
    clientName: "",
    date: "",
    amount: "",
    productionCost: "",
    platform: "Direct",
  });

  const fetchClients = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) {
        console.error(error.message);
      } else {
        setClients(data || []);
        const names = [...new Set(data.map((item) => item.clientname))].filter(
          Boolean,
        );
        setUniqueClientNames(names.sort());
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const groupedClients = clients.reduce((acc, client) => {
    if (!acc[client.clientname]) {
      acc[client.clientname] = [];
    }
    acc[client.clientname].push(client);
    return acc;
  }, {});

  const handleAddOrderFromRow = (e, existingName) => {
    e.stopPropagation();
    setFormData({
      clientName: existingName,
      date: new Date().toISOString().split("T")[0],
      amount: "",
      productionCost: "",
      platform: "Direct",
    });
    setEditingOrderId(null);
    setIsOpen(true);
  };

  const handleEditOrder = (e, order) => {
    e.stopPropagation();
    setFormData({
      clientName: order.clientname,
      date: order.date,
      amount: order.amount,
      productionCost: order.productioncost || "",
      platform: order.platform || "Direct",
    });
    setEditingOrderId(order.id);
    setIsOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const amt = parseFloat(formData.amount);
    const cost = parseFloat(formData.productionCost);

    if (amt <= cost) {
      alert("Error: Total Amount must be greater than Production Cost.");
      return;
    }

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Authentication failed");

      const payload = {
        clientname: formData.clientName,
        platform: formData.platform,
        date: formData.date,
        amount: Math.round(amt),
        productioncost: Math.round(cost),
        user_id: user.id,
      };

      if (editingOrderId) {
        const { error } = await supabase
          .from("clients")
          .update(payload)
          .eq("id", editingOrderId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("clients").insert([payload]);
        if (error) throw error;
      }

      await fetchClients();
      setFormData({
        clientName: "",
        date: new Date().toISOString().split("T")[0],
        amount: "",
        productionCost: "",
        platform: "Direct",
      });
      setEditingOrderId(null);
      setIsOpen(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const deleteClient = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete entry?")) return;
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (!error) fetchClients();
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.headerFlex}>
          <div>
            <h1 className={styles.mainTitle}>
              Project <span style={{ color: "#0ea5e9" }}>Manager</span>
            </h1>
            <p className={styles.subTitle}>
              Click on a client to see order history
            </p>
          </div>
          <button
            onClick={() => {
              setFormData({
                clientName: "",
                date: new Date().toISOString().split("T")[0],
                amount: "",
                productionCost: "",
                platform: "Direct",
              });
              setEditingOrderId(null);
              setIsOpen(true);
            }}
            className={styles.btnPrimary}
          >
            + Add New Entry
          </button>
        </div>

        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>Clients Entries</div>
          <table className={styles.modernTable}>
            <thead>
              <tr>
                <th className={styles.thStyle}>Client</th>
                <th className={styles.thStyle}>Platform</th>
                <th className={styles.thStyle}>Last Date</th>
                <th className={styles.thStyle}>Total Entries</th>
                <th className={`${styles.thStyle} ${styles.thRight}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(groupedClients).map((name) => (
                <React.Fragment key={name}>
                  <tr
                    onClick={() =>
                      setExpandedClient(expandedClient === name ? null : name)
                    }
                    className={
                      expandedClient === name
                        ? styles.trStyleExpanded
                        : styles.trStyleCollapsed
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <td className={styles.tdClientName}>
                      <span
                        style={{
                          marginRight: "10px",
                          display: "inline-block",
                          transition: "transform 0.2s",
                          transform:
                            expandedClient === name
                              ? "rotate(0deg)"
                              : "rotate(-90deg)",
                          fontSize: "12px",
                          color: "#0ea5e9",
                        }}
                      >
                        ▼
                      </span>
                      {name}
                    </td>
                    <td className={styles.tdStyle}>
                      <span className={styles.platformBadge}>
                        {groupedClients[name][0].platform}
                      </span>
                    </td>
                    <td className={styles.tdStyle}>
                      {groupedClients[name][0].date}
                    </td>
                    <td className={styles.tdStyle}>
                      {groupedClients[name].length} Orders
                    </td>
                    <td className={`${styles.tdStyle} ${styles.tdRight}`}>
                      <button
                        onClick={(e) => handleAddOrderFromRow(e, name)}
                        className={styles.addRowOrderBtn}
                      >
                        + Order
                      </button>
                    </td>
                  </tr>

                  {expandedClient === name && (
                    <tr>
                      <td colSpan="5" className={styles.dropdownCell}>
                        <table className={styles.innerTable}>
                          <thead className={styles.innerThead}>
                            <tr>
                              <th className={styles.innerTh}>Date</th>
                              <th className={styles.innerTh}>Platform</th>
                              <th className={styles.innerTh}>Total Amount</th>
                              <th className={styles.innerTh}>
                                Production Cost
                              </th>
                              <th className={`${styles.innerTh} ${styles.thRight}`}>
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {groupedClients[name].map((order) => (
                              <tr key={order.id} className={styles.innerTr}>
                                <td className={styles.innerTd}>{order.date}</td>
                                <td className={styles.innerTd}>
                                  {order.platform}
                                </td>
                                <td
                                  className={styles.innerTd}
                                  style={{
                                    color: "#0ea5e9",
                                    fontWeight: "700",
                                  }}
                                >
                                  ${Math.round(parseFloat(order.amount) || 0)}
                                </td>
                                <td className={styles.innerTd}>
                                  ${Math.round(parseFloat(order.productioncost) || 0)}
                                </td>
                                <td className={`${styles.innerTd} ${styles.tdRight}`}>
                                  <div className={styles.actionButtons}>
                                    <button
                                      onClick={(e) => handleEditOrder(e, order)}
                                      className={styles.editBtn}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={(e) => deleteClient(e, order.id)}
                                      className={styles.deleteBtn}
                                    >
                                      Remove
                                    </button>
                                  </div>
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

      {isOpen && (
        <>
          <div onClick={() => setIsOpen(false)} className={styles.overlay} />
          <div className={styles.drawer}>
            <h3 className={styles.drawerTitle}>
              {editingOrderId ? `Edit Order` : "New Entry"}
            </h3>
            <form onSubmit={handleSubmit} className={styles.formStyle}>
              <label className={styles.labelStyle}>Client Name</label>
              <input
                list="client-suggestions"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                placeholder="Type or select client name..."
                className={styles.cleanInput}
                required
                autoComplete="off"
              />
              <datalist id="client-suggestions">
                {uniqueClientNames.map((n) => (
                  <option key={n} value={n} />
                ))}
              </datalist>

              <label className={styles.labelStyle}>Platform</label>
              <select
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                className={styles.cleanSelect}
              >
                <option value="Direct">Direct</option>
                <option value="Upwork">Upwork</option>
                <option value="Fiverr">Fiverr</option>
              </select>

              <label className={styles.labelStyle}>Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className={styles.cleanInput}
              />

              <label className={styles.labelStyle}>Amount ($)</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                className={styles.cleanInput}
                step="1"
              />

              <label className={styles.labelStyle}>Cost ($)</label>
              <input
                type="number"
                name="productionCost"
                value={formData.productionCost}
                onChange={handleChange}
                required
                className={styles.cleanInput}
                step="1"
              />

              <button type="submit" className={styles.btnSubmit}>
                {editingOrderId ? "Update Order" : "Save Order"}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className={styles.btnCancel}
              >
                Cancel
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default ClientPage;
