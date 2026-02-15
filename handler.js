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
        
        // Menu principal avec image
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
│ ⬡ ${config.prefix}antidelete → anti-suppression
│ ⬡ ${config.prefix}upload → téléverser
│ ⬡ ${config.prefix}vv → vue unique
│ ⬡ ${config.prefix}allcmds → toutes les commandes
│ ⬡ ${config.prefix}delete → supprimer
│ ⬡ ${config.prefix}🥷 → vue unique privé
│ ⬡ ${config.prefix}repo → dépôt GitHub
╰──────────────────🥷

🥷──────────────────🥷
『 𝗜𝗔-𝗛𝗘𝗫-𝗕𝗢𝗧 』
│ ⬡ ${config.prefix}ai → intelligence artificielle
│ ⬡ ${config.prefix}bug → signaler un bug
│ ⬡ ${config.prefix}bot → informations bot
│ ⬡ ${config.prefix}gemini → IA Gemini
│ ⬡ ${config.prefix}chatbot → discussion IA
│ ⬡ ${config.prefix}gpt → ChatGPT
╰──────────────────🥷

🥷──────────────────🥷
『 𝗖𝗢𝗡𝗩𝗘𝗥𝗧𝗜𝗦𝗦𝗘𝗨𝗥-𝗛𝗘𝗫-𝗕𝗢𝗧 』
│ ⬡ ${config.prefix}attp → texte en sticker
│ ⬡ ${config.prefix}toimage → convertir en image
│ ⬡ ${config.prefix}gimage → image Google
│ ⬡ ${config.prefix}mp3 → convertir en MP3
│ ⬡ ${config.prefix}ss → capture d'écran
│ ⬡ ${config.prefix}fancy → texte stylé
│ ⬡ ${config.prefix}url → lien
│ ⬡ ${config.prefix}sticker → créer sticker
│ ⬡ ${config.prefix}take → récupérer média
╰──────────────────🥷

🥷──────────────────🥷
『 𝗥𝗘𝗖𝗛𝗘𝗥𝗖𝗛𝗘-𝗛𝗘𝗫-𝗕𝗢𝗧』
│ ⬡ ${config.prefix}google → recherche Google
│ ⬡ ${config.prefix}play → Play Store
│ ⬡ ${config.prefix}video → recherche vidéo
│ ⬡ ${config.prefix}song → musique
│ ⬡ ${config.prefix}mediafire → MediaFire
│ ⬡ ${config.prefix}facebook → Facebook
│ ⬡ ${config.prefix}instagram → Instagram
│ ⬡ ${config.prefix}tiktok → TikTok
│ ⬡ ${config.prefix}lyrics → paroles
│ ⬡ ${config.prefix}image → images
╰──────────────────🥷

🥷──────────────────🥷
『 𝗗𝗜𝗩𝗘𝗥𝗧𝗜𝗦𝗦𝗘𝗠𝗘𝗡𝗧-𝗛𝗘𝗫-𝗕𝗢𝗧 』
│ ⬡ ${config.prefix}getpp → photo de profil
│ ⬡ ${config.prefix}goodnight → bonne nuit
│ ⬡ ${config.prefix}wcg → classement
│ ⬡ ${config.prefix}quizz → quiz
│ ⬡ ${config.prefix}anime → anime
│ ⬡ ${config.prefix}profile → profil
│ ⬡ ${config.prefix}couple → couple
│ ⬡ ${config.prefix}poll → sondage
│ ⬡ ${config.prefix}emojimix → mélange d'emojis
╰──────────────────🥷

