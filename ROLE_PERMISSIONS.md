# Role-Based Access Control (RBAC) Documentation

## User Roles

Mi42 implements a three-tier role system to control access to features and agents:

### 1. Admin
**Full system access** - Complete control over all features, users, and settings.

**Permissions:**
- ✅ Access to all 7 agents (unlimited)
- ✅ User management (create, update, delete users)
- ✅ View all automated briefings
- ✅ Manually trigger daily/weekly briefings
- ✅ Access to all features (teams, credits, settings)
- ✅ View and manage all user data
- ✅ Configure system-wide settings

**Agent Access:**
- Market Analyst (200 credits)
- Trend Scout (500 credits)
- Survey Assistant (2000 credits)
- Strategy Advisor (5000 credits)
- Demand Forecasting (1500 credits)
- Project Intelligence (2000 credits)
- Pricing Strategy (1800 credits)

---

### 2. Internal (B+L Staff)
**Standard access** - Full access to all agents and analysis features, but no user management.

**Permissions:**
- ✅ Access to all 7 agents
- ✅ View automated briefings
- ✅ Create and share briefings
- ✅ Team collaboration features
- ✅ Credit management (view balance, purchase credits)
- ✅ Settings (personal preferences, model configuration)
- ❌ User management (cannot create/edit/delete users)
- ❌ Cannot trigger automated briefings manually

**Agent Access:**
- Market Analyst (200 credits)
- Trend Scout (500 credits)
- Survey Assistant (2000 credits)
- Strategy Advisor (5000 credits)
- Demand Forecasting (1500 credits)
- Project Intelligence (2000 credits)
- Pricing Strategy (1800 credits)

---

### 3. External (Customers)
**Limited access** - Restricted to specific agents and features based on subscription.

**Permissions:**
- ⚠️ **Limited agent access** (only 3 agents available)
- ✅ View automated briefings (read-only)
- ✅ Create briefings with allowed agents
- ✅ View shared briefings from teams
- ✅ Credit management (view balance, purchase credits)
- ❌ Cannot access advanced agents (Survey Assistant, Strategy Advisor, Project Intelligence)
- ❌ Cannot create teams or share briefings
- ❌ Cannot access user management
- ❌ Cannot trigger automated briefings manually

**Agent Access (Limited):**
- ✅ Market Analyst (200 credits)
- ✅ Trend Scout (500 credits)
- ✅ Demand Forecasting (1500 credits)
- ❌ Survey Assistant (restricted)
- ❌ Strategy Advisor (restricted)
- ❌ Project Intelligence (restricted)
- ❌ Pricing Strategy (restricted)

---

## Feature Access Matrix

| Feature | Admin | Internal (B+L) | External (Customer) |
|---------|-------|----------------|---------------------|
| **User Management** | ✅ Full | ❌ No | ❌ No |
| **All 7 Agents** | ✅ Yes | ✅ Yes | ⚠️ Limited (3 agents) |
| **Automated Briefings (View)** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Trigger Briefings Manually** | ✅ Yes | ❌ No | ❌ No |
| **Team Creation** | ✅ Yes | ✅ Yes | ❌ No |
| **Briefing Sharing** | ✅ Yes | ✅ Yes | ❌ No |
| **Credit Purchase** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Settings (Personal)** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Model Configuration** | ✅ Yes | ✅ Yes | ❌ No |

---

## Implementation Details

### Backend (tRPC Procedures)

**Admin-only procedures:**
```typescript
// User management
users.list
users.create
users.update
users.resetPassword

// Automated briefings manual trigger
automatedBriefings.triggerDaily
automatedBriefings.triggerWeekly
```

**Role-based agent restrictions:**
```typescript
// External users can only access 3 agents
const allowedAgentsForExternal = [
  'market_analyst',
  'trend_scout',
  'demand_forecasting'
];

// Check in tasks.create procedure
if (ctx.user.role === 'external' && !allowedAgentsForExternal.includes(input.agentType)) {
  throw new TRPCError({
    code: 'FORBIDDEN',
    message: 'This agent is not available for external users'
  });
}
```

### Frontend (UI Restrictions)

**Navigation visibility:**
- "Users" link: Only visible to admins
- "Market Updates" (Automated Briefings): Visible to all, but manual trigger buttons only for admins

**Agent selection:**
- External users: Only see 3 allowed agents
- Internal/Admin: See all 7 agents

**Feature restrictions:**
- Team creation: Disabled for external users
- Briefing sharing: Disabled for external users
- Model configuration: Disabled for external users

---

## Security Considerations

1. **Backend enforcement**: All access control is enforced at the backend level (tRPC procedures)
2. **Frontend hiding**: UI elements are hidden based on role, but backend always validates
3. **Session-based auth**: User role is stored in session and validated on every request
4. **Password security**: Passwords are hashed with bcrypt (10 rounds)
5. **Admin protection**: Admin users cannot be deleted or downgraded by other admins

---

## Testing Checklist

### Admin Role
- [ ] Can access /users page
- [ ] Can create new users
- [ ] Can update user roles
- [ ] Can reset user passwords
- [ ] Can access all 7 agents
- [ ] Can manually trigger daily/weekly briefings
- [ ] Can view all automated briefings

### Internal Role
- [ ] Cannot access /users page
- [ ] Can access all 7 agents
- [ ] Can view automated briefings
- [ ] Cannot manually trigger briefings
- [ ] Can create teams
- [ ] Can share briefings

### External Role
- [ ] Cannot access /users page
- [ ] Can only access 3 agents (Market Analyst, Trend Scout, Demand Forecasting)
- [ ] Cannot access restricted agents (Survey Assistant, Strategy Advisor, Project Intelligence, Pricing Strategy)
- [ ] Can view automated briefings (read-only)
- [ ] Cannot create teams
- [ ] Cannot share briefings
- [ ] Cannot configure models

---

## Future Enhancements

1. **Subscription tiers**: Add multiple external user tiers with different agent access
2. **Credit limits**: Set monthly credit limits per role
3. **Usage analytics**: Track agent usage per role for billing
4. **Custom permissions**: Allow fine-grained permissions per user (beyond roles)
5. **API access**: Add API keys for external integrations with role-based rate limiting
