import Image from "next/image";
import Link from "next/link";
import styles from "@/css/home/Hero.module.css";

function getInitials(name = "Peer") {
  return String(name)
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getFirstName(name = "Peer") {
  return String(name).trim().split(/\s+/)[0] || "Peer";
}

function PodiumAvatar({ entry, className }) {
  if (entry.avatar) {
    return (
      <Image
        src={entry.avatar}
        alt={entry.name || "Top contributor"}
        width={72}
        height={72}
        className={className}
        unoptimized
      />
    );
  }

  return <div className={className}>{getInitials(entry.name)}</div>;
}

export default function HomeLeaderboard({ leaderboard = [] }) {
  if (!leaderboard.length) {
    return null;
  }

  const visibleEntries = leaderboard.slice(0, 7);
  const first = visibleEntries.find((entry) => entry.rank === 1) || null;
  const second = visibleEntries.find((entry) => entry.rank === 2) || null;
  const third = visibleEntries.find((entry) => entry.rank === 3) || null;
  const podiumEntries = [
    { entry: second, label: "2nd", pillarClass: styles.podiumSecond },
    { entry: first, label: "1st", pillarClass: styles.podiumFirst },
    { entry: third, label: "3rd", pillarClass: styles.podiumThird },
  ];
  const remaining = visibleEntries.slice(3);

  return (
    <section className={styles.leaderboardSection}>
      <div className={styles.leaderboardIntro}>
        <span className={styles.eyebrow}>Leaderboard</span>
        <h2 className={styles.leaderboardTitle}>Top coders of all time</h2>
        <p className={styles.leaderboardCopy}>
          Ranked by total peer activity across submissions, reviews, and community support.
        </p>
        <div className={styles.leaderboardCtas}>
          <Link href="/how" className={styles.leaderboardGuideLink}>
            How Points Work
          </Link>
        </div>
      </div>

      <div className={styles.leaderboardGrid}>
        <div className={styles.podiumCard}>
          <div className={styles.podiumWrap}>
            {podiumEntries.map(({ entry, label, pillarClass }, index) =>
              entry ? (
                <article key={entry._id} className={styles.podiumSlot}>
                  <div className={styles.podiumIdentity}>
                    <PodiumAvatar
                      entry={entry}
                      className={entry.avatar ? styles.podiumAvatarImage : styles.podiumAvatarFallback}
                    />
                    <strong className={styles.podiumName}>{getFirstName(entry.name)}</strong>
                  </div>
                  <div className={`${styles.podiumPillar} ${pillarClass}`}>
                    <span className={styles.podiumRankText}>{label}</span>
                    <span className={styles.podiumPoints}>{entry.score} points</span>
                    <span className={styles.podiumRankBadge}>#{entry.rank}</span>
                  </div>
                </article>
              ) : (
                <div key={`empty-podium-${index}`} className={styles.podiumSpacer} />
              )
            )}
          </div>
        </div>

        <div className={styles.leaderList}>
          {remaining.length ? (
            <>
              <div className={styles.leaderListHeader}>
                <span>Name</span>
                <span>Rank</span>
                <span>Points</span>
              </div>
              {remaining.map((entry) => (
                <article key={entry._id} className={styles.leaderRow}>
                  <div className={styles.leaderRowName}>
                    <PodiumAvatar
                      entry={entry}
                      className={entry.avatar ? styles.leaderAvatarImage : styles.leaderAvatarFallback}
                    />
                    <div className={styles.leaderRowCopy}>
                      <strong>{entry.name}</strong>
                      <span>
                        {entry.reviewCount} reviews · {entry.likeCount} likes
                      </span>
                    </div>
                  </div>
                  <span className={styles.leaderRankText}>{entry.rank}</span>
                  <span className={styles.leaderRowScore}>{entry.score}</span>
                </article>
              ))}
            </>
          ) : null}

          <div className={styles.leaderboardFooterLinks}>
            <Link href="/leaderboard" className={styles.fullLeaderboardLink}>
              See Full Leaderboard
            </Link>
            <Link href="/how" className={styles.fullLeaderboardLink}>
              Scoring Guide
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

