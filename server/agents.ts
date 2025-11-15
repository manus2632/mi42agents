import { invokeLLM } from "./_core/llm";
import * as db from "./db";
import { logLLMUsage, logError } from "./loggingService";
import { getModelConfig } from "./db";

export type AgentType = "market_analyst" | "trend_scout" | "survey_assistant" | "strategy_advisor" | "demand_forecasting" | "project_intelligence" | "pricing_strategy" | "competitor_intelligence";

interface AgentConfig {
  name: string;
  systemPrompt: string;
  estimatedCredits: number;
}

const AGENT_CONFIGS: Record<AgentType, AgentConfig> = {
  market_analyst: {
    name: "Markt-Analyst",
    systemPrompt: `Du bist ein hochspezialisierter Markt-Analyst für die Bau-Zulieferer-Industrie. 
    
Deine Aufgaben:
- Analyse von Marktdaten und Trends in der globalen Bauindustrie
- Identifikation von Wachstumschancen und Risiken
- Bewertung von Wettbewerbspositionen
- Prognosen zur Marktentwicklung

Antworte immer strukturiert, datenbasiert und mit konkreten Handlungsempfehlungen. 
Verwende keine Emojis. Stil: wissenschaftlich, präzise, für C-Level-Entscheider.`,
    estimatedCredits: 200,
  },
  
  trend_scout: {
    name: "Trend-Scout",
    systemPrompt: `Du bist ein Trend-Scout für die Bau-Zulieferer-Industrie mit Fokus auf Innovation und Zukunftstrends.

Deine Aufgaben:
- Identifikation von technologischen Trends (BIM, Digitalisierung, Nachhaltigkeit)
- Analyse von Innovationen bei Wettbewerbern
- Bewertung von Marktchancen durch neue Technologien
- Frühwarnsystem für disruptive Entwicklungen

Antworte strukturiert mit konkreten Beispielen und Handlungsempfehlungen.
Verwende keine Emojis. Stil: innovativ, zukunftsorientiert, aber wissenschaftlich fundiert.`,
    estimatedCredits: 500,
  },
  
  survey_assistant: {
    name: "Umfrage-Assistent",
    systemPrompt: `Du bist ein Experte für Marktforschung und Umfragedesign in der Bau-Zulieferer-Industrie.

Deine Aufgaben:
- Entwicklung von Umfragekonzepten und Fragebögen
- Analyse von Umfrageergebnissen
- Identifikation von Mustern und Insights
- Ableitung von Handlungsempfehlungen aus Befragungsdaten

Antworte methodisch fundiert und mit konkreten Vorschlägen.
Verwende keine Emojis. Stil: wissenschaftlich, methodisch präzise.`,
    estimatedCredits: 2000,
  },
  
  strategy_advisor: {
    name: "Strategie-Berater",
    systemPrompt: `Du bist ein strategischer Berater für die Bau-Zulieferer-Industrie mit Fokus auf Marktpositionierung und Wachstum.

Deine Aufgaben:
- Entwicklung von Marktstrategien
- Analyse von Wettbewerbsvorteilen
- Identifikation von Marktchancen und Risiken
- Strategische Handlungsempfehlungen für Expansion

Antworte strategisch, mit klaren Prioritäten und umsetzbaren Empfehlungen.
Verwende keine Emojis. Stil: strategisch, C-Level-gerecht, umsetzungsorientiert.`,
    estimatedCredits: 5000,
  },
  
  demand_forecasting: {
    name: "Demand Forecasting Agent",
    systemPrompt: `Du bist ein Experte für Nachfrageprognosen in der Bau-Zulieferer-Industrie.

Deine Aufgaben:
- Analyse historischer Nachfragedaten für Baumaterialien
- Prognose zukünftiger Nachfragetrends (3-12 Monate)
- Identifikation saisonaler Muster und Zyklen
- Berücksichtigung makroökonomischer Faktoren (GDP, Zinsen, Bauinvestitionen)
- Regionale Nachfrageunterschiede und Marktdynamiken
- Risikobewertung und Szenarioanalysen

Antworte datenbasiert mit konkreten Prognosen, Konfidenzintervallen und Handlungsempfehlungen für Produktionsplanung und Lagerhaltung.
Verwende keine Emojis. Stil: analytisch, präzise, quantitativ fundiert.`,
    estimatedCredits: 1500,
  },
  
  project_intelligence: {
    name: "Project Intelligence Agent",
    systemPrompt: `Du bist ein Spezialist für Bauprojekt-Intelligence und Lead-Generierung in der Bau-Zulieferer-Industrie.

Deine Aufgaben:
- Identifikation relevanter Bauprojekte (Neubau, Sanierung, Infrastruktur)
- Bewertung von Projektvolumen und Lieferpotenzial
- Analyse von Projektträgern, Architekten, Generalunternehmern
- Zeitliche Einordnung (Planungsphase, Ausschreibung, Baubeginn)
- Lead-Scoring und Priorisierung nach Erfolgswahrscheinlichkeit
- Wettbewerbsanalyse: Welche Zulieferer sind bereits involviert?
- Strategische Empfehlungen für Akquise und Angebotserstellung

Antworte strukturiert mit konkreten Projektdaten, Kontaktinformationen und Akquise-Strategien.
Verwende keine Emojis. Stil: vertriebsorientiert, actionable, ROI-fokussiert.`,
    estimatedCredits: 2000,
  },
  
  pricing_strategy: {
    name: "Pricing Strategy Agent",
    systemPrompt: `Du bist ein Experte für dynamische Preisstrategien in der Bau-Zulieferer-Industrie.

Deine Aufgaben:
- Analyse aktueller Marktpreise für Baumaterialien (regional und global)
- Wettbewerbs-Pricing-Analyse (Benchmarking)
- Rohstoffkosten-Tracking und Impact-Analyse
- Nachfrage-elastizität und Preissensitivität
- Optimale Preispositionierung (Premium, Mid-Market, Value)
- Dynamische Preisanpassungen basierend auf Marktbedingungen
- Margen-Optimierung unter Berücksichtigung von Volumen und Wettbewerb
- Strategische Empfehlungen für Preisverhandlungen und Rabattstrukturen

Antworte mit konkreten Preisempfehlungen, Margenkalkulationen und Wettbewerbsvergleichen.
Verwende keine Emojis. Stil: quantitativ, strategisch, profitabilitätsorientiert.`,
    estimatedCredits: 1800,
  },
  
  competitor_intelligence: {
    name: "Competitor Intelligence Agent",
    systemPrompt: `Du bist ein Experte für Wettbewerbsanalyse und Competitive Intelligence in der Bau-Zulieferer-Industrie.

Deine Aufgaben:
- Identifikation und Profiling von direkten und indirekten Wettbewerbern
- Analyse von Wettbewerber-Strategien (Produkte, Pricing, Positionierung, Marketing)
- Bewertung von Wettbewerber-Stärken und -Schwächen (SWOT-Analyse)
- Marktanteils-Analyse und Wettbewerbspositionierung
- Monitoring von Wettbewerber-Aktivitäten (Produktlaunches, Akquisitionen, Expansionen)
- Benchmarking von Leistungskennzahlen (Umsatz, Wachstum, Profitabilität, Innovation)
- Identifikation von Wettbewerbsvorteilen und Differenzierungsmöglichkeiten
- Frühwarnsystem für disruptive Wettbewerber und Marktveränderungen
- Strategische Empfehlungen zur Verteidigung und Ausbau der Marktposition

Antworte mit detaillierten Wettbewerber-Profilen, SWOT-Analysen, Marktpositionierungs-Maps und strategischen Handlungsempfehlungen.
Verwende keine Emojis. Stil: analytisch, strategisch, wettbewerbsorientiert, C-Level-gerecht.`,
    estimatedCredits: 2500,
  },
};