🥷─────────────────🥷
『 𝗚𝗥𝗢𝗨𝗣𝗘𝗦-𝗛𝗘𝗫-𝗕𝗢𝗧 』
│ ⬡ ${config.prefix}kickall → exclure tous
│ ⬡ ${config.prefix}tagadmin → mention admins
│ ⬡ ${config.prefix}acceptall → accepter tous
│ ⬡ ${config.prefix}tagall → mentionner tous
│ ⬡ ${config.prefix}getall → récupérer membres
│ ⬡ ${config.prefix}groupclose → fermer groupe
│ ⬡ ${config.prefix}groupopen → ouvrir groupe
│ ⬡ ${config.prefix}add → ajouter membre
│ ⬡ ${config.prefix}vcf → contacts VCF
│ ⬡ ${config.prefix}linkgc → lien du groupe
│ ⬡ ${config.prefix}antilink → anti-lien
│ ⬡ ${config.prefix}antisticker → anti-sticker
│ ⬡ ${config.prefix}antigm → anti-mention
│ ⬡ ${config.prefix}create → créer groupe
│ ⬡ ${config.prefix}groupinfo → infos groupe
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
│ ⬡ ${config.prefix}smug → sourire narquois
│ ⬡ ${config.prefix}cringe → malaise
│ ⬡ ${config.prefix}happy → heureux
╰──────────────────🥷

🥷──────────────────🥷
『 𝗠𝗘́𝗗𝗜𝗔𝗦-𝗛𝗘𝗫-𝗕𝗢𝗧 』
│ ⬡ ${config.prefix}ytmp3 → YouTube MP3
│ ⬡ ${config.prefix}ytmp4 → YouTube MP4
│ ⬡ ${config.prefix}twitter → Twitter
│ ⬡ ${config.prefix}pinterest → Pinterest
│ ⬡ ${config.prefix}soundcloud → SoundCloud
│ ⬡ ${config.prefix}spotify → Spotify
│ ⬡ ${config.prefix}wallpaper → Fond d'écran
│ ⬡ ${config.prefix}movie → Info film
│ ⬡ ${config.prefix}weather → Météo
│ ⬡ ${config.prefix}news → Actualités
╰──────────────────🥷

🥷──────────────────🥷
『 𝗝𝗘𝗨𝗫-𝗛𝗘𝗫-𝗕𝗢𝗧 』
│ ⬡ ${config.prefix}truth → vérité
│ ⬡ ${config.prefix}dare → défi
│ ⬡ ${config.prefix}ship → compatibilité
│ ⬡ ${config.prefix}dice → lancer dé
│ ⬡ ${config.prefix}coin → pile ou face
│ ⬡ ${config.prefix}8ball → boule magique
│ ⬡ ${config.prefix}slot → machine à sous
│ ⬡ ${config.prefix}trivia → culture générale
│ ⬡ ${config.prefix}joke → blague
│ ⬡ ${config.prefix}meme → meme aléatoire
╰──────────────────🥷

🥷───────────────────🥷
            ⚡ 𝗜𝗕-𝗛𝗘𝗫-𝗕𝗢𝗧 ⚡
   propulsé par ${config.ownerName}™
🥷───────────────────🥷

📊 *Total des commandes: ${commands.length}*
💡 *Tapez ${config.prefix}allcmds pour voir toutes les commandes*`;

            try {
                // Envoyer l'image avec le menu
                await sock.sendMessage(sender, {
                    image: { url: 'https://i.ibb.co/fYbBRWyy/IMG-20260210-WA0152.jpg' },
                    caption: menuText
                });
            } catch (err) {
                // Si l'image échoue, envoyer juste le texte
                await sock.sendMessage(sender, { text: menuText });
            }
            return;
        }

        // Commande alive
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

        // Commande ping
        if (command === 'ping') {
            const start = Date.now();
            await sock.sendMessage(sender, { text: '🏓 Ping...' });
            const ping = Date.now() - start;
            await sock.sendMessage(sender, {
                text: `🥷 *PONG!* 🥷\n\n⚡ *Vitesse:* ${ping}ms\n💨 *Latence:* Excellente`
            });
            return;
        }

        // Commande owner/dev
        if (command === 'owner' || command === 'dev') {
            await sock.sendMessage(sender, {
                text: `🥷 *PROPRIÉTAIRE DU BOT* 🥷

👤 *Nom:* ${config.ownerName}
📱 *Numéro:* +224 621 96 30 59
💼 *Statut:* Développeur Principal
🔧 *Spécialité:* Bot WhatsApp

━━━━━━━━━━━━━━━━━━━
*IB-HEX-BOT v${config.version}*`
            });
            return;
        }

        // Commande allcmds - Afficher toutes les commandes
        if (command === 'allcmds') {
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

        // Commande repo
        if (command === 'repo') {
            await sock.sendMessage(sender, {
                text: `🥷 *IB-HEX-BOT REPOSITORY* 🥷

