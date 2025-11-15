import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Calendar, TrendingUp, FileText, RefreshCw } from "lucide-react";
import { Streamdown } from "streamdown";
import { useAuth } from "@/_core/hooks/useAuth";

export default function AutomatedBriefings() {
  const { user } = useAuth();
  const [selectedBriefingId, setSelectedBriefingId] = useState<number | null>(null);

  const { data: briefings, isLoading, refetch } = trpc.automatedBriefings.list.useQuery();
  const { data: selectedBriefing, isLoading: isLoadingDetail } = trpc.automatedBriefings.getById.useQuery(
    { id: selectedBriefingId! },
    { enabled: !!selectedBriefingId }
  );

  const triggerDaily = trpc.automatedBriefings.triggerDaily.useMutation({
    onSuccess: () => {
      toast.success("Daily briefing generated successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to generate daily briefing: ${error.message}`);
    },
  });

  const triggerWeekly = trpc.automatedBriefings.triggerWeekly.useMutation({
    onSuccess: () => {
      toast.success("Weekly briefing generated successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to generate weekly briefing: ${error.message}`);
    },
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("de-DE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Automated Market Briefings</h1>
          <p className="text-muted-foreground">
            Daily and weekly market intelligence updates with commodity prices, stock indices, and industry news
          </p>
        </div>
        {user?.role === "admin" && (
          <div className="flex gap-2">
            <Button
              onClick={() => triggerDaily.mutate()}
              disabled={triggerDaily.isPending}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${triggerDaily.isPending ? "animate-spin" : ""}`} />
              Generate Daily
            </Button>
            <Button
              onClick={() => triggerWeekly.mutate()}
              disabled={triggerWeekly.isPending}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${triggerWeekly.isPending ? "animate-spin" : ""}`} />
              Generate Weekly
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Briefings List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Recent Briefings</h2>
          
          {isLoading ? (
            <>
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                </Card>
              ))}
            </>
          ) : briefings && briefings.length > 0 ? (
            briefings.map((briefing) => (
              <Card
                key={briefing.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedBriefingId === briefing.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedBriefingId(briefing.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {briefing.briefingType === "daily" ? (
                          <Calendar className="h-4 w-4 text-blue-500" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-purple-500" />
                        )}
                        <Badge variant={briefing.briefingType === "daily" ? "default" : "secondary"}>
                          {briefing.briefingType === "daily" ? "Daily" : "Weekly"}
                        </Badge>
                      </div>
                      <CardTitle className="text-sm line-clamp-2">{briefing.title}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {formatDate(briefing.generatedAt)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No briefings available yet</p>
                {user?.role === "admin" && (
                  <p className="text-sm mt-2">Use the buttons above to generate briefings manually</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Briefing Detail */}
        <div className="lg:col-span-2">
          {selectedBriefingId ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedBriefing?.briefingType === "daily" ? (
                      <Calendar className="h-6 w-6 text-blue-500" />
                    ) : (
                      <TrendingUp className="h-6 w-6 text-purple-500" />
                    )}
                    <div>
                      <CardTitle>{selectedBriefing?.title || "Loading..."}</CardTitle>
                      {selectedBriefing && (
                        <CardDescription className="mt-1">
                          Generated: {formatDate(selectedBriefing.generatedAt)}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <Badge variant={selectedBriefing?.briefingType === "daily" ? "default" : "secondary"}>
                    {selectedBriefing?.briefingType === "daily" ? "Daily Report" : "Weekly Report"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingDetail ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-32 w-full mt-4" />
                  </div>
                ) : selectedBriefing ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <Streamdown>{selectedBriefing.content}</Streamdown>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Briefing not found</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center text-muted-foreground py-12">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Select a briefing to view details</p>
                <p className="text-sm mt-2">
                  Choose from the list on the left to read the full market intelligence report
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
