# Mi42 GitHub + Hetzner Deployment Setup

Vollständige Anleitung für die Einrichtung von GitHub als Code-Repository und automatischem Deployment auf den Hetzner Production-Server.

---

## 📋 Übersicht

**Aktueller Stand:**
- Code liegt lokal in Manus Sandbox
- Deployment erfolgt manuell via SCP auf Hetzner-Server
- Keine Versionskontrolle, keine CI/CD

**Ziel:**
- Code in GitHub Repository (https://github.com/mlbonn/Mi42.git)
- Automatisches Deployment bei Git Push
- Versionskontrolle und Rollback-Möglichkeit

---

## 🔑 Zugangsdaten

### GitHub Repository
- **URL:** https://github.com/mlbonn/Mi42.git
- **Owner:** mlbonn
- **User:** manus@bl.cx
- **Passwort:** exjh7b#1
- **Hinweis:** GitHub erlaubt keine Passwort-Authentifizierung mehr → Personal Access Token (PAT) erforderlich

### Hetzner Production Server
- **IP:** 46.224.9.190
- **SSH User:** root
- **SSH Passwort:** bkHJELW4JEqbumEVq
- **App-Verzeichnis:** /root/mi42
- **Domain:** http://mi42.bl2020.com
- **Port:** 3001

### Docker Setup
- **App Container:** mi42-app
- **DB Container:** mi42-db
- **Network:** construction-agents_mi42_network
- **Database:**
  - Host: mi42-db (intern) / localhost:3307 (extern)
  - User: mi42_user
  - Passwort: mi42_password_2025
  - Database: mi42_db

---

## 📦 Schritt 1: GitHub Personal Access Token erstellen

Da GitHub keine Passwort-Authentifizierung mehr unterstützt, benötigen Sie einen Personal Access Token (PAT).

### 1.1 Token erstellen

1. Gehen Sie zu https://github.com/settings/tokens
2. Klicken Sie auf "Generate new token" → "Generate new token (classic)"
3. **Token Name:** Mi42 Deployment
4. **Expiration:** 90 days (oder No expiration für Production)
5. **Scopes auswählen:**
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
   - ✅ `write:packages` (Upload packages to GitHub Package Registry)

6. Klicken Sie auf "Generate token"
7. **WICHTIG:** Kopieren Sie den Token sofort (wird nur einmal angezeigt!)

**Beispiel-Token:** `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 1.2 Token testen

```bash
git clone https://ghp_YOUR_TOKEN@github.com/mlbonn/Mi42.git
```

---

## 🚀 Schritt 2: GitHub Repository einrichten

### 2.1 Lokalen Code zu GitHub pushen

```bash
cd /pfad/zum/mi42-code

# Git initialisieren (falls noch nicht geschehen)
git init

# GitHub Remote hinzufügen (mit PAT)
git remote add origin https://ghp_YOUR_TOKEN@github.com/mlbonn/Mi42.git

# Alle Dateien hinzufügen
git add .

# Initial Commit
git commit -m "Initial commit: Mi42 Market Intelligence Platform"

# Zu GitHub pushen
git push -u origin main --force
```

### 2.2 .gitignore erstellen

Erstellen Sie eine `.gitignore` Datei im Projekt-Root:

```
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
build/
.next/
out/

# Environment variables
.env
.env.local
.env.production.local

# Logs
*.log
npm-debug.log*
pnpm-debug.log*
server.log
app.log

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Temporary files
*.tmp
.cache/

# Backups
*.backup
/root/mi42_backups/
```

---

## 🔐 Schritt 3: SSH-Key für Deployment erstellen

### 3.1 SSH-Key auf lokalem Rechner generieren

```bash
ssh-keygen -t ed25519 -C "mi42-deployment" -f ~/.ssh/mi42_deploy_key
```

**Wichtig:** Kein Passwort eingeben (Enter drücken), damit automatisches Deployment funktioniert.

### 3.2 Public Key auf Hetzner-Server installieren

```bash
# Public Key anzeigen
cat ~/.ssh/mi42_deploy_key.pub

# Auf Hetzner-Server kopieren
ssh root@46.224.9.190
mkdir -p ~/.ssh
echo "INHALT_VON_mi42_deploy_key.pub" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
exit
```

### 3.3 SSH-Verbindung testen

```bash
ssh -i ~/.ssh/mi42_deploy_key root@46.224.9.190
```

Sollte ohne Passwort funktionieren!

---

## ⚙️ Schritt 4: GitHub Actions CI/CD einrichten

### 4.1 GitHub Secrets konfigurieren

Gehen Sie zu https://github.com/mlbonn/Mi42/settings/secrets/actions

Fügen Sie folgende Secrets hinzu:

| Secret Name | Wert | Beschreibung |
|-------------|------|--------------|
| `SSH_PRIVATE_KEY` | Inhalt von `~/.ssh/mi42_deploy_key` | SSH Private Key für Server-Zugriff |
| `SSH_HOST` | `46.224.9.190` | Hetzner Server IP |
| `SSH_USER` | `root` | SSH Username |
| `DEPLOY_PATH` | `/root/mi42` | Deployment-Verzeichnis |

**SSH Private Key kopieren:**
```bash
cat ~/.ssh/mi42_deploy_key
```

Kopieren Sie den **gesamten** Inhalt (inklusive `-----BEGIN OPENSSH PRIVATE KEY-----` und `-----END OPENSSH PRIVATE KEY-----`).

### 4.2 GitHub Actions Workflow erstellen

Erstellen Sie die Datei `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Hetzner

on:
  push:
    branches:
      - main
  workflow_dispatch:  # Ermöglicht manuelles Triggern

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup SSH
        uses: webfactory/ssh-agent@v0.9.0
        with:
          ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}
      
      - name: Add server to known hosts
        run: |
          mkdir -p ~/.ssh
          ssh-keyscan -H ${{ secrets.SSH_HOST }} >> ~/.ssh/known_hosts
      
      - name: Deploy to server
        env:
          SSH_HOST: ${{ secrets.SSH_HOST }}
          SSH_USER: ${{ secrets.SSH_USER }}
          DEPLOY_PATH: ${{ secrets.DEPLOY_PATH }}
        run: |
          # Stop application
          ssh $SSH_USER@$SSH_HOST "docker stop mi42-app 2>/dev/null || true"
          
          # Backup current version
          ssh $SSH_USER@$SSH_HOST "mkdir -p $DEPLOY_PATH/backups && \
            tar -czf $DEPLOY_PATH/backups/backup_\$(date +%Y%m%d_%H%M%S).tar.gz \
            -C $DEPLOY_PATH server client drizzle package.json 2>/dev/null || true"
          
          # Copy new files
          rsync -avz --delete \
            --exclude 'node_modules' \
            --exclude 'dist' \
            --exclude '.git' \
            --exclude 'backups' \
            server/ $SSH_USER@$SSH_HOST:$DEPLOY_PATH/server/
          
          rsync -avz --delete \
            --exclude 'node_modules' \
            --exclude '.git' \
            client/ $SSH_USER@$SSH_HOST:$DEPLOY_PATH/client/
          
          rsync -avz --delete \
            drizzle/ $SSH_USER@$SSH_HOST:$DEPLOY_PATH/drizzle/
          
          scp package.json $SSH_USER@$SSH_HOST:$DEPLOY_PATH/
          
          # Build server code
          ssh $SSH_USER@$SSH_HOST "cd $DEPLOY_PATH && \
            npx esbuild server/_core/index.ts \
            --platform=node --packages=external \
            --bundle --format=esm --outdir=dist"
          
          # Restart application
          ssh $SSH_USER@$SSH_HOST "docker start mi42-app || \
            docker run -d \
            --name mi42-app \
            --network construction-agents_mi42_network \
            -p 3001:3001 \
            -v $DEPLOY_PATH/dist:/app/dist:ro \
            -v $DEPLOY_PATH/node_modules:/app/node_modules:ro \
            -v $DEPLOY_PATH/package.json:/app/package.json:ro \
            -e NODE_ENV=production \
            -e PORT=3001 \
            -e DATABASE_URL='mysql://mi42_user:mi42_password_2025@mi42-db:3306/mi42_db' \
            -e JWT_SECRET='change_this_secret_key_in_production' \
            -e OAUTH_SERVER_URL='https://api.manus.im' \
            -e VITE_OAUTH_PORTAL_URL='https://auth.manus.im' \
            -e VITE_APP_ID='mi42' \
            -e VITE_APP_TITLE='Mi42' \
            -e VITE_APP_LOGO='/mi42-logo.png' \
            -e OWNER_NAME='Admin' \
            -e BUILT_IN_FORGE_API_URL='https://forge.manus.im' \
            -e VITE_FRONTEND_FORGE_API_URL='https://forge.manus.im' \
            -e OPEN_WEBUI_API_URL='https://maxproxy.bl2020.com/api/chat/completions' \
            -e OPEN_WEBUI_API_KEY='sk-bd621b0666474be1b054b3c5360b3cef' \
            -e OPEN_WEBUI_MODEL='gpt-oss:120b' \
            --restart unless-stopped \
            node:22-alpine \
            node /app/dist/index.js"
          
          # Health check
          sleep 5
          ssh $SSH_USER@$SSH_HOST "docker logs mi42-app --tail 10"
      
      - name: Verify deployment
        run: |
          curl -f http://46.224.9.190:3001/api/trpc/auth.me || exit 1
          echo "✅ Deployment successful!"
