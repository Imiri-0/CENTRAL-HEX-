const list = [
  { name: "allvar", run: async ({ sock, from, m }) => {
    const vars = process.env;
    const keys = Object.keys(vars).slice(0, 40);
    await sock.sendMessage(from, { text: "🔧 Variables (aperçu):\n" + keys.map(k => `- ${k}`).join("\n") }, { quoted: m });
  }},
  { name: "fancy", run: async ({ sock, from, m, args }) => {
    const t = args.join(" ") || "IB_HEX_BOT";
    await sock.sendMessage(from, { text: `✨ 𝗙𝗮𝗻𝗰𝘆: ${t.split("").join(" ")}` }, { quoted: m });
  }},
  { name: "url", run: async ({ sock, from, m, args }) => {
    const u = args[0];
    if (!u) return sock.sendMessage(from, { text: "Utilise: Iburl https://exemple.com" }, { quoted: m });
    await sock.sendMessage(from, { text: `🌐 Lien reçu: ${u}` }, { quoted: m });
  }}
];

module.exports = { moduleName: "tools", list };

