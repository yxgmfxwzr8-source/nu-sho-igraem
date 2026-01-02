const express = require("express");
const path = require("path");
const http = require("http");
const WebSocket = require("ws");

const app = express();

// раздача статики
app.use(express.static(path.join(__dirname, "public")));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// roomId -> { players: [] }
const rooms = new Map();

function makeRoomId() {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

function broadcast(roomId, payload) {
  const msg = JSON.stringify(payload);
  wss.clients.forEach((c) => {
    if (c.readyState === WebSocket.OPEN && c.roomId === roomId) c.send(msg);
  });
}

wss.on("connection", (ws) => {
  ws.on("message", (raw) => {
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return;
    }

    // CREATE ROOM
    if (data.type === "createRoom") {
      const name = String(data.name  "").trim().slice(0, 20)  "Игрок";

      let roomId;
      do {
        roomId = makeRoomId();
      } while (rooms.has(roomId));

      rooms.set(roomId, { players: [name] });

      ws.roomId = roomId;
      ws.name = name;

      ws.send(JSON.stringify({ type: "roomCreated", roomId }));
      return;
    }

    // JOIN ROOM
    if (data.type === "joinRoom") {
      const roomId = String(data.roomId  "").trim().toUpperCase();
      const name = String(data.name  "").trim().slice(0, 20)  "Игрок";

      const room = rooms.get(roomId);
      if (!room) {
        ws.send(JSON.stringify({ type: "error", text: "Комната не найдена" }));
        return;
      }

      if (room.players.length >= 10) {
        ws.send(JSON.stringify({ type: "error", text: "Комната заполнена" }));
        return;
      }

      room.players.push(name);

      ws.roomId = roomId;
      ws.name = name;

      ws.send(JSON.stringify({ type: "roomJoined", roomId, players: room.players }));
      broadcast(roomId, { type: "players", players: room.players });
      return;
    }
  });

  ws.on("close", () => {
    if (!ws.roomId) return;
    const room = rooms.get(ws.roomId);
    if (!room) return;

    room.players = room.players.filter((p) => p !== ws.name);

    if (room.players.length === 0) rooms.delete(ws.roomId);
    else broadcast(ws.roomId, { type: "players", players: room.players });
  });
});

server.listen(process.env.PORT  3000, () => {
  console.log("Server running");
});
