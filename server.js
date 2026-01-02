 const express = require("express");
const path = require("path");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, "public")));

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
