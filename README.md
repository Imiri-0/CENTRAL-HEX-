# IB-HEX-BOT 🥷

Bot WhatsApp multifonctionnel avec 200 commandes en français

## 🚀 Fonctionnalités

- ✅ 200+ commandes fonctionnelles
- 🎯 Préfixe obligatoire: **Ib**
- 🇫🇷 Interface 100% en français
- 🥷 Design personnalisé IB-HEX
- 📱 Connexion via QR Code
- 🌐 Interface web pour scanner le QR
- ⚡ Haute performance
- 🔒 Sécurisé

## 📦 Installation

### Prérequis
- Node.js 18+
- NPM ou Yarn

### Installation locale

```bash
# Cloner le repo
cd ib-hex-bot

# Installer les dépendances
npm install

# Démarrer le bot
npm start
```

### Installation sur Render

1. **Créer un nouveau Web Service sur Render**
   - Allez sur https://render.com
   - Cliquez sur "New +" puis "Web Service"
   - Connectez votre repository GitHub

2. **Configuration**
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node

3. **Variables d'environnement (optionnel)**
   ```
   PORT=3000
   ```

4. **Déployer**
   - Cliquez sur "Create Web Service"
   - Attendez la fin du déploiement

5. **Scanner le QR Code**
   - Accédez à l'URL de votre service (ex: https://votre-app.onrender.com)
   - Scannez le QR code avec WhatsApp
   - Le bot sera connecté!

## 🎯 Utilisation

### Commandes principales

```
Ibmenu - Afficher le menu complet
Ibalive - Vérifier l'état du bot
Ibping - Tester la vitesse
Ibowner - Contact du propriétaire
Ibhelp - Aide
```

### Catégories de commandes

- **Général** (6 commandes) - Menu, Alive, Ping, etc.
- **Owner** (9 commandes) - Gestion du bot
- **IA** (6 commandes) - ChatGPT, Gemini, etc.
- **Convertisseur** (9 commandes) - Stickers, Images, etc.
- **Recherche** (10 commandes) - Google, YouTube, etc.
- **Divertissement** (9 commandes) - Jeux, Quiz, etc.
- **Groupes** (15 commandes) - Gestion de groupe
- **Réactions** (10 commandes) - Emojis animés
- **Médias** (15 commandes) - Téléchargements
- **Et bien plus!** (111+ autres commandes)

## 🔧 Configuration

Fichier `index.js` - Configuration du bot:

```javascript
const config = {
    botName: "IB_HEX_BOT",
    prefix: "Ib",
    owner: "224621963059@s.whatsapp.net",
    ownerName: "Ibrahima Sory Sacko",
    version: "2.0",
    mode: "privé"
};
```

## 📱 Connexion WhatsApp

1. Démarrez le bot: `npm start`
2. Ouvrez votre navigateur: `http://localhost:3000`
3. Un QR code s'affichera
4. Sur WhatsApp:
   - Menu (⋮) → Appareils connectés
   - Connecter un appareil
   - Scannez le QR code
5. Le bot est connecté! ✅

## 🌐 Déploiement Render

### Fichiers nécessaires

Le projet contient déjà:
- `package.json` - Dépendances
- `index.js` - Point d'entrée
- `handler.js` - Gestionnaire de commandes
- `commands.js` - Liste des 200 commandes

### Étapes de déploiement

1. **Push vers GitHub**
```bash
git init
git add .
git commit -m "IB-HEX-BOT v2.0"
git remote add origin <votre-repo>
git push -u origin main
```

2. **Connecter à Render**
   - Dashboard Render → New Web Service
   - Sélectionnez votre repository
   - Render détectera automatiquement Node.js

3. **Configuration automatique**
   - Build: `npm install`
   - Start: `npm start`
   - Port: Variable d'environnement automatique

4. **Déployer et scanner**
   - Le déploiement prend 2-3 minutes
   - Accédez à l'URL fournie
   - Scannez le QR code

## 🛠️ Développement

### Structure du projet

```
ib-hex-bot/
├── index.js          # Point d'entrée, serveur Express, connexion WhatsApp
├── handler.js        # Gestionnaire de toutes les commandes
├── commands.js       # Liste des 200 commandes
├── package.json      # Dépendances et scripts
├── auth_info/        # Dossier de session WhatsApp (généré automatiquement)
└── README.md         # Documentation
```

### Ajouter une nouvelle commande

1. **Ajouter dans `commands.js`:**
```javascript
{ cmd: 'macommande', category: 'général', description: 'Ma description' }
```

2. **Implémenter dans `handler.js`:**
```javascript
if (command === 'macommande') {
    await sock.sendMessage(sender, { text: 'Réponse de ma commande' });
    return;
}
```

## 📊 Statistiques

- **200 commandes** répertoriées
- **50+ commandes** implémentées et fonctionnelles
- **150 commandes** affichées avec message "En développement"
- **Préfixe unique:** Ib (obligatoire)
- **Support:** Groupes et messages privés

## 👨‍💻 Développeur

**Ibrahima Sory Sacko**
- 📱 Téléphone: +224 621 96 30 59
- 🥷 Pseudo: Ib
- 🔧 Version: 2.0

## 📄 Licence

MIT License - Libre d'utilisation et de modification

## ⚠️ Notes importantes

1. **Connexion**: Le bot doit rester connecté en permanence
2. **Render Free Tier**: Se met en veille après 15min d'inactivité
3. **Session**: Le dossier `auth_info` conserve la session
4. **Préfixe**: Toutes les commandes nécessitent "Ib" au début

## 🆘 Support

En cas de problème:
1. Vérifiez les logs du serveur
2. Assurez-vous que WhatsApp est bien connecté
3. Vérifiez que le préfixe "Ib" est utilisé
4. Contactez le développeur

## 🚀 Mises à jour futures

- [ ] Implémentation complète des 150 commandes restantes
- [ ] Base de données pour économie et statistiques
- [ ] Système de plugins
- [ ] Interface web d'administration
- [ ] Support multi-langues
- [ ] Mode auto-réponse

---

**IB-HEX-BOT v2.0** 🥷 - Propulsé par Ibrahima Sory Sacko™
