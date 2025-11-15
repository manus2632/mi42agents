import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminRouter } from "./adminRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import * as auth from "./auth";
import { sdk } from "./_core/sdk";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  admin: adminRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    // Check freemium availability for a domain
    checkFreemiumAvailability: publicProcedure
      .input(z.object({
        email: z.string().email(),
      }))
      .query(async ({ input }) => {
        const { checkFreemiumAvailability } = await import('./freemiumService');
        return await checkFreemiumAvailability(input.email);
      }),
    
    // Register new user
    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().optional(),
        companyName: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { registerUser } = await import('./registrationService');
        return await registerUser(input);
      }),
    
    // Verify email with token
    verifyEmail: publicProcedure
      .input(z.object({
        token: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { verifyEmailToken } = await import('./emailVerificationService');
        return await verifyEmailToken(input.token);
      }),
    
    // Get freemium users for a domain (for 3rd+ user)
    getFreemiumUsers: publicProcedure
      .input(z.object({
        email: z.string().email(),
      }))
      .query(async ({ input }) => {
        const { extractDomain, getFreemiumUsers } = await import('./freemiumService');
        const domain = extractDomain(input.email);
        if (!domain) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid email domain',
          });
        }
        return await getFreemiumUsers(domain);
      }),
    
    login: publicProcedure
      .input(z.object({
        username: z.string().min(3),
        password: z.string().min(6),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await auth.authenticateUser(input.username, input.password);
        
        if (!user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid username or password',
          });
        }

        // Create session token using openId (fallback to username if no openId)
        const sessionId = user.openId || `user_${user.id}`;
        const sessionToken = await sdk.createSessionToken(sessionId, {
          name: user.name || user.username,
          expiresInMs: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Set session cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

        return {
          success: true,
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        };
      }),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  credits: router({
    getBalance: protectedProcedure.query(async ({ ctx }) => {
      const credits = await db.getUserCredits(ctx.user.id);
      return credits?.balance || 0;
    }),

    getTransactions: protectedProcedure.query(async ({ ctx }) => {
      return await db.getCreditTransactions(ctx.user.id);
    }),

    purchase: protectedProcedure
      .input(z.object({
        amount: z.number().min(100).max(100000),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.addCredits(ctx.user.id, input.amount, 'purchase', `Purchased ${input.amount} credits`);
        return { success: true };
      }),
  }),

  tasks: router({
    create: protectedProcedure
      .input(z.object({
        agentType: z.enum(['market_analyst', 'trend_scout', 'survey_assistant', 'strategy_advisor', 'demand_forecasting', 'project_intelligence', 'pricing_strategy', 'competitor_intelligence']),
        prompt: z.string().min(10),
      }))
      .mutation(async ({ ctx, input }) => {
        // Role-based agent access control
        const allowedAgentsForExternal = [
          'market_analyst',
          'trend_scout',
          'demand_forecasting'
        ];

        if (ctx.user.role === 'external' && !allowedAgentsForExternal.includes(input.agentType)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'This agent is not available for external users. Please upgrade your subscription to access advanced agents.',
          });
        }

        // Estimate credits based on agent type
        const creditEstimates = {
          market_analyst: 200,
          trend_scout: 500,
          survey_assistant: 2000,
          strategy_advisor: 5000,
          demand_forecasting: 1500,
          project_intelligence: 2000,
          pricing_strategy: 1800,
          competitor_intelligence: 2500,
        };

        const estimatedCredits = creditEstimates[input.agentType];

        await db.createAgentTask({
          userId: ctx.user.id,
          agentType: input.agentType,
          taskPrompt: input.prompt,
          taskStatus: 'pending',
          creditsEstimated: estimatedCredits,
        });

        // Get the created task
        const tasks = await db.getUserTasks(ctx.user.id, 1);
        const taskId = tasks[0]?.id || 0;

        return {
          taskId,
          estimatedCredits,
        };
      }),

    confirm: protectedProcedure
      .input(z.object({
        taskId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const task = await db.getAgentTask(input.taskId);
        if (!task || task.userId !== ctx.user.id) {
          throw new Error("Task not found");
        }

        if (task.taskStatus !== 'pending') {
          throw new Error("Task already confirmed");
        }

        // Deduct credits
        await db.deductCredits(ctx.user.id, task.creditsEstimated || 0, task.id, `Task ${task.id} execution`);

        // Execute agent task
        const { executeAgentTask } = await import('./agents');
        const result = await executeAgentTask(
          task.id,
          task.agentType,
          task.taskPrompt,
          ctx.user.id
        );

        return result;
      }),

    getStatus: protectedProcedure
      .input(z.object({
        taskId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        const task = await db.getAgentTask(input.taskId);
        if (!task || task.userId !== ctx.user.id) {
          throw new Error("Task not found");
        }
        return task;
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserTasks(ctx.user.id);
    }),
  }),

  briefings: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const briefings = await db.getUserBriefings(ctx.user.id);
      const tasks = await db.getUserTasks(ctx.user.id);
      
      // Filter tasks to only include pending and running
      const activeTasks = tasks.filter(t => t.taskStatus === 'pending' || t.taskStatus === 'running');
      
      return {
        briefings,
        activeTasks,
      };
    }),

    getById: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        const briefing = await db.getBriefing(input.id);
        if (!briefing || briefing.userId !== ctx.user.id) {
          throw new Error("Briefing not found");
        }
        return briefing;
      }),

    share: protectedProcedure
      .input(z.object({
        briefingId: z.number(),
        teamId: z.number(),
        permission: z.enum(['view', 'edit']),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.shareBriefing({
          briefingId: input.briefingId,
          sharedByUserId: ctx.user.id,
          sharedWithTeamId: input.teamId,
          permission: input.permission as "view" | "comment" | "edit",
        });
        return { success: true };
      }),
  }),

  settings: router({
    getModelConfigs: protectedProcedure.query(async ({ ctx }) => {
      return await db.getAllModelConfigs(ctx.user.id);
    }),

    saveModelConfig: protectedProcedure
      .input(z.object({
        agentType: z.string(),
        modelId: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertModelConfig({
          userId: ctx.user.id,
          agentType: input.agentType as any,
          modelProvider: input.modelId.includes('gpt-oss') ? 'open_webui' : 'manus_forge',
          modelName: input.modelId,
        });
        return { success: true };
      }),
  }),

  teams: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(2),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const teamId = await db.createTeam({
          name: input.name,
          description: input.description,
          ownerId: ctx.user.id,
        });
        return { teamId };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getTeamsByUserId(ctx.user.id);
    }),

    getMembers: protectedProcedure
      .input(z.object({ teamId: z.number() }))
      .query(async ({ input }) => {
        return await db.getTeamMembers(input.teamId);
      }),

    addMember: protectedProcedure
      .input(z.object({
        teamId: z.number(),
        userId: z.number(),
        role: z.enum(['owner', 'admin', 'member', 'viewer']),
      }))
      .mutation(async ({ input }) => {
        await db.addTeamMember(input);
        return { success: true };
      }),

    removeMember: protectedProcedure
      .input(z.object({
        teamId: z.number(),
        userId: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.removeTeamMember(input.teamId, input.userId);
        return { success: true };
      }),

    updateMemberRole: protectedProcedure
      .input(z.object({
        teamId: z.number(),
        userId: z.number(),
        role: z.enum(['owner', 'admin', 'member', 'viewer']),
      }))
      .mutation(async ({ input }) => {
        await db.updateTeamMemberRole(input.teamId, input.userId, input.role);
        return { success: true };
      }),
  }),

  sharing: router({
    shareBriefing: protectedProcedure
      .input(z.object({
        briefingId: z.number(),
        sharedWithTeamId: z.number().optional(),
        sharedWithUserId: z.number().optional(),
        permission: z.enum(['view', 'comment', 'edit']),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.shareBriefing({
          ...input,
          sharedByUserId: ctx.user.id,
        });
        return { success: true };
      }),

    getSharedBriefings: protectedProcedure.query(async ({ ctx }) => {
      return await db.getSharedBriefings(ctx.user.id);
    }),

    revokeShare: protectedProcedure
      .input(z.object({ shareId: z.number() }))
      .mutation(async ({ input }) => {
        await db.revokeBriefingShare(input.shareId);
        return { success: true };
      }),
  }),

  comments: router({
    add: protectedProcedure
      .input(z.object({
        briefingId: z.number(),
        commentText: z.string().min(1),
        chapterSection: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.addBriefingComment({
          ...input,
          userId: ctx.user.id,
        });
        return { success: true };
      }),

    list: protectedProcedure
      .input(z.object({ briefingId: z.number() }))
      .query(async ({ input }) => {
        return await db.getBriefingComments(input.briefingId);
      }),

    delete: protectedProcedure
      .input(z.object({ commentId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteBriefingComment(input.commentId, ctx.user.id);
        return { success: true };
      }),
  }),

  company: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      return await db.getCompanyProfile(ctx.user.id);
    }),

    checkOnboarding: protectedProcedure.query(async ({ ctx }) => {
      const profile = await db.getCompanyProfile(ctx.user.id);
      return {
        completed: !!profile,
        profile,
      };
    }),

    startOnboarding: protectedProcedure.mutation(async ({ ctx }) => {
      const { analyzeCompanyFromDomain } = await import('./agents');
      const email = ctx.user.email;
      if (!email) throw new Error('No email found');
      
      const domain = email.split('@')[1];
      if (!domain) throw new Error('Invalid email format');

      const result = await analyzeCompanyFromDomain(domain, ctx.user.id);
      return result;
    }),
  }),

  automatedBriefings: router({
    // Get all automated briefings
    list: protectedProcedure.query(async () => {
      const { getAllBriefings } = await import('./briefingService');
      return await getAllBriefings(50);
    }),

    // Get a specific briefing by ID
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const { getBriefingById } = await import('./briefingService');
        return await getBriefingById(input.id);
      }),

    // Manually trigger a daily briefing (admin only)
    triggerDaily: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }
      const { triggerDailyBriefing } = await import('./briefingScheduler');
      return await triggerDailyBriefing();
    }),

    // Manually trigger a weekly briefing (admin only)
    triggerWeekly: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }
      const { triggerWeeklyBriefing } = await import('./briefingScheduler');
      return await triggerWeeklyBriefing();
    }),
  }),

  users: router({
    // Admin only: Get all users
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
      }
      return await db.getAllUsers();
    }),

    // Admin only: Create new user
    create: protectedProcedure
      .input(z.object({
        username: z.string().min(3),
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().optional(),
        role: z.enum(['admin', 'internal', 'external']),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        return await auth.createUser(input);
      }),

    // Admin only: Reset user password
    resetPassword: protectedProcedure
      .input(z.object({
        userId: z.number(),
        newPassword: z.string().min(6),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        return await auth.resetPassword(input.userId, input.newPassword);
      }),

    // Admin only: Update user role/status
    update: protectedProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(['admin', 'internal', 'external']).optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        const { userId, ...updates } = input;
        // Convert boolean to number for MySQL tinyint(1)
        const dbUpdates: any = { ...updates };
        if (updates.isActive !== undefined) {
          dbUpdates.isActive = updates.isActive ? 1 : 0;
        }
        await db.updateUser(userId, dbUpdates);
        return { success: true };
      }),

    // User: Change own password
    changePassword: protectedProcedure
      .input(z.object({
        currentPassword: z.string(),
        newPassword: z.string().min(6),
      }))
      .mutation(async ({ ctx, input }) => {
        return await auth.updatePassword(ctx.user.id, input.currentPassword, input.newPassword);
      }),
  }),
});

export type AppRouter = typeof appRouter;
