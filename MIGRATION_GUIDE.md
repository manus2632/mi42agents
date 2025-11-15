# Mi42 Migrations-Leitfaden: Node.js/tRPC → Lucee/MS-SQL

**Version:** 1.0  
**Datum:** 2025-11-10  
**Autor:** Manus AI

---

## Übersicht

Dieser Leitfaden beschreibt die Migration des Mi42 Agentensystems von der aktuellen Node.js/tRPC/PostgreSQL-Architektur in eine Lucee/MS-SQL-Umgebung. Die Migration erfolgt in vier Phasen und bewahrt die vollständige Funktionalität des Systems.

---

## Architektur-Vergleich

| Komponente | Aktuell (Node.js) | Ziel (Lucee) |
|------------|-------------------|--------------|
| **Backend-Framework** | Express 4 + tRPC 11 | Lucee CFML (REST-API) |
| **Datenbank** | PostgreSQL (via Drizzle ORM) | MS-SQL Server 2016+ |
| **Authentifizierung** | Manus OAuth 2.0 + JWT-Cookie | Session-basiert (user_sessions-Tabelle) |
| **Frontend** | React 19 + Vite | React 19 + Vite (unverändert) |
| **LLM-Integration** | Open WebUI API (gpt-oss:120b) | Open WebUI API (unverändert) |
| **API-Protokoll** | tRPC (typsicher) | REST JSON |
| **Deployment** | Node.js-Server | Lucee Application Server |

---

## Phase 1: Datenbank-Migration

### 1.1 Schema-Import

Das vollständige MS-SQL-Schema ist in `MIGRATION_MSSQL_SCHEMA.sql` dokumentiert.

**Schritte:**

```sql
-- 1. Datenbank erstellen
CREATE DATABASE mi42_production;
GO

USE mi42_production;
GO

-- 2. Schema-Script ausführen
-- Siehe MIGRATION_MSSQL_SCHEMA.sql
```

### 1.2 Daten-Migration (falls bestehende User-Daten vorhanden)

Falls Sie bereits eine User-Tabelle in Ihrem bestehenden Portal haben:

**Option A: Bestehende Tabelle erweitern**
```sql
ALTER TABLE existing_users ADD password_hash VARCHAR(255);
ALTER TABLE existing_users ADD role VARCHAR(20) DEFAULT 'user';

-- Credit-Balances für bestehende User initialisieren
INSERT INTO credit_balances (user_id, balance)
SELECT id, 5000 FROM existing_users
WHERE id NOT IN (SELECT user_id FROM credit_balances);
```

**Option B: Mapping-Tabelle**
```sql
CREATE TABLE user_mapping (
  mi42_user_id INT PRIMARY KEY,
  portal_user_id INT NOT NULL,
  FOREIGN KEY (mi42_user_id) REFERENCES users(id),
  FOREIGN KEY (portal_user_id) REFERENCES portal_users(id)
);
```

### 1.3 Indizes und Performance

Nach dem Import:

```sql
-- Statistiken aktualisieren
UPDATE STATISTICS users;
UPDATE STATISTICS agent_tasks;
UPDATE STATISTICS agent_briefings;
UPDATE STATISTICS credit_transactions;

-- Fragmentierung prüfen
SELECT 
  OBJECT_NAME(ps.object_id) AS TableName,
  i.name AS IndexName,
  ps.avg_fragmentation_in_percent
FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'LIMITED') ps
INNER JOIN sys.indexes i ON ps.object_id = i.object_id AND ps.index_id = i.index_id
WHERE ps.avg_fragmentation_in_percent > 10
ORDER BY ps.avg_fragmentation_in_percent DESC;
```

---

## Phase 2: Backend-Migration (Lucee)

### 2.1 Projekt-Struktur

```
/mi42/
├── Application.cfc          # Lucee Application Config
├── index.cfm                 # Frontend Entry Point
├── api/
│   ├── auth.cfc              # Authentifizierung
│   ├── credits.cfc           # Credit-Management
│   ├── agents.cfc            # Agenten-Ausführung
│   ├── briefings.cfc         # Briefing-Abruf
│   └── settings.cfc          # Modell-Konfiguration
├── components/
│   ├── LLMService.cfc        # LLM-Integration
│   ├── SessionManager.cfc    # Session-Verwaltung
│   └── DatabaseService.cfc   # DB-Helper
└── client/                   # React-Frontend (aus Node.js kopiert)
    ├── dist/                 # Build-Output
    └── src/                  # Source (für Entwicklung)
```

### 2.2 Application.cfc

```cfml
component {
  this.name = "Mi42AgentSystem";
  this.applicationTimeout = createTimeSpan(1, 0, 0, 0);
  this.sessionManagement = true;
  this.sessionTimeout = createTimeSpan(0, 24, 0, 0);
  this.setClientCookies = true;
  
  this.datasource = "mi42";
  
  this.mappings = {
    "/api": expandPath("./api"),
    "/components": expandPath("./components")
  };
  
  function onApplicationStart() {
    application.llmService = new components.LLMService();
    application.sessionManager = new components.SessionManager();
    return true;
  }
  
  function onRequestStart(targetPage) {
    // CORS für React-Frontend
    header name="Access-Control-Allow-Origin" value="*";
    header name="Access-Control-Allow-Methods" value="GET,POST,PUT,DELETE,OPTIONS";
    header name="Access-Control-Allow-Headers" value="Content-Type,Authorization";
    
    if (cgi.request_method == "OPTIONS") {
      abort;
    }
    
    // API-Requests verarbeiten
    if (findNoCase("/api/", cgi.script_name)) {
      processAPIRequest();
      abort;
    }
  }
  
  private function processAPIRequest() {
    var path = replace(cgi.script_name, "/api/", "");
    var parts = listToArray(path, "/");
    var controller = parts[1];
    var action = arrayLen(parts) > 1 ? parts[2] : "index";
    
    try {
      var component = createObject("component", "api.#controller#");
      var result = invoke(component, action);
      
      header name="Content-Type" value="application/json";
      writeOutput(serializeJSON(result));
    } catch (any e) {
      header statuscode="500";
      writeOutput(serializeJSON({
        "error": true,
        "message": e.message
      }));
    }
  }
}
```

### 2.3 Authentifizierungs-Adapter (auth.cfc)

```cfml
component {
  
  public struct function login(required string email, required string password) {
    // User aus DB abrufen
    var qUser = queryExecute("
      SELECT id, email, name, password_hash, role
      FROM users
      WHERE email = :email
    ", {email: arguments.email});
    
    if (qUser.recordCount == 0) {
      return {"error": true, "message": "Ungültige Anmeldedaten"};
    }
    
    // Passwort prüfen (BCrypt)
    if (!application.sessionManager.verifyPassword(arguments.password, qUser.password_hash)) {
      return {"error": true, "message": "Ungültige Anmeldedaten"};
    }
    
    // Session erstellen
    var sessionId = createUUID();
    var expiresAt = dateAdd("h", 24, now());
    
    queryExecute("
      INSERT INTO user_sessions (session_id, user_id, expires_at)
      VALUES (:sessionId, :userId, :expiresAt)
    ", {
      sessionId: sessionId,
      userId: qUser.id,
      expiresAt: expiresAt
    });
    
    // Cookie setzen
    cookie.session_id = sessionId;
    cookie.session_id.httpOnly = true;
    cookie.session_id.secure = true;
    cookie.session_id.expires = expiresAt;
    
    return {
      "success": true,
      "user": {
        "id": qUser.id,
        "email": qUser.email,
        "name": qUser.name,
        "role": qUser.role
      }
    };
  }
  
  public struct function me() {
    var user = application.sessionManager.getCurrentUser();
    
    if (!user.authenticated) {
      return {"authenticated": false};
    }
    
    return {
      "authenticated": true,
      "user": user.data
    };
  }
  
  public struct function logout() {
    if (structKeyExists(cookie, "session_id")) {
      queryExecute("
        DELETE FROM user_sessions
        WHERE session_id = :sessionId
      ", {sessionId: cookie.session_id});
      
      structDelete(cookie, "session_id");
    }
    
    return {"success": true};
  }
}
```

### 2.4 Session-Manager (SessionManager.cfc)

```cfml
component {
  
  public struct function getCurrentUser() {
    if (!structKeyExists(cookie, "session_id")) {
      return {"authenticated": false};
    }
    
    var qSession = queryExecute("
      SELECT u.id, u.email, u.name, u.role
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.session_id = :sessionId
        AND s.expires_at > GETDATE()
    ", {sessionId: cookie.session_id});
    
    if (qSession.recordCount == 0) {
      return {"authenticated": false};
    }
    
    return {
      "authenticated": true,
      "data": {
        "id": qSession.id,
        "email": qSession.email,
        "name": qSession.name,
        "role": qSession.role
      }
    };
  }
  
  public boolean function verifyPassword(required string password, required string hash) {
    // BCrypt-Verifikation (benötigt Java-Library)
    var BCrypt = createObject("java", "org.mindrot.jbcrypt.BCrypt");
    return BCrypt.checkpw(arguments.password, arguments.hash);
  }
  
  public string function hashPassword(required string password) {
    var BCrypt = createObject("java", "org.mindrot.jbcrypt.BCrypt");
    return BCrypt.hashpw(arguments.password, BCrypt.gensalt());
  }
}
```

### 2.5 LLM-Service (LLMService.cfc)

```cfml
component {
  
  variables.apiUrl = "https://maxproxy.bl2020.com/api/chat/completions";
  variables.apiKey = "sk-bd621b0666474be1b054b3c5360b3cef";
  variables.defaultModel = "gpt-oss:120b";
  
  public struct function invoke(required array messages, string model = variables.defaultModel) {
    var payload = {
      "model": arguments.model,
      "messages": arguments.messages,
      "temperature": 0.7
    };
    
    var httpService = new http();
    httpService.setMethod("POST");
    httpService.setUrl(variables.apiUrl);
    httpService.addParam(type="header", name="Authorization", value="Bearer #variables.apiKey#");
    httpService.addParam(type="header", name="Content-Type", value="application/json");
    httpService.addParam(type="body", value=serializeJSON(payload));
    
    var result = httpService.send().getPrefix();
    
    if (result.statusCode != "200 OK") {
      throw(message="LLM API Error: #result.statusCode#", detail=result.fileContent);
    }
    
    var response = deserializeJSON(result.fileContent);
    return {
      "content": response.choices[1].message.content,
      "model": response.model,
      "usage": response.usage
    };
  }
  
  public string function getSystemPrompt(required string agentType) {
    switch (arguments.agentType) {
      case "market_analyst":
        return "Du bist ein erfahrener Marktanalyst...";
      case "trend_scout":
        return "Du bist ein Trend-Scout...";
      case "survey_assistant":
        return "Du bist ein Umfrage-Assistent...";
      case "strategy_advisor":
        return "Du bist ein strategischer Berater...";
      default:
        return "Du bist ein hilfreicher Assistent.";
    }
  }
}
```

### 2.6 Agenten-Ausführung (agents.cfc)

```cfml
component {
  
  public struct function create(required string agentType, required string prompt) {
    var user = application.sessionManager.getCurrentUser();
    
    if (!user.authenticated) {
      return {"error": true, "message": "Nicht authentifiziert"};
    }
    
    var estimatedCost = getEstimatedCost(arguments.agentType);
    
    var qInsert = queryExecute("
      INSERT INTO agent_tasks (user_id, agent_type, prompt, estimated_cost, task_status)
      OUTPUT INSERTED.id
      VALUES (:userId, :agentType, :prompt, :cost, 'pending')
    ", {
      userId: user.data.id,
      agentType: arguments.agentType,
      prompt: arguments.prompt,
      cost: estimatedCost
    });
    
    return {
      "taskId": qInsert.id,
      "estimatedCost": estimatedCost,
      "status": "pending"
    };
  }
  
  public struct function confirm(required numeric taskId) {
    var user = application.sessionManager.getCurrentUser();
    
    if (!user.authenticated) {
      return {"error": true, "message": "Nicht authentifiziert"};
    }
    
    // Credits abziehen
    transaction {
      queryExecute("EXEC sp_deduct_credits @user_id = :userId, @amount = (
        SELECT estimated_cost FROM agent_tasks WHERE id = :taskId
      ), @task_id = :taskId", {
        userId: user.data.id,
        taskId: arguments.taskId
      });
      
      queryExecute("
        UPDATE agent_tasks
        SET task_status = 'running', started_at = GETDATE()
        WHERE id = :taskId
      ", {taskId: arguments.taskId});
    }
    
    // Asynchrone Ausführung starten
    thread name="agent_#arguments.taskId#" taskId=arguments.taskId userId=user.data.id {
      executeAgentTask(attributes.taskId, attributes.userId);
    }
    
    return {"success": true, "message": "Task wird ausgeführt"};
  }
  
  private void function executeAgentTask(required numeric taskId, required numeric userId) {
    try {
      // Task-Daten abrufen
      var qTask = queryExecute("
        SELECT agent_type, prompt
        FROM agent_tasks
        WHERE id = :taskId
      ", {taskId: arguments.taskId});
      
      // LLM ausführen
      var systemPrompt = application.llmService.getSystemPrompt(qTask.agent_type);
      var messages = [
        {"role": "system", "content": systemPrompt},
        {"role": "user", "content": qTask.prompt}
      ];
      
      var llmResponse = application.llmService.invoke(messages);
      
      // Briefing erstellen
      queryExecute("
        INSERT INTO agent_briefings (task_id, user_id, agent_type, response)
        VALUES (:taskId, :userId, :agentType, :response)
      ", {
        taskId: arguments.taskId,
        userId: arguments.userId,
        agentType: qTask.agent_type,
        response: llmResponse.content
      });
      
      // Task als completed markieren
      queryExecute("
        UPDATE agent_tasks
        SET task_status = 'completed', completed_at = GETDATE()
        WHERE id = :taskId
      ", {taskId: arguments.taskId});
      
    } catch (any e) {
      // Fehler speichern
      queryExecute("
        UPDATE agent_tasks
        SET task_status = 'failed', error_message = :error
        WHERE id = :taskId
      ", {
        taskId: arguments.taskId,
        error: e.message
      });
    }
  }
  
  private numeric function getEstimatedCost(required string agentType) {
    var costs = {
      "market_analyst": 200,
      "trend_scout": 500,
      "survey_assistant": 2000,
      "strategy_advisor": 5000
    };
    
    return costs[arguments.agentType] ?: 100;
  }
}
```

