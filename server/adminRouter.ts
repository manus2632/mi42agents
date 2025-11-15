import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { systemConfig, agentConfigs, systemLogs } from "../drizzle/schema";
import OpenAI from "openai";

/**
 * Admin Router
 * 
 * Provides admin-only endpoints for system configuration:
 * - OpenAI API key management
 * - Agent system prompt editing
 * - Database status monitoring
 * - SMTP configuration
 * - System monitoring and statistics
 * - Freemium settings
 */

// Admin-only procedure (checks if user is admin)
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required',
    });
  }
  return next({ ctx });
});

export const adminRouter = router({
  // ===== OpenAI Configuration =====
  
  getOpenAIConfig: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
    
    const config = await db.select().from(systemConfig).where(eq(systemConfig.configKey, 'openai_api_key')).limit(1);
    
    return {
      apiKey: config[0]?.configValue || process.env.OPENAI_API_KEY || '',
      isConfigured: !!config[0]?.configValue || !!process.env.OPENAI_API_KEY,
    };
  }),

  updateOpenAIConfig: adminProcedure
    .input(z.object({
      apiKey: z.string().min(20),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      // Upsert API key in database
      await db.insert(systemConfig).values({
        configKey: 'openai_api_key',
        configValue: input.apiKey,
        description: 'OpenAI API Key for agent execution',
      }).onDuplicateKeyUpdate({
        set: {
          configValue: input.apiKey,
          updatedAt: new Date(),
        },
      });
      
      return { success: true };
    }),

  testOpenAIConnection: adminProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
    
    // Get API key from database or env
    const config = await db.select().from(systemConfig).where(eq(systemConfig.configKey, 'openai_api_key')).limit(1);
    const apiKey = config[0]?.configValue || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return {
        success: false,
        error: 'No API key configured',
      };
    }
    
    try {
      const openai = new OpenAI({ apiKey });
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Test' }],
        max_tokens: 5,
      });
      
      return {
        success: true,
        model: response.model,
        responseTime: Date.now(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Connection test failed',
      };
    }
  }),

  // ===== Agent Configuration =====
  
  getAllAgentConfigs: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
    
    const configs = await db.select().from(agentConfigs);
    
    // Return all 8 agents with their current configuration
    const agentTypes = [
      'market_analyst',
      'trend_scout',
      'survey_assistant',
      'strategy_advisor',
      'demand_forecasting',
      'project_intelligence',
      'pricing_strategy',
      'competitor_intelligence',
    ];
    
    return agentTypes.map(agentType => {
      const config = configs.find(c => c.agentType === agentType);
      return {
        agentType,
        systemPrompt: config?.systemPrompt || getDefaultSystemPrompt(agentType),
        estimatedCredits: config?.estimatedCredits || getDefaultCredits(agentType),
        isActive: config?.isActive ?? true,
      };
    });
  }),

  updateAgentConfig: adminProcedure
    .input(z.object({
      agentType: z.enum([
        'market_analyst',
        'trend_scout',
        'survey_assistant',
        'strategy_advisor',
        'demand_forecasting',
        'project_intelligence',
        'pricing_strategy',
        'competitor_intelligence',
      ]),
      systemPrompt: z.string().optional(),
      estimatedCredits: z.number().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const updateData: any = {};
      if (input.systemPrompt !== undefined) updateData.systemPrompt = input.systemPrompt;
      if (input.estimatedCredits !== undefined) updateData.estimatedCredits = input.estimatedCredits;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;
      updateData.updatedAt = new Date();
      
      // Upsert agent configuration
      await db.insert(agentConfigs).values({
        agentType: input.agentType,
        systemPrompt: input.systemPrompt || getDefaultSystemPrompt(input.agentType),
        estimatedCredits: input.estimatedCredits || getDefaultCredits(input.agentType),
        isActive: input.isActive !== undefined ? (input.isActive ? 1 : 0) : 1, // MySQL tinyint(1)
      }).onDuplicateKeyUpdate({
        set: updateData,
      });
      
      return { success: true };
    }),

  // ===== Database Status =====
  
  getDatabaseStatus: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return {
        connected: false,
        error: 'Database not available',
      };
    }
    
    try {
      // Test connection with a simple query
      await db.execute('SELECT 1');
      
      return {
        connected: true,
        host: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'Unknown',
        database: process.env.DATABASE_URL?.split('/').pop() || 'Unknown',
      };
    } catch (error: any) {
      return {
        connected: false,
        error: error.message,
      };
    }
  }),

  // ===== System Logs =====
  
  getSystemLogs: adminProcedure
    .input(z.object({
      limit: z.number().optional().default(100),
      offset: z.number().optional().default(0),
      logLevel: z.enum(["info", "warning", "error", "debug"]).optional(),
      logType: z.enum(["api_call", "llm_usage", "error", "auth", "system"]).optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      
      const conditions = [];
      if (input.logLevel) conditions.push(eq(systemLogs.logLevel, input.logLevel));
      if (input.logType) conditions.push(eq(systemLogs.logType, input.logType));
      if (input.startDate) conditions.push(gte(systemLogs.createdAt, input.startDate));
      if (input.endDate) conditions.push(lte(systemLogs.createdAt, input.endDate));
      
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      
      const logs = await db.select()
        .from(systemLogs)
        .where(whereClause)
        .orderBy(desc(systemLogs.createdAt))
        .limit(input.limit)
        .offset(input.offset);
      
      return logs;
    }),

  // ===== System Statistics =====
  
  getSystemStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
    
    // Get user statistics
    const totalUsers = await db.execute('SELECT COUNT(*) as count FROM users');
    const activeUsers = await db.execute('SELECT COUNT(*) as count FROM users WHERE lastSignedIn > DATE_SUB(NOW(), INTERVAL 7 DAY)');
    
    // Get credit statistics
    const totalCredits = await db.execute('SELECT SUM(balance) as total FROM agent_credits');
    const usedCredits = await db.execute('SELECT SUM(creditsActual) as total FROM agent_tasks WHERE taskStatus = "completed"');
    
    // Get agent usage statistics
    const agentUsage = await db.execute('SELECT agentType, COUNT(*) as count FROM agent_tasks GROUP BY agentType');
    
    return {
      users: {
        total: (totalUsers as any)[0]?.count || 0,
        active: (activeUsers as any)[0]?.count || 0,
      },
      credits: {
        total: (totalCredits as any)[0]?.total || 0,
        used: (usedCredits as any)[0]?.total || 0,
      },
      agentUsage: agentUsage as any[],
    };
  }),
});

