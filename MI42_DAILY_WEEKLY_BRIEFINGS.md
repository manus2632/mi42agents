# Mi42 Daily & Weekly Briefings
**Automatisierte Kurzinformationen für die Bau-Zulieferer-Industrie**

---

## Zusammenfassung

Das Mi42-System wird um automatisierte Daily und Weekly Briefings erweitert, die jedem Kunden personalisierte, vorkonfigurierte Marktinformationen liefern. Basierend auf der Domain-Analyse beim Onboarding werden Produktkategorien, relevante Wettbewerber, Rohstoffe und Börsenindizes automatisch identifiziert. Das System generiert dann täglich und wöchentlich kompakte Briefings mit Texten, Grafiken und Kennzahlen - ohne manuelle Konfiguration durch den Kunden.

**Kernprinzip:** "Set it and forget it" - Einmalige automatische Konfiguration beim Onboarding, dann kontinuierliche Lieferung relevanter Informationen.

---

## 1. Automatische Vorkonfiguration

### Phase 1: Domain-Analyse beim Onboarding

Beim ersten Login extrahiert der Markt-Analyst-Agent aus der E-Mail-Domain und Website-Analyse:

**Produktkategorien:**
- Hauptprodukte des Unternehmens (z.B. "Dämmstoffe", "Fenster", "Betonzusatzmittel")
- Anwendungsbereiche (Residential, Commercial, Infrastructure)
- Geografische Märkte (Deutschland, USA, UK, etc.)

**Wettbewerber:**
- Top 5-10 direkte Wettbewerber (aus Website-Analyse und Branchendatenbanken)
- Börsennotierte Wettbewerber für Kursvergleiche

**Rohstoffe:**
- Relevante Rohstoffe basierend auf Produktkategorien
  - Dämmstoffe → Polystyrol, Mineralwolle, Polyurethan
  - Fenster → Aluminium, PVC, Holz, Glas
  - Beton → Zement, Sand, Stahl

**Börsenindizes:**
- Branchenspezifische Indizes (z.B. S&P 500 Construction & Materials, STOXX Europe 600 Construction & Materials)
- Relevante Einzelaktien (börsennotierte Wettbewerber)

**Beispiel-Konfiguration für "Fenster-Hersteller in Deutschland":**
```json
{
  "company": "Beispiel GmbH",
  "domain": "beispiel.de",
  "products": ["Kunststofffenster", "Aluminiumfenster", "Holz-Alu-Fenster"],
  "markets": ["DE", "AT", "CH", "PL"],
  "competitors": ["Schüco", "Rehau", "Veka", "Salamander", "Aluplast"],
  "rawMaterials": ["PVC", "Aluminium", "Holz", "Glas"],
  "stockIndices": ["STOXX Europe 600 Construction"],
  "stockSymbols": ["SCHN.DE", "RHM.DE"],
  "keywords": ["Fensterbau", "Energieeffizienz", "Wärmeschutz", "Schallschutz"]
}
```

### Phase 2: Automatische Datenquellen-Zuordnung

Das System ordnet automatisch Datenquellen zu:

| Informationstyp | Datenquelle | API/Tool |
|-----------------|-------------|----------|
| Rohstoffpreise | Commodity Markets | Yahoo Finance API, Trading Economics |
| Börsenkurse | Stock Exchanges | Yahoo Finance API |
| Branchennews | News Aggregators | News API, Google News RSS |
| Wettbewerber-Updates | Company Websites, LinkedIn | Web Scraping, LinkedIn API |
| Bauvolumen-Prognosen | Interne Datenbank | Eigene Forecast-DB |
| Wirtschaftsindikatoren | World Bank, OECD | DataBank API |
| Wetter & Saisonalität | Weather Services | OpenWeather API |

---

## 2. Daily Briefing: "Mi42 Morning Update"

**Versandzeitpunkt:** Täglich um 7:00 Uhr (Ortszeit des Kunden)  
**Format:** E-Mail + Portal-Benachrichtigung  
**Länge:** 300-500 Wörter + 2-3 Grafiken  
**Lesezeit:** 2-3 Minuten

### Struktur

#### 2.1 Executive Summary (50 Wörter)
Kompakte Zusammenfassung der wichtigsten Entwicklungen des Vortages:
- Größte Preisänderung bei relevanten Rohstoffen
- Signifikante Börsenbewegungen (>3% bei Wettbewerbern oder Indizes)
- Breaking News mit direktem Branchenbezug