---

## Phase 3: Frontend-Anpassung

### 3.1 API-Client ändern

**Aktuell (tRPC):**
```typescript
const { data } = trpc.credits.balance.useQuery();
```

**Neu (REST):**
```typescript
const { data } = useQuery({
  queryKey: ['credits', 'balance'],
  queryFn: async () => {
    const res = await fetch('/api/credits/balance', {
      credentials: 'include'
    });
    return res.json();
  }
});
```

### 3.2 API-Wrapper erstellen

```typescript
// client/src/lib/api.ts
const API_BASE = '/api';

export const api = {
  credits: {
    balance: () => fetch(`${API_BASE}/credits/balance`, {credentials: 'include'}).then(r => r.json()),
    purchase: (packageId: number) => fetch(`${API_BASE}/credits/purchase`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      credentials: 'include',
      body: JSON.stringify({packageId})
    }).then(r => r.json()),
  },
  tasks: {
    create: (data: {agentType: string, prompt: string}) => 
      fetch(`${API_BASE}/agents/create`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify(data)
      }).then(r => r.json()),
    confirm: (taskId: number) =>
      fetch(`${API_BASE}/agents/confirm`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify({taskId})
      }).then(r => r.json()),
  },
  briefings: {
    list: () => fetch(`${API_BASE}/briefings/list`, {credentials: 'include'}).then(r => r.json()),
    getById: (id: number) => fetch(`${API_BASE}/briefings/${id}`, {credentials: 'include'}).then(r => r.json()),
  },
  auth: {
    me: () => fetch(`${API_BASE}/auth/me`, {credentials: 'include'}).then(r => r.json()),
    login: (email: string, password: string) =>
      fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify({email, password})
      }).then(r => r.json()),
    logout: () => fetch(`${API_BASE}/auth/logout`, {method: 'POST', credentials: 'include'}).then(r => r.json()),
  }
};
```

### 3.3 React-Query-Hooks anpassen

```typescript
// client/src/hooks/useCredits.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useCredits() {
  const queryClient = useQueryClient();
  
  const balance = useQuery({
    queryKey: ['credits', 'balance'],
    queryFn: api.credits.balance
  });
  
  const purchase = useMutation({
    mutationFn: api.credits.purchase,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['credits', 'balance']});
    }
  });
  
  return { balance, purchase };
}
```

---

## Phase 4: Deployment

### 4.1 Lucee-Server-Konfiguration

**server.xml:**
```xml
<Server>
  <Service name="Catalina">
    <Connector port="8888" protocol="HTTP/1.1" />
    <Engine name="Catalina" defaultHost="localhost">
      <Host name="localhost" appBase="webapps">
        <Context path="/mi42" docBase="/var/www/mi42" />
      </Host>
    </Engine>
  </Service>
</Server>
```

**web.xml (URL-Rewriting für React-Router):**
```xml
<filter>
  <filter-name>UrlRewriteFilter</filter-name>
  <filter-class>org.tuckey.web.filters.urlrewrite.UrlRewriteFilter</filter-class>
</filter>
<filter-mapping>
  <filter-name>UrlRewriteFilter</filter-name>
  <url-pattern>/*</url-pattern>
</filter-mapping>
```

