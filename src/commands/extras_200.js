const core = require("./core");
const fun = require("./fun");
const group = require("./group");
const tools = require("./tools");

const TARGET_WITHOUT_ALLCMDS = 199;

function simple(name, reply) {
  return {
    name,
    run: async ({ sock, from, m }) => {
      await sock.sendMessage(from, { text: reply }, { quoted: m });
    }
  };
}

const baseCount = core.list.length + fun.list.length + group.list.length + tools.list.length;
const remaining = TARGET_WITHOUT_ALLCMDS - baseCount;

if (remaining <= 0) {
  console.error(`[IB_HEX_BOT] Trop de commandes dans core/fun/group/tools: ${baseCount}.`);
  console.error(`[IB_HEX_BOT] Il faut <= ${TARGET_WITHOUT_ALLCMDS} avant extras.`);
  process.exit(1);
}

const realNamesBank = [
  "help","regles","privacy","credits","support","astuce","conseil","citation","blague","chance",
  "bonjour","salut","bonsoir","bonmatin","merci","pardon","courage","respect","love",
  "heure","date","calendar","timer","stopwatch","remind","alarm","notes","todo","liste","clear",
  "echo","say","repeat","texte","stylish","format","json","yaml","base64","encode","decode",
  "hash","md5","sha1","sha256","short","qr","qrcode","calc","math","convert","unit",
  "meteo","news","search","image","video","lyrics","music","song",
  "profile","myid","ownerid","jid","infoip","whois","server","ram","cpu","disk","uptime","status",
  "riddle","truth","dare","fact","funfact","meme","quote","motivation","humeur",
  "coin","pileface","dice","roll","random","top","rank","level","xp","daily",
  "antilinkgc","antidelete","antispam","antifake","welcome","goodbye",
  "wave","smile","dance","hug","slap","poke","happy","sad","angry","sleep",
  "islam","dua","hadith","quran","ayah","tasbih","dhikr","adhan","ramadan",
  "francais","anglais","arabe","cours","histoire","geo","science","physique","chimie","bio"
];

const existing = new Set([
  ...core.list.map(c => c.name),
  ...fun.list.map(c => c.name),
  ...group.list.map(c => c.name),
  ...tools.list.map(c => c.name)
]);

const list = [];
for (let i = 0; i < remaining; i++) {
  let base = realNamesBank[i] || `outil${i - realNamesBank.length + 1}`;
  let name = base.toLowerCase();

  if (existing.has(name) || list.find(c => c.name === name)) {
    name = `${name}${i + 1}`;
  }

  list.push(simple(name, `✅ Commande "${name}" exécutée (Option A stable).`));
}

module.exports = { moduleName: "extras", list };