**Beispiel:**
> **Mi42 Morning Update - 11. November 2025**
> 
> Aluminiumpreise stiegen gestern um 4,2% auf USD 2.450/Tonne nach Produktionskürzungen in China. Schüco-Aktie verlor 2,8% nach schwachen Q3-Zahlen. Neue EU-Gebäuderichtlinie (EPBD) tritt ab Januar 2026 in Kraft - strengere Anforderungen an Wärmedämmung.

#### 2.2 Rohstoffpreise (100 Wörter + 1 Grafik)
- Tagesaktuelle Preise für konfigurierte Rohstoffe
- Veränderung zum Vortag und zur Vorwoche (in % und absolut)
- Kurzer Kontext bei signifikanten Änderungen (>2%)
- Liniendiagramm: 30-Tage-Preisentwicklung

**Beispiel:**
> **Rohstoffpreise (10.11.2025, 18:00 Uhr)**
> 
> | Rohstoff | Aktuell | Δ Tag | Δ Woche | Einheit |
> |----------|---------|-------|---------|---------|
> | Aluminium | USD 2.450 | +4,2% | +6,8% | /Tonne |
> | PVC | EUR 1.120 | -0,5% | +1,2% | /Tonne |
> | Holz (Schnittholz) | EUR 385 | +1,1% | -2,3% | /m³ |
> | Glas (Float) | EUR 8,50 | 0,0% | +0,5% | /m² |
> 
> **Analyse:** Aluminiumpreise reagieren auf angekündigte Produktionskürzungen in Chinas Provinz Yunnan (Stromknappheit). Analysten erwarten kurzfristig weiteren Aufwärtsdruck. PVC-Preise stabil trotz sinkender Energiekosten.

![30-Tage-Preisentwicklung Aluminium](./charts/aluminum_30d.png)

#### 2.3 Börsenkurse & Indizes (80 Wörter + 1 Grafik)
- Schlusskurse relevanter Indizes und Wettbewerber-Aktien
- Performance-Vergleich (Kunde vs. Wettbewerber vs. Index)
- Heatmap: Tagesperformance aller konfigurierten Aktien

**Beispiel:**
> **Börsenkurse (10.11.2025, Xetra-Schluss)**
> 
> | Index/Aktie | Kurs | Δ Tag | Δ YTD |
> |-------------|------|-------|-------|
> | STOXX 600 Construction | 485,20 | -0,8% | +12,4% |
> | Schüco (SCHN.DE) | EUR 42,30 | -2,8% | +8,1% |
> | Rehau (nicht börsennotiert) | - | - | - |
> 
> **Marktkommentar:** Bausektor unter Druck nach schwachen Auftragseingängen in Deutschland (-3,2% im Oktober). Schüco belastet durch enttäuschende Q3-Zahlen (Umsatz EUR 1,2 Mrd., -5% YoY).

![Heatmap Tagesperformance](./charts/stock_heatmap.png)

#### 2.4 Branchennews (100 Wörter)
- 3-5 relevante News-Schlagzeilen mit Kurztext (20-30 Wörter)
- Automatische Filterung nach Keywords (Produktkategorien, Wettbewerber, Märkte)
- Link zur Vollversion

**Beispiel:**
> **Branchennews**
> 
> 1. **EU verschärft Energieeffizienz-Anforderungen ab 2026** - Neue EPBD-Richtlinie fordert U-Wert <0,8 W/m²K für Fenster in Neubauten. Hersteller müssen Produktportfolios anpassen. [Quelle: EU-Kommission]
> 
> 2. **Schüco investiert EUR 50 Mio. in polnisches Werk** - Kapazitätserweiterung um 30% bis Q2 2026 geplant. Fokus auf energieeffiziente Fassadensysteme. [Quelle: Schüco Pressemitteilung]
> 
> 3. **Aluminiumknappheit treibt Preise** - Chinas Produktionskürzungen führen zu globalen Lieferengpässen. Experten rechnen mit anhaltend hohen Preisen bis Q1 2026. [Quelle: Bloomberg]

#### 2.5 Wetter & Saisonalität (50 Wörter)
- Wettervorhersage für Hauptmärkte (relevant für Bauaktivität)
- Saisonale Hinweise (z.B. "Winterpause in Nordeuropa beginnt")

