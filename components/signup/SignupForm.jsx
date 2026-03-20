"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { signIn } from "next-auth/react"; // 👈 NextAuth import
import PasswordField from "@/components/ui/PasswordField";
import styles from "@/components/ui/AuthForm.module.css";

export default function SignupForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Manual Signup Logic
  async function onSubmit(form) {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.message || "Unable to create your account.");
        return;
      }

      if (result.data?.requiresOtpVerification) {
        toast.success(result.message || "Verification code sent.");
        router.push("/verify-otp");
        router.refresh();
        return;
      }

      toast.success(result.message || "Account created successfully.");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Unable to create your account right now.");
    }
  }

  // OAuth Handler (Exactly same as Login)
  const handleOAuthLogin = async (provider) => {
    try {
      await signIn(provider, { callbackUrl: "/" });
    } catch (error) {
      toast.error(`Failed to signup with ${provider}`);
    }
  };

  return (
    <form className={styles.stack} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="signup-name">
          Name
        </label>
        <input
          id="signup-name"
          className={styles.input}
          type="text"
          autoComplete="name"
          {...register("name", { required: "Name is required." })}
        />
        {errors.name ? <p className={styles.fieldError}>{errors.name.message}</p> : null}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="signup-email">
          Email
        </label>
        <input
          id="signup-email"
          className={styles.input}
          type="email"
          autoComplete="email"
          {...register("email", { required: "Email is required." })}
        />
        {errors.email ? <p className={styles.fieldError}>{errors.email.message}</p> : null}
      </div>

      <PasswordField
        id="signup-password"
        label="Password"
        autoComplete="new-password"
        inputProps={register("password", { required: "Password is required." })}
        error={errors.password?.message}
      />

      <PasswordField
        id="signup-confirm-password"
        label="Confirm Password"
        autoComplete="new-password"
        inputProps={register("confirmPassword", {
          required: "Please confirm your password.",
          validate: (value) => value === watch("password") || "Passwords do not match.",
        })}
        error={errors.confirmPassword?.message}
      />

      <p className={styles.meta}>
        Use at least 8 characters with uppercase, lowercase, a number, and a special character.
      </p>

      <button className={styles.button} type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating account..." : "Create Account"}
      </button>

      {/* --- OAuth Section --- */}
      <div className={styles.separator}>
        <span>OR</span>
      </div>

      <div className={styles.oauthStack}>
        <button 
          type="button" 
          onClick={() => handleOAuthLogin("google")}
          className={`${styles.button} ${styles.googleButton}`}
        >
          Sign up with Google
        </button>
        <button 
          type="button" 
          onClick={() => handleOAuthLogin("github")}
          className={`${styles.button} ${styles.githubButton}`}
        >
          Sign up with GitHub
        </button>
      </div>

      <Link className={styles.link} href="/login">
        Already have an account?
      </Link>
    </form>
  );
}