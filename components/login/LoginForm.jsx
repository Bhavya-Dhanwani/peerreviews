"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { signIn } from "next-auth/react"; // 👈 NextAuth import
import PasswordField from "@/components/ui/PasswordField";
import styles from "@/components/ui/AuthForm.module.css";

export default function LoginForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Manual Login Logic (Bhavya's Logic)
  async function onSubmit(form) {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const result = await response.json();

      if (result.data?.requiresOtpVerification) {
        toast.error(result.message || "Please verify your email first.");
        router.push("/verify-otp");
        router.refresh();
        return;
      }

      if (!response.ok || !result.success) {
        toast.error(result.message || "Unable to log in.");
        return;
      }

      toast.success(result.message || "Logged in successfully.");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Unable to log in right now.");
    }
  }

  // OAuth Login Handler
  const handleOAuthLogin = async (provider) => {
    try {
      // callbackUrl ka matlab hai login ke baad user kahan jaye
      await signIn(provider, { callbackUrl: "/" });
    } catch (error) {
      toast.error(`Failed to login with ${provider}`);
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.stack} onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            className={styles.input}
            type="email"
            autoComplete="email"
            {...register("email", { required: "Email is required." })}
          />
          {errors.email ? <p className={styles.fieldError}>{errors.email.message}</p> : null}
        </div>

        <PasswordField
          id="login-password"
          label="Password"
          autoComplete="current-password"
          inputProps={register("password", { required: "Password is required." })}
          error={errors.password?.message}
        />

        <button className={styles.button} type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Log In"}
        </button>

        {/* --- Separator --- */}
        <div className={styles.separator}>
          <span>OR</span>
        </div>

        {/* --- OAuth Buttons --- */}
        <div className={styles.oauthStack}>
          <button 
            type="button"
            onClick={() => handleOAuthLogin("google")}
            className={`${styles.button} ${styles.googleButton}`}
          >
            Continue with Google
          </button>
          
          <button 
            type="button"
            onClick={() => handleOAuthLogin("github")}
            className={`${styles.button} ${styles.githubButton}`}
          >
            Continue with GitHub
          </button>
        </div>

        <div className={styles.linkRow}>
          <Link className={styles.link} href="/forgot-password">
            Forgot password?
          </Link>
          <Link className={styles.link} href="/signup">
            Create account
          </Link>
        </div>
      </form>
    </div>
  );
}