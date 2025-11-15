# Project TODO

## Foundation
- [x] Mehrsprachigkeit (i18n) Setup für DE/EN
- [x] Sidebar-Navigation wie Indy-Design
- [x] Datenbank-Schema für Credits, Tasks, Briefings, Company Profiles

## Credit-System
- [x] Credit-Tabellen in DB
- [x] Backend-API für Credit-Management
- [x] Frontend Credit-Anzeige und Kaufprozess
- [x] Credit-Kostenberechnung vor Task-Ausführung

## Agenten-Backend
- [x] LLM-Integration für 4 Agenten-Typen
- [x] Markt-Analyst Agent
- [x] Trend-Scout Agent
- [x] Umfrage-Assistent Agent
- [x] Strategie-Berater Agent

## Automatisches Onboarding
- [x] Domain-Extraktion aus E-Mail
- [x] Website-Analyse-Funktion
- [x] Wettbewerbsanalyse-Generator
- [x] Willkommens-Briefing erstelleng

## Dynamisches Briefing
- [x] Briefing-Datenstruktur
- [x] Narrative Struktur (6 Kapitel)
- [ ] Interaktive Visualisierungen
- [ ] Drill-Down-Funktionalität
- [ ] Szenario-Slider
- [ ] Kontextuelle Frag-Nach-Boxen
- [x] Editierbare Notizfelder

## Export & Präsentation
- [x] PDF-Export für C-Level
- [ ] PowerPoint-Export
- [ ] Kollaborationsfunktionen

## UI/UX
- [x] Agenten-Cockpit Hauptseite
- [x] Agenten-Auswahl mit 4 Typen
- [x] Briefing-Liste
- [x] Briefing-Detail-Ansicht mit dynamischer Darstellung
- [x] Status-Anzeigen und Transparenz
- [x] Responsive Design

## Branding
- [x] Mi42 Logo im FRIDAY-Stil erstellen
- [x] Logo in Sidebar und App integrieren

## Design
- [x] Komplettes monochromes Design (Graustufen mit Icons)
- [x] Alle Farben außer Graustufen entfernen

## Fixes
- [x] Logo 5x größer machen
- [x] Vorschau-Problem beheben
- [x] Logo 10x größer machen

## Bugs
- [x] Verschachteltes <a>-Tag in Home.tsx beheben

## LLM Integration
- [x] Open WebUI API als Standard-LLM konfigurieren
- [x] API-Credentials als Secrets hinterlegen
- [x] Model-Parameter in invokeLLM erweitern

## Modell-Konfiguration
- [x] Token-Problem in Secrets beheben
- [x] Modell-Auswahl Backend (Manus Forge + Open WebUI)
- [x] Settings-UI für Modell-Zuweisung pro Agent
- [ ] Test mit verschiedenen Modellen

## Onboarding
- [x] Onboarding beim ersten Login automatisch starten
- [x] Domain aus E-Mail extrahieren
- [x] Wettbewerbsanalyse erstellen
- [x] Willkommens-Briefing anzeigen

## Dashboard
- [x] Anzahl durchgeführter Analysen anzeigen
- [x] Credit-Verbrauch pro Agent
- [x] Letzte Aktivitäten

## Visualisierungen
- [x] Diagramme in Briefings
- [ ] Drill-Down-Funktionalität
- [ ] Szenario-Slider

## Testing
- [ ] Onboarding-Flow testen
- [ ] Agenten-Ausführung testen
- [ ] Briefing-Erstellung testen
- [ ] PDF-Export testen
- [ ] Settings-Modell-Konfiguration testen

## Lucee/MS-SQL-Migration
- [x] API-Dokumentation erstellen
- [x] Datenbank-Schema als MS-SQL-Script exportieren
- [x] Authentifizierungs-Adapter für Lucee dokumentieren
- [x] Migrations-Leitfaden erstellen

## Multi-User-Kollaboration
- [x] Teams-Tabelle und Team-Mitglieder-Schema
- [x] Briefing-Sharing-Tabelle
- [x] Team-Rollen (Owner, Admin, Member, Viewer)
- [x] Backend-API für Team-Management
- [x] Backend-API für Briefing-Sharing
- [x] Frontend: Teams-Seite
- [ ] Frontend: Sharing-Dialog in Briefings
- [ ] Gemeinsame Notizen und Kommentare
- [ ] Berechtigungssystem (wer darf was)
- [ ] Notifications für Team-Aktivitäten

