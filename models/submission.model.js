import mongoose from "mongoose";


function arrayLimit(val) {
  return val.length <= 2;
}

const reviewSchema = mongoose.Schema({
    reviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    ratings: [
        {
            label: String,
            score: Number,
        },
    ],
    comment: String,
});

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
        tags: {
            type: [String],
            default: [],
        },
        previewImages: {
            type: [String], 
            validate: [arrayLimit, '{PATH} exceeds the limit of 2'],
        },
        message: { type: String },
        likedBy: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }],
        reviews: [reviewSchema],
    },
    { timestamps: true }
);

const Submission = mongoose.models.Submission || mongoose.model("Submission", submissionSchema);
export default Submission;