import { getDb } from './db';
import { domainFreemiumTracking, users } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';

/**
 * Extract domain from email address
 * @example extractDomain("max.mustermann@heidelbergcement.de") => "heidelbergcement.de"
 */
export function extractDomain(email: string): string | null {
  const match = email.match(/@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/);
  return match ? match[1].toLowerCase() : null;
}

/**
 * Check if email is from a freemail provider (Gmail, Yahoo, etc.)
 * Freemail users don't count towards domain limit
 */
export function isFreemailProvider(domain: string): boolean {
  const freemailProviders = [
    'gmail.com',
    'googlemail.com',
    'yahoo.com',
    'yahoo.de',
    'hotmail.com',
    'outlook.com',
    'web.de',
    'gmx.de',
    'gmx.net',
    'aol.com',
    'icloud.com',
    'me.com',
    'mail.com',
    't-online.de',
    'freenet.de',
  ];
  
  return freemailProviders.includes(domain.toLowerCase());
}

/**
 * Check freemium availability for a domain
 * Returns availability status and used slots
 */
export async function checkFreemiumAvailability(email: string): Promise<{
  available: boolean;
  domain: string | null;
  usedSlots: number;
  limit: number;
  resetDate: Date | null;
  isFreemail: boolean;
}> {
  const domain = extractDomain(email);
  
  if (!domain) {
    return {
      available: false,
      domain: null,
      usedSlots: 0,
      limit: 2,
      resetDate: null,
      isFreemail: false,
    };
  }

  // Freemail providers have unlimited freemium slots
  if (isFreemailProvider(domain)) {
    return {
      available: true,
      domain,
      usedSlots: 0,
      limit: 999,
      resetDate: null,
      isFreemail: true,
    };
  }

  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  // Get or create domain tracking record
  let tracking = await db
    .select()
    .from(domainFreemiumTracking)
    .where(eq(domainFreemiumTracking.domain, domain))
    .limit(1);

  if (tracking.length === 0) {
    // Domain not yet registered - available
    return {
      available: true,
      domain,
      usedSlots: 0,
      limit: 2,
      resetDate: null,
      isFreemail: false,
    };
  }

  const record = tracking[0];

  // Check if reset date has passed (12 months after first user)
  if (record.resetDate && new Date() >= record.resetDate) {
    // Reset freemium slots
    await db
      .update(domainFreemiumTracking)
      .set({
        freemiumUsersCount: 0,
        resetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Reset in 12 months
      })
      .where(eq(domainFreemiumTracking.domain, domain));

    return {
      available: true,
      domain,
      usedSlots: 0,
      limit: 2,
      resetDate: null,
      isFreemail: false,
    };
  }

  // Check if slots available
  const available = record.freemiumUsersCount < 2;

  return {
    available,
    domain,
    usedSlots: record.freemiumUsersCount,
    limit: 2,
    resetDate: record.resetDate,
    isFreemail: false,
  };
}

/**
 * Increment freemium user count for a domain
 * Called after successful registration
 */
export async function incrementFreemiumCount(domain: string): Promise<void> {
  if (isFreemailProvider(domain)) {
    // Freemail providers don't have limits
    return;
  }

  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  // Get existing record
  const existing = await db
    .select()
    .from(domainFreemiumTracking)
    .where(eq(domainFreemiumTracking.domain, domain))
    .limit(1);

  if (existing.length === 0) {
    // Create new record for first user
    const now = new Date();
    const resetDate = new Date(now);
    resetDate.setMonth(resetDate.getMonth() + 12); // Reset after 12 months

    await db.insert(domainFreemiumTracking).values({
      domain,
      freemiumUsersCount: 1,
      firstFreemiumUserCreatedAt: now,
      resetDate,
    });
  } else {
    // Increment count
    await db
      .update(domainFreemiumTracking)
      .set({
        freemiumUsersCount: existing[0].freemiumUsersCount + 1,
      })
      .where(eq(domainFreemiumTracking.domain, domain));
  }
}

/**
 * Get list of freemium users for a domain
 * Used to show existing users to 3rd+ registrant
 */
export async function getFreemiumUsers(domain: string): Promise<{
  users: Array<{
    email: string;
    name: string | null;
    registeredAt: Date;
  }>;
  resetDate: Date | null;
}> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  // Get freemium users for this domain
  const freemiumUsers = await db
    .select({
      email: users.email,
      name: users.name,
      registeredAt: users.createdAt,
    })
    .from(users)
    .where(
      and(
        eq(users.emailDomain, domain),
        eq(users.isFreemium, 1) // MySQL tinyint(1)
      )
    )
    .orderBy(users.createdAt)
    .limit(2);

  // Get reset date
  const tracking = await db
    .select()
    .from(domainFreemiumTracking)
    .where(eq(domainFreemiumTracking.domain, domain))
    .limit(1);

  return {
    users: freemiumUsers,
    resetDate: tracking.length > 0 ? tracking[0].resetDate : null,
  };
}
