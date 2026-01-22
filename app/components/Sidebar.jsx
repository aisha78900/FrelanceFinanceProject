"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  HomeIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const Sidebar = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const handleLogoutHover = (e, isEntering) => {
    if (isEntering) {
      e.currentTarget.style.background = "#fee2e2";
      e.currentTarget.style.transform = "translateY(-1px)";
      e.currentTarget.style.boxShadow = "0 2px 8px rgba(239, 68, 68, 0.2)";
    } else {
      e.currentTarget.style.background = "#fff1f2";
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "none";
    }
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
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
        aria-expanded={isMobileMenuOpen}
        style={{
          position: "fixed",
          top: "16px",
          left: "16px",
          zIndex: 2000,
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "12px",
          cursor: "pointer",
          display: "none",
          boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
          minWidth: "48px",
          minHeight: "48px",
          alignItems: "center",
          justifyContent: "center",
        }}
        className="mobile-menu-btn"
      >
        {isMobileMenuOpen ? (
          <XMarkIcon style={{ width: 24, height: 24, color: "#0f172a" }} />
        ) : (
          <Bars3Icon style={{ width: 24, height: 24, color: "#0f172a" }} />
        )}
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1998,
            display: "none",
          }}
          className="mobile-overlay"
        />
      )}

      <div style={sidebarStyle} className={`sidebar-container ${isMobileMenuOpen ? "sidebar-open" : ""}`}>
        <div style={{ padding: "30px 20px" }}>
          <h2 style={{ 
            fontSize: "22px", 
            fontWeight: "700",
            fontFamily: "'Montserrat', sans-serif",
            letterSpacing: "-0.5px",
            margin: 0
          }}>
            Finance<span style={{ color: "#0ea5e9" }}>Orbit</span>
          </h2>
        </div>
      <nav style={{ flex: 1, padding: "0 10px" }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px 16px",
                textDecoration: "none",
                borderRadius: "12px",
                marginBottom: "8px",
                color: isActive ? "#0ea5e9" : "#64748b",
                background: isActive 
                  ? "linear-gradient(135deg, rgba(14, 165, 233, 0.12) 0%, rgba(14, 165, 233, 0.08) 100%)" 
                  : "transparent",
                fontFamily: "'Poppins', sans-serif",
                fontSize: "15px",
                fontWeight: isActive ? "600" : "500",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                border: isActive ? "1px solid rgba(14, 165, 233, 0.2)" : "1px solid transparent",
                minHeight: "48px",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "#f8fafc";
                  e.currentTarget.style.transform = "translateX(2px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.transform = "translateX(0)";
                }
              }}
            >
              {item.icon} <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div style={{ padding: "20px", borderTop: "1px solid #f1f5f9" }}>
        <button 
          onClick={handleLogout} 
          onMouseEnter={(e) => handleLogoutHover(e, true)}
          onMouseLeave={(e) => handleLogoutHover(e, false)}
          style={{
            ...logoutButtonStyle,
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          <ArrowLeftOnRectangleIcon style={{ width: 18 }} /> Logout
        </button>
      </div>
      </div>

      <style jsx global>{`
        * {
          -webkit-tap-highlight-color: transparent;
        }
        
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: flex !important;
            align-items: center;
            justify-content: center;
            -webkit-tap-highlight-color: transparent;
          }
          
          .mobile-menu-btn:active {
            transform: scale(0.95);
          }
          
          .mobile-overlay {
            display: block !important;
            animation: fadeIn 0.3s ease;
          }
          
          .sidebar-container {
            transform: translateX(-100%);
            box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
          }
          
          .sidebar-container.sidebar-open {
            transform: translateX(0);
            animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
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
  fontFamily: "'Poppins', 'Montserrat', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif",
  zIndex: 1999,
  transition: "transform 0.3s ease",
};
const logoutButtonStyle = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "12px",
  background: "#fff1f2",
  color: "#ef4444",
  border: "1px solid rgba(239, 68, 68, 0.2)",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "600",
  transition: "all 0.2s ease",
  fontSize: "14px",
};

export default Sidebar;
