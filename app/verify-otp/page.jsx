import { redirect } from "next/navigation";
import VerifyOtpForm from "@/components/login/VerifyOtpForm";
import AuthShell from "@/components/ui/AuthShell";
import { getCurrentPendingVerification } from "@/utils/pendingVerification.util";
import { getCurrentSession } from "@/utils/session.util";

export const metadata = {
  title: "Verify OTP | Kodex Peer Reviews",
  description: "Verify your email with the one-time password sent to you.",
};

const OTP_RESEND_COOLDOWN_MS = 1000 * 60;

export default async function VerifyOtpPage() {
  const session = await getCurrentSession();
  const pendingVerification = await getCurrentPendingVerification();

  if (session) {
    redirect("/");
  }

  if (!pendingVerification) {
    redirect("/login");
  }

  const lastSentAtMs = pendingVerification.lastSentAt
    ? new Date(pendingVerification.lastSentAt).getTime()
    : 0;
  const initialCooldownSeconds = Math.max(
    Math.ceil((lastSentAtMs + OTP_RESEND_COOLDOWN_MS - Date.now()) / 1000),
    0
  );

  return (
    <AuthShell
      badge="Email Verification"
      title="Finish your account setup"
      description="Enter the OTP from your inbox to verify your email and complete sign in."
    >
      <VerifyOtpForm
        email={pendingVerification.user.email}
        initialCooldownSeconds={initialCooldownSeconds}
      />
    </AuthShell>
  );
}
