# Wiederherstellungs-Anleitung für Mi42

Dieses Dokument beschreibt, wie die gesicherte Version von Mi42 vom Production-Server wiederhergestellt werden kann.

---

## Backup-Information

**Backup-Datei**: `construction-agents-archive-20251112-131239.tar.gz`  
**Speicherort**: `/root/backups/` auf dem Production-Server (46.224.9.190)  
**Größe**: 949 KB  
**Erstellt am**: 12. November 2025, 13:12:39 UTC  
**Enthält**: Vollständiger Quellcode (ohne node_modules, .git, dist, build)

---

## Wiederherstellung auf dem Production-Server

### Schritt 1: Auf Server einloggen

```bash
ssh root@46.224.9.190
# Passwort: bkHJELW4JEqbumEVq
```

### Schritt 2: Aktuellen Code sichern (optional)

```bash
cd /root
mv construction-agents construction-agents-backup-$(date +%Y%m%d-%H%M%S)
```

### Schritt 3: Backup extrahieren

```bash
cd /root
tar -xzf /root/backups/construction-agents-archive-20251112-131239.tar.gz
```

### Schritt 4: Dependencies installieren

```bash
cd /root/construction-agents
pnpm install
```

### Schritt 5: Docker-Container neu starten

```bash
cd /root/construction-agents
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

### Schritt 6: Überprüfen

```bash
# Container-Status prüfen
docker compose -f docker-compose.prod.yml ps

# Logs ansehen
docker compose -f docker-compose.prod.yml logs -f app

# Website testen
curl http://46.224.9.190:3001
```

---

## Wiederherstellung in lokaler Entwicklungsumgebung

### Schritt 1: Backup vom Server herunterladen

```bash
scp root@46.224.9.190:/root/backups/construction-agents-archive-20251112-131239.tar.gz ~/Downloads/
```

### Schritt 2: Backup extrahieren

```bash
cd ~/Projects
tar -xzf ~/Downloads/construction-agents-archive-20251112-131239.tar.gz
cd construction-agents
```

### Schritt 3: Dependencies installieren

```bash
pnpm install
```

### Schritt 4: Umgebungsvariablen konfigurieren

Erstelle `.env` Datei mit den notwendigen Variablen (siehe `.env.example`).

### Schritt 5: Datenbank-Schema pushen

```bash
pnpm db:push
```

### Schritt 6: Development-Server starten

```bash
pnpm dev
```

Die Anwendung läuft dann auf `http://localhost:3000`.

---

## Backup-Inhalt

Das Archiv enthält:

```
construction-agents/
├── client/              # Frontend (React + Vite)
│   ├── public/
│   └── src/
├── server/              # Backend (Express + tRPC)
│   ├── _core/
│   ├── payment/         # Stripe/PayPal Integration
│   ├── briefingService.ts
│   ├── briefingScheduler.ts
│   ├── db.ts
│   └── routers.ts
├── drizzle/             # Datenbank-Schema
│   └── schema.ts
├── shared/              # Shared Types
├── storage/             # S3 Helpers
├── docker-compose.prod.yml
├── package.json
├── tsconfig.json
└── vite.config.ts
```

**Ausgeschlossen** (werden bei Installation neu erstellt):
- `node_modules/` - Dependencies
- `.git/` - Git-Historie
- `dist/` - Build-Artifacts
- `build/` - Build-Artifacts

---

## Wichtige Hinweise

### Datenbank

Das Backup enthält **KEINEN Datenbank-Dump**. Die Datenbank auf dem Production-Server bleibt unverändert. Wenn Sie auch die Datenbank wiederherstellen möchten, erstellen Sie vorher einen Dump:

```bash
# Datenbank-Dump erstellen
docker exec mi42-db mysqldump -u root -p'rootpassword123' mi42_db > /root/backups/mi42_db_$(date +%Y%m%d-%H%M%S).sql

# Datenbank wiederherstellen
docker exec -i mi42-db mysql -u root -p'rootpassword123' mi42_db < /root/backups/mi42_db_YYYYMMDD-HHMMSS.sql
```

### Umgebungsvariablen

Die `.env` Datei ist **NICHT** im Backup enthalten (Sicherheit). Stellen Sie sicher, dass alle notwendigen Umgebungsvariablen konfiguriert sind:

- `DATABASE_URL`
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `OPEN_WEBUI_API_KEY`
- etc.

### Docker-Volumes

Docker-Volumes (z.B. MySQL-Daten) bleiben beim Neustart erhalten. Wenn Sie eine komplett frische Installation möchten:

```bash
docker compose -f docker-compose.prod.yml down -v  # Löscht auch Volumes
```

---

## Automatische Backups (Empfehlung)

Erstellen Sie einen Cron-Job für automatische tägliche Backups:

```bash
# Crontab bearbeiten
crontab -e

# Fügen Sie folgende Zeile hinzu (täglich um 2 Uhr nachts):
0 2 * * * cd /root/construction-agents && tar --exclude='node_modules' --exclude='.git' --exclude='dist' --exclude='build' -czf /root/backups/construction-agents-backup-$(date +\%Y\%m\%d-\%H\%M\%S).tar.gz . && find /root/backups -name "construction-agents-backup-*.tar.gz" -mtime +30 -delete
```

Dieser Cron-Job:
1. Erstellt täglich um 2 Uhr ein Backup
2. Löscht Backups, die älter als 30 Tage sind

---

## Support

Bei Problemen mit der Wiederherstellung:

1. Überprüfen Sie die Docker-Logs: `docker compose logs -f`
2. Überprüfen Sie die Datenbank-Verbindung: `docker exec mi42-db mysql -u root -p'rootpassword123' -e "SHOW DATABASES;"`
3. Überprüfen Sie die Umgebungsvariablen: `docker compose config`

---

## Version-Information

**Backup-Version**: 12. November 2025  
**Features**:
- ✅ 7 AI-Agenten (Market Analyst, Trend Scout, etc.)
- ✅ Automated Briefings (Daily/Weekly)
- ✅ Role-Based Access Control (Admin, Internal, External)
- ✅ Stripe Payment Integration (Credit-Pakete, Subscriptions)
- ✅ Invoice Generation (PDF)
- ✅ Domain-basiertes Freemium-Tracking (Vorbereitung)
- ⏳ PayPal Integration (in Entwicklung)
- ⏳ Payment UI (in Entwicklung)

**Bekannte Einschränkungen**:
- React Login-Page hat Event-Handler-Probleme in Production → Verwende `/login-standalone.html`
- TypeScript-Fehler in `stripeService.ts` (funktional, aber Compiler-Warnings)
