"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function LogoutButton({
  className = "",
  label = "Logout",
  loadingLabel = "Logging out...",
  dataText,
  labelClassName = "",
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      const result = await response.json();

      await signOut({
        redirect: false,
      });

      if (!response.ok || !result.success) {
        toast.error(result.message || "Unable to log out.");
        return;
      }

      toast.success(result.message || "Logged out successfully.");
      router.replace("/login");
      router.refresh();
    } catch {
      toast.error("Unable to log out right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className={className}
      data-text={dataText || label}
      onClick={handleLogout}
      disabled={loading}
    >
      <span className={labelClassName}>{loading ? loadingLabel : label}</span>
    </button>
  );
}
