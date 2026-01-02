let ws;

function connectWS() {
  ws = new WebSocket(
    (location.protocol === "https:" ? "wss://" : "ws://") + location.host
  );

  ws.onopen = () => console.log("WS connected");
  ws.onclose = () => console.log("WS closed");
  ws.onerror = (e) => console.log("WS error", e);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "roomCreated") {
      window.location.href = /room.html?code=${data.roomId};
    }

    if (data.type === "roomJoined") {
      window.location.href = /room.html?code=${data.roomId};
    }

    if (data.type === "error") {
      alert(data.text);
    }
  };
}

function getName() {
  const el = document.getElementById("name");
  return el ? el.value.trim() : "";
}

function getCode() {
  const el = document.getElementById("code");
  return el ? el.value.trim() : "";
}

window.addEventListener("load", () => {
  connectWS();

  const btnCreate = document.getElementById("btnCreate");
  const btnJoin = document.getElementById("btnJoin");

  if (btnCreate) {
    btnCreate.addEventListener("click", () => {
      ws.send(JSON.stringify({ type: "createRoom", name: getName() }));
    });
  }

  if (btnJoin) {
    btnJoin.addEventListener("click", () => {
      ws.send(
        JSON.stringify({ type: "joinRoom", name: getName(), roomId: getCode() })
      );
    });
  }
});
