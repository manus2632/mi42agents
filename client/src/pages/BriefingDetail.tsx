import { useAuth } from "@/_core/hooks/useAuth";
import AgentLayout from "@/components/AgentLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Download, Edit3, Save, Share2 } from "lucide-react";
import { exportBriefingToPDF } from "@/lib/pdfExport";
import { ShareBriefingDialog } from "@/components/ShareBriefingDialog";
import { BriefingCharts } from "@/components/BriefingCharts";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "wouter";

interface BriefingChapter {
  id: string;
  title: string;
  content: string;
  type: "text" | "insights" | "recommendations";
}

export default function BriefingDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { user } = useAuth();
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const { data: briefing, isLoading } = trpc.briefings.getById.useQuery(
    { id: parseInt(id!) },
    { enabled: !!id }
  );

  if (isLoading) {
    return (
      <AgentLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">{t("common.loading")}</div>
        </div>
      </AgentLayout>
    );
  }

  if (!briefing) {
    return (
      <AgentLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">{t("briefings.notFound")}</div>
        </div>
      </AgentLayout>
    );
  }

  const briefingData = typeof briefing.briefingData === 'string' 
    ? JSON.parse(briefing.briefingData) 
    : briefing.briefingData;
  
  // Transform response into 6-chapter structure
  const chapters: BriefingChapter[] = [
    {
      id: "context",
      title: t("briefing.chapters.context"),
      content: briefingData.context 
        ? `${t("briefing.company")}: ${briefingData.context.company}\n${t("briefing.domain")}: ${briefingData.context.domain}`
        : t("briefing.noContext"),
      type: "text",
    },
    {
      id: "executive_summary",
      title: t("briefing.chapters.executiveSummary"),
      content: briefingData.response.substring(0, 500) + "...",
      type: "text",
    },
    {
      id: "analysis",
      title: t("briefing.chapters.analysis"),
      content: briefingData.response,
      type: "text",
    },
    {
      id: "insights",
      title: t("briefing.chapters.insights"),
      content: extractInsights(briefingData.response),
      type: "insights",
    },
    {
      id: "recommendations",
      title: t("briefing.chapters.recommendations"),
      content: extractRecommendations(briefingData.response),
      type: "recommendations",
    },
    {
      id: "methodology",
      title: t("briefing.chapters.methodology"),
      content: `${t("briefing.agent")}: ${briefingData.agentType}\n${t("briefing.prompt")}: ${briefingData.prompt}\n${t("briefing.generated")}: ${new Date(briefingData.generatedAt).toLocaleString()}`,
      type: "text",
    },
  ];

  const handleSaveNote = (chapterId: string) => {
    // TODO: Implement note saving
    setActiveNote(null);
  };

  const handleExportPDF = () => {
    exportBriefingToPDF(briefingData);
  };

  return (
    <AgentLayout>
      <div className="max-w-5xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {briefingData.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{t(`agents.${briefingData.agentType}`)}</span>
                <span>•</span>
                <span>{new Date(briefing.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <Button onClick={() => setShareDialogOpen(true)} variant="outline" className="gap-2">
              <Share2 className="h-4 w-4" />
              {t("briefing.share")}
            </Button>
            <Button onClick={handleExportPDF} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              {t("briefing.exportPDF")}
            </Button>
          </div>
        </div>

        {/* Chapters */}
        <div className="space-y-6">
          {chapters.map((chapter, index) => (
            <Card key={chapter.id} className="border-gray-200">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {index + 1}. {chapter.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {chapter.content}
                  </div>
                </div>

                {/* Editable Notes Section */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  {activeNote === chapter.id ? (
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700">
                        {t("briefing.yourNotes")}
                      </label>
                      <Textarea
                        value={editingNotes[chapter.id] || ""}
                        onChange={(e) =>
                          setEditingNotes({
                            ...editingNotes,
                            [chapter.id]: e.target.value,
                          })
                        }
                        placeholder={t("briefing.notesPlaceholder")}
                        className="min-h-[100px]"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveNote(chapter.id)}
                          className="gap-2"
                        >
                          <Save className="h-4 w-4" />
                          {t("common.save")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveNote(null)}
                        >
                          {t("common.cancel")}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveNote(chapter.id)}
                      className="gap-2 text-gray-600"
                    >
                      <Edit3 className="h-4 w-4" />
                      {t("briefing.addNotes")}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sharing Dialog */}
        <ShareBriefingDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          briefingId={parseInt(id!)}
        />

        {/* Visualisierungen */}
        <div className="mt-8">
          <BriefingCharts data={{
            marketGrowth: [
              { year: '2023', value: 3.2 },
              { year: '2024', value: 4.1 },
              { year: '2025', value: 5.3 },
              { year: '2026', value: 6.8 },
            ],
            competitorComparison: [
              { name: 'Unternehmen A', marketShare: 25 },
              { name: 'Unternehmen B', marketShare: 20 },
              { name: 'Unternehmen C', marketShare: 15 },
              { name: 'Ihr Unternehmen', marketShare: 12 },
              { name: 'Sonstige', marketShare: 28 },
            ],
            trendAnalysis: [
              { month: 'Jan', trend: 100 },
              { month: 'Feb', trend: 105 },
              { month: 'Mär', trend: 110 },
              { month: 'Apr', trend: 108 },
              { month: 'Mai', trend: 115 },
              { month: 'Jun', trend: 120 },
            ],
          }} />
        </div>
      </div>
    </AgentLayout>
  );
}

// Helper functions to extract insights and recommendations
function extractInsights(response: string): string {
  // Simple extraction - look for bullet points or numbered lists
  const lines = response.split("\n");
  const insights = lines
    .filter((line) => line.trim().match(/^[•\-\*\d]/))
    .slice(0, 5);
  return insights.length > 0
    ? insights.join("\n")
    : "Keine spezifischen Insights extrahiert. Siehe vollständige Analyse.";
}

function extractRecommendations(response: string): string {
  // Look for sections with "empfehlung", "handlung", "massnahme"
  const lines = response.split("\n");
  const recommendations = lines.filter((line) =>
    line.toLowerCase().match(/(empfehlung|handlung|massnahme|sollte|muss)/)
  );
  return recommendations.length > 0
    ? recommendations.slice(0, 5).join("\n")
    : "Keine spezifischen Handlungsempfehlungen extrahiert. Siehe vollständige Analyse.";
}
