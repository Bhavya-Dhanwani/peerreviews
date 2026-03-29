import { resendOtpController } from "@/controllers/auth.controller";
import apiHandler from "@/utils/api.middleware";
import {
  getCurrentPendingVerification,
  setPendingVerificationCookie,
} from "@/utils/pendingVerification.util";

export const POST = apiHandler(async () => {
  const pendingVerification = await getCurrentPendingVerification();
  const result = await resendOtpController({
    email: pendingVerification?.user?.email,
  });

  if (result.pendingVerification) {
    await setPendingVerificationCookie(result.pendingVerification);
  }

  return result;
});
