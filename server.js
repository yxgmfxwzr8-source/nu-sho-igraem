 const express = require("express");
const path = require("path");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const fs = require("fs");

function pickPublicDir() {
  const a = path.join(__dirname, "public");
  const b = path.join(__dirname, "public", "public");

  const hasA = fs.existsSync(path.join(a, "index.html"));
  const hasB = fs.existsSync(path.join(b, "index.html"));

  // если index.html лежит в public/ — берём её
  if (hasA) return a;

  // если index.html лежит в public/public/ — берём её
  if (hasB) return b;

  // иначе просто возвращаем public/ (хотя это будет сигнал, что структура сломана)
  return a;
}

const PUBLIC_DIR = pickPublicDir();
console.log("✅ Static folder:", PUBLIC_DIR);

app.use(express.static(PUBLIC_DIR));

const rooms = {};

wss.on("connection", ws => {
  ws.on("message", msg => {
    const data = JSON.parse(msg);

    // СОЗДАТЬ КОМНАТУ
    if (data.type === "createRoom") {
      const roomId = Math.random().toString(36).substring(2, 6);
      rooms[roomId] = [data.name];

      ws.send(
        JSON.stringify({
          type: "roomCreated",
          roomId
        })
      );
    }

    // ВОЙТИ В КОМНАТУ
    if (data.type === "joinRoom") {
      if (!rooms[data.roomId]) {
        ws.send(
          JSON.stringify({
            type: "error",
            text: "Комната не найдена"
          })
        );
        return;
      }

      rooms[data.roomId].push(data.name);

      ws.send(
        JSON.stringify({
          type: "roomJoined",
          roomId: data.roomId
        })
      );
    }
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});
