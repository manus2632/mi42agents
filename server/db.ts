import { eq, and, desc, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  agentCredits,
  agentCreditTransactions,
  agentTasks,
  agentBriefings,
  agentCompanyProfiles,
  InsertAgentCredit,
  InsertAgentCreditTransaction,
  InsertAgentTask,
  InsertAgentBriefing,
  InsertAgentCompanyProfile,
  agentModelConfigs,
  InsertAgentModelConfig,
  teams,
  teamMembers,
  sharedBriefings,
  briefingComments
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// Legacy OAuth upsert function - kept for backward compatibility
export async function upsertUser(user: InsertUser): Promise<void> {
  // This function is deprecated and only kept for OAuth compatibility
  // New password-based auth should use createUser() instead
  console.warn("[Database] upsertUser is deprecated for password-based auth");
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  // Support both openId and user_${id} format (for password auth)
  if (openId.startsWith('user_')) {
    const userId = parseInt(openId.replace('user_', ''));
    if (!isNaN(userId)) {
      return await getUserById(userId);
    }
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// New password-based auth functions
export async function getUserByUsernameOrEmail(usernameOrEmail: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users)
    .where(
      or(
        eq(users.username, usernameOrEmail),
        eq(users.email, usernameOrEmail)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUser(user: Omit<InsertUser, 'id' | 'createdAt' | 'updatedAt' | 'lastSignedIn'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(users).values({
    ...user,
    lastSignedIn: new Date(),
  });

  const userId = Number((result as any)[0]?.insertId || result);

  // Initialize credits for new user
  await ensureUserCreditsById(userId);

  return userId;
}

export async function updateUser(userId: number, updates: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set(updates).where(eq(users.id, userId));
}

export async function updateUserLastSignedIn(userId: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, userId));
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(users).orderBy(desc(users.createdAt));
}

export type User = typeof users.$inferSelect;

// Credit Management
export async function ensureUserCreditsById(userId: number) {
  const db = await getDb();
  if (!db) return;

  const existing = await db.select().from(agentCredits).where(eq(agentCredits.userId, userId)).limit(1);
  
  if (existing.length === 0) {
    await db.insert(agentCredits).values({
      userId,
      balance: 5000, // Initial credits
    });
  }
}

export async function ensureUserCredits(openId: string) {
  const db = await getDb();
  if (!db) return;

  const user = await getUserByOpenId(openId);
  if (!user) return;

  const existing = await db.select().from(agentCredits).where(eq(agentCredits.userId, user.id)).limit(1);
  
  if (existing.length === 0) {
    await db.insert(agentCredits).values({
      userId: user.id,
      balance: 5000, // Welcome bonus
    });

    await db.insert(agentCreditTransactions).values({
      userId: user.id,
      amount: 5000,
      transactionType: 'bonus',
      description: 'Welcome bonus',
    });
  }
}

export async function getUserCredits(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(agentCredits).where(eq(agentCredits.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getCreditTransactions(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db.select()
    .from(agentCreditTransactions)
    .where(eq(agentCreditTransactions.userId, userId))
    .orderBy(desc(agentCreditTransactions.createdAt))
    .limit(limit);
}

export async function deductCredits(userId: number, amount: number, taskId?: number, description?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const credits = await getUserCredits(userId);
  if (!credits || credits.balance < amount) {
    throw new Error("Insufficient credits");
  }

  await db.update(agentCredits)
    .set({ balance: credits.balance - amount })
    .where(eq(agentCredits.userId, userId));

  await db.insert(agentCreditTransactions).values({
    userId,
    amount: -amount,
    transactionType: 'usage',
    description: description || 'Agent task execution',
    relatedTaskId: taskId,
  });
}

export async function addCredits(userId: number, amount: number, type: 'purchase' | 'bonus' | 'refund', description?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const credits = await getUserCredits(userId);
  if (!credits) throw new Error("User credits not found");

  await db.update(agentCredits)
    .set({ balance: credits.balance + amount })
    .where(eq(agentCredits.userId, userId));

  await db.insert(agentCreditTransactions).values({
    userId,
    amount,
    transactionType: type,
    description: description || `Credits ${type}`,
  });
}

// Task Management
export async function createAgentTask(task: InsertAgentTask) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(agentTasks).values(task);
  return result;
}

export async function getAgentTask(taskId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(agentTasks).where(eq(agentTasks.id, taskId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateAgentTask(taskId: number, updates: Partial<InsertAgentTask>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(agentTasks).set(updates).where(eq(agentTasks.id, taskId));
}

export async function getUserTasks(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db.select()
    .from(agentTasks)
    .where(eq(agentTasks.userId, userId))
    .orderBy(desc(agentTasks.createdAt))
    .limit(limit);
}

// Briefing Management
export async function createBriefing(briefing: InsertAgentBriefing) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(agentBriefings).values(briefing);
  return result;
}

export async function getBriefing(briefingId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(agentBriefings).where(eq(agentBriefings.id, briefingId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getUserBriefings(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db.select()
    .from(agentBriefings)
    .where(eq(agentBriefings.userId, userId))
    .orderBy(desc(agentBriefings.createdAt))
    .limit(limit);
}

// Company Profile Management
export async function createCompanyProfile(profile: InsertAgentCompanyProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(agentCompanyProfiles).values(profile);
  return result;
}

export async function getCompanyProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select()
    .from(agentCompanyProfiles)
    .where(eq(agentCompanyProfiles.userId, userId))
    .orderBy(desc(agentCompanyProfiles.createdAt))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function updateCompanyProfile(profileId: number, updates: Partial<InsertAgentCompanyProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(agentCompanyProfiles).set(updates).where(eq(agentCompanyProfiles.id, profileId));
}

// Model Configuration
export async function getModelConfig(userId: number, agentType: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select()
    .from(agentModelConfigs)
    .where(and(
      eq(agentModelConfigs.userId, userId),
      eq(agentModelConfigs.agentType, agentType as any)
    ))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function upsertModelConfig(config: InsertAgentModelConfig) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getModelConfig(config.userId, config.agentType);
  
  if (existing) {
    await db.update(agentModelConfigs)
      .set({
        modelProvider: config.modelProvider,
        modelName: config.modelName,
        updatedAt: new Date(),
      })
      .where(eq(agentModelConfigs.id, existing.id));
  } else {
    await db.insert(agentModelConfigs).values(config);
  }
}

export async function getAllModelConfigs(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select()
    .from(agentModelConfigs)
    .where(eq(agentModelConfigs.userId, userId));
}


// ========================================
// TEAM MANAGEMENT
// ========================================

export async function createTeam(data: {name: string, description?: string, ownerId: number}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(teams).values(data);
  const teamId = Number(result[0].insertId);
  
  // Add owner as team member
  await db.insert(teamMembers).values({
    teamId,
    userId: data.ownerId,
    role: "owner"
  });
  
  return teamId;
}

export async function getTeamsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      id: teams.id,
      name: teams.name,
      description: teams.description,
      ownerId: teams.ownerId,
      role: teamMembers.role,
      createdAt: teams.createdAt
    })
    .from(teams)
    .innerJoin(teamMembers, eq(teams.id, teamMembers.teamId))
    .where(eq(teamMembers.userId, userId));
  
  return result;
}

export async function getTeamMembers(teamId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      id: teamMembers.id,
      userId: users.id,
      userName: users.name,
      userEmail: users.email,
      role: teamMembers.role,
      joinedAt: teamMembers.joinedAt
    })
    .from(teamMembers)
    .innerJoin(users, eq(teamMembers.userId, users.id))
    .where(eq(teamMembers.teamId, teamId));
  
  return result;
}

export async function addTeamMember(data: {teamId: number, userId: number, role: "owner" | "admin" | "member" | "viewer"}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(teamMembers).values(data);
}

export async function removeTeamMember(teamId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(teamMembers)
    .where(and(
      eq(teamMembers.teamId, teamId),
      eq(teamMembers.userId, userId)
    ));
}

export async function updateTeamMemberRole(teamId: number, userId: number, role: "owner" | "admin" | "member" | "viewer") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(teamMembers)
    .set({role: role as any})
    .where(and(
      eq(teamMembers.teamId, teamId),
      eq(teamMembers.userId, userId)
    ));
}

// ========================================
// BRIEFING SHARING
// ========================================

export async function shareBriefing(data: {
  briefingId: number,
  sharedByUserId: number,
  sharedWithTeamId?: number,
  sharedWithUserId?: number,
  permission: "view" | "comment" | "edit"
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(sharedBriefings).values(data);
}

export async function getSharedBriefings(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Get briefings shared directly with user
  const directShares = await db
    .select({
      id: sharedBriefings.id,
      briefingId: agentBriefings.id,
      briefingTitle: agentBriefings.briefingTitle,
      agentType: agentTasks.agentType,
      sharedByUserId: sharedBriefings.sharedByUserId,
      sharedByUserName: users.name,
      permission: sharedBriefings.permission,
      createdAt: sharedBriefings.createdAt
    })
    .from(sharedBriefings)
    .innerJoin(agentBriefings, eq(sharedBriefings.briefingId, agentBriefings.id))
    .innerJoin(agentTasks, eq(agentBriefings.taskId, agentTasks.id))
    .innerJoin(users, eq(sharedBriefings.sharedByUserId, users.id))
    .where(eq(sharedBriefings.sharedWithUserId, userId));
  
  // Get briefings shared with user's teams
  const teamShares = await db
    .select({
      id: sharedBriefings.id,
      briefingId: agentBriefings.id,
      briefingTitle: agentBriefings.briefingTitle,
      agentType: agentTasks.agentType,
      sharedByUserId: sharedBriefings.sharedByUserId,
      sharedByUserName: users.name,
      permission: sharedBriefings.permission,
      createdAt: sharedBriefings.createdAt,
      teamId: teams.id,
      teamName: teams.name
    })
    .from(sharedBriefings)
    .innerJoin(agentBriefings, eq(sharedBriefings.briefingId, agentBriefings.id))
    .innerJoin(agentTasks, eq(agentBriefings.taskId, agentTasks.id))
    .innerJoin(users, eq(sharedBriefings.sharedByUserId, users.id))
    .innerJoin(teams, eq(sharedBriefings.sharedWithTeamId, teams.id))
    .innerJoin(teamMembers, eq(teams.id, teamMembers.teamId))
    .where(eq(teamMembers.userId, userId));
  
  return [...directShares, ...teamShares];
}

export async function revokeBriefingShare(shareId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(sharedBriefings).where(eq(sharedBriefings.id, shareId));
}

// ========================================
// COMMENTS
// ========================================

export async function addBriefingComment(data: {
  briefingId: number,
  userId: number,
  commentText: string,
  chapterSection?: string
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(briefingComments).values(data);
}

export async function getBriefingComments(briefingId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      id: briefingComments.id,
      userId: users.id,
      userName: users.name,
      commentText: briefingComments.commentText,
      chapterSection: briefingComments.chapterSection,
      createdAt: briefingComments.createdAt,
      updatedAt: briefingComments.updatedAt
    })
    .from(briefingComments)
    .innerJoin(users, eq(briefingComments.userId, users.id))
    .where(eq(briefingComments.briefingId, briefingId))
    .orderBy(desc(briefingComments.createdAt));
  
  return result;
}

export async function deleteBriefingComment(commentId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(briefingComments)
    .where(and(
      eq(briefingComments.id, commentId),
      eq(briefingComments.userId, userId)
    ));
}
