import { resendOtpController } from "@/controllers/auth.controller";
import apiHandler from "@/utils/api.middleware";
import ExpressError from "@/utils/ExpressError.util";
import {
  getCurrentPendingVerification,
  removePendingVerificationCookie,
  setPendingVerificationCookie,
} from "@/utils/pendingVerification.util";

export const POST = apiHandler(async (request) => {
  let body = {};

  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const pendingVerification = await getCurrentPendingVerification();
  const email = pendingVerification?.user?.email || body?.email;

  if (!email) {
    await removePendingVerificationCookie();
    throw new ExpressError(
      "Your verification session has expired. Please log in again to request a new OTP.",
      400
    );
  }

  const result = await resendOtpController({
    email,
  });

  if (result.pendingVerification) {
    await setPendingVerificationCookie(result.pendingVerification);
  }

  return result;
});
