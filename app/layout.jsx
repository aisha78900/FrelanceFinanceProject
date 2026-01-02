"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "./components/Sidebar"; // Path check: app/components/Sidebar.jsx

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
      setLoading(false);

      // Agar session nahi hai aur user login page par nahi hai, to login par bhejo
      if (!session && pathname !== "/login") {
        router.push("/login");
      }
    };

    checkSession();

    // Live session listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session && pathname !== "/login") {
        router.push("/login");
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
            {/* Sidebar sirf login ke baad dikhega */}
            {session && !isLoginPage && <Sidebar />}

            <main
              style={{
                flex: 1,
                marginLeft: session && !isLoginPage ? "240px" : "0px",
                minHeight: "100vh",
              }}
            >
              {children}
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
