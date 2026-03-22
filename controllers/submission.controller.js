import Submission from "@/models/submission.model";
import Task from "@/models/task.model";
import ExpressError from "@/utils/ExpressError.util";
import decodeJWT from "@/utils/decodeJWT.util";

// Create a new submission
export async function createSubmission(req) {
  const currentUser = await decodeJWT();

  if (!currentUser) {
    throw new ExpressError("Unauthorized. Please log in to submit a task.", 401);
  }

  const body = await req.json();
  const { taskId, projectLink, repoLink, tags, previewImages, message } = body;

  // Basic validation
  if (!taskId || !projectLink || !repoLink) {
    throw new ExpressError("Task ID, Project Link, and Repo Link are required.", 400);
  }

  const newSubmission = await Submission.create({
    taskId,
    userId: currentUser.id,
    projectLink,
    repoLink,
    previewImages: previewImages || [],
    tags: tags || [],
    message,
    likedBy: [],
    reviews: [],
  });

  return {
    statusCode: 201,
    message: "Submission created successfully.",
    data: newSubmission,
  };
}

// Get all submissions
export async function getAllSubmissions(req) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("taskId");
  const tag = searchParams.get("tag");
  const userId = searchParams.get("userId");

  let query = {};
  if (taskId) query.taskId = taskId;
  if (userId) query.userId = userId;

  if (tag) {
    query.tags = { $in: [tag] };
  }

  const submissions = await Submission.find(query)
    .populate("userId", "name avatar")
    .sort({ createdAt: -1 });

  return {
    message: "Submissions fetched successfully.",
    data: submissions,
  };
}

// Get a single submission by ID
export async function getSingleSubmission(req, { params }) {
  const { id } = await params;

  const submission = await Submission.findById(id)
    .populate("userId", "name avatar")
    .populate("taskId", "title");

  if (!submission) {
    throw new ExpressError("Submission not found.", 404);
  }

  return {
    message: "Submission detail fetched successfully.",
    data: submission,
  };
}

// Toggle like on a submission
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
  const alreadyLiked = submission.likedBy.some(
    (uid) => uid.toString() === userIdStr
  );

  if (alreadyLiked) {
    submission.likedBy.pull(currentUser.id);
  } else {
    submission.likedBy.push(currentUser.id);
  }

  await submission.save();

  return {
    message: alreadyLiked ? "Like removed." : "Submission liked.",
    data: {
      liked: !alreadyLiked,
      likesCount: submission.likedBy.length,
    },
  };
}

// Delete a submission (owner only)
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

// Update a submission (owner only)
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
  const { projectLink, repoLink, tags, previewImages, message } = body;

  // Only update fields that are provided
  if (projectLink !== undefined) submission.projectLink = projectLink;
  if (repoLink !== undefined) submission.repoLink = repoLink;
  if (tags !== undefined) submission.tags = tags;
  if (previewImages !== undefined) submission.previewImages = previewImages;
  if (message !== undefined) submission.message = message;

  await submission.save();

  return {
    message: "Submission updated successfully.",
    data: submission,
  };
}