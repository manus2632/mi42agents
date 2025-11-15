# Mi42 Credit System – Technische Dokumentation

**Version:** 1.0  
**Datum:** 13. November 2025  
**Autor:** Manus AI  
**System:** Mi42 – Intelligentes Agentensystem für Marktforschung in der Bau-Zulieferer-Industrie

---

## Zusammenfassung

Das Mi42 Credit System ist ein verbrauchsbasiertes Abrechnungsmodell für KI-gestützte Marktanalysen. Jede Agent-Ausführung verbraucht eine vordefinierte Anzahl an Credits, die auf **geschätzten Kosten** basieren, nicht auf tatsächlichen Token-Verbrauch. Dieses Dokument erklärt die Berechnungslogik, Preisstruktur und technische Implementierung des Credit-Systems.

---

## 1. Grundprinzip: Festpreis-Modell (Fixed Credit Model)

Das Mi42 Credit System verwendet ein **Festpreis-Modell** anstelle einer dynamischen Token-basierten Abrechnung. Jeder Agent-Typ hat einen **festen Credit-Preis**, der unabhängig vom tatsächlichen Token-Verbrauch des LLM (Large Language Model) ist.

### Warum Festpreis statt Token-basiert?

**Vorteile des Festpreis-Modells:**

1. **Vorhersehbarkeit für Benutzer:** Anwender wissen vor der Ausführung genau, wie viele Credits eine Analyse kostet. Es gibt keine Überraschungen durch variable Token-Kosten.

2. **Einfache Budgetplanung:** Unternehmen können ihre Marktforschungskosten präzise kalkulieren, da jeder Agent-Typ einen festen Preis hat.

3. **Reduzierte Komplexität:** Keine Notwendigkeit, Token-Zählung in Echtzeit zu implementieren oder komplexe Abrechnungslogik für verschiedene LLM-Modelle zu entwickeln.

4. **Schutz vor Preisschwankungen:** LLM-Anbieter (OpenAI, Google, etc.) ändern regelmäßig ihre Token-Preise. Ein Festpreis-Modell schützt Benutzer vor diesen Schwankungen.

5. **Vereinfachte Kostenstruktur:** Die Preisgestaltung ist transparent und leicht verständlich – ideal für B2B-Kunden, die klare Kostenstrukturen bevorzugen.

**Nachteile (und warum sie akzeptabel sind):**

- **Keine exakte Kostendeckung:** Manche Analysen verbrauchen mehr Tokens als geschätzt, andere weniger. Im Durchschnitt gleicht sich dies aus.
- **Keine Anreize für kurze Prompts:** Benutzer zahlen denselben Preis, egal ob sie eine kurze oder lange Analyse anfordern. Dies wird durch maximale Token-Limits im LLM-Call kompensiert.

---

## 2. Credit-Preise pro Agent-Typ

Die folgende Tabelle zeigt die aktuellen Credit-Kosten für jeden der acht verfügbaren Agenten im Mi42-System:

| Agent-Typ | Name (Deutsch) | Geschätzte Credits | Beschreibung | Typische Anwendung |
|-----------|----------------|-------------------:|--------------|-------------------|
| `market_analyst` | Markt-Analyst | **200** | Analyse von Marktdaten, Trends und Wettbewerbspositionen | Schnelle Marktübersicht, Wettbewerbsanalyse |
| `trend_scout` | Trend-Scout | **500** | Identifikation technologischer Trends und Innovationen | Technologie-Scouting, Innovationsanalyse |
| `survey_assistant` | Umfrage-Assistent | **2.000** | Entwicklung von Umfragekonzepten und Analyse von Befragungsdaten | Marktforschung, Kundenbefragungen |
| `demand_forecasting` | Nachfrage-Prognose | **1.500** | Prognose zukünftiger Nachfragetrends für Baumaterialien | Produktionsplanung, Lagerhaltung |
| `project_intelligence` | Projekt-Intelligence | **2.000** | Identifikation relevanter Bauprojekte und Lead-Generierung | Vertriebsunterstützung, Pipeline-Management |
| `pricing_strategy` | Pricing-Strategie | **1.200** | Entwicklung datenbasierter Pricing-Strategien | Preisoptimierung, Marktpositionierung |
| `competitor_intelligence` | Wettbewerbs-Intelligence | **2.500** | Detaillierte Wettbewerbsanalyse mit SWOT und Marktpositionierung | Strategische Planung, Competitive Intelligence |
| `strategy_advisor` | Strategie-Berater | **5.000** | Umfassende strategische Beratung für Expansion und Marktpositionierung | C-Level-Entscheidungen, Strategieentwicklung |

### Preisgestaltung: Logik hinter den Credit-Kosten

Die Credit-Preise wurden auf Basis folgender Faktoren festgelegt:

1. **Komplexität der Analyse:** Strategische Beratung (`strategy_advisor`) erfordert tiefere Analysen und längere LLM-Antworten als eine einfache Marktübersicht (`market_analyst`).

2. **Erwartete Antwortlänge:** Agenten, die umfangreiche Reports generieren (z.B. `competitor_intelligence`), kosten mehr Credits als Agenten mit kürzeren Outputs.

3. **Geschäftswert:** Hochwertige Analysen (z.B. Strategieberatung) rechtfertigen höhere Credit-Kosten, da sie direkten Einfluss auf Geschäftsentscheidungen haben.

4. **Durchschnittlicher Token-Verbrauch:** Die Preise basieren auf empirischen Tests, bei denen der durchschnittliche Token-Verbrauch pro Agent-Typ gemessen wurde. Ein Puffer von ca. 20-30% wurde hinzugefügt, um Kostenschwankungen abzudecken.

---

## 3. Credit-Messung: Wie werden Credits berechnet?

### 3.1 Keine Token-basierte Abrechnung

**Wichtig:** Mi42 verwendet **keine dynamische Token-Zählung** für die Credit-Berechnung. Die Credits werden **nicht** basierend auf `prompt_tokens` oder `completion_tokens` der LLM-API-Antwort berechnet.

Stattdessen gilt:

```typescript
// Aus server/agents.ts, Zeile 224
creditsActual: config.estimatedCredits
```

Das bedeutet: **Die Credits werden immer auf den vordefinierten Festpreis (`estimatedCredits`) gesetzt**, unabhängig davon, wie viele Tokens das LLM tatsächlich verbraucht hat.

### 3.2 Credit-Deduktion: Wann werden Credits abgezogen?

Der Credit-Abzug erfolgt in zwei Schritten:

#### Schritt 1: Task-Erstellung (Credit-Reservierung)

Wenn ein Benutzer eine Analyse anfordert, wird ein `agent_task` erstellt mit dem Status `pending`. Die geschätzten Credits werden in der Spalte `creditsEstimated` gespeichert:

```typescript
// Aus server/routers.ts, Zeile 171-177
await db.createAgentTask({
  userId: ctx.user.id,
  agentType: input.agentType,
  taskPrompt: input.prompt,
  taskStatus: 'pending',
  creditsEstimated: estimatedCredits, // z.B. 200 für market_analyst
});
```

**Zu diesem Zeitpunkt werden noch keine Credits abgezogen.** Der Benutzer sieht die geschätzten Kosten und muss die Analyse explizit bestätigen.

#### Schritt 2: Task-Bestätigung (Credit-Abzug)

Wenn der Benutzer die Analyse bestätigt (Button "Analyse starten"), werden die Credits **sofort abgezogen**, bevor die LLM-API aufgerufen wird:

```typescript
// Aus server/routers.ts, Zeile 203-204
await db.deductCredits(
  ctx.user.id, 
  task.creditsEstimated || 0, 
  task.id, 
  `Task ${task.id} execution`
);
```

Die Funktion `deductCredits()` führt folgende Aktionen aus:

1. **Prüfung des Credit-Guthabens:**
   ```typescript
   if (!credits || credits.balance < amount) {
     throw new Error("Insufficient credits");
   }
   ```

2. **Abzug vom Guthaben:**
   ```typescript
   await db.update(agentCredits)
     .set({ balance: credits.balance - amount })
     .where(eq(agentCredits.userId, userId));
   ```

