# Mi42 – Erweitertes Freemium-Konzept mit Domain-basiertem Limit

**Version**: 1.1  
**Datum**: November 2025  
**Autor**: Manus AI  
**Status**: Konzept

---

## Executive Summary

Dieses Dokument erweitert das bestehende Registrierungs- und Onboarding-Konzept um ein **intelligentes Domain-basiertes Freemium-System**. Anstatt nur ein Willkommens-Briefing zu erstellen, führt das System beim Onboarding **automatisch alle 7 Agenten aus** mit vorausgefüllten, unternehmensspezifischen Prompts. Dies demonstriert die volle Leistungsfähigkeit der Plattform und maximiert den sofortigen Mehrwert.

Das Freemium-Kontingent ist **domain-basiert limitiert**: Pro Firmen-Domain (z.B. `heidelbergcement.de`) sind nur **2 Freemium-Registrierungen** erlaubt. Der dritte User aus derselben Firma wird darauf hingewiesen, dass das Freemium-Kontingent erschöpft ist, und erhält optional die Information, welche Kollegen bereits registriert sind. Nach **12 Monaten** stehen erneut 2 Freemium-Slots zur Verfügung.

**Kernelemente**:
- **7 kostenlose Analysen** beim Onboarding (alle Agenten mit vorausgefüllten Prompts)
- **Domain-basiertes Limit**: Maximal 2 Freemium-User pro Firma
- **Freemium-Exhaustion-Handling**: Transparente Kommunikation bei 3. Registrierung
- **12-Monats-Reset**: Erneuerung des Freemium-Kontingents
- **Viraler Effekt**: Kollegen-Identifikation fördert interne Empfehlungen

---

## 1. Erweitertes Onboarding mit automatischen Analysen

### 1.1 Konzept

Statt nur ein Willkommens-Briefing zu erstellen, führt das System beim Onboarding **alle 7 Agenten automatisch aus**. Jeder Agent erhält einen **vorausgefüllten, unternehmensspezifischen Prompt**, der auf den Informationen aus der Website-Analyse basiert.

**Rationale**:

**Maximaler Sofort-Mehrwert**: Der User erhält nicht nur ein generisches Briefing, sondern **7 konkrete, actionable Analysen** zu verschiedenen Aspekten seines Geschäfts. Dies demonstriert die volle Bandbreite der Plattform und erhöht die Wahrscheinlichkeit, dass mindestens eine Analyse hochrelevant ist.

**Differentierung**: Kein Wettbewerber bietet ein derart umfassendes Freemium-Erlebnis. Dies positioniert Mi42 als Premium-Produkt, das Vertrauen durch Großzügigkeit aufbaut.

**Viralität**: User werden ihre Kollegen auf die wertvollen Analysen hinweisen, was zu organischem Wachstum führt. Die Domain-Limitierung verstärkt diesen Effekt, da Kollegen sich beeilen werden, einen der 2 Freemium-Slots zu sichern.

**Qualifizierung**: Nur User, die tatsächlich Mehrwert in den Analysen sehen, werden zu zahlenden Kunden. Die 7 kostenlosen Analysen fungieren als umfassende "Testfahrt".

### 1.2 Automatische Agent-Vorausfüllung

Basierend auf der Website-Analyse (siehe Kapitel 2 des Hauptkonzepts) erstellt das System für jeden der 7 Agenten einen **personalisierten Prompt**:

| Agent | Vorausgefüllter Prompt (Beispiel: HeidelbergCement) |
|-------|---------------------------------------------------|
| **Market Analyst** | "Analysiere den deutschen Markt für Zement und Transportbeton. Identifiziere Marktgröße, Wachstumsprognosen und Hauptwettbewerber (Holcim, Cemex, CRH). Bewerte Marktanteile und strategische Positionierung." |
| **Trend Scout** | "Identifiziere aktuelle Trends im Zement- und Betonmarkt mit Fokus auf CO₂-Reduktion, nachhaltige Baustoffe und Kreislaufwirtschaft. Analysiere regulatorische Entwicklungen (EU Green Deal, CO₂-Bepreisung)." |
| **Survey Assistant** | "Erstelle eine Umfrage für Bauunternehmen und Fertigteilwerke zur Zahlungsbereitschaft für CO₂-reduzierten Zement. Zielgruppe: Einkaufsleiter und Projektleiter in Deutschland." |
| **Strategy Consultant** | "Entwickle strategische Empfehlungen für HeidelbergCement zur Stärkung der Marktposition im Bereich nachhaltige Baustoffe. Berücksichtige Wettbewerbsdruck von Holcim und Cemex sowie regulatorische Anforderungen." |
| **Demand Forecasting** | "Prognostiziere die Nachfrage für Zement und Transportbeton in Deutschland für die nächsten 12 Monate. Berücksichtige saisonale Muster, Baukonjunktur und Infrastrukturprojekte." |
| **Project Intelligence** | "Identifiziere laufende und geplante Großbauprojekte in Deutschland (Wohnungsbau, Infrastruktur, Gewerbe), die potenzielle Abnehmer für Zement und Transportbeton sind. Schätze Projektvolumen und Lieferantenbedarf." |
| **Pricing Strategy** | "Analysiere die aktuelle Preisstrategie für Transportbeton in Deutschland. Vergleiche mit Wettbewerbern (Holcim, Cemex) und empfehle Optimierungen basierend auf Marktdaten und Preiselastizität." |

**Prompt-Generierung (LLM-basiert)**:

Das System nutzt einen Meta-Agenten, der basierend auf der Website-Analyse für jeden Agenten einen passenden Prompt generiert:

```
Meta-Prompt für Prompt-Generierung:

Firmeninformationen:
- Name: HeidelbergCement AG
- Branche: Baustoffhersteller – Zement und Beton
- Produkte: Zement, Transportbeton, Zuschlagstoffe, Asphalt
- Zielgruppen: Bauunternehmen, Fertigteilwerke, Straßenbau
- Geografischer Fokus: Deutschland, Europa, Nordamerika
- Besonderheiten: Marktführer in Europa, Fokus auf CO₂-Reduktion
- Wettbewerber: Holcim, Cemex, CRH

Aufgabe:
Erstelle für jeden der folgenden 7 Agenten einen personalisierten, actionable Prompt, der auf die spezifische Situation von HeidelbergCement zugeschnitten ist:

1. Market Analyst (Marktanalyse)
2. Trend Scout (Trend-Identifikation)
3. Survey Assistant (Umfrageerstellung)
4. Strategy Consultant (Strategieberatung)
5. Demand Forecasting Agent (Nachfrageprognose)
6. Project Intelligence Agent (Projektanalyse)
7. Pricing Strategy Agent (Preisstrategie)

Jeder Prompt sollte:
- Konkret und spezifisch sein (keine generischen Formulierungen)
- Auf die Produkte und Märkte des Unternehmens eingehen
- Wettbewerber namentlich nennen
- Actionable Insights fordern (keine reine Beschreibung)
- 2-3 Sätze lang sein

Format: JSON
{
  "market_analyst": "...",
  "trend_scout": "...",
  "survey_assistant": "...",
  "strategy_consultant": "...",
  "demand_forecasting": "...",
  "project_intelligence": "...",
  "pricing_strategy": "..."
}
```

### 1.3 Automatische Analyse-Ausführung

Nach der Prompt-Generierung startet das System **parallel alle 7 Agenten**:

**Technische Umsetzung**:

```typescript
// server/onboardingService.ts
export async function executeOnboardingAnalyses(
  userId: number,
  companyProfile: CompanyProfile
) {
  // 1. Generate personalized prompts for all agents
  const prompts = await generateAgentPrompts(companyProfile);

  // 2. Execute all 7 agents in parallel
  const analysisPromises = Object.entries(prompts).map(([agentType, prompt]) =>
    executeAgent({
      userId,
      agentType: agentType as AgentType,
      prompt,
      isFreemium: true, // Mark as freemium (no credit charge)
    })
  );

  // 3. Wait for all analyses to complete (with timeout)
  const results = await Promise.allSettled(analysisPromises);

  // 4. Store results in database
  const completedAnalyses = results
    .filter((r) => r.status === 'fulfilled')
    .map((r) => (r as PromiseFulfilledResult<Analysis>).value);

  return {
    totalAnalyses: 7,
    completedAnalyses: completedAnalyses.length,
    failedAnalyses: 7 - completedAnalyses.length,
    analyses: completedAnalyses,
  };
}
```

**Execution-Flow**:

```
Onboarding-Start
  ↓
Website-Analyse (30-60s)
  ↓
Wettbewerber-Identifikation (20-30s)
  ↓
Prompt-Generierung für alle 7 Agenten (10-20s)
  ↓
Parallele Ausführung aller 7 Agenten (120-180s)
  ├─ Market Analyst (30-40s)
  ├─ Trend Scout (25-35s)
  ├─ Survey Assistant (20-30s)
  ├─ Strategy Consultant (40-50s)
  ├─ Demand Forecasting (25-35s)
  ├─ Project Intelligence (35-45s)
  └─ Pricing Strategy (30-40s)
  ↓
Willkommens-Dashboard mit allen 7 Analysen (sofort verfügbar)
  ↓
Onboarding abgeschlossen (Gesamt: 3-5 Minuten)
```

**Parallele Ausführung**: Durch die parallele Ausführung dauert das Onboarding nur **3-5 Minuten** statt 3-4 Stunden (wenn sequenziell).

**Fehlerbehandlung**: Falls einzelne Agenten fehlschlagen (z.B. wegen Timeout oder LLM-Fehler), werden die erfolgreichen Analysen trotzdem angezeigt. Der User erhält eine Benachrichtigung über fehlgeschlagene Analysen mit der Option, diese später manuell zu wiederholen.

### 1.4 Onboarding-Dashboard

Nach Abschluss des Onboardings wird der User zu einem **Willkommens-Dashboard** weitergeleitet, das alle 7 Analysen präsentiert:

```
┌─────────────────────────────────────────────────────────────────┐
│  🎉 Willkommen bei Mi42, HeidelbergCement!                      │
│                                                                   │
│  Wir haben 7 personalisierte Analysen für Sie erstellt:         │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ✅ Market Analyst                                       │    │
│  │    "Deutscher Markt für Zement und Transportbeton"      │    │
│  │    [Analyse ansehen]                                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ✅ Trend Scout                                          │    │
│  │    "Trends: CO₂-Reduktion und nachhaltige Baustoffe"   │    │
│  │    [Analyse ansehen]                                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ✅ Survey Assistant                                     │    │
│  │    "Umfrage: Zahlungsbereitschaft für CO₂-Zement"      │    │
│  │    [Analyse ansehen]                                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ... (4 weitere Analysen)                                       │
│                                                                   │
│  Diese Analysen wurden kostenlos für Sie erstellt.              │
│  Weitere Analysen kosten Credits.                               │
│                                                                   │
│  [Alle Analysen durchsehen]  [Neue Analyse starten]            │
└─────────────────────────────────────────────────────────────────┘
```

**Analyse-Karten**: Jede Analyse wird als Card dargestellt mit:
- Agent-Name und Icon
- Kurzbeschreibung (erster Satz der Analyse)
- Status (✅ Erfolgreich / ⏳ In Bearbeitung / ❌ Fehlgeschlagen)
- CTA-Button ("Analyse ansehen")

**Sortierung**: Analysen werden nach Relevanz sortiert (basierend auf LLM-Bewertung der Wichtigkeit für das Unternehmen).

### 1.5 Credit-Handling für Freemium-Analysen

Die 7 automatischen Onboarding-Analysen sind **komplett kostenlos** und verbrauchen **keine Credits**:

**Datenbank-Markierung**:
```sql
-- agent_tasks table
INSERT INTO agent_tasks (
  userId,
  agentType,
  taskPrompt,
  taskStatus,
  creditsEstimated,
  creditsActual,
  isFreemium  -- NEW COLUMN
) VALUES (
  123,
  'market_analyst',
  'Analysiere den deutschen Markt für Zement...',
  'completed',
  2000,
  0,  -- No credits charged
  TRUE  -- Mark as freemium
);
```

**Credit-Transaktions-Log**:
```sql
-- agent_credit_transactions table
-- NO ENTRY for freemium analyses (no credits deducted)
```

**User-Interface**:
- Freemium-Analysen werden mit einem Badge "Kostenlos" markiert
- Im Credit-Verlauf erscheinen sie nicht (keine Transaktion)
- Im Task-Verlauf sind sie mit "Freemium" gekennzeichnet

---

## 2. Domain-basiertes Freemium-Limit

### 2.1 Konzept

Das Freemium-Kontingent ist **pro Firmen-Domain** limitiert, nicht pro User. Jede Domain (z.B. `heidelbergcement.de`) hat ein Kontingent von **2 Freemium-Registrierungen**.

**Rationale**:

**Viraler Effekt**: Wenn der erste User begeistert ist, wird er Kollegen empfehlen. Diese können sich ebenfalls kostenlos registrieren (bis zu 2 User total). Ab dem dritten User muss die Firma zahlen, was zu Enterprise-Deals führt.

**Missbrauchsschutz**: Verhindert, dass einzelne User mehrere Accounts mit unterschiedlichen Email-Adressen erstellen, um unbegrenzt Freemium-Analysen zu erhalten.

**Qualifizierung**: Firmen, die 3+ Mitarbeiter registrieren wollen, sind ernsthaft interessiert und bereit zu zahlen.

**Transparenz**: Durch die Information, welche Kollegen bereits registriert sind, wird interne Kommunikation gefördert ("Ah, Max hat sich auch schon registriert – ich frage ihn mal nach seinen Erfahrungen").

### 2.2 Freemium-Tracking

**Datenbank-Schema**:

```sql
-- New table: domain_freemium_tracking
CREATE TABLE domain_freemium_tracking (
  id INT AUTO_INCREMENT PRIMARY KEY,
  domain VARCHAR(255) NOT NULL UNIQUE,
  freemiumUsersCount INT DEFAULT 0,
  freemiumLimit INT DEFAULT 2,
  lastResetAt TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_domain (domain)
);

-- New table: domain_freemium_users (tracks which users used freemium slots)
CREATE TABLE domain_freemium_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  domain VARCHAR(255) NOT NULL,
  userId INT NOT NULL,
  userEmail VARCHAR(320) NOT NULL,
  userName TEXT,
  registeredAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  INDEX idx_domain (domain),
  INDEX idx_user (userId)
);
```

**Registrierungs-Flow mit Freemium-Check**:

