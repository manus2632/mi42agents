# Competitor Intelligence Agent - Status Report

**Datum:** 13. November 2025  
**Projekt:** Mi42 Market Intelligence Platform

---

## 📊 Aktueller Stand

### ✅ Was ist implementiert:

**1. Agent-Konfiguration (`server/agents.ts`)**
- ✅ 7 Agent-Typen definiert:
  - `market_analyst` - Marktanalyse
  - `trend_scout` - Trend-Erkennung
  - `survey_assistant` - Umfrage-Analyse
  - `strategy_advisor` - Strategieberatung
  - `demand_forecasting` - Nachfrageprognose ⚠️
  - `project_intelligence` - Bauprojekt-Intelligence ⚠️
  - `pricing_strategy` - Preisstrategie ⚠️

**2. LLM-Integration**
- ✅ Open WebUI API verbunden (https://maxproxy.bl2020.com)
- ✅ Model: `gpt-oss:120b`
- ✅ Konfigurierbar per User/Agent-Typ in `model_configs` Tabelle
- ✅ Fallback auf Gemini 2.5 Flash wenn Open WebUI nicht verfügbar

**3. Datenbank-Schema**
- ✅ `agent_tasks` Tabelle mit 8 Agent-Typen (inkl. `competitor_intelligence`)
- ✅ `briefings` Tabelle für Ergebnisse
- ✅ `company_profiles` für Unternehmensanalysen
- ✅ `model_configs` für LLM-Konfiguration

**4. Onboarding-Integration**
- ✅ Automatische Erstellung von 7 Analysen nach Registration
- ✅ Company-Profile-Analyse basierend auf Domain

---

## ❌ Was NICHT funktioniert:

### Problem 1: Agent-Execution schlägt fehl

**Fehler:** `TypeError: Cannot read properties of undefined (reading 'systemPrompt')`

**Ursache:** 
- Die 3 neuen Agent-Typen (`demand_forecasting`, `project_intelligence`, `pricing_strategy`) haben **keine Konfiguration** in `AGENT_CONFIGS`
- Code versucht `config.systemPrompt` zu lesen, aber `config` ist `undefined`

**Betroffene Agents:**
- ❌ Demand Forecasting (Nachfrageprognose)
- ❌ Project Intelligence (Bauprojekt-Analyse)
- ❌ Pricing Strategy (Preisstrategie)

**Funktionierende Agents:**
- ✅ Market Analyst
- ✅ Trend Scout
- ✅ Survey Assistant
- ✅ Strategy Advisor

### Problem 2: Competitor Intelligence Agent fehlt komplett

**Status:** 
- ✅ In Datenbank-Schema definiert (`competitor_intelligence`)
- ❌ **KEINE Konfiguration** in `AGENT_CONFIGS`
- ❌ **KEINE System-Prompts**
- ❌ **NICHT in Onboarding** integriert

---

## 🔍 LLM-Vergleich: Open WebUI vs. OpenAI

### Aktuelles Setup (Open WebUI):

**Model:** `gpt-oss:120b`  
**Endpoint:** https://maxproxy.bl2020.com/api/chat/completions  
**API Key:** `sk-bd621b0666474be1b054b3c5360b3cef`

**Vorteile:**
- ✅ Eigenes LLM, keine externen Kosten
- ✅ Datenschutz (keine Daten an OpenAI)
- ✅ Unbegrenzte Requests

**Nachteile:**
- ❌ Qualität möglicherweise schlechter als GPT-4
- ❌ Keine Structured Outputs (JSON Schema)
- ❌ Langsamer als OpenAI

### OpenAI Alternative:

**Models verfügbar:**
- `gpt-4o` - Beste Qualität, teuer ($2.50/1M input tokens)
- `gpt-4o-mini` - Gute Qualität, günstig ($0.15/1M input tokens)
- `o1-mini` - Reasoning-optimiert ($3.00/1M input tokens)

**Vorteile:**
- ✅ Beste Qualität für komplexe Analysen
- ✅ Structured Outputs (JSON Schema) funktioniert perfekt
- ✅ Schneller
- ✅ Reasoning-Capabilities (o1-mini)

**Nachteile:**
- ❌ Kosten pro Request
- ❌ Datenschutz-Bedenken
- ❌ Rate Limits

---

## 🧪 Vergleichs-Test-Plan

### Option 1: A/B-Test im Code

**Implementierung:**
1. OpenAI API Key als Umgebungsvariable hinzufügen
2. `model_configs` Tabelle erweitern um `provider` Feld
3. Für jeden Agent 2 Konfigurationen erstellen:
   - `market_analyst_openwebui` → `gpt-oss:120b`
   - `market_analyst_openai` → `gpt-4o-mini`
4. Beide Agents parallel ausführen für dieselbe Aufgabe
5. Ergebnisse vergleichen (Qualität, Geschwindigkeit, Kosten)

**Code-Änderungen:**
```typescript
// server/agents.ts
const modelConfig = await getModelConfig(userId, agentType);
const provider = modelConfig?.modelProvider || 'open_webui';
const model = modelConfig?.modelName || (provider === 'openai' ? 'gpt-4o-mini' : 'gpt-oss:120b');

const response = await invokeLLM({
  modelProvider: provider,
  modelName: model,
  messages: [
    { role: "system", content: config.systemPrompt },
    { role: "user", content: contextPrompt },
  ],
});
```

### Option 2: Manual Testing

**Prozess:**
1. Erstellen Sie 2 Test-User:
   - User A: Open WebUI (`gpt-oss:120b`)
   - User B: OpenAI (`gpt-4o-mini`)
2. Beide User stellen dieselbe Aufgabe:
   - "Analysiere den Wettbewerber Heidelberg Materials im Bereich Zement"
3. Vergleichen Sie:
   - **Qualität:** Detailtiefe, Genauigkeit, Relevanz
   - **Geschwindigkeit:** Response-Zeit
   - **Kosten:** Token-Verbrauch × Preis

### Option 3: Benchmark-Suite

**Test-Cases:**
1. **Einfache Analyse:** "Liste die Top 5 Zementhersteller in Deutschland"
2. **Komplexe Analyse:** "Analysiere die Preisstrategie von Heidelberg Materials im Vergleich zu Holcim"
3. **Strukturierte Daten:** "Extrahiere Produktportfolio, Märkte und Wettbewerber von heidelbergmaterials.com"
4. **Reasoning:** "Welche Markteintrittsstrategie empfiehlst du für einen neuen Baustoffhersteller in Süddeutschland?"

**Metriken:**
- Qualität (1-10 Skala, manuell bewertet)
- Response-Zeit (Sekunden)
- Token-Verbrauch
- Kosten pro Request
- Fehlerrate

---

## 🎯 Empfehlungen

### Kurzfristig (diese Woche):

1. **Competitor Intelligence Agent implementieren**
   - System-Prompt schreiben
   - In `AGENT_CONFIGS` hinzufügen
   - In Onboarding integrieren

2. **Fehlende Agent-Konfigurationen fixen**
   - `demand_forecasting` ✅ (bereits vorhanden, aber nicht deployed)
   - `project_intelligence` ✅ (bereits vorhanden, aber nicht deployed)
   - `pricing_strategy` ✅ (bereits vorhanden, aber nicht deployed)

3. **OpenAI Integration vorbereiten**
   - API Key als Umgebungsvariable hinzufügen
   - `invokeLLM` erweitern um OpenAI-Support
   - Test-User mit OpenAI-Konfiguration erstellen

### Mittelfristig (nächste 2 Wochen):

4. **A/B-Test durchführen**
   - 10 Test-Aufgaben definieren
   - Beide LLMs parallel testen
   - Ergebnisse dokumentieren

5. **Hybrid-Strategie**
   - Einfache Aufgaben → Open WebUI (kostenlos)
   - Komplexe Analysen → OpenAI (bessere Qualität)
   - User kann wählen (Premium-Feature)

---

## 💡 Nächste Schritte

**Soll ich:**

1. ✅ **Competitor Intelligence Agent komplett implementieren** (System-Prompt, Konfiguration, Tests)

2. ✅ **OpenAI Integration hinzufügen** (API Key, Code-Änderungen, Test-Setup)

3. ✅ **A/B-Test durchführen** (10 Test-Cases, beide LLMs vergleichen, Dokumentation)

**Oder alle 3 Schritte nacheinander?**

---

## 📋 Technische Details

### Aktuelle LLM-Konfiguration:

```yaml
OPEN_WEBUI_API_URL: https://maxproxy.bl2020.com/api/chat/completions
OPEN_WEBUI_API_KEY: sk-bd621b0666474be1b054b3c5360b3cef
OPEN_WEBUI_MODEL: gpt-oss:120b
```

### Benötigte OpenAI-Konfiguration:

```yaml
OPENAI_API_KEY: <IHR_API_KEY>
OPENAI_MODEL: gpt-4o-mini  # oder gpt-4o für beste Qualität
```

### Model-Preise (OpenAI):

| Model | Input | Output | Qualität |
|-------|-------|--------|----------|
| gpt-4o | $2.50/1M | $10.00/1M | ⭐⭐⭐⭐⭐ |
| gpt-4o-mini | $0.15/1M | $0.60/1M | ⭐⭐⭐⭐ |
| o1-mini | $3.00/1M | $12.00/1M | ⭐⭐⭐⭐⭐ (Reasoning) |

**Geschätzte Kosten pro Analyse:**
- Einfache Analyse (500 tokens): ~$0.0003 (gpt-4o-mini)
- Komplexe Analyse (2000 tokens): ~$0.0012 (gpt-4o-mini)
- **100 Analysen/Tag = ~$0.12/Tag = $3.60/Monat**

---

**Fazit:** OpenAI ist **sehr günstig** für die Qualität, die Sie bekommen. Ich empfehle einen Hybrid-Ansatz:
- **Open WebUI** für einfache Aufgaben (kostenlos)
- **OpenAI gpt-4o-mini** für wichtige Analysen (bessere Qualität, minimal Kosten)