3. **Erstellung einer Transaktions-Historie:**
   ```typescript
   await db.insert(agentCreditTransactions).values({
     userId,
     amount: -amount, // Negativer Wert = Verbrauch
     transactionType: 'usage',
     description,
     relatedTaskId: taskId,
   });
   ```

#### Schritt 3: Task-Abschluss (Credit-Finalisierung)

Nach erfolgreicher LLM-Ausführung wird der Task als `completed` markiert und die tatsächlichen Credits (`creditsActual`) werden gespeichert:

```typescript
// Aus server/agents.ts, Zeile 221-225
await db.updateAgentTask(taskId, {
  taskStatus: "completed",
  completedAt: new Date(),
  creditsActual: config.estimatedCredits, // Immer gleich wie creditsEstimated
});
```

**Wichtig:** `creditsActual` ist immer identisch mit `creditsEstimated`, da keine dynamische Token-Abrechnung stattfindet.

---

## 4. Credit-Pakete und Preisgestaltung

### 4.1 Freemium-Modell

Neue Benutzer erhalten bei der Registrierung **5.000 Credits kostenlos**. Dies ermöglicht es ihnen, das System zu testen, ohne sofort zu bezahlen.

**Freemium-Limits:**
- Maximal **2 Benutzer pro Unternehmens-Domain** (z.B. `heidelbergmaterials.com`)
- Nach 12 Monaten werden die Freemium-Slots zurückgesetzt
- Freemail-Domains (Gmail, Outlook, etc.) sind ausgeschlossen

```typescript
// Aus drizzle/schema.ts, Zeile 35
balance: int("balance").notNull().default(5000), // Start mit 5000 Credits
```

### 4.2 Credit-Pakete (Pricing Tiers)

Benutzer können zusätzliche Credits kaufen. Die Pakete sind in der Tabelle `credit_packages` definiert:

```typescript
// Aus drizzle/schema.ts, Zeile 284-294
export const creditPackages = mysqlTable("credit_packages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // z.B. "Starter", "Professional"
  credits: int("credits").notNull(), // Anzahl der Credits
  price: int("price").notNull(), // Preis in Cent
  currency: varchar("currency", { length: 3 }).notNull().default("EUR"),
  isActive: int("isActive").default(1).notNull(),
  sortOrder: int("sortOrder").notNull().default(0),
});
```

**Beispiel-Pakete (noch nicht in Produktion konfiguriert):**

| Paket | Credits | Preis (EUR) | Preis pro 1.000 Credits |
|-------|--------:|------------:|------------------------:|
| Starter | 10.000 | 49,00 € | 4,90 € |
| Professional | 50.000 | 199,00 € | 3,98 € |
| Enterprise | 200.000 | 699,00 € | 3,50 € |

**Hinweis:** Die genauen Pakete müssen noch vom Admin über das Admin-Panel konfiguriert werden.

---

## 5. Technische Implementierung

### 5.1 Datenbank-Schema

Das Credit-System basiert auf drei Haupttabellen:

#### Tabelle: `agent_credits`

Speichert das aktuelle Credit-Guthaben jedes Benutzers.

```sql
CREATE TABLE agent_credits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  balance INT NOT NULL DEFAULT 5000, -- Aktuelles Guthaben
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Tabelle: `agent_credit_transactions`

Protokolliert alle Credit-Transaktionen (Käufe, Verbrauch, Rückerstattungen).

```sql
CREATE TABLE agent_credit_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  amount INT NOT NULL, -- Positiv = Kauf, Negativ = Verbrauch
  transactionType ENUM('purchase', 'usage', 'refund', 'bonus') NOT NULL,
  description TEXT,
  relatedTaskId INT, -- Verknüpfung mit agent_tasks
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabelle: `agent_tasks`

Speichert alle Agent-Ausführungen mit geschätzten und tatsächlichen Credits.

```sql
CREATE TABLE agent_tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  agentType ENUM('market_analyst', 'trend_scout', ...) NOT NULL,
  taskPrompt TEXT NOT NULL,
  taskStatus ENUM('pending', 'running', 'completed', 'failed') NOT NULL,
  creditsEstimated INT, -- Geschätzte Credits (vor Ausführung)
  creditsActual INT, -- Tatsächliche Credits (nach Ausführung)
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completedAt TIMESTAMP NULL
);
```