**Beispiel:**
> **Wetter & Bauaktivität**
> 
> Deutschland: Mild und trocken (8-12°C), günstige Bedingungen für Außenarbeiten. Polen: Erste Schneefälle erwartet, Bauaktivität nimmt ab. Saisonaler Hinweis: Historisch sinkt Fensternachfrage im November um 15-20% (Winterpause).

---

## 3. Weekly Briefing: "Mi42 Market Insights"

**Versandzeitpunkt:** Jeden Montag um 8:00 Uhr  
**Format:** E-Mail + Portal-Download (PDF)  
**Länge:** 800-1200 Wörter + 5-7 Grafiken  
**Lesezeit:** 5-8 Minuten

### Struktur

#### 3.1 Executive Summary (100 Wörter)
Zusammenfassung der Woche mit Fokus auf strategische Implikationen:
- Top 3 Entwicklungen der Woche
- Auswirkungen auf Geschäft des Kunden
- Handlungsempfehlungen

#### 3.2 Rohstoffmarkt-Analyse (250 Wörter + 2 Grafiken)
- Wochenentwicklung aller konfigurierten Rohstoffe
- Treiber der Preisänderungen (Angebot, Nachfrage, geopolitische Ereignisse)
- Prognose für kommende 4 Wochen
- Grafiken:
  - Wochenperformance-Balkendiagramm
  - 12-Monats-Trendlinie mit Prognose

**Beispiel-Grafik:**
```
Rohstoffpreise - Wochenperformance (KW 45/2025)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Aluminium        ████████████ +6,8%
PVC              ██ +1,2%
Holz             ▓▓ -2,3%
Glas             █ +0,5%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### 3.3 Wettbewerber-Update (200 Wörter + 1 Tabelle)
- Wichtige Ankündigungen von Wettbewerbern (Produktlaunches, Investitionen, M&A)
- Marktanteilsverschiebungen (falls Daten verfügbar)
- Strategische Positionierung im Vergleich

**Beispiel-Tabelle:**
| Wettbewerber | Entwicklung der Woche | Strategische Bedeutung |
|--------------|----------------------|------------------------|
| Schüco | Q3-Zahlen: Umsatz -5% YoY, EBIT-Marge 8,2% (-1,5pp) | Schwächephase - Chance für Marktanteilsgewinne |
| Rehau | Neues Produktwerk in Polen angekündigt (EUR 50 Mio.) | Kapazitätsausbau - verschärfter Wettbewerb ab 2026 |
| Veka | Partnerschaft mit Smart-Home-Anbieter | Digitalisierung - Trend zu vernetzten Fenstern |

#### 3.4 Markttrends & Insights (250 Wörter + 2 Grafiken)
- Analyse von Bauvolumen-Entwicklungen in Zielmärkten
- Nachfragetrends nach Produktkategorien
- Regulatorische Entwicklungen
- Grafiken:
  - Bauvolumen-Prognose nach Ländern (Balkendiagramm)
  - Produktnachfrage-Trends (Liniendiagramm)

#### 3.5 Makroökonomischer Kontext (150 Wörter + 1 Grafik)
- Relevante Wirtschaftsindikatoren (GDP-Wachstum, Bauinvestitionen, Zinssätze)
- Auswirkungen auf Bauindustrie
- Grafik: Korrelation zwischen GDP-Wachstum und Bauvolumen

#### 3.6 Ausblick & Handlungsempfehlungen (150 Wörter)
- Was erwartet uns in der kommenden Woche?
- Konkrete Handlungsempfehlungen basierend auf Analysen
- Risiken und Chancen

**Beispiel:**
> **Ausblick KW 46/2025**
> 
> **Erwartungen:**
> - Aluminiumpreise bleiben volatil (Produktionskürzungen in China)
> - EU-Parlament stimmt über EPBD-Verschärfung ab (Donnerstag)
> - Schüco Capital Markets Day (Mittwoch) - Guidance für 2026 erwartet
> 
> **Handlungsempfehlungen:**
> 1. **Rohstoffsicherung:** Prüfen Sie Aluminium-Hedging-Optionen für Q1 2026
> 2. **Produktstrategie:** Bereiten Sie Kommunikation zu EPBD-konformen Produkten vor
> 3. **Wettbewerbsbeobachtung:** Analysieren Sie Schüco-Guidance auf Preisstrategien
> 
> **Risiken:** Weitere Produktionskürzungen in China könnten Aluminiumpreise auf USD 2.600/Tonne treiben (+6% vs. heute)

---

## 4. Technische Implementierung

### 4.1 Architektur

```
┌─────────────────────────────────────────────────────────────┐
│                     Mi42 Briefing Engine                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Data Fetcher │  │ LLM Analyzer │  │ Chart Engine │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         ▼                  ▼                  ▼              │
│  ┌──────────────────────────────────────────────────┐       │
│  │          Briefing Generator (LLM)                 │       │
│  └──────────────────────────────────────────────────┘       │
│                          │                                   │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────┐       │
│  │     Delivery Engine (Email + Portal)             │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Datenquellen-Integration

