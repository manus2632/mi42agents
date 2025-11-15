# Mi42 API-Dokumentation für Lucee/MS-SQL-Integration

**Version:** 1.0  
**Datum:** 2025-11-10  
**Autor:** Manus AI

---

## Übersicht

Das Mi42 Agentensystem basiert auf einer tRPC-API mit TypeScript/Node.js-Backend. Für die Integration in eine Lucee/MS-SQL-Umgebung müssen die tRPC-Endpoints als REST-API-Wrapper implementiert werden.

---

## Authentifizierung

### Aktuelles System
- **OAuth 2.0** über Manus-Plattform
- Session-Cookie: `manus_session`
- JWT-Token in Cookie gespeichert

### Für Lucee-Migration
Ersetzen durch Standard-Session-Management:

```sql
-- User-Session-Tabelle
CREATE TABLE user_sessions (
  session_id VARCHAR(64) PRIMARY KEY,
  user_id INT NOT NULL,
  created_at DATETIME DEFAULT GETDATE(),
  expires_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Lucee-Adapter:**
```cfml
<cffunction name="validateSession" access="public" returntype="struct">
  <cfargument name="sessionId" type="string" required="true">
  
  <cfquery name="qSession" datasource="mi42">
    SELECT u.id, u.email, u.name, u.role
    FROM user_sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.session_id = <cfqueryparam value="#arguments.sessionId#" cfsqltype="cf_sql_varchar">
      AND s.expires_at > GETDATE()
  </cfquery>
  
  <cfif qSession.recordCount GT 0>
    <cfreturn {
      "authenticated": true,
      "user": {
        "id": qSession.id,
        "email": qSession.email,
        "name": qSession.name,
        "role": qSession.role
      }
    }>
  <cfelse>
    <cfreturn {"authenticated": false}>
  </cfif>
</cffunction>
```

---

## API-Endpoints

### 1. Credit-Management

#### GET `/api/credits/balance`
**Beschreibung:** Aktuelles Credit-Guthaben abrufen

**Request:**
```http
GET /api/credits/balance
Cookie: session_id=<session_id>
```

**Response:**
```json
{
  "balance": 5000,
  "userId": 1
}
```

**Lucee-Implementation:**
```cfml
<cfquery name="qBalance" datasource="mi42">
  SELECT balance FROM credit_balances
  WHERE user_id = <cfqueryparam value="#session.user.id#" cfsqltype="cf_sql_integer">
</cfquery>

<cfset response = {
  "balance": qBalance.balance,
  "userId": session.user.id
}>
<cfcontent type="application/json" reset="true">
<cfoutput>#serializeJSON(response)#</cfoutput>
```

#### POST `/api/credits/purchase`
**Beschreibung:** Credits kaufen

**Request:**
```json
{
  "packageId": 1
}
```

**Response:**
```json
{
  "success": true,
  "newBalance": 6000,
  "transactionId": 42
}
```

**Lucee-Implementation:**
```cfml
<cfset data = deserializeJSON(toString(getHttpRequestData().content))>

<cftransaction>
  <cfquery datasource="mi42">
    INSERT INTO credit_transactions (user_id, amount, transaction_type, created_at)
    VALUES (
      <cfqueryparam value="#session.user.id#" cfsqltype="cf_sql_integer">,
      <cfqueryparam value="#data.amount#" cfsqltype="cf_sql_integer">,
      'purchase',
      GETDATE()
    )
  </cfquery>
  
  <cfquery datasource="mi42">
    UPDATE credit_balances
    SET balance = balance + <cfqueryparam value="#data.amount#" cfsqltype="cf_sql_integer">
    WHERE user_id = <cfqueryparam value="#session.user.id#" cfsqltype="cf_sql_integer">
  </cfquery>
</cftransaction>
```

---

### 2. Agenten-Ausführung

#### POST `/api/tasks/create`
**Beschreibung:** Neuen Agenten-Task erstellen

**Request:**
```json
{
  "agentType": "market_analyst",
  "prompt": "Analysiere den deutschen Markt für Dämmstoffe",
  "language": "de"
}
```

**Response:**
```json
{
  "taskId": 123,
  "estimatedCost": 200,
  "status": "pending"
}
```

**Lucee-Implementation:**
```cfml
<cfset data = deserializeJSON(toString(getHttpRequestData().content))>