**urlrewrite.xml:**
```xml
<urlrewrite>
  <rule>
    <from>^/api/(.*)$</from>
    <to type="passthrough">/api/$1</to>
  </rule>
  <rule>
    <from>^/(?!api|static).*$</from>
    <to>/index.cfm</to>
  </rule>
</urlrewrite>
```

### 4.2 Frontend-Build

```bash
cd client
pnpm install
pnpm build

# Build-Output nach Lucee kopieren
cp -r dist/* /var/www/mi42/client/dist/
```

### 4.3 Datenbank-Verbindung konfigurieren

**Lucee Admin → Datasources:**
- Name: `mi42`
- Type: MS-SQL Server
- Host: `your-mssql-server.com`
- Port: `1433`
- Database: `mi42_production`
- Username: `mi42_app_user`
- Password: `***`
- Connection String: `jdbc:sqlserver://your-mssql-server.com:1433;databaseName=mi42_production;encrypt=true`

---

## Checkliste

### Vor der Migration
- [ ] Backup der bestehenden Datenbank erstellen
- [ ] MS-SQL-Server bereitstellen und testen
- [ ] Lucee Application Server installieren (Version 5.4+)
- [ ] BCrypt-Library für Lucee installieren
- [ ] Frontend-Build lokal testen

### Während der Migration
- [ ] Datenbank-Schema importieren (`MIGRATION_MSSQL_SCHEMA.sql`)
- [ ] Bestehende User-Daten migrieren (falls vorhanden)
- [ ] Lucee-Komponenten deployen (`Application.cfc`, `api/`, `components/`)
- [ ] Frontend-Build deployen (`client/dist/`)
- [ ] Datasource in Lucee Admin konfigurieren
- [ ] URL-Rewriting konfigurieren

### Nach der Migration
- [ ] Authentifizierung testen (Login/Logout)
- [ ] Credit-System testen (Kauf, Verbrauch, Transaktionen)
- [ ] Agenten-Ausführung testen (alle 4 Typen)
- [ ] Briefing-Erstellung und -Abruf testen
- [ ] PDF-Export testen
- [ ] Performance-Tests durchführen
- [ ] Monitoring einrichten (Logs, Fehler, Deadlocks)
- [ ] Backup-Strategie implementieren

---

## Troubleshooting

### Problem: Session-Cookie wird nicht gesetzt

**Lösung:**
```cfml
// In Application.cfc
this.sessioncookie.httponly = true;
this.sessioncookie.secure = true;
this.sessioncookie.samesite = "lax";
```

### Problem: CORS-Fehler beim API-Aufruf

**Lösung:**
```cfml
// In onRequestStart()
header name="Access-Control-Allow-Origin" value="#cgi.http_origin#";
header name="Access-Control-Allow-Credentials" value="true";
```

### Problem: LLM-Request timeout

**Lösung:**
```cfml
// In LLMService.cfc
httpService.setTimeout(120); // 120 Sekunden
```

### Problem: Deadlocks bei Credit-Abzug

**Lösung:**
```sql
-- In sp_deduct_credits
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
-- Oder: WITH (ROWLOCK, UPDLOCK)
```

---

## Performance-Optimierung

### Caching

```cfml
// In Application.cfc
this.cache.object = "ehcache";
this.cache.template = "ehcache";

// In Komponenten
cachedWithin = createTimeSpan(0, 0, 5, 0) // 5 Minuten
```

### Connection Pooling

```
Lucee Admin → Datasources → mi42 → Advanced Settings:
- Max Connections: 50
- Connection Timeout: 30s
- Validation Query: SELECT 1
```

### Query-Optimierung

```sql
-- Execution Plans analysieren
SET STATISTICS IO ON;
SET STATISTICS TIME ON;

-- Fehlende Indizes identifizieren
SELECT * FROM sys.dm_db_missing_index_details;
```

---

## Support

Bei Fragen zur Migration:
- **Dokumentation:** `MIGRATION_API_DOCUMENTATION.md`
- **Schema:** `MIGRATION_MSSQL_SCHEMA.sql`
- **Lucee-Docs:** https://docs.lucee.org/
- **MS-SQL-Docs:** https://learn.microsoft.com/en-us/sql/

---

**Geschätzte Migrationszeit:** 3-5 Arbeitstage (abhängig von bestehender Infrastruktur)