```typescript
// server/auth.ts
export async function registerUser(data: {
  email: string;
  password: string;
  companyName: string;
}) {
  // 1. Extract domain from email
  const domain = extractDomain(data.email); // e.g., "heidelbergcement.de"

  // 2. Check freemium availability
  const freemiumStatus = await checkFreemiumAvailability(domain);

  if (!freemiumStatus.available) {
    // Domain has exhausted freemium slots
    return {
      success: false,
      error: 'freemium_exhausted',
      existingUsers: freemiumStatus.existingUsers, // List of existing freemium users
      message: `Ihre Firma hat bereits ${freemiumStatus.usedSlots} von ${freemiumStatus.limit} Freemium-Registrierungen genutzt.`,
    };
  }

  // 3. Create user account
  const user = await createUser({
    email: data.email,
    passwordHash: await hashPassword(data.password),
    role: 'external',
    isFreemiumUser: true, // Mark as freemium user
  });

  // 4. Track freemium usage
  await trackFreemiumUsage({
    domain,
    userId: user.id,
    userEmail: data.email,
    userName: data.companyName,
  });

  // 5. Add initial credits (5000 for manual analyses)
  await addCreditsToUser(user.id, 5000);

  return { success: true, user };
}

async function checkFreemiumAvailability(domain: string) {
  const tracking = await db
    .select()
    .from(domainFreemiumTracking)
    .where(eq(domainFreemiumTracking.domain, domain))
    .limit(1);

  if (!tracking.length) {
    // Domain not yet tracked → available
    return { available: true, usedSlots: 0, limit: 2 };
  }

  const record = tracking[0];

  // Check if 12 months have passed since last reset
  const now = new Date();
  const lastReset = record.lastResetAt || record.createdAt;
  const monthsSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24 * 30);

  if (monthsSinceReset >= 12) {
    // Reset freemium counter
    await db
      .update(domainFreemiumTracking)
      .set({
        freemiumUsersCount: 0,
        lastResetAt: now,
      })
      .where(eq(domainFreemiumTracking.domain, domain));

    return { available: true, usedSlots: 0, limit: record.freemiumLimit };
  }

  // Check if slots available
  const available = record.freemiumUsersCount < record.freemiumLimit;

  if (!available) {
    // Get existing freemium users for this domain
    const existingUsers = await db
      .select()
      .from(domainFreemiumUsers)
      .where(eq(domainFreemiumUsers.domain, domain));

    return {
      available: false,
      usedSlots: record.freemiumUsersCount,
      limit: record.freemiumLimit,
      existingUsers: existingUsers.map((u) => ({
        email: u.userEmail,
        name: u.userName,
        registeredAt: u.registeredAt,
      })),
    };
  }

  return {
    available: true,
    usedSlots: record.freemiumUsersCount,
    limit: record.freemiumLimit,
  };
}

async function trackFreemiumUsage(data: {
  domain: string;
  userId: number;
  userEmail: string;
  userName: string;
}) {
  // 1. Upsert domain tracking
  await db
    .insert(domainFreemiumTracking)
    .values({
      domain: data.domain,
      freemiumUsersCount: 1,
    })
    .onDuplicateKeyUpdate({
      set: {
        freemiumUsersCount: sql`freemiumUsersCount + 1`,
      },
    });

  // 2. Track user
  await db.insert(domainFreemiumUsers).values({
    domain: data.domain,
    userId: data.userId,
    userEmail: data.userEmail,
    userName: data.userName,
  });
}
```

### 2.3 Freemium-Exhaustion-Handling

