import connectDB from "@/config/db.config";
import Task from "@/models/task.model";
import HomePage from "@/components/home/HomePage";
import decodeJWT from "@/utils/decodeJWT.util";
import { serializeTask } from "@/utils/discussionData.util";
import { buildTaskVisibilityFilter } from "@/utils/taskSchedule.util";
import { getLeaderboard } from "@/utils/leaderboard.util";

export const metadata = {
  title: "Kodex Peer Reviews",
  description: "Browse live peer review tasks and open project discussion threads.",
};

export default async function Page() {
  const currentUser = await decodeJWT();
  await connectDB();
  const [tasks, leaderboardRows] = await Promise.all([
    Task.find(
      buildTaskVisibilityFilter({ includeScheduled: currentUser?.role === "admin" })
    )
      .sort({ startDate: 1, createdAt: -1 })
      .lean(),
    getLeaderboard(7),
  ]);

  return <HomePage tasks={tasks.map(serializeTask)} currentUser={currentUser} leaderboard={leaderboardRows} />;
}
