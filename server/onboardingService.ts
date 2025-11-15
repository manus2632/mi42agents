import { getDb } from './db';
import { users, agentTasks, agentBriefings } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { executeAgentTask } from './agents';
import { sendWelcomeEmail } from './emailService';

/**
 * Automatic Onboarding Service
 * 
 * After a new user registers, this service:
 * 1. Analyzes the company website (extracted from email domain)
 * 2. Creates 7 pre-filled agent analyses tailored to the company
 * 3. Executes all analyses in the background
 * 4. Sends welcome email when complete
 * 
 * The 7 analyses cover:
 * - Market Analyst: Market analysis for construction suppliers
 * - Trend Scout: Current industry trends
 * - Demand Forecasting: Demand forecast for region
 * - Project Intelligence: Construction projects in region
 * - Pricing Strategy: Pricing strategy analysis
 * - Competitor Analysis: Competitor landscape (uses Survey Assistant agent)
 * - Market Entry: Market entry strategy (uses Strategy Advisor agent)
 */

interface OnboardingAnalysis {
  agentType: 'market_analyst' | 'trend_scout' | 'demand_forecasting' | 'project_intelligence' | 'pricing_strategy' | 'survey_assistant' | 'strategy_advisor';
  title: string;
  prompt: string;
}

/**
 * Generate 7 pre-filled analyses based on company information
 */
function generateOnboardingAnalyses(
  companyName: string,
  domain: string,
  industry: string = 'construction suppliers'
): OnboardingAnalysis[] {
  return [
    {
      agentType: 'market_analyst',
      title: `Market Analysis: ${companyName}`,
      prompt: `Analyze the market for ${companyName} (${domain}) in the construction supplier industry. Include:
- Market size and growth trends
- Key market segments
- Regional opportunities
- Competitive landscape overview
- Market entry barriers
- Growth potential assessment

Focus on actionable insights for strategic decision-making.`,
    },
    {
      agentType: 'trend_scout',
      title: `Industry Trends for ${companyName}`,
      prompt: `Identify and analyze current trends in the construction supplier industry relevant to ${companyName}:
- Emerging technologies (e.g., BIM, prefabrication, sustainable materials)
- Regulatory changes affecting construction suppliers
- Sustainability and green building trends
- Digital transformation in construction
- Supply chain innovations
- Customer behavior shifts

Provide trend impact assessment and recommendations.`,
    },
    {
      agentType: 'demand_forecasting',
      title: `Demand Forecast: ${companyName} Region`,
      prompt: `Forecast demand for construction materials and services in ${companyName}'s target markets:
- Historical demand trends (past 3-5 years)
- Current demand drivers
- Future demand projections (next 1-3 years)
- Seasonal patterns
- Regional variations
- Risk factors and uncertainties

Include quantitative estimates where possible.`,
    },
    {
      agentType: 'project_intelligence',
      title: `Construction Projects Near ${companyName}`,
      prompt: `Identify major construction projects and opportunities relevant to ${companyName}:
- Large-scale infrastructure projects
- Commercial and residential developments
- Public sector construction projects
- Project timelines and phases
- Potential supply opportunities
- Key decision-makers and contractors

Focus on projects where ${companyName} could be a supplier.`,
    },
    {
      agentType: 'pricing_strategy',
      title: `Pricing Strategy for ${companyName}`,
      prompt: `Develop a pricing strategy for ${companyName} in the construction supplier market:
- Current market pricing benchmarks
- Competitor pricing analysis
- Cost structure considerations
- Value-based pricing opportunities
- Volume discount strategies
- Contract pricing models
- Dynamic pricing recommendations

Provide specific pricing recommendations.`,
    },
    {
      agentType: 'survey_assistant',
      title: `Competitor Analysis: ${companyName}`,
      prompt: `Analyze the competitive landscape for ${companyName} in the construction supplier industry:
- Top 5-10 direct competitors
- Competitor strengths and weaknesses
- Market positioning comparison
- Product/service differentiation
- Competitive advantages of ${companyName}
- Threats and opportunities
- Strategic recommendations

Include competitor profiles and SWOT analysis.`,
    },
    {
      agentType: 'strategy_advisor',
      title: `Market Entry Strategy for ${companyName}`,
      prompt: `Develop a market entry and growth strategy for ${companyName}:
- Market entry modes (direct sales, distributors, partnerships)
- Target customer segments
- Go-to-market strategy
- Sales channel recommendations
- Marketing and positioning strategy
- Resource requirements
- Implementation roadmap (6-12 months)
- Success metrics and KPIs

Provide actionable strategic recommendations.`,
    },
  ];
}

