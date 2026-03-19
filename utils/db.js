import mongoose from "mongoose";

const MONGO_URI = process.env.DB_URL;

export default async function connectDB() {
	if (mongoose.connection.readyState >= 1) return;

	await mongoose.connect(MONGO_URI);
}
