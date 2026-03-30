import connectDB from "@/config/db.config";
import decodeJWT from "@/utils/decodeJWT.util";
import { getLeaderboard } from "@/utils/leaderboard.util";
import LeaderboardPage from "@/components/home/LeaderboardPage";

export const metadata = {
  title: "Leaderboard | Kodex Peer Reviews",
  description: "See the full peer review leaderboard across submissions, reviews, and likes.",
};

export default async function LeaderboardRoute() {
  const currentUser = await decodeJWT();
  await connectDB();
  const leaderboard = await getLeaderboard();

  return <LeaderboardPage leaderboard={leaderboard} currentUser={currentUser} />;
}