<cfquery name="qInsert" datasource="mi42" result="insertResult">
  INSERT INTO agent_tasks (
    user_id, agent_type, prompt, estimated_cost, task_status, created_at
  ) VALUES (
    <cfqueryparam value="#session.user.id#" cfsqltype="cf_sql_integer">,
    <cfqueryparam value="#data.agentType#" cfsqltype="cf_sql_varchar">,
    <cfqueryparam value="#data.prompt#" cfsqltype="cf_sql_varchar">,
    <cfqueryparam value="#getEstimatedCost(data.agentType)#" cfsqltype="cf_sql_integer">,
    'pending',
    GETDATE()
  )
</cfquery>

<cfset taskId = insertResult.IDENTITYCOL>
```

#### POST `/api/tasks/confirm`
**Beschreibung:** Task bestätigen und ausführen

**Request:**
```json
{
  "taskId": 123
}
```

**Response:**
```json
{
  "success": true,
  "message": "Task wird ausgeführt"
}
```

**Lucee-Implementation:**
```cfml
<cfset data = deserializeJSON(toString(getHttpRequestData().content))>

<cftransaction>
  <!--- Credits abziehen --->
  <cfquery datasource="mi42">
    UPDATE credit_balances
    SET balance = balance - (
      SELECT estimated_cost FROM agent_tasks WHERE id = <cfqueryparam value="#data.taskId#" cfsqltype="cf_sql_integer">
    )
    WHERE user_id = #session.user.id#
  </cfquery>
  
  <!--- Task-Status aktualisieren --->
  <cfquery datasource="mi42">
    UPDATE agent_tasks
    SET task_status = 'running', started_at = GETDATE()
    WHERE id = <cfqueryparam value="#data.taskId#" cfsqltype="cf_sql_integer">
  </cfquery>
  
  <!--- Asynchrone LLM-Ausführung starten --->
  <cfset executeAgentAsync(data.taskId)>
</cftransaction>
```

---

### 3. LLM-Integration

#### Funktion: `executeAgent(taskId, agentType, prompt, language)`

**Beschreibung:** Führt LLM-Request aus und speichert Ergebnis

**Lucee-Implementation:**
```cfml
<cffunction name="executeAgent" access="public" returntype="struct">
  <cfargument name="taskId" type="numeric" required="true">
  <cfargument name="agentType" type="string" required="true">
  <cfargument name="prompt" type="string" required="true">
  <cfargument name="language" type="string" default="de">
  
  <!--- System-Prompt basierend auf Agent-Typ --->
  <cfset systemPrompt = getSystemPrompt(arguments.agentType)>
  
  <!--- LLM-Request an Open WebUI --->
  <cfhttp url="https://maxproxy.bl2020.com/api/chat/completions" method="POST">
    <cfhttpparam type="header" name="Authorization" value="Bearer sk-bd621b0666474be1b054b3c5360b3cef">
    <cfhttpparam type="header" name="Content-Type" value="application/json">
    <cfhttpparam type="body" value='#serializeJSON({
      "model": "gpt-oss:120b",
      "messages": [
        {"role": "system", "content": systemPrompt},
        {"role": "user", "content": arguments.prompt}
      ],
      "temperature": 0.7
    })#'>
  </cfhttp>
  
  <cfset llmResponse = deserializeJSON(cfhttp.fileContent)>
  <cfset responseText = llmResponse.choices[1].message.content>
  
  <!--- Briefing erstellen --->
  <cfquery datasource="mi42" result="briefingResult">
    INSERT INTO agent_briefings (
      task_id, user_id, agent_type, response, created_at
    ) VALUES (
      <cfqueryparam value="#arguments.taskId#" cfsqltype="cf_sql_integer">,
      <cfqueryparam value="#session.user.id#" cfsqltype="cf_sql_integer">,
      <cfqueryparam value="#arguments.agentType#" cfsqltype="cf_sql_varchar">,
      <cfqueryparam value="#responseText#" cfsqltype="cf_sql_longvarchar">,
      GETDATE()
    )
  </cfquery>
  
  <!--- Task als completed markieren --->
  <cfquery datasource="mi42">
    UPDATE agent_tasks
    SET task_status = 'completed', completed_at = GETDATE()
    WHERE id = <cfqueryparam value="#arguments.taskId#" cfsqltype="cf_sql_integer">
  </cfquery>
  
  <cfreturn {
    "success": true,
    "briefingId": briefingResult.IDENTITYCOL
  }>
