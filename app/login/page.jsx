import { redirect } from "next/navigation";
import LoginForm from "@/components/login/LoginForm";
import AuthShell from "@/components/ui/AuthShell";
import { getCurrentPendingVerification } from "@/utils/pendingVerification.util";
import { getCurrentSession } from "@/utils/session.util";

export const metadata = {
  title: "Login | Kodex Peer Reviews",
  description: "Log in to access Kodex Peer Reviews.",
};

export default async function LoginPage() {
  const session = await getCurrentSession();
  const pendingVerification = await getCurrentPendingVerification();

  if (session) {
    redirect("/");
  }

  if (pendingVerification) {
    redirect("/verify-otp");
  }

  return (
    <AuthShell
      badge="Secure Access"
      title="Log in to continue"
      description="Every page in Kodex Peer Reviews is protected, so start by logging in."
    >
      <LoginForm />
    </AuthShell>
  );
}