export async function executeAgentTask(
  taskId: number,
  agentType: AgentType,
  prompt: string,
  userId: number,
  language: string = "de"
): Promise<{ success: boolean; briefingId?: number; error?: string }> {
  try {
    const config = AGENT_CONFIGS[agentType];
    
    // Update task status to running
    await db.updateAgentTask(taskId, { taskStatus: "running" });

    // Get company profile for context
    const companyProfile = await db.getCompanyProfile(userId);
    
    let contextPrompt = prompt;
    if (companyProfile) {
      contextPrompt = `Kontext: Unternehmen "${companyProfile.companyName}" (${companyProfile.companyDomain})
Produktportfolio: ${companyProfile.productPortfolio || "Nicht verfügbar"}
Hauptwettbewerber: ${companyProfile.competitors || "Nicht verfügbar"}

Aufgabe: ${prompt}`;
    }

    // Get model configuration for this agent
    const modelConfig = await getModelConfig(userId, agentType);
    const modelProvider = modelConfig?.modelProvider || 'open_webui';
    const modelName = modelConfig?.modelName || (modelProvider === 'open_webui' ? 'gpt-oss:120b' : 'gemini-2.5-flash');

    console.log(`[Agent] Using model: ${modelProvider}/${modelName}`);

    // Execute LLM request
    const startTime = Date.now();
    const response = await invokeLLM({
      modelProvider,
      modelName,
      messages: [
        { role: "system", content: config.systemPrompt },
        { role: "user", content: contextPrompt },
      ],
    });

    const content = response.choices[0]?.message?.content || "";
    const responseTime = Date.now() - startTime;

    // Log LLM usage
    await logLLMUsage({
      agentType,
      modelProvider,
      modelName,
      promptTokens: response.usage?.prompt_tokens,
      completionTokens: response.usage?.completion_tokens,
      totalTokens: response.usage?.total_tokens,
      responseTime,
      userId,
      taskId,
    });

    // Create briefing structure
    const briefingData = {
      title: `${config.name}: ${prompt.substring(0, 100)}`,
      agentType,
      prompt,
      response: content,
      generatedAt: new Date().toISOString(),
      context: companyProfile ? {
        company: companyProfile.companyName,
        domain: companyProfile.companyDomain,
      } : null,
    };

    // Save briefing
    await db.createBriefing({
      taskId,
      userId,
      briefingTitle: briefingData.title,
      briefingData: JSON.stringify(briefingData),
      isOnboarding: false,
      language,
    });

    // Get the created briefing
    const briefings = await db.getUserBriefings(userId, 1);
    const briefingId = briefings[0]?.id;

    // Update task as completed
    await db.updateAgentTask(taskId, {
      taskStatus: "completed",
      completedAt: new Date(),
      creditsActual: config.estimatedCredits,
    });

    return { success: true, briefingId };
  } catch (error) {
    console.error(`[Agent] Task ${taskId} failed:`, error);
    
    // Log error
    await logError({
      message: `Agent task ${taskId} failed`,
      error: error as Error,
      context: { agentType, userId },
      userId,
      taskId,
    });
    
    await db.updateAgentTask(taskId, { taskStatus: "failed" });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function analyzeCompanyFromDomain(
  domain: string,
  userId: number,
  language: string = "de"
): Promise<{ success: boolean; profileId?: number; briefingId?: number; error?: string }> {
  try {
    const systemPrompt = `Du bist ein Experte für Wettbewerbsanalyse in der Bau-Zulieferer-Industrie.

Analysiere das Unternehmen anhand der Domain und erstelle ein strukturiertes Profil.

Antworte im JSON-Format mit folgender Struktur:
{
  "companyName": "Firmenname",
  "productPortfolio": ["Produkt 1", "Produkt 2", ...],
  "mainMarkets": ["Markt 1", "Markt 2", ...],
  "competitors": ["Wettbewerber 1", "Wettbewerber 2", ...],
  "strengths": ["Stärke 1", "Stärke 2", ...],
  "marketPosition": "Beschreibung der Marktposition",
  "analysis": "Detaillierte Analyse"
}`;

    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analysiere das Unternehmen mit der Domain: ${domain}` as string },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "company_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              companyName: { type: "string" },
              productPortfolio: { type: "array", items: { type: "string" } },
              mainMarkets: { type: "array", items: { type: "string" } },
              competitors: { type: "array", items: { type: "string" } },
              strengths: { type: "array", items: { type: "string" } },
              marketPosition: { type: "string" },
              analysis: { type: "string" },
            },
            required: ["companyName", "productPortfolio", "mainMarkets", "competitors", "strengths", "marketPosition", "analysis"],
            additionalProperties: false,
          },
        },
      },
    });

    const contentRaw = response.choices[0]?.message?.content;
    const content = typeof contentRaw === 'string' ? contentRaw : "{}";
    const analysisData = JSON.parse(content);

    // Save company profile
    await db.createCompanyProfile({
      userId,
      companyDomain: domain,
      companyName: analysisData.companyName,
      productPortfolio: JSON.stringify(analysisData.productPortfolio),
      competitors: JSON.stringify(analysisData.competitors),
      analysisData: content,
    });

    // Get the created profile
    const profile = await db.getCompanyProfile(userId);
    const profileId = profile?.id;

    // Create welcome briefing
    const briefingData = {
      title: `Willkommens-Briefing: ${analysisData.companyName}`,
      agentType: "market_analyst",
      prompt: "Automatische Wettbewerbsanalyse beim Onboarding",
      response: analysisData.analysis,
      companyProfile: analysisData,
      generatedAt: new Date().toISOString(),
    };

    await db.createBriefing({
      taskId: 0,
      userId,
      briefingTitle: briefingData.title,
      briefingData: JSON.stringify(briefingData),
      isOnboarding: true,
      language,
    });

    const briefings = await db.getUserBriefings(userId, 1);
    const briefingId = briefings[0]?.id;

    return { success: true, profileId, briefingId };
  } catch (error) {
    console.error(`[Agent] Company analysis failed for ${domain}:`, error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export function getAgentConfig(agentType: AgentType): AgentConfig {
  return AGENT_CONFIGS[agentType];
}
