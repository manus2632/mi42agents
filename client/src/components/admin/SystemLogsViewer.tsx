import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { FileText, Loader2, RefreshCw, Download, AlertCircle, Info, AlertTriangle, Bug } from "lucide-react";
import { format } from "date-fns";

export default function SystemLogsViewer() {
  const [logLevel, setLogLevel] = useState<string | undefined>(undefined);
  const [logType, setLogType] = useState<string | undefined>(undefined);
  const [limit, setLimit] = useState(100);

  const { data: logs, isLoading, refetch } = trpc.admin.getSystemLogs.useQuery({
    limit,
    logLevel: logLevel as any,
    logType: logType as any,
  });

  const getLogLevelIcon = (level: string) => {
    switch (level) {
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "info":
        return <Info className="w-4 h-4 text-blue-500" />;
      case "debug":
        return <Bug className="w-4 h-4 text-gray-500" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getLogLevelBadge = (level: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
      error: "destructive",
      warning: "secondary",
      info: "default",
      debug: "outline",
    };
    return <Badge variant={variants[level] || "outline"}>{level.toUpperCase()}</Badge>;
  };

  const getLogTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      api_call: "bg-blue-100 text-blue-800",
      llm_usage: "bg-purple-100 text-purple-800",
      error: "bg-red-100 text-red-800",
      auth: "bg-green-100 text-green-800",
      system: "bg-gray-100 text-gray-800",
    };
    return (
      <Badge variant="outline" className={colors[type] || ""}>
        {type.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const exportLogs = () => {
    if (!logs) return;
    
    const csv = [
      ["Timestamp", "Level", "Type", "Message", "User ID", "Task ID"].join(","),
      ...logs.map((log) =>
        [
          format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss"),
          log.logLevel,
          log.logType,
          `"${log.message.replace(/"/g, '""')}"`,
          log.userId || "",
          log.taskId || "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `system-logs-${format(new Date(), "yyyy-MM-dd-HHmmss")}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            System Logs Viewer
          </CardTitle>
          <CardDescription>
            Echtzeit-Überwachung von Fehlern, API-Calls und LLM-Usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Log Level</Label>
              <Select value={logLevel} onValueChange={(v) => setLogLevel(v === "all" ? undefined : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Alle Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Levels</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Log Type</Label>
              <Select value={logType} onValueChange={(v) => setLogType(v === "all" ? undefined : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Alle Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Types</SelectItem>
                  <SelectItem value="api_call">API Call</SelectItem>
                  <SelectItem value="llm_usage">LLM Usage</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="auth">Auth</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Limit</Label>
              <Input
                type="number"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value) || 100)}
                min={10}
                max={1000}
                step={10}
              />
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => refetch()} className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="outline" onClick={exportLogs} disabled={!logs || logs.length === 0}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Logs Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : logs && logs.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-[600px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="text-left p-3 font-medium">Timestamp</th>
                      <th className="text-left p-3 font-medium">Level</th>
                      <th className="text-left p-3 font-medium">Type</th>
                      <th className="text-left p-3 font-medium">Message</th>
                      <th className="text-left p-3 font-medium">User</th>
                      <th className="text-left p-3 font-medium">Task</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-t hover:bg-muted/50">
                        <td className="p-3 whitespace-nowrap text-xs text-muted-foreground">
                          {format(new Date(log.createdAt), "dd.MM.yyyy HH:mm:ss")}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {getLogLevelIcon(log.logLevel)}
                            {getLogLevelBadge(log.logLevel)}
                          </div>
                        </td>
                        <td className="p-3">{getLogTypeBadge(log.logType)}</td>
                        <td className="p-3">
                          <div className="max-w-md">
                            <p className="truncate">{log.message}</p>
                            {log.details && (
                              <details className="mt-1 text-xs text-muted-foreground">
                                <summary className="cursor-pointer hover:text-foreground">
                                  Details anzeigen
                                </summary>
                                <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                                  {JSON.stringify(JSON.parse(log.details), null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          {log.userId ? (
                            <Badge variant="outline">#{log.userId}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {log.taskId ? (
                            <Badge variant="outline">#{log.taskId}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Keine Logs gefunden</p>
              <p className="text-sm mt-2">Passen Sie die Filter an oder warten Sie auf neue Events</p>
            </div>
          )}

          {/* Summary */}
          {logs && logs.length > 0 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{logs.length} Logs angezeigt</span>
              <span>Letzte Aktualisierung: {format(new Date(), "HH:mm:ss")}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Log Statistics</CardTitle>
          <CardDescription>Übersicht der letzten {limit} Logs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {["error", "warning", "info", "debug"].map((level) => {
              const count = logs?.filter((l) => l.logLevel === level).length || 0;
              return (
                <div key={level} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    {getLogLevelIcon(level)}
                  </div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm text-muted-foreground capitalize">{level}</p>
                </div>
              );
            })}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <FileText className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold">{logs?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
