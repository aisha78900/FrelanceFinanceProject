"use client";

import { useState } from "react";

import { supabase } from "@/lib/supabase";

import { useRouter } from "next/navigation";

import styles from "./page.module.css";

export default function AuthPage() {
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [isSignUp, setIsSignUp] = useState(false);

  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleAuth = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });

        if (error) throw error;

        alert("Signup successful! Please check your email.");
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
    if (!email) return alert("Pehle email address likhein.");

    setLoading(true);

    try {
      // Yahan humne direct Vercel ka URL de diya hai
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `https://frelance-finance-project.vercel.app/reset-password`,
      });

      if (error) throw error;

      alert("Password reset link has been sent to your email!");
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
            <p onClick={handleForgotPassword} className={styles.forgotPass}>
              Forgot Password?
            </p>
          )}

          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? "Processing..." : isSignUp ? "Register" : "Sign In"}
          </button>
        </form>

        <p onClick={() => setIsSignUp(!isSignUp)} className={styles.toggleText}>
          {isSignUp
            ? "Already have an account? Login"
            : "New here? Create account"}
        </p>
      </div>
    </div>
  );
}
