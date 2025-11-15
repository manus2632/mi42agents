import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Bot, Loader2, Save, RotateCcw } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const AGENT_NAMES: Record<string, string> = {
  market_analyst: "Markt-Analyst",
  trend_scout: "Trend-Scout",
  survey_assistant: "Umfrage-Assistent",
  strategy_advisor: "Strategie-Berater",
  demand_forecasting: "Nachfrage-Prognose",
  project_intelligence: "Projekt-Intelligence",
  pricing_strategy: "Pricing-Strategie",
  competitor_intelligence: "Wettbewerbs-Intelligence",
};

const AGENT_DESCRIPTIONS: Record<string, string> = {
  market_analyst: "Analysiert Märkte, Trends und Wettbewerbssituationen",
  trend_scout: "Identifiziert aufkommende Trends und technologische Entwicklungen",
  survey_assistant: "Erstellt strukturierte Umfragen und analysiert Marktforschungsdaten",
  strategy_advisor: "Entwickelt umfassende Strategieempfehlungen",
  demand_forecasting: "Erstellt datenbasierte Nachfrageprognosen",
  project_intelligence: "Analysiert laufende und geplante Bauprojekte",
  pricing_strategy: "Entwickelt datenbasierte Pricing-Strategien",
  competitor_intelligence: "Analysiert Wettbewerber und Marktanteile",
};

export default function AgentSettingsTab() {
  const { data: agents, isLoading, refetch } = trpc.admin.getAllAgentConfigs.useQuery();
  const updateAgent = trpc.admin.updateAgentConfig.useMutation();

  const [editingAgent, setEditingAgent] = useState<string | null>(null);
  const [editedPrompt, setEditedPrompt] = useState("");
  const [editedCredits, setEditedCredits] = useState(0);

  const handleEdit = (agentType: string, currentPrompt: string, currentCredits: number) => {
    setEditingAgent(agentType);
    setEditedPrompt(currentPrompt);
    setEditedCredits(currentCredits);
  };

  const handleSave = async (agentType: string) => {
    try {
      await updateAgent.mutateAsync({
        agentType: agentType as any,
        systemPrompt: editedPrompt,
        estimatedCredits: editedCredits,
      });
      toast.success(`${AGENT_NAMES[agentType]} erfolgreich aktualisiert`);
      setEditingAgent(null);
      refetch();
    } catch (error) {
      toast.error("Fehler beim Speichern");
    }
  };

  const handleToggleActive = async (agentType: string, currentStatus: number | boolean) => {
    try {
      // Convert to boolean if number (MySQL tinyint)
      const isActive = typeof currentStatus === 'number' ? currentStatus === 1 : currentStatus;
      await updateAgent.mutateAsync({
        agentType: agentType as any,
        isActive: !isActive,
      });
      toast.success(`${AGENT_NAMES[agentType]} ${!isActive ? "aktiviert" : "deaktiviert"}`);
      refetch();
    } catch (error) {
      toast.error("Fehler beim Aktualisieren");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Agent Configuration
          </CardTitle>
          <CardDescription>
            System Prompts, Credit-Kosten und Status für alle 8 Agenten bearbeiten
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {agents?.map((agent) => (
              <AccordionItem key={agent.agentType} value={agent.agentType}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <Bot className="w-5 h-5 text-muted-foreground" />
                      <div className="text-left">
                        <div className="font-medium">{AGENT_NAMES[agent.agentType]}</div>
                        <div className="text-sm text-muted-foreground">
                          {AGENT_DESCRIPTIONS[agent.agentType]}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={agent.isActive ? "default" : "secondary"}>
                        {agent.isActive ? "Aktiv" : "Inaktiv"}
                      </Badge>
                      <Badge variant="outline">{agent.estimatedCredits} Credits</Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-4">
                    {/* System Prompt Editor */}
                    <div className="space-y-2">
                      <Label htmlFor={`prompt-${agent.agentType}`}>System Prompt</Label>
                      <Textarea
                        id={`prompt-${agent.agentType}`}
                        value={
                          editingAgent === agent.agentType
                            ? editedPrompt
                            : agent.systemPrompt
                        }
                        onChange={(e) => {
                          if (editingAgent === agent.agentType) {
                            setEditedPrompt(e.target.value);
                          } else {
                            handleEdit(agent.agentType, e.target.value, agent.estimatedCredits);
                          }
                        }}
                        rows={6}
                        className="font-mono text-sm"
                        placeholder="System Prompt für diesen Agenten..."
                      />
                    </div>

                    {/* Credits Editor */}
                    <div className="space-y-2">
                      <Label htmlFor={`credits-${agent.agentType}`}>Credit-Kosten</Label>
                      <Input
                        id={`credits-${agent.agentType}`}
                        type="number"
                        value={
                          editingAgent === agent.agentType
                            ? editedCredits
                            : agent.estimatedCredits
                        }
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          if (editingAgent === agent.agentType) {
                            setEditedCredits(value);
                          } else {
                            handleEdit(agent.agentType, agent.systemPrompt, value);
                          }
                        }}
                        min={0}
                        step={50}
                        className="max-w-xs"
                      />
                      <p className="text-sm text-muted-foreground">
                        Geschätzte Credits für eine Analyse mit diesem Agenten
                      </p>
                    </div>

                    {/* Active Status Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Agent Status</Label>
                        <p className="text-sm text-muted-foreground">
                          Deaktivierte Agenten sind für Benutzer nicht verfügbar
                        </p>
                      </div>
                      <Switch
                        checked={typeof agent.isActive === 'number' ? agent.isActive === 1 : agent.isActive}
                        onCheckedChange={() => handleToggleActive(agent.agentType, agent.isActive)}
                      />
                    </div>

                    {/* Action Buttons */}
                    {editingAgent === agent.agentType && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => handleSave(agent.agentType)}
                          disabled={updateAgent.isPending}
                        >
                          {updateAgent.isPending && (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          )}
                          <Save className="w-4 h-4 mr-2" />
                          Speichern
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setEditingAgent(null)}
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Abbrechen
                        </Button>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Übersicht</CardTitle>
          <CardDescription>Zusammenfassung aller Agenten-Konfigurationen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Gesamt</p>
              <p className="text-2xl font-bold">{agents?.length || 0}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Aktiv</p>
              <p className="text-2xl font-bold text-green-600">
                {agents?.filter((a) => a.isActive).length || 0}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Inaktiv</p>
              <p className="text-2xl font-bold text-gray-400">
                {agents?.filter((a) => !a.isActive).length || 0}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Ø Credits</p>
              <p className="text-2xl font-bold">
                {agents && agents.length > 0
                  ? Math.round(
                      agents.reduce((sum, a) => sum + a.estimatedCredits, 0) / agents.length
                    )
                  : 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
