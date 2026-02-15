async function poll() {
  const statusRes = await fetch("/api/status");
  const status = await statusRes.json();
  document.getElementById("status").textContent = "Statut: " + status.message;

  const qrRes = await fetch("/api/qr");
  const { qr } = await qrRes.json();

  const qrBox = document.querySelector(".qr");
  qrBox.innerHTML = "";

  if (qr) {
    const img = document.createElement("img");
    img.src = qr;
    qrBox.appendChild(img);
  } else {
    qrBox.textContent = status.connected ? "Connecté ✅" : "En attente du QR…";
  }
}

setInterval(poll, 1500);
poll();