Wenn ein User versucht, sich zu registrieren, aber die Domain bereits 2 Freemium-Slots genutzt hat, wird eine spezielle Seite angezeigt:

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚠️ Freemium-Kontingent erschöpft                               │
│                                                                   │
│  Ihre Firma (heidelbergcement.de) hat bereits 2 Freemium-       │
│  Registrierungen genutzt.                                        │
│                                                                   │
│  Folgende Kollegen haben sich bereits registriert:              │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 1. Max Mustermann (max.mustermann@heidelbergcement.de) │    │
│  │    Registriert am: 15. Oktober 2025                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 2. Anna Schmidt (anna.schmidt@heidelbergcement.de)     │    │
│  │    Registriert am: 3. November 2025                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  Möchten Sie diese Kollegen kontaktieren?                       │
│  [Ja, zeige mir ihre Kontaktdaten]  [Nein, danke]              │
│                                                                   │
│  ───────────────────────────────────────────────────────────    │
│                                                                   │
│  Oder registrieren Sie sich jetzt als zahlender Kunde:          │
│                                                                   │
│  ✓ Alle 7 Agenten unbegrenzt nutzen                             │
│  ✓ Automatisierte Daily/Weekly Briefings                        │
│  ✓ Team-Kollaboration                                           │
│                                                                   │
│  [Jetzt kostenpflichtig registrieren]                           │
│                                                                   │
│  Oder warten Sie bis: 15. Oktober 2026                          │
│  (12 Monate nach erster Registrierung)                          │
│  Dann stehen erneut 2 Freemium-Slots zur Verfügung.            │
└─────────────────────────────────────────────────────────────────┘
```

**Privacy-Option**: Der User kann wählen, ob er die Kontaktdaten der bestehenden Freemium-User sehen möchte. Falls ja, werden Email-Adressen und Namen angezeigt. Falls nein, wird nur die Anzahl angezeigt ("2 Kollegen haben sich bereits registriert").

**Conversion-Optimierung**: Die Seite bietet drei Optionen:
1. **Kollegen kontaktieren**: Fördert interne Kommunikation und potenzielle Team-Nutzung
2. **Kostenpflichtig registrieren**: Direkter Upsell zu Paid-Plan
3. **Warten bis Reset**: Zeigt Transparenz und Fairness

### 2.4 Kostenpflichtige Registrierung (3. User)

Wenn der 3. User sich kostenpflichtig registrieren möchte, wird er zu einem **vereinfachten Checkout** geleitet:

**Option 1: Sofort-Kauf (Credit-Paket)**
```
┌─────────────────────────────────────────────────────────────────┐
│  Registrierung als zahlender Kunde                              │
│                                                                   │
│  Wählen Sie ein Credit-Paket:                                   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ○ Starter        10.000 Credits    80 €                │    │
│  │ ● Professional   50.000 Credits    350 € [EMPFOHLEN]   │    │
│  │ ○ Enterprise     200.000 Credits   1.200 €             │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  Nach der Zahlung erhalten Sie:                                 │
│  ✓ 7 kostenlose Onboarding-Analysen (wie Freemium)             │
│  ✓ Gekaufte Credits für weitere Analysen                        │
│  ✓ Zugriff auf alle Features                                    │
│                                                                   │
│  [Weiter zur Zahlung]                                           │
└─────────────────────────────────────────────────────────────────┘
```

**Option 2: Subscription**
```
┌─────────────────────────────────────────────────────────────────┐
│  Oder wählen Sie ein monatliches Abonnement:                    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ○ Basic      99 €/Monat    15.000 Credits/Monat       │    │
│  │ ● Pro        299 €/Monat   50.000 Credits/Monat       │    │
│  │ ○ Business   699 €/Monat   150.000 Credits/Monat      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  [Abonnement abschließen]                                       │
└─────────────────────────────────────────────────────────────────┘
```

**Wichtig**: Auch zahlende Kunden erhalten die **7 kostenlosen Onboarding-Analysen**. Dies stellt sicher, dass alle User das gleiche erstklassige Onboarding-Erlebnis haben.

### 2.5 12-Monats-Reset

Nach 12 Monaten seit der ersten Freemium-Registrierung einer Domain wird das Kontingent automatisch zurückgesetzt:

**Automatischer Cron-Job**:
```typescript
// server/cronJobs.ts
import cron from 'node-cron';

// Run daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('[Cron] Checking for freemium resets...');

  const now = new Date();
  const twelveMonthsAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  // Find domains where last reset (or creation) was >12 months ago
  const domainsToReset = await db
    .select()
    .from(domainFreemiumTracking)
    .where(
      sql`(lastResetAt IS NOT NULL AND lastResetAt < ${twelveMonthsAgo}) OR (lastResetAt IS NULL AND createdAt < ${twelveMonthsAgo})`
    );

  for (const domain of domainsToReset) {
    if (domain.freemiumUsersCount >= domain.freemiumLimit) {
      // Reset counter
      await db
        .update(domainFreemiumTracking)
        .set({
          freemiumUsersCount: 0,
          lastResetAt: now,
        })
        .where(eq(domainFreemiumTracking.id, domain.id));

      console.log(`[Cron] Reset freemium for domain: ${domain.domain}`);

      // Optional: Send notification to existing users
      await notifyFreemiumReset(domain.domain);
    }
  }
});

async function notifyFreemiumReset(domain: string) {
  // Get all users from this domain
  const users = await db
    .select()
    .from(domainFreemiumUsers)
    .where(eq(domainFreemiumUsers.domain, domain));

  for (const user of users) {
    // Send email notification
    await sendEmail({
      to: user.userEmail,
      subject: 'Mi42 – Neues Freemium-Kontingent verfügbar',
      body: `
        Gute Nachrichten! Ihre Firma (${domain}) hat wieder 2 Freemium-Registrierungen zur Verfügung.
        
        Empfehlen Sie Mi42 Ihren Kollegen!
        
        [Kollegen einladen]
      `,
    });
  }
}
```

**Email-Benachrichtigung**: Bestehende Freemium-User werden informiert, dass das Kontingent zurückgesetzt wurde. Dies fördert Empfehlungen an neue Kollegen.

---

## 3. Unterscheidung: Freemium vs. Paid Analysen

### 3.1 Klare Abgrenzung

Es ist wichtig, dass User verstehen, welche Analysen kostenlos sind und welche Credits kosten:

| Analyse-Typ | Kosten | Beschreibung |
|-------------|--------|--------------|
| **Onboarding-Analysen** | **0 Credits** | 7 automatische Analysen mit vorausgefüllten Prompts beim Onboarding |
| **Manuelle Analysen** | **1.000-3.000 Credits** | User-initiierte Analysen mit eigenen Prompts |
| **Wiederholungen** | **1.000-3.000 Credits** | Erneute Ausführung eines Agenten (auch mit gleichem Prompt) |

**UI-Markierung**:

```
┌─────────────────────────────────────────────────────────────────┐
│  Ihre Analysen                                                   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ✅ Market Analyst                        [KOSTENLOS]    │    │
│  │    "Deutscher Markt für Zement..."                      │    │
│  │    Erstellt: 12. Nov 2025, 10:15 Uhr                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ✅ Trend Scout                           [KOSTENLOS]    │    │
│  │    "Trends: CO₂-Reduktion..."                           │    │
│  │    Erstellt: 12. Nov 2025, 10:16 Uhr                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ✅ Market Analyst                        [-2.000 Credits]│   │
│  │    "Markt für Asphalt in Bayern"                        │    │
│  │    Erstellt: 15. Nov 2025, 14:30 Uhr                    │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

