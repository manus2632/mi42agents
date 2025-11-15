# Start-Prompt für Landing Page-Entwicklung

**Kopiere diesen Text und starte einen neuen Chat:**

---

Ich möchte eine **professionelle Landing Page für Mi42** entwickeln – ein KI-gestütztes Marktforschungsportal für die Bauzulieferindustrie.

## Projekt-Kontext

**Produkt**: Mi42 bietet 7 spezialisierte KI-Agenten (Market Analyst, Trend Scout, Survey Assistant, Strategy Consultant, Demand Forecasting, Project Intelligence, Pricing Strategy) und automatisierte Daily/Weekly Briefings mit Markt-Updates, Rohstoffpreisen und Branchennachrichten.

**Zielgruppe**: Führungskräfte und Entscheider in der Bauzulieferindustrie (Zement, Beton, Stahl, Holz, Dämmstoffe, etc.)

**Freemium-Modell**: Domain-basiertes Limit – pro Firma (z.B. `heidelbergcement.de`) sind 2 Freemium-Registrierungen erlaubt. Jeder Freemium-User erhält 7 kostenlose Analysen (alle Agenten mit vorausgefüllten Prompts) + 5.000 Credits. Der 3. User aus derselben Firma muss sich kostenpflichtig registrieren.

## Aufgabe

Entwickle eine **moderne, conversion-optimierte Landing Page** mit folgenden Komponenten:

### 1. Homepage
- **Hero-Section**: Klare Value Proposition, prominenter CTA ("Jetzt kostenlos starten")
- **Feature-Section**: 7 Agenten + Automated Briefings mit Icons und Kurzbeschreibungen
- **Pricing-Section**: Freemium-Modell, Credit-Pakete, Subscriptions
- **Testimonials**: 3-4 Kundenzitate mit Foto, Name, Firma
- **FAQ**: Häufige Fragen (Accordion)
- **Footer**: Links, Kontakt, Datenschutz, Impressum

### 2. Registrierungs-Flow
- **Registrierungs-Formular**: Email, Passwort, Firmenname, Datenschutz-Checkbox
- **Freemium-Check**: Automatische Prüfung, ob Domain bereits 2 Freemium-User hat
- **Freemium-Exhaustion-Page**: Seite für 3. User mit Kollegen-Identifikation und Upsell
- **Email-Verifizierung**: Bestätigungs-Email + Verifizierungs-Page
- **Redirect zur Hauptanwendung**: Nach erfolgreicher Verifizierung

### 3. Weitere Seiten
- **Features-Page**: Detaillierte Beschreibung aller 7 Agenten + Briefings
- **Pricing-Page**: Freemium, Credit-Pakete (80-1.200 €), Subscriptions (99-1.499 €/Monat)
- **About-Page**: Über Mi42, Team, Vision
- **Login-Page**: Login-Formular mit Redirect zur Hauptanwendung

## Tech Stack (Empfehlung)

- **Framework**: Next.js 14 (App Router) oder Astro 4
- **Styling**: Tailwind CSS 4
- **Komponenten**: shadcn/ui (Button, Card, Dialog, Form, etc.)
- **Formular-Validierung**: React Hook Form + Zod
- **API-Kommunikation**: tRPC Client oder Axios
- **Deployment**: Vercel oder Netlify

## Design-Anforderungen

**Farbschema**:
- Primärfarbe: Blau (#2563EB) – Vertrauen, Professionalität
- Sekundärfarbe: Orange (#F97316) – Energie, Innovation
- Akzentfarbe: Grün (#10B981) – Erfolg, Wachstum

**Tone of Voice**: Professionell, vertrauenswürdig, aber zugänglich (nicht zu technisch)

**Responsive Design**: Mobile-first, optimiert für Desktop, Tablet, Mobile

## API-Endpoints (Backend)

Die Landing Page kommuniziert mit der Hauptanwendungs-API:

```typescript
// Freemium-Check
POST /api/auth/check-freemium-availability
Body: { email: string }
Response: { available: boolean; usedSlots: number; limit: number }

// Registrierung
POST /api/auth/register
Body: { email: string; password: string; companyName: string; acceptPrivacy: boolean }
Response: { success: boolean; userId?: number; error?: string }

// Email-Verifizierung
POST /api/auth/verify-email
Body: { token: string }
Response: { success: boolean; redirectUrl?: string }

// Freemium-User-Abfrage (für 3. User)
GET /api/auth/freemium-users?domain=heidelbergcement.de
Response: { users: Array<{ email, name, registeredAt }>; resetDate: string }
```

## Wichtige Dokumente

Ich habe folgende Dokumente vorbereitet:

1. **LANDING_PAGE_HANDOVER.md** – Vollständiges Handover-Dokument mit allen Details
2. **MI42_PRODUCT_DOCUMENTATION.md** – Produktbeschreibung, Features, Use Cases, Tech Stack
3. **REGISTRATION_ONBOARDING_PAYMENT_CONCEPT.md** – Registrierung, Self-Onboarding, Bezahlung
4. **EXTENDED_FREEMIUM_CONCEPT.md** – Domain-Limit, automatische Analysen, Freemium-Exhaustion

**Bitte lies zuerst `LANDING_PAGE_HANDOVER.md` für den vollständigen Kontext.**

## Ziele

**Conversion-Ziele**:
- Landing Page → Registrierung: >15%
- Registrierung → Email-Verifizierung: >80%
- Email-Verifizierung → Onboarding-Abschluss: >70%

**Viralität**:
- Freemium-User empfehlen Kollegen (Referral-Rate >40%)
- 3. User kontaktiert bestehende Freemium-User (>50%)
- Viral-Coefficient: >0,8 (jeder Freemium-User bringt fast 1 neuen User)

## Nächste Schritte

1. Erstelle ein Next.js/Astro-Projekt mit Tailwind + shadcn/ui
2. Implementiere die Homepage mit Hero, Features, Pricing, Testimonials
3. Implementiere den Registrierungs-Flow mit Freemium-Check
4. Implementiere die Freemium-Exhaustion-Page
5. Implementiere Email-Verifizierung und Redirect zur Hauptanwendung
6. Optimiere für Mobile + SEO
7. Deploye auf Vercel/Netlify

**Wichtig**: Die Bezahlfunktion (Stripe-Integration) wird **nicht** auf der Landing Page implementiert, sondern in der Hauptanwendung. Die Landing Page fokussiert sich ausschließlich auf Marketing und Registrierung.

---

**Bitte starte mit der Entwicklung der Landing Page. Lies zuerst `LANDING_PAGE_HANDOVER.md` für den vollständigen Kontext.**
