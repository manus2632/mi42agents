import { executeAgentTask } from './server/agents.js';

console.log('Testing agent execution...');

try {
  const result = await executeAgentTask(
    2, // taskId
    'market_analyst',
    'Test: Analysiere den Markt für Baustoffe in Deutschland',
    1, // userId
    'de'
  );
  
  console.log('Result:', JSON.stringify(result, null, 2));
} catch (error) {
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
}
