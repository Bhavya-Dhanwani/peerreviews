import ExpressError from "@/utils/ExpressError.util";
import decodeJWT from "@/utils/decodeJWT.util";

export async function requireApiSession(options = {}) {
  const { adminOnly = false } = options;
  const user = await decodeJWT();

  if (!user) {
    throw new ExpressError("Please log in to continue.", 401);
  }

  if (adminOnly && user.role !== "admin") {
    throw new ExpressError("You are not allowed to access this resource.", 403);
  }

  return user;
}
