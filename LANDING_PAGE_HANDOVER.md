# Mi42 Landing Page – Handover-Dokument

**Version**: 1.0  
**Datum**: 12. November 2025  
**Zweck**: Übergabe aller Informationen für die Entwicklung der Mi42 Landing Page  
**Ziel-Chat**: Neuer Chat für Landing Page-Entwicklung

---

## Executive Summary

Dieses Dokument enthält alle Informationen, die für die Entwicklung der **Mi42 Landing Page** benötigt werden. Die Landing Page ist die zentrale Marketing- und Registrierungs-Plattform für externe Kunden. Sie ist **getrennt von der Hauptanwendung** und fokussiert sich auf:

1. **Marketing**: Produktpräsentation, Features, Pricing, Testimonials
2. **Registrierung**: Freemium-Check, Email-Verifizierung, Account-Erstellung
3. **Onboarding-Redirect**: Weiterleitung zur Hauptanwendung nach erfolgreicher Registrierung

Die **Bezahlfunktion** (Stripe-Integration) wird **in der Hauptanwendung** implementiert, nicht auf der Landing Page. Die Landing Page fokussiert sich ausschließlich auf die Akquise und initiale Registrierung von Freemium-Usern.

---

## 1. Produktkontext

### 1.1 Was ist Mi42?

Mi42 ist ein **KI-gestütztes Marktforschungsportal** für die Bauzulieferindustrie. Es bietet:

- **7 spezialisierte KI-Agenten** für Marktanalyse, Trendforschung, Umfragen, Strategieberatung, Nachfrageprognosen, Projektintelligenz und Preisstrategie
- **Automatisierte Briefings** (täglich/wöchentlich) mit Markt-Updates, Rohstoffpreisen, Börsenindizes und Branchennachrichten
- **Role-Based Access Control** mit 3 Rollen (Admin, Internal, External)

**Zielgruppe**: Führungskräfte und Entscheider in der Bauzulieferindustrie (Zement, Beton, Stahl, Holz, Dämmstoffe, etc.)

**USP**: Einzige Plattform, die branchenspezifische KI-Agenten mit automatisierten Markt-Briefings kombiniert.

### 1.2 Freemium-Modell

**Domain-basiertes Freemium-Limit**:
- Pro Firmen-Domain (z.B. `heidelbergcement.de`) sind **2 Freemium-Registrierungen** erlaubt
- Jeder Freemium-User erhält beim Onboarding **7 kostenlose Analysen** (alle Agenten mit vorausgefüllten Prompts)
- Zusätzlich **5.000 Credits** für manuelle Analysen
- Der **3. User** aus derselben Firma muss sich **kostenpflichtig registrieren**

**Freemium-Exhaustion-Handling**:
- Der 3. User wird informiert, dass das Freemium-Kontingent erschöpft ist
- Er sieht, welche Kollegen bereits registriert sind (optional)
- Er kann sich kostenpflichtig registrieren oder warten (12-Monats-Reset)

**12-Monats-Reset**:
- Nach 12 Monaten stehen erneut 2 Freemium-Slots zur Verfügung

---

## 2. Landing Page-Anforderungen

### 2.1 Ziele

**Primäres Ziel**: Maximierung der Freemium-Registrierungen (externe Kunden)

**Sekundäre Ziele**:
- Produktverständnis vermitteln (Was ist Mi42? Wer profitiert davon?)
- Vertrauen aufbauen (Testimonials, Case Studies, Sicherheit)
- Viralität fördern (Empfehlungs-Mechanismus, Kollegen-Identifikation)

**Conversion-Ziele**:
- **Landing Page → Registrierung**: >15%
- **Registrierung → Email-Verifizierung**: >80%
- **Email-Verifizierung → Onboarding-Abschluss**: >70%

### 2.2 Kern-Seiten

Die Landing Page besteht aus folgenden Seiten:

| Seite | URL | Zweck |
|-------|-----|-------|
| **Homepage** | `/` | Marketing, Hero, Features, Pricing, CTA |
| **Features** | `/features` | Detaillierte Feature-Beschreibungen (7 Agenten + Briefings) |
| **Pricing** | `/pricing` | Freemium-Modell, Credit-Pakete, Subscriptions |
| **About** | `/about` | Über Mi42, Team, Vision |
| **Registrierung** | `/register` | Registrierungs-Formular mit Freemium-Check |
| **Freemium Exhausted** | `/register/exhausted` | Seite für 3. User (Freemium erschöpft) |
| **Email-Verifizierung** | `/verify-email` | Email-Bestätigungs-Seite |
| **Login** | `/login` | Login-Formular (Redirect zur Hauptanwendung) |

