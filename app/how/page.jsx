import Link from "next/link";
import { requireUserSession } from "@/utils/session.util";
import styles from "@/css/home/HowPage.module.css";

export const metadata = {
  title: "How Points Work | Kodex Peer Reviews",
  description: "Detailed explanation of how ratings, credibility, and leaderboard points are calculated.",
};

const credibilityRows = [
  ["Base score", "+1.0"],
  ["Account age > 30 days", "+0.3"],
  ["Account age > 7 days", "+0.1"],
  ["5+ reviews given", "+0.3"],
  ["10+ reviews given", "+0.5"],
  ["Email verified", "+0.2"],
  ["GitHub or LinkedIn connected", "+0.3"],
  ["Rating behavior close to platform average", "+0.4"],
  ["Only extreme ratings (all 1 or all 5)", "-0.3"],
  ["Reviewed only 1 project", "-0.3"],
  ["Suspicious behavior", "-0.5"],
  ["Confirmed abuse", "-1.0"],
];

export default async function HowPage() {
  await requireUserSession();

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.hero}>
          <div>
            <span className={styles.eyebrow}>How It Works</span>
            <h1 className={styles.title}>How points, ratings, and leaderboard ranking are calculated</h1>
            <p className={styles.copy}>
              This page explains the full process in plain language: how review points are counted, how reviewer
              credibility affects project ratings, how Bayesian scoring prevents lucky early ratings from dominating,
              and why the leaderboard stays more fair than a simple average.
            </p>
          </div>
          <div className={styles.actions}>
            <Link href="/" className={styles.primaryLink}>
              Back Home
            </Link>
            <Link href="/leaderboard" className={styles.secondaryLink}>
              Back To Leaderboard
            </Link>
          </div>
        </header>

        <section className={styles.card}>
          <span className={styles.sectionLabel}>1. Review Points</span>
          <h2 className={styles.sectionTitle}>Why a review can show 21 pts and 4.2/5 at the same time</h2>
          <p className={styles.paragraph}>
            Every review contains multiple category scores. The score chip such as <strong>21 pts</strong> is the raw
            total of those category ratings. For example, if a reviewer gives <strong>5 + 5 + 5 + 3 + 3</strong>, the
            total is <strong>21 points</strong>.
          </p>
          <p className={styles.paragraph}>
            The average shown beside it, like <strong>4.2/5</strong>, is the total divided by the number of rating
            categories. In that same example, <strong>21 / 5 = 4.2</strong>.
          </p>
        </section>

        <section className={styles.card}>
          <span className={styles.sectionLabel}>2. Reviewer Credibility</span>
          <h2 className={styles.sectionTitle}>Why every reviewer does not count exactly the same</h2>
          <p className={styles.paragraph}>
            To reduce manipulation, the system gives every reviewer a credibility score. That score starts at{" "}
            <strong>1.0</strong> and then moves up or down based on trust signals and abuse signals. The final result is
            clamped between <strong>0.2</strong> and <strong>1.5</strong>.
          </p>

          <div className={styles.table}>
            <div className={styles.tableHead}>
              <span>Signal</span>
              <span>Effect</span>
            </div>
            {credibilityRows.map(([label, value]) => (
              <div key={label} className={styles.tableRow}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>

          <p className={styles.paragraph}>
            This means a trusted, verified, consistent reviewer can have more influence than a brand-new or suspicious
            account, while a flagged account can have very little influence on project ranking.
          </p>
        </section>

        <section className={styles.card}>
          <span className={styles.sectionLabel}>3. Weighted Project Rating</span>
          <h2 className={styles.sectionTitle}>How project rating is adjusted by credibility</h2>
          <p className={styles.paragraph}>
            A project does not use a plain average. Instead, each review is weighted by the reviewer credibility:
          </p>
          <pre className={styles.formula}>
            <code>R = sum(rating * credibilityScore) / sum(credibilityScore)</code>
          </pre>
          <p className={styles.paragraph}>
            So if two people both rate a project, but one has a credibility score of <strong>1.4</strong> and another
            has <strong>0.4</strong>, the trusted review affects the final rating much more.
          </p>
        </section>

        <section className={styles.card}>
          <span className={styles.sectionLabel}>4. Global Platform Stats</span>
          <h2 className={styles.sectionTitle}>Why the system needs C and m</h2>
          <p className={styles.paragraph}>
            The leaderboard also looks at platform-wide behavior:
          </p>
          <ul className={styles.list}>
            <li>
              <strong>C</strong> = the platform-wide average rating baseline
            </li>
            <li>
              <strong>m</strong> = the average number of reviews per project
            </li>
          </ul>
          <p className={styles.paragraph}>
            These numbers help the ranking system understand whether a project has enough review evidence or is still
            too early to trust strongly.
          </p>
        </section>

        <section className={styles.card}>
          <span className={styles.sectionLabel}>5. Bayesian Score</span>
          <h2 className={styles.sectionTitle}>How lucky early ratings are controlled</h2>
          <p className={styles.paragraph}>
            If a project has only one or two reviews, it should not instantly beat mature projects. That is why the
            system uses Bayesian scoring:
          </p>
          <pre className={styles.formula}>
            <code>score = (v / (v + m)) * R + (m / (v + m)) * C</code>
          </pre>
          <ul className={styles.list}>
            <li>
              <strong>R</strong> = weighted project rating
            </li>
            <li>
              <strong>v</strong> = number of reviews for that project
            </li>
            <li>
              <strong>C</strong> = platform baseline
            </li>
            <li>
              <strong>m</strong> = average review count across projects
            </li>
          </ul>
          <p className={styles.paragraph}>
            When a project is new, its score is pulled closer to the global average. As more reviews arrive, the
            project’s own rating matters more.
          </p>
        </section>

        <section className={styles.card}>
          <span className={styles.sectionLabel}>6. Final Leaderboard Score</span>
          <h2 className={styles.sectionTitle}>How ranking rewards both quality and confidence</h2>
          <p className={styles.paragraph}>
            The final leaderboard order is not based on raw average alone. It also rewards confidence and review depth:
          </p>
          <pre className={styles.formula}>
            <code>{`confidence = v / (v + m)
finalScore = score * confidence * log10(v + 1)`}</code>
          </pre>
          <p className={styles.paragraph}>
            This prevents a brand-new project with a single 5-star review from unfairly dominating the board, while
            still letting truly strong projects rise over time.
          </p>
        </section>

        <section className={styles.card}>
          <span className={styles.sectionLabel}>7. Tie Handling</span>
          <h2 className={styles.sectionTitle}>What happens if projects look equally strong</h2>
          <p className={styles.paragraph}>
            When scores are close, the system falls back to supporting signals like Bayesian score and review count so
            projects with stronger evidence rank ahead of projects with weaker evidence.
          </p>
        </section>

        <section className={styles.card}>
          <span className={styles.sectionLabel}>8. Anti-Cheat Logic</span>
          <h2 className={styles.sectionTitle}>How the platform reduces fake or biased reviews</h2>
          <ul className={styles.list}>
            <li>One user can review a submission only once.</li>
            <li>Users cannot review their own submissions.</li>
            <li>Suspicious behavior can reduce credibility.</li>
            <li>Confirmed abuse can nearly remove a reviewer’s influence.</li>
            <li>Extreme-only rating behavior is penalized.</li>
          </ul>
          <p className={styles.paragraph}>
            The goal is not to punish honest reviewers. The goal is to make gaming the system far less effective than
            contributing consistently and fairly.
          </p>
        </section>

        <section className={styles.card}>
          <span className={styles.sectionLabel}>9. Practical Examples</span>
          <h2 className={styles.sectionTitle}>What this means in real situations</h2>
          <ul className={styles.list}>
            <li>A project with 1 excellent review will look promising, but it will not instantly dominate.</li>
            <li>A project with many solid reviews can outrank a project with a tiny but perfect sample.</li>
            <li>Trusted reviewers influence rank more than suspicious or low-signal reviewers.</li>
            <li>Projects rise best when they earn both strong ratings and enough review evidence.</li>
          </ul>
        </section>

        <section className={`${styles.card} ${styles.callout}`}>
          <span className={styles.sectionLabel}>Summary</span>
          <h2 className={styles.sectionTitle}>What the leaderboard is trying to reward</h2>
          <p className={styles.paragraph}>
            The system is designed to reward quality, consistency, and honest peer participation. A project should rank
            well because it keeps earning strong feedback from credible reviewers over time, not because it got lucky
            once or because a group tried to inflate it artificially.
          </p>
        </section>
      </div>
    </main>
  );
}
