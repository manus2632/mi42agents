import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, User, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function Briefings() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  
  const { data, isLoading } = trpc.briefings.list.useQuery();

  const agentNames: Record<string, string> = {
    market_analyst: "Markt-Analyst",
    trend_scout: "Trend-Scout",
    demand_forecasting: "Nachfrage-Prognose",
    survey_assistant: "Umfrage-Assistent",
    project_intelligence: "Projekt-Intelligence",
    pricing_strategy: "Pricing-Strategie",
    competitor_intelligence: "Wettbewerbs-Intelligence",
    strategy_advisor: "Strategie-Berater",
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const briefings = data?.briefings || [];
  const activeTasks = data?.activeTasks || [];
  const hasContent = briefings.length > 0 || activeTasks.length > 0;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Briefings</h1>
        <p className="text-gray-600">
          Ihre Marktanalysen und laufenden Recherchen
        </p>
      </div>

      {!hasContent ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Briefings vorhanden</h3>
              <p className="text-gray-600 mb-6">
                Starten Sie eine Analyse mit einem Agenten, um Ihr erstes Briefing zu erstellen.
              </p>
              <Button onClick={() => setLocation("/agents")}>
                Zu den Agenten
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Active Tasks Section */}
          {activeTasks.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Laufende Analysen ({activeTasks.length})
              </h2>
              <div className="space-y-4">
                {activeTasks.map((task) => (
                  <Card key={task.id} className="border-blue-200 bg-blue-50/50">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-lg">{task.taskPrompt || "Analyse läuft..."}</CardTitle>
                            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              {task.taskStatus === 'pending' ? 'Wartet' : 'In Bearbeitung'}
                            </Badge>
                          </div>
                          <CardDescription className="flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {agentNames[task.agentType] || task.agentType}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(task.createdAt).toLocaleDateString("de-DE")} {new Date(task.createdAt).toLocaleTimeString("de-DE", { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-gray-500">
                              {task.creditsEstimated} Credits
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div className="bg-blue-500 h-full animate-pulse" style={{ width: '60%' }}></div>
                        </div>
                        <span className="text-xs">Analyse läuft...</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Completed Briefings Section */}
          {briefings.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Abgeschlossene Briefings ({briefings.length})
              </h2>
              <div className="space-y-4">
                {briefings.map((briefing) => {
                  const data = briefing.briefingData ? JSON.parse(briefing.briefingData) : {};

                  return (
                    <Card
                      key={briefing.id}
                      className="cursor-pointer hover:border-gray-900 transition-colors"
                      onClick={() => setLocation(`/briefings/${briefing.id}`)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle>{briefing.briefingTitle}</CardTitle>
                              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Abgeschlossen
                              </Badge>
                            </div>
                            <CardDescription className="flex items-center gap-4 text-xs">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {agentNames[data.agentType] || "Agent"}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(briefing.createdAt).toLocaleDateString("de-DE")}
                              </span>
                            </CardDescription>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Implement PDF download
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      {data.response && (
                        <CardContent>
                          <p className="text-sm text-gray-600 line-clamp-3">
                            {data.response.substring(0, 200)}...
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
