"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false); // --- Auth Logic (Login/Signup) ---

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // 💡 Yahan hum session check kar rahe hain Sign Up ke baad
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        // Agar Sign Up ke baad foran session mil gaya (e.g., email confirmation off hai)
        if (data.session) {
          window.location.href = "http://localhost:3001/";
        } else {
          // Agar session nahi mila, toh user ko email confirm karna hoga
          alert("Signup successful! Please check your email for confirmation.");
        }
      } else {
        // Sign In Logic
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // ⚠️ NOTE: Sign In ke baad yahan se redirect karne ki zaroorat nahi hai.
        // Kyunki 'layout.jsx' ka onAuthStateChange function yeh kaam automatically kar dega.
        // Agar aap phir bhi rakhna chahte hain toh rakh sakte hain, lekin yeh optional hai.
        // window.location.href = "http://localhost:3001/";
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }; // --- 1. Forgot Password Logic (No change needed here) ---

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email address first in the input field.");
      return;
    }

    const confirmReset = confirm(`Send password reset link to: ${email}?`);
    if (!confirmReset) return;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
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
           {" "}
      <div style={cardStyle}>
               {" "}
        <h2 style={headerStyle}>
                    {isSignUp ? "Create Account" : "Finance Orbit Login"}       {" "}
        </h2>
               {" "}
        <form onSubmit={handleAuth} style={formStyle}>
                   {" "}
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
                   {" "}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
                   {" "}
          {/* --- 2. Forgot Password Link (Sirf login mode mein dikhega) --- */}
                   {" "}
          {!isSignUp && (
            <p onClick={handleForgotPassword} style={forgotPassStyle}>
                            Forgot Password?            {" "}
            </p>
          )}
                   {" "}
          <button type="submit" disabled={loading} style={buttonStyle}>
                       {" "}
            {loading ? "Loading..." : isSignUp ? "Register" : "Sign In"}       
             {" "}
          </button>
                 {" "}
        </form>
               {" "}
        <p onClick={() => setIsSignUp(!isSignUp)} style={toggleText}>
                   {" "}
          {isSignUp
            ? "Already have an account? Login"
            : "New here? Create an account"}
                 {" "}
        </p>
             {" "}
      </div>
         {" "}
    </div>
  );
}

// --- Styles (No change needed here) ---
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
