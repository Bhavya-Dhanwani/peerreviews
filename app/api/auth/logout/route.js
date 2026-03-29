import { cookies } from "next/headers";
import { logoutController } from "@/controllers/auth.controller";
import apiHandler from "@/utils/api.middleware";
import { getEpochDate } from "@/utils/date.util";
import { removePendingVerificationCookie } from "@/utils/pendingVerification.util";
import { removeSessionCookie } from "@/utils/session.util";

async function clearNextAuthCookies() {
  const cookieStore = await cookies();
  const expires = getEpochDate();
  const cookieNames = [
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "next-auth.csrf-token",
    "__Host-next-auth.csrf-token",
    "authjs.csrf-token",
    "__Host-authjs.csrf-token",
    "next-auth.callback-url",
    "authjs.callback-url",
  ];

  for (const name of cookieNames) {
    cookieStore.set({
      name,
      value: "",
      httpOnly: name.includes("session-token") || name.includes("csrf-token"),
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires,
    });
  }
}

export const POST = apiHandler(async () => {
  const result = await logoutController();
  await removeSessionCookie();
  await removePendingVerificationCookie();
  await clearNextAuthCookies();
  return result;
});
