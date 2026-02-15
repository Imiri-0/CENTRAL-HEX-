const list = [
  { name: "groupinfo", run: async ({ sock, from, m }) =>
    sock.sendMessage(from, { text: "ℹ️ groupinfo (Option A) : commande active (mode simple)." }, { quoted: m }) },
  { name: "linkgc", run: async ({ sock, from, m }) =>
    sock.sendMessage(from, { text: "🔗 linkgc (Option A) : je dois être admin + être dans un groupe." }, { quoted: m }) },
  { name: "antilink", run: async ({ sock, from, m }) =>
    sock.sendMessage(from, { text: "🛡️ antilink (Option A) : commande enregistrée." }, { quoted: m }) }
];

module.exports = { moduleName: "group", list };
