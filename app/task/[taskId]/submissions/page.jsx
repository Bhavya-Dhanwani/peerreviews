import connectDB from "@/config/db.config";
import Submission from "@/models/submission.model";
import TaskSubmissionsPage from "@/components/submission/TaskSubmissionsPage";
import { serializeSubmission, serializeTask } from "@/utils/discussionData.util";
import { requireUserSession } from "@/utils/session.util";
import Task from "@/models/task.model";
import { notFound } from "next/navigation";
import { isTaskScheduled } from "@/utils/taskSchedule.util";

export const metadata = {
  title: "Task Submissions | Kodex Peer Reviews",
  description: "Review peer submissions, react, and leave structured feedback.",
};

export default async function TaskSubmissionsRoute({ params }) {
  const session = await requireUserSession();
  const { taskId } = await params;

  await connectDB();

  const task = await Task.findById(taskId).lean();

  if (!task) {
    notFound();
  }

  if (isTaskScheduled(task) && session.user.role !== "admin") {
    notFound();
  }

  const submissions = await Submission.find({ taskId })
    .populate("userId", "name avatar")
    .populate("reviews.reviewerId", "name avatar")
    .populate("comments.commenterId", "name avatar")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <TaskSubmissionsPage
      currentUser={session.user}
      task={serializeTask(task)}
      submissions={submissions.map((submission) => serializeSubmission(submission, session.user))}
    />
  );
}
