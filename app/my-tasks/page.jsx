import connectDB from "@/config/db.config";
import Submission from "@/models/submission.model";
import MyTasksPage from "@/components/submission/MyTasksPage";
import { serializeSubmission } from "@/utils/discussionData.util";
import { requireUserSession } from "@/utils/session.util";

export const metadata = {
  title: "My Tasks | Kodex Peer Reviews",
  description: "View the tasks you have submitted and revisit your discussion threads.",
};

export default async function MyTasksRoute() {
  const session = await requireUserSession();
  await connectDB();

  const submissions = await Submission.find({ userId: session.user.id })
    .populate("taskId", "title difficulty tags")
    .populate("userId", "name avatar")
    .populate("reviews.reviewerId", "name avatar")
    .populate("comments.commenterId", "name avatar")
    .sort({ createdAt: -1 })
    .lean();

  return <MyTasksPage currentUser={session.user} submissions={submissions.map((submission) => serializeSubmission(submission, session.user))} />;
}
