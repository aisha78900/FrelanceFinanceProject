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

  // 1. Yahan wo saare paths likhein jahan Sidebar NAHI dikhana
  const isPublicPage = pathname === "/login" || pathname === "/reset-password";

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);

      // Redirect logic
      if (!session && !isPublicPage) {
        router.replace("/login");
      } else if (session && pathname === "/login") {
        router.replace("/dashboard");
      } else {
        setLoading(false);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session && !isPublicPage) {
        router.replace("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router, isPublicPage]);

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ margin: 0, padding: 0, background: "#f8fafc" }}>
        {loading ? (
          <div style={loaderStyle}>
            <div style={spinnerStyle}></div>
          </div>
        ) : (
          <div style={{ display: "flex" }}>
            {/* 2. Sidebar sirf tab dikhayen agar session ho AUR public page na ho */}
            {session && !isPublicPage && <Sidebar />}

            <main
              style={{
                flex: 1,
                // 3. Margin bhi sirf tab apply karein jab sidebar dikh raha ho
                marginLeft: session && !isPublicPage ? "240px" : "0px",
                minHeight: "100vh",
              }}
              className="root-main-content"
            >
              {!session && !isPublicPage ? null : children}
            </main>
          </div>
        )}
        <style jsx global>{`
          @media (max-width: 768px) {
            .root-main-content {
              margin-left: 0 !important;
            }
          }
        `}</style>
      </body>
    </html>
  );
}

const loaderStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  width: "100vw",
  background: "#f8fafc",
};

const spinnerStyle = {
  width: "48px",
  height: "48px",
  border: "4px solid rgba(14, 165, 233, 0.2)",
  borderTop: "4px solid #0ea5e9",
  borderRadius: "50%",
  animation: "spin 0.8s linear infinite",
};
