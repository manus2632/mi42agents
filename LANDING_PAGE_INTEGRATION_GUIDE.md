# Landing Page Integration Guide
**Mi42 Registration & Onboarding API**  
**Version:** 1.0  
**Last Updated:** 13. November 2025

---

## Overview

This guide provides complete integration instructions for connecting the Mi42 landing page to the registration and onboarding backend. The system automatically creates 7 pre-filled market analyses for each new user upon registration.

**Key Features:**
- Domain-based freemium tracking (2 users per company domain)
- Email verification with 24-hour token validity
- Automatic onboarding with 7 AI-powered market analyses
- 5,000 free credits for each new user
- SMTP email delivery with HTML templates

---

## API Base URL

```
Production: http://46.224.9.190:3001/api/trpc
```

All API endpoints use **tRPC** protocol with JSON payloads.

---

## Registration Flow

### Step 1: Check Freemium Availability

Before showing the registration form, check if the user's email domain still has freemium slots available.

**Endpoint:** `GET /api/trpc/auth.checkFreemiumAvailability`

**Query Parameters:**
```javascript
{
  input: {
    json: {
      email: "user@company.com"
    }
  }
}
```

**Example Request:**
```javascript
const response = await fetch(
  'http://46.224.9.190:3001/api/trpc/auth.checkFreemiumAvailability?' + 
  new URLSearchParams({
    input: JSON.stringify({
      json: { email: "user@heidelbergcement.de" }
    })
  })
);

const data = await response.json();
```

**Success Response:**
```json
{
  "result": {
    "data": {
      "json": {
        "available": true,
        "used": 1,
        "limit": 2,
        "domain": "heidelbergcement.de",
        "resetDate": "2026-11-12T10:30:00.000Z"
      }
    }
  }
}
```

**Limit Reached Response:**
```json
{
  "result": {
    "data": {
      "json": {
        "available": false,
        "used": 2,
        "limit": 2,
        "domain": "heidelbergcement.de",
        "resetDate": "2026-11-12T10:30:00.000Z",
        "existingUsers": [
          {
            "id": 27,
            "username": "testuser",
            "email": "test@heidelbergcement.de",
            "createdAt": "2025-11-12T10:30:00.000Z"
          },
          {
            "id": 28,
            "username": "testuser2",
            "email": "test2@heidelbergcement.de",
            "createdAt": "2025-11-12T10:35:00.000Z"
          }
        ]
      }
    }
  }
}
```

**UI Recommendation:**
- If `available === false`, show message: "Your company domain has reached the freemium limit (2 users). Please contact one of your colleagues or upgrade to a paid plan."
- Display `existingUsers` list with names and emails
- Show `resetDate` for when the limit resets (12 months from first registration)

---

### Step 2: Register User

After freemium check passes, submit the registration form.

**Endpoint:** `POST /api/trpc/auth.register`

**Request Body:**
```javascript
{
  json: {
    email: "user@company.com",
    password: "SecurePassword123!",
    name: "John Doe",
    companyName: "Company GmbH"  // Optional, extracted from domain if not provided
  }
}
```

**Example Request:**
```javascript
const response = await fetch('http://46.224.9.190:3001/api/trpc/auth.register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    json: {
      email: "user@heidelbergcement.de",
      password: "SecurePassword123!",
      name: "Max Mustermann",
      companyName: "HeidelbergCement AG"
    }
  })
});

const data = await response.json();
```

**Success Response:**
```json
{
  "result": {
    "data": {
      "json": {
        "success": true,
        "userId": 31,
        "message": "Registration successful. Please check your email to verify your account."
      }
    }
  }
}
```

**Error Response (Freemium Limit):**
```json
{
  "error": {
    "json": {
      "message": "Freemium limit reached for this domain. Contact existing users or upgrade.",
      "code": "FORBIDDEN",
      "data": {
        "code": "FORBIDDEN",
        "httpStatus": 403,
        "path": "auth.register"
      }
    }
  }
}
```

**What Happens After Registration:**

1. **User Created** - Account created with role `external`, `isFreemium: true`
2. **5,000 Credits Assigned** - Initial credit balance
3. **Email Verification Sent** - 24-hour token sent to user's email
4. **Freemium Tracking Updated** - Domain slot counter incremented
5. **Onboarding Triggered** - 7 market analyses created asynchronously
6. **Welcome Email Sent** - After 30 seconds (when analyses are ready)

---

### Step 3: Email Verification

User receives verification email with link: `http://46.224.9.190:3001/verify-email?token={token}`

**Frontend Page:** Already implemented at `/verify-email`

**Endpoint:** `POST /api/trpc/auth.verifyEmail`

**Request Body:**
```javascript
{
  json: {
    token: "abc123def456..."
  }
}
```

