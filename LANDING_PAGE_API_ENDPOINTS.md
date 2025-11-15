# Landing Page API Endpoints

**Backend URL**: `http://46.224.9.190:3001`  
**API Base Path**: `/api/trpc`

Dieses Dokument beschreibt alle API-Endpoints, die die Landing Page für die Integration mit dem Mi42-Backend benötigt. Alle Endpoints verwenden **tRPC** als API-Framework.

---

## Übersicht

Die Landing Page kommuniziert mit dem Backend über folgende Funktionen:

| Funktion | Endpoint | Methode | Beschreibung |
|----------|----------|---------|--------------|
| Freemium-Check | `auth.checkFreemiumAvailability` | Query | Prüft, ob Domain noch Freemium-Slots hat |
| Registrierung | `auth.register` | Mutation | Erstellt neuen User-Account |
| Email-Verifizierung | `auth.verifyEmail` | Mutation | Verifiziert Email-Adresse |
| Freemium-User-Liste | `auth.getFreemiumUsers` | Query | Holt Liste der Freemium-User einer Domain |
| Login | `auth.login` | Mutation | Authentifiziert User |

---

## 1. Freemium-Verfügbarkeit prüfen

**Endpoint**: `auth.checkFreemiumAvailability`  
**Typ**: Query  
**Zweck**: Prüft, ob für eine Email-Domain noch Freemium-Registrierungen verfügbar sind (max. 2 pro Domain).

### Request

```typescript
{
  email: string; // z.B. "max.mustermann@heidelbergcement.de"
}
```

### Response

```typescript
{
  available: boolean;        // true = Freemium verfügbar, false = Limit erreicht
  domain: string;           // Extrahierte Domain (z.B. "heidelbergcement.de")
  usedSlots: number;        // Anzahl bereits genutzter Freemium-Slots (0-2)
  limit: number;            // Maximale Anzahl Freemium-Slots (2)
  resetDate: string | null; // ISO-Datum, wann neue Slots verfügbar werden (12 Monate nach erstem User)
}
```

### Beispiel-Code (TypeScript/React)

```typescript
import { trpc } from '@/lib/trpc';

function RegistrationForm() {
  const [email, setEmail] = useState('');
  
  const checkFreemium = trpc.auth.checkFreemiumAvailability.useQuery(
    { email },
    { enabled: email.includes('@') } // Nur ausführen, wenn Email valide
  );

  if (checkFreemium.data && !checkFreemium.data.available) {
    return (
      <div>
        <p>Freemium-Limit für {checkFreemium.data.domain} erreicht.</p>
        <p>Nächste Slots verfügbar ab: {checkFreemium.data.resetDate}</p>
      </div>
    );
  }

  return <form>...</form>;
}
```

### Fehlerbehandlung

```typescript
if (checkFreemium.error) {
  console.error('Freemium-Check failed:', checkFreemium.error.message);
  // Zeige Fehlermeldung: "Bitte versuchen Sie es später erneut"
}
```

---

## 2. Benutzer registrieren

**Endpoint**: `auth.register`  
**Typ**: Mutation  
**Zweck**: Erstellt einen neuen User-Account und sendet Verifizierungs-Email.

### Request

```typescript
{
  email: string;              // z.B. "max.mustermann@heidelbergcement.de"
  password: string;           // Mindestens 8 Zeichen
  name: string;               // Vollständiger Name
  companyName?: string;       // Optional: Firmenname
  acceptPrivacy: boolean;     // Muss true sein
}
```

### Response

```typescript
{
  success: boolean;
  userId?: number;            // User-ID (nur bei success: true)
  message: string;            // Erfolgsmeldung oder Fehlerbeschreibung
  verificationEmailSent: boolean; // true, wenn Verifizierungs-Email gesendet wurde
}
```

### Beispiel-Code

```typescript
import { trpc } from '@/lib/trpc';

function RegistrationForm() {
  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        // Zeige Erfolgsmeldung
        alert('Registrierung erfolgreich! Bitte prüfen Sie Ihre E-Mails.');
        // Redirect zu "Email-Verifizierung"-Seite
        router.push('/verify-email');
      }
    },
    onError: (error) => {
      // Zeige Fehlermeldung
      alert(`Registrierung fehlgeschlagen: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({
      email: formData.email,
      password: formData.password,
      name: formData.name,
      companyName: formData.companyName,
      acceptPrivacy: formData.acceptPrivacy,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Formular-Felder */}
      <button type="submit" disabled={registerMutation.isLoading}>
        {registerMutation.isLoading ? 'Registriere...' : 'Registrieren'}
      </button>
    </form>
  );
}
```

### Fehlerbehandlung

Mögliche Fehler:

| Fehler | Beschreibung | Lösung |
|--------|--------------|--------|
| `EMAIL_ALREADY_EXISTS` | Email bereits registriert | "Diese E-Mail ist bereits registriert. Bitte melden Sie sich an." |
| `FREEMIUM_LIMIT_REACHED` | Freemium-Limit für Domain erreicht | Zeige Freemium-Exhaustion-Page mit Upsell |
| `INVALID_EMAIL` | Email-Format ungültig | "Bitte geben Sie eine gültige E-Mail-Adresse ein." |
| `PASSWORD_TOO_SHORT` | Passwort zu kurz | "Passwort muss mindestens 8 Zeichen lang sein." |
| `PRIVACY_NOT_ACCEPTED` | Datenschutz nicht akzeptiert | "Bitte akzeptieren Sie die Datenschutzerklärung." |

---

## 3. Email verifizieren

**Endpoint**: `auth.verifyEmail`  
**Typ**: Mutation  
**Zweck**: Verifiziert die Email-Adresse mit dem Token aus der Verifizierungs-Email.

### Request

```typescript
{
  token: string; // Token aus der Verifizierungs-Email (z.B. aus URL-Parameter)
}
```

### Response

```typescript
{
  success: boolean;
  message: string;
  redirectUrl?: string; // URL zur Hauptanwendung (z.B. "http://46.224.9.190:3001/onboarding")
}
```

### Beispiel-Code

```typescript
import { trpc } from '@/lib/trpc';
import { useSearchParams, useRouter } from 'next/navigation';

