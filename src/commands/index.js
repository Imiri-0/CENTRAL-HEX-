const { PREFIX, OWNER_MSISDN, ONE_COMMAND_AT_A_TIME } = require("../config");
const core = require("./core");
const fun = require("./fun");
const group = require("./group");
const tools = require("./tools");
const extras = require("./extras_200");

const allCommands = new Map();

[core, fun, group, tools, extras].forEach(mod => {
  mod.list.forEach(cmd => allCommands.set(cmd.name, cmd));
});

allCommands.set("allcmds", {
  name: "allcmds",
  run: async ({ sock, from, m, PREFIX }) => {
    const names = [...allCommands.keys()].sort();
    const lines = names.map(n => `• ${PREFIX}${n}`).join("\n");
    const txt = `📜 Liste des commandes (${names.length})\n\n${lines}`;
    await sock.sendMessage(from, { text: txt }, { quoted: m });
  }
});

// EXACTEMENT 200 commandes
if (allCommands.size !== 200) {
  console.error(`[IB_HEX_BOT] ERREUR: Nombre de commandes = ${allCommands.size} (attendu 200).`);
  process.exit(1);
}

let busy = false;

function normalizeText(msg) {
  return (msg || "").trim();
}

function isOwner(senderJid) {
  const msisdn = (senderJid || "").split("@")[0];
  return msisdn === OWNER_MSISDN;
}

async function handleIncoming(sock, m) {
  const sender = m.key?.participant || m.key?.remoteJid;
  const from = m.key?.remoteJid;

  if (!isOwner(sender)) return;

  const text =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    m.message?.imageMessage?.caption ||
    m.message?.videoMessage?.caption ||
    "";

  const body = normalizeText(text);
  if (!body.startsWith(PREFIX)) return;

  const noPrefix = body.slice(PREFIX.length).trim();
  const [cmdNameRaw, ...args] = noPrefix.split(/\s+/);
  const cmdName = (cmdNameRaw || "").toLowerCase();

  const cmd = allCommands.get(cmdName);
  if (!cmd) {
    await sock.sendMessage(from, { text: `Commande inconnue: ${PREFIX}${cmdName}\nTape ${PREFIX}menu` }, { quoted: m });
    return;
  }

  if (ONE_COMMAND_AT_A_TIME && busy) {
    await sock.sendMessage(from, { text: "⏳ Patiente… je traite déjà une commande." }, { quoted: m });
    return;
  }

  try {
    busy = true;
    await cmd.run({ sock, m, from, sender, args, PREFIX });
  } catch (e) {
    await sock.sendMessage(from, { text: "❌ Erreur: " + (e?.message || String(e)) }, { quoted: m });
  } finally {
    busy = false;
  }
}

module.exports = { handleIncoming };