**Example Request:**
```javascript
const response = await fetch('http://46.224.9.190:3001/api/trpc/auth.verifyEmail', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    json: {
      token: urlParams.get('token')
    }
  })
});

const data = await response.json();
```

**Success Response:**
```json
{
  "result": {
    "data": {
      "json": {
        "success": true,
        "message": "Email verified successfully. You can now log in."
      }
    }
  }
}
```

**Error Response (Expired Token):**
```json
{
  "error": {
    "json": {
      "message": "Invalid or expired verification token",
      "code": "BAD_REQUEST"
    }
  }
}
```

---

## Automatic Onboarding

### What Gets Created

After registration, the system automatically creates **7 market analyses** tailored to the user's company:

| # | Agent | Analysis Title | Estimated Credits |
|---|-------|----------------|-------------------|
| 1 | Market Analyst | Market Analysis: {Company} | 200 |
| 2 | Trend Scout | Industry Trends for {Company} | 500 |
| 3 | Demand Forecasting | Demand Forecast: {Company} Region | 1,500 |
| 4 | Project Intelligence | Construction Projects Near {Company} | 2,000 |
| 5 | Pricing Strategy | Pricing Strategy for {Company} | 1,800 |
| 6 | Survey Assistant | Competitor Analysis: {Company} | 2,000 |
| 7 | Strategy Advisor | Market Entry Strategy for {Company} | 5,000 |

**Total Estimated Credits:** 13,000 credits (but user only gets 5,000 initial credits - analyses are free during onboarding)

### Onboarding Timeline

```
T+0s:   User submits registration
T+1s:   User created, credits assigned, verification email sent
T+2s:   Onboarding triggered (7 tasks created)
T+3-10s: AI agents execute analyses in parallel
T+30s:  Welcome email sent with link to dashboard
```

### Checking Onboarding Status

**Endpoint:** `GET /api/trpc/user.getOnboardingStatus`

**Example Request:**
```javascript
const response = await fetch(
  'http://46.224.9.190:3001/api/trpc/user.getOnboardingStatus',
  {
    headers: {
      'Cookie': sessionCookie  // User must be authenticated
    }
  }
);

const data = await response.json();
```

**Response:**
```json
{
  "result": {
    "data": {
      "json": {
        "onboardingCompleted": true,
        "tasksCreated": 7,
        "tasksCompleted": 7,
        "tasksPending": 0,
        "tasksFailed": 0
      }
    }
  }
}
```

---

## Email Templates

### Verification Email

**Subject:** Verify your Mi42 account

**Content:**
```
Hi {name},

Thank you for registering with Mi42!

To complete your registration and start using our AI-powered market 
intelligence platform, please verify your email address.

[Verify Email Address Button]

This verification link will expire in 24 hours.

If you didn't create a Mi42 account, you can safely ignore this email.

Best regards,
The Mi42 Team
```

**SMTP Configuration:**
- Host: `mail.bl2020.com`
- Port: `465` (SSL)
- From: `Mi42 <mi42@bl2020.com>`

### Welcome Email

**Subject:** Welcome to Mi42 - Your market analyses are ready!

**Content:**
```
Hi {name},

Welcome to Mi42! We're excited to have you on board.

We've automatically generated 7 comprehensive market analyses 
tailored to your company. These analyses cover:

✓ Market analysis for construction suppliers
✓ Current industry trends
✓ Demand forecasting for your region
✓ Construction project intelligence
✓ Pricing strategy recommendations
✓ Competitor landscape analysis
✓ Market entry strategies

[View Your Analyses Button]

You started with 5,000 credits to explore our platform.

Best regards,
The Mi42 Team
```

---

## Landing Page UI Recommendations

### Registration Form

**Required Fields:**
- Email (validated, company domain required)
- Password (min 8 characters, 1 uppercase, 1 number, 1 special char)
- Name (full name)
- Company Name (optional, auto-extracted from email domain)

**Optional Fields:**
- Phone number
- Job title
- Company size

**Validation:**
1. Check email format
2. Check if email domain is corporate (not gmail.com, outlook.com, etc.)
3. Call `checkFreemiumAvailability` before showing form
4. Show freemium status: "X/2 slots used for your company domain"

**Success Message:**
```
✅ Registration Successful!

We've sent a verification email to {email}.

While you wait, we're already preparing 7 personalized market analyses 
for your company. These will be ready in your dashboard as soon as you 
verify your email.

Check your inbox and click the verification link to get started!
```

**Error Handling:**
- **Freemium Limit Reached:** Show existing users, suggest contacting them or upgrading
- **Email Already Registered:** Show login link
- **Invalid Email Domain:** "Please use your company email address"
- **Weak Password:** Show password requirements

