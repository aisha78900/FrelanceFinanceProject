"use client";
import Sidebar from "./Sidebar";

export default function ClientLayout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main
        style={{
          flex: 1,
          marginLeft: "240px",
          minHeight: "100vh",
          position: "relative",
        }}
      >
        {children}
      </main>
    </div>
  );
}


