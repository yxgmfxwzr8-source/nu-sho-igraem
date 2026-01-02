const statusEl = document.getElementById("status");
const nameEl = document.getElementById("name");
const codeEl = document.getElementById("code");
const createBtn = document.getElementById("createBtn");
const joinBtn = document.getElementById("joinBtn");

function setStatus(text) {
  statusEl.textContent = text;
}

const ws = new WebSocket(
  (location.protocol === "https:" ? "wss://" : "ws://") + location.host
);

ws.onopen = () => setStatus("Подключено ✅");
ws.onerror = () => setStatus("Ошибка подключения ❌");
ws.onclose = () => setStatus("Соединение закрыто ❌");

ws.onmessage = (e) => {
  const data = JSON.parse(e.data);

  if (data.type === "roomCreated") {
    setStatus("Комната создана: " + data.roomId);
    location.href = "/room.html?room=" + data.roomId + "&name=" + encodeURIComponent(nameEl.value.trim());
  }

  if (data.type === "roomJoined") {
    setStatus("Вошли в комнату: " + data.roomId);
    location.href = "/room.html?room=" + data.roomId + "&name=" + encodeURIComponent(nameEl.value.trim());
  }

  if (data.type === "error") {
    alert(data.text);
  }
};

createBtn.onclick = () => {
  if (ws.readyState !== 1) return alert("WebSocket ещё не подключился. Подожди 2 секунды.");
  ws.send(JSON.stringify({ type: "createRoom" }));
};

joinBtn.onclick = () => {
  if (ws.readyState !== 1) return alert("WebSocket ещё не подключился. Подожди 2 секунды.");
  const name = nameEl.value.trim();
  const roomId = codeEl.value.trim().toUpperCase();
  ws.send(JSON.stringify({ type: "joinRoom", roomId, name }));
};
