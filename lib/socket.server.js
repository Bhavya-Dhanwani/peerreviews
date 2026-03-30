let ioInstance = null;

export function registerSocketServer(io) {
  ioInstance = io;
}

export function getSocketServer() {
  return ioInstance;
}

export function emitTaskCommentCreated(taskId, payload) {
  if (!ioInstance || !taskId) {
    return;
  }

  ioInstance.to(`task:${taskId}`).emit("comment:created", payload);
}

export function emitTaskSubmissionCreated(taskId, payload) {
  if (!ioInstance || !taskId) {
    return;
  }

  ioInstance.to(`task:${taskId}`).emit("submission:created", payload);
}

export function emitTaskSubmissionLiked(taskId, payload) {
  if (!ioInstance || !taskId) {
    return;
  }

  ioInstance.to(`task:${taskId}`).emit("submission:liked", payload);
}

export function emitTaskReviewCreated(taskId, payload) {
  if (!ioInstance || !taskId) {
    return;
  }

  ioInstance.to(`task:${taskId}`).emit("review:created", payload);
}
