import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TrendingUp, Search, FileQuestion, Lightbulb, Loader2, CheckCircle2, LineChart, Building2, DollarSign, Users } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

type AgentType = "market_analyst" | "trend_scout" | "survey_assistant" | "strategy_advisor" | "demand_forecasting" | "project_intelligence" | "pricing_strategy" | "competitor_intelligence";

interface Agent {
  type: AgentType;
  name: string;
  description: string;
  icon: typeof TrendingUp;
  credits: number;
  examples: string[];
}

export default function Agents() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: balance } = trpc.credits.getBalance.useQuery();
  const { user } = useAuth();

  const allAgents: Agent[] = [
    {
      type: "market_analyst",
      name: "Markt-Analyst",
      description: "Analyse von Marktdaten, Trends und Wettbewerbspositionen in der globalen Bauindustrie",
      icon: TrendingUp,
      credits: 200,
      examples: [
        "Analysiere den deutschen Markt für Dämmstoffe",
        "Welche Wachstumschancen gibt es in Südostasien?",
        "Bewerte unsere Wettbewerbsposition im Segment Fassadensysteme",
      ],
    },
    {
      type: "trend_scout",
      name: "Trend-Scout",
      description: "Identifikation von technologischen Trends, Innovationen und disruptiven Entwicklungen",
      icon: Search,
      credits: 500,
      examples: [
        "Welche BIM-Trends beeinflussen unsere Branche?",
        "Analysiere Nachhaltigkeitsinnovationen bei Wettbewerbern",
        "Welche digitalen Technologien verändern die Baulogistik?",
      ],
    },
    {
      type: "survey_assistant",
      name: "Umfrage-Assistent",
      description: "Entwicklung von Umfragekonzepten und Analyse von Befragungsergebnissen",
      icon: FileQuestion,
      credits: 2000,
      examples: [
        "Erstelle einen Fragebogen zur Kundenzufriedenheit",
        "Analysiere unsere letzte Händlerbefragung",
        "Entwickle ein Konzept für eine Marktpotenzialanalyse",
      ],
    },
    {
      type: "strategy_advisor",
      name: "Strategie-Berater",
      description: "Strategische Beratung für Marktpositionierung, Expansion und Wachstum",
      icon: Lightbulb,
      credits: 5000,
      examples: [
        "Entwickle eine Expansionsstrategie für Osteuropa",
        "Welche strategischen Optionen haben wir im Segment XYZ?",
        "Bewerte M&A-Chancen im Bereich nachhaltiger Baustoffe",
      ],
    },
    {
      type: "demand_forecasting",
      name: "Demand Forecasting",
      description: "Nachfrageprognosen für Baumaterialien mit Szenarioanalysen und Risikobewertung",
      icon: LineChart,
      credits: 1500,
      examples: [
        "Prognostiziere die Nachfrage für Dämmstoffe in Q1 2026",
        "Analysiere saisonale Muster für Fassadensysteme",
        "Welche makroökonomischen Faktoren beeinflussen unsere Produktnachfrage?",
      ],
    },
    {
      type: "project_intelligence",
      name: "Project Intelligence",
      description: "Bauprojekt-Tracking und Lead-Generierung mit Wettbewerbsanalyse",
      icon: Building2,
      credits: 2000,
      examples: [
        "Identifiziere relevante Großprojekte in Bayern",
        "Welche Neubauprojekte starten 2026 in London?",
        "Analysiere Sanierungsprojekte im öffentlichen Sektor",
      ],
    },
    {
      type: "pricing_strategy",
      name: "Pricing Strategy",
      description: "Dynamische Preisoptimierung mit Wettbewerbs-Benchmarking und Margen-Analyse",
      icon: DollarSign,
      credits: 1800,
      examples: [
        "Optimiere unsere Preise für Produkt XYZ",
        "Analysiere Wettbewerber-Pricing im Segment Fassaden",
        "Welche Preisstrategie empfiehlst du für den US-Markt?",
      ],
    },
    {
      type: "competitor_intelligence",
      name: "Wettbewerbs-Intelligence",
      description: "Tiefgehende Wettbewerbsanalyse mit Strategie-Tracking und Marktpositionierung",
      icon: Users,
      credits: 2500,
      examples: [
        "Analysiere die Strategie von Wettbewerber XYZ",
        "Welche neuen Produkte haben unsere Wettbewerber gelauncht?",
        "Bewerte die Marktposition der Top 5 Wettbewerber",
      ],
    },
  ];

  // Filter agents based on user role
  const allowedAgentsForExternal: AgentType[] = [
    'market_analyst',
    'trend_scout',
    'demand_forecasting'
  ];

  const agents = user?.role === 'external'
    ? allAgents.filter(agent => allowedAgentsForExternal.includes(agent.type))
    : allAgents;

  const createTaskMutation = trpc.tasks.create.useMutation({
    onSuccess: (data: any) => {
      setSelectedAgent(null);
      setPrompt("");
      toast.success("Aufgabe erstellt", {
        description: `Geschätzte Kosten: ${data.estimatedCredits} Credits`,
      });
    },
    onError: (error: any) => {
      toast.error("Fehler", {
        description: error.message,
      });
    },
  });

  const confirmTaskMutation = trpc.tasks.confirm.useMutation({
    onSuccess: (data: any) => {
      if (data.success && data.briefingId) {
        toast.success("Analyse abgeschlossen");
        setLocation(`/briefings/${data.briefingId}`);
      }
    },
    onError: (error: any) => {
      toast.error("Fehler", {
        description: error.message,
      });
    },
  });

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
    setPrompt("");
  };

  const handleSubmit = async () => {
    if (!selectedAgent || !prompt.trim()) return;

    setIsSubmitting(true);
    try {
      const task = await createTaskMutation.mutateAsync({
        agentType: selectedAgent.type,
        prompt: prompt.trim(),
      });

      // Automatically confirm and execute
      await confirmTaskMutation.mutateAsync({
        taskId: task.taskId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Agenten</h1>
        <p className="text-gray-600">
          Wählen Sie einen spezialisierten Agenten für Ihre Marktanalyse
        </p>
      </div>

      {balance && (
        <Card className="mb-8 border-gray-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verfügbare Credits</p>
                <p className="text-2xl font-bold text-gray-900">{balance.toLocaleString()}</p>
              </div>
              <Button variant="outline" onClick={() => setLocation("/credits")}>
                Credits kaufen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agents.map((agent) => {
          const Icon = agent.icon;
          return (
            <Card
              key={agent.type}
              className="cursor-pointer hover:border-gray-900 transition-colors"
              onClick={() => handleAgentSelect(agent)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Icon className="h-6 w-6 text-gray-900" />
                    </div>
                    <div>
                      <CardTitle>{agent.name}</CardTitle>
                      <CardDescription className="mt-1">{agent.credits} Credits</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{agent.description}</p>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-900">Beispiele:</p>
                  {agent.examples.slice(0, 2).map((example, idx) => (
                    <p key={idx} className="text-xs text-gray-500">
                      • {example}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!selectedAgent} onOpenChange={() => setSelectedAgent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedAgent && (
                <>
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <selectedAgent.icon className="h-6 w-6 text-gray-900" />
                  </div>
                  {selectedAgent.name}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedAgent && (
                <>
                  {selectedAgent.description}
                  <br />
                  <span className="font-medium">Geschätzte Kosten: {selectedAgent.credits} Credits</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-900 mb-2 block">
                Ihre Aufgabe
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Beschreiben Sie Ihre Analyseanfrage..."
                rows={6}
                className="resize-none"
              />
            </div>

            {selectedAgent && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs font-medium text-gray-900 mb-2">Beispiele:</p>
                <div className="space-y-1">
                  {selectedAgent.examples.map((example, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPrompt(example)}
                      className="block text-xs text-gray-600 hover:text-gray-900 text-left w-full"
                    >
                      • {example}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setSelectedAgent(null)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1"
                disabled={!prompt.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analysiere...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Analyse starten
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