📦 *Nom:* IB-HEX-BOT
⭐ *Version:* ${config.version}
👨‍💻 *Développeur:* ${config.ownerName}
📝 *License:* MIT
🔗 *GitHub:* [Bientôt disponible]

━━━━━━━━━━━━━━━━━━━
*Bot WhatsApp avec ${commands.length} commandes!*`
            });
            return;
        }

        // Commande bot
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

        // Commandes de groupe
        if (isGroup) {
            const groupMetadata = await sock.groupMetadata(sender);
            const isAdminUser = await isAdmin(sock, sender, msg.key.participant);
            const isBotAdmin = await isAdmin(sock, sender, sock.user.id);

            // Tagall
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

            // Tagadmin
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

            // Linkgc
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

            // Groupinfo
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

            // Groupopen
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

            // Groupclose
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
        }

        // Réactions
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

        // Jeux
        if (command === 'dice') {
            const result = Math.floor(Math.random() * 6) + 1;
            await sock.sendMessage(sender, { text: `🎲 *LANCER DE DÉ*\n\nRésultat: *${result}* 🎯` });
            return;
        }

        if (command === 'coin') {
            const result = Math.random() < 0.5 ? 'Pile' : 'Face';
            await sock.sendMessage(sender, { text: `🪙 *PILE OU FACE*\n\nRésultat: *${result}* 💫` });
            return;
        }

        if (command === '8ball') {
            const responses = [
                'Oui, absolument!',
                'Non, certainement pas.',
                'Peut-être...',
                'C\'est certain!',
                'Je n\'en suis pas sûr...',
                'Essaye encore!',
                'Les étoiles disent oui! ⭐',
                'Les signes disent non... ⛔',
                'Sans aucun doute!',
                'Mieux vaut ne pas te le dire maintenant...'
            ];
            const answer = responses[Math.floor(Math.random() * responses.length)];
            await sock.sendMessage(sender, { text: `🔮 *BOULE MAGIQUE*\n\nQuestion: ${args.join(' ')}\nRéponse: *${answer}*` });
            return;
        }

        if (command === 'joke') {
            const jokes = [
                'Pourquoi les plongeurs plongent-ils toujours en arrière? Parce que sinon ils tombent dans le bateau! 😂',
                'Qu\'est-ce qu\'un crocodile qui surveille une maison? Un Lacoste de sécurité! 🐊',
                'Pourquoi les poissons n\'aiment pas jouer au tennis? Parce qu\'ils ont peur du filet! 🎾',
                'Qu\'est-ce qu\'un cannibale végétarien? Un végétalien! 🌱',
                'Comment appelle-t-on un chat tombé dans un pot de peinture? Un chat-peauté! 🎨'
            ];
            const joke = jokes[Math.floor(Math.random() * jokes.length)];
            await sock.sendMessage(sender, { text: `😂 *BLAGUE DU JOUR*\n\n${joke}` });
            return;
        }

        // Utilitaires
        if (command === 'calc') {
            try {
                const expression = args.join(' ');
                const result = eval(expression);
                await sock.sendMessage(sender, {
                    text: `🧮 *CALCULATRICE*\n\nExpression: ${expression}\nRésultat: *${result}*`
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
                text: `🎲 *NOMBRE ALÉATOIRE*\n\nEntre ${min} et ${max}: *${result}*`
            });
            return;
        }

        if (command === 'reverse') {
            const text = args.join(' ');
            const reversed = text.split('').reverse().join('');
            await sock.sendMessage(sender, {
                text: `🔄 *TEXTE INVERSÉ*\n\nOriginal: ${text}\nInversé: *${reversed}*`
            });
            return;
        }

        // Si la commande existe mais n'est pas encore implémentée
        if (cmd) {
            await sock.sendMessage(sender, {
                text: `🥷 *${config.prefix}${command}* 🥷\n\n✅ Commande disponible!\n📝 Description: ${cmd.description}\n⚠️ Implémentation en cours...\n\n💡 Cette commande sera bientôt fonctionnelle!`
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
