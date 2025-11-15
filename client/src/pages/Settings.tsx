import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Save } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

const AVAILABLE_MODELS = [
  { id: "gpt-oss:120b", name: "GPT-OSS 120B (Open WebUI)", provider: "custom" },
  { id: "gemini-2.0-flash-exp", name: "Gemini 2.0 Flash", provider: "manus" },
  { id: "gpt-4o", name: "GPT-4o", provider: "manus" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "manus" },
  { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", provider: "manus" },
];

const AGENT_TYPES = [
  { id: "market_analyst", name: "Markt-Analyst", defaultModel: "gpt-oss:120b" },
  { id: "trend_scout", name: "Trend-Scout", defaultModel: "gpt-4o-mini" },
  { id: "survey_assistant", name: "Umfrage-Assistent", defaultModel: "claude-3-5-sonnet-20241022" },
  { id: "strategy_advisor", name: "Strategie-Berater", defaultModel: "gpt-4o" },
];

export default function Settings() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [modelConfig, setModelConfig] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const { data: configs, isLoading } = trpc.settings.getModelConfigs.useQuery();

  // Load configs into state
  if (configs && Object.keys(modelConfig).length === 0) {
    const configMap: Record<string, string> = {};
    configs.forEach((config) => {
      configMap[config.agentType] = config.modelName;
    });
    setModelConfig(configMap);
  }

  const saveConfigMutation = trpc.settings.saveModelConfig.useMutation({
    onSuccess: () => {
      toast.success("Einstellungen gespeichert");
      setHasChanges(false);
    },
    onError: () => {
      toast.error("Fehler beim Speichern");
    },
  });

  const handleModelChange = (agentType: string, modelId: string) => {
    setModelConfig((prev) => ({ ...prev, [agentType]: modelId }));
    setHasChanges(true);
  };

  const handleSave = () => {
    Object.entries(modelConfig).forEach(([agentType, modelId]) => {
      saveConfigMutation.mutate({ agentType, modelId });
    });
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // External users cannot configure models
  if (user?.role === 'external') {
    return (
      <div className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("nav.settings")}</h1>
          <p className="text-gray-600">Einstellungen</p>
        </div>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600">Model configuration is not available for external users.</p>
            <p className="text-sm text-gray-500 mt-2">Please contact your administrator for more information.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("nav.settings")}</h1>
        <p className="text-gray-600">Konfigurieren Sie die LLM-Modelle für jeden Agenten</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Modell-Konfiguration</CardTitle>
          <CardDescription>Wählen Sie für jeden Agenten das passende LLM-Modell</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {AGENT_TYPES.map((agent) => (
            <div key={agent.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{agent.name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Aktuelles Modell: {
                    AVAILABLE_MODELS.find((m) => m.id === (modelConfig[agent.id] || agent.defaultModel))?.name
                  }
                </p>
              </div>
              <Select
                value={modelConfig[agent.id] || agent.defaultModel}
                onValueChange={(value) => handleModelChange(agent.id, value)}
              >
                <SelectTrigger className="w-[280px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex flex-col">
                        <span>{model.name}</span>
                        <span className="text-xs text-gray-500">
                          {model.provider === "custom" ? "Open WebUI" : "Manus Forge"}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          {hasChanges && (
            <div className="pt-4 flex justify-end">
              <Button onClick={handleSave} disabled={saveConfigMutation.isPending} className="gap-2">
                <Save className="h-4 w-4" />
                {t("common.save")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Über die Modelle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-gray-600">
          <div>
            <strong className="text-gray-900">Manus Forge API:</strong>
            <p className="mt-1">Zugriff auf GPT-4o, Claude, Gemini ohne eigene API-Keys. Kosten werden transparent abgerechnet.</p>
          </div>
          <div>
            <strong className="text-gray-900">Open WebUI (Custom):</strong>
            <p className="mt-1">Ihr eigenes LLM (GPT-OSS 120B) für maximale Kontrolle und Datenschutz.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