**Rohstoffpreise:**
```typescript
// Yahoo Finance API für Commodity Futures
const fetchCommodityPrices = async (symbols: string[]) => {
  const prices = await callDataApi('YahooFinance/get_stock_profile', {
    query: { symbol: 'ALI=F' } // Aluminium Futures
  });
  return prices;
};
```

**Börsenkurse:**
```typescript
// Yahoo Finance API für Aktien und Indizes
const fetchStockPrices = async (symbols: string[]) => {
  const results = await Promise.all(
    symbols.map(symbol => 
      callDataApi('YahooFinance/get_stock_insights', {
        query: { symbol }
      })
    )
  );
  return results;
};
```

**Branchennews:**
```typescript
// News API oder RSS-Feeds
const fetchIndustryNews = async (keywords: string[]) => {
  const news = await fetch(`https://newsapi.org/v2/everything?q=${keywords.join(' OR ')}`);
  return news.articles;
};
```

**Wirtschaftsindikatoren:**
```typescript
// World Bank DataBank API
const fetchEconomicIndicators = async (countries: string[]) => {
  const gdp = await callDataApi('DataBank/indicator_detail', {
    path_params: { indicatorCode: 'NY.GDP.MKTP.CD' }
  });
  return gdp;
};
```

### 4.3 LLM-basierte Content-Generierung

**System-Prompt für Daily Briefing:**
```
Du bist ein Marktanalyst für die Bau-Zulieferer-Industrie. Erstelle ein kompaktes Daily Briefing (300-500 Wörter) basierend auf folgenden Daten:

Rohstoffpreise: {rawMaterialPrices}
Börsenkurse: {stockPrices}
News: {industryNews}
Wetter: {weatherData}

Kundenkontext:
- Unternehmen: {companyName}
- Produkte: {products}
- Märkte: {markets}

Anforderungen:
1. Executive Summary (50 Wörter): Wichtigste Entwicklung des Vortages
2. Rohstoffpreise (100 Wörter): Analyse mit Fokus auf signifikante Änderungen
3. Börsenkurse (80 Wörter): Marktkommentar mit Branchenbezug
4. Branchennews (100 Wörter): 3-5 relevante Schlagzeilen
5. Wetter & Saisonalität (50 Wörter): Bauaktivitäts-Relevanz

Stil: Professionell, prägnant, handlungsorientiert. Keine Floskeln.
```

**System-Prompt für Weekly Briefing:**
```
Du bist ein Senior Market Intelligence Analyst für die Bau-Zulieferer-Industrie. Erstelle ein strategisches Weekly Briefing (800-1200 Wörter) basierend auf:

Wochendaten:
- Rohstoffpreise: {weeklyRawMaterials}
- Börsenkurse: {weeklyStocks}
- Wettbewerber-Updates: {competitorNews}
- Bauvolumen-Prognosen: {constructionForecasts}
- Wirtschaftsindikatoren: {economicData}

Kundenkontext:
- Unternehmen: {companyName}
- Produkte: {products}
- Märkte: {markets}
- Wettbewerber: {competitors}

Struktur:
1. Executive Summary (100 Wörter): Top 3 Entwicklungen + Handlungsempfehlungen
2. Rohstoffmarkt-Analyse (250 Wörter): Treiber, Trends, 4-Wochen-Prognose
3. Wettbewerber-Update (200 Wörter): Strategische Bedeutung von Entwicklungen
4. Markttrends & Insights (250 Wörter): Bauvolumen, Nachfragetrends, Regulierung
5. Makroökonomischer Kontext (150 Wörter): GDP, Zinsen, Bauinvestitionen
6. Ausblick & Handlungsempfehlungen (150 Wörter): Konkrete nächste Schritte

