"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  HomeIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";

const Sidebar = () => {
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const menuItems = [
    {
      icon: <HomeIcon style={{ width: 20 }} />,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      icon: <UsersIcon style={{ width: 20 }} />,
      label: "Clients",
      href: "/clients",
    },
    {
      icon: <ChartBarIcon style={{ width: 20 }} />,
      label: "Monthly Report",
      href: "/monthlyreport",
    },
  ];

  return (
    <div style={sidebarStyle}>
      <div style={{ padding: "30px 20px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "800" }}>
          Finance<span style={{ color: "#0ea5e9" }}>Orbit</span>
        </h2>
      </div>
      <nav style={{ flex: 1, padding: "0 10px" }}>
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px",
              textDecoration: "none",
              borderRadius: "8px",
              marginBottom: "5px",
              color: pathname === item.href ? "#0ea5e9" : "#64748b",
              background: pathname === item.href ? "#f0f9ff" : "transparent",
            }}
          >
            {item.icon} <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div style={{ padding: "20px", borderTop: "1px solid #f1f5f9" }}>
        <button onClick={handleLogout} style={logoutButtonStyle}>
          <ArrowLeftOnRectangleIcon style={{ width: 18 }} /> Logout
        </button>
      </div>
    </div>
  );
};

const sidebarStyle = {
  width: "240px",
  height: "100vh",
  position: "fixed",
  left: 0,
  top: 0,
  background: "#fff",
  borderRight: "1px solid #e2e8f0",
  display: "flex",
  flexDirection: "column",
};
const logoutButtonStyle = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "10px",
  background: "#fff1f2",
  color: "#ef4444",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};

export default Sidebar;