function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const verifyMutation = trpc.auth.verifyEmail.useMutation({
    onSuccess: (data) => {
      if (data.success && data.redirectUrl) {
        // Redirect zur Hauptanwendung
        window.location.href = data.redirectUrl;
      }
    },
    onError: (error) => {
      alert(`Verifizierung fehlgeschlagen: ${error.message}`);
    },
  });

  useEffect(() => {
    if (token) {
      verifyMutation.mutate({ token });
    }
  }, [token]);

  return (
    <div>
      {verifyMutation.isLoading && <p>Verifiziere Email...</p>}
      {verifyMutation.isError && <p>Verifizierung fehlgeschlagen. Bitte versuchen Sie es erneut.</p>}
      {verifyMutation.isSuccess && <p>Email erfolgreich verifiziert! Sie werden weitergeleitet...</p>}
    </div>
  );
}
```

### Fehlerbehandlung

| Fehler | Beschreibung | Lösung |
|--------|--------------|--------|
| `INVALID_TOKEN` | Token ungültig oder abgelaufen | "Verifizierungs-Link ungültig. Bitte fordern Sie einen neuen an." |
| `EMAIL_ALREADY_VERIFIED` | Email bereits verifiziert | "Ihre E-Mail ist bereits verifiziert. Sie können sich anmelden." |

---

## 4. Freemium-User einer Domain abrufen

**Endpoint**: `auth.getFreemiumUsers`  
**Typ**: Query  
**Zweck**: Holt die Liste der Freemium-User einer Domain (für 3. User, der Kollegen kontaktieren möchte).

### Request

```typescript
{
  domain: string; // z.B. "heidelbergcement.de"
}
```

### Response

```typescript
{
  users: Array<{
    email: string;        // z.B. "max.mustermann@heidelbergcement.de"
    name: string;         // z.B. "Max Mustermann"
    registeredAt: string; // ISO-Datum (z.B. "2025-01-15T10:30:00Z")
  }>;
  resetDate: string; // ISO-Datum, wann neue Freemium-Slots verfügbar werden
}
```

### Beispiel-Code

```typescript
import { trpc } from '@/lib/trpc';

function FreemiumExhaustedPage({ domain }: { domain: string }) {
  const freemiumUsers = trpc.auth.getFreemiumUsers.useQuery({ domain });

  if (freemiumUsers.isLoading) return <p>Lade Informationen...</p>;

  return (
    <div>
      <h2>Freemium-Limit für {domain} erreicht</h2>
      <p>Folgende Kollegen haben bereits Freemium-Accounts:</p>
      <ul>
        {freemiumUsers.data?.users.map((user) => (
          <li key={user.email}>
            {user.name} ({user.email})
            <br />
            Registriert am: {new Date(user.registeredAt).toLocaleDateString('de-DE')}
          </li>
        ))}
      </ul>
      <p>Neue Freemium-Slots verfügbar ab: {new Date(freemiumUsers.data?.resetDate).toLocaleDateString('de-DE')}</p>
      <button>Jetzt kostenpflichtig registrieren</button>
    </div>
  );
}
```

---

## 5. Login

**Endpoint**: `auth.login`  
**Typ**: Mutation  
**Zweck**: Authentifiziert User und erstellt Session-Cookie.

### Request

```typescript
{
  username: string; // Email oder Username
  password: string;
}
```

### Response

```typescript
{
  success: boolean;
  user?: {
    id: number;
    username: string;
    name: string;
    email: string;
    role: 'admin' | 'internal' | 'external';
  };
  message?: string; // Fehlermeldung bei success: false
}
```

### Beispiel-Code

```typescript
import { trpc } from '@/lib/trpc';

