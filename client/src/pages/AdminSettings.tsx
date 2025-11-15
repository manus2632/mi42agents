import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import AgentSettingsTab from "@/components/admin/AgentSettingsTab";
import SystemLogsViewer from "@/components/admin/SystemLogsViewer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Settings,
  Key,
  Database,
  Mail,
  Users,
  BarChart3,
  FileText,
  Shield,
  Bot,
  Server,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function AdminSettings() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("openai");

  // Redirect if not admin
  if (!loading && user?.role !== "admin") {
    window.location.href = "/";
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container max-w-7xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Settings className="w-8 h-8" />
          Admin Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Systemweite Konfiguration und Überwachung für Mi42
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 lg:grid-cols-7 gap-2 h-auto p-2">
          <TabsTrigger value="openai" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            <span className="hidden sm:inline">OpenAI</span>
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">Agenten</span>
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            <span className="hidden sm:inline">Datenbank</span>
          </TabsTrigger>
          <TabsTrigger value="smtp" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">SMTP</span>
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Monitoring</span>
          </TabsTrigger>
          <TabsTrigger value="freemium" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Freemium</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Logs</span>
          </TabsTrigger>
        </TabsList>

        {/* OpenAI Configuration */}
        <TabsContent value="openai">
          <OpenAISettings />
        </TabsContent>

        {/* Agent Configuration */}
        <TabsContent value="agents">
          <AgentSettings />
        </TabsContent>

        {/* Database Management */}
        <TabsContent value="database">
          <DatabaseSettings />
        </TabsContent>

        {/* SMTP Configuration */}
        <TabsContent value="smtp">
          <SMTPSettings />
        </TabsContent>

        {/* System Monitoring */}
        <TabsContent value="monitoring">
          <SystemMonitoring />
        </TabsContent>

        {/* Freemium Settings */}
        <TabsContent value="freemium">
          <FreemiumSettings />
        </TabsContent>

        {/* System Logs */}
        <TabsContent value="logs">
          <SystemLogsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// OpenAI Settings Component
function OpenAISettings() {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);

  const { data: config } = trpc.admin.getOpenAIConfig.useQuery();
  const updateConfig = trpc.admin.updateOpenAIConfig.useMutation();
  const testConnection = trpc.admin.testOpenAIConnection.useMutation();

  const handleSave = async () => {
    try {
      await updateConfig.mutateAsync({ apiKey });
      toast.success("OpenAI API Key gespeichert");
    } catch (error) {
      toast.error("Fehler beim Speichern");
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const result = await testConnection.mutateAsync();
      if (result.success) {
        toast.success(`API-Test erfolgreich! Modell: ${result.model}`);
      } else {
        toast.error(`API-Test fehlgeschlagen: ${result.error}`);
      }
    } catch (error) {
      toast.error("Fehler beim Testen der API");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            OpenAI API Configuration
          </CardTitle>
          <CardDescription>
            Verwalten Sie den OpenAI API Key und testen Sie die Verbindung
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="flex gap-2">
              <Input
                id="apiKey"
                type={showKey ? "text" : "password"}
                value={apiKey || config?.apiKey || ""}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-proj-..."
                className="font-mono"
              />
              <Button
                variant="outline"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? "Verbergen" : "Anzeigen"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Aktueller Key: {config?.apiKey ? `${config.apiKey.substring(0, 20)}...` : "Nicht konfiguriert"}
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={!apiKey || updateConfig.isPending}>
              {updateConfig.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Speichern
            </Button>
            <Button variant="outline" onClick={handleTest} disabled={testing}>
              {testing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              API Testen
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Status</CardTitle>
          <CardDescription>Aktuelle OpenAI API-Informationen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge variant={config?.apiKey ? "default" : "destructive"}>
                {config?.apiKey ? "Konfiguriert" : "Nicht konfiguriert"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Modell</span>
              <span className="text-sm text-muted-foreground">gpt-4o-mini</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Letzte Verwendung</span>
              <span className="text-sm text-muted-foreground">Vor 2 Minuten</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Agent Settings Component
function AgentSettings() {
  // Import the full component
  // AgentSettingsTab imported at top
  return <AgentSettingsTab />;
}

// Database Settings Component
function DatabaseSettings() {
  const { data: dbStatus } = trpc.admin.getDatabaseStatus.useQuery();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Database Status
          </CardTitle>
          <CardDescription>
            Datenbank-Verbindung und Status-Überwachung
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Connection Status</span>
            <Badge variant={dbStatus?.connected ? "default" : "destructive"}>
              {dbStatus?.connected ? (
                <><CheckCircle2 className="w-3 h-3 mr-1" /> Connected</>
              ) : (
                <><XCircle className="w-3 h-3 mr-1" /> Disconnected</>
              )}
            </Badge>
          </div>
          {dbStatus?.connected && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Host</span>
                <span className="text-sm text-muted-foreground font-mono">{dbStatus.host}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database</span>
                <span className="text-sm text-muted-foreground font-mono">{dbStatus.database}</span>
              </div>
            </>
          )}
          {dbStatus?.error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              {dbStatus.error}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database Credentials</CardTitle>
          <CardDescription>
            Zugangsdaten für die Datenbank (nur lesbar)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label>Connection String</Label>
            <Input
              type="password"
              value={process.env.DATABASE_URL || "Not configured"}
              readOnly
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Konfiguriert über Umgebungsvariable DATABASE_URL
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// SMTP Settings Component
function SMTPSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            SMTP Configuration
          </CardTitle>
          <CardDescription>
            E-Mail-Server-Einstellungen für Registrierung und Benachrichtigungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>SMTP Host</Label>
            <Input value="mail.bl2020.com" readOnly className="font-mono" />
          </div>
          <div className="space-y-2">
            <Label>SMTP Port</Label>
            <Input value="465" readOnly className="font-mono" />
          </div>
          <div className="space-y-2">
            <Label>SMTP User</Label>
            <Input value="mi42@bl2020.com" readOnly className="font-mono" />
          </div>
          <div className="space-y-2">
            <Label>SMTP Password</Label>
            <Input type="password" value="Markt26Markt26" readOnly className="font-mono" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="w-4 h-4" />
            <span>Hetzner SMTP Port-Freischaltung ausstehend (1-2 Werktage)</span>
          </div>
          <Button variant="outline" disabled>
            <Mail className="w-4 h-4 mr-2" />
            Test-Email senden
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
          <CardDescription>
            Vorlagen für automatische E-Mails
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Welcome Email</span>
              <Button variant="ghost" size="sm">Bearbeiten</Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Verification Email</span>
              <Button variant="ghost" size="sm">Bearbeiten</Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Password Reset Email</span>
              <Button variant="ghost" size="sm">Bearbeiten</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// System Monitoring Component
function SystemMonitoring() {
  const { data: stats } = trpc.admin.getSystemStats.useQuery();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Users</span>
                <span className="text-2xl font-bold">{stats?.users.total || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active (7 days)</span>
                <span className="text-2xl font-bold text-green-600">{stats?.users.active || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credit Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Credit Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Issued</span>
                <span className="text-2xl font-bold">{stats?.credits.total || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Used</span>
                <span className="text-2xl font-bold text-orange-600">{stats?.credits.used || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Agent Usage
          </CardTitle>
          <CardDescription>
            Anzahl der Ausführungen pro Agent-Typ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats?.agentUsage && stats.agentUsage.length > 0 ? (
              stats.agentUsage.map((usage: any) => (
                <div key={usage.agentType} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{usage.agentType}</span>
                  <Badge variant="outline">{usage.count} Ausführungen</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Keine Daten verfügbar</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// System Logs Component
function SystemLogsTab() {
  // SystemLogsViewer imported at top
  return <SystemLogsViewer />;
}

// Freemium Settings Component
function FreemiumSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Freemium Configuration
          </CardTitle>
          <CardDescription>
            Einstellungen für Freemium-Limits und Credit-Zuteilung
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Max Users per Domain</Label>
            <Input type="number" value="2" readOnly className="max-w-xs" />
            <p className="text-sm text-muted-foreground">
              Maximale Anzahl kostenloser Benutzer pro Unternehmens-Domain
            </p>
          </div>
          <div className="space-y-2">
            <Label>Initial Credits</Label>
            <Input type="number" value="5000" readOnly className="max-w-xs" />
            <p className="text-sm text-muted-foreground">
              Credits, die neue Freemium-Benutzer bei Registrierung erhalten
            </p>
          </div>
          <div className="space-y-2">
            <Label>Reset Period (Monate)</Label>
            <Input type="number" value="12" readOnly className="max-w-xs" />
            <p className="text-sm text-muted-foreground">
              Nach dieser Zeit werden Freemium-Slots für eine Domain zurückgesetzt
            </p>
          </div>
          <div className="space-y-2">
            <Label>Excluded Domains</Label>
            <Textarea
              value="gmail.com\noutlook.com\nyahoo.com\nhotmail.com"
              readOnly
              rows={4}
              className="font-mono text-sm"
            />
            <p className="text-sm text-muted-foreground">
              Freemail-Domains, die vom Freemium-System ausgeschlossen sind
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Freemium Statistics</CardTitle>
          <CardDescription>
            Übersicht über Freemium-Nutzung
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Registrierte Domains</span>
              <Badge variant="outline">-</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Domains mit 2/2 Slots</span>
              <Badge variant="outline">-</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Domains mit 1/2 Slots</span>
              <Badge variant="outline">-</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
