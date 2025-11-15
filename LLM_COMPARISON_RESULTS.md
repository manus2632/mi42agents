# LLM Comparison: Open WebUI vs. OpenAI

**Datum:** 13. November 2025  
**Projekt:** Mi42 Competitor Intelligence Agent  
**Test-Setup:** A/B-Vergleich mit identischer Aufgabe

---

## 🧪 Test-Konfiguration

### LLM A: Open WebUI
- **Provider:** Open WebUI (https://maxproxy.bl2020.com)
- **Model:** `gpt-oss:120b`
- **User ID:** 1 (admin)
- **Kosten:** Kostenlos (eigenes LLM)

### LLM B: OpenAI
- **Provider:** OpenAI (https://api.openai.com)
- **Model:** `gpt-4o-mini`
- **User ID:** 2 (internal_user)
- **Kosten:** $0.15/1M input tokens, $0.60/1M output tokens

---

## 📝 Test-Aufgabe

**Agent:** Competitor Intelligence  
**Prompt:** "Analysiere den Wettbewerber Heidelberg Materials im Bereich Zement und Baustoffe. Erstelle ein detailliertes Profil mit Stärken, Schwächen, Marktposition und strategischen Empfehlungen."

**Erwartete Ausgabe:**
- Unternehmens-Profil (Geschichte, Größe, Standorte)
- Produkt-Portfolio (Zement, Beton, Zuschlagstoffe)
- Marktposition (Marktanteile, geografische Präsenz)
- SWOT-Analyse (Stärken, Schwächen, Chancen, Risiken)
- Wettbewerbsvorteile und Differenzierungsmerkmale
- Strategische Handlungsempfehlungen

---

## 🎯 Test-Durchführung

### Schritt 1: Test mit Open WebUI (User 1)

**Status:** ⏳ Bereit zum Testen

**Kommando:**
```bash
curl -X POST 'http://46.224.9.190:3001/api/trpc/agents.executeTask' \
  -H 'Content-Type: application/json' \
  -d '{
    "userId": 1,
    "agentType": "competitor_intelligence",
    "prompt": "Analysiere den Wettbewerber Heidelberg Materials im Bereich Zement und Baustoffe. Erstelle ein detailliertes Profil mit Stärken, Schwächen, Marktposition und strategischen Empfehlungen."
  }'
```

**Ergebnis:** (wird nach Test ausgefüllt)
- Response-Zeit: ___ Sekunden
- Token-Verbrauch: ___ tokens
- Qualität (1-10): ___
- Detailtiefe: ___
- Genauigkeit: ___
- Actionability: ___

---

### Schritt 2: Test mit OpenAI (User 2)

**Status:** ⏳ Bereit zum Testen

**Kommando:**
```bash
curl -X POST 'http://46.224.9.190:3001/api/trpc/agents.executeTask' \
  -H 'Content-Type: application/json' \
  -d '{
    "userId": 2,
    "agentType": "competitor_intelligence",
    "prompt": "Analysiere den Wettbewerber Heidelberg Materials im Bereich Zement und Baustoffe. Erstelle ein detailliertes Profil mit Stärken, Schwächen, Marktposition und strategischen Empfehlungen."
  }'
```

**Ergebnis:** (wird nach Test ausgefüllt)
- Response-Zeit: ___ Sekunden
- Token-Verbrauch: ___ tokens
- Kosten: $___
- Qualität (1-10): ___
- Detailtiefe: ___
- Genauigkeit: ___
- Actionability: ___

---

## 📊 Vergleichs-Metriken

| Metrik | Open WebUI | OpenAI | Gewinner |
|--------|-----------|--------|----------|
| **Qualität (1-10)** | ___ | ___ | ___ |
| **Detailtiefe** | ___ | ___ | ___ |
| **Genauigkeit** | ___ | ___ | ___ |
| **Actionability** | ___ | ___ | ___ |
| **Response-Zeit** | ___ s | ___ s | ___ |
| **Token-Verbrauch** | ___ | ___ | ___ |
| **Kosten pro Request** | $0.00 | $___ | Open WebUI |
| **Strukturierung** | ___ | ___ | ___ |
| **C-Level-Tauglichkeit** | ___ | ___ | ___ |

---

## 💡 Erwartete Ergebnisse

### Open WebUI (gpt-oss:120b)
**Vorteile:**
- ✅ Kostenlos
- ✅ Datenschutz (keine Daten an Dritte)
- ✅ Unbegrenzte Requests

**Nachteile:**
- ❌ Möglicherweise weniger detailliert
- ❌ Langsamer als OpenAI
- ❌ Keine Structured Outputs

### OpenAI (gpt-4o-mini)
**Vorteile:**
- ✅ Höhere Qualität und Detailtiefe
- ✅ Schnellere Response-Zeit
- ✅ Structured Outputs (JSON Schema)
- ✅ Bessere Reasoning-Capabilities

**Nachteile:**
- ❌ Kosten pro Request (~$0.0012 für 2000 tokens)
- ❌ Datenschutz-Bedenken
- ❌ Rate Limits

---

## 🎯 Empfehlung (nach Test)

**Hybrid-Strategie:**
1. **Einfache Aufgaben** → Open WebUI (kostenlos)
2. **Wichtige Analysen** → OpenAI (bessere Qualität)
3. **User-Wahl** → Premium-Feature (User kann LLM wählen)

**Geschätzte Kosten:**
- 100 Analysen/Tag mit OpenAI gpt-4o-mini: ~$0.12/Tag = $3.60/Monat
- **Fazit:** OpenAI ist extrem günstig für die gebotene Qualität!

---

## 📋 Nächste Schritte

1. ✅ Test-Konfiguration erstellt
2. ⏳ Tests durchführen (beide LLMs)
3. ⏳ Ergebnisse dokumentieren
4. ⏳ Qualität vergleichen
5. ⏳ Empfehlung aussprechen

**Status:** Bereit zum Testen! Beide LLMs sind konfiguriert und einsatzbereit.
