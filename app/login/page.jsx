"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true); // ⬅️ IMPORTANT

  // 🔐 SESSION CHECK (before render)
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace("/dashboard"); // no history, no flicker
      } else {
        setLoading(false); // show login only if not logged in
      }
    };

    checkSession();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.replace("/dashboard"); // ⬅️ no flash
    } catch (err) {
      alert(err.message);
      setLoading(false);
    }
  };

  // ⏳ BLOCK UI until auth check finishes
  if (loading) {
    return <div style={loader}>Checking session...</div>;
  }

  return (
    <div style={container}>
      <form onSubmit={handleLogin} style={card}>
        <h2>Login</h2>

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

        <button style={btn}>Login</button>
      </form>
    </div>
  );
}

/* styles */
const loader = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontWeight: "bold",
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
  padding: "30px",
  borderRadius: "12px",
  width: "320px",
  display: "flex",
  flexDirection: "column",
  gap: "14px",
};

const input = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
};

const btn = {
  padding: "12px",
  borderRadius: "8px",
  border: "none",
  background: "#0ea5e9",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
};
