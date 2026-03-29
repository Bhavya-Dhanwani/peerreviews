"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { signIn } from "next-auth/react"; 
import PasswordField from "@/components/ui/PasswordField";
import styles from "@/components/ui/AuthForm.module.css";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.73 1.22 9.25 3.61l6.9-6.9C35.95 2.37 30.49 0 24 0 14.62 0 6.51 5.38 2.56 13.22l8.04 6.24C12.52 13.69 17.77 9.5 24 9.5Z"
      />
      <path
        fill="#FBBC04"
        d="M2.56 13.22A23.88 23.88 0 0 0 0 24c0 3.84.92 7.47 2.56 10.78l8.04-6.24A14.5 14.5 0 0 1 9.5 24c0-1.57.25-3.09.7-4.54l-7.64-6.24Z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.39 0 11.76-2.1 15.68-5.68l-7.63-5.91c-2.14 1.46-4.88 2.32-8.05 2.32-6.23 0-11.48-4.19-13.4-9.95l-8.04 6.24C6.51 42.62 14.62 48 24 48Z"
      />
      <path
        fill="#4285F4"
        d="M48 24c0-1.57-.14-3.07-.4-4.5H24v9.27h13.52c-.6 3-2.3 5.53-4.88 7.14l7.63 5.91C44.73 37.66 48 31.53 48 24Z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.42-4.04-1.42-.55-1.38-1.33-1.74-1.33-1.74-1.08-.74.08-.73.08-.73 1.2.08 1.83 1.23 1.83 1.23 1.05 1.82 2.76 1.29 3.43.99.11-.77.41-1.29.74-1.58-2.67-.31-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.56.12-3.24 0 0 1-.32 3.3 1.23a11.3 11.3 0 0 1 6 0c2.29-1.55 3.29-1.23 3.29-1.23.66 1.68.25 2.94.13 3.24.77.84 1.23 1.91 1.23 3.22 0 4.62-2.81 5.64-5.49 5.95.42.36.8 1.08.8 2.19v3.24c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z"
      />
    </svg>
  );
}

export default function SignupForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

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

  const handleOAuthLogin = async (provider) => {
    try {
      await signIn(provider, { callbackUrl: "/" });
    } catch (error) {
      toast.error(`Failed to signup with ${provider}`);
    }
  };

  return (
    <form className={styles.stack} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.formIntro}>
        <span className={styles.introBadge}>Create Account</span>
        <p className={styles.introText}>Set up your profile to submit projects, join review threads, and give thoughtful peer feedback.</p>
      </div>

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
          validate: (value) => value === getValues("password") || "Passwords do not match.",
        })}
        error={errors.confirmPassword?.message}
      />

      <p className={styles.meta}>
        Use at least 8 characters with uppercase, lowercase, a number, and a special character.
      </p>

      <button
        className={styles.button}
        type="submit"
        disabled={isSubmitting}
        data-text={isSubmitting ? "Creating account..." : "Create Account"}
      >
        <span className={styles.buttonText}>{isSubmitting ? "Creating account..." : "Create Account"}</span>
      </button>

      {/* --- OAuth Section --- */}
      <div className={styles.separator}>
        <span>OR</span>
      </div>

      <div className={styles.oauthStack}>
        <button 
          type="button" 
          onClick={() => handleOAuthLogin("google")}
          className={`${styles.oauthButton} ${styles.googleButton}`}
          aria-label="Sign up with Google"
        >
          <span className={styles.oauthIcon}>
            <GoogleIcon />
          </span>
        </button>
        <button 
          type="button" 
          onClick={() => handleOAuthLogin("github")}
          className={`${styles.oauthButton} ${styles.githubButton}`}
          aria-label="Sign up with GitHub"
        >
          <span className={styles.oauthIcon}>
            <GitHubIcon />
          </span>
        </button>
      </div>

      <Link className={styles.link} href="/login">
        Already have an account?
      </Link>
    </form>
  );
}
