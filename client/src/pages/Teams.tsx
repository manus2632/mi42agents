import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Users, Plus, UserPlus, Trash2, Settings } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export default function Teams() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDescription, setNewTeamDescription] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"member" | "admin" | "viewer">("member");

  const { data: teams, refetch: refetchTeams } = trpc.teams.list.useQuery();
  const { data: members, refetch: refetchMembers } = trpc.teams.getMembers.useQuery(
    { teamId: selectedTeamId! },
    { enabled: !!selectedTeamId }
  );

  const createTeamMutation = trpc.teams.create.useMutation({
    onSuccess: () => {
      toast.success(t("teams.created"));
      setCreateDialogOpen(false);
      setNewTeamName("");
      setNewTeamDescription("");
      refetchTeams();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const addMemberMutation = trpc.teams.addMember.useMutation({
    onSuccess: () => {
      toast.success(t("teams.memberAdded"));
      setAddMemberDialogOpen(false);
      setNewMemberEmail("");
      refetchMembers();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const removeMemberMutation = trpc.teams.removeMember.useMutation({
    onSuccess: () => {
      toast.success(t("teams.memberRemoved"));
      refetchMembers();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCreateTeam = () => {
    if (!newTeamName.trim()) {
      toast.error(t("teams.nameRequired"));
      return;
    }
    createTeamMutation.mutate({
      name: newTeamName,
      description: newTeamDescription,
    });
  };

  const handleAddMember = () => {
    if (!selectedTeamId || !newMemberEmail.trim()) {
      toast.error(t("teams.emailRequired"));
      return;
    }
    // In real app, lookup userId by email
    // For now, use placeholder
    addMemberMutation.mutate({
      teamId: selectedTeamId,
      userId: 999, // TODO: Lookup by email
      role: newMemberRole,
    });
  };

  const handleRemoveMember = (teamId: number, userId: number) => {
    if (confirm(t("teams.confirmRemove"))) {
      removeMemberMutation.mutate({ teamId, userId });
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">{t("common.loginRequired")}</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("teams.title")}</h1>
          <p className="text-muted-foreground mt-2">{t("teams.subtitle")}</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("teams.createTeam")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("teams.createTeam")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="teamName">{t("teams.teamName")}</Label>
                <Input
                  id="teamName"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder={t("teams.teamNamePlaceholder")}
                />
              </div>
              <div>
                <Label htmlFor="teamDescription">{t("teams.description")}</Label>
                <Textarea
                  id="teamDescription"
                  value={newTeamDescription}
                  onChange={(e) => setNewTeamDescription(e.target.value)}
                  placeholder={t("teams.descriptionPlaceholder")}
                  rows={3}
                />
              </div>
              <Button onClick={handleCreateTeam} disabled={createTeamMutation.isPending} className="w-full">
                {createTeamMutation.isPending ? t("common.creating") : t("teams.create")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {teams?.map((team) => (
          <Card key={team.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{team.name}</h3>
                  <p className="text-sm text-muted-foreground">{team.description}</p>
                </div>
              </div>
              <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                {team.role}
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedTeamId(team.id);
                  setAddMemberDialogOpen(true);
                }}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {t("teams.addMember")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTeamId(team.id)}
              >
                <Settings className="h-4 w-4 mr-2" />
                {t("teams.manage")}
              </Button>
            </div>

            {selectedTeamId === team.id && members && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2">{t("teams.members")}</h4>
                <div className="space-y-2">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium text-sm">{member.userName || member.userEmail}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                      {team.role === "owner" && member.userId !== user.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(team.id, member.userId)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {teams?.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">{t("teams.noTeams")}</h3>
          <p className="text-muted-foreground mb-4">{t("teams.noTeamsDescription")}</p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("teams.createFirstTeam")}
          </Button>
        </div>
      )}

      <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("teams.addMember")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="memberEmail">{t("teams.memberEmail")}</Label>
              <Input
                id="memberEmail"
                type="email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder={t("teams.memberEmailPlaceholder")}
              />
            </div>
            <div>
              <Label htmlFor="memberRole">{t("teams.role")}</Label>
              <Select value={newMemberRole} onValueChange={(v: any) => setNewMemberRole(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">{t("teams.roleViewer")}</SelectItem>
                  <SelectItem value="member">{t("teams.roleMember")}</SelectItem>
                  <SelectItem value="admin">{t("teams.roleAdmin")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddMember} disabled={addMemberMutation.isPending} className="w-full">
              {addMemberMutation.isPending ? t("common.adding") : t("teams.add")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
