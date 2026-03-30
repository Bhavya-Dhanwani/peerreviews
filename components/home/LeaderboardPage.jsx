import Link from "next/link";
import Image from "next/image";
import styles from "@/css/home/LeaderboardPage.module.css";

function getInitials(name = "Peer") {
  return String(name)
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function LeaderAvatar({ entry }) {
  if (entry.avatar) {
    return (
      <Image
        src={entry.avatar}
        alt={entry.name || "Leaderboard user"}
        width={44}
        height={44}
        className={styles.avatarImage}
        unoptimized
      />
    );
  }

  return <div className={styles.avatarFallback}>{getInitials(entry.name)}</div>;
}

export default function LeaderboardPage({ leaderboard = [], currentUser = null }) {
  const rankedEntry = leaderboard.find((entry) => entry._id === String(currentUser?.id || ""));
  const currentUserEntry = currentUser
    ? rankedEntry || {
        _id: String(currentUser.id || ""),
        name: currentUser.name || "You",
        avatar: currentUser.avatar || "",
        rank: null,
        score: 0,
        reviewCount: 0,
        submissionCount: 0,
      }
    : null;

  return (
    <section className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>Leaderboard</span>
            <h1 className={styles.title}>Full peer ranking</h1>
            <p className={styles.copy}>
              A full view of the strongest contributors across submissions, reviews, and community engagement.
            </p>
          </div>
          <div className={styles.headerLinks}>
            <Link href="/how" className={styles.homeLink}>
              How Points Work
            </Link>
            <Link href="/" className={styles.homeLink}>
              Back Home
            </Link>
          </div>
        </div>

        {currentUserEntry ? (
          <div className={styles.currentUserCard}>
            <div className={styles.currentUserIdentity}>
              <LeaderAvatar entry={currentUserEntry} />
              <div className={styles.currentUserCopy}>
                <span className={styles.currentUserLabel}>Your Standing</span>
                <strong>{currentUserEntry.name}</strong>
              </div>
            </div>
            <div className={styles.currentUserStats}>
              <div className={styles.currentUserStat}>
                <span>Rank</span>
                <strong>{currentUserEntry.rank ? `#${currentUserEntry.rank}` : "Not ranked yet"}</strong>
              </div>
              <div className={styles.currentUserStat}>
                <span>Points</span>
                <strong>{currentUserEntry.score}</strong>
              </div>
            </div>
          </div>
        ) : null}

        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <span>Name</span>
            <span>Rank</span>
            <span>Points</span>
          </div>

          <div className={styles.tableBody}>
            {leaderboard.map((entry) => (
              <article
                key={entry._id}
                className={entry._id === String(currentUser?.id || "") ? `${styles.row} ${styles.rowActive}` : styles.row}
              >
                <div className={styles.nameCell}>
                  <LeaderAvatar entry={entry} />
                  <div className={styles.nameCopy}>
                    <strong>{entry.name}</strong>
                    <span>
                      {entry.reviewCount} reviews · {entry.submissionCount} submissions
                    </span>
                  </div>
                </div>
                <span className={styles.rankCell}>{entry.rank}</span>
                <span className={styles.pointsCell}>{entry.score}</span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
