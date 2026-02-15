const { BOT_NAME, MODE, PREFIX, DEV_NAME, VERSION } = require("./config");

module.exports = function buildMenuText() {
  return `╭──𝗜𝗕-𝗛𝗘𝗫-𝗕𝗢𝗧─────🥷
│ 𝗕𝗼𝘁 : ${BOT_NAME}
│ 𝗠𝗼𝗱𝗲 : ${MODE}
│ 𝗣𝗿𝗲𝗳𝗶𝘅𝗲 : ${PREFIX}
│ 𝗣𝗿𝗼𝗽𝗿𝗶𝗲́𝘁𝗮𝗶𝗿𝗲 : Ib🥷
│ 𝗗𝗲́𝘃𝗲𝗹𝗼𝗽𝗽𝗲𝘂𝗿 : ${DEV_NAME}
│ 𝗩𝗲𝗿𝘀𝗶𝗼𝗻 : ${VERSION}
╰──────────────🥷

🥷─────────────────🥷
『 𝗠𝗘𝗡𝗨 』
│ ⬡ menu → afficher le menu
│ ⬡ alive → état du bot
│ ⬡ ping → vitesse du bot
│ ⬡ dev → développeur
│ ⬡ owner → propriétaire
│ ⬡ bot → informations bot
│ ⬡ allcmds → toutes les commandes (liste complète)
╰──────────────────🥷

📜 Pour voir toutes les commandes: tape ${PREFIX}allcmds`;
};
