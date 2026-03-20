import mongoose from "mongoose";

const MONGO_URI = String(process.env.DB_URL || "").trim();

export default async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;

  if (
    !MONGO_URI.startsWith("mongodb://") &&
    !MONGO_URI.startsWith("mongodb+srv://")
  ) {
    throw new Error(
      "Invalid DB_URL. It must start with mongodb:// or mongodb+srv://"
    );
  }

  await mongoose.connect(MONGO_URI);
}
