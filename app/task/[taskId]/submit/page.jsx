import { notFound } from "next/navigation";
import connectDB from "@/config/db.config";
import Task from "@/models/task.model";
import SubmitTaskPage from "@/components/submission/SubmitTaskPage";
import decodeJWT from "@/utils/decodeJWT.util";
import { serializeTask } from "@/utils/discussionData.util";
import { isSubmissionClosed, isTaskScheduled } from "@/utils/taskSchedule.util";

export default async function TaskSubmitPage({ params }) {
  const currentUser = await decodeJWT();
  await connectDB();
  const { taskId } = await params;
  const task = await Task.findById(taskId).lean();

  if (!task) {
    notFound();
  }

  if (isTaskScheduled(task) && currentUser?.role !== "admin") {
    notFound();
  }

  if (isSubmissionClosed(task) && currentUser?.role !== "admin") {
    notFound();
  }

  return <SubmitTaskPage task={serializeTask(task)} />;
}
