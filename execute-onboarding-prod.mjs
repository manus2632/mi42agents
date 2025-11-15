import mysql from 'mysql2/promise';
import OpenAI from 'openai';

// Database connection (Docker network)
const db = await mysql.createConnection({
  host: 'mi42-db',
  port: 3306,
  user: 'mi42_user',
  password: 'mi42_password_2025',
  database: 'mi42_db'
});

// OpenAI client
const openai = new OpenAI({
  apiKey: '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'
});

// Agent configurations
const AGENT_CONFIGS = {
  market_analyst: {
    name: "Markt-Analyst",
    systemPrompt: "Du bist ein erfahrener Marktanalyst für die Baubranche und Bauzuliefererindustrie. Analysiere Märkte, Trends und Wettbewerbssituationen mit fundiertem Fachwissen.",
    credits: 500
  },
  trend_scout: {
    name: "Trend-Scout",
    systemPrompt: "Du bist ein Trend-Experte für die Baubranche. Identifiziere aufkommende Trends, technologische Entwicklungen und Marktveränderungen.",
    credits: 750
  },
  demand_forecasting: {
    name: "Nachfrage-Prognose",
    systemPrompt: "Du bist ein Experte für Nachfrageprognosen in der Baubranche. Erstelle datenbasierte Vorhersagen für Baumaterialien und Bauprojekte.",
    credits: 1500
  },
  project_intelligence: {
    name: "Projekt-Intelligence",
    systemPrompt: "Du bist ein Experte für Bauprojekt-Analysen. Identifiziere und analysiere laufende und geplante Bauprojekte mit strategischem Fokus.",
    credits: 2000
  },
  pricing_strategy: {
    name: "Pricing-Strategie",
    systemPrompt: "Du bist ein Experte für Preisstrategie in der Bauzuliefererindustrie. Entwickle datenbasierte Pricing-Strategien und Marktpositionierung.",
    credits: 1200
  },
  competitor_intelligence: {
    name: "Wettbewerbs-Intelligence",
    systemPrompt: "Du bist ein Experte für Wettbewerbsanalyse in der Bauzuliefererindustrie. Analysiere Wettbewerber, Marktanteile und strategische Positionierung.",
    credits: 2500
  },
  strategy_advisor: {
    name: "Strategie-Berater",
    systemPrompt: "Du bist ein strategischer Berater für die Bauzuliefererindustrie. Entwickle umfassende Strategieempfehlungen basierend auf Marktanalysen.",
    credits: 1000
  }
};

async function executeTask(taskId, agentType, prompt, userId) {
  const config = AGENT_CONFIGS[agentType];
  
  console.log(`\n[${new Date().toISOString()}] Starting task ${taskId}: ${config.name}`);
  console.log(`Prompt: ${prompt.substring(0, 100)}...`);
  
  try {
    // Update task status to running
    await db.execute(
      'UPDATE agent_tasks SET taskStatus = ? WHERE id = ?',
      ['running', taskId]
    );
    
    const startTime = Date.now();
    
    // Execute OpenAI request
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: config.systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });
    
    const content = response.choices[0]?.message?.content || '';
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`✓ LLM response received (${duration}s, ${content.length} chars)`);
    
    // Save result to agent_tasks table
    await db.execute(
      'UPDATE agent_tasks SET taskStatus = ?, completedAt = NOW(), result = ?, creditsActual = ? WHERE id = ?',
      ['completed', content, config.credits, taskId]
    );
    
    // Create briefing
    const briefingData = {
      title: `${config.name}: ${prompt.substring(0, 100)}`,
      agentType,
      prompt,
      response: content,
      generatedAt: new Date().toISOString()
    };
    
    await db.execute(
      'INSERT INTO agent_briefings (userId, taskId, briefingTitle, briefingData, isOnboarding, language, createdAt) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [userId, taskId, briefingData.title, JSON.stringify(briefingData), 1, 'de']
    );
    
    // Deduct credits
    await db.execute(
      'UPDATE agent_credits SET balance = balance - ? WHERE userId = ?',
      [config.credits, userId]
    );
    
    console.log(`✓ Task ${taskId} completed successfully (${config.credits} credits deducted)`);
    
    return { success: true, duration, content };
    
  } catch (error) {
    console.error(`✗ Task ${taskId} failed:`, error.message);
    
    await db.execute(
      'UPDATE agent_tasks SET taskStatus = ? WHERE id = ?',
      ['failed', taskId]
    );
    
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('=== Mi42 Onboarding Execution ===');
  console.log('User ID: 37 (test.manager@heidelbergmaterials.com)');
  console.log('Tasks: 7 agent analyses\n');
  
  // Get all pending tasks for user 37
  const [tasks] = await db.execute(
    'SELECT id, agentType, taskPrompt FROM agent_tasks WHERE userId = ? AND taskStatus = ? ORDER BY id',
    [37, 'pending']
  );
  
  console.log(`Found ${tasks.length} pending tasks\n`);
  
  const results = [];
  const totalStart = Date.now();
  
  for (const task of tasks) {
    const result = await executeTask(task.id, task.agentType, task.taskPrompt, 37);
    results.push({ taskId: task.id, agentType: task.agentType, ...result });
    
    // Wait 2 seconds between tasks to avoid rate limiting
    if (tasks.indexOf(task) < tasks.length - 1) {
      console.log('Waiting 2 seconds before next task...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  const totalDuration = ((Date.now() - totalStart) / 1000).toFixed(2);
  
  console.log('\n=== Execution Summary ===');
  console.log(`Total duration: ${totalDuration}s`);
  console.log(`Successful: ${results.filter(r => r.success).length}/${results.length}`);
  console.log(`Failed: ${results.filter(r => !r.success).length}/${results.length}`);
  
  // Check final credit balance
  const [credits] = await db.execute(
    'SELECT balance FROM agent_credits WHERE userId = ?',
    [37]
  );
  
  console.log(`\nFinal credit balance: ${credits[0]?.balance || 0} credits`);
  
  await db.end();
}

main().catch(console.error);