function LoginForm() {
  const router = useRouter();
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        // Redirect zur Hauptanwendung
        window.location.href = 'http://46.224.9.190:3001/';
      } else {
        alert(data.message || 'Login fehlgeschlagen');
      }
    },
    onError: (error) => {
      alert(`Login fehlgeschlagen: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({
      username: formData.username,
      password: formData.password,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Email oder Benutzername"
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
      />
      <input
        type="password"
        placeholder="Passwort"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      <button type="submit" disabled={loginMutation.isLoading}>
        {loginMutation.isLoading ? 'Anmelden...' : 'Anmelden'}
      </button>
    </form>
  );
}
```

---

## tRPC Client-Setup

Um die Endpoints zu verwenden, muss die Landing Page einen tRPC-Client konfigurieren:

### Installation

```bash
npm install @trpc/client @trpc/react-query @tanstack/react-query
```

### Client-Konfiguration

```typescript
// lib/trpc.ts
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../../../server/routers'; // Type-Import vom Backend

export const trpc = createTRPCReact<AppRouter>();
```

### Provider-Setup

```typescript
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import { trpc } from '@/lib/trpc';

export function Providers({ children }: { children: React.Node }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: 'http://46.224.9.190:3001/api/trpc', // Backend-URL
          credentials: 'include', // Wichtig für Session-Cookies
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

### App-Wrapper

```typescript
// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.Node }) {
  return (
    <html lang="de">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

## Umgebungsvariablen

Die Landing Page benötigt folgende Umgebungsvariable:

```env
# .env.local
NEXT_PUBLIC_API_URL=http://46.224.9.190:3001
```

Verwende diese Variable in der tRPC-Client-Konfiguration:

```typescript
url: `${process.env.NEXT_PUBLIC_API_URL}/api/trpc`,
```

---

## CORS-Konfiguration (Backend)

Das Backend muss CORS für die Landing Page-Domain aktivieren. Falls die Landing Page auf einer anderen Domain läuft (z.B. `https://mi42.com`), muss das Backend entsprechend konfiguriert werden:

```typescript
// server/_core/index.ts
app.use(cors({
  origin: ['https://mi42.com', 'http://localhost:3000'], // Landing Page-Domains
  credentials: true, // Wichtig für Session-Cookies
}));
```

---

## Fehlerbehandlung (Global)

Alle tRPC-Endpoints können folgende generische Fehler zurückgeben:

| HTTP Status | tRPC Code | Beschreibung | Lösung |
|-------------|-----------|--------------|--------|
| 400 | `BAD_REQUEST` | Ungültige Request-Parameter | Formular-Validierung verbessern |
| 401 | `UNAUTHORIZED` | Nicht authentifiziert | Redirect zu Login-Seite |
| 403 | `FORBIDDEN` | Keine Berechtigung | "Sie haben keine Berechtigung für diese Aktion." |
| 404 | `NOT_FOUND` | Ressource nicht gefunden | "Die angeforderte Ressource wurde nicht gefunden." |
| 500 | `INTERNAL_SERVER_ERROR` | Server-Fehler | "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut." |

### Globale Error-Handler

```typescript
// lib/trpc.ts
import { TRPCClientError } from '@trpc/client';

export function handleTRPCError(error: unknown) {
  if (error instanceof TRPCClientError) {
    switch (error.data?.code) {
      case 'UNAUTHORIZED':
        // Redirect zu Login
        window.location.href = '/login';
        break;
      case 'FORBIDDEN':
        alert('Sie haben keine Berechtigung für diese Aktion.');
        break;
      case 'NOT_FOUND':
        alert('Die angeforderte Ressource wurde nicht gefunden.');
        break;
      default:
        alert(`Fehler: ${error.message}`);
    }
  } else {
    alert('Ein unerwarteter Fehler ist aufgetreten.');
  }
}
```

---

## Testing

### Beispiel: Freemium-Check testen

```bash
curl -X POST http://46.224.9.190:3001/api/trpc/auth.checkFreemiumAvailability \
  -H "Content-Type: application/json" \
  -d '{"0":{"json":{"email":"test@heidelbergcement.de"}}}'
```

### Beispiel: Registrierung testen

```bash
curl -X POST http://46.224.9.190:3001/api/trpc/auth.register \
  -H "Content-Type: application/json" \
  -d '{
    "0": {
      "json": {
        "email": "test@heidelbergcement.de",
        "password": "TestPass123!",
        "name": "Test User",
        "companyName": "HeidelbergCement",
        "acceptPrivacy": true
      }
    }
  }'
```

---

## Zusammenfassung

Die Landing Page benötigt **5 API-Endpoints**:

1. **checkFreemiumAvailability** - Prüft Freemium-Verfügbarkeit
2. **register** - Erstellt User-Account
3. **verifyEmail** - Verifiziert Email-Adresse
4. **getFreemiumUsers** - Holt Freemium-User einer Domain
5. **login** - Authentifiziert User

Alle Endpoints verwenden **tRPC** und kommunizieren über `http://46.224.9.190:3001/api/trpc`. Die Landing Page muss einen tRPC-Client konfigurieren und Session-Cookies aktivieren (`credentials: 'include'`).

**Wichtig**: Nach erfolgreicher Registrierung und Email-Verifizierung wird der User zur Hauptanwendung weitergeleitet (`http://46.224.9.190:3001/onboarding`), wo die automatischen Onboarding-Analysen (7 Agenten) gestartet werden.