```

### 4.3 Workflow committen und pushen

```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions deployment workflow"
git push origin main
```

---

## 🧪 Schritt 5: Deployment testen

### 5.1 Automatisches Deployment testen

1. Machen Sie eine kleine Änderung im Code
2. Committen und pushen Sie:
   ```bash
   git add .
   git commit -m "Test deployment"
   git push origin main
   ```
3. Gehen Sie zu https://github.com/mlbonn/Mi42/actions
4. Beobachten Sie den Workflow-Lauf
5. Nach Abschluss: Prüfen Sie http://mi42.bl2020.com

### 5.2 Manuelles Deployment triggern

1. Gehen Sie zu https://github.com/mlbonn/Mi42/actions
2. Wählen Sie "Deploy to Hetzner" Workflow
3. Klicken Sie "Run workflow" → "Run workflow"

---

## 🔄 Schritt 6: Rollback-Prozedur

Falls ein Deployment fehlschlägt:

### 6.1 Automatischer Rollback (via Backup)

```bash
ssh root@46.224.9.190

# Backups anzeigen
ls -lh /root/mi42/backups/

# Letztes Backup wiederherstellen
cd /root/mi42
tar -xzf backups/backup_YYYYMMDD_HHMMSS.tar.gz

# Server neu starten
docker restart mi42-app
```

### 6.2 Rollback via Git

```bash
# Letzten funktionierenden Commit finden
git log --oneline

# Zu altem Commit zurückkehren
git revert <commit-hash>
git push origin main

# Oder: Force-Push eines alten Commits
git reset --hard <commit-hash>
git push origin main --force
```

---

## 📊 Schritt 7: Monitoring & Logs

### 7.1 GitHub Actions Logs

- https://github.com/mlbonn/Mi42/actions
- Zeigt alle Deployments mit Status (✅ / ❌)
- Klicken Sie auf einen Workflow-Lauf für Details

### 7.2 Server Logs

```bash
# Application Logs
ssh root@46.224.9.190
docker logs -f mi42-app

# Deployment Logs
tail -f /root/mi42/deploy.log

# Database Logs
docker logs -f mi42-db
```

### 7.3 Health Checks

```bash
# API Check
curl http://46.224.9.190:3001/api/trpc/auth.me

# Database Check
ssh root@46.224.9.190
docker exec mi42-db mysql -umi42_user -pmi42_password_2025 mi42_db -e "SHOW TABLES;"
```

---

## 🛠️ Schritt 8: Troubleshooting

### Problem: SSH-Verbindung schlägt fehl

**Lösung:**
```bash
# SSH-Key-Permissions prüfen
chmod 600 ~/.ssh/mi42_deploy_key

# SSH-Verbindung debuggen
ssh -vvv -i ~/.ssh/mi42_deploy_key root@46.224.9.190
```

### Problem: Docker-Container startet nicht

**Lösung:**
```bash
ssh root@46.224.9.190

# Container-Status prüfen
docker ps -a | grep mi42

# Logs anzeigen
docker logs mi42-app

# Container manuell starten
docker start mi42-app

