"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import styles from "../login/page.module.css";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      alert("Success! Password update ho gaya hai.");
      router.push("/login");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.header}>Finance Orbit Reset</h2>

        <form onSubmit={handleUpdatePassword} className={styles.form}>
          <div
            style={{
              textAlign: "center",
              marginBottom: "20px",
              color: "#666",
              fontSize: "14px",
            }}
          >
            Enter your new password to secure your account.
          </div>

          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
            minLength={6}
          />

          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <p onClick={() => router.push("/login")} className={styles.toggleText}>
          Back to Login
        </p>
      </div>
    </div>
  );
}
