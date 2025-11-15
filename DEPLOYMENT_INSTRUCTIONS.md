# Mi42 Production Deployment Instructions

## Schnell-Anleitung

### Schritt 1: Code auf Server kopieren

Führen Sie diesen Befehl **lokal** aus (von Ihrem Computer):

```bash
scp -r server client drizzle package.json deploy.sh root@46.224.9.190:/root/mi42/
```

**Passwort:** bkHJELW4JEqbumEVq

### Schritt 2: Deployment-Script ausführen

SSH auf den Server:

```bash
ssh root@46.224.9.190
```

**Passwort:** bkHJELW4JEqbumEVq

Dann auf dem Server:

```bash
cd /root/mi42
chmod +x deploy.sh
./deploy.sh
```

### Schritt 3: Testen

Öffnen Sie im Browser:
- http://46.224.9.190:3001
- http://mi42.bl2020.com

**Admin-Login:**
- Username: `admin`
- Passwort: `Admin2025!`

---

## Was das Deployment-Script macht

1. ✅ **Backup erstellen** - Sichert die aktuelle Version
2. ✅ **App stoppen** - Stoppt laufende Container/Prozesse
3. ✅ **Code aktualisieren** - Verwendet die kopierten Dateien
4. ✅ **Datenbank migrieren** - Führt neue SQL-Migrationen aus
5. ✅ **Build prüfen** - Stellt sicher, dass dist/index.js existiert
6. ✅ **App starten** - Startet Docker-Container mit neuem Code
7. ✅ **Health Check** - Prüft, ob die App läuft

---

## Troubleshooting

### Problem: "dist/index.js not found"

**Lösung:** Die `dist`-Datei muss auch kopiert werden:

```bash
scp -r dist root@46.224.9.190:/root/mi42/
```

### Problem: "Container is not running"

**Logs anzeigen:**

```bash
docker logs mi42-app
```

**Container manuell starten:**

```bash
docker start mi42-app
```

### Problem: "Port 3001 already in use"

**Prozess finden und beenden:**

```bash
netstat -tlnp | grep 3001
kill -9 <PID>
```

### Problem: Settings-Seite zeigt Fehler

**Browser-Cache leeren:**
- Chrome/Edge: Strg + Shift + R
- Firefox: Strg + F5

**Oder:** Inkognito-Modus verwenden

---

## Backup wiederherstellen

Falls etwas schiefgeht:

```bash
cd /root/mi42_backups
ls -lh  # Zeigt alle Backups
tar -xzf backup_YYYYMMDD_HHMMSS.tar.gz -C /root/mi42
./deploy.sh  # Deployment erneut ausführen
```

---

## Manuelle Deployment-Schritte (ohne Script)

Falls das Script nicht funktioniert:

```bash
# 1. App stoppen
docker stop mi42-app
docker rm mi42-app

# 2. Datenbank migrieren
cd /root/mi42
docker exec mi42-db mysql -umi42_user -pmi42_password_2025 mi42_db < drizzle/0010_normal_reavers.sql

# 3. Container starten
docker run -d \
  --name mi42-app \
  --network mi42_network \
  -p 3001:3001 \
  -v /root/mi42/dist:/app/dist:ro \
  -v /root/mi42/node_modules:/app/node_modules:ro \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -e DATABASE_URL="mysql://mi42_user:mi42_password_2025@mi42-db:3306/mi42_db" \
  --restart unless-stopped \
  node:22-alpine \
  node /app/dist/index.js

# 4. Logs prüfen
docker logs -f mi42-app
```

---

## Nützliche Befehle

```bash
# Container-Status prüfen
docker ps -a | grep mi42

# Logs anzeigen (live)
docker logs -f mi42-app

# Container neu starten
docker restart mi42-app

# In Container einsteigen
docker exec -it mi42-app sh

# Datenbank-Verbindung testen
docker exec mi42-db mysql -umi42_user -pmi42_password_2025 mi42_db -e "SHOW TABLES;"

# Port-Status prüfen
netstat -tlnp | grep 3001

# Disk Space prüfen
df -h
```

---

## Wichtige Dateien

| Datei | Beschreibung |
|-------|--------------|
| `/root/mi42/dist/index.js` | Haupt-Anwendung (kompiliert) |
| `/root/mi42/server/` | Server-Code (TypeScript) |
| `/root/mi42/client/` | Frontend-Code (React) |
| `/root/mi42/drizzle/` | Datenbank-Schema & Migrationen |
| `/root/mi42/deploy.sh` | Deployment-Script |
| `/root/mi42_backups/` | Backup-Verzeichnis |
| `/root/mi42/app.log` | Application Logs (falls nicht in Docker) |

---

## Kontakt

Bei Problemen:
- **Email:** manus@bl.cx
- **Server:** 46.224.9.190
- **SSH-User:** root
