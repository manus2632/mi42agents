import bcrypt from "bcryptjs";
import * as db from "./db";

const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Authenticate user with username/email and password
 * Returns user object if successful, null otherwise
 */
export async function authenticateUser(
  usernameOrEmail: string,
  password: string
): Promise<db.User | null> {
  try {
    // Try to find user by username or email
    const user = await db.getUserByUsernameOrEmail(usernameOrEmail);
    
    if (!user) {
      return null;
    }

    // Check if user is active
    if (!user.isActive) {
      return null;
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    
    if (!isValid) {
      return null;
    }

    // Update last signed in
    await db.updateUserLastSignedIn(user.id);

    return user;
  } catch (error) {
    console.error("[Auth] Authentication error:", error);
    return null;
  }
}

/**
 * Create a new user (admin only)
 */
export async function createUser(data: {
  username: string;
  email: string;
  password: string;
  name?: string;
  role: "admin" | "internal" | "external";
}): Promise<{ success: boolean; userId?: number; error?: string }> {
  try {
    // Check if username or email already exists
    const existingUser = await db.getUserByUsernameOrEmail(data.username);
    if (existingUser) {
      return { success: false, error: "Username or email already exists" };
    }

    const existingEmail = await db.getUserByUsernameOrEmail(data.email);
    if (existingEmail) {
      return { success: false, error: "Email already exists" };
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const userId = await db.createUser({
      username: data.username,
      email: data.email,
      passwordHash,
      name: data.name || data.username,
      role: data.role,
      loginMethod: "password",
    });

    return { success: true, userId };
  } catch (error) {
    console.error("[Auth] User creation error:", error);
    return { success: false, error: "Failed to create user" };
  }
}

/**
 * Update user password (requires current password verification)
 */
export async function updatePassword(
  userId: number,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await db.getUserById(userId);
    
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, user.passwordHash);
    
    if (!isValid) {
      return { success: false, error: "Current password is incorrect" };
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await db.updateUser(userId, { passwordHash: newPasswordHash });

    return { success: true };
  } catch (error) {
    console.error("[Auth] Password update error:", error);
    return { success: false, error: "Failed to update password" };
  }
}

/**
 * Reset user password (admin only, no current password required)
 */
export async function resetPassword(
  userId: number,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const newPasswordHash = await hashPassword(newPassword);
    await db.updateUser(userId, { passwordHash: newPasswordHash });
    return { success: true };
  } catch (error) {
    console.error("[Auth] Password reset error:", error);
    return { success: false, error: "Failed to reset password" };
  }
}
