"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import styles from "@/components/ui/AuthForm.module.css";

export default function VerifyOtpForm({ email = "", initialCooldownSeconds = 0 }) {
  const router = useRouter();
  const [resending, setResending] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(initialCooldownSeconds);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      otp: "",
    },
  });

  useEffect(() => {
    if (cooldownSeconds <= 0) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setCooldownSeconds((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [cooldownSeconds]);

  async function handleVerify(form) {
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.message || "Unable to verify OTP.");
        return;
      }

      toast.success(result.message || "Email verified successfully.");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Unable to verify OTP right now.");
    }
  }

  async function handleResend() {
    setResending(true);

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        const retryAfterSeconds = Number(result?.data?.retryAfterSeconds || 0);

        if (retryAfterSeconds > 0) {
          setCooldownSeconds(retryAfterSeconds);
          return;
        }

        toast.error(result.message || "Unable to resend OTP.");
        return;
      }

      setCooldownSeconds(60);
      toast.success(result.message || "OTP sent again.");
      router.refresh();
    } catch {
      toast.error("Unable to resend OTP right now.");
    } finally {
      setResending(false);
    }
  }

  return (
    <form className={styles.stack} onSubmit={handleSubmit(handleVerify)}>
      <p className={styles.meta}>
        Verifying <span className={styles.inlineValue}>{email || "your account"}</span>
      </p>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="verify-otp">
          OTP
        </label>
        <input
          id="verify-otp"
          className={styles.input}
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          {...register("otp", { required: "OTP is required." })}
          onChange={(event) =>
            setValue("otp", event.target.value.replace(/\D/g, "").slice(0, 6), {
              shouldValidate: true,
            })
          }
        />
        {errors.otp ? <p className={styles.fieldError}>{errors.otp.message}</p> : null}
      </div>

      <p className={styles.meta}>Enter the 6-digit code sent to your email inbox.</p>

      <button className={styles.button} type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Verifying..." : "Verify OTP"}
      </button>

      <div className={styles.actionRow}>
        <button
          className={styles.secondaryButton}
          type="button"
          onClick={handleResend}
          disabled={resending || cooldownSeconds > 0}
        >
          {resending
            ? "Sending..."
            : cooldownSeconds > 0
              ? `Resend OTP (${cooldownSeconds}s)`
              : "Resend OTP"}
        </button>
      </div>
    </form>
  );
}