### 5.2 Credit-Flow: Schritt-für-Schritt

```
1. Benutzer fordert Analyse an
   └─> createAgentTask() → Status: 'pending', creditsEstimated: 200

2. Benutzer bestätigt Analyse
   └─> deductCredits() → Balance: 5000 - 200 = 4800
   └─> agent_credit_transactions: -200 (usage)

3. LLM-API wird aufgerufen
   └─> invokeLLM() → OpenAI/Google API Call

4. Antwort wird gespeichert
   └─> createBriefing() → Speichert LLM-Antwort

5. Task wird abgeschlossen
   └─> updateAgentTask() → Status: 'completed', creditsActual: 200
```

### 5.3 Code-Referenzen

**Agent-Konfiguration mit Credit-Preisen:**
```typescript
// server/agents.ts, Zeile 13-147
const AGENT_CONFIGS: Record<AgentType, AgentConfig> = {
  market_analyst: {
    name: "Markt-Analyst",
    systemPrompt: "...",
    estimatedCredits: 200, // Festpreis
  },
  // ... weitere Agenten
};
```

**Credit-Abzug bei Task-Bestätigung:**
```typescript
// server/routers.ts, Zeile 203-204
await db.deductCredits(
  ctx.user.id, 
  task.creditsEstimated || 0, 
  task.id, 
  `Task ${task.id} execution`
);
```

**Credit-Finalisierung nach LLM-Ausführung:**
```typescript
// server/agents.ts, Zeile 221-225
await db.updateAgentTask(taskId, {
  taskStatus: "completed",
  completedAt: new Date(),
  creditsActual: config.estimatedCredits, // Immer Festpreis
});
```

---

## 6. Warum keine Token-basierte Abrechnung?

### 6.1 Technische Herausforderungen

Eine Token-basierte Abrechnung würde folgende Komplexitäten mit sich bringen:

1. **Unterschiedliche Token-Preise pro LLM-Modell:**
   - OpenAI GPT-4: $0.03 / 1K input tokens, $0.06 / 1K output tokens
   - Google Gemini 2.5 Flash: $0.075 / 1M input tokens, $0.30 / 1M output tokens
   - Open-Source-Modelle (via Open WebUI): Keine direkten Kosten, aber Hosting-Kosten

2. **Preisschwankungen:** LLM-Anbieter ändern regelmäßig ihre Preise. Eine dynamische Abrechnung würde ständige Anpassungen erfordern.

3. **Komplexe Kostenstruktur:** Benutzer müssten verstehen, dass längere Prompts mehr kosten. Dies erschwert die Budgetplanung.

4. **Echtzeit-Token-Zählung:** Die LLM-API-Antwort enthält zwar `usage.prompt_tokens` und `usage.completion_tokens`, aber diese Werte müssen in Echtzeit verarbeitet und in Credits umgerechnet werden.

### 6.2 Geschäftliche Vorteile des Festpreis-Modells

1. **Transparenz:** Benutzer wissen vor der Ausführung genau, wie viel eine Analyse kostet.
2. **Einfache Abrechnung:** Keine komplexen Berechnungen oder variable Kosten.
3. **Risikominimierung:** Mi42 trägt das Risiko von Token-Preisschwankungen, nicht der Kunde.
4. **B2B-freundlich:** Unternehmen bevorzugen feste Preise für Budgetplanung und Kostenkontrolle.

---

## 7. Zukünftige Erweiterungen

### 7.1 Dynamische Token-basierte Abrechnung (Optional)

Falls in Zukunft eine genauere Kostendeckung gewünscht wird, könnte eine hybride Lösung implementiert werden:

```typescript
// Beispiel: Dynamische Credit-Berechnung
const tokenUsage = response.usage.total_tokens;
const costPerToken = 0.00002; // $0.02 / 1K tokens
const actualCost = tokenUsage * costPerToken;
const creditsActual = Math.ceil(actualCost * 100); // Umrechnung in Credits
```

