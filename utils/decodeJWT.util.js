import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/config/db.config";
import User from "@/models/userModel";
import { getPublicUser } from "@/utils/auth.util";

export const SESSION_COOKIE_NAME = "feedback_session";

function getJwtSecret() {
  const secret = String(process.env.JWT_SECRET || "").trim();

  if (!secret) {
    throw new Error("Missing JWT_SECRET environment variable.");
  }

  return secret;
}

export async function decodeJWT() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  let payload;

  try {
    payload = jwt.verify(token, getJwtSecret());
  } catch {
    return null;
  }

  await connectDB();

  const user = await User.findById(payload.sub).lean();

  if (!user || !user.isVerified) {
    return null;
  }

  return getPublicUser(user);
}

export default decodeJWT;
