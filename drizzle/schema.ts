import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).unique(), // Optional for backward compatibility
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  name: text("name"),
  email: varchar("email", { length: 320 }).notNull().unique(),
  emailVerified: int("emailVerified").default(0).notNull(), // tinyint(1) in MySQL
  emailDomain: varchar("emailDomain", { length: 255 }), // Extracted domain for freemium tracking
  companyName: varchar("companyName", { length: 255 }), // Optional company name
  loginMethod: varchar("loginMethod", { length: 64 }).default("password"),
  role: mysqlEnum("role", ["admin", "internal", "external"]).default("external").notNull(),
  isFreemium: int("isFreemium").default(1).notNull(), // tinyint(1) in MySQL - 1 for freemium users
  isActive: int("isActive").default(1).notNull(), // tinyint(1) in MySQL
  onboardingCompleted: int("onboardingCompleted").default(0).notNull(), // tinyint(1) in MySQL
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Credit balance for each user
 */
export const agentCredits = mysqlTable("agent_credits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  balance: int("balance").notNull().default(5000), // Start with 5000 credits
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AgentCredit = typeof agentCredits.$inferSelect;
export type InsertAgentCredit = typeof agentCredits.$inferInsert;

/**
 * Credit transaction history
 */
export const agentCreditTransactions = mysqlTable("agent_credit_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  amount: int("amount").notNull(), // Positive for purchase/bonus, negative for usage
  transactionType: mysqlEnum("transactionType", ["purchase", "usage", "refund", "bonus"]).notNull(),
  description: text("description"),
  relatedTaskId: int("relatedTaskId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AgentCreditTransaction = typeof agentCreditTransactions.$inferSelect;
export type InsertAgentCreditTransaction = typeof agentCreditTransactions.$inferInsert;

/**
 * Agent tasks (analysis requests)
 */
export const agentTasks = mysqlTable("agent_tasks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  agentType: mysqlEnum("agentType", ["market_analyst", "trend_scout", "survey_assistant", "strategy_advisor", "demand_forecasting", "project_intelligence", "pricing_strategy", "competitor_intelligence"]).notNull(),
  taskPrompt: text("taskPrompt").notNull(),
  taskStatus: mysqlEnum("taskStatus", ["pending", "running", "completed", "failed"]).notNull().default("pending"),
  creditsEstimated: int("creditsEstimated"),
  creditsActual: int("creditsActual"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type AgentTask = typeof agentTasks.$inferSelect;
export type InsertAgentTask = typeof agentTasks.$inferInsert;

/**
 * Generated briefings (analysis results)
 */
export const agentBriefings = mysqlTable("agent_briefings", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("taskId").notNull(),
  userId: int("userId").notNull(),
  briefingTitle: text("briefingTitle"),
  briefingData: text("briefingData"), // JSON with complete briefing content
  isOnboarding: boolean("isOnboarding").default(false),
  language: varchar("language", { length: 5 }).notNull().default("de"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AgentBriefing = typeof agentBriefings.$inferSelect;
export type InsertAgentBriefing = typeof agentBriefings.$inferInsert;

/**
 * Company profiles from onboarding analysis
 */
export const agentCompanyProfiles = mysqlTable("agent_company_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  companyDomain: varchar("companyDomain", { length: 255 }).notNull(),
  companyName: text("companyName"),
  productPortfolio: text("productPortfolio"), // JSON
  competitors: text("competitors"), // JSON array
  analysisData: text("analysisData"), // JSON with full analysis
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AgentCompanyProfile = typeof agentCompanyProfiles.$inferSelect;
export type InsertAgentCompanyProfile = typeof agentCompanyProfiles.$inferInsert;

/**
 * Model configuration per agent type
 */
export const agentModelConfigs = mysqlTable("agent_model_configs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  agentType: mysqlEnum("agentType", ["market_analyst", "trend_scout", "survey_assistant", "strategy_advisor", "demand_forecasting", "project_intelligence", "pricing_strategy", "competitor_intelligence"]).notNull(),
  modelProvider: mysqlEnum("modelProvider", ["manus_forge", "open_webui"]).notNull().default("open_webui"),
  modelName: varchar("modelName", { length: 100 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AgentModelConfig = typeof agentModelConfigs.$inferSelect;
export type InsertAgentModelConfig = typeof agentModelConfigs.$inferInsert;

/**
 * Teams for collaboration
 */
export const teams = mysqlTable("teams", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  ownerId: int("ownerId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

/**
 * Team members with roles
 */
export const teamMembers = mysqlTable("team_members", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("teamId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["owner", "admin", "member", "viewer"]).notNull().default("member"),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;

/**
 * Shared briefings
 */
export const sharedBriefings = mysqlTable("shared_briefings", {
  id: int("id").autoincrement().primaryKey(),
  briefingId: int("briefingId").notNull(),
  sharedByUserId: int("sharedByUserId").notNull(),
  sharedWithTeamId: int("sharedWithTeamId"),
  sharedWithUserId: int("sharedWithUserId"),
  permission: mysqlEnum("permission", ["view", "comment", "edit"]).notNull().default("view"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SharedBriefing = typeof sharedBriefings.$inferSelect;
export type InsertSharedBriefing = typeof sharedBriefings.$inferInsert;

/**
 * Comments on briefings
 */
export const briefingComments = mysqlTable("briefing_comments", {
  id: int("id").autoincrement().primaryKey(),
  briefingId: int("briefingId").notNull(),
  userId: int("userId").notNull(),
  commentText: text("commentText").notNull(),
  chapterSection: varchar("chapterSection", { length: 100 }), // e.g., "context", "insights"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BriefingComment = typeof briefingComments.$inferSelect;
export type InsertBriefingComment = typeof briefingComments.$inferInsert;

/**
 * Automated briefings (daily/weekly market updates)
 */
export const automatedBriefings = mysqlTable("automated_briefings", {
  id: int("id").autoincrement().primaryKey(),
  briefingType: mysqlEnum("briefingType", ["daily", "weekly"]).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content").notNull(), // Markdown content
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
  scheduledFor: timestamp("scheduledFor").notNull(),
  status: mysqlEnum("status", ["pending", "generated", "sent", "failed"]).notNull().default("pending"),
});

export type AutomatedBriefing = typeof automatedBriefings.$inferSelect;
export type InsertAutomatedBriefing = typeof automatedBriefings.$inferInsert;

/**
 * Payment transactions (Stripe, PayPal)
 */
export const paymentTransactions = mysqlTable("payment_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  paymentProvider: mysqlEnum("paymentProvider", ["stripe", "paypal"]).notNull(),
  paymentType: mysqlEnum("paymentType", ["credit_package", "subscription"]).notNull(),
  amount: int("amount").notNull(), // Amount in cents (e.g., 35000 = 350.00 EUR)
  currency: varchar("currency", { length: 3 }).notNull().default("EUR"),
  creditsAdded: int("creditsAdded"), // Credits added for credit packages
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).notNull().default("pending"),
  providerTransactionId: varchar("providerTransactionId", { length: 255 }), // Stripe/PayPal transaction ID
  providerCustomerId: varchar("providerCustomerId", { length: 255 }), // Stripe/PayPal customer ID
  metadata: text("metadata"), // JSON with additional data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = typeof paymentTransactions.$inferInsert;

/**
 * Subscriptions (monthly plans)
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  planType: mysqlEnum("planType", ["basic", "pro", "business", "enterprise"]).notNull(),
  status: mysqlEnum("status", ["active", "canceled", "expired", "paused"]).notNull().default("active"),
  monthlyCredits: int("monthlyCredits").notNull(), // Credits per month
  monthlyPrice: int("monthlyPrice").notNull(), // Price in cents
  currency: varchar("currency", { length: 3 }).notNull().default("EUR"),
  paymentProvider: mysqlEnum("paymentProvider", ["stripe", "paypal"]).notNull(),
  providerSubscriptionId: varchar("providerSubscriptionId", { length: 255 }), // Stripe/PayPal subscription ID
  providerCustomerId: varchar("providerCustomerId", { length: 255 }),
  currentPeriodStart: timestamp("currentPeriodStart").notNull(),
  currentPeriodEnd: timestamp("currentPeriodEnd").notNull(),
  canceledAt: timestamp("canceledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Invoices (generated after payment)
 */
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  invoiceNumber: varchar("invoiceNumber", { length: 50 }).notNull().unique(), // e.g., "INV-2025-001234"
  paymentTransactionId: int("paymentTransactionId"),
  subscriptionId: int("subscriptionId"),
  amount: int("amount").notNull(), // Amount in cents
  currency: varchar("currency", { length: 3 }).notNull().default("EUR"),
  taxRate: int("taxRate").notNull().default(19), // Tax rate in percent (e.g., 19 for 19%)
  taxAmount: int("taxAmount").notNull(), // Tax amount in cents
  totalAmount: int("totalAmount").notNull(), // Total including tax
  billingName: varchar("billingName", { length: 255 }).notNull(),
  billingEmail: varchar("billingEmail", { length: 320 }).notNull(),
  billingAddress: text("billingAddress"),
  billingVatId: varchar("billingVatId", { length: 50 }), // VAT ID for EU businesses
  itemDescription: text("itemDescription").notNull(), // e.g., "50.000 Credits - Professional Paket"
  pdfUrl: varchar("pdfUrl", { length: 500 }), // URL to generated PDF invoice
  status: mysqlEnum("status", ["draft", "issued", "paid", "canceled"]).notNull().default("draft"),
  issuedAt: timestamp("issuedAt"),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

/**
 * Credit packages (pricing tiers)
 */
export const creditPackages = mysqlTable("credit_packages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // e.g., "Starter", "Professional", "Enterprise"
  credits: int("credits").notNull(), // Number of credits
  price: int("price").notNull(), // Price in cents
  currency: varchar("currency", { length: 3 }).notNull().default("EUR"),
  isActive: int("isActive").default(1).notNull(), // tinyint(1) in MySQL
  sortOrder: int("sortOrder").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CreditPackage = typeof creditPackages.$inferSelect;
export type InsertCreditPackage = typeof creditPackages.$inferInsert;

/**
 * Domain-based freemium tracking (max 2 users per domain)
 */
export const domainFreemiumTracking = mysqlTable("domain_freemium_tracking", {
  id: int("id").autoincrement().primaryKey(),
  domain: varchar("domain", { length: 255 }).notNull().unique(), // e.g., "heidelbergcement.de"
  freemiumUsersCount: int("freemiumUsersCount").notNull().default(0), // Current count (0-2)
  firstFreemiumUserCreatedAt: timestamp("firstFreemiumUserCreatedAt"), // When first freemium user was created
  resetDate: timestamp("resetDate"), // When freemium slots reset (12 months after first user)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DomainFreemiumTracking = typeof domainFreemiumTracking.$inferSelect;
export type InsertDomainFreemiumTracking = typeof domainFreemiumTracking.$inferInsert;

/**
 * Email verification tokens
 */
export const emailVerifications = mysqlTable("email_verifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(), // Production has varchar(255)
  expiresAt: timestamp("expiresAt").notNull(),
  verified: int("verified").default(0).notNull(), // tinyint(1) in MySQL
  createdAt: timestamp("createdAt").defaultNow(),
});

export type EmailVerification = typeof emailVerifications.$inferSelect;
export type InsertEmailVerification = typeof emailVerifications.$inferInsert;

/**
 * System configuration (admin settings)
 */
export const systemConfig = mysqlTable("system_config", {
  id: int("id").autoincrement().primaryKey(),
  configKey: varchar("configKey", { length: 100 }).notNull().unique(), // e.g., "openai_api_key", "smtp_host"
  configValue: text("configValue"), // Configuration value
  description: text("description"), // Human-readable description
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SystemConfig = typeof systemConfig.$inferSelect;
export type InsertSystemConfig = typeof systemConfig.$inferInsert;

/**
 * Agent configurations (system prompts, credits, active status)
 */
export const agentConfigs = mysqlTable("agent_configs", {
  id: int("id").autoincrement().primaryKey(),
  agentType: mysqlEnum("agentType", [
    "market_analyst",
    "trend_scout",
    "survey_assistant",
    "strategy_advisor",
    "demand_forecasting",
    "project_intelligence",
    "pricing_strategy",
    "competitor_intelligence",
  ]).notNull().unique(),
  systemPrompt: text("systemPrompt").notNull(), // Custom system prompt for this agent
  estimatedCredits: int("estimatedCredits").notNull(), // Credit cost for this agent
  isActive: int("isActive").default(1).notNull(), // tinyint(1) in MySQL - whether agent is available
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AgentConfig = typeof agentConfigs.$inferSelect;
export type InsertAgentConfig = typeof agentConfigs.$inferInsert;

/**
 * System logs for monitoring and debugging
 */
export const systemLogs = mysqlTable("system_logs", {
  id: int("id").autoincrement().primaryKey(),
  logLevel: mysqlEnum("logLevel", ["info", "warning", "error", "debug"]).notNull(),
  logType: mysqlEnum("logType", ["api_call", "llm_usage", "error", "auth", "system"]).notNull(),
  message: text("message").notNull(),
  details: text("details"), // JSON string with additional context
  userId: int("userId"), // Optional: which user triggered this log
  taskId: int("taskId"), // Optional: related agent task
  ipAddress: varchar("ipAddress", { length: 45 }), // IPv4 or IPv6
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SystemLog = typeof systemLogs.$inferSelect;
export type InsertSystemLog = typeof systemLogs.$inferInsert;
