import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Check } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface ShareBriefingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  briefingId: number;
}

export function ShareBriefingDialog({ open, onOpenChange, briefingId }: ShareBriefingDialogProps) {
  const { t } = useTranslation();
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
  const [permission, setPermission] = useState<"view" | "edit">("view");

  const { data: teams } = trpc.teams.list.useQuery();
  const shareMutation = trpc.briefings.share.useMutation({
    onSuccess: () => {
      toast.success(t("briefing.shareSuccess"));
      onOpenChange(false);
      setSelectedTeams([]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleShare = () => {
    if (selectedTeams.length === 0) {
      toast.error(t("briefing.selectTeamRequired"));
      return;
    }
    selectedTeams.forEach((teamId) => {
      shareMutation.mutate({
        briefingId,
        teamId,
        permission,
      });
    });
  };

  const toggleTeam = (teamId: number) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("briefing.shareBriefing")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Team Selection */}
          <div>
            <Label className="mb-2 block">{t("briefing.selectTeams")}</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2">
              {teams?.map((team) => (
                <div
                  key={team.id}
                  className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                    selectedTeams.includes(team.id)
                      ? "bg-gray-100"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => toggleTeam(team.id)}
                >
                  <span className="text-sm">{team.name}</span>
                  {selectedTeams.includes(team.id) && (
                    <Check className="h-4 w-4 text-gray-900" />
                  )}
                </div>
              ))}
              {teams?.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  {t("briefing.noTeamsAvailable")}
                </p>
              )}
            </div>
          </div>

          {/* Permission Selection */}
          <div>
            <Label htmlFor="permission">{t("briefing.permission")}</Label>
            <Select value={permission} onValueChange={(v: any) => setPermission(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">{t("briefing.permissionView")}</SelectItem>
                <SelectItem value="edit">{t("briefing.permissionEdit")}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              {permission === "view"
                ? t("briefing.permissionViewDescription")
                : t("briefing.permissionEditDescription")}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleShare}
              disabled={shareMutation.isPending || selectedTeams.length === 0}
              className="flex-1"
            >
              {shareMutation.isPending ? t("common.sharing") : t("briefing.share")}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
