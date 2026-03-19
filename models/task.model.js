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
		},
		description_md: {
			type: String,
		},
		difficulty: {
			type: String,
		},
		tags: [
			{
				type: String,
			},
		],
		review: [reviewSchema],
	},
	{
		timestamps: true,
	},
);

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);
export default Task;
