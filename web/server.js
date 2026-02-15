const express = require("express");
const QRCode = require("qrcode");

function startWebServer({ port, onReady }) {
  const app = express();
  app.use(express.json());
  app.use(express.static(__dirname + "/public"));

  let lastQRDataUrl = null;
  let status = { connected: false, message: "En attente du QR..." };

  app.get("/api/status", (req, res) => res.json(status));
  app.get("/api/qr", (req, res) => res.json({ qr: lastQRDataUrl }));

  app.post("/api/qr", async (req, res) => {
    const { qrString } = req.body || {};
    if (!qrString) return res.status(400).json({ ok: false });
    lastQRDataUrl = await QRCode.toDataURL(qrString);
    status = { connected: false, message: "QR prêt. Scanne avec WhatsApp." };
    res.json({ ok: true });
  });

  app.post("/api/connected", (req, res) => {
    lastQRDataUrl = null;
    status = { connected: true, message: "Connecté ✅" };
    res.json({ ok: true });
  });

  const server = app.listen(port, () => onReady?.(server.address()));
  return { app, server };
}

module.exports = { startWebServer };
