const ws = new WebSocket(location.origin.replace("http", "ws"));

function createRoom() {
  ws.send(JSON.stringify({
    type: "createRoom",
    name: document.getElementById("name").value || "Игрок"
  }));
}

function joinRoom() {
  ws.send(JSON.stringify({
    type: "joinRoom",
    roomId: document.getElementById("room").value,
    name: document.getElementById("name").value || "Игрок"
  }));
}

ws.onmessage = e => {
  const msg = JSON.parse(e.data);
  if (msg.type === "roomCreated") {
    alert("Комната создана! Код: " + msg.roomId);
  }
  if (msg.type === "error") {
    alert(msg.text);
  }
};
