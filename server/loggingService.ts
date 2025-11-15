import { getDb } from "./db";
import { systemLogs } from "../drizzle/schema";

/**
 * Centralized Logging Service
 * 
 * Provides functions to log various system events:
 * - API calls
 * - LLM usage
 * - Errors
 * - Authentication events
 * - System events
 */

export type LogLevel = "info" | "warning" | "error" | "debug";
export type LogType = "api_call" | "llm_usage" | "error" | "auth" | "system";

interface LogOptions {
  level: LogLevel;
  type: LogType;
  message: string;
  details?: Record<string, any>;
  userId?: number;
  taskId?: number;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log a system event
 */
export async function logEvent(options: LogOptions): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Logging] Database not available, logging to console only");
      console.log(`[${options.level.toUpperCase()}] [${options.type}] ${options.message}`, options.details);
      return;
    }

    await db.insert(systemLogs).values({
      logLevel: options.level,
      logType: options.type,
      message: options.message,
      details: options.details ? JSON.stringify(options.details) : null,
      userId: options.userId,
      taskId: options.taskId,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
    });
  } catch (error) {
    // Fallback to console logging if database logging fails
    console.error("[Logging] Failed to write to database:", error);
    console.log(`[${options.level.toUpperCase()}] [${options.type}] ${options.message}`, options.details);
  }
}

/**
 * Log an API call
 */
export async function logApiCall(options: {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  userId?: number;
  ipAddress?: string;
  userAgent?: string;
  error?: string;
}): Promise<void> {
  await logEvent({
    level: options.statusCode >= 400 ? "error" : "info",
    type: "api_call",
    message: `${options.method} ${options.endpoint} - ${options.statusCode}`,
    details: {
      endpoint: options.endpoint,
      method: options.method,
      statusCode: options.statusCode,
      responseTime: options.responseTime,
      error: options.error,
    },
    userId: options.userId,
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
  });
}

/**
 * Log LLM usage
 */
export async function logLLMUsage(options: {
  agentType: string;
  modelProvider: string;
  modelName: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  responseTime: number;
  userId?: number;
  taskId?: number;
  error?: string;
}): Promise<void> {
  await logEvent({
    level: options.error ? "error" : "info",
    type: "llm_usage",
    message: `LLM call: ${options.agentType} via ${options.modelProvider}/${options.modelName}`,
    details: {
      agentType: options.agentType,
      modelProvider: options.modelProvider,
      modelName: options.modelName,
      promptTokens: options.promptTokens,
      completionTokens: options.completionTokens,
      totalTokens: options.totalTokens,
      responseTime: options.responseTime,
      error: options.error,
    },
    userId: options.userId,
    taskId: options.taskId,
  });
}

/**
 * Log an error
 */
export async function logError(options: {
  message: string;
  error: Error | string;
  context?: Record<string, any>;
  userId?: number;
  taskId?: number;
}): Promise<void> {
  const errorDetails = options.error instanceof Error 
    ? { name: options.error.name, message: options.error.message, stack: options.error.stack }
    : { message: options.error };

  await logEvent({
    level: "error",
    type: "error",
    message: options.message,
    details: {
      ...errorDetails,
      ...options.context,
    },
    userId: options.userId,
    taskId: options.taskId,
  });
}

/**
 * Log an authentication event
 */
export async function logAuth(options: {
  event: "login" | "logout" | "register" | "failed_login" | "password_reset";
  userId?: number;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  error?: string;
}): Promise<void> {
  await logEvent({
    level: options.error ? "warning" : "info",
    type: "auth",
    message: `Auth event: ${options.event}${options.email ? ` (${options.email})` : ""}`,
    details: {
      event: options.event,
      email: options.email,
      error: options.error,
    },
    userId: options.userId,
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
  });
}

/**
 * Log a system event
 */
export async function logSystem(options: {
  event: string;
  details?: Record<string, any>;
  level?: LogLevel;
}): Promise<void> {
  await logEvent({
    level: options.level || "info",
    type: "system",
    message: options.event,
    details: options.details,
  });
}
