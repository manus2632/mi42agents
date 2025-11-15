import jsPDF from "jspdf";

interface BriefingData {
  title: string;
  agentType: string;
  prompt: string;
  response: string;
  generatedAt: string;
  context?: {
    company?: string;
    domain?: string;
  };
}

export async function exportBriefingToPDF(briefingData: BriefingData) {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper function to add text with line breaks
  const addText = (text: string, fontSize: number, isBold: boolean = false) => {
    pdf.setFontSize(fontSize);
    pdf.setFont("helvetica", isBold ? "bold" : "normal");
    const lines = pdf.splitTextToSize(text, contentWidth);
    
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += fontSize * 0.5;
    });
    yPosition += 5;
  };

  // Header
  pdf.setFillColor(240, 240, 240);
  pdf.rect(0, 0, pageWidth, 40, "F");
  pdf.setFontSize(24);
  pdf.setFont("helvetica", "bold");
  pdf.text("Mi42 Briefing", margin, 25);
  yPosition = 50;

  // Title
  addText(briefingData.title, 18, true);
  yPosition += 5;

  // Metadata
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Agent: ${getAgentName(briefingData.agentType)}`, margin, yPosition);
  yPosition += 6;
  pdf.text(`Erstellt: ${new Date(briefingData.generatedAt).toLocaleString("de-DE")}`, margin, yPosition);
  yPosition += 15;
  pdf.setTextColor(0, 0, 0);

  // Context
  if (briefingData.context) {
    addText("1. Kontext", 14, true);
    if (briefingData.context.company) {
      addText(`Unternehmen: ${briefingData.context.company}`, 11);
    }
    if (briefingData.context.domain) {
      addText(`Domain: ${briefingData.context.domain}`, 11);
    }
    yPosition += 5;
  }

  // Executive Summary
  addText("2. Executive Summary", 14, true);
  const summary = briefingData.response.substring(0, 500) + "...";
  addText(summary, 11);

  // Analysis
  addText("3. Detaillierte Analyse", 14, true);
  addText(briefingData.response, 11);

  // Insights
  addText("4. Zentrale Erkenntnisse", 14, true);
  const insights = extractInsights(briefingData.response);
  addText(insights, 11);

  // Recommendations
  addText("5. Handlungsempfehlungen", 14, true);
  const recommendations = extractRecommendations(briefingData.response);
  addText(recommendations, 11);

  // Methodology
  addText("6. Methodik & Datengrundlage", 14, true);
  addText(`Agent: ${getAgentName(briefingData.agentType)}`, 11);
  addText(`Aufgabe: ${briefingData.prompt}`, 11);
  addText(`Generiert: ${new Date(briefingData.generatedAt).toLocaleString("de-DE")}`, 11);

  // Footer
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(9);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      `Seite ${i} von ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }

  // Save
  pdf.save(`${briefingData.title.replace(/[^a-z0-9]/gi, "_")}.pdf`);
}

function getAgentName(agentType: string): string {
  const names: Record<string, string> = {
    market_analyst: "Markt-Analyst",
    trend_scout: "Trend-Scout",
    survey_assistant: "Umfrage-Assistent",
    strategy_advisor: "Strategie-Berater",
  };
  return names[agentType] || agentType;
}

function extractInsights(response: string): string {
  const lines = response.split("\n");
  const insights = lines
    .filter((line) => line.trim().match(/^[•\-\*\d]/))
    .slice(0, 5);
  return insights.length > 0
    ? insights.join("\n")
    : "Keine spezifischen Insights extrahiert. Siehe vollständige Analyse.";
}

function extractRecommendations(response: string): string {
  const lines = response.split("\n");
  const recommendations = lines.filter((line) =>
    line.toLowerCase().match(/(empfehlung|handlung|massnahme|sollte|muss)/)
  );
  return recommendations.length > 0
    ? recommendations.slice(0, 5).join("\n")
    : "Keine spezifischen Handlungsempfehlungen extrahiert. Siehe vollständige Analyse.";
}
