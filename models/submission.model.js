import mongoose from "mongoose";

function arrayLimit(val) {
  return val.length <= 2;
}

const reviewSchema = mongoose.Schema({
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  reviewerName: {
    type: String,
    default: "",
  },
  reviewerAvatar: {
    type: String,
    default: "",
  },
  ratings: [
    {
      label: String,
      score: Number,
    },
  ],
  whatYouLiked: {
    type: String,
    default: "",
  },
  comment: String,
});

const commentSchema = mongoose.Schema(
  {
    commenterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const submissionSchema = mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    projectLink: {
      type: String,
      required: [true, "Project link is required"],
    },
    repoLink: {
      type: String,
      required: [true, "Repository link is required"],
    },
    previewImages: {
      type: [String],
      validate: [arrayLimit, "{PATH} exceeds the limit of 2"],
      default: [],
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    reviews: [reviewSchema],
    comments: [commentSchema],
  },
  { timestamps: true }
);

if (mongoose.models.Submission) {
  delete mongoose.models.Submission;
}

const Submission = mongoose.model("Submission", submissionSchema);
export default Submission;
