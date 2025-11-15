import { generateDailyBriefing, generateWeeklyBriefing } from "./briefingService";

/**
 * Briefing Scheduler
 * Manages scheduled generation of daily and weekly market intelligence briefings
 */

let dailyScheduler: NodeJS.Timeout | null = null;
let weeklyScheduler: NodeJS.Timeout | null = null;

/**
 * Start the briefing scheduler
 * - Daily briefings: Every day at 8:00 AM
 * - Weekly briefings: Every Monday at 9:00 AM
 */
export function startBriefingScheduler() {
  console.log("[Briefing Scheduler] Starting automated briefing scheduler...");

  // Schedule daily briefings
  scheduleDailyBriefings();

  // Schedule weekly briefings
  scheduleWeeklyBriefings();

  console.log("[Briefing Scheduler] Scheduler started successfully");
}

/**
 * Stop the briefing scheduler
 */
export function stopBriefingScheduler() {
  console.log("[Briefing Scheduler] Stopping scheduler...");

  if (dailyScheduler) {
    clearTimeout(dailyScheduler);
    dailyScheduler = null;
  }

  if (weeklyScheduler) {
    clearTimeout(weeklyScheduler);
    weeklyScheduler = null;
  }

  console.log("[Briefing Scheduler] Scheduler stopped");
}

/**
 * Schedule daily briefings at 8:00 AM every day
 */
function scheduleDailyBriefings() {
  const now = new Date();
  const scheduledTime = new Date();
  scheduledTime.setHours(8, 0, 0, 0); // 8:00 AM

  // If it's already past 8:00 AM today, schedule for tomorrow
  if (now > scheduledTime) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  const timeUntilExecution = scheduledTime.getTime() - now.getTime();

  console.log(
    `[Briefing Scheduler] Next daily briefing scheduled for: ${scheduledTime.toLocaleString("de-DE")}`
  );

  dailyScheduler = setTimeout(async () => {
    console.log("[Briefing Scheduler] Generating daily briefing...");
    const result = await generateDailyBriefing();

    if (result.success) {
      console.log(`[Briefing Scheduler] Daily briefing generated successfully: ID ${result.briefingId}`);
    } else {
      console.error(`[Briefing Scheduler] Failed to generate daily briefing: ${result.error}`);
    }

    // Schedule next daily briefing (24 hours from now)
    scheduleDailyBriefings();
  }, timeUntilExecution);
}

/**
 * Schedule weekly briefings at 9:00 AM every Monday
 */
function scheduleWeeklyBriefings() {
  const now = new Date();
  const scheduledTime = new Date();
  scheduledTime.setHours(9, 0, 0, 0); // 9:00 AM

  // Calculate days until next Monday (1 = Monday, 0 = Sunday)
  const currentDay = now.getDay();
  const daysUntilMonday = currentDay === 0 ? 1 : currentDay === 1 ? 0 : 8 - currentDay;

  // If it's Monday but already past 9:00 AM, schedule for next Monday
  if (currentDay === 1 && now > scheduledTime) {
    scheduledTime.setDate(scheduledTime.getDate() + 7);
  } else {
    scheduledTime.setDate(scheduledTime.getDate() + daysUntilMonday);
  }

  const timeUntilExecution = scheduledTime.getTime() - now.getTime();

  console.log(
    `[Briefing Scheduler] Next weekly briefing scheduled for: ${scheduledTime.toLocaleString("de-DE")}`
  );

  weeklyScheduler = setTimeout(async () => {
    console.log("[Briefing Scheduler] Generating weekly briefing...");
    const result = await generateWeeklyBriefing();

    if (result.success) {
      console.log(`[Briefing Scheduler] Weekly briefing generated successfully: ID ${result.briefingId}`);
    } else {
      console.error(`[Briefing Scheduler] Failed to generate weekly briefing: ${result.error}`);
    }

    // Schedule next weekly briefing (7 days from now)
    scheduleWeeklyBriefings();
  }, timeUntilExecution);
}

/**
 * Manually trigger a daily briefing (for testing)
 */
export async function triggerDailyBriefing() {
  console.log("[Briefing Scheduler] Manually triggering daily briefing...");
  return await generateDailyBriefing();
}

/**
 * Manually trigger a weekly briefing (for testing)
 */
export async function triggerWeeklyBriefing() {
  console.log("[Briefing Scheduler] Manually triggering weekly briefing...");
  return await generateWeeklyBriefing();
}
