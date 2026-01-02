let ws;
let pendingAction = null;

function connect() {
  ws = new WebSocket(
    (location.protocol === "https:" ? "wss://" : "ws://") + location.host
  );

  ws.onopen = () => {
    if (pendingAction) {
      ws.send(JSON.stringify(pendingAction));
      pendingAction = null;
    }
  };

  ws.onmessage = e => {
    const msg = JSON.parse(e.data);

    if (msg.type === "roomCreated") {
      const name = document.getElementById("name").value || "Игрок";
      window.location.href =
        `/room.html?room=${msg.roomId}&name=${encodeURIComponent(name)}`;
    }

    if (msg.type === "error") {
      alert(msg.text);
    }
  };
}

connect();

function createRoom() {
  const name = document.getElementById("name").value || "Игрок";
  const message = { type: "createRoom", name };

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  } else {
    pendingAction = message;
  }
}

function joinRoom() {
  const name = document.getElementById("name").value || "Игрок";
  const roomId = document.getElementById("room").value;

  const message = { type: "joinRoom", roomId, name };

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  } else {
    pendingAction = message;
  }
}
