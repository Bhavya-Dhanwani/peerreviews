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
