import { logoutController } from "@/controllers/auth.controller";
import apiHandler from "@/utils/api.middleware";
import { removePendingVerificationCookie } from "@/utils/pendingVerification.util";
import { removeSessionCookie } from "@/utils/session.util";

export const POST = apiHandler(async () => {
  const result = await logoutController();
  await removeSessionCookie();
  await removePendingVerificationCookie();
  return result;
});
