import Submission from "@/models/submission.model";
import ExpressError from "@/utils/ExpressError.util";
import decodeJWT from "@/utils/decodeJWT.util";
import Task from "@/models/task.model";

// Create a new submission
export async function createSubmission(req) {

  const currentUser = await decodeJWT();

  if (!currentUser) {
    throw new ExpressError("Unauthorized. Please log in to submit a task.", 401);
  }

  const body = await req.json();
  const { taskId, projectLink, tags, previewImages, notes } = body;

  // Basic validation
  if (!taskId || !projectLink) {
    throw new ExpressError("Task ID, User ID, and Project Link are required.", 400);
  }

  const newSubmission = await Submission.create({
    taskId,
    userId: currentUser.id,
    projectLink,
    previewImages: previewImages || [],
    tags: tags || [],
    notes,
    likes: 0,
    reviews: []
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

//Get a single submission by ID
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