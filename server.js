import http from "node:http";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { registerSocketServer } from "./lib/socket.server.js";

const isProd = process.argv.includes("--prod") || process.env.NODE_ENV === "production";
const port = Number(process.env.PORT || 3000);
const hostname = process.env.HOSTNAME || "0.0.0.0";

const app = next({ dev: !isProd, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = http.createServer((req, res) => handle(req, res));
  const io = new SocketIOServer(server, {
    path: "/socket.io",
    cors: {
      origin: true,
      credentials: true,
    },
  });

  registerSocketServer(io);

  io.on("connection", (socket) => {
    socket.on("task:join", (taskId) => {
      if (taskId) {
        socket.join(`task:${taskId}`);
      }
    });

    socket.on("task:leave", (taskId) => {
      if (taskId) {
        socket.leave(`task:${taskId}`);
      }
    });
  });

  server.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