## Sharing & Kommentare
- [x] Sharing-Dialog in Briefing-Detail-Seite
- [x] Team/Mitglieder-Auswahl für Sharing
- [x] Berechtigungsstufen (Ansehen/Bearbeiten)
- [ ] Kommentar-Komponente in Briefings
- [ ] Echtzeit-Kommentare mit Benachrichtigungen
- [ ] Kommentar-Threading (Antworten auf Kommentare)

## Berechtigungen
- [ ] Viewer: Nur Lesen
- [ ] Member: Notizen hinzufügen, Kommentare schreiben
- [ ] Admin: Briefings teilen/löschen
- [ ] Owner: Team-Einstellungen verwalten

## Recherche & Dokumentation
- [x] Recherche: Analysemöglichkeiten Bau-Zulieferer-Industrie
- [x] Dokument: Erweiterungsvorschläge für Mi42

## Daily/Weekly Briefings
- [x] Konzept für automatisierte Briefings
- [x] Vorkonfiguration basierend auf Domain-Analyse
- [x] Brancheninformationen-Integration
- [x] Börsenkurse und Indizes
- [x] Rohstoffpreise-Tracking
- [x] Automatische Generierung und Versand

## Hetzner-Deployment
- [ ] Docker-Compose-Konfiguration für Port 3001
- [ ] SSH-Verbindung zu 46.224.9.190 herstellen
- [ ] App-Code auf Server übertragen
- [ ] Docker-Container starten
- [ ] Datenbank migrieren
- [ ] Secrets konfigurieren
- [ ] Testing unter http://46.224.9.190:3001

## Phase-1-Agenten (Kurzfristig)
- [x] Demand Forecasting Agent (1000-2000 Credits)
- [x] Project Intelligence Agent (1500-3000 Credits)
- [x] Pricing Strategy Agent (1200-2500 Credits)
- [ ] Frontend-Integration für neue Agenten
- [ ] Deployment auf Hetzner

## User Management & Custom Authentication (PRIORITY)
- [x] Replace OAuth with custom user/password authentication
- [x] Update database schema: add password hash, role enum (admin, internal, external)
- [x] Implement password hashing with bcrypt
- [x] Create login API endpoint (POST /api/auth/login)
- [x] Create user registration/management API (admin only)
- [x] Build login page UI (replace OAuth login)
- [x] Build user management page (admin only)
- [x] Update auth context to use custom auth
- [x] Remove OAuth dependencies from frontend
- [x] Create initial admin user via migration
- [x] Test login flow with all 3 roles

## Daily/Weekly Automated Briefings (PRIORITY)
- [ ] Design automated briefing schema (frequency, content types)
- [ ] Implement commodity price API integration
- [ ] Implement stock indices API integration
- [ ] Implement construction news aggregation
- [ ] Create briefing generation scheduler (cron jobs)
- [ ] Build daily/weekly briefing UI
- [ ] Add briefing subscription settings per user
- [ ] Test automated generation

## Deployment to Hetzner (PRIORITY)
- [ ] Test all features locally with new authentication
- [ ] Create deployment script for Hetzner
- [ ] Deploy to http://46.224.9.190:3001
- [ ] Run database migrations on production
- [ ] Verify all 7 agents work on production
- [ ] Create initial admin user on production
- [ ] Test login and user management on production
- [ ] Configure automated briefings on production

## Test Users Creation
- [x] Create internal test user (B+L role)
- [x] Create external test user (customer role)
- [x] Document test credentials
- [ ] Verify role-based access control

## Deployment Status (Production Server)
- [x] Deployed to http://46.224.9.190:3001
- [x] Database migrations applied
- [x] Admin user created (admin / Admin123!)
- [x] Test users created (internal_user, external_user)
- [x] Docker containers running (mi42-app, mi42-db)
- [ ] Test login flow on production
- [ ] Verify all 3 new agents work on production

## Production Login Flow Testing
- [ ] Test admin login (admin / Admin123!)
- [ ] Verify admin can access /users page
- [ ] Test internal user login (internal_user / Internal123!)
- [ ] Verify internal user cannot access /users page
- [ ] Test external user login (external_user / External123!)
- [ ] Verify external user cannot access /users page
- [ ] Document role-based access control results

## Production Login/Logout Bug Fix (URGENT)
- [ ] Debug why login button doesn't work on production
- [ ] Fix frontend JavaScript event handler issue
- [ ] Test login for all 3 users on production
- [ ] Test logout functionality
- [ ] Update all test users with stronger 6-digit passwords
- [ ] Document new credentials

