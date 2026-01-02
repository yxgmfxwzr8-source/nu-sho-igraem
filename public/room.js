const params = new URLSearchParams(window.location.search);
const roomId = params.get("room");
const name = params.get("name");

document.getElementById("roomCode").innerText = roomId;

const ws = new WebSocket(location.origin.replace("http", "ws"));

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: "joinRoom",
    roomId,
    name
  }));
};

ws.onmessage = e => {
  const msg = JSON.parse(e.data);

  if (msg.type === "players") {
    const list = document.getElementById("players");
    list.innerHTML = "";
    msg.players.forEach(p => {
      const div = document.createElement("div");
      div.innerText = p;
      list.appendChild(div);
    });
  }
};
