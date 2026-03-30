"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "@/css/home/Hero.module.css";
import sheryiansLogo from "@/assets/images/sheryians.svg";
import LogoutButton from "@/components/logout/LogoutButton";

function getInitials(name = "K") {
  return String(name)
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function NavItem({ href, label, isAnchor = false, onNavigate = null }) {
  const content = <span className={styles.navLabel}>{label}</span>;

  if (isAnchor) {
    return (
      <a href={href} className={styles.navItem} data-text={label} onClick={onNavigate}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={styles.navItem} data-text={label} onClick={onNavigate}>
      {content}
    </Link>
  );
}

export default function HomeHero({ currentUser = null }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  const navItems = (
    <>
      <NavItem href="/" label="Home" onNavigate={() => setMenuOpen(false)} />
      <NavItem href="#tasks" label="Tasks" isAnchor onNavigate={() => setMenuOpen(false)} />
      {currentUser ? <NavItem href="/my-tasks" label="My Tasks" onNavigate={() => setMenuOpen(false)} /> : null}
      {currentUser?.role === "admin" ? <NavItem href="/admin" label="Admin" onNavigate={() => setMenuOpen(false)} /> : null}
    </>
  );

  const userActions = currentUser ? (
    <>
      <div className={styles.profileCard}>
        {currentUser.avatar ? (
          <Image
            src={currentUser.avatar}
            alt={currentUser.name || "User avatar"}
            width={44}
            height={44}
            className={styles.avatarImage}
            unoptimized
          />
        ) : (
          <div className={styles.avatarFallback}>{getInitials(currentUser.name)}</div>
        )}
        <div className={styles.userCopy}>
          <span className={styles.userName}>{currentUser.name || "User"}</span>
          <span className={styles.userMeta}>{currentUser.email}</span>
        </div>
      </div>

      <LogoutButton
        className={styles.logoutAction}
        label="Logout"
        loadingLabel="Logging out..."
        labelClassName={styles.buttonLabel}
      />
    </>
  ) : (
    <Link href="/login" className={styles.loginAction} data-text="Login" onClick={() => setMenuOpen(false)}>
      <span className={styles.buttonLabel}>Login</span>
    </Link>
  );

  return (
    <section className={styles.section}>
      <div className={styles.backdrop} />
      <div className={styles.navbar}>
        <div className={styles.brandZone}>
          <Link href="/" className={styles.brand}>
            <div className={styles.brandMark}>
              <Image
                src={sheryiansLogo}
                alt="Sheryians Coding School"
                className={styles.brandLogo}
                priority
              />
            </div>
            <div className={styles.brandCopy}>
              <span className={styles.brandTitle}>Kodex Peer Reviews</span>
              <span className={styles.brandSubtitle}>Peer project discussions and structured reviews</span>
            </div>
          </Link>
        </div>

        <button
          type="button"
          className={menuOpen ? `${styles.menuToggle} ${styles.menuToggleActive}` : styles.menuToggle}
          onClick={() => setMenuOpen((current) => !current)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={styles.desktopNav}>{navItems}</nav>

        <div className={styles.desktopUser}>{userActions}</div>

        <div className={menuOpen ? `${styles.mobileOverlay} ${styles.mobileOverlayVisible}` : styles.mobileOverlay} onClick={() => setMenuOpen(false)} />

        <div className={menuOpen ? `${styles.mobileDrawer} ${styles.mobileDrawerVisible}` : styles.mobileDrawer}>
          <div className={styles.mobileDrawerHeader}>
            <span className={styles.mobileDrawerTitle}>Menu</span>
          </div>

          <nav className={styles.navLinks}>
            {navItems}
          </nav>

          <div className={styles.userZone}>{userActions}</div>
        </div>
      </div>
    </section>
  );
}