**Badge-Farben**:
- **[KOSTENLOS]**: Grüner Badge für Freemium-Analysen
- **[-X Credits]**: Roter Badge für kostenpflichtige Analysen

### 3.2 Agent-Ausführungs-UI

Wenn ein User einen Agenten manuell ausführen möchte, wird die Credit-Schätzung prominent angezeigt:

```
┌─────────────────────────────────────────────────────────────────┐
│  Market Analyst                                                  │
│                                                                   │
│  Beschreiben Sie Ihre Analyse-Anfrage:                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Analysiere den Markt für Asphalt in Bayern...          │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  Geschätzte Kosten: 2.000 Credits (ca. 16 €)                   │
│  Ihr Guthaben: 5.000 Credits                                    │
│  Verbleibendes Guthaben nach Analyse: 3.000 Credits            │
│                                                                   │
│  [Analyse starten]  [Abbrechen]                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Transparenz**: User sehen immer, wie viele Credits eine Analyse kostet, bevor sie sie starten.

### 3.3 Credit-Warnung

Wenn ein User nur noch 1.000 Credits hat (genug für maximal 1 weitere Analyse), wird eine Warnung angezeigt:

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚠️ Ihr Guthaben wird knapp                                     │
│                                                                   │
│  Sie haben noch 1.000 Credits. Das reicht für ca. 1 weitere     │
│  Analyse. Laden Sie jetzt Credits auf, um weiter zu arbeiten.   │
│                                                                   │
│  Ihre 7 kostenlosen Onboarding-Analysen können Sie jederzeit    │
│  erneut ansehen – diese verbrauchen keine Credits.              │
│                                                                   │
│  [Credits kaufen]  [Später erinnern]                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Technische Implementierung

### 4.1 Datenbank-Schema-Erweiterungen

```sql
-- Add isFreemiumUser flag to users table
ALTER TABLE users ADD COLUMN isFreemiumUser BOOLEAN DEFAULT FALSE;

-- Add isFreemium flag to agent_tasks table
ALTER TABLE agent_tasks ADD COLUMN isFreemium BOOLEAN DEFAULT FALSE;

-- New table: domain_freemium_tracking
CREATE TABLE domain_freemium_tracking (
  id INT AUTO_INCREMENT PRIMARY KEY,
  domain VARCHAR(255) NOT NULL UNIQUE,
  freemiumUsersCount INT DEFAULT 0,
  freemiumLimit INT DEFAULT 2,
  lastResetAt TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_domain (domain)
);

