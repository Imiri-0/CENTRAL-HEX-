const makeWASocket = require("@whiskeysockets/baileys").default;
const { DisconnectReason, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const pino = require("pino");

const { startWebServer } = require("./web/server");
const { handleIncoming } = require("./commands");

const PORT = process.env.PORT || 3000;

async function startBot() {
  startWebServer({
    port: PORT,
    onReady: () => console.log(`[WEB] QR page prête sur le port ${PORT}`)
  });

  // QR/connexion + sauvegarde creds (doc Baileys) [Source](https://baileys.wiki/docs/socket/connecting/)
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    auth: state
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      await fetch(`http://127.0.0.1:${PORT}/api/qr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrString: qr })
      }).catch(() => {});
    }

    if (connection === "open") {
      await fetch(`http://127.0.0.1:${PORT}/api/connected`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      }).catch(() => {});
      console.log("[BOT] Connecté ✅");
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log("[BOT] Déconnecté:", statusCode, "reconnect:", shouldReconnect);
      if (shouldReconnect) startBot();
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages?.[0];
    if (!m?.message) return;
    if (m.key?.fromMe) return;
    await handleIncoming(sock, m);
  });
}

startBot().catch(err => console.error("Fatal:", err));