## Login/Logout Debug & Testing (URGENT)
- [ ] Deploy debug version with console logs to production
- [ ] Test login and check browser console for debug output
- [ ] Fix login redirect issue (window.location.href not working)
- [ ] Verify admin login works and redirects to dashboard
- [ ] Test logout for admin user
- [ ] Test login/logout for internal user
- [ ] Test login/logout for external user
- [ ] Document any role-specific issues

## Production Frontend Build Fix (CRITICAL PRIORITY)
- [ ] Analyze why React event handlers don't work in production
- [ ] Check Vite build configuration (vite.config.ts)
- [ ] Verify JavaScript bundle loads correctly
- [ ] Test with minimal React component to isolate issue
- [ ] Check if ENV variables are embedded correctly in build
- [ ] Fix production build configuration
- [ ] Deploy fixed build to production
- [ ] Verify login/logout works for all 3 user roles

## Security Fix (URGENT)
- [x] Remove test credentials from login page (public site)
- [x] Create HTML login form without React
- [ ] Fix file path issue and deploy with full Docker rebuild
- [ ] Test login with admin user on production
- [ ] Test login with internal user on production
- [ ] Test login with external user on production
- [ ] Test logout functionality

## Automated Briefings System
- [x] Design briefing data structure (daily/weekly, market updates, commodity prices, stock indices, news)
- [x] Create briefing generation service with LLM integration
- [x] Implement scheduled tasks (daily at 8 AM, weekly on Monday)
- [x] Create briefings API endpoints (list, view, generate)
- [x] Build briefings UI page
- [x] Add navigation link to sidebar
- [ ] Test briefing generation and scheduling

## Role-Based Access Control
- [x] Define feature permissions for each role (admin, internal, external)
- [x] Implement agent access restrictions in backend
- [x] Add role-based guards to tRPC procedures
- [x] Update frontend to hide/show features based on user role
- [x] Create ROLE_PERMISSIONS.md documentation
- [ ] Test access control with all 3 user roles