Stil: Strategisch, datenbasiert, entscheidungsrelevant. Fokus auf Implikationen für Kunde.
```

### 4.4 Chart-Generierung

**Technologie:** Recharts (bereits installiert) + Server-Side Rendering

```typescript
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { renderToStaticMarkup } from 'react-dom/server';
import sharp from 'sharp';

const generatePriceChart = async (data: PriceData[]) => {
  const chartSvg = renderToStaticMarkup(
    <LineChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="price" stroke="#000" />
    </LineChart>
  );
  
  // Convert SVG to PNG
  const pngBuffer = await sharp(Buffer.from(chartSvg))
    .png()
    .toBuffer();
  
  return pngBuffer;
};
```

### 4.5 Scheduler-Integration

**Cron-Jobs für automatische Generierung:**

```typescript
// Daily Briefing - Täglich um 7:00 Uhr
schedule({
  type: 'cron',
  cron: '0 0 7 * * *', // Sekunden Minuten Stunden Tag Monat Wochentag
  repeat: true,
  name: 'Mi42 Daily Briefing',
  prompt: 'Generate and send daily briefings to all active users'
});

// Weekly Briefing - Jeden Montag um 8:00 Uhr
schedule({
  type: 'cron',
  cron: '0 0 8 * * 1', // Montag = 1
  repeat: true,
  name: 'Mi42 Weekly Briefing',
  prompt: 'Generate and send weekly briefings to all active users'
});
```

### 4.6 Delivery-Mechanismus

**E-Mail-Versand:**
```typescript
import nodemailer from 'nodemailer';

const sendDailyBriefing = async (user: User, briefing: Briefing) => {
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  
  await transporter.sendMail({
    from: 'Mi42 <briefings@mi42.com>',
    to: user.email,
    subject: `Mi42 Morning Update - ${new Date().toLocaleDateString('de-DE')}`,
    html: briefing.htmlContent,
    attachments: briefing.charts.map(chart => ({
      filename: chart.filename,
      content: chart.buffer
    }))
  });
};
```

**Portal-Benachrichtigung:**
```typescript
// Notification API (bereits in Template vorhanden)
import { notifyUser } from './server/_core/notification';

await notifyUser(user.id, {
  title: 'Mi42 Morning Update verfügbar',
  content: 'Ihr tägliches Briefing ist jetzt im Portal abrufbar.',
  link: `/briefings/daily/${briefingId}`
});
```

---

## 5. Datenbank-Schema-Erweiterungen

```sql
-- Briefing-Konfiguration (automatisch beim Onboarding erstellt)
CREATE TABLE briefing_configs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  company_domain VARCHAR(255),
  products JSON, -- ["Kunststofffenster", "Aluminiumfenster"]
  markets JSON, -- ["DE", "AT", "CH"]
  competitors JSON, -- ["Schüco", "Rehau", "Veka"]
  raw_materials JSON, -- ["PVC", "Aluminium", "Holz"]
  stock_symbols JSON, -- ["SCHN.DE", "RHM.DE"]
  stock_indices JSON, -- ["STOXX 600 Construction"]
  keywords JSON, -- ["Fensterbau", "Energieeffizienz"]
  daily_enabled BOOLEAN DEFAULT TRUE,
  weekly_enabled BOOLEAN DEFAULT TRUE,
  delivery_time TIME DEFAULT '07:00:00',
  timezone VARCHAR(50) DEFAULT 'Europe/Berlin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Generierte Briefings (Archiv)
CREATE TABLE generated_briefings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type ENUM('daily', 'weekly') NOT NULL,
  title VARCHAR(500),
  content TEXT, -- HTML-Content
  summary TEXT, -- Plain-Text-Summary für Vorschau
  charts JSON, -- [{filename: 'chart1.png', url: 's3://...'}]
  data_snapshot JSON, -- Rohdaten für spätere Analyse
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP,
  opened_at TIMESTAMP, -- Tracking
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_type_date (user_id, type, generated_at)
);

