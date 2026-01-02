const path = require("path");
const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, "public")));

const rooms = {}; // { CODE: { players: [{name}], } }

function makeCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

wss.on("connection", (ws) => {
  ws.on("message", (raw) => {
    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      ws.send(JSON.stringify({ type: "error", text: "Неверный формат сообщения" }));
      return;
    }

    // Нормализация
    const type = String(data.type  "");
    const name = String(data.name  "Игрок").trim().slice(0, 20)  "Игрок";
    const roomId = String(data.roomId  "").trim().toUpperCase();

    // СОЗДАТЬ КОМНАТУ
    if (type === "createRoom") {
      let code = makeCode();
      while (rooms[code]) code = makeCode();

      rooms[code] = { players: [name] };

      ws.send(JSON.stringify({ type: "roomCreated", roomId: code }));
      return;
    }

    // ВОЙТИ В КОМНАТУ
    if (type === "joinRoom") {
      if (!rooms[roomId]) {
        ws.send(JSON.stringify({ type: "error", text: "Комната не найдена" }));
        return;
      }

      if (rooms[roomId].players.length >= 10) {
        ws.send(JSON.stringify({ type: "error", text: "Комната уже заполнена" }));
        return;
      }

      rooms[roomId].players.push(name);

      ws.send(
        JSON.stringify({
          type: "roomJoined",
          roomId: roomId,
          players: rooms[roomId].players,
        })
      );
      return;
    }

    ws.send(JSON.stringify({ type: "error", text: "Неизвестная команда" }));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server running on", PORT));
