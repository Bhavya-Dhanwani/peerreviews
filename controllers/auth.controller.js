import User from "@/models/userModel";
import ExpressError from "@/utils/ExpressError.util";
import {
  getPublicUser,
  getUserRole,
  normalizeEmail,
  normalizeName,
  validateForgotPasswordPayload,
  validateLoginPayload,
  validateResetPasswordPayload,
  validateSignupPayload,
  validateVerifyOtpPayload,
} from "@/utils/auth.util";
import { createSessionForUser } from "@/utils/session.util";
import {
  getPendingVerificationByUserId,
  savePendingVerificationForUser,
  deletePendingVerificationByUserId,
} from "@/utils/pendingVerification.util";
import {
  hashPassword,
  verifyPassword,
  createOpaqueToken,
  createNumericOtp,
  hashToken,
} from "@/utils/crypto.util";
import { sendMail } from "@/utils/mailer.util";
import {
  getEmailOtpTemplate,
  getResetPasswordTemplate,
  getWelcomeEmailTemplate,
} from "@/utils/emailTemplates.util";
import { getFutureDate, getNowDate, getNowMs, getTime, isAfterNow } from "@/utils/date.util";

const EMAIL_OTP_WINDOW_MS = 1000 * 60 * 60;
const OTP_RESEND_COOLDOWN_MS = 1000 * 60;
const MAX_OTP_RESENDS_PER_WINDOW = 3;

async function sendEmailOtp(user, otp) {
  const otpEmail = getEmailOtpTemplate({
    name: user.name,
    otp,
  });

  await sendMail({
    to: user.email,
    ...otpEmail,
  });
}

function hasUnexpiredPendingVerification(pendingVerification) {
  return Boolean(
    pendingVerification?.otp &&
      pendingVerification?.expiresAt &&
      isAfterNow(pendingVerification.expiresAt)
  );
}

function getOtpResendPolicy(pendingVerification) {
  const now = getNowMs();
  const firstSentAt = pendingVerification?.firstSentAt
    ? getTime(pendingVerification.firstSentAt)
    : 0;
  const lastSentAt = pendingVerification?.lastSentAt
    ? getTime(pendingVerification.lastSentAt)
    : 0;

  if (!firstSentAt || now - firstSentAt >= EMAIL_OTP_WINDOW_MS) {
    return {
      canResetWindow: true,
      cooldownRemainingMs: 0,
      resendCount: 0,
    };
  }

  return {
    canResetWindow: false,
    cooldownRemainingMs: Math.max(OTP_RESEND_COOLDOWN_MS - (now - lastSentAt), 0),
    resendCount: Number(pendingVerification?.resendCount || 0),
  };
}

async function issueNewEmailOtp(user) {
  const otp = createNumericOtp();
  const now = getNowDate();
  const expiresAt = getFutureDate(EMAIL_OTP_WINDOW_MS);
  const pendingVerification = await savePendingVerificationForUser(user._id, {
    otp,
    expiresAt,
    firstSentAt: now,
    lastSentAt: now,
    resendCount: 0,
  });

  await sendEmailOtp(user, otp);

  return pendingVerification;
}

async function resendEmailOtp(user) {
  const pendingVerification = await getPendingVerificationByUserId(user._id);
  const policy = getOtpResendPolicy(pendingVerification);

  if (hasUnexpiredPendingVerification(pendingVerification)) {
    if (policy.cooldownRemainingMs > 0) {
      const seconds = Math.ceil(policy.cooldownRemainingMs / 1000);
      throw new ExpressError(
        `Please wait ${seconds} seconds before requesting another OTP.`,
        429,
        { retryAfterSeconds: seconds }
      );
    }

    if (policy.resendCount >= MAX_OTP_RESENDS_PER_WINDOW) {
      throw new ExpressError(
        "You have reached the OTP resend limit. Please wait 1 hour and try again.",
        429
      );
    }

    const now = getNowDate();
    const nextFirstSentAt = pendingVerification.firstSentAt || pendingVerification.lastSentAt || now;
    const nextResendCount = Number(pendingVerification.resendCount || 0) + 1;

    await savePendingVerificationForUser(user._id, {
      otp: pendingVerification.otp,
      expiresAt: pendingVerification.expiresAt,
      firstSentAt: nextFirstSentAt,
      lastSentAt: now,
      resendCount: nextResendCount,
    });

    await sendEmailOtp(user, pendingVerification.otp);

    return {
      token: pendingVerification.token,
      expiresAt: pendingVerification.expiresAt,
    };
  }

  if (policy.canResetWindow) {
    return issueNewEmailOtp(user);
  }

  throw new ExpressError("There is no active OTP to resend right now.", 400);
}

