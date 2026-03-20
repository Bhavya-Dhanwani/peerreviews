import connectDB from "@/config/db.config";
import { createSuccessResponse } from "@/utils/api.util";
import wrapAsync from "@/utils/wrapAsync.util";

const apiHandler = (handler, options = {}) => {
  const { connectDb = true } = options;

  return wrapAsync(async (req, context) => {
    if (connectDb) {
      await connectDB();
    }

    const result = await handler(req, context);
    return result instanceof Response ? result : createSuccessResponse(result);
  });
};

export default apiHandler;
