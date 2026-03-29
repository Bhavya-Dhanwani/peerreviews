import connectDB from "@/config/db.config";
import Task from "@/models/task.model";
import AdminTaskPage from "@/components/task/AdminTaskPage";
import { serializeTask } from "@/utils/discussionData.util";
import { requireAdminSession } from "@/utils/session.util";

export const metadata = {
  title: "Admin | Kodex Peer Reviews",
  description: "Create, schedule, and manage peer review tasks as an admin.",
};

export default async function AdminRoute() {
  const session = await requireAdminSession();
  await connectDB();
  const tasks = await Task.find().sort({ startDate: 1, createdAt: -1 }).lean();

  return <AdminTaskPage currentUser={session.user} initialTasks={tasks.map(serializeTask)} />;
}