-- Briefing-Metriken (für Optimierung)
CREATE TABLE briefing_metrics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  briefing_id INT NOT NULL,
  opened BOOLEAN DEFAULT FALSE,
  open_time TIMESTAMP,
  clicks INT DEFAULT 0, -- Anzahl Link-Klicks
  read_time_seconds INT, -- Geschätzte Lesezeit
  feedback_rating INT, -- 1-5 Sterne (optional)
  FOREIGN KEY (briefing_id) REFERENCES generated_briefings(id)
);
```

---

## 6. User Interface

### 6.1 Briefing-Archiv-Seite

**Route:** `/briefings/archive`

**Features:**
- Liste aller Daily und Weekly Briefings (chronologisch)
- Filter nach Typ (Daily/Weekly) und Datum
- Suchfunktion nach Keywords
- Vorschau (Executive Summary + erste Grafik)
- Download als PDF

**Mockup:**
```
┌─────────────────────────────────────────────────────────────┐
│ Mi42 Briefing-Archiv                                  [⚙️]  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ Filter: [Daily ▼] [Letzte 30 Tage ▼]  🔍 [Suche...]        │
│                                                               │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ 📅 Mi42 Morning Update - 11. November 2025            │   │
│ │ ⏱️ 2 Min Lesezeit │ 📊 3 Grafiken │ ✉️ Gesendet 07:00│   │
│ │                                                         │   │
│ │ Aluminiumpreise stiegen gestern um 4,2% auf USD       │   │
│ │ 2.450/Tonne nach Produktionskürzungen in China...     │   │
│ │                                                         │   │
│ │ [Lesen] [PDF Download]                                 │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                               │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ 📊 Mi42 Market Insights - KW 45/2025                  │   │
│ │ ⏱️ 7 Min Lesezeit │ 📊 6 Grafiken │ ✉️ Gesendet Mo 08:00│ │
│ │                                                         │   │
│ │ Top 3 Entwicklungen: Aluminiumpreise +6,8%, Schüco   │   │
│ │ Q3-Zahlen schwach, EU-EPBD-Verschärfung...            │   │
│ │                                                         │   │
│ │ [Lesen] [PDF Download]                                 │   │
│ └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Briefing-Einstellungen

**Route:** `/settings/briefings`

**Features:**
- An/Aus-Schalter für Daily/Weekly Briefings
- Versandzeitpunkt anpassen
- Produkt- und Markt-Konfiguration bearbeiten
- Wettbewerber hinzufügen/entfernen
- Rohstoffe und Börsen-Symbole anpassen
- Vorschau der aktuellen Konfiguration

