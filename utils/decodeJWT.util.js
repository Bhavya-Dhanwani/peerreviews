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

// Try custom feedback_session JWT cookie
async function tryCustomSession(cookieStore) {
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

// Try NextAuth session-token cookie (for Google/GitHub OAuth users)
async function tryNextAuthSession(cookieStore) {
  // NextAuth uses "next-auth.session-token" in development
  // and "__Secure-next-auth.session-token" in production
  const tokenCookie =
    cookieStore.get("next-auth.session-token") ||
    cookieStore.get("__Secure-next-auth.session-token");

  if (!tokenCookie?.value) {
    return null;
  }

  const nextAuthSecret = String(process.env.NEXTAUTH_SECRET || "").trim();

  if (!nextAuthSecret) {
    return null;
  }

  let payload;

  try {
    // NextAuth v4 with JWT strategy uses JWE (encrypted JWT)
    // We need to use the decode function from next-auth/jwt
    const { decode } = await import("next-auth/jwt");
    payload = await decode({
      token: tokenCookie.value,
      secret: nextAuthSecret,
    });
  } catch {
    return null;
  }

  if (!payload?.email) {
    return null;
  }

  await connectDB();

  const user = await User.findOne({ email: payload.email }).lean();

  if (!user || !user.isVerified) {
    return null;
  }

  return getPublicUser(user);
}

export async function decodeJWT() {
  const cookieStore = await cookies();

  // First try custom JWT session
  const customUser = await tryCustomSession(cookieStore);
  if (customUser) return customUser;

  // Fallback to NextAuth session (Google/GitHub OAuth)
  const nextAuthUser = await tryNextAuthSession(cookieStore);
  if (nextAuthUser) return nextAuthUser;

  return null;
}

export default decodeJWT;

