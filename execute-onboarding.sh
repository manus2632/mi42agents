#!/bin/bash

# Mi42 Onboarding Execution Script
# Executes 7 agent analyses for test user using OpenAI API

OPENAI_API_KEY="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"
USER_ID=37

echo "=== Mi42 Onboarding Execution ==="
echo "User ID: $USER_ID (test.manager@heidelbergmaterials.com)"
echo ""

# Function to execute a single task
execute_task() {
    local TASK_ID=$1
    local AGENT_TYPE=$2
    local AGENT_NAME=$3
    local SYSTEM_PROMPT=$4
    local USER_PROMPT=$5
    local CREDITS=$6
    
    echo "[$(date -Iseconds)] Starting task $TASK_ID: $AGENT_NAME"
    echo "Prompt: ${USER_PROMPT:0:100}..."
    
    # Update task status to running
    docker exec mi42-db mysql -umi42_user -pmi42_password_2025 mi42_db -e \
        "UPDATE agent_tasks SET taskStatus = 'running' WHERE id = $TASK_ID;" 2>/dev/null
    
    # Call OpenAI API
    RESPONSE=$(curl -s https://api.openai.com/v1/chat/completions \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $OPENAI_API_KEY" \
        -d "{
            \"model\": \"gpt-4o-mini\",
            \"messages\": [
                {\"role\": \"system\", \"content\": $(echo "$SYSTEM_PROMPT" | jq -Rs .)},
                {\"role\": \"user\", \"content\": $(echo "$USER_PROMPT" | jq -Rs .)}
            ],
            \"temperature\": 0.7,
            \"max_tokens\": 4000
        }" \
        --max-time 60)
    
    # Extract content from response
    CONTENT=$(echo "$RESPONSE" | jq -r '.choices[0].message.content // empty')
    
    if [ -z "$CONTENT" ]; then
        echo "✗ Task $TASK_ID failed: No response from OpenAI"
        docker exec mi42-db mysql -umi42_user -pmi42_password_2025 mi42_db -e \
            "UPDATE agent_tasks SET taskStatus = 'failed' WHERE id = $TASK_ID;" 2>/dev/null
        return 1
    fi
    
    echo "✓ LLM response received (${#CONTENT} chars)"
    
    # Escape content for SQL
    CONTENT_ESCAPED=$(echo "$CONTENT" | sed "s/'/''/g")
    
    # Update task with result
    docker exec mi42-db mysql -umi42_user -pmi42_password_2025 mi42_db -e \
        "UPDATE agent_tasks SET taskStatus = 'completed', completedAt = NOW(), result = '$CONTENT_ESCAPED', creditsActual = $CREDITS WHERE id = $TASK_ID;" 2>/dev/null
    
    # Create briefing
    BRIEFING_TITLE="${AGENT_NAME}: ${USER_PROMPT:0:100}"
    BRIEFING_DATA=$(jq -n \
        --arg title "$BRIEFING_TITLE" \
        --arg agentType "$AGENT_TYPE" \
        --arg prompt "$USER_PROMPT" \
        --arg response "$CONTENT" \
        --arg generatedAt "$(date -Iseconds)" \
        '{title: $title, agentType: $agentType, prompt: $prompt, response: $response, generatedAt: $generatedAt}')
    
    BRIEFING_DATA_ESCAPED=$(echo "$BRIEFING_DATA" | sed "s/'/''/g")
    
    docker exec mi42-db mysql -umi42_user -pmi42_password_2025 mi42_db -e \
        "INSERT INTO agent_briefings (userId, taskId, briefingTitle, briefingData, isOnboarding, language, createdAt) VALUES ($USER_ID, $TASK_ID, '$BRIEFING_TITLE', '$BRIEFING_DATA_ESCAPED', 1, 'de', NOW());" 2>/dev/null
    
    # Deduct credits
    docker exec mi42-db mysql -umi42_user -pmi42_password_2025 mi42_db -e \
        "UPDATE agent_credits SET balance = balance - $CREDITS WHERE userId = $USER_ID;" 2>/dev/null
    
    echo "✓ Task $TASK_ID completed successfully ($CREDITS credits deducted)"
    echo ""
    
    return 0
}

# Task 1: Market Analyst
execute_task 24 "market_analyst" "Markt-Analyst" \
    "Du bist ein erfahrener Marktanalyst für die Baubranche und Bauzuliefererindustrie. Analysiere Märkte, Trends und Wettbewerbssituationen mit fundiertem Fachwissen." \
    "Analysiere den Markt für Zement und Baustoffe in Deutschland. Fokus: Heidelberg Materials AG" \
    500

sleep 2

# Task 2: Trend Scout
execute_task 25 "trend_scout" "Trend-Scout" \
    "Du bist ein Trend-Experte für die Baubranche. Identifiziere aufkommende Trends, technologische Entwicklungen und Marktveränderungen." \
    "Identifiziere aktuelle Trends in der Baubranche und Zementindustrie" \
    750

sleep 2

# Task 3: Demand Forecasting
execute_task 26 "demand_forecasting" "Nachfrage-Prognose" \
    "Du bist ein Experte für Nachfrageprognosen in der Baubranche. Erstelle datenbasierte Vorhersagen für Baumaterialien und Bauprojekte." \
    "Erstelle eine Nachfrageprognose für Baustoffe in der DACH-Region" \
    1500

sleep 2

# Task 4: Project Intelligence
execute_task 27 "project_intelligence" "Projekt-Intelligence" \
    "Du bist ein Experte für Bauprojekt-Analysen. Identifiziere und analysiere laufende und geplante Bauprojekte mit strategischem Fokus." \
    "Analysiere laufende und geplante Bauprojekte in Deutschland" \
    2000

sleep 2

# Task 5: Pricing Strategy
execute_task 28 "pricing_strategy" "Pricing-Strategie" \
    "Du bist ein Experte für Preisstrategie in der Bauzuliefererindustrie. Entwickle datenbasierte Pricing-Strategien und Marktpositionierung." \
    "Entwickle eine Pricing-Strategie für Zementprodukte" \
    1200

sleep 2

# Task 6: Competitor Intelligence
execute_task 29 "competitor_intelligence" "Wettbewerbs-Intelligence" \
    "Du bist ein Experte für Wettbewerbsanalyse in der Bauzuliefererindustrie. Analysiere Wettbewerber, Marktanteile und strategische Positionierung." \
    "Analysiere die Hauptwettbewerber von Heidelberg Materials" \
    2500

sleep 2

# Task 7: Strategy Advisor
execute_task 30 "strategy_advisor" "Strategie-Berater" \
    "Du bist ein strategischer Berater für die Bauzuliefererindustrie. Entwickle umfassende Strategieempfehlungen basierend auf Marktanalysen." \
    "Erstelle strategische Empfehlungen für Heidelberg Materials" \
    1000

echo "=== Execution Complete ==="
echo ""

# Check final credit balance
BALANCE=$(docker exec mi42-db mysql -umi42_user -pmi42_password_2025 mi42_db -se \
    "SELECT balance FROM agent_credits WHERE userId = $USER_ID;" 2>/dev/null)

echo "Final credit balance: $BALANCE credits"
