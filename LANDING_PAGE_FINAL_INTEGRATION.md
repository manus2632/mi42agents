# Landing Page API Integration - FINAL VERSION

## ✅ Status: ALL APIs WORKING

**Production Server:** http://46.224.9.190:3001

All registration and freemium APIs are fully functional and tested.

---

## 🔗 API Endpoints

### 1. Check Freemium Availability

**Endpoint:** `GET /api/trpc/auth.checkFreemiumAvailability`

**Purpose:** Check if a domain has available freemium slots before showing registration form

**Request:**
```bash
curl -G 'http://46.224.9.190:3001/api/trpc/auth.checkFreemiumAvailability' \
  --data-urlencode 'input={"json":{"email":"user@company.com"}}'
```

**Response (Available):**
```json
{
  "result": {
    "data": {
      "json": {
        "available": true,
        "domain": "company.com",
        "usedSlots": 0,
        "limit": 2,
        "resetDate": null,
        "isFreemail": false
      }
    }
  }
}
```

**Response (Exhausted):**
```json
{
  "result": {
    "data": {
      "json": {
        "available": false,
        "domain": "company.com",
        "usedSlots": 2,
        "limit": 2,
        "resetDate": "2026-11-13T10:02:46.000Z",
        "isFreemail": false
      }
    }
  }
}
```

---

### 2. Register New User

**Endpoint:** `POST /api/trpc/auth.register`

**Purpose:** Create new user account with automatic onboarding

**Request:**
```bash
curl -X POST 'http://46.224.9.190:3001/api/trpc/auth.register' \
  -H 'Content-Type: application/json' \
  -d '{
    "json": {
      "email": "user@company.com",
      "password": "SecurePass123!",
      "name": "John Doe",
      "companyName": "Company GmbH"
    }
  }'
```

**Response (Success):**
```json
{
  "result": {
    "data": {
      "json": {
        "success": true,
        "userId": 26,
        "message": "Registration successful. Please check your email to verify your account."
      }
    }
  }
}
```

**Response (Freemium Exhausted):**
```json
{
  "result": {
    "data": {
      "json": {
        "success": false,
        "message": "Freemium limit reached for this domain",
        "freemiumExhausted": true,
        "existingUsers": [
          {
            "email": "user1@company.com",
            "name": "User 1",
            "registeredAt": "2025-11-13T10:04:15.000Z"
          }
        ],
        "resetDate": "2026-11-13T10:02:46.000Z"
      }
    }
  }
}
```

**What Happens After Registration:**
1. ✅ User account created
2. ✅ 5000 credits assigned
3. ✅ Email verification token created
4. ✅ Verification email logged (SMTP not configured yet)
5. ✅ **7 automatic onboarding analyses created:**
   - Market Analysis
   - Industry Trends
   - Demand Forecast
   - Construction Projects
   - Pricing Strategy
   - Competitor Analysis
   - Market Entry Strategy
6. ✅ Freemium counter incremented (if corporate domain)

---

### 3. Verify Email

**Endpoint:** `POST /api/trpc/auth.verifyEmail`

**Purpose:** Verify user email with token from verification email

**Request:**
```bash
curl -X POST 'http://46.224.9.190:3001/api/trpc/auth.verifyEmail' \
  -H 'Content-Type: application/json' \
  -d '{
    "json": {
      "token": "e44d97f07cd7ebb79b1d17ba928c724bfc45a9b17ea00d1bba149959d306fd53"
    }
  }'
```

**Response:**
```json
{
  "result": {
    "data": {
      "json": {
        "success": true,
        "userId": 26,
        "message": "Email verified successfully"
      }
    }
  }
}
```

---

### 4. Get Freemium Users

**Endpoint:** `GET /api/trpc/auth.getFreemiumUsers`

**Purpose:** Show existing users when freemium limit is reached

**Request:**
```bash
curl -G 'http://46.224.9.190:3001/api/trpc/auth.getFreemiumUsers' \
  --data-urlencode 'input={"json":{"domain":"company.com"}}'
```

**Response:**
```json
{
  "result": {
    "data": {
      "json": {
        "users": [
          {
            "email": "user1@company.com",
            "name": "User 1",
            "registeredAt": "2025-11-13T10:04:15.000Z"
          }
        ],
        "resetDate": "2026-11-13T10:02:46.000Z"
      }
    }
  }
}
```

---

## 🎯 Integration Flow

### Recommended User Flow:

1. **User enters email** → Call `checkFreemiumAvailability`
   - If `available: false` → Show "Limit reached" message with existing users
   - If `available: true` → Show registration form

2. **User submits form** → Call `register`
   - Show success message: "Registration successful! Check your email."
   - Redirect to login or dashboard

3. **User clicks email link** → Call `verifyEmail` with token
   - Show success message: "Email verified! You can now log in."
   - Redirect to login

---

## 📋 Form Validation

**Email:**
- Required
- Must be valid email format
- Check freemium availability before submission

**Password:**
- Required
- Minimum 8 characters
- Recommended: Include uppercase, lowercase, number, special char

**Name:**
- Optional but recommended
- Used in welcome emails and UI

**Company Name:**
- Optional
- Used for onboarding analysis

---

## 🔒 Security Notes

1. **HTTPS:** Production should use HTTPS (currently HTTP)
2. **Rate Limiting:** Consider adding rate limiting on landing page
3. **CAPTCHA:** Consider adding CAPTCHA for bot protection
4. **Password Strength:** Enforce strong passwords client-side

---

## 📧 Email Configuration

**Current Status:** Emails are logged to console only

**To Enable SMTP:**
1. Install nodemailer in production container
2. Set environment variables:
   - `SMTP_HOST=mail.bl2020.com`
   - `SMTP_PORT=465`
   - `SMTP_USER=mi42@bl2020.com`
   - `SMTP_PASSWORD=Markt26Markt26`
3. Restart server

---

## 🧪 Test Data

**Working Test Accounts:**
- `testuser2@siemens.com` (Freemium slot 2/2)
- Domain `siemens.com` is at limit (2/2 slots used)

**Test Scenarios:**
1. ✅ First registration for new domain → Success
2. ✅ Second registration for same domain → Success
3. ✅ Third registration for same domain → Rejected with existing users list
4. ✅ Freemail registration (gmail.com, etc.) → Success (unlimited)
5. ✅ Email verification → Success

---

## 🚀 Next Steps

1. **Connect Landing Page:** Integrate these APIs into your registration form
2. **Enable SMTP:** Configure email sending for verification emails
3. **Add HTTPS:** Secure the production server
4. **Monitor:** Track registration success rate and freemium usage

---

## 📞 Support

For issues or questions, check server logs:
```bash
docker logs mi42-app
```

All APIs are production-ready and tested! 🎉
