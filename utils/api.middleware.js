const apiHandler = (handler) => {
	return async (req, context) => {
		try {
			const connectDB = (await import("@/lib/db")).default;
			await connectDB();

			return await handler(req, context);
		} catch (error) {
			return Response.json(
				{
					success: false,
					message: error.message || "Internal Server Error",
				},
				{ status: 500 },
			);
		}
	};
};

export default apiHandler;
