import mongoose from "mongoose";

const reviewSchema = mongoose.Schema({
  label: {
    type: String,
  },
  maxScore: {
    type: Number,
  },
});

const taskSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description_md: {
      type: String,
      default: "",
    },
    difficulty: {
      type: String,
      default: "",
      trim: true,
    },
    tags: [
      {
        type: String,
      },
    ],
    review: [reviewSchema],
    startDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);
export default Task;
