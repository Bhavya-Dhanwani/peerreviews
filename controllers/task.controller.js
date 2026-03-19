import { NextResponse } from "next/server";
import Task from "@/models/task.model";

export const getAllTasks = async () => {
	const allTasks = await Task.find();

	return NextResponse.json({
		message: "Task fetched successfully",
		data: allTasks,
	});
};

export const createTask = async (req) => {
	const body = await req.json();

	const { title, description_md, difficulty, tags, review } = body;

	if (!title) {
		return NextResponse.json(
			{ message: "Title is required" },
			{ status: 400 },
		);
	}

	const newTask = await Task.create({
		title,
		description_md,
		difficulty,
		tags,
		review,
	});

	return NextResponse.json(
		{
			message: "Task created successfully",
			data: newTask,
		},
		{ status: 201 },
	);
};

export const getSingleTask = async (req, { params }) => {
	const { id } = params;
	const task = await Task.findById(id);

	if (!task) {
		return NextResponse.json({ message: "Task not found" }, { status: 404 });
	}

	return NextResponse.json({
		message: "Task fetched successfully",
		data: task,
	});
};
