import Submission from "@/models/submission.model";
import Task from "@/models/task.model";
import ExpressError from "@/utils/ExpressError.util";
import decodeJWT from "@/utils/decodeJWT.util";
import { emitTaskCommentCreated, emitTaskSubmissionCreated, emitTaskSubmissionLiked } from "@/lib/socket.server";
import { serializeSubmission } from "@/utils/discussionData.util";
import { isSubmissionClosed, isTaskScheduled } from "@/utils/taskSchedule.util";

function formatComment(comment = {}) {
  return {
    _id: String(comment._id || ""),
    commenterId: {
      _id: String(comment.commenterId?._id || comment.commenterId || ""),
      name: comment.commenterId?.name || "",
      avatar: comment.commenterId?.avatar || "",
    },
    text: comment.text || "",
    createdAt: comment.createdAt ? new Date(comment.createdAt).toISOString() : null,
  };
}

export async function createSubmission(req) {
  const currentUser = await decodeJWT();

  if (!currentUser) {
    throw new ExpressError("Unauthorized. Please log in to submit a task.", 401);
  }

  const body = await req.json();
  const { taskId, projectLink, repoLink, previewImages } = body;

  if (!taskId || !projectLink || !repoLink) {
    throw new ExpressError("Task ID, project link, and repository link are required.", 400);
  }

  const task = await Task.findById(taskId).lean();

  if (!task) {
    throw new ExpressError("Task not found.", 404);
  }

  if (isTaskScheduled(task) && currentUser.role !== "admin") {
    throw new ExpressError("This task is not open for submissions yet.", 400);
  }

  if (isSubmissionClosed(task) && currentUser.role !== "admin") {
    throw new ExpressError("Submission deadline has passed for this task.", 400);
  }

  const newSubmission = await Submission.create({
    taskId,
    userId: currentUser.id,
    projectLink,
    repoLink,
    previewImages: Array.isArray(previewImages) ? previewImages.slice(0, 2) : [],
    likedBy: [],
    reviews: [],
    comments: [],
  });

  await newSubmission.populate("userId", "name avatar");

  emitTaskSubmissionCreated(String(newSubmission.taskId || taskId), {
    submission: serializeSubmission(newSubmission.toObject(), currentUser),
  });

  return {
    statusCode: 201,
    message: "Submission created successfully.",
    data: newSubmission,
  };
}

export async function getAllSubmissions(req) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("taskId");
  const userId = searchParams.get("userId");

  const query = {};
  if (taskId) query.taskId = taskId;
  if (userId) query.userId = userId;

  const submissions = await Submission.find(query)
    .populate("userId", "name avatar")
    .populate("comments.commenterId", "name avatar")
    .sort({ createdAt: -1 });

  return {
    message: "Submissions fetched successfully.",
    data: submissions,
  };
}

export async function getSingleSubmission(req, { params }) {
  const { id } = await params;

  const submission = await Submission.findById(id)
    .populate("userId", "name avatar")
    .populate("taskId", "title")
    .populate("comments.commenterId", "name avatar");

  if (!submission) {
    throw new ExpressError("Submission not found.", 404);
  }

  return {
    message: "Submission detail fetched successfully.",
    data: submission,
  };
}

export async function toggleLike(req, { params }) {
  const currentUser = await decodeJWT();

  if (!currentUser) {
    throw new ExpressError("Please log in to like a submission.", 401);
  }

  const { id } = await params;
  const submission = await Submission.findById(id);

  if (!submission) {
    throw new ExpressError("Submission not found.", 404);
  }

  const userIdStr = currentUser.id.toString();
  const alreadyLiked = submission.likedBy.some((uid) => uid.toString() === userIdStr);

  if (alreadyLiked) {
    submission.likedBy.pull(currentUser.id);
  } else {
    submission.likedBy.push(currentUser.id);
  }

  await submission.save();

  emitTaskSubmissionLiked(String(submission.taskId || ""), {
    submissionId: String(submission._id || id),
    userId: userIdStr,
    liked: !alreadyLiked,
    likesCount: submission.likedBy.length,
  });

  return {
    message: alreadyLiked ? "Like removed." : "Submission liked.",
    data: {
      liked: !alreadyLiked,
      likesCount: submission.likedBy.length,
    },
  };
}

export async function createComment(req, { params }) {
  const currentUser = await decodeJWT();

  if (!currentUser) {
    throw new ExpressError("Please log in to comment on a submission.", 401);
  }

  const { id } = await params;
  const submission = await Submission.findById(id).populate("comments.commenterId", "name avatar");

  if (!submission) {
    throw new ExpressError("Submission not found.", 404);
  }

  const body = await req.json();
  const text = String(body?.text || "").trim();

  if (!text) {
    throw new ExpressError("Comment text is required.", 400);
  }

  submission.comments.push({
    commenterId: currentUser.id,
    text,
  });

  await submission.save();
  await submission.populate("comments.commenterId", "name avatar");

  const formattedComments = submission.comments.map(formatComment);
  const latestComment = formattedComments[formattedComments.length - 1] || null;

  emitTaskCommentCreated(String(submission.taskId || ""), {
    submissionId: String(submission._id || id),
    comment: latestComment,
    commentCount: formattedComments.length,
  });

  return {
    statusCode: 201,
    message: "Comment added successfully.",
    data: {
      comments: formattedComments,
      commentCount: submission.comments.length,
    },
  };
}

export async function deleteSubmission(req, { params }) {
  const currentUser = await decodeJWT();

  if (!currentUser) {
    throw new ExpressError("Please log in to delete a submission.", 401);
  }

  const { id } = await params;
  const submission = await Submission.findById(id);

  if (!submission) {
    throw new ExpressError("Submission not found.", 404);
  }

  if (submission.userId.toString() !== currentUser.id.toString()) {
    throw new ExpressError("You can only delete your own submissions.", 403);
  }

  await Submission.findByIdAndDelete(id);

  return {
    message: "Submission deleted successfully.",
  };
}

export async function updateSubmission(req, { params }) {
  const currentUser = await decodeJWT();

  if (!currentUser) {
    throw new ExpressError("Please log in to update a submission.", 401);
  }

  const { id } = await params;
  const submission = await Submission.findById(id);

  if (!submission) {
    throw new ExpressError("Submission not found.", 404);
  }

  if (submission.userId.toString() !== currentUser.id.toString()) {
    throw new ExpressError("You can only update your own submissions.", 403);
  }

  const body = await req.json();
  const { projectLink, repoLink, previewImages } = body;

  if (projectLink !== undefined) submission.projectLink = projectLink;
  if (repoLink !== undefined) submission.repoLink = repoLink;
  if (previewImages !== undefined) {
    submission.previewImages = Array.isArray(previewImages) ? previewImages.slice(0, 2) : [];
  }

  await submission.save();

  return {
    message: "Submission updated successfully.",
    data: submission,
  };
}

