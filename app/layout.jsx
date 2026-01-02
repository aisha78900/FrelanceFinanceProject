// app/layout.jsx
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "./components/Sidebar";

export default function RootLayout({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);

      // Agar session nahi hai aur login par nahi hai, to redirect karo
      if (!session && pathname !== "/login") {
        router.replace("/login");
      } else {
        setLoading(false); // Sirf tab loading khatam karo jab decide ho jaye kahan jana hai
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session && pathname !== "/login") {
        router.replace("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  const isLoginPage = pathname === "/login";

  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#f8fafc" }}>
        {loading ? (
          <div style={loaderStyle}>Verifying Finance Orbit Session...</div>
        ) : (
          <div style={{ display: "flex" }}>
            {session && !isLoginPage && <Sidebar />}

            <main
              style={{
                flex: 1,
                marginLeft: session && !isLoginPage ? "240px" : "0px",
                minHeight: "100vh",
              }}
            >
              {/* Sabse important change: Agar user logged in nahi hai to page dikhao hi mat */}
              {!session && !isLoginPage ? null : children}
            </main>
          </div>
        )}
      </body>
    </html>
  );
}

const loaderStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  fontFamily: "Inter, sans-serif",
  color: "#0ea5e9",
  fontWeight: "bold",
};