### 2.3 Design-Anforderungen

**Design-Stil**: Modern, professionell, vertrauenswürdig

**Farbschema**:
- **Primärfarbe**: Blau (#2563EB) – Vertrauen, Professionalität
- **Sekundärfarbe**: Orange (#F97316) – Energie, Innovation
- **Akzentfarbe**: Grün (#10B981) – Erfolg, Wachstum
- **Hintergrund**: Weiß/Hellgrau (#F9FAFB)

**Typografie**:
- **Überschriften**: Inter, Bold, 32-48px
- **Fließtext**: Inter, Regular, 16-18px
- **CTAs**: Inter, Semibold, 16px

**Komponenten**:
- **Hero-Section**: Großes Bild/Video, klare Value Proposition, prominenter CTA
- **Feature-Cards**: Icons, Überschrift, Kurzbeschreibung
- **Testimonials**: Foto, Name, Firma, Zitat
- **Pricing-Tabelle**: 3 Spalten (Freemium, Professional, Enterprise)
- **FAQ-Accordion**: Häufige Fragen mit Antworten

**Responsive Design**: Mobile-first, optimiert für Desktop, Tablet, Mobile

### 2.4 Copywriting-Richtlinien

**Tone of Voice**: Professionell, vertrauenswürdig, aber zugänglich (nicht zu technisch)

**Value Proposition** (Hero):
> "Marktforschung für die Bauzulieferindustrie – automatisiert, KI-gestützt, präzise"

**Subheadline**:
> "7 spezialisierte KI-Agenten analysieren Märkte, Trends und Wettbewerber. Täglich automatisierte Briefings mit Rohstoffpreisen, Börsenindizes und Branchennachrichten."

**CTA-Texte**:
- Primär: "Jetzt kostenlos starten"
- Sekundär: "Demo ansehen"
- Tertiär: "Mehr erfahren"

**Feature-Beschreibungen**: Fokus auf **Nutzen**, nicht Features (z.B. "Sparen Sie 80% Zeit bei Marktanalysen" statt "KI-gestützte Marktanalyse")

---

## 3. Registrierungs-Flow

### 3.1 Registrierungs-Formular

**Felder**:
```
┌─────────────────────────────────────────────────────────────────┐
│  Kostenlos registrieren                                          │
│                                                                   │
│  Email-Adresse *                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ max.mustermann@heidelbergcement.de                      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  Passwort * (mind. 8 Zeichen)                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ••••••••                                                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  Firmenname *                                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ HeidelbergCement AG                                      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ☑ Ich akzeptiere die Datenschutzerklärung und AGB             │
│                                                                   │
│  [Jetzt kostenlos registrieren]                                 │
│                                                                   │
│  Bereits registriert? [Hier anmelden]                           │
└─────────────────────────────────────────────────────────────────┘
```

**Validierung**:
- Email: Gültiges Format, keine Freemail-Adressen (gmail.com, yahoo.com, etc.)
- Passwort: Mind. 8 Zeichen, mind. 1 Großbuchstabe, 1 Kleinbuchstabe, 1 Zahl
- Firmenname: Mind. 2 Zeichen
- Datenschutz: Muss akzeptiert werden

**Freemail-Warnung**:
```
⚠️ Bitte verwenden Sie Ihre geschäftliche Email-Adresse.
Freemail-Adressen (gmail.com, yahoo.com, etc.) sind nicht erlaubt.
```

### 3.2 Freemium-Check (während Registrierung)

**Ablauf**:
1. User gibt Email-Adresse ein
2. System extrahiert Domain (z.B. `heidelbergcement.de`)
3. System prüft Freemium-Verfügbarkeit via API-Call
4. Falls verfügbar (0/2 oder 1/2): Registrierung fortsetzen
5. Falls erschöpft (2/2): Redirect zu `/register/exhausted`

**API-Endpoint**:
```typescript
POST /api/auth/check-freemium-availability
Body: { email: "max@heidelbergcement.de" }
Response: {
  available: true,
  usedSlots: 1,
  limit: 2
}
```

### 3.3 Freemium-Exhaustion-Page

**Seite für 3. User** (`/register/exhausted?domain=heidelbergcement.de`):

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

**API-Endpoint**:
```typescript
GET /api/auth/freemium-users?domain=heidelbergcement.de
Response: {
  users: [
    { email: "max@...", name: "Max Mustermann", registeredAt: "2025-10-15" },
    { email: "anna@...", name: "Anna Schmidt", registeredAt: "2025-11-03" }
  ],
  resetDate: "2026-10-15"
}
```

### 3.4 Email-Verifizierung

Nach erfolgreicher Registrierung wird eine Bestätigungs-Email versendet:

**Email-Template**:
```
Betreff: Willkommen bei Mi42 – Bitte bestätigen Sie Ihre Email-Adresse

Hallo Max,

vielen Dank für Ihre Registrierung bei Mi42!

Bitte bestätigen Sie Ihre Email-Adresse, um Ihr Konto zu aktivieren:

[Email-Adresse bestätigen]

Nach der Bestätigung erhalten Sie:
✓ 7 kostenlose Analysen (alle Agenten mit vorausgefüllten Prompts)
✓ 5.000 Credits für weitere Analysen
✓ Zugriff auf automatisierte Daily/Weekly Briefings

Der Bestätigungs-Link ist 24 Stunden gültig.

Beste Grüße,
Ihr Mi42-Team
```

**Verifizierungs-Page** (`/verify-email?token=abc123`):

```
┌─────────────────────────────────────────────────────────────────┐
│  ✅ Email-Adresse bestätigt!                                    │
│                                                                   │
│  Ihr Account wurde erfolgreich aktiviert.                       │
│                                                                   │
│  Wir erstellen jetzt Ihre personalisierten Analysen...          │
│  (Dauer: ca. 3-5 Minuten)                                       │
│                                                                   │
│  [Weiter zum Dashboard]                                         │
└─────────────────────────────────────────────────────────────────┘
```

**API-Endpoint**:
```typescript
POST /api/auth/verify-email
Body: { token: "abc123" }
Response: {
  success: true,
  redirectUrl: "https://app.mi42.com/onboarding"
}
```

### 3.5 Redirect zur Hauptanwendung

Nach erfolgreicher Email-Verifizierung wird der User zur **Hauptanwendung** weitergeleitet:

**Redirect-URL**: `https://app.mi42.com/onboarding?userId=123&token=xyz`

Die Hauptanwendung übernimmt dann:
1. Automatische Website-Analyse (basierend auf Email-Domain)
2. Wettbewerber-Identifikation
3. Prompt-Generierung für alle 7 Agenten
4. Parallele Ausführung aller 7 Agenten (3-5 Minuten)
5. Willkommens-Dashboard mit allen 7 Analysen

---

## 4. API-Endpoints (Backend)

Die Landing Page kommuniziert mit der **Hauptanwendungs-API** via tRPC oder REST. Folgende Endpoints werden benötigt:

### 4.1 Registrierung

```typescript
POST /api/auth/check-freemium-availability
Body: { email: string }
Response: {
  available: boolean;
  usedSlots: number;
  limit: number;
  existingUsers?: Array<{ email: string; name: string; registeredAt: string }>;
  resetDate?: string;
}

POST /api/auth/register
Body: {
  email: string;
  password: string;
  companyName: string;
  acceptPrivacy: boolean;
}
Response: {
  success: boolean;
  userId?: number;
  error?: 'freemium_exhausted' | 'email_exists' | 'invalid_email';
  message?: string;
}

POST /api/auth/verify-email
Body: { token: string }
Response: {
  success: boolean;
  redirectUrl?: string;
  error?: 'invalid_token' | 'token_expired';
}

POST /api/auth/resend-verification
Body: { email: string }
Response: {
  success: boolean;
  message: string;
}
```

### 4.2 Freemium-User-Abfrage

```typescript
GET /api/auth/freemium-users?domain=heidelbergcement.de
Response: {
  users: Array<{
    email: string;
    name: string;
    registeredAt: string;
  }>;
  resetDate: string;
}
```

### 4.3 Login

```typescript
POST /api/auth/login
Body: { email: string; password: string }
Response: {
  success: boolean;
  redirectUrl?: string; // Redirect to main app
  error?: 'invalid_credentials' | 'email_not_verified';
}
```

---

## 5. Tech Stack (Landing Page)

**Framework**: Next.js 14 (App Router) oder Astro 4

**Styling**: Tailwind CSS 4

**Komponenten**: shadcn/ui (Button, Card, Dialog, Form, etc.)

**Formular-Validierung**: React Hook Form + Zod

**API-Kommunikation**: tRPC Client oder Axios

**Deployment**: Vercel oder Netlify

**Domain**: `https://mi42.com` (Landing Page) → `https://app.mi42.com` (Hauptanwendung)

---

## 6. Wichtige Dokumente (Referenz)

Folgende Dokumente aus der Hauptanwendung sind relevant:

| Dokument | Pfad | Inhalt |
|----------|------|--------|
| **Produktdokumentation** | `MI42_PRODUCT_DOCUMENTATION.md` | Vollständige Produktbeschreibung, Features, Use Cases, Tech Stack |
| **Registrierungs-Konzept** | `REGISTRATION_ONBOARDING_PAYMENT_CONCEPT.md` | Registrierung, Self-Onboarding, Bezahlung |
| **Erweitertes Freemium-Konzept** | `EXTENDED_FREEMIUM_CONCEPT.md` | Domain-Limit, automatische Analysen, Freemium-Exhaustion |
| **Role Permissions** | `ROLE_PERMISSIONS.md` | Rollen-basierte Zugriffsrechte |

---

## 7. Hauptanwendung (Kontext)

**Deployment**: http://46.224.9.190:3001

**Tech Stack**:
- Frontend: React 19 + TypeScript + Tailwind CSS 4
- Backend: Node.js + Express + tRPC
- Database: MySQL (TiDB)
- Auth: JWT-basiert mit Session-Cookies
- LLM: OpenAI GPT-4 (via Manus API)

**Testuser**:
- Admin: `admin` / `Adm1n!`
- Internal: `internal_user` / `Int3rn`
- External: `external_user` / `Ext3rn`

**Features (bereits implementiert)**:
- ✅ 7 KI-Agenten (Market Analyst, Trend Scout, Survey Assistant, Strategy Consultant, Demand Forecasting, Project Intelligence, Pricing Strategy)
- ✅ Automated Briefings (Daily/Weekly)
- ✅ Role-Based Access Control (Admin, Internal, External)
- ✅ Credit-System (Anzeige, Tracking)
- ⏳ Stripe-Integration (in Entwicklung)
- ⏳ Domain-Freemium-Backend (in Entwicklung)
- ⏳ Automatische Onboarding-Analysen (in Entwicklung)

---

## 8. Abgrenzung: Landing Page vs. Hauptanwendung

| Feature | Landing Page | Hauptanwendung |
|---------|--------------|----------------|
| **Marketing** | ✅ Hero, Features, Pricing, Testimonials | ❌ |
| **Registrierung** | ✅ Formular, Freemium-Check, Email-Verifizierung | ❌ |
| **Login** | ✅ Formular → Redirect zur Hauptanwendung | ✅ Session-Management |
| **Onboarding** | ❌ Redirect zur Hauptanwendung | ✅ 7 automatische Analysen |
| **Agent-Ausführung** | ❌ | ✅ |
| **Briefings** | ❌ | ✅ |
| **Credit-Kauf** | ❌ | ✅ Stripe-Integration |
| **User-Management** | ❌ | ✅ |

**Wichtig**: Die Landing Page ist **rein für Marketing und Registrierung**. Alle Funktionalität (Agenten, Briefings, Credits) ist in der Hauptanwendung.

---

## 9. Nächste Schritte

**Für Landing Page-Entwicklung** (neuer Chat):
1. Projekt-Setup (Next.js/Astro + Tailwind + shadcn/ui)
2. Homepage mit Hero, Features, Pricing, Testimonials
3. Registrierungs-Flow mit Freemium-Check
4. Freemium-Exhaustion-Page
5. Email-Verifizierung
6. Login mit Redirect zur Hauptanwendung
7. Responsive Design + Mobile-Optimierung
8. SEO-Optimierung (Meta-Tags, Sitemap, robots.txt)
9. Analytics-Integration (Google Analytics, Plausible)
10. Deployment (Vercel/Netlify)

**Für Hauptanwendung** (dieser Chat):
1. Stripe-Integration (Credit-Pakete + Subscriptions)
2. Credit-Management-UI (Kauf-Modal, Transaktions-Historie)
3. Domain-Freemium-Backend (API-Endpoints)
4. Automatische Onboarding-Analysen (7 Agenten mit vorausgefüllten Prompts)

---

## 10. Kontakt & Support

**Hauptanwendung-Server**: http://46.224.9.190:3001  
**Testuser-Zugangsdaten**: Siehe Kapitel 7  
**Dokumentation**: Siehe Kapitel 6

Bei Fragen zur Hauptanwendung oder API-Endpoints: Siehe `DEPLOYMENT_TEST_RESULTS.md` und `ROLE_PERMISSIONS.md`.
