const list = [
  { name: "goodnight", run: async ({ sock, from, m }) => sock.sendMessage(from, { text: "🌙 Bonne nuit ! Repose-toi bien." }, { quoted: m }) },
  { name: "quiz", run: async ({ sock, from, m }) => {
    const q = [
      ["Capitale de la Guinée ?", "Conakry"],
      ["2 + 2 = ?", "4"],
      ["Couleur du ciel clair ?", "Bleu"]
    ];
    const [qq, ans] = q[Math.floor(Math.random() * q.length)];
    await sock.sendMessage(from, { text: `🧠 Quiz:\n${qq}\n(Réponse: ${ans})` }, { quoted: m });
  }},
  { name: "emojimix", run: async ({ sock, from, m, args }) => {
    const a = args[0] || "😀";
    const b = args[1] || "🔥";
    await sock.sendMessage(from, { text: `Mélange: ${a}${b} → ${a}✨${b}` }, { quoted: m });
  }}
];

module.exports = { moduleName: "fun", list };
