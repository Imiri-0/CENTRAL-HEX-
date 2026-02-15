import { commands } from './commands.js';
import { downloadMediaMessage } from '@whiskeysockets/baileys';
import axios from 'axios';
import fs from 'fs';

// Utilitaire pour extraire le texte du message
function getMessageText(msg) {
    return (
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        msg.message?.videoMessage?.caption ||
        ''
    );
}

// Vérifier si l'utilisateur est le propriétaire
function isOwner(sender, config) {
    return sender === config.owner;
}

// Vérifier si c'est un admin du groupe
async function isAdmin(sock, groupId, userId) {
    try {
        const groupMetadata = await sock.groupMetadata(groupId);
        const participant = groupMetadata.participants.find(p => p.id === userId);
        return participant?.admin === 'admin' || participant?.admin === 'superadmin';
    } catch {
        return false;
    }
}

// Fonction principale de gestion des commandes
export async function handleCommand(sock, msg, config) {
    try {
        const text = getMessageText(msg);
        if (!text) return;

        // Vérifier le préfixe "Ib"
        if (!text.startsWith(config.prefix)) return;

        const args = text.slice(config.prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();
        const sender = msg.key.remoteJid;
        const isGroup = sender.endsWith('@g.us');

        console.log(`📩 Commande reçue: ${config.prefix}${command} de ${sender}`);

        // Trouver la commande
        const cmd = commands.find(c => c.cmd === command);
        
        // ==================== MENU GÉNÉRAL ====================
        if (command === 'menu') {
            const menuText = `╭──𝗜𝗕-𝗛𝗘𝗫-𝗕𝗢𝗧─────🥷
│ 𝗕𝗼𝘁 : ${config.botName}
│ 𝗠𝗼𝗱𝗲 : ${config.mode}
│ 𝗣𝗿𝗲𝗳𝗶𝘅𝗲 : ${config.prefix}
│ 𝗣𝗿𝗼𝗽𝗿𝗶𝗲́𝘁𝗮𝗶𝗿𝗲 : Ib🥷
│ 𝗗𝗲́𝘃𝗲𝗹𝗼𝗽𝗽𝗲𝘂𝗿 : ${config.ownerName}
│ 𝗩𝗲𝗿𝘀𝗶𝗼𝗻 : ${config.version}
╰──────────────🥷
🤖─────────────────🤖
       🥷 𝗜𝗕𝗥𝗔𝗛𝗜𝗠𝗔 𝗦𝗢𝗥𝗬 𝗦𝗔𝗖𝗞𝗢 🥷
🤖─────────────────🤖

🥷─────────────────🥷
『 𝗠𝗘𝗡𝗨-𝗛𝗘𝗫-𝗕𝗢𝗧 』
│ ⬡ ${config.prefix}menu → afficher le menu
│ ⬡ ${config.prefix}alive → état du bot
│ ⬡ ${config.prefix}dev → développeur
│ ⬡ ${config.prefix}allvar → toutes les variables
│ ⬡ ${config.prefix}ping → vitesse du bot
│ ⬡ ${config.prefix}owner → propriétaire
╰──────────────────🥷

🥷──────────────────🥷
『 𝗢𝗪𝗡𝗘𝗥-𝗛𝗘𝗫-𝗕𝗢𝗧 』
│ ⬡ ${config.prefix}join → rejoindre un groupe
│ ⬡ ${config.prefix}leave → quitter un groupe
│ ⬡ ${config.prefix}repo → dépôt GitHub
╰──────────────────🥷

🥷──────────────────🥷
『 𝗜𝗔-𝗛𝗘𝗫-𝗕𝗢𝗧 』
│ ⬡ ${config.prefix}ai → intelligence artificielle
│ ⬡ ${config.prefix}gpt → ChatGPT
╰──────────────────🥷

🥷──────────────────🥷
『 𝗖𝗢𝗡𝗩𝗘𝗥𝗧𝗜𝗦𝗦𝗘𝗨𝗥-𝗛𝗘𝗫-𝗕𝗢𝗧 』
│ ⬡ ${config.prefix}sticker → créer sticker
│ ⬡ ${config.prefix}toimage → sticker vers image
╰──────────────────🥷

🥷──────────────────🥷
『 𝗥𝗘𝗖𝗛𝗘𝗥𝗖𝗛𝗘-𝗛𝗘𝗫-𝗕𝗢𝗧』
│ ⬡ ${config.prefix}google → recherche Google
│ ⬡ ${config.prefix}image → recherche images
│ ⬡ ${config.prefix}weather → météo
╰──────────────────🥷

🥷──────────────────🥷
『 𝗗𝗜𝗩𝗘𝗥𝗧𝗜𝗦𝗦𝗘𝗠𝗘𝗡𝗧-𝗛𝗘𝗫-𝗕𝗢𝗧 』
│ ⬡ ${config.prefix}getpp → photo de profil
│ ⬡ ${config.prefix}profile → profil utilisateur
╰──────────────────🥷

🥷─────────────────🥷
『 𝗚𝗥𝗢𝗨𝗣𝗘𝗦-𝗛𝗘𝗫-𝗕𝗢𝗧 』
│ ⬡ ${config.prefix}tagall → mentionner tous
│ ⬡ ${config.prefix}tagadmin → mention admins
│ ⬡ ${config.prefix}groupclose → fermer groupe
│ ⬡ ${config.prefix}groupopen → ouvrir groupe
│ ⬡ ${config.prefix}linkgc → lien du groupe
│ ⬡ ${config.prefix}groupinfo → infos groupe
│ ⬡ ${config.prefix}add → ajouter membre
│ ⬡ ${config.prefix}kick → exclure membre
│ ⬡ ${config.prefix}promote → promouvoir admin
│ ⬡ ${config.prefix}demote → rétrograder
╰──────────────────🥷

🥷──────────────────🥷
『 𝗥𝗘́𝗔𝗖𝗧𝗜𝗢𝗡𝗦-𝗛𝗘𝗫-𝗕𝗢𝗬 』
│ ⬡ ${config.prefix}yeet → jeter
│ ⬡ ${config.prefix}slap → gifler
│ ⬡ ${config.prefix}nom → manger
│ ⬡ ${config.prefix}poke → toucher
│ ⬡ ${config.prefix}wave → saluer
│ ⬡ ${config.prefix}smile → sourire
│ ⬡ ${config.prefix}dance → danser
│ ⬡ ${config.prefix}happy → heureux
╰──────────────────🥷

🥷──────────────────🥷
『 𝗝𝗘𝗨𝗫-𝗛𝗘𝗫-𝗕𝗢𝗧 』
│ ⬡ ${config.prefix}truth → vérité
│ ⬡ ${config.prefix}dare → défi
│ ⬡ ${config.prefix}ship → compatibilité
│ ⬡ ${config.prefix}dice → lancer dé
│ ⬡ ${config.prefix}coin → pile ou face
│ ⬡ ${config.prefix}8ball → boule magique
│ ⬡ ${config.prefix}joke → blague
│ ⬡ ${config.prefix}rate → noter
│ ⬡ ${config.prefix}trivia → culture générale
╰──────────────────🥷

🥷──────────────────🥷
『 𝗨𝗧𝗜𝗟𝗜𝗧𝗔𝗜𝗥𝗘𝗦 』
│ ⬡ ${config.prefix}calc → calculatrice
│ ⬡ ${config.prefix}random → nombre aléatoire
│ ⬡ ${config.prefix}reverse → inverser texte
│ ⬡ ${config.prefix}length → longueur texte
│ ⬡ ${config.prefix}uppercase → majuscules
│ ⬡ ${config.prefix}lowercase → minuscules
│ ⬡ ${config.prefix}qrcode → générer QR code
╰──────────────────🥷

🥷───────────────────🥷
            ⚡ 𝗜𝗕-𝗛𝗘𝗫-𝗕𝗢𝗧 ⚡
   propulsé par ${config.ownerName}™
🥷───────────────────🥷

📊 *Total des commandes: ${commands.length}*
💡 *Tapez ${config.prefix}allcmds pour voir toutes les commandes*`;

            try {
                await sock.sendMessage(sender, {
                    image: { url: 'https://i.ibb.co/fYbBRWyy/IMG-20260210-WA0152.jpg' },
                    caption: menuText
                });
            } catch (err) {
                await sock.sendMessage(sender, { text: menuText });
            }
            return;
        }

        if (command === 'alive') {
            const uptime = process.uptime();
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);

            await sock.sendMessage(sender, {
                text: `🥷 *IB-HEX-BOT EST ACTIF!* 🥷

✅ *Statut:* En ligne
⏱️ *Temps actif:* ${hours}h ${minutes}m ${seconds}s
📱 *Version:* ${config.version}
👤 *Propriétaire:* ${config.ownerName}
🎯 *Préfixe:* ${config.prefix}
📊 *Commandes:* ${commands.length}

━━━━━━━━━━━━━━━━━━━
*Propulsé par Ibrahima Sory Sacko™*`
            });
            return;
        }

        if (command === 'ping') {
            const start = Date.now();
            await sock.sendMessage(sender, { text: '🏓 Ping...' });
            const ping = Date.now() - start;
            await sock.sendMessage(sender, {
                text: `🥷 *PONG!* 🥷\n\n⚡ *Vitesse:* ${ping}ms\n💨 *Latence:* ${ping < 100 ? 'Excellente' : ping < 300 ? 'Bonne' : 'Moyenne'}`
            });
            return;
        }

        if (command === 'owner' || command === 'dev') {
            await sock.sendMessage(sender, {
                text: `🥷 *PROPRIÉTAIRE DU BOT* 🥷

👤 *Nom:* ${config.ownerName}
📱 *Numéro:* +224 621 96 30 59
💼 *Statut:* Développeur Principal
🔧 *Spécialité:* Bot WhatsApp

━━━━━━━━━━━━━━━━━━━
*IB-HEX-BOT v${config.version}*`,
                mentions: [config.owner]
            });
            return;
        }

        if (command === 'allcmds' || command === 'allvar') {
            let cmdList = `🥷 *TOUTES LES COMMANDES IB-HEX-BOT* 🥷\n\n`;
            cmdList += `📊 *Total: ${commands.length} commandes*\n`;
            cmdList += `🎯 *Préfixe: ${config.prefix}*\n\n`;
            
            const categories = [...new Set(commands.map(c => c.category))];
            
            categories.forEach(cat => {
                const catCommands = commands.filter(c => c.category === cat);
                cmdList += `\n『 ${cat.toUpperCase()} 』 (${catCommands.length})\n`;
                catCommands.forEach((c, i) => {
                    cmdList += `${i + 1}. ${config.prefix}${c.cmd}\n`;
                });
            });

            cmdList += `\n━━━━━━━━━━━━━━━━━━━\n`;
            cmdList += `*Propulsé par ${config.ownerName}™*`;

            await sock.sendMessage(sender, { text: cmdList });
            return;
        }

        if (command === 'repo') {
            await sock.sendMessage(sender, {
                text: `🥷 *IB-HEX-BOT REPOSITORY* 🥷

📦 *Nom:* IB-HEX-BOT
⭐ *Version:* ${config.version}
👨‍💻 *Développeur:* ${config.ownerName}
📝 *License:* MIT
🔗 *GitHub:* https://github.com/ibrahima-hex-bot

━━━━━━━━━━━━━━━━━━━
*Bot WhatsApp avec ${commands.length} commandes!*`
            });
            return;
        }

        if (command === 'bot') {
            await sock.sendMessage(sender, {
                text: `🥷 *INFORMATIONS BOT* 🥷

🤖 *Nom:* ${config.botName}
📱 *Version:* ${config.version}
🎯 *Préfixe:* ${config.prefix}
📊 *Commandes:* ${commands.length}
👤 *Propriétaire:* ${config.ownerName}
🔧 *Mode:* ${config.mode}
💻 *Plateforme:* Node.js
📚 *Library:* Baileys

━━━━━━━━━━━━━━━━━━━
*Tapez ${config.prefix}menu pour voir toutes les commandes*`
            });
            return;
        }

        // ==================== COMMANDES OWNER ====================
        if (command === 'join') {
            if (!isOwner(msg.key.participant || sender, config)) {
                await sock.sendMessage(sender, { text: '❌ Seul le propriétaire peut utiliser cette commande!' });
                return;
            }

            const inviteLink = args[0];
            if (!inviteLink) {
                await sock.sendMessage(sender, { text: `❌ Usage: ${config.prefix}join <lien-du-groupe>` });
                return;
            }

            try {
                const code = inviteLink.split('/').pop();
                await sock.groupAcceptInvite(code);
                await sock.sendMessage(sender, { text: '✅ Bot ajouté au groupe avec succès!' });
            } catch (err) {
                await sock.sendMessage(sender, { text: '❌ Impossible de rejoindre le groupe. Lien invalide?' });
            }
            return;
        }

        if (command === 'leave') {
            if (!isOwner(msg.key.participant || sender, config)) {
                await sock.sendMessage(sender, { text: '❌ Seul le propriétaire peut utiliser cette commande!' });
                return;
            }

            if (!isGroup) {
                await sock.sendMessage(sender, { text: '❌ Cette commande fonctionne uniquement dans les groupes!' });
                return;
            }

            await sock.sendMessage(sender, { text: '👋 Au revoir! Le bot quitte le groupe...' });
            await sock.groupLeave(sender);
            return;
        }

        // ==================== COMMANDES IA ====================
        if (command === 'ai' || command === 'gpt' || command === 'chatbot') {
            const query = args.join(' ');
            if (!query) {
                await sock.sendMessage(sender, { text: `❌ Usage: ${config.prefix}${command} <question>` });
                return;
            }

            await sock.sendMessage(sender, { text: '🤖 Réflexion en cours...' });
            
            try {
                // Simuler une réponse IA (remplacer par une vraie API)
                await sock.sendMessage(sender, {
                    text: `🤖 *IB-HEX AI*\n\n💬 Question: ${query}\n\n🧠 Réponse: Je suis IB-HEX-BOT, votre assistant intelligent! Pour des réponses plus avancées, connectez une API IA (OpenAI, Gemini, etc.)`
                });
            } catch (err) {
                await sock.sendMessage(sender, { text: '❌ Erreur IA. Réessayez plus tard.' });
            }
            return;
        }

        if (command === 'bug') {
            const bugReport = args.join(' ');
            if (!bugReport) {
                await sock.sendMessage(sender, { text: `❌ Usage: ${config.prefix}bug <description du bug>` });
                return;
            }

            await sock.sendMessage(config.owner, {
                text: `🐛 *RAPPORT DE BUG*\n\n👤 De: @${sender.split('@')[0]}\n📝 Bug: ${bugReport}`,
                mentions: [sender]
            });
            await sock.sendMessage(sender, { text: '✅ Bug signalé au développeur! Merci 🥷' });
            return;
        }

        if (command === 'gemini') {
            const query = args.join(' ');
            if (!query) {
                await sock.sendMessage(sender, { text: `❌ Usage: ${config.prefix}gemini <question>` });
                return;
            }
            await sock.sendMessage(sender, {
                text: `💎 *GEMINI AI*\n\n❌ API non configurée. Ajoutez votre clé API Gemini pour activer cette fonctionnalité.`
            });
            return;
        }

        // ==================== CONVERTISSEUR ====================
        if (command === 'sticker') {
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const hasMedia = msg.message?.imageMessage || msg.message?.videoMessage || 
                            quoted?.imageMessage || quoted?.videoMessage;

            if (!hasMedia) {
                await sock.sendMessage(sender, { text: '❌ Répondez à une image/vidéo ou envoyez une image avec la commande!' });
                return;
            }

            try {
                await sock.sendMessage(sender, { text: '🎨 Création du sticker...' });
                
                const messageToDownload = quoted || msg.message;
                const buffer = await downloadMediaMessage(
                    { message: messageToDownload },
                    'buffer',
                    {}
                );

                await sock.sendMessage(sender, {
                    sticker: buffer,
                    package: 'IB-HEX-BOT',
                    author: config.ownerName
                });
            } catch (err) {
                console.error('Erreur sticker:', err);
                await sock.sendMessage(sender, { text: '❌ Erreur lors de la création du sticker!' });
            }
            return;
        }

        if (command === 'toimage') {
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quoted?.stickerMessage) {
                await sock.sendMessage(sender, { text: '❌ Répondez à un sticker!' });
                return;
            }

            try {
                const buffer = await downloadMediaMessage(
                    { message: quoted },
                    'buffer',
                    {}
                );

                await sock.sendMessage(sender, {
                    image: buffer,
                    caption: '✅ Sticker converti en image!'
                });
            } catch (err) {
                await sock.sendMessage(sender, { text: '❌ Erreur de conversion!' });
            }
            return;
        }

        // ==================== RECHERCHE ====================
        if (command === 'google') {
            const query = args.join(' ');
            if (!query) {
                await sock.sendMessage(sender, { text: `❌ Usage: ${config.prefix}google <recherche>` });
                return;
            }

            const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            await sock.sendMessage(sender, {
                text: `🔍 *RECHERCHE GOOGLE*\n\n📝 Requête: ${query}\n🔗 Lien: ${url}`
            });
            return;
        }

        if (command === 'image') {
            const query = args.join(' ');
            if (!query) {
                await sock.sendMessage(sender, { text: `❌ Usage: ${config.prefix}image <recherche>` });
                return;
            }

            try {
                await sock.sendMessage(sender, { text: '🖼️ Recherche d\'images...' });
                
                // Simuler recherche image
                const imageUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(query)}`;
                
                await sock.sendMessage(sender, {
                    image: { url: imageUrl },
                    caption: `🖼️ *Résultat pour:* ${query}`
                });
            } catch (err) {
                await sock.sendMessage(sender, { text: '❌ Aucune image trouvée!' });
            }
            return;
        }

        if (command === 'weather') {
            const city = args.join(' ');
            if (!city) {
                await sock.sendMessage(sender, { text: `❌ Usage: ${config.prefix}weather <ville>` });
                return;
            }

            await sock.sendMessage(sender, {
                text: `🌤️ *MÉTÉO*\n\n📍 Ville: ${city}\n\n❌ API météo non configurée. Ajoutez une clé API OpenWeatherMap pour activer cette fonctionnalité.`
            });
            return;
        }

        // ==================== DIVERTISSEMENT ====================
        if (command === 'getpp') {
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
            const targetJid = mentionedJid || (quoted ? msg.message.extendedTextMessage.contextInfo.participant : sender);

            try {
                const ppUrl = await sock.profilePictureUrl(targetJid, 'image');
                await sock.sendMessage(sender, {
                    image: { url: ppUrl },
                    caption: `✅ Photo de profil de @${targetJid.split('@')[0]}`,
                    mentions: [targetJid]
                });
            } catch (err) {
                await sock.sendMessage(sender, { text: '❌ Pas de photo de profil!' });
            }
            return;
        }

        if (command === 'profile') {
            const targetJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || sender;
            const targetName = targetJid.split('@')[0];

            await sock.sendMessage(sender, {
                text: `👤 *PROFIL UTILISATEUR*\n\n📱 Numéro: @${targetName}\n🆔 JID: ${targetJid}\n👥 Type: ${targetJid.endsWith('@g.us') ? 'Groupe' : 'Privé'}`,
                mentions: [targetJid]
            });
            return;
        }

        // ==================== COMMANDES DE GROUPE ====================
        if (isGroup) {
            const groupMetadata = await sock.groupMetadata(sender);
            const isAdminUser = await isAdmin(sock, sender, msg.key.participant);
            const isBotAdmin = await isAdmin(sock, sender, sock.user.id);

            if (command === 'tagall') {
                if (!isAdminUser && !isOwner(msg.key.participant, config)) {
                    await sock.sendMessage(sender, { text: '❌ Seuls les admins peuvent utiliser cette commande!' });
                    return;
                }

                let tagText = args.join(' ') || '📢 Mention de groupe';
                const mentions = groupMetadata.participants.map(p => p.id);
                
                tagText += '\n\n';
                mentions.forEach((member, i) => {
                    tagText += `${i + 1}. @${member.split('@')[0]}\n`;
                });

                await sock.sendMessage(sender, {
                    text: tagText,
                    mentions: mentions
                });
                return;
            }

            if (command === 'tagadmin') {
                const admins = groupMetadata.participants.filter(
                    p => p.admin === 'admin' || p.admin === 'superadmin'
                );
                
                let adminText = '👑 *ADMINS DU GROUPE*\n\n';
                const mentions = admins.map(a => a.id);
                
                admins.forEach((admin, i) => {
                    adminText += `${i + 1}. @${admin.id.split('@')[0]}\n`;
                });

                await sock.sendMessage(sender, {
                    text: adminText,
                    mentions: mentions
                });
                return;
            }

            if (command === 'linkgc') {
                if (!isBotAdmin) {
                    await sock.sendMessage(sender, { text: '❌ Le bot doit être admin!' });
                    return;
                }

                const inviteCode = await sock.groupInviteCode(sender);
                await sock.sendMessage(sender, {
                    text: `🔗 *LIEN DU GROUPE*\n\nhttps://chat.whatsapp.com/${inviteCode}`
                });
                return;
            }

            if (command === 'groupinfo') {
                const admins = groupMetadata.participants.filter(
                    p => p.admin === 'admin' || p.admin === 'superadmin'
                );

                const info = `🥷 *INFORMATIONS DU GROUPE* 🥷

📝 *Nom:* ${groupMetadata.subject}
📊 *Membres:* ${groupMetadata.participants.length}
👑 *Admins:* ${admins.length}
📅 *Créé:* ${new Date(groupMetadata.creation * 1000).toLocaleDateString('fr-FR')}
🔒 *Restreint:* ${groupMetadata.restrict ? 'Oui' : 'Non'}
📢 *Annonces:* ${groupMetadata.announce ? 'Oui' : 'Non'}

📄 *Description:*
${groupMetadata.desc || 'Aucune description'}`;

                await sock.sendMessage(sender, { text: info });
                return;
            }

            if (command === 'groupopen') {
                if (!isAdminUser && !isOwner(msg.key.participant, config)) {
                    await sock.sendMessage(sender, { text: '❌ Seuls les admins peuvent utiliser cette commande!' });
                    return;
                }
                if (!isBotAdmin) {
                    await sock.sendMessage(sender, { text: '❌ Le bot doit être admin!' });
                    return;
                }

                await sock.groupSettingUpdate(sender, 'not_announcement');
                await sock.sendMessage(sender, { text: '✅ Groupe ouvert! Tous les membres peuvent envoyer des messages.' });
                return;
            }

            if (command === 'groupclose') {
                if (!isAdminUser && !isOwner(msg.key.participant, config)) {
                    await sock.sendMessage(sender, { text: '❌ Seuls les admins peuvent utiliser cette commande!' });
                    return;
                }
                if (!isBotAdmin) {
                    await sock.sendMessage(sender, { text: '❌ Le bot doit être admin!' });
                    return;
                }

                await sock.groupSettingUpdate(sender, 'announcement');
                await sock.sendMessage(sender, { text: '🔒 Groupe fermé! Seuls les admins peuvent envoyer des messages.' });
                return;
            }

            if (command === 'add') {
                if (!isAdminUser && !isOwner(msg.key.participant, config)) {
                    await sock.sendMessage(sender, { text: '❌ Seuls les admins peuvent utiliser cette commande!' });
                    return;
                }
                if (!isBotAdmin) {
                    await sock.sendMessage(sender, { text: '❌ Le bot doit être admin!' });
                    return;
                }

                const number = args[0]?.replace(/[^0-9]/g, '');
                if (!number) {
                    await sock.sendMessage(sender, { text: `❌ Usage: ${config.prefix}add <numéro>` });
                    return;
                }

                try {
                    await sock.groupParticipantsUpdate(sender, [`${number}@s.whatsapp.net`], 'add');
                    await sock.sendMessage(sender, { text: `✅ @${number} ajouté au groupe!`, mentions: [`${number}@s.whatsapp.net`] });
                } catch (err) {
                    await sock.sendMessage(sender, { text: '❌ Impossible d\'ajouter ce numéro!' });
                }
                return;
            }

            if (command === 'kick') {
                if (!isAdminUser && !isOwner(msg.key.participant, config)) {
                    await sock.sendMessage(sender, { text: '❌ Seuls les admins peuvent utiliser cette commande!' });
                    return;
                }
                if (!isBotAdmin) {
                    await sock.sendMessage(sender, { text: '❌ Le bot doit être admin!' });
                    return;
                }

                const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
                const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                const targetJid = mentionedJid || (quoted ? msg.message.extendedTextMessage.contextInfo.participant : null);

                if (!targetJid) {
                    await sock.sendMessage(sender, { text: '❌ Mentionnez un utilisateur ou répondez à son message!' });
                    return;
                }

                try {
                    await sock.groupParticipantsUpdate(sender, [targetJid], 'remove');
                    await sock.sendMessage(sender, { text: `✅ @${targetJid.split('@')[0]} exclu du groupe!`, mentions: [targetJid] });
                } catch (err) {
                    await sock.sendMessage(sender, { text: '❌ Impossible d\'exclure cet utilisateur!' });
                }
                return;
            }

            if (command === 'promote') {
                if (!isAdminUser && !isOwner(msg.key.participant, config)) {
                    await sock.sendMessage(sender, { text: '❌ Seuls les admins peuvent utiliser cette commande!' });
                    return;
                }
                if (!isBotAdmin) {
                    await sock.sendMessage(sender, { text: '❌ Le bot doit être admin!' });
                    return;
                }

                const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
                const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                const targetJid = mentionedJid || (quoted ? msg.message.extendedTextMessage.contextInfo.participant : null);

                if (!targetJid) {
                    await sock.sendMessage(sender, { text: '❌ Mentionnez un utilisateur ou répondez à son message!' });
                    return;
                }

                try {
                    await sock.groupParticipantsUpdate(sender, [targetJid], 'promote');
                    await sock.sendMessage(sender, { text: `✅ @${targetJid.split('@')[0]} promu admin!`, mentions: [targetJid] });
                } catch (err) {
                    await sock.sendMessage(sender, { text: '❌ Impossible de promouvoir cet utilisateur!' });
                }
                return;
            }

            if (command === 'demote') {
                if (!isAdminUser && !isOwner(msg.key.participant, config)) {
                    await sock.sendMessage(sender, { text: '❌ Seuls les admins peuvent utiliser cette commande!' });
                    return;
                }
                if (!isBotAdmin) {
                    await sock.sendMessage(sender, { text: '❌ Le bot doit être admin!' });
                    return;
                }

                const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
                const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                const targetJid = mentionedJid || (quoted ? msg.message.extendedTextMessage.contextInfo.participant : null);

                if (!targetJid) {
                    await sock.sendMessage(sender, { text: '❌ Mentionnez un utilisateur ou répondez à son message!' });
                    return;
                }

                try {
                    await sock.groupParticipantsUpdate(sender, [targetJid], 'demote');
                    await sock.sendMessage(sender, { text: `✅ @${targetJid.split('@')[0]} rétrogradé!`, mentions: [targetJid] });
                } catch (err) {
                    await sock.sendMessage(sender, { text: '❌ Impossible de rétrograder cet utilisateur!' });
                }
                return;
            }
        }

        // ==================== RÉACTIONS ====================
        const reactions = {
            'yeet': '🤾‍♂️ *YEET!* Lance l\'utilisateur au loin! 💨',
            'slap': '👋 *SLAP!* Une grosse gifle! 💥',
            'nom': '😋 *NOM NOM!* Miam miam! 🍴',
            'poke': '👉 *POKE!* Touche touche! 👈',
            'wave': '👋 *Coucou!* Salut à tous! 😊',
            'smile': '😊 *SMILE!* Un beau sourire! ✨',
            'dance': '💃 *DANCE!* Dansons ensemble! 🕺',
            'smug': '😏 *SMUG!* Sourire narquois... 😎',
            'cringe': '😬 *CRINGE!* Malaise total... 😅',
            'happy': '😄 *HAPPY!* Je suis trop content! 🎉'
        };

        if (reactions[command]) {
            await sock.sendMessage(sender, { text: reactions[command] });
            return;
        }

        // ==================== JEUX ====================
        if (command === 'dice') {
            const result = Math.floor(Math.random() * 6) + 1;
            const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
            await sock.sendMessage(sender, { text: `🎲 *LANCER DE DÉ*\n\n${diceEmojis[result - 1]} Résultat: *${result}* 🎯` });
            return;
        }

        if (command === 'coin') {
            const result = Math.random() < 0.5 ? 'Pile' : 'Face';
            await sock.sendMessage(sender, { text: `🪙 *PILE OU FACE*\n\nRésultat: *${result}* ${result === 'Pile' ? '🔵' : '⚪'}` });
            return;
        }

        if (command === '8ball') {
            const responses = [
                'Oui, absolument! ✅',
                'Non, certainement pas. ❌',
                'Peut-être... 🤔',
                'C\'est certain! 💯',
                'Je n\'en suis pas sûr... 😕',
                'Essaye encore! 🔄',
                'Les étoiles disent oui! ⭐',
                'Les signes disent non... ⛔',
                'Sans aucun doute! 🎯',
                'Mieux vaut ne pas te le dire maintenant... 🤐'
            ];
            const question = args.join(' ') || 'Pas de question';
            const answer = responses[Math.floor(Math.random() * responses.length)];
            await sock.sendMessage(sender, { text: `🔮 *BOULE MAGIQUE*\n\n❓ Question: ${question}\n💬 Réponse: *${answer}*` });
            return;
        }

        if (command === 'joke') {
            const jokes = [
                'Pourquoi les plongeurs plongent-ils toujours en arrière? Parce que sinon ils tombent dans le bateau! 😂',
                'Qu\'est-ce qu\'un crocodile qui surveille une maison? Un Lacoste de sécurité! 🐊',
                'Pourquoi les poissons n\'aiment pas jouer au tennis? Parce qu\'ils ont peur du filet! 🎾',
                'Qu\'est-ce qu\'un cannibale végétarien? Un végétalien! 🌱',
                'Comment appelle-t-on un chat tombé dans un pot de peinture? Un chat-peauté! 🎨',
                'Qu\'est-ce qu\'un nuage avec une ceinture? Un cumulo-nimbus qui tient son pantalon! ☁️',
                'Pourquoi les coqs chantent-ils le matin? Parce que la nuit, ils dorment! 🐓'
            ];
            const joke = jokes[Math.floor(Math.random() * jokes.length)];
            await sock.sendMessage(sender, { text: `😂 *BLAGUE DU JOUR*\n\n${joke}` });
            return;
        }

        if (command === 'truth') {
            const truths = [
                'Quel est ton plus grand secret? 🤫',
                'Qui est ton crush secret? 💘',
                'Quelle est la chose la plus embarrassante que tu aies faite? 😳',
                'Quelle est ta plus grande peur? 😱',
                'As-tu déjà menti à ton meilleur ami? 🤥',
                'Quel est ton rêve le plus fou? 💭'
            ];
            const truth = truths[Math.floor(Math.random() * truths.length)];
            await sock.sendMessage(sender, { text: `🎭 *ACTION OU VÉRITÉ*\n\n✨ Vérité: ${truth}` });
            return;
        }

        if (command === 'dare') {
            const dares = [
                'Envoie un message vocal en chantant! 🎤',
                'Change ta photo de profil en quelque chose de drôle! 📸',
                'Envoie un message à ton crush! 💌',
                'Fais 20 pompes maintenant! 💪',
                'Raconte une blague au groupe! 😂',
                'Dis quelque chose de gentil à tout le monde! 💖'
            ];
            const dare = dares[Math.floor(Math.random() * dares.length)];
            await sock.sendMessage(sender, { text: `🎭 *ACTION OU VÉRITÉ*\n\n🔥 Défi: ${dare}` });
            return;
        }

        if (command === 'ship') {
            const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            if (!mentionedJid || mentionedJid.length < 2) {
                await sock.sendMessage(sender, { text: `❌ Usage: ${config.prefix}ship @user1 @user2` });
                return;
            }

            const percentage = Math.floor(Math.random() * 101);
            const user1 = mentionedJid[0].split('@')[0];
            const user2 = mentionedJid[1].split('@')[0];
            
            let status = '';
            if (percentage < 30) status = '💔 Pas compatible...';
            else if (percentage < 60) status = '💛 Amitié possible!';
            else if (percentage < 80) status = '💚 Bonne compatibilité!';
            else status = '❤️ Match parfait!';

            await sock.sendMessage(sender, {
                text: `💕 *TEST DE COMPATIBILITÉ*\n\n👤 @${user1}\n💘\n👤 @${user2}\n\n📊 Résultat: *${percentage}%*\n${status}`,
                mentions: mentionedJid
            });
            return;
        }

        if (command === 'rate') {
            const thing = args.join(' ') || 'ça';
            const rating = Math.floor(Math.random() * 11);
            const stars = '⭐'.repeat(rating) + '☆'.repeat(10 - rating);
            await sock.sendMessage(sender, {
                text: `⭐ *NOTATION*\n\n📝 ${thing}\n${stars}\n\n📊 Note: *${rating}/10*`
            });
            return;
        }

        if (command === 'trivia') {
            const trivias = [
                { q: 'Quelle est la capitale de la France?', a: 'Paris' },
                { q: 'Combien de continents y a-t-il?', a: '7' },
                { q: 'Quel est le plus grand océan?', a: 'Océan Pacifique' },
                { q: 'Qui a peint la Joconde?', a: 'Léonard de Vinci' },
                { q: 'Quelle est la planète la plus proche du Soleil?', a: 'Mercure' }
            ];
            const trivia = trivias[Math.floor(Math.random() * trivias.length)];
            await sock.sendMessage(sender, {
                text: `🧠 *CULTURE GÉNÉRALE*\n\n❓ ${trivia.q}\n\n💡 Réponse: ||${trivia.a}||`
            });
            return;
        }

        // ==================== UTILITAIRES ====================
        if (command === 'calc') {
            try {
                const expression = args.join(' ');
                if (!expression) {
                    await sock.sendMessage(sender, { text: `❌ Usage: ${config.prefix}calc <expression>` });
                    return;
                }
                const result = eval(expression);
                await sock.sendMessage(sender, {
                    text: `🧮 *CALCULATRICE*\n\n📝 Expression: ${expression}\n📊 Résultat: *${result}*`
                });
            } catch {
                await sock.sendMessage(sender, { text: '❌ Expression invalide!' });
            }
            return;
        }

        if (command === 'random') {
            const min = parseInt(args[0]) || 1;
            const max = parseInt(args[1]) || 100;
            const result = Math.floor(Math.random() * (max - min + 1)) + min;
            await sock.sendMessage(sender, {
                text: `🎲 *NOMBRE ALÉATOIRE*\n\n🔢 Entre ${min} et ${max}\n🎯 Résultat: *${result}*`
            });
            return;
        }

        if (command === 'reverse') {
            const text = args.join(' ');
            if (!text) {
                await sock.sendMessage(sender, { text: `❌ Usage: ${config.prefix}reverse <texte>` });
                return;
            }
            const reversed = text.split('').reverse().join('');
            await sock.sendMessage(sender, {
                text: `🔄 *TEXTE INVERSÉ*\n\n📝 Original: ${text}\n🔃 Inversé: *${reversed}*`
            });
            return;
        }

        if (command === 'length') {
            const text = args.join(' ');
            if (!text) {
                await sock.sendMessage(sender, { text: `❌ Usage: ${config.prefix}length <texte>` });
                return;
            }
            await sock.sendMessage(sender, {
                text: `📏 *LONGUEUR DU TEXTE*\n\n📝 Texte: ${text}\n🔢 Caractères: *${text.length}*\n📊 Mots: *${text.split(' ').length}*`
            });
            return;
        }

        if (command === 'uppercase') {
            const text = args.join(' ');
            if (!text) {
                await sock.sendMessage(sender, { text: `❌ Usage: ${config.prefix}uppercase <texte>` });
                return;
            }
            await sock.sendMessage(sender, {
                text: `🔠 *MAJUSCULES*\n\n📝 Original: ${text}\n📊 Résultat: *${text.toUpperCase()}*`
            });
            return;
        }

        if (command === 'lowercase') {
            const text = args.join(' ');
            if (!text) {
                await sock.sendMessage(sender, { text: `❌ Usage: ${config.prefix}lowercase <texte>` });
                return;
            }
            await sock.sendMessage(sender, {
                text: `🔡 *MINUSCULES*\n\n📝 Original: ${text}\n📊 Résultat: *${text.toLowerCase()}*`
            });
            return;
        }

        if (command === 'qrcode') {
            const text = args.join(' ');
            if (!text) {
                await sock.sendMessage(sender, { text: `❌ Usage: ${config.prefix}qrcode <texte>` });
                return;
            }

            try {
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(text)}`;
                await sock.sendMessage(sender, {
                    image: { url: qrUrl },
                    caption: `📱 *QR CODE*\n\n📝 Contenu: ${text}`
                });
            } catch (err) {
                await sock.sendMessage(sender, { text: '❌ Erreur de génération du QR code!' });
            }
            return;
        }

        // Si la commande existe mais n'est pas implémentée
        if (cmd) {
            await sock.sendMessage(sender, {
                text: `🥷 *${config.prefix}${command}* 🥷\n\n✅ Commande reconnue!\n📝 ${cmd.description}\n\n⚠️ Implémentation prévue dans la prochaine mise à jour!\n\n💡 ${commands.length} commandes disponibles actuellement!`
            });
            return;
        }

        // Commande non trouvée
        await sock.sendMessage(sender, {
            text: `❌ Commande *${config.prefix}${command}* non trouvée!\n\n💡 Tapez *${config.prefix}menu* pour voir toutes les commandes disponibles.`
        });

    } catch (error) {
        console.error('❌ Erreur handleCommand:', error);
        await sock.sendMessage(msg.key.remoteJid, {
            text: '❌ Une erreur est survenue lors de l\'exécution de la commande.'
        });
    }
}

export default handleCommand;
