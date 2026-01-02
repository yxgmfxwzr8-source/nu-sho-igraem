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
