import { getDb } from './db';
import { emailVerifications, users } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

/**
 * Generate a secure random token for email verification
 */
function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create email verification token for a user
 * Returns the token to be sent in verification email
 */
export async function createEmailVerification(userId: number, email: string): Promise<string> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const token = generateVerificationToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // Token valid for 24 hours

  await db.insert(emailVerifications).values({
    userId,
    email,
    token,
    expiresAt,
  });

  return token;
}

/**
 * Verify email with token
 * Returns user ID if successful, null if token invalid/expired
 */
export async function verifyEmailToken(token: string): Promise<{
  success: boolean;
  userId?: number;
  message: string;
}> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  // Find verification record
  const verification = await db
    .select()
    .from(emailVerifications)
    .where(eq(emailVerifications.token, token))
    .limit(1);

  if (verification.length === 0) {
    return {
      success: false,
      message: 'Invalid verification token',
    };
  }

  const record = verification[0];

  // Check if already verified
  if (record.verified) {
    return {
      success: false,
      message: 'Email already verified',
    };
  }

  // Check if expired
  if (new Date() > record.expiresAt) {
    return {
      success: false,
      message: 'Verification token expired',
    };
  }

  // Mark as verified
  await db
    .update(emailVerifications)
    .set({
      verified: 1, // MySQL tinyint(1)
    })
    .where(eq(emailVerifications.token, token));

  // Update user record
  await db
    .update(users)
    .set({
      emailVerified: 1, // MySQL tinyint(1)
    })
    .where(eq(users.id, record.userId));

  return {
    success: true,
    userId: record.userId,
    message: 'Email verified successfully',
  };
}

/**
 * Send verification email using nodemailer
 */
export async function sendVerificationEmail(email: string, token: string, name?: string): Promise<void> {
  const { sendVerificationEmail: sendEmail } = await import('./emailService');
  await sendEmail(email, token, name);
}

/**
 * Resend verification email
 * Creates new token and sends email
 */
export async function resendVerificationEmail(userId: number, email: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  // Check if user already verified
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (user.length === 0) {
    throw new Error('User not found');
  }

  if (user[0].emailVerified) {
    throw new Error('Email already verified');
  }

  // Create new verification token
  const token = await createEmailVerification(userId, email);

  // Send email
  await sendVerificationEmail(email, token);
}
