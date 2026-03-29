"use client";

import LogoutButton from "@/components/logout/LogoutButton";
import styles from "@/components/ui/AuthForm.module.css";

export default function LogoutPanel() {
  return (
    <div className={styles.stack}>
      <p className={styles.meta}>
        Logging out will clear your active session and return you to the login screen.
      </p>

      <LogoutButton className={styles.button} label="Log Out" loadingLabel="Logging out..." />
    </div>
  );
}