-- New table: domain_freemium_users
CREATE TABLE domain_freemium_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  domain VARCHAR(255) NOT NULL,
  userId INT NOT NULL,
  userEmail VARCHAR(320) NOT NULL,
  userName TEXT,
  registeredAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  INDEX idx_domain (domain),
  INDEX idx_user (userId)
);
```

### 4.2 Backend-API-Endpoints

```typescript
// server/routers/authRouter.ts
export const authRouter = router({
  // Check freemium availability before registration
  checkFreemiumAvailability: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }) => {
      const domain = extractDomain(input.email);
      return await checkFreemiumAvailability(domain);
    }),

  // Register with freemium check
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        companyName: z.string().min(2),
        acceptPrivacy: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      if (!input.acceptPrivacy) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Datenschutzerklärung muss akzeptiert werden',
        });
      }

      return await registerUser(input);
    }),

  // Get existing freemium users for a domain (for 3rd user)
  getFreemiumUsers: publicProcedure
    .input(z.object({ domain: z.string() }))
    .query(async ({ input }) => {
      return await db
        .select()
        .from(domainFreemiumUsers)
        .where(eq(domainFreemiumUsers.domain, input.domain));
    }),
});
```

### 4.3 Frontend-Komponenten

**Freemium-Exhaustion-Page**:

```typescript
// client/src/pages/FreemiumExhausted.tsx
export function FreemiumExhaustedPage() {
  const { domain } = useParams();
  const { data: existingUsers } = trpc.auth.getFreemiumUsers.useQuery({ domain });

  return (
    <div className="container max-w-2xl py-12">
      <Alert variant="warning">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Freemium-Kontingent erschöpft</AlertTitle>
        <AlertDescription>
          Ihre Firma ({domain}) hat bereits 2 Freemium-Registrierungen genutzt.
        </AlertDescription>
      </Alert>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Bestehende Freemium-User</CardTitle>
        </CardHeader>
        <CardContent>
          {existingUsers?.map((user, idx) => (
            <div key={user.id} className="flex items-center gap-4 py-2">
              <Avatar>
                <AvatarFallback>{user.userName?.[0] || '?'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user.userName}</p>
                <p className="text-sm text-muted-foreground">{user.userEmail}</p>
                <p className="text-xs text-muted-foreground">
                  Registriert am: {new Date(user.registeredAt).toLocaleDateString('de-DE')}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="mt-8 space-y-4">
        <h3 className="text-lg font-semibold">Ihre Optionen:</h3>
        
        <Button asChild className="w-full">
          <Link to="/register/paid">Jetzt kostenpflichtig registrieren</Link>
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Oder warten Sie bis:{' '}
          <strong>{calculateResetDate(existingUsers[0]?.registeredAt)}</strong>
          <br />
          Dann stehen erneut 2 Freemium-Slots zur Verfügung.
        </p>
      </div>
    </div>
  );
}
```

---

## 5. User Journey (Erweitert)

### 5.1 Freemium-User (1. oder 2. aus Firma)

```
Landing Page
  ↓
Registrierung (Email: max@heidelbergcement.de)
  ↓
Domain-Extraktion (heidelbergcement.de)
  ↓
Freemium-Check (0/2 Slots genutzt → ✅ Verfügbar)
  ↓
Email-Verifizierung
  ↓
Account-Erstellung (isFreemiumUser: true)
  ↓
Freemium-Tracking (1/2 Slots genutzt)
  ↓
Automatisches Onboarding:
  ├─ Website-Analyse
  ├─ Wettbewerber-Identifikation
  ├─ Prompt-Generierung (7 Agenten)
  └─ Parallele Ausführung (7 kostenlose Analysen)
  ↓
Willkommens-Dashboard (7 Analysen verfügbar)
  ↓
User liest Analysen, ist begeistert
  ↓
User empfiehlt Kollegen (Anna)
```

### 5.2 Freemium-User (2. aus Firma)

```
Landing Page (via Empfehlung von Max)
  ↓
Registrierung (Email: anna@heidelbergcement.de)
  ↓
Domain-Extraktion (heidelbergcement.de)
  ↓
Freemium-Check (1/2 Slots genutzt → ✅ Verfügbar)
  ↓
Email-Verifizierung
  ↓
Account-Erstellung (isFreemiumUser: true)
  ↓
Freemium-Tracking (2/2 Slots genutzt)
  ↓
Automatisches Onboarding (7 kostenlose Analysen)
  ↓
Willkommens-Dashboard
  ↓
User liest Analysen, ist begeistert
  ↓
User empfiehlt Kollegen (Peter)
```

### 5.3 Paid-User (3. aus Firma)

```
Landing Page (via Empfehlung von Anna)
  ↓
Registrierung (Email: peter@heidelbergcement.de)
  ↓
Domain-Extraktion (heidelbergcement.de)
  ↓
Freemium-Check (2/2 Slots genutzt → ❌ Erschöpft)
  ↓
Freemium-Exhaustion-Page:
  "2 Kollegen haben sich bereits registriert:"
  - Max Mustermann (max@heidelbergcement.de)
  - Anna Schmidt (anna@heidelbergcement.de)
  ↓
Peter kontaktiert Max: "Hey, wie sind deine Erfahrungen?"
Max: "Super! Ich nutze es täglich."
  ↓
Peter entscheidet sich für kostenpflichtige Registrierung
  ↓
Credit-Paket-Auswahl (Professional: 50.000 Credits, 350 €)
  ↓
Stripe Checkout
  ↓
Zahlung erfolgreich
  ↓
Account-Erstellung (isFreemiumUser: false)
  ↓
Credits gutgeschrieben (50.000)
  ↓
Automatisches Onboarding (7 kostenlose Analysen, auch für Paid-User!)
  ↓
Willkommens-Dashboard
  ↓
Peter nutzt Plattform aktiv, kauft später weitere Credits
```

---

## 6. Erfolgsmessung

### 6.1 Erweiterte KPIs

**Freemium-Nutzung**:
- **Freemium-Registrierungen pro Domain**: Durchschnitt (Ziel: 1,5-2,0)
- **Freemium-Exhaustion-Rate**: % der Domains, die 2/2 Slots nutzen (Ziel: >60%)
- **3rd-User-Conversion-Rate**: % der 3. User, die sich kostenpflichtig registrieren (Ziel: >30%)

**Onboarding-Analysen**:
- **Onboarding-Completion-Rate (alle 7 Analysen)**: Ziel >80%
- **Analyse-View-Rate**: % der User, die mind. 5 von 7 Analysen ansehen (Ziel: >70%)
- **Analyse-Quality-Rating**: User-Bewertung der Onboarding-Analysen (Ziel: >4,2/5)

**Viralität**:
- **Referral-Rate**: % der Freemium-User, die Kollegen empfehlen (Ziel: >40%)
- **Colleague-Contact-Rate**: % der 3. User, die bestehende Freemium-User kontaktieren (Ziel: >50%)
- **Domain-Viral-Coefficient**: Durchschnittliche Anzahl neuer Registrierungen pro Freemium-User (Ziel: >0,8)

**Monetarisierung**:
- **Freemium-to-Paid-Conversion (1. oder 2. User)**: Ziel >8%
- **3rd-User-Paid-Conversion**: Ziel >30%
- **Time-to-Paid (Freemium-User)**: Ziel <21 Tage
- **Time-to-Paid (3. User)**: Ziel <1 Tag (sofort bei Registrierung)

### 6.2 A/B-Testing-Möglichkeiten

**Freemium-Limit**:
- 2 vs. 3 vs. 5 Freemium-Slots pro Domain
- 12 vs. 18 vs. 24 Monate Reset-Periode

**Onboarding-Analysen**:
- 7 vs. 5 vs. 3 automatische Analysen
- Parallele vs. sequenzielle Ausführung (UX-Unterschied)
- Sofortige Verfügbarkeit vs. "Analysen werden per Email zugestellt"

**Freemium-Exhaustion-Page**:
- Kollegen-Kontaktdaten anzeigen vs. verbergen
- Upsell-Fokus (Credits vs. Subscription)
- Wartezeit-Kommunikation (12 Monate vs. "bald wieder verfügbar")

---

## 7. Implementierungs-Roadmap

### Phase 1: Basis-Implementierung (3-4 Wochen)

**Woche 1: Domain-basiertes Freemium-Tracking**
- Datenbank-Schema erstellen
- Freemium-Check-Logik implementieren
- Freemium-Exhaustion-Page erstellen

**Woche 2: Automatische Prompt-Generierung**
- Meta-Agent für Prompt-Generierung
- Integration in Onboarding-Flow
- Testing mit verschiedenen Branchen

**Woche 3: Parallele Agent-Ausführung**
- Parallele Execution-Engine
- Timeout-Handling
- Error-Recovery

**Woche 4: UI-Integration**
- Willkommens-Dashboard mit 7 Analysen
- Freemium-Badges und Credit-Anzeige
- Kollegen-Kontakt-Flow

### Phase 2: Optimierung (2-3 Wochen)

**Woche 5: Performance-Optimierung**
- Caching für Website-Analysen
- LLM-Response-Streaming
- Database-Query-Optimierung

**Woche 6: UX-Verbesserungen**
- Onboarding-Progress-Animation
- Analyse-Preview-Cards
- Interaktive Analyse-Exploration

**Woche 7: Testing & Launch**
- End-to-End-Tests
- Load-Testing (100+ parallele Onboardings)
- Beta-Launch mit ausgewählten Firmen

### Phase 3: Monitoring & Iteration (laufend)

- A/B-Testing von Freemium-Limits
- Analyse-Quality-Monitoring
- Conversion-Funnel-Optimierung
- Viral-Coefficient-Tracking

---

## 8. Zusammenfassung

Dieses erweiterte Freemium-Konzept transformiert Mi42 von einem "Try-before-you-buy"-Tool zu einem **viralen, selbst-demonstrierenden Produkt**. Die Kernelemente sind:

**7 kostenlose Analysen beim Onboarding**: Jeder neue User erhält automatisch 7 personalisierte Analysen mit vorausgefüllten Prompts. Dies demonstriert die volle Leistungsfähigkeit der Plattform und maximiert den Sofort-Mehrwert.

**Domain-basiertes Freemium-Limit**: Pro Firma (Domain) sind nur 2 Freemium-Registrierungen erlaubt. Dies fördert Viralität (User empfehlen Kollegen) und qualifiziert ernsthafte Interessenten (3. User muss zahlen).

**Transparente Freemium-Exhaustion**: Der 3. User wird informiert, welche Kollegen bereits registriert sind, und kann diese kontaktieren. Dies fördert interne Kommunikation und Team-Adoption.

**12-Monats-Reset**: Nach einem Jahr stehen erneut 2 Freemium-Slots zur Verfügung. Dies zeigt Fairness und ermöglicht langfristige Viralität.

**Klare Abgrenzung**: Freemium-Analysen (kostenlos) vs. manuelle Analysen (kostenpflichtig) sind klar gekennzeichnet. User verstehen, wann sie Credits verbrauchen.

**Technische Umsetzung**: Vollständige Backend-API, Frontend-Komponenten, Datenbank-Schema, Cron-Jobs für Reset.

Das System ist darauf ausgelegt, die **Viral-Coefficient** zu maximieren (jeder Freemium-User bringt 0,8+ neue User) und die **3rd-User-Conversion** zu optimieren (30%+ zahlen sofort bei Registrierung).
