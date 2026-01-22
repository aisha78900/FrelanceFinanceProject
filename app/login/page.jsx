"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Recovery mode mein redirect nahi karna
      if (event === "SIGNED_IN" && session) {
        if (!window.location.hash.includes("type=recovery")) {
          router.push("/");
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [router]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/login` },
        });
        if (error) throw error;
        alert("Verification link sent! Please check your email.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/");
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return alert("Please enter your email first.");
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // Ye line user ko aapke vercel link par bhejegi
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      alert("Password reset link sent to your email!");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.header}>
          {isSignUp ? "Create Account" : "Finance Orbit Login"}
        </h2>
        <form onSubmit={handleAuth} className={styles.form}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
          />
          {!isSignUp && (
            <p
              onClick={handleForgotPassword}
              className={styles.forgotPass}
              style={{ cursor: "pointer", color: "blue" }}
            >
              Forgot Password?
            </p>
          )}
          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? "Processing..." : isSignUp ? "Register" : "Sign In"}
          </button>
        </form>
        <p
          onClick={() => setIsSignUp(!isSignUp)}
          className={styles.toggleText}
          style={{ cursor: "pointer" }}
        >
          {isSignUp
            ? "Already have an account? Login"
            : "New here? Create account"}
        </p>
      </div>
    </div>
  );
}
