import { getSessionController } from "@/controllers/auth.controller";
import apiHandler from "@/utils/api.middleware";
import { requireApiSession } from "@/utils/routeAuth.util";

export const GET = apiHandler(
  async () => {
    const session = await requireApiSession();
    return getSessionController(session);
  },
  { connectDb: false }
);
