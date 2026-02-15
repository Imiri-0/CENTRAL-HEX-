const buildMenuText = require("../menu");
const { DEV_NAME, OWNER_MSISDN, MENU_IMAGE_URL, VERSION, BOT_NAME } = require("../config");

const list = [
  { name: "menu", run: async ({ sock, from, m }) => {
    await sock.sendMessage(from, { image: { url: MENU_IMAGE_URL }, caption: buildMenuText() }, { quoted: m });
  }},
  { name: "alive", run: async ({ sock, from, m }) => sock.sendMessage(from, { text: "✅ Je suis en ligne et prêt." }, { quoted: m }) },
  { name: "ping", run: async ({ sock, from, m }) => {
    const start = Date.now();
    await sock.sendMessage(from, { text: "🏓 Pong..." }, { quoted: m });
    const ms = Date.now() - start;
    await sock.sendMessage(from, { text: `⚡ Vitesse: ${ms} ms` }, { quoted: m });
  }},
  { name: "dev", run: async ({ sock, from, m }) => sock.sendMessage(from, { text: `👨‍💻 Développeur: ${DEV_NAME}` }, { quoted: m }) },
  { name: "owner", run: async ({ sock, from, m }) => sock.sendMessage(from, { text: `👑 Propriétaire: ${OWNER_MSISDN}` }, { quoted: m }) },
  { name: "bot", run: async ({ sock, from, m }) => sock.sendMessage(from, { text: `🤖 ${BOT_NAME}\nVersion: ${VERSION}\nMode: privé\nPréfixe: Ib` }, { quoted: m }) }
];

module.exports = { moduleName: "core", list };

