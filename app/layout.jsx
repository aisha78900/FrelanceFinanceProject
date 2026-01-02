"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔄 Ye state decide karegi ke Login dikhana hai ya Signup
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.replace("/dashboard");
      } else {
        setLoading(false);
      }
    };
    checkSession();
  }, [router]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // 🆕 SIGNUP LOGIC
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Check your email for confirmation link!");
      } else {
        // 🔑 LOGIN LOGIC
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.replace("/dashboard");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={loader}>Processing...</div>;

  return (
    <div style={container}>
      <form onSubmit={handleAuth} style={card}>
        <h2 style={{ textAlign: "center", color: "#0f172a" }}>
          {isSignUp ? "Create Account" : "Login"}
        </h2>

        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            fontSize: "14px",
            marginBottom: "10px",
          }}
        >
          {isSignUp
            ? "Join Finance Orbit today"
            : "Welcome back to Finance Orbit"}
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={input}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={input}
        />

        <button style={btn}>{isSignUp ? "Sign Up" : "Login"}</button>

        {/* 🔀 TOGGLE LINK */}
        <p style={{ textAlign: "center", fontSize: "14px", marginTop: "15px" }}>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <span
            onClick={() => setIsSignUp(!isSignUp)}
            style={{
              color: "#0ea5e9",
              fontWeight: "bold",
              cursor: "pointer",
              marginLeft: "5px",
            }}
          >
            {isSignUp ? "Login" : "Create one"}
          </span>
        </p>
      </form>
    </div>
  );
}

/* Styles (Aapke mojooda styles use kiye hain) */
const loader = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontWeight: "bold",
  color: "#0ea5e9",
};
const container = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  background: "#f1f5f9",
};
const card = {
  background: "#fff",
  padding: "40px",
  borderRadius: "16px",
  width: "350px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
};
const input = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  outline: "none",
};
const btn = {
  padding: "12px",
  borderRadius: "8px",
  border: "none",
  background: "#0ea5e9",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "0.3s",
};