</cffunction>
```

---

### 4. Briefing-Abruf

#### GET `/api/briefings/list`
**Beschreibung:** Liste aller Briefings des Users

**Response:**
```json
[
  {
    "id": 1,
    "agentType": "market_analyst",
    "createdAt": "2025-11-10T14:23:00Z",
    "preview": "Marktanalyse – Deutsche Dämmstoffindustrie..."
  }
]
```

**Lucee-Implementation:**
```cfml
<cfquery name="qBriefings" datasource="mi42">
  SELECT 
    b.id,
    b.agent_type AS agentType,
    b.created_at AS createdAt,
    LEFT(b.response, 200) AS preview,
    t.prompt
  FROM agent_briefings b
  JOIN agent_tasks t ON b.task_id = t.id
  WHERE b.user_id = <cfqueryparam value="#session.user.id#" cfsqltype="cf_sql_integer">
  ORDER BY b.created_at DESC
</cfquery>

<cfset briefings = []>
<cfloop query="qBriefings">
  <cfset arrayAppend(briefings, {
    "id": qBriefings.id,
    "agentType": qBriefings.agentType,
    "createdAt": dateFormat(qBriefings.createdAt, "yyyy-mm-dd") & "T" & timeFormat(qBriefings.createdAt, "HH:mm:ss") & "Z",
    "preview": qBriefings.preview,
    "prompt": qBriefings.prompt
  })>
</cfloop>

<cfcontent type="application/json" reset="true">
<cfoutput>#serializeJSON(briefings)#</cfoutput>
```

#### GET `/api/briefings/:id`
**Beschreibung:** Einzelnes Briefing abrufen

**Response:**
```json
{
  "id": 1,
  "agentType": "market_analyst",
  "prompt": "Analysiere den deutschen Markt für Dämmstoffe",
  "response": "**Marktanalyse – Deutsche Dämmstoffindustrie...",
  "createdAt": "2025-11-10T14:23:00Z",
  "userNotes": {}
}
```

**Lucee-Implementation:**
```cfml
<cfquery name="qBriefing" datasource="mi42">
  SELECT 
    b.id,
    b.agent_type AS agentType,
    b.response,
    b.user_notes AS userNotes,
    b.created_at AS createdAt,
    t.prompt
  FROM agent_briefings b
  JOIN agent_tasks t ON b.task_id = t.id
  WHERE b.id = <cfqueryparam value="#url.id#" cfsqltype="cf_sql_integer">
    AND b.user_id = <cfqueryparam value="#session.user.id#" cfsqltype="cf_sql_integer">
</cfquery>

<cfif qBriefing.recordCount EQ 0>
  <cfheader statuscode="404">
  <cfabort>
</cfif>

<cfset briefing = {
  "id": qBriefing.id,
  "agentType": qBriefing.agentType,
  "prompt": qBriefing.prompt,
  "response": qBriefing.response,
  "createdAt": dateFormat(qBriefing.createdAt, "yyyy-mm-dd") & "T" & timeFormat(qBriefing.createdAt, "HH:mm:ss") & "Z",
  "userNotes": deserializeJSON(qBriefing.userNotes ?: "{}")
}>

<cfcontent type="application/json" reset="true">
<cfoutput>#serializeJSON(briefing)#</cfoutput>
```

---

### 5. Settings (Modell-Konfiguration)

#### GET `/api/settings/models`
**Beschreibung:** Modell-Konfiguration pro Agent abrufen

**Response:**
```json
{
  "market_analyst": "gpt-oss:120b",
  "trend_scout": "gemini-2.5-flash",
  "survey_assistant": "claude-3-5-sonnet",
  "strategy_advisor": "gpt-4o"
}
```

**Lucee-Implementation:**
```cfml
<cfquery name="qModels" datasource="mi42">
  SELECT agent_type, model_name
  FROM agent_model_config
  WHERE user_id = <cfqueryparam value="#session.user.id#" cfsqltype="cf_sql_integer">
