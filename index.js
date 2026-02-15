import makeWASocket, { 
    DisconnectReason, 
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    jidNormalizedUser,
    downloadMediaMessage
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import qrcodeTerminal from 'qrcode-terminal';
import qrcode from 'qrcode';
import fs from 'fs';
import express from 'express';
import { commands } from './commands.js';
import { handleCommand } from './handler.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration
const config = {
    botName: "IB_HEX_BOT",
    prefix: "Ib",
    owner: "224621963059@s.whatsapp.net",
    ownerName: "Ibrahima Sory Sacko",
    version: "2.0",
    mode: "privé"
};

let qrCodeData = null;
let sock = null;

// Store pour gérer les messages (optionnel)
let store = null;

// Route pour afficher le QR Code
app.get('/', (req, res) => {
    if (qrCodeData) {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>IB-HEX-BOT - Scanner QR Code</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        margin: 0;
                        color: white;
                    }
                    .container {
                        background: rgba(255, 255, 255, 0.1);
                        backdrop-filter: blur(10px);
                        padding: 40px;
                        border-radius: 20px;
                        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
                        text-align: center;
                        max-width: 500px;
                    }
                    h1 {
                        margin-bottom: 10px;
                        font-size: 2.5em;
                        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                    }
                    .ninja {
                        font-size: 3em;
                        margin: 10px 0;
                    }
                    .qr-container {
                        background: white;
                        padding: 20px;
                        border-radius: 15px;
                        display: inline-block;
                        margin: 20px 0;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    }
                    img {
                        width: 300px;
                        height: 300px;
                    }
                    .info {
                        background: rgba(255, 255, 255, 0.2);
                        padding: 15px;
                        border-radius: 10px;
                        margin-top: 20px;
                    }
                    .status {
                        color: #4ade80;
                        font-weight: bold;
                        font-size: 1.2em;
                        margin-top: 15px;
                    }
                    .instructions {
                        margin-top: 20px;
                        text-align: left;
                        line-height: 1.8;
                    }
                    .instructions li {
                        margin: 10px 0;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="ninja">🥷</div>
                    <h1>IB-HEX-BOT</h1>
                    <p style="font-size: 1.2em; margin: 10px 0;">v2.0 par Ibrahima Sory Sacko</p>
                    
                    <div class="qr-container">
                        <img src="${qrCodeData}" alt="QR Code WhatsApp" />
                    </div>
                    
                    <div class="status">✅ Bot en ligne - Prêt à scanner</div>
                    
                    <div class="info">
                        <strong>📱 Instructions de connexion:</strong>
                        <ol class="instructions">
                            <li>Ouvrez WhatsApp sur votre téléphone</li>
                            <li>Appuyez sur Menu (⋮) puis "Appareils connectés"</li>
                            <li>Appuyez sur "Connecter un appareil"</li>
                            <li>Scannez ce QR code avec votre téléphone</li>
                        </ol>
                    </div>
                    
                    <div class="info" style="margin-top: 15px;">
                        <strong>Préfixe:</strong> Ib<br>
                        <strong>Commandes:</strong> 200+ disponibles<br>
                        <strong>Exemple:</strong> Ibmenu
                    </div>
                </div>
                <script>
                    // Recharger la page toutes les 30 secondes pour vérifier la connexion
                    setTimeout(() => location.reload(), 30000);
                </script>
            </body>
            </html>
        `);
    } else {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>IB-HEX-BOT - Démarrage...</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        margin: 0;
                        color: white;
                        text-align: center;
                    }
                    .loader {
                        border: 5px solid #f3f3f3;
                        border-top: 5px solid #667eea;
                        border-radius: 50%;
                        width: 50px;
                        height: 50px;
                        animation: spin 1s linear infinite;
                        margin: 20px auto;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            </head>
            <body>
                <div>
                    <h1>🥷 IB-HEX-BOT 🥷</h1>
                    <div class="loader"></div>
                    <p>Démarrage du bot en cours...</p>
                    <p>Le QR code apparaîtra dans quelques secondes</p>
                </div>
                <script>
                    setTimeout(() => location.reload(), 3000);
                </script>
            </body>
            </html>
        `);
    }
});

app.get('/status', (req, res) => {
    res.json({
        status: sock ? 'connected' : 'disconnected',
        qrAvailable: !!qrCodeData,
        botName: config.botName,
        version: config.version
    });
});

// Fonction principale
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: state,
        browser: ['IB-HEX-BOT', 'Chrome', '2.0'],
        getMessage: async (key) => {
            return undefined;
        }
    });

    // Bind store si disponible
    if (store) {
        store.bind(sock.ev);
    }

    // Gestion du QR Code
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('\n🥷 IB-HEX-BOT v2.0 🥷');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📱 QR Code généré !');
            console.log(`🌐 Accédez à: http://localhost:${PORT}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            
            // Afficher dans le terminal
            qrcodeTerminal.generate(qr, { small: true });
            
            // Générer l'image QR pour le web
            try {
                qrCodeData = await qrcode.toDataURL(qr);
            } catch (err) {
                console.error('Erreur génération QR:', err);
            }
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error instanceof Boom)
                ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
                : true;

            console.log('❌ Connexion fermée. Reconnexion:', shouldReconnect);
            qrCodeData = null;

            if (shouldReconnect) {
                setTimeout(startBot, 3000);
            }
        } else if (connection === 'open') {
            console.log('\n✅ IB-HEX-BOT connecté avec succès! 🥷');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`📱 Bot: ${config.botName}`);
            console.log(`👤 Propriétaire: ${config.ownerName}`);
            console.log(`🎯 Préfixe: ${config.prefix}`);
            console.log(`📊 Commandes: ${commands.length}`);
            console.log(`🌐 Mode: ${config.mode}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            qrCodeData = null;
        }
    });

    // Gestion des identifiants
    sock.ev.on('creds.update', saveCreds);

    // Gestion des messages
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        for (const msg of messages) {
            if (!msg.message) continue;
            if (msg.key.fromMe) continue;

            await handleCommand(sock, msg, config);
        }
    });

    return sock;
}

// Démarrer le serveur Express
app.listen(PORT, () => {
    console.log('\n🥷═══════════════════════════════🥷');
    console.log('     IB-HEX-BOT v2.0 - DÉMARRAGE');
    console.log('🥷═══════════════════════════════🥷');
    console.log(`\n🌐 Serveur web: http://localhost:${PORT}`);
    console.log('📱 En attente du QR Code...\n');
});

// Démarrer le bot
startBot().catch(err => {
    console.error('❌ Erreur démarrage bot:', err);
    process.exit(1);
});

// Gestion des erreurs
process.on('unhandledRejection', (err) => {
    console.error('❌ Erreur non gérée:', err);
});

process.on('uncaughtException', (err) => {
    console.error('❌ Exception non capturée:', err);
});