**Mockup:**
```
┌─────────────────────────────────────────────────────────────┐
│ Briefing-Einstellungen                                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ⚙️ Versandeinstellungen                                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Daily Briefing:  [✓] Aktiviert                          │ │
│ │ Versandzeit:     [07:00] [Europe/Berlin ▼]              │ │
│ │                                                           │ │
│ │ Weekly Briefing: [✓] Aktiviert                          │ │
│ │ Versandzeit:     [Montag] [08:00]                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ 📦 Produktkategorien                                         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ • Kunststofffenster                              [❌]    │ │
│ │ • Aluminiumfenster                               [❌]    │ │
│ │ • Holz-Alu-Fenster                               [❌]    │ │
│ │ [+ Produkt hinzufügen]                                  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ 🏢 Wettbewerber                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ • Schüco (SCHN.DE)                               [❌]    │ │
│ │ • Rehau                                          [❌]    │ │
│ │ • Veka                                           [❌]    │ │
│ │ [+ Wettbewerber hinzufügen]                             │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ 📊 Rohstoffe & Börsen                                        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Rohstoffe: PVC, Aluminium, Holz, Glas           [Bearbeiten]│ │
│ │ Indizes: STOXX 600 Construction                  [Bearbeiten]│ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ [Vorschau generieren] [Speichern]                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Credit-Modell

### Kostenstruktur

**Daily Briefing:**
- **Kostenlos** für alle Kunden (als Basis-Service)
- Automatische Generierung ohne Credit-Abzug
- Begründung: Kundenbindung, tägliche Portal-Nutzung fördern

**Weekly Briefing:**
- **50 Credits** pro Briefing
- Optional: Premium-Version mit erweiterten Analysen (100 Credits)
- Begründung: Höherer Aufwand (mehr Daten, tiefere Analysen, längerer Content)

**Briefing-Archiv:**
- Kostenloser Zugriff auf alle eigenen Briefings
- PDF-Download inklusive

**Anpassungen der Konfiguration:**
- Kostenlos (beliebig oft)
- Vorschau-Generierung: 10 Credits (zum Testen von Änderungen)

### Alternative: Flat-Rate-Modell

**"Mi42 Briefing-Abo":**
- **500 Credits/Monat** für unbegrenzte Daily + Weekly Briefings
- Attraktiv für Power-User (>10 Weekly Briefings/Monat)

---

## 8. Qualitätssicherung & Optimierung

### 8.1 Feedback-Mechanismus

**In jedem Briefing (Footer):**
```
War dieses Briefing hilfreich?
[⭐⭐⭐⭐⭐] [Feedback geben]
```

**Feedback-Optionen:**
- Sternebewertung (1-5)
- Freitext-Kommentar
- Kategorien: "Zu lang", "Zu kurz", "Irrelevante Infos", "Fehlende Infos"

### 8.2 A/B-Testing

**Varianten testen:**
- Länge des Briefings (300 vs. 500 Wörter)
- Anzahl Grafiken (2 vs. 4)
- Versandzeitpunkt (7:00 vs. 8:00 Uhr)
- Tonalität (formal vs. locker)

**Metriken:**
- Öffnungsrate (E-Mail)
- Lesezeit (Portal)
- Klickrate auf Links
- Feedback-Rating

### 8.3 Kontinuierliche Verbesserung

**LLM-Prompt-Optimierung:**
- Basierend auf Feedback automatisch Prompts anpassen
- Beispiel: Wenn Kunden "zu lang" markieren → Prompt um "Maximal 400 Wörter" erweitern

**Datenquellen-Erweiterung:**
- Neue APIs integrieren basierend auf Kundenwünschen
- Beispiel: Wenn viele Kunden nach "Energiepreisen" fragen → Gas/Strom-Preise hinzufügen

---

## 9. Implementierungs-Roadmap

### Phase 1: MVP (4 Wochen)

**Woche 1-2: Datenintegration**
- Yahoo Finance API für Rohstoffe und Aktien
- News API für Branchennews
- World Bank API für Wirtschaftsindikatoren
- Datenbank-Schema erweitern

**Woche 3: Content-Generierung**
- LLM-Prompts für Daily Briefing entwickeln
- Chart-Generierung mit Recharts
- E-Mail-Templates erstellen

**Woche 4: Testing & Launch**
- Beta-Test mit 10 Kunden
- Feedback sammeln und iterieren
- Rollout für alle Kunden

### Phase 2: Erweiterung (4 Wochen)

**Woche 5-6: Weekly Briefing**
- Erweiterte Analysen implementieren
- PDF-Export entwickeln
- Scheduler für Montag-Versand

**Woche 7: UI-Entwicklung**
- Briefing-Archiv-Seite
- Einstellungs-Seite
- Feedback-Mechanismus

**Woche 8: Optimierung**
- A/B-Testing starten
- Performance-Optimierung
- Dokumentation

### Phase 3: Premium-Features (4 Wochen)

**Woche 9-10: Erweiterte Analysen**
- Predictive Analytics (Preisprognosen)
- Sentiment-Analyse von News
- Konkurrenz-Benchmarking

**Woche 11: Personalisierung**
- Individuelle Schwerpunkte pro Kunde
- Adaptive Inhalte basierend auf Leserverhalten
- Custom-Alerts bei kritischen Ereignissen

**Woche 12: Integration**
- API für externe Systeme (CRM, ERP)
- Slack/Teams-Integration
- Mobile App (Push-Benachrichtigungen)

---

## 10. Erfolgskriterien

### Quantitative Metriken

| Metrik | Zielwert (3 Monate nach Launch) |
|--------|----------------------------------|
| Öffnungsrate Daily Briefing | >60% |
| Öffnungsrate Weekly Briefing | >75% |
| Durchschnittliche Lesezeit Daily | >2 Min |
| Durchschnittliche Lesezeit Weekly | >5 Min |
| Feedback-Rating | >4,0/5,0 |
| Portal-Logins pro Woche | +30% vs. vor Launch |
| Churn-Rate | -20% vs. vor Launch |

### Qualitative Metriken

- **Kundenfeedback:** "Briefings sparen mir 30 Minuten tägliche Recherche"
- **Vertriebsnutzung:** Sales-Teams nutzen Briefings für Kundengespräche
- **Entscheidungsqualität:** Kunden treffen schnellere, datenbasierte Entscheidungen

---

## 11. Wettbewerbsvorteile

**Vs. Generic News-Aggregatoren (Bloomberg, Reuters):**
- ✅ Branchenspezifisch (Bau-Zulieferer statt allgemeine Wirtschaft)
- ✅ Vorkonfiguriert (keine manuelle Filterung nötig)
- ✅ Handlungsorientiert (konkrete Empfehlungen statt nur Infos)

**Vs. Marktforschungs-Reports (Principia, Freedonia):**
- ✅ Tagesaktuell (statt quartalsweise)
- ✅ Automatisiert (statt manuell erstellt)
- ✅ Kosteneffizient (50 Credits vs. EUR 5.000+ pro Report)

**Vs. Interne Research-Teams:**
- ✅ Skalierbar (jeder Kunde erhält individuelles Briefing)
- ✅ Konsistent (keine Qualitätsschwankungen)
- ✅ 24/7 verfügbar (keine Urlaubsvertretung nötig)

---

## 12. Risiken & Mitigation

### Risiko 1: Datenqualität

**Problem:** Fehlerhafte oder veraltete Daten führen zu falschen Analysen

**Mitigation:**
- Mehrere Datenquellen für kritische Informationen (Cross-Validation)
- Automatische Plausibilitätschecks (z.B. Preisänderung >20% → manuelle Prüfung)
- Disclaimer in jedem Briefing: "Daten Stand [Zeitstempel], keine Gewähr"

### Risiko 2: LLM-Halluzinationen

**Problem:** LLM erfindet Fakten oder Zusammenhänge

**Mitigation:**
- Strukturierte Prompts mit klaren Datenanweisungen
- Fact-Checking-Layer (zweiter LLM-Call zur Validierung)
- Quellenangaben für alle Aussagen

### Risiko 3: Information Overload

**Problem:** Kunden fühlen sich von täglichen Briefings überfordert

**Mitigation:**
- Opt-Out-Option (jederzeit abschaltbar)
- "Digest-Modus": Nur bei signifikanten Änderungen (>5%) versenden
- Zusammenfassungen auf 2-3 Minuten Lesezeit begrenzen

### Risiko 4: API-Ausfälle

**Problem:** Externe APIs (Yahoo Finance, News API) sind nicht verfügbar

**Mitigation:**
- Fallback auf gecachte Daten (letzte 24h)
- Redundante Datenquellen
- Transparente Kommunikation: "Daten temporär nicht verfügbar"

---

## 13. Zusammenfassung & Next Steps

Das Mi42 Daily & Weekly Briefing-System transformiert das Portal von einer reinen Analyse-Plattform zu einem **proaktiven Market Intelligence-Service**. Durch automatische Vorkonfiguration beim Onboarding und kontinuierliche Lieferung relevanter Informationen wird Mi42 zum **unverzichtbaren täglichen Begleiter** für Bau-Zulieferer weltweit.

**Kernvorteile:**
1. **Zero-Config:** Automatische Einrichtung basierend auf Domain-Analyse
2. **Zeitersparnis:** 30+ Minuten tägliche Recherche eliminiert
3. **Handlungsorientiert:** Konkrete Empfehlungen statt nur Daten
4. **Skalierbar:** Jeder Kunde erhält individuelles Briefing
5. **Kosteneffizient:** Daily kostenlos, Weekly 50 Credits

**Nächste Schritte:**
1. **Prototyp entwickeln** (4 Wochen) - MVP mit Daily Briefing
2. **Beta-Test** (10 Kunden) - Feedback sammeln
3. **Iterieren & Optimieren** (2 Wochen) - Basierend auf Feedback
4. **Rollout** - Für alle Kunden aktivieren
5. **Weekly Briefing hinzufügen** (4 Wochen) - Phase 2

**Geschätzte Entwicklungszeit:** 12 Wochen (MVP + Weekly + UI)  
**Geschätzte Kosten:** ~EUR 30.000 (Entwicklung) + EUR 500/Monat (API-Kosten)  
**Erwarteter ROI:** +30% Portal-Nutzung, -20% Churn, +15% Upsell-Rate

---

**Erstellt von:** Manus AI  
**Datum:** November 2025  
**Version:** 1.0
