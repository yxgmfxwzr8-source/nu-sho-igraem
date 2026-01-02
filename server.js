const path = require("path");
const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// раздача статики
app.use(express.static(path.join(__dirname, "public")));

// чтобы / всегда открывало index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const rooms = {}; // { CODE: { players: [{name, ws}], scores: {} } }

function makeCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

function broadcast(roomId, data) {
  const room = rooms[roomId];
  if (!room) return;
  room.players.forEach(p => {
    if (p.ws.readyState === WebSocket.OPEN) {
      p.ws.send(JSON.stringify(data));
    }
  });
}

wss.on("connection", (ws) => {
  ws.on("message", (raw) => {
    let data;
    try { data = JSON.parse(raw); } catch { return; }

    // 1) создать комнату
    if (data.type === "createRoom") {
      const roomId = makeCode();
      rooms[roomId] = { players: [], scores: {} };
      ws.send(JSON.stringify({ type: "roomCreated", roomId }));
      return;
    }

    // 2) войти в комнату
    if (data.type === "joinRoom") {
      const roomId = String (data.roomId = "").toUpperCase();
      const name = (data.name  "").trim();

      if (!rooms[roomId]) {
        ws.send(JSON.stringify({ type: "error", text: "Комната не найдена" }));
        return;
      }
      if (!name) {
        ws.send(JSON.stringify({ type: "error", text: "Введите ник" }));
        return;
      }

      rooms[roomId].players.push({ name, ws });
      rooms[roomId].scores[name] = rooms[roomId].scores[name] ?? 0;

      ws.send(JSON.stringify({ type: "roomJoined", roomId }));
      broadcast(roomId, {
        type: "players",
        players: rooms[roomId].players.map(p => p.name)
      });
      return;
    }
  });

  ws.on("close", () => {
    // упрощенно: не чистим комнаты сейчас
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server running on", PORT));
