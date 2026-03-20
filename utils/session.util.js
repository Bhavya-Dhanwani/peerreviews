import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import connectDB from "@/config/db.config";
import User from "@/models/userModel";
import { getPublicUser } from "@/utils/auth.util";
import { getEpochDate, getFutureDate } from "@/utils/date.util";

export const SESSION_COOKIE_NAME = "feedback_session";
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;
const SESSION_MAX_AGE_SECONDS = SESSION_MAX_AGE_MS / 1000;

function getJwtSecret() {
  const secret = String(process.env.JWT_SECRET || "").trim();

  if (!secret) {
    throw new Error("Missing JWT_SECRET environment variable.");
  }

  return secret;
}

export function getSessionCookieOptions(expiresAt) {
  return {
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  };
}

export function createSessionForUser(user) {
  const expiresAt = getFutureDate(SESSION_MAX_AGE_MS);
  const token = jwt.sign(
    {
      sub: String(user._id),
    },
    getJwtSecret(),
    {
      expiresIn: SESSION_MAX_AGE_SECONDS,
    }
  );

  return {
    token,
    expiresAt,
  };
}

export function applySessionCookie(response, session) {
  response.cookies.set({
    ...getSessionCookieOptions(session.expiresAt),
    value: session.token,
  });
}

export function clearSessionCookie(response) {
  response.cookies.set({
    ...getSessionCookieOptions(getEpochDate()),
    value: "",
  });
}

export async function setSessionCookie(session) {
  const cookieStore = await cookies();
  cookieStore.set({
    ...getSessionCookieOptions(session.expiresAt),
    value: session.token,
  });
}

export async function removeSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set({
    ...getSessionCookieOptions(getEpochDate()),
    value: "",
  });
}

export async function getCurrentSessionFromToken(token) {
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

  return {
    id: String(payload.sub),
    expiresAt: payload.exp ? new Date(payload.exp * 1000) : null,
    user: getPublicUser(user),
  };
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return getCurrentSessionFromToken(token);
}

export async function requireUserSession() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireAdminSession() {
  const session = await requireUserSession();

  if (session.user.role !== "admin") {
    redirect("/");
  }

  return session;
}
