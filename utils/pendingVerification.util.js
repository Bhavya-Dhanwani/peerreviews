import { cookies } from "next/headers";
import connectDB from "@/config/db.config";
import PendingVerification from "@/models/pendingVerificationModel";
import User from "@/models/userModel";
import { createOpaqueToken } from "@/utils/crypto.util";
import { getEpochDate, getFutureDate, getNowDate } from "@/utils/date.util";

export const PENDING_VERIFICATION_COOKIE_NAME = "feedback_pending_verification";
const PENDING_VERIFICATION_MAX_AGE_MS = 1000 * 60 * 60;

function getPendingVerificationCookieOptions(expiresAt) {
  return {
    name: PENDING_VERIFICATION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  };
}

export async function createPendingVerificationForUser(userId) {
  await connectDB();

  const token = createOpaqueToken();
  const expiresAt = getFutureDate(PENDING_VERIFICATION_MAX_AGE_MS);

  return {
    token,
    expiresAt,
  };
}

export async function getPendingVerificationByUserId(userId) {
  await connectDB();
  return PendingVerification.findOne({ userId });
}

export async function savePendingVerificationForUser(userId, data = {}) {
  await connectDB();

  const existingRecord = await PendingVerification.findOne({ userId });
  const token = existingRecord?.token || createOpaqueToken();
  const nextRecord = {
    userId,
    token,
    otp: data.otp,
    expiresAt: data.expiresAt,
    firstSentAt: data.firstSentAt,
    lastSentAt: data.lastSentAt,
    resendCount: data.resendCount ?? 0,
  };

  await PendingVerification.findOneAndUpdate(
    { userId },
    nextRecord,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return {
    token,
    expiresAt: data.expiresAt,
  };
}

export function applyPendingVerificationCookie(response, pendingVerification) {
  response.cookies.set({
    ...getPendingVerificationCookieOptions(pendingVerification.expiresAt),
    value: pendingVerification.token,
  });
}

export function clearPendingVerificationCookie(response) {
  response.cookies.set({
    ...getPendingVerificationCookieOptions(getEpochDate()),
    value: "",
  });
}

export async function setPendingVerificationCookie(pendingVerification) {
  const cookieStore = await cookies();
  cookieStore.set({
    ...getPendingVerificationCookieOptions(pendingVerification.expiresAt),
    value: pendingVerification.token,
  });
}

export async function removePendingVerificationCookie() {
  const cookieStore = await cookies();
  cookieStore.set({
    ...getPendingVerificationCookieOptions(getEpochDate()),
    value: "",
  });
}

export async function deletePendingVerificationByUserId(userId) {
  await connectDB();
  await PendingVerification.deleteMany({ userId });
}

export async function deletePendingVerificationByToken(token) {
  if (!token) {
    return;
  }

  await connectDB();
  await PendingVerification.deleteOne({ token });
}

export async function getPendingVerificationFromToken(token) {
  if (!token) {
    return null;
  }

  await connectDB();

  const pendingVerification = await PendingVerification.findOne({
    token,
    expiresAt: { $gt: getNowDate() },
  }).lean();

  if (!pendingVerification) {
    return null;
  }

  const user = await User.findById(pendingVerification.userId).lean();

  if (!user || user.isVerified) {
    await PendingVerification.deleteOne({ _id: pendingVerification._id });
    return null;
  }

  return {
    id: String(pendingVerification._id),
    token: pendingVerification.token,
    otp: pendingVerification.otp,
    expiresAt: pendingVerification.expiresAt,
    firstSentAt: pendingVerification.firstSentAt,
    lastSentAt: pendingVerification.lastSentAt,
    resendCount: pendingVerification.resendCount,
    user: {
      id: String(user._id),
      email: user.email,
      name: user.name,
    },
  };
}

export async function getCurrentPendingVerification() {
  const cookieStore = await cookies();
  const token = cookieStore.get(PENDING_VERIFICATION_COOKIE_NAME)?.value;
  return getPendingVerificationFromToken(token);
}
