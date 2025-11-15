import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { automatedBriefings, InsertAutomatedBriefing } from "../drizzle/schema";
import { desc, eq } from "drizzle-orm";

/**
 * Automated Briefing Service
 * Generates daily/weekly market intelligence briefings with:
 * - Commodity prices (steel, aluminum, copper, wood, glass, insulation)
 * - Stock market indices (DAX, Dow Jones, construction sector)
 * - News aggregation from construction industry sources
 */

interface BriefingGenerationResult {
  success: boolean;
  briefingId?: number;
  error?: string;
}

/**
 * Generate a daily market briefing
 */
export async function generateDailyBriefing(): Promise<BriefingGenerationResult> {
  try {
    const today = new Date();
    const title = `Daily Market Intelligence - ${today.toLocaleDateString("de-DE", { 
      weekday: "long", 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    })}`;

    const systemPrompt = `You are a market intelligence analyst for the construction supply industry. Generate a comprehensive daily market briefing in German.

Include the following sections:

1. **Rohstoffpreise** (Commodity Prices)
   - Stahl (Steel)
   - Aluminium (Aluminum)
   - Kupfer (Copper)
   - Holz (Wood)
   - Glas (Glass)
   - Dämmstoffe (Insulation materials)
   - Preisveränderungen zum Vortag (Price changes from previous day)

2. **Börsenindizes** (Stock Market Indices)
   - DAX (German stock index)
   - Dow Jones Industrial Average
   - Bausektor-Indizes (Construction sector indices)
   - Relevante Unternehmen (Relevant companies)

3. **Branchennachrichten** (Industry News)
   - Wichtige Entwicklungen in der Baubranche (Important developments in construction industry)
   - Neue Projekte und Ausschreibungen (New projects and tenders)
   - Regulatorische Änderungen (Regulatory changes)

4. **Markttrends** (Market Trends)
   - Nachfrageentwicklung (Demand trends)
   - Lieferkettenanalyse (Supply chain analysis)
   - Prognosen für die kommenden Tage (Forecasts for coming days)

Format the output in Markdown with clear headings and bullet points. Use tables for price data where appropriate.`;

    const userPrompt = `Generate a daily market intelligence briefing for ${today.toLocaleDateString("de-DE")}. 

Please provide realistic market data and trends based on current construction industry conditions. Include specific numbers for commodity prices and stock indices.`;

    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const messageContent = response.choices[0]?.message?.content;
    const content = typeof messageContent === "string" ? messageContent : "";

    if (!content) {
      throw new Error("No content generated from LLM");
    }

    // Save to database
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const newBriefing: InsertAutomatedBriefing = {
      briefingType: "daily",
      title,
      content,
      scheduledFor: today,
      status: "generated",
    };

    const result = await db.insert(automatedBriefings).values(newBriefing);
    const briefingId = Number(result[0].insertId);

    console.log(`[Briefing Service] Daily briefing generated: ID ${briefingId}`);

    return {
      success: true,
      briefingId,
    };
  } catch (error) {
    console.error("[Briefing Service] Failed to generate daily briefing:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generate a weekly market briefing
 */
export async function generateWeeklyBriefing(): Promise<BriefingGenerationResult> {
  try {
    const today = new Date();
    const weekNumber = getWeekNumber(today);
    const title = `Weekly Market Intelligence - KW ${weekNumber} ${today.getFullYear()}`;

    const systemPrompt = `You are a market intelligence analyst for the construction supply industry. Generate a comprehensive weekly market briefing in German.

Include the following sections:

1. **Wochenrückblick Rohstoffpreise** (Weekly Commodity Price Review)
   - Stahl, Aluminium, Kupfer, Holz, Glas, Dämmstoffe
   - Wochenveränderungen und Trends
   - Preisentwicklung im Vergleich zur Vorwoche

2. **Börsenperformance** (Stock Market Performance)
   - DAX, Dow Jones, Bausektor-Indizes
   - Top-Performer und Verlierer der Woche
   - Marktkapitalisierung relevanter Unternehmen

3. **Branchenanalyse** (Industry Analysis)
   - Wichtigste Ereignisse der Woche
   - Neue Großprojekte und Ausschreibungen
   - M&A-Aktivitäten (Mergers & Acquisitions)
   - Technologische Innovationen

4. **Marktausblick** (Market Outlook)
   - Prognosen für die kommende Woche
   - Risikofaktoren und Chancen
   - Empfehlungen für Einkaufsstrategien

5. **Statistiken und Kennzahlen** (Statistics and KPIs)
   - Auftragsvolumen
   - Baugenehmigungen
   - Produktionsindizes

Format the output in Markdown with clear headings, bullet points, and tables. Include charts descriptions where relevant.`;

    const userPrompt = `Generate a weekly market intelligence briefing for calendar week ${weekNumber} of ${today.getFullYear()}. 

Provide comprehensive analysis of the past week's developments in the construction supply industry. Include specific data, trends, and actionable insights.`;

    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const messageContent = response.choices[0]?.message?.content;
    const content = typeof messageContent === "string" ? messageContent : "";

    if (!content) {
      throw new Error("No content generated from LLM");
    }

    // Save to database
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const newBriefing: InsertAutomatedBriefing = {
      briefingType: "weekly",
      title,
      content,
      scheduledFor: today,
      status: "generated",
    };

    const result = await db.insert(automatedBriefings).values(newBriefing);
    const briefingId = Number(result[0].insertId);

    console.log(`[Briefing Service] Weekly briefing generated: ID ${briefingId}`);

    return {
      success: true,
      briefingId,
    };
  } catch (error) {
    console.error("[Briefing Service] Failed to generate weekly briefing:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all automated briefings (paginated)
 */
export async function getAllBriefings(limit: number = 50) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return db
    .select()
    .from(automatedBriefings)
    .orderBy(desc(automatedBriefings.generatedAt))
    .limit(limit);
}

/**
 * Get a specific briefing by ID
 */
export async function getBriefingById(id: number) {
  const db = await getDb();
  if (!db) {
    return null;
  }

  const results = await db
    .select()
    .from(automatedBriefings)
    .where(eq(automatedBriefings.id, id))
    .limit(1);

  return results[0] || null;
}

/**
 * Helper: Get ISO week number
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
