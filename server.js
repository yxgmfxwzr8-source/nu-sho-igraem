 const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static("public"));
app.use("/images", express.static("images"));

const rooms = {};

function sendPlayers(roomId) {
  const players = rooms[roomId].map(ws => ws.name);
  rooms[roomId].forEach(ws => {
    ws.send(JSON.stringify({
      type: "players",
      players
    }));
  });
}

wss.on("connection", ws => {
  ws.on("message", data => {
    const msg = JSON.parse(data);

    if (msg.type === "createRoom") {
      const roomId = Math.random().toString(36).substring(2, 6);
      ws.roomId = roomId;
      ws.name = msg.name;
      rooms[roomId] = [ws];

      ws.send(JSON.stringify({
        type: "roomCreated",
        roomId
      }));

      sendPlayers(roomId);
    }

    if (msg.type === "joinRoom") {
      if (!rooms[msg.roomId]) return;

      ws.roomId = msg.roomId;
      ws.name = msg.name;
      rooms[msg.roomId].push(ws);

      sendPlayers(msg.roomId);
    }
  });

  ws.on("close", () => {
    if (!ws.roomId || !rooms[ws.roomId]) return;
    rooms[ws.roomId] = rooms[ws.roomId].filter(c => c !== ws);
    sendPlayers(ws.roomId);
  });
});

server.listen(process.env.PORT || 3000);
