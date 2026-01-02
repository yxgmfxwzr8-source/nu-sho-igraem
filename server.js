 const express = require("express");
const path = require("path");
const http = require("http");

const app = express();
const server = http.createServer(app);

app.use(express.static(path.join(__dirname, "public")));

const rooms = {};

server.on("upgrade", (req, socket, head) => {
  const WebSocket = require("ws");
  const wss = new WebSocket.Server({ noServer: true });

  wss.handleUpgrade(req, socket, head, ws => {
    ws.on("message", msg => {
      const data = JSON.parse(msg);

      if (data.type === "createRoom") {
        const roomId = Math.random().toString(36).substring(2, 6);
        rooms[roomId] = [data.name];
        ws.send(JSON.stringify({ type: "roomCreated", roomId }));
      }

      if (data.type === "joinRoom") {
        if (!rooms[data.roomId]) {
          ws.send(JSON.stringify({ type: "error", text: "Комната не найдена" }));
          return;
        }
        rooms[data.roomId].push(data.name);
        ws.send(JSON.stringify({ type: "roomJoined", roomId: data.roomId }));
      }
    });
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});
