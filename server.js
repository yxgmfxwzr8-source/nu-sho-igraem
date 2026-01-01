const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static("public"));
app.use("/images", express.static("images"));

const rooms = {};

wss.on("connection", ws => {
  ws.on("message", data => {
    const msg = JSON.parse(data);

    if (msg.type === "createRoom") {
      const roomId = Math.random().toString(36).substring(2, 6);
      ws.roomId = roomId;
      ws.name = msg.name;
      rooms[roomId] = rooms[roomId] || [];
      rooms[roomId].push(ws);
      ws.send(JSON.stringify({ type: "roomCreated", roomId }));
    }

    if (msg.type === "joinRoom") {
      if (!rooms[msg.roomId]) {
        ws.send(JSON.stringify({ type: "error", text: "Комната не найдена" }));
        return;
      }
      ws.roomId = msg.roomId;
      ws.name = msg.name;
      rooms[msg.roomId].push(ws);
    }

    if (msg.type === "broadcast") {
      rooms[ws.roomId].forEach(client => {
        client.send(JSON.stringify(msg));
      });
    }
  });
});

server.listen(process.env.PORT || 3000);