export async function signupController(payload) {
  const validationError = validateSignupPayload(payload);

  if (validationError) {
    throw new ExpressError(validationError, 400);
  }

  const name = normalizeName(payload.name);
  const email = normalizeEmail(payload.email);
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ExpressError(
      "An account with this email already exists. Please log in instead.",
      409
    );
  }

  const user = await User.create({
    name,
    email,
    passwordHash: hashPassword(payload.password),
    role: getUserRole(email),
  });

  try {
    const pendingVerification = await issueNewEmailOtp(user);

    return {
      statusCode: 201,
      message: "Verification code sent to your email.",
      data: {
        email: user.email,
        requiresOtpVerification: true,
      },
      pendingVerification,
    };
  } catch (error) {
    await User.deleteOne({ _id: user._id });
    throw error instanceof ExpressError
      ? error
      : new ExpressError("Unable to send verification code right now.", 500);
  }
}

export async function loginController(payload) {
  const validationError = validateLoginPayload(payload);

  if (validationError) {
    throw new ExpressError(validationError, 400);
  }

  const email = normalizeEmail(payload.email);
  const user = await User.findOne({ email });

  if (!user || !verifyPassword(payload.password, user.passwordHash)) {
    throw new ExpressError("Invalid email or password.", 401);
  }

  if (!user.isVerified) {
    const pendingVerification = await getPendingVerificationByUserId(user._id);

    if (hasUnexpiredPendingVerification(pendingVerification)) {
      throw new ExpressError(
        "Your account is not verified yet. Please enter the OTP already sent to your email.",
        403,
        {
          email: user.email,
          requiresOtpVerification: true,
          pendingVerification: {
            token: pendingVerification.token,
            expiresAt: pendingVerification.expiresAt,
          },
        }
      );
    }

    const policy = getOtpResendPolicy(pendingVerification);

    if (policy.canResetWindow) {
      try {
        const nextPendingVerification = await issueNewEmailOtp(user);
        throw new ExpressError(
          "Your account is not verified yet. A new OTP has been sent.",
          403,
          {
            email: user.email,
            requiresOtpVerification: true,
            pendingVerification: nextPendingVerification,
          }
        );
      } catch (error) {
        if (error instanceof ExpressError) {
          throw error;
        }

        throw new ExpressError("Unable to send verification code right now.", 500);
      }
    }

    throw new ExpressError(
      policy.cooldownRemainingMs > 0
        ? `Your account is not verified yet. Please use the existing OTP or wait ${Math.ceil(
            policy.cooldownRemainingMs / 1000
          )} seconds to request a new one.`
        : "Your account is not verified yet. Please verify with your existing OTP.",
      403,
      {
        email: user.email,
        requiresOtpVerification: true,
        pendingVerification: pendingVerification
          ? {
              token: pendingVerification.token,
              expiresAt: pendingVerification.expiresAt,
            }
          : null,
      }
    );
  }

  return {
    message: "Logged in successfully.",
    data: {
      user: getPublicUser(user),
    },
    session: createSessionForUser(user),
  };
}