/**
 * Extract company name from domain
 * e.g., "heidelbergcement.de" -> "Heidelberg Cement"
 */
function extractCompanyName(domain: string): string {
  // Remove TLD (.com, .de, etc.)
  const name = domain.split('.')[0];
  
  // Split camelCase or PascalCase
  const words = name.replace(/([A-Z])/g, ' $1').trim();
  
  // Capitalize first letter of each word
  return words
    .split(/[\s-_]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Run automatic onboarding for a new user
 * This should be called asynchronously after registration
 */
export async function runAutomaticOnboarding(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.error('[Onboarding] Database not available');
    return;
  }

  try {
    console.log(`[Onboarding] Starting automatic onboarding for user ${userId}`);

    // Get user information
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userResult.length === 0) {
      console.error(`[Onboarding] User ${userId} not found`);
      return;
    }

    const user = userResult[0];

    // Check if onboarding already completed
    if (user.onboardingCompleted) {
      console.log(`[Onboarding] User ${userId} already completed onboarding`);
      return;
    }

    // Extract company information
    const domain = user.emailDomain || user.email?.split('@')[1] || '';
    const companyName = user.companyName || extractCompanyName(domain);

    console.log(`[Onboarding] Company: ${companyName} (${domain})`);

    // Generate 7 pre-filled analyses
    const analyses = generateOnboardingAnalyses(companyName, domain);

    console.log(`[Onboarding] Creating ${analyses.length} analyses for user ${userId}`);

    // Create and execute each analysis
    const taskIds: number[] = [];
    for (const analysis of analyses) {
      try {
        // Create task in database
        const [taskResult] = await db.insert(agentTasks).values({
          userId,
          agentType: analysis.agentType,
          taskPrompt: analysis.prompt,
          taskStatus: 'pending',
        });

        const taskId = Number(taskResult.insertId);
        if (!taskId || isNaN(taskId)) {
          console.error(`[Onboarding] Failed to create task for ${analysis.agentType}`);
          continue;
        }

        taskIds.push(taskId);

        console.log(`[Onboarding] Created task ${taskId}: ${analysis.title}`);

        // Execute task asynchronously (don't wait)
        executeAgentTask(taskId, analysis.agentType, analysis.prompt, userId, 'de').catch(error => {
          console.error(`[Onboarding] Failed to execute task ${taskId}:`, error);
        });

      } catch (error) {
        console.error(`[Onboarding] Error creating task for ${analysis.agentType}:`, error);
      }
    }

    // Mark onboarding as completed
    await db
      .update(users)
      .set({
        onboardingCompleted: 1, // MySQL tinyint(1)
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    console.log(`[Onboarding] Onboarding completed for user ${userId}. Created ${taskIds.length} analyses.`);

    // Send welcome email after a short delay (to allow first analysis to complete)
    setTimeout(async () => {
      try {
        if (user.email) {
          await sendWelcomeEmail(
            user.email,
            user.name || companyName,
            analyses.length
          );
          console.log(`[Onboarding] Welcome email sent to ${user.email}`);
        }
      } catch (error) {
        console.error('[Onboarding] Failed to send welcome email:', error);
      }
    }, 30000); // Wait 30 seconds

  } catch (error) {
    console.error(`[Onboarding] Error during onboarding for user ${userId}:`, error);
  }
}

/**
 * Trigger onboarding for a user (can be called from registration or manually)
 */
export async function triggerOnboarding(userId: number): Promise<void> {
  // Run onboarding asynchronously (don't block registration)
  setImmediate(() => {
    runAutomaticOnboarding(userId).catch(error => {
      console.error(`[Onboarding] Failed to run onboarding for user ${userId}:`, error);
    });
  });
}