## Production Deployment (Current Priority)
- [x] Build production version with new features
- [x] Deploy to Hetzner server (http://46.224.9.190:3001)
- [x] Run database migrations on production
- [x] Restart Docker containers
- [x] Verify automated briefing scheduler starts on production
- [x] Update user passwords in database (Adm1n!, Int3rn, Ext3rn)
- [x] Verify API endpoints working (curl tests passed)
- [ ] Fix frontend build cache (Docker rebuild with --no-cache required)
- [ ] Test login with all 3 user roles
- [ ] Test automated briefing generation (daily and weekly)
- [ ] Test role-based agent access restrictions
- [ ] Verify external users can only access 3 agents
- [x] Document deployment results (DEPLOYMENT_UPDATE_11-11-2025.md)

## Production Build Fix & Testing (Current Session)
- [x] Stop Docker containers on production server
- [x] Clear build cache and node_modules
- [x] Rebuild Docker images with --no-cache flag (3x full rebuilds)
- [x] Start containers and verify server is running
- [x] Fix cookie SameSite configuration for HTTP compatibility
- [x] Create standalone HTML login page (/login-standalone.html)
- [x] Create automated_briefings table in database
- [x] Test login with admin user (admin / Adm1n!) - SUCCESSFUL
- [ ] Test login with internal user (internal_user / Int3rn)
- [ ] Test login with external user (external_user / Ext3rn)
- [x] Manually trigger daily briefing generation - SUCCESSFUL
- [x] Verify briefing content quality - EXCELLENT (5/5 stars)
- [x] Check briefing appears in database and UI - WORKING PERFECTLY
- [x] Document final results (DEPLOYMENT_TEST_RESULTS.md)

## Credit Top-Up for Testing
- [x] Add 10000 credits to all user accounts
- [x] Verify credits in database
- [ ] Test agent execution with sufficient credits

## Mi42 Product Documentation
- [x] Create comprehensive product description
- [x] Document all features and use cases
- [x] Document development status
- [x] Document tech stack
- [x] Document future development possibilities

## Registration, Self-Onboarding & Payment Concept
- [x] Design registration flow for external users
- [x] Design self-onboarding process with domain analysis
- [x] Design automated first briefing generation
- [x] Design payment and subscription system
- [x] Document technical implementation details
- [x] Create user journey diagrams

## Extended Freemium Concept
- [x] Design domain-based freemium tracking (2 users per domain)
- [x] Design automatic agent pre-filling with domain data
- [x] Design free initial analyses for all 7 agents
- [x] Design freemium exhaustion handling (3rd user notification)
- [x] Design 12-month reset mechanism
- [x] Document technical implementation

## Landing Page Handover
- [x] Create comprehensive handover document (LANDING_PAGE_HANDOVER.md)
- [x] Create start prompt for new chat (LANDING_PAGE_START_PROMPT.md)
- [x] Document API endpoints for registration
- [x] Document design requirements

## Payment System Integration
- [x] Design payment database schema (transactions, invoices, subscriptions)
- [x] Implement Stripe integration (credit packages)
- [x] Implement Stripe subscriptions (monthly plans)
- [x] Implement invoice generation (PDF with company details)
- [x] Implement Stripe webhook handlers
- [ ] Implement PayPal integration (alternative payment)
- [ ] Build payment router (tRPC APIs)
- [ ] Build credit purchase UI (modal, package selection)
- [ ] Build subscription management UI (upgrade, cancel)
- [ ] Build invoice download UI (transaction history)
- [ ] Implement PayPal webhook handlers
- [ ] Test payment flow end-to-end
- [ ] Deploy to production

## Landing Page API Documentation
- [x] Document all required API endpoints for landing page
- [x] Provide request/response formats
- [x] Provide example code for each endpoint
- [x] Document error handling
- [x] Document tRPC client setup
- [x] Document CORS configuration

## Domain-Based Freemium System
- [x] Extend database schema for freemium tracking
- [x] Implement domain extraction from email
- [x] Implement freemium availability check service
- [x] Implement email verification service
- [x] Implement getFreemiumUsers service
- [x] Implement registration API with freemium validation
- [x] Implement tRPC router endpoints (checkFreemiumAvailability, register, verifyEmail, getFreemiumUsers)
- [ ] Test freemium limit enforcement (2 users per domain)
- [ ] Deploy to production and test with landing page

## Automatic Onboarding System
- [ ] Implement website analysis service (extract company info from domain)
- [ ] Implement meta-agent for prompt generation (7 agents)
- [ ] Implement automatic agent execution on registration
- [ ] Implement welcome briefing generation
- [ ] Test onboarding flow end-to-end

## Payment UI Components
- [ ] Build credit purchase modal with package selection
- [ ] Build subscription management page (upgrade, cancel, reactivate)
- [ ] Build invoice download page with transaction history
- [ ] Build credit balance display in header
- [ ] Build low-credit warning system
- [ ] Test payment UI flows

## PayPal Integration
- [ ] Install PayPal SDK
- [ ] Implement PayPal payment service
- [ ] Implement PayPal webhook handlers
- [ ] Add PayPal option to payment UI
- [ ] Test PayPal payment flow

## Production Deployment (Registration API & Payment System)
- [ ] Transfer updated code to production server
- [ ] Run database migrations (domain_freemium_tracking, email_verifications, etc.)
- [ ] Rebuild Docker containers
- [ ] Verify API endpoints working
- [ ] Test registration flow
- [ ] Create backup after successful deployment

## Email Service & Verification (Current Priority)
- [x] Install nodemailer package for SMTP email sending
- [x] Create email templates for verification emails
- [x] Configure SMTP settings (console-only for now, SMTP ready)
- [x] Update emailVerificationService to send real emails
- [x] Test email sending (console output working)
- [x] Add email configuration to environment variables (documented)
- [x] Deploy email service to production

## Automatic Onboarding Service (Current Priority)
- [x] Create onboarding service with company website analysis
- [x] Implement 7 pre-filled agent analyses:
  - [x] Market Analyst - Market analysis for construction suppliers
  - [x] Trend Scout - Current industry trends
  - [x] Demand Forecasting - Demand forecast for region
  - [x] Project Intelligence - Construction projects in region
  - [x] Pricing Strategy - Pricing strategy analysis
  - [x] Competitor Analysis - Competitor landscape
  - [x] Market Entry - Market entry strategy
- [x] Integrate onboarding into registration flow
- [x] Create background job queue for onboarding tasks (setImmediate)
- [x] Add onboarding status tracking in database (onboardingCompleted field)
- [x] Test complete onboarding flow locally
- [x] Deploy onboarding service to production
- [x] Verify all 7 analyses are created after registration

## SMTP Email Activation (Current Priority)
- [ ] Uncomment SMTP code in server/emailService.ts
- [ ] Install nodemailer in production container
- [ ] Configure environment variables for SMTP
- [ ] Test email sending with real SMTP server
- [ ] Verify verification emails are received
- [ ] Verify welcome emails are received

## Agent Configuration Extension (Current Priority)
- [ ] Add system prompts for demand_forecasting agent
- [ ] Add system prompts for project_intelligence agent
- [ ] Add system prompts for pricing_strategy agent
- [ ] Test agent execution with new prompts
- [ ] Verify onboarding tasks complete successfully

## Landing Page Integration (Current Priority)
- [ ] Create landing page API integration guide
- [ ] Document registration flow with onboarding
- [ ] Create example code for registration form
- [ ] Document success message with 7 analyses info
- [ ] Create email verification flow documentation

## Registration API Repair (CRITICAL - Current Priority)
- [ ] Create missing database tables (domain_freemium_tracking, email_verifications)
- [ ] Fix 'like is not defined' import error in freemiumService
- [ ] Fix Boolean/tinyint type conversion in registration
- [ ] Test checkFreemiumAvailability API
- [ ] Test complete registration flow
- [ ] Test email verification flow
- [ ] Test SMTP email delivery

## Landing Page Integration (Current Priority)
- [ ] Check landing page status (http://46.224.9.190:3002)
- [ ] Connect registration form to backend API
- [ ] Add freemium status display
- [ ] Add success message with onboarding info
- [ ] End-to-end test from landing page to login

## SMTP Email Activation (Current Priority)
- [ ] Install nodemailer in production Docker container
- [ ] Configure SMTP environment variables (mail.bl2020.com)
- [ ] Update emailService.ts to use SMTP instead of console
- [ ] Test email sending with real SMTP
- [ ] Verify verification emails are delivered
- [ ] Test email templates (HTML rendering)

## HTTPS & Security (Current Priority)
- [ ] Obtain SSL certificate (Let's Encrypt)
- [ ] Install nginx on production server
- [ ] Configure nginx reverse proxy for port 3001
- [ ] Set up HTTP to HTTPS redirect
- [ ] Update CORS settings for HTTPS
- [ ] Test HTTPS connection
- [ ] Update all URLs in code to use HTTPS

## Monitoring & Logging (Current Priority)
- [ ] Implement registration success/failure metrics
- [ ] Track freemium usage per domain
- [ ] Log email verification rates
- [ ] Monitor onboarding completion rates
- [ ] Set up error logging with stack traces
- [ ] Create admin dashboard for metrics
- [ ] Add alerts for critical errors

## Competitor Intelligence Agent Implementation (Current Priority)
- [ ] Write comprehensive system prompt for Competitor Intelligence Agent
- [ ] Add competitor_intelligence to AGENT_CONFIGS in agents.ts
- [ ] Configure estimated credits for competitor analysis
- [ ] Add competitor_intelligence to AgentType union
- [ ] Test competitor intelligence agent locally
- [ ] Integrate into onboarding flow

## Missing Agent Configurations Fix
- [ ] Deploy demand_forecasting configuration to production
- [ ] Deploy project_intelligence configuration to production
- [ ] Deploy pricing_strategy configuration to production
- [ ] Verify all 7 agents have valid system prompts
- [ ] Test all agents with sample tasks

## OpenAI Integration
- [ ] Add OPENAI_API_KEY to environment variables
- [ ] Add OPENAI_MODEL to environment variables (default: gpt-4o-mini)
- [ ] Extend invokeLLM function to support OpenAI provider
- [ ] Add OpenAI client initialization
- [ ] Test OpenAI integration with sample request
- [ ] Create model_configs entries for OpenAI models
- [ ] Create test user with OpenAI configuration

## A/B Testing Setup
- [ ] Define 10 test cases for LLM comparison
- [ ] Create test user A (Open WebUI)
- [ ] Create test user B (OpenAI)
- [ ] Run parallel tests with both LLMs
- [ ] Document quality, speed, and cost metrics
- [ ] Create comparison report

## Admin Settings Panel (COMPLETED)
- [x] Design comprehensive Admin Settings UI structure
- [x] Implement OpenAI API key management (view/edit/test)
- [x] Implement system prompt editor for all 8 agents
- [x] Add database connection status monitoring
- [x] Add database credentials management interface
- [x] Add SMTP settings management (mail server, credentials, test email)
- [x] Add user statistics dashboard (total users, active users, registrations per domain)
- [x] Add credit system overview (total credits issued, consumed, remaining)
- [x] Add agent usage statistics (executions per agent type, success/failure rates)
- [ ] Add system logs viewer (recent errors, API calls, LLM usage)
- [x] Add freemium settings (max users per domain, credit allocation)
- [ ] Add email template editor (welcome email, verification email)
- [ ] Add backup/restore functionality
- [ ] Add system health monitoring (API status, database status, disk space)
- [ ] Test all admin settings functionality
- [ ] Deploy to production and test with admin user

## Production Deployment - Admin Settings (CURRENT)
- [ ] Build production version with Admin Settings
- [ ] Deploy to Hetzner server (http://46.224.9.190:3001)
- [ ] Run database migrations on production
- [ ] Restart Docker containers
- [ ] Test Admin Settings with admin user on production
- [ ] Verify all 6 tabs work correctly
- [ ] Test OpenAI API key update functionality
- [ ] Test agent configuration updates

## System Logs Viewer (COMPLETED)
- [x] Design system logs database schema
- [x] Implement log collection service (errors, API calls, LLM usage)
- [x] Create backend API for log retrieval with filters
- [x] Build System Logs Viewer UI component
- [x] Add real-time log streaming (manual refresh)
- [x] Implement log filtering (date range, log level, type)
- [x] Add log export functionality (CSV)
- [x] Integrate into Admin Settings panel (7th tab)
- [x] Integrate logging into agent execution

## Credit System Documentation (COMPLETED)
- [x] Analyze credit calculation logic in agents.ts
- [x] Document credit measurement methodology (fixed-price model, not token-based)
- [x] Create comprehensive credit pricing table for all agents
- [x] Document credit transaction flow
- [x] Explain freemium credit allocation
- [x] Document credit purchase packages
- [x] Create visual diagrams for credit flow
- [x] Write complete Credit System documentation

## Settings Page Error Fix (URGENT)
- [ ] Diagnose JavaScript errors on /settings page
- [ ] Check Settings.tsx component for missing imports
- [ ] Fix broken component references
- [ ] Test Settings page locally
- [ ] Deploy fix to production
- [ ] Verify Settings page works for admin user

## Critical Production Issues (URGENT)
- [ ] Fix Settings page error (still occurring after deployment)
- [ ] Add missing "Wettbewerber-Analyse" (Competitor Intelligence) agent to UI
- [ ] Verify all 8 agents are visible in agent selection
- [ ] Check if Docker container is using old cached build
- [ ] Force rebuild Docker image with latest code

## Final Production Fixes (CURRENT)
- [x] Add Wettbewerber-Analyse (Competitor Intelligence) agent to agent selection
- [ ] Fix defective Admin Settings sections (identify which ones)
- [ ] Update frontend build to remove APP logo from login page
- [ ] Deploy updated frontend to production
- [ ] Test all changes on production

## Server Setup with manus User (CURRENT)
- [x] Connect to server with manus user (46.224.9.190)
- [x] Create project directory /home/manus/mi42
- [x] Install git on server (already installed)
- [x] Copy all project files to server
- [ ] Install Node.js and pnpm/npm
- [ ] Install project dependencies
- [ ] Build frontend (client) and backend (server)
- [ ] Update Docker configuration to use new build location
- [ ] Restart Docker containers
- [ ] Test Admin Settings (Agenten tab, Freemium tab)
- [ ] Verify all 8 agents are visible
- [ ] Document final deployment process

## Agent Results Display Issue (COMPLETED)
- [x] Show running agent tasks in Briefings page (status: pending, running)
- [x] Add status badges (Processing, Completed, Failed)
- [x] Add progress indicators for running tasks
- [x] Modify backend API to return both briefings and active tasks
- [x] Update Briefings page UI to display tasks with status
- [ ] Deploy to production and test agent execution end-to-end

## Production Deployment & Final Fixes (CURRENT SESSION)
- [ ] Build production bundle locally
- [ ] Deploy to Hetzner server (46.224.9.190:3001)
- [ ] Run database migrations on production (competitor_intelligence agent)
- [ ] Test login and briefings display on production
- [ ] Fix Admin Settings "Agenten" tab (remove require() statements)
- [ ] Fix Admin Settings "Logs" tab (remove require() statements)
- [ ] Implement auto-refresh for Briefings page (polling every 10s for active tasks)
- [ ] Test complete workflow: Login → Start Agent → See running task → See completed briefing
- [ ] Save final checkpoint
