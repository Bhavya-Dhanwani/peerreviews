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

function NavItem({ href, label, isAnchor = false }) {
  const content = <span className={styles.navLabel}>{label}</span>;

  if (isAnchor) {
    return (
      <a href={href} className={styles.navItem} data-text={label}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={styles.navItem} data-text={label}>
      {content}
    </Link>
  );
}

export default function HomeHero({ taskCount = 0, currentUser = null }) {
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

        <nav className={styles.navLinks}>
          <NavItem href="/" label="Home" />
          <NavItem href="#tasks" label="Tasks" isAnchor />
          {currentUser ? <NavItem href="/my-tasks" label="My Tasks" /> : null}
          {currentUser?.role === "admin" ? <NavItem href="/admin" label="Admin" /> : null}
        </nav>

        <div className={styles.userZone}>
          {currentUser ? (
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
            <Link href="/login" className={styles.loginAction} data-text="Login">
              <span className={styles.buttonLabel}>Login</span>
            </Link>
          )}
        </div>
      </div>

      <div className={styles.hero}>
        <div className={styles.copyColumn}>
          <span className={styles.eyebrow}>Peer Review Platform</span>
          <h1 className={styles.title}>Discuss projects, review peer submissions, and improve each build together.</h1>
          <p className={styles.description}>
            Pick a task, study the brief, submit your project, then join the discussion around how
            others approached the same problem.
          </p>

          <div className={styles.actions}>
            <a href="#tasks" className={styles.primaryAction} data-text="Browse Tasks">
              <span className={styles.buttonLabel}>Browse Tasks</span>
            </a>
            <Link
              href={currentUser ? "/my-tasks" : "/login"}
              className={styles.secondaryAction}
              data-text={currentUser ? "My Tasks" : "Join Discussion"}
            >
              <span className={styles.buttonLabel}>{currentUser ? "My Tasks" : "Join Discussion"}</span>
            </Link>
          </div>
        </div>

        <div className={styles.sideColumn}>
          <article className={styles.metricCard}>
            <span className={styles.metricLabel}>Open Review Threads</span>
            <strong className={styles.metricValue}>{taskCount}</strong>
            <p className={styles.metricText}>Every task turns into a discussion space for peer submissions and reviews.</p>
          </article>

          <article className={styles.stackCard}>
            <div className={styles.stackRow}>
              <span>1</span>
              <p>Read the task and understand the review criteria.</p>
            </div>
            <div className={styles.stackRow}>
              <span>2</span>
              <p>Submit your project with repo, live link, and preview images.</p>
            </div>
            <div className={styles.stackRow}>
              <span>3</span>
              <p>Discuss peer solutions, react, and leave structured reviews.</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