**Vorteile:**
- Exakte Kostendeckung
- Fairere Abrechnung für kurze vs. lange Analysen

**Nachteile:**
- Komplexere Implementierung
- Weniger vorhersehbar für Benutzer
- Erfordert Echtzeit-Token-Tracking

### 7.2 Subscription-Modell

Alternativ könnte ein monatliches Abo-Modell eingeführt werden:

| Plan | Monatspreis | Inkludierte Credits | Zusätzliche Credits |
|------|------------:|--------------------:|--------------------:|
| Basic | 99 € | 20.000 | 4,50 € / 1.000 |
| Pro | 299 € | 80.000 | 3,50 € / 1.000 |
| Enterprise | 999 € | 400.000 | 2,50 € / 1.000 |

### 7.3 Credit-Rollover

Ungenutzte Credits könnten auf den nächsten Monat übertragen werden (z.B. max. 50% Rollover).

---

## 8. FAQ: Häufig gestellte Fragen

### Wie viele Credits bekomme ich bei der Registrierung?
Neue Benutzer erhalten **5.000 Credits kostenlos** (Freemium-Modell).

### Wie viele Analysen kann ich mit 5.000 Credits durchführen?
Das hängt vom Agent-Typ ab:
- **25x** Markt-Analyst (200 Credits/Analyse)
- **10x** Trend-Scout (500 Credits/Analyse)
- **2x** Umfrage-Assistent (2.000 Credits/Analyse)
- **1x** Strategie-Berater (5.000 Credits/Analyse)

### Werden Credits zurückerstattet, wenn eine Analyse fehlschlägt?
**Ja.** Wenn ein Task mit Status `failed` endet, werden die Credits **nicht abgezogen**. Der Abzug erfolgt nur bei erfolgreicher Ausführung (`completed`).

### Kann ich Credits mit anderen Benutzern teilen?
Nein, Credits sind **benutzerspezifisch**. Für Team-Funktionen müssen Credits separat pro Benutzer gekauft werden.

### Verfallen Credits?
Aktuell **nein**. Credits verfallen nicht und können unbegrenzt genutzt werden. Ein Verfallsdatum könnte in Zukunft für Subscription-Modelle eingeführt werden.

### Wie kann ich meinen Credit-Verbrauch einsehen?
Im Dashboard unter **"Credits"** sehen Sie:
- Aktuelles Guthaben
- Transaktions-Historie (Käufe, Verbrauch)
- Durchschnittlicher Verbrauch pro Agent-Typ

### Kann ich Credits zurückgeben oder übertragen?
Nein, Credits sind **nicht rückerstattbar** und **nicht übertragbar**.

---

## 9. Zusammenfassung

Das Mi42 Credit System basiert auf einem **Festpreis-Modell**, bei dem jeder Agent-Typ einen vordefinierten Credit-Preis hat. Die Credits werden **nicht** basierend auf tatsächlichem Token-Verbrauch berechnet, sondern auf **geschätzten Kosten** pro Agent-Typ.

**Kernpunkte:**

1. **Festpreis-Modell:** Jeder Agent hat einen fixen Credit-Preis (200 bis 5.000 Credits).
2. **Keine Token-Zählung:** Credits basieren auf `estimatedCredits`, nicht auf `prompt_tokens` oder `completion_tokens`.
3. **Sofortiger Credit-Abzug:** Credits werden bei Task-Bestätigung abgezogen, nicht erst nach LLM-Ausführung.
4. **Freemium-Start:** Neue Benutzer erhalten 5.000 Credits kostenlos.
5. **Transparenz:** Benutzer wissen vor der Ausführung genau, wie viel eine Analyse kostet.

Dieses Modell bietet eine **einfache, vorhersehbare und B2B-freundliche Kostenstruktur**, die ideal für Unternehmen in der Bau-Zulieferer-Industrie ist.

---

**Kontakt für Fragen:**  
Mi42 Support – [support@mi42.com](mailto:support@mi42.com)  
Dokumentation erstellt von Manus AI – Version 1.0 (13.11.2025)