// Helper functions for default values
function getDefaultSystemPrompt(agentType: string): string {
  const prompts: Record<string, string> = {
    market_analyst: "Du bist ein erfahrener Marktanalyst für die Baubranche und Bauzuliefererindustrie. Analysiere Märkte, Trends und Wettbewerbssituationen mit fundiertem Fachwissen.",
    trend_scout: "Du bist ein Trend-Experte für die Baubranche. Identifiziere aufkommende Trends, technologische Entwicklungen und Marktveränderungen.",
    survey_assistant: "Du bist ein Umfrage-Experte für die Bauzuliefererindustrie. Erstelle strukturierte Umfragen und analysiere Marktforschungsdaten.",
    strategy_advisor: "Du bist ein strategischer Berater für die Bauzuliefererindustrie. Entwickle umfassende Strategieempfehlungen basierend auf Marktanalysen.",
    demand_forecasting: "Du bist ein Experte für Nachfrageprognosen in der Baubranche. Erstelle datenbasierte Vorhersagen für Baumaterialien und Bauprojekte.",
    project_intelligence: "Du bist ein Experte für Bauprojekt-Analysen. Identifiziere und analysiere laufende und geplante Bauprojekte mit strategischem Fokus.",
    pricing_strategy: "Du bist ein Experte für Preisstrategie in der Bauzuliefererindustrie. Entwickle datenbasierte Pricing-Strategien und Marktpositionierung.",
    competitor_intelligence: "Du bist ein Experte für Wettbewerbsanalyse in der Bauzuliefererindustrie. Analysiere Wettbewerber, Marktanteile und strategische Positionierung.",
  };
  return prompts[agentType] || "Du bist ein Experte für die Bauzuliefererindustrie.";
}

function getDefaultCredits(agentType: string): number {
  const credits: Record<string, number> = {
    market_analyst: 500,
    trend_scout: 750,
    survey_assistant: 300,
    strategy_advisor: 1000,
    demand_forecasting: 1500,
    project_intelligence: 2000,
    pricing_strategy: 1200,
    competitor_intelligence: 2500,
  };
  return credits[agentType] || 500;
}
