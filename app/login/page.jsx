"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- Auth Logic (Login/Signup) ---
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Signup successful! Please check your email for confirmation.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        window.location.href = "http://localhost:3001/";
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 1. Forgot Password Logic ---
  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email address first in the input field.");
      return;
    }

    const confirmReset = confirm(`Send password reset link to: ${email}?`);
    if (!confirmReset) return;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // Bhai, redirect URL wohi dena jahan aapka naya reset page hoga
        redirectTo: "http://localhost:3000/reset-password",
      });

      if (error) throw error;
      alert("Password reset link sent! Please check your email inbox.");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={headerStyle}>
          {isSignUp ? "Create Account" : "Finance Orbit Login"}
        </h2>

        <form onSubmit={handleAuth} style={formStyle}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />

          {/* --- 2. Forgot Password Link (Sirf login mode mein dikhega) --- */}
          {!isSignUp && (
            <p onClick={handleForgotPassword} style={forgotPassStyle}>
              Forgot Password?
            </p>
          )}

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Loading..." : isSignUp ? "Register" : "Sign In"}
          </button>
        </form>

        <p onClick={() => setIsSignUp(!isSignUp)} style={toggleText}>
          {isSignUp
            ? "Already have an account? Login"
            : "New here? Create an account"}
        </p>
      </div>
    </div>
  );
}

// --- Styles ---
const containerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  background: "#f1f5f9",
};

const cardStyle = {
  padding: "40px",
  background: "#fff",
  borderRadius: "16px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
  width: "100%",
  maxWidth: "380px",
};

const headerStyle = {
  textAlign: "center",
  color: "#0f172a",
  marginBottom: "20px",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};

const inputStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  outline: "none",
};

const buttonStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "none",
  background: "#0ea5e9",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
};

// --- Naya style forgot password ke liye ---
const forgotPassStyle = {
  textAlign: "right",
  fontSize: "12px",
  color: "#0ea5e9",
  cursor: "pointer",
  marginTop: "-10px",
  fontWeight: "600",
};

const toggleText = {
  textAlign: "center",
  marginTop: "20px",
  color: "#64748b",
  cursor: "pointer",
  fontSize: "14px",
};
