import { getDb } from './db';
import { users, agentCredits } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import {
  extractDomain,
  checkFreemiumAvailability,
  incrementFreemiumCount,
} from './freemiumService';
import {
  createEmailVerification,
  sendVerificationEmail,
} from './emailVerificationService';

export interface RegisterUserInput {
  email: string;
  password: string;
  name?: string;
  companyName?: string;
}

export interface RegisterUserResult {
  success: boolean;
  userId?: number;
  message: string;
  freemiumExhausted?: boolean;
  existingUsers?: Array<{
    email: string;
    name: string | null;
    registeredAt: Date;
  }>;
  resetDate?: Date | null;
}

/**
 * Register a new user with freemium validation
 */
export async function registerUser(
  input: RegisterUserInput
): Promise<RegisterUserResult> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const { email, password, name, companyName } = input;

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      success: false,
      message: 'Invalid email format',
    };
  }

  // Validate password strength
  if (password.length < 8) {
    return {
      success: false,
      message: 'Password must be at least 8 characters long',
    };
  }

  // Check if email already exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return {
      success: false,
      message: 'Email already registered',
    };
  }

  // Extract domain
  const domain = extractDomain(email);
  if (!domain) {
    return {
      success: false,
      message: 'Invalid email domain',
    };
  }

  // Check freemium availability
  const freemiumCheck = await checkFreemiumAvailability(email);

  if (!freemiumCheck.available) {
    // Freemium slots exhausted - get existing users
    const { users: existingUsers, resetDate } = await getFreemiumUsers(domain);

    return {
      success: false,
      message: 'Freemium limit reached for this domain',
      freemiumExhausted: true,
      existingUsers,
      resetDate,
    };
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Generate username from email (before @)
  const username = email.split('@')[0].toLowerCase();

  // Generate unique openId for external users (UUID-like format)
  const openId = `ext_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

  // Create user
  const [result] = await db.insert(users).values({
    openId,
    username,
    email,
    passwordHash,
    name: name || null,
    emailDomain: domain,
    companyName: companyName || null,
    loginMethod: 'password',
    role: 'external', // All new registrations are external users
    isFreemium: freemiumCheck.isFreemail ? 0 : 1, // Freemail users are not counted as freemium (0 = false, 1 = true)
    isActive: 1,
    emailVerified: 0,
    onboardingCompleted: 0,
  });

  // Get the created user to retrieve the ID
  const createdUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  
  if (!createdUser || createdUser.length === 0) {
    throw new Error('Failed to create user');
  }
  
  const userId = createdUser[0].id;

  // Create initial credit balance (5000 credits for freemium)
  await db.insert(agentCredits).values({
    userId,
    balance: 5000,
  });

  // Increment freemium count for domain (if not freemail)
  if (!freemiumCheck.isFreemail) {
    await incrementFreemiumCount(domain);
  }

  // Create email verification token
  const verificationToken = await createEmailVerification(userId, email);

  // Send verification email
  await sendVerificationEmail(email, verificationToken, name || undefined);

  // Trigger automatic onboarding (7 pre-filled analyses)
  const { triggerOnboarding } = await import('./onboardingService');
  await triggerOnboarding(userId);

  return {
    success: true,
    userId,
    message: 'Registration successful. Please check your email to verify your account.',
  };
}

/**
 * Import for freemium service
 */
import { getFreemiumUsers } from './freemiumService';