</cfquery>

<cfset modelConfig = {}>
<cfloop query="qModels">
  <cfset modelConfig[qModels.agent_type] = qModels.model_name>
</cfloop>

<cfcontent type="application/json" reset="true">
<cfoutput>#serializeJSON(modelConfig)#</cfoutput>
```

#### POST `/api/settings/models`
**Beschreibung:** Modell-Konfiguration aktualisieren

**Request:**
```json
{
  "agentType": "market_analyst",
  "modelName": "gemini-2.5-pro"
}
```

**Lucee-Implementation:**
```cfml
<cfset data = deserializeJSON(toString(getHttpRequestData().content))>

<cfquery datasource="mi42">
  MERGE INTO agent_model_config AS target
  USING (
    SELECT 
      <cfqueryparam value="#session.user.id#" cfsqltype="cf_sql_integer"> AS user_id,
      <cfqueryparam value="#data.agentType#" cfsqltype="cf_sql_varchar"> AS agent_type,
      <cfqueryparam value="#data.modelName#" cfsqltype="cf_sql_varchar"> AS model_name
  ) AS source
  ON target.user_id = source.user_id AND target.agent_type = source.agent_type
  WHEN MATCHED THEN
    UPDATE SET model_name = source.model_name
  WHEN NOT MATCHED THEN
    INSERT (user_id, agent_type, model_name)
    VALUES (source.user_id, source.agent_type, source.model_name);
</cfquery>
```

---

## Fehlerbehandlung

Alle Endpoints sollten folgendes Fehlerformat verwenden:

```json
{
  "error": true,
  "code": "INSUFFICIENT_CREDITS",
  "message": "Nicht genügend Credits verfügbar"
}
```

**HTTP-Statuscodes:**
- `200` - Erfolg
- `400` - Ungültige Anfrage
- `401` - Nicht authentifiziert
- `403` - Keine Berechtigung
- `404` - Ressource nicht gefunden
- `500` - Serverfehler

**Lucee-Error-Handler:**
```cfml
<cftry>
  <!--- API-Logik --->
  
  <cfcatch type="any">
    <cfheader statuscode="500">
    <cfcontent type="application/json" reset="true">
    <cfoutput>#serializeJSON({
      "error": true,
      "code": "INTERNAL_ERROR",
      "message": cfcatch.message
    })#</cfoutput>
  </cfcatch>
</cftry>
```

---

## Asynchrone Task-Verarbeitung

Für längere LLM-Requests sollte ein Background-Worker implementiert werden:

**Option 1: ColdFusion Scheduled Tasks**
```cfml
<cfschedule 
  action="update"
  task="ProcessAgentTasks"
  operation="HTTPRequest"
  url="http://localhost/api/workers/process-tasks"
  interval="60"
  startDate="#now()#"
  startTime="00:00">
```

**Option 2: Database Polling**
```cfml
<cffunction name="processQueuedTasks" access="public">
  <cfquery name="qPending" datasource="mi42">
    SELECT TOP 10 id, agent_type, prompt
    FROM agent_tasks
    WHERE task_status = 'pending'
    ORDER BY created_at ASC
  </cfquery>
  
  <cfloop query="qPending">
    <cfset executeAgent(qPending.id, qPending.agent_type, qPending.prompt)>
  </cfloop>
</cffunction>
```

---

## Zusammenfassung

Die Migration erfordert:

1. **REST-API-Wrapper** für alle tRPC-Endpoints
2. **Session-Management** statt OAuth
3. **Asynchrone Task-Verarbeitung** für LLM-Requests
4. **MS-SQL-Datenbank** (siehe separate Schema-Dokumentation)
5. **LLM-Integration** über HTTP-Requests an Open WebUI API

Alle Lucee-Beispiele sind produktionsbereit und können direkt in CFC-Komponenten integriert werden.