export async function verifyOtpController(payload) {
  const validationError = validateVerifyOtpPayload(payload);

  if (validationError) {
    throw new ExpressError(validationError, 400);
  }

  const pendingVerificationToken = String(payload.pendingVerificationToken || "").trim();

  if (!pendingVerificationToken) {
    throw new ExpressError("Your verification session is missing or expired. Please request a new OTP.", 400);
  }

  const user = await User.findOne({
    _id: payload.pendingVerificationUserId,
  });
  const pendingVerification = user ? await getPendingVerificationByUserId(user._id) : null;

  if (!user || user.isVerified) {
    throw new ExpressError("This OTP is invalid or no longer available.", 400);
  }

  if (!pendingVerification || !pendingVerification.otp || pendingVerification.expiresAt <= getNowDate()) {
    throw new ExpressError("This OTP has expired. Please request a new one.", 400);
  }

  if (String(pendingVerification.token) !== pendingVerificationToken) {
    throw new ExpressError("Your verification session is missing or expired. Please request a new OTP.", 400);
  }

  if (String(payload.otp) !== String(pendingVerification.otp)) {
    throw new ExpressError("Invalid OTP. Please try again.", 400);
  }

  user.isVerified = true;
  await user.save();
  await deletePendingVerificationByUserId(user._id);

  try {
    const welcomeEmail = getWelcomeEmailTemplate({ name: user.name });
    await sendMail({
      to: user.email,
      ...welcomeEmail,
    });
  } catch {
  }

  return {
    message: "Email verified successfully.",
    data: {
      user: getPublicUser(user),
    },
    session: createSessionForUser(user),
  };
}

export async function resendOtpController(payload) {
  const email = normalizeEmail(payload?.email);

  if (!email) {
    throw new ExpressError("email is required.", 400);
  }

  const user = await User.findOne({ email });

  if (!user || user.isVerified) {
    throw new ExpressError("No pending verification found for this email.", 404);
  }

  const pendingVerification = await resendEmailOtp(user);

  return {
    message: "Your existing OTP has been resent to your email.",
    data: {
      email: user.email,
      requiresOtpVerification: true,
    },
    pendingVerification,
  };
}

export async function logoutController() {
  return {
    message: "Logged out successfully.",
  };
}

export async function forgotPasswordController(payload, origin) {
  const validationError = validateForgotPasswordPayload(payload);

  if (validationError) {
    throw new ExpressError(validationError, 400);
  }

  const email = normalizeEmail(payload.email);
  const user = await User.findOne({ email });

  if (user) {
    const resetToken = createOpaqueToken();
    const resetPasswordExpiresAt = getFutureDate(1000 * 60 * 15);

    user.resetPasswordTokenHash = hashToken(resetToken);
    user.resetPasswordExpiresAt = resetPasswordExpiresAt;
    await user.save();

    const resetLink = `${origin}/reset-password?token=${resetToken}`;
    const resetEmail = getResetPasswordTemplate({
      name: user.name,
      resetLink,
    });

    await sendMail({
      to: user.email,
      ...resetEmail,
    });
  }

  return {
    message: "If an account exists with that email, a reset link has been sent.",
  };
}

export async function resetPasswordController(payload) {
  const validationError = validateResetPasswordPayload(payload);

  if (validationError) {
    throw new ExpressError(validationError, 400);
  }

  const user = await User.findOne({
    resetPasswordTokenHash: hashToken(payload.token),
    resetPasswordExpiresAt: { $gt: getNowDate() },
  });

  if (!user) {
    throw new ExpressError("This reset link is invalid or has expired.", 400);
  }

  user.passwordHash = hashPassword(payload.password);
  user.resetPasswordTokenHash = null;
  user.resetPasswordExpiresAt = null;
  await user.save();

  return {
    message: "Password reset successfully.",
    data: {
      user: getPublicUser(user),
    },
    session: createSessionForUser(user),
  };
}

export async function getSessionController(user) {
  return {
    data: {
      user,
    },
  };
}
