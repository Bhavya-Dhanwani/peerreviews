const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function normalizeName(name) {
  return String(name || "").trim().replace(/\s+/g, " ");
}

export function getUserRole(email) {
  const ownerEmail = normalizeEmail(process.env.OWNER_EMAIL);
  return ownerEmail && normalizeEmail(email) === ownerEmail ? "admin" : "user";
}

export function getPublicUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    avatar: user.avatar || "",
    provider: user.provider || "credentials",
    role: user.role,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
  };
}

export function validateSignupPayload(payload = {}) {
  const name = normalizeName(payload.name);
  const email = normalizeEmail(payload.email);
  const password = String(payload.password || "");
  const confirmPassword = String(payload.confirmPassword || "");

  if (!name || !email || !password || !confirmPassword) {
    return "name, email, password and confirmPassword are required.";
  }

  if (!EMAIL_REGEX.test(email)) {
    return "Please enter a valid email address.";
  }

  if (name.length < 2) {
    return "Name must be at least 2 characters long.";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }

  if (!STRONG_PASSWORD_REGEX.test(password)) {
    return "Password must include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.";
  }

  if (password !== confirmPassword) {
    return "Password and confirm password must match.";
  }

  return null;
}

export function validateLoginPayload(payload = {}) {
  const email = normalizeEmail(payload.email);
  const password = String(payload.password || "");

  if (!email || !password) {
    return "email and password are required.";
  }

  if (!EMAIL_REGEX.test(email)) {
    return "Please enter a valid email address.";
  }

  return null;
}

export function validateForgotPasswordPayload(payload = {}) {
  const email = normalizeEmail(payload.email);

  if (!email) {
    return "email is required.";
  }

  if (!EMAIL_REGEX.test(email)) {
    return "Please enter a valid email address.";
  }

  return null;
}

export function validateResetPasswordPayload(payload = {}) {
  const token = String(payload.token || "").trim();
  const password = String(payload.password || "");
  const confirmPassword = String(payload.confirmPassword || "");

  if (!token || !password || !confirmPassword) {
    return "token, password and confirmPassword are required.";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }

  if (password !== confirmPassword) {
    return "Password and confirm password must match.";
  }

  return null;
}

export function validateVerifyOtpPayload(payload = {}) {
  const otp = String(payload.otp || "").trim();

  if (!otp) {
    return "otp is required.";
  }

  if (!/^\d{6}$/.test(otp)) {
    return "OTP must be a 6-digit code.";
  }

  return null;
}