---

## Example Integration Code

### React Registration Form

```jsx
import { useState } from 'react';

function RegistrationForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [freemiumStatus, setFreemiumStatus] = useState(null);

  // Check freemium availability when email changes
  const checkFreemium = async (email) => {
    if (!email.includes('@')) return;
    
    try {
      const response = await fetch(
        'http://46.224.9.190:3001/api/trpc/auth.checkFreemiumAvailability?' + 
        new URLSearchParams({
          input: JSON.stringify({ json: { email } })
        })
      );
      
      const data = await response.json();
      setFreemiumStatus(data.result.data.json);
    } catch (err) {
      console.error('Freemium check failed:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://46.224.9.190:3001/api/trpc/auth.register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          json: {
            email,
            password,
            name,
            companyName
          }
        })
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error.json.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="success-message">
        <h2>✅ Registration Successful!</h2>
        <p>We've sent a verification email to <strong>{email}</strong>.</p>
        <p>
          While you wait, we're already preparing <strong>7 personalized market analyses</strong> 
          for your company. These will be ready in your dashboard as soon as you verify your email.
        </p>
        <p>Check your inbox and click the verification link to get started!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register for Mi42</h2>
      
      {freemiumStatus && !freemiumStatus.available && (
        <div className="error-message">
          <p>Your company domain has reached the freemium limit (2 users).</p>
          <p>Existing users:</p>
          <ul>
            {freemiumStatus.existingUsers.map(user => (
              <li key={user.id}>{user.name} ({user.email})</li>
            ))}
          </ul>
          <p>Please contact one of your colleagues or upgrade to a paid plan.</p>
        </div>
      )}

      {freemiumStatus && freemiumStatus.available && (
        <div className="info-message">
          <p>Freemium slots: {freemiumStatus.used}/{freemiumStatus.limit} used</p>
        </div>
      )}

      <div>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            checkFreemium(e.target.value);
          }}
          required
        />
      </div>

      <div>
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />
      </div>

      <div>
        <label>Full Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Company Name (optional)</label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <button 
        type="submit" 
        disabled={loading || (freemiumStatus && !freemiumStatus.available)}
      >
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}
```

---

## Testing

### Test Registration Flow

```bash
# 1. Check freemium availability
curl -G 'http://46.224.9.190:3001/api/trpc/auth.checkFreemiumAvailability' \
  --data-urlencode 'input={"json":{"email":"test@siemens.com"}}'

# 2. Register user
curl -X POST 'http://46.224.9.190:3001/api/trpc/auth.register' \
  -H 'Content-Type: application/json' \
  -d '{"json":{"email":"test@siemens.com","password":"TestPass123!","name":"Test User","companyName":"Siemens AG"}}'

# 3. Check verification email in server logs
ssh root@46.224.9.190 'docker logs mi42-app 2>&1 | grep "VERIFICATION EMAIL" -A 20'

# 4. Extract token and verify
curl -X POST 'http://46.224.9.190:3001/api/trpc/auth.verifyEmail' \
  -H 'Content-Type: application/json' \
  -d '{"json":{"token":"TOKEN_FROM_EMAIL"}}'
```

---

## Troubleshooting

### Common Issues

**1. Freemium check returns error**
- **Cause:** Invalid email format or freemail domain (gmail.com, etc.)
- **Solution:** Validate email domain before calling API

**2. Registration fails with "Freemium limit reached"**
- **Cause:** Domain already has 2 registered users
- **Solution:** Show existing users, suggest contacting them or upgrading

**3. Email verification fails**
- **Cause:** Token expired (24 hours) or already used
- **Solution:** Provide "Resend verification email" button

**4. Onboarding analyses not created**
- **Cause:** Background job failed or insufficient credits
- **Solution:** Check server logs, retry onboarding manually

**5. SMTP email not received**
- **Cause:** SMTP configuration error or email blocked by spam filter
- **Solution:** Check server logs for SMTP errors, verify email server settings

---

## Security Considerations

### Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number
- At least 1 special character

### Rate Limiting

- Registration: 5 attempts per IP per hour
- Email verification: 10 attempts per token
- Freemium check: 20 requests per IP per minute

### CORS Configuration

**Allowed Origins:**
- `https://mi42.de` (production landing page)
- `http://localhost:3000` (development)

**Allowed Methods:**
- `GET`, `POST`, `OPTIONS`

**Allowed Headers:**
- `Content-Type`, `Authorization`, `Cookie`

---

## Support

For integration support or questions:
- **Email:** mi42@bl2020.com
- **Server:** http://46.224.9.190:3001
- **Documentation:** This guide

---

**Last Updated:** 13. November 2025  
**Version:** 1.0  
**Author:** Manus AI
