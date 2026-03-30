import connectDB from "@/config/db.config";
import { requireUserSession } from "@/utils/session.util";
import { getLeaderboard } from "@/utils/leaderboard.util";
import LeaderboardPage from "@/components/home/LeaderboardPage";

export const metadata = {
  title: "Leaderboard | Kodex Peer Reviews",
  description: "See the full peer review leaderboard across submissions, reviews, and likes.",
};

export default async function LeaderboardRoute() {
  const session = await requireUserSession();
  const currentUser = session.user;
  await connectDB();
  const leaderboard = await getLeaderboard();

  return <LeaderboardPage leaderboard={leaderboard} currentUser={currentUser} />;
}
