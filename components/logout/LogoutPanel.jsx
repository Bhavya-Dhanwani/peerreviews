"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import styles from "@/components/ui/AuthForm.module.css";

export default function LogoutPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.message || "Unable to log out.");
        return;
      }

      toast.success(result.message || "Logged out successfully.");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Unable to log out right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.stack}>
      <p className={styles.meta}>
        Logging out will clear your active session and return you to the login screen.
      </p>

      <button className={styles.button} type="button" onClick={handleLogout} disabled={loading}>
        {loading ? "Logging out..." : "Log Out"}
      </button>
    </div>
  );
}