# Oder: Container neu erstellen
cd /root/mi42
./deploy-final.sh
```

### Problem: Build schlägt fehl

**Lösung:**
```bash
# Auf Server einloggen
ssh root@46.224.9.190
cd /root/mi42

# Manuell bauen
npx esbuild server/_core/index.ts \
  --platform=node --packages=external \
  --bundle --format=esm --outdir=dist

# Prüfen ob dist/index.js existiert
ls -lh dist/
```

### Problem: Database Connection Error

**Lösung:**
```bash
# Prüfen ob Datenbank läuft
docker ps | grep mi42-db

# Prüfen ob Container im richtigen Network ist
docker inspect mi42-app | grep -A 10 "Networks"

# Container mit korrektem Network neu starten
docker stop mi42-app
docker rm mi42-app
# Dann deploy-final.sh ausführen
```

---

## 📝 Schritt 9: Best Practices

### 9.1 Branching-Strategie

```
main (production)
  ├── develop (staging)
  │   ├── feature/new-agent
  │   ├── feature/admin-settings
  │   └── bugfix/login-error
```

**Workflow:**
1. Feature-Branch erstellen: `git checkout -b feature/name`
2. Entwickeln und committen
3. Pull Request zu `develop` erstellen
4. Nach Review: Merge zu `develop`
5. Testen auf Staging
6. Merge `develop` → `main` für Production

### 9.2 Commit-Messages

Verwenden Sie aussagekräftige Commit-Messages:

```bash
# ✅ Gut
git commit -m "feat: Add competitor intelligence agent"
git commit -m "fix: Resolve database connection error in Docker network"
git commit -m "docs: Update deployment instructions"

# ❌ Schlecht
git commit -m "update"
git commit -m "fix bug"
git commit -m "changes"
```

### 9.3 Environment Variables

**Niemals** Secrets im Code committen!

Verwenden Sie GitHub Secrets für:
- API Keys
- Datenbank-Passwörter
- JWT Secrets
- OAuth Credentials

---

## 🎯 Zusammenfassung: Deployment-Workflow

### Entwickler-Workflow

```bash
# 1. Code ändern
vim server/routers.ts

# 2. Lokal testen
pnpm dev

# 3. Committen
git add .
git commit -m "feat: Add new feature"

# 4. Pushen (löst automatisches Deployment aus)
git push origin main

# 5. Deployment überwachen
# → https://github.com/mlbonn/Mi42/actions

# 6. Testen
# → http://mi42.bl2020.com
```

### Deployment-Ablauf (automatisch)

1. ✅ Code wird zu GitHub gepusht
2. ✅ GitHub Actions Workflow startet
3. ✅ Code wird auf Hetzner-Server kopiert
4. ✅ Backup wird erstellt
5. ✅ Server-Code wird gebaut (esbuild)
6. ✅ Docker-Container wird neu gestartet
7. ✅ Health Check wird durchgeführt
8. ✅ Deployment-Status wird angezeigt

**Dauer:** ~2-3 Minuten

---

## 📞 Support & Kontakte

**GitHub Repository:**
- URL: https://github.com/mlbonn/Mi42
- Owner: mlbonn
- Email: manus@bl.cx

**Hetzner Server:**
- IP: 46.224.9.190
- Domain: http://mi42.bl2020.com
- SSH: root@46.224.9.190

**Wichtige Dateien:**
- `/root/mi42/` - Application Root
- `/root/mi42/backups/` - Automatische Backups
- `/root/mi42/deploy-final.sh` - Manuelles Deployment-Script
- `/root/mi42/dist/index.js` - Kompilierte Server-App

---

## ✅ Checkliste für Ihren Kollegen

- [ ] GitHub Personal Access Token erstellt
- [ ] SSH-Key generiert und auf Server installiert
- [ ] GitHub Secrets konfiguriert (SSH_PRIVATE_KEY, SSH_HOST, SSH_USER, DEPLOY_PATH)
- [ ] GitHub Actions Workflow erstellt (.github/workflows/deploy.yml)
- [ ] Initial Commit zu GitHub gepusht
- [ ] Automatisches Deployment getestet
- [ ] Rollback-Prozedur getestet
- [ ] Monitoring eingerichtet
- [ ] Dokumentation gelesen und verstanden

---

**Viel Erfolg beim Setup! 🚀**
