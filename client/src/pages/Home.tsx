import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { BarChart3, FileText, Sparkles, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useEffect } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  // Fetch real data
  const { data: credits } = trpc.credits.getBalance.useQuery(undefined, { enabled: !!user });
  const { data: briefings } = trpc.briefings.list.useQuery(undefined, { enabled: !!user });
  const { data: tasks } = trpc.tasks.list.useQuery(undefined, { enabled: !!user });

  // Onboarding check
  const { data: onboardingStatus } = trpc.company.checkOnboarding.useQuery(undefined, {
    enabled: !!user,
  });

  const startOnboardingMutation = trpc.company.startOnboarding.useMutation({
    onSuccess: () => {
      setLocation('/briefings');
    },
  });

  // Auto-start onboarding for new users
  useEffect(() => {
    if (user && onboardingStatus && !onboardingStatus.completed && !startOnboardingMutation.isPending) {
      startOnboardingMutation.mutate();
    }
  }, [user, onboardingStatus]);

  const completedTasks = tasks?.filter(t => t.taskStatus === 'completed').length || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">{t("common.loading")}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t("app.title")}</h1>
          <Button asChild>
            <a href={getLoginUrl()}>{t("common.login")}</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("nav.dashboard")}</h1>
        <p className="text-gray-600 mb-8">
          {t("onboarding.welcome")}, {user.name}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t("nav.agents")}
              </CardTitle>
              <Sparkles className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-gray-500 mt-1">Verfügbare Agenten</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t("nav.briefings")}
              </CardTitle>
              <FileText className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{briefings?.briefings?.length || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Erstellt</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t("credits.balance")}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{credits?.toLocaleString() || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Credits</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Analysen</CardTitle>
              <BarChart3 className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTasks}</div>
              <p className="text-xs text-gray-500 mt-1">Durchgeführt</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("nav.agents")}</CardTitle>
              <CardDescription>Starten Sie eine neue Analyse mit einem Agenten</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="default" asChild>
                <Link href="/agents">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Agenten erkunden
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("nav.briefings")}</CardTitle>
              <CardDescription>Sehen Sie Ihre bisherigen Analysen ein</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/briefings">
                  <FileText className="h-4 w-4 mr-2" />
                  Briefings ansehen
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
