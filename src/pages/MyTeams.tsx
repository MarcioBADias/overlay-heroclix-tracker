import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, ArrowLeft, Trash2, Edit2 } from "lucide-react";
import { CreateTeamDialog } from "@/components/teams/CreateTeamDialog";
import { EditTeamDialog } from "@/components/teams/EditTeamDialog";

interface SavedTeam {
  id: string;
  name: string;
  created_at: string;
  unit_count: number;
  total_points: number;
}

const MyTeams = () => {
  const [teams, setTeams] = useState<SavedTeam[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTeam, setEditingTeam] = useState<SavedTeam | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: teamsData, error } = await supabase
      .from("saved_teams")
      .select(`
        *,
        saved_units(points)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching teams:", error);
      return;
    }

    const formattedTeams = teamsData?.map((team: any) => ({
      id: team.id,
      name: team.name,
      created_at: team.created_at,
      unit_count: team.saved_units?.length || 0,
      total_points: team.saved_units?.reduce((sum: number, unit: any) => sum + (unit.points || 0), 0) || 0,
    }));

    setTeams(formattedTeams || []);
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm("Tem certeza que deseja excluir este time?")) return;

    const { error } = await supabase
      .from("saved_teams")
      .delete()
      .eq("id", teamId);

    if (error) {
      toast({
        title: "Erro ao excluir time",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Time excluído",
      description: "O time foi removido com sucesso.",
    });

    fetchTeams();
  };

  return (
    <>
      <Helmet>
        <title>Meus Times - HeroClix Battle</title>
      </Helmet>

      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div>
              <Button
                variant="ghost"
                onClick={() => navigate("/lobby")}
                className="mb-2"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Lobby
              </Button>
              <h1 className="text-5xl md:text-6xl font-black uppercase text-accent text-stroke">
                Meus Times
              </h1>
            </div>
          </header>

          {/* Create Team Button */}
          <div className="mb-8">
            <Button
              onClick={() => setShowCreateDialog(true)}
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-black text-lg h-14"
            >
              <Plus className="mr-2 h-6 w-6" />
              Criar Novo Time
            </Button>
          </div>

          {/* Teams List */}
          <div className="space-y-4">
            {teams.length === 0 ? (
              <div className="bg-card/50 p-8 rounded-xl border-2 border-accent/30 text-center">
                <p className="text-muted-foreground text-lg">
                  Você ainda não tem times salvos. Crie seu primeiro time!
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="bg-card/80 p-6 rounded-xl border-2 border-accent/30 hover:border-accent/60 transition-all"
                  >
                    <h3 className="text-xl font-bold mb-3">{team.name}</h3>
                    <div className="space-y-1 text-muted-foreground mb-4">
                      <p>{team.unit_count} unidades</p>
                      <p className="text-lg font-bold text-foreground">
                        {team.total_points} pontos
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => setEditingTeam(team)}
                      >
                        <Edit2 className="mr-2 h-4 w-4" />
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteTeam(team.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateTeamDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onTeamCreated={fetchTeams}
      />

      {editingTeam && (
        <EditTeamDialog
          open={!!editingTeam}
          team={editingTeam}
          onClose={() => setEditingTeam(null)}
          onTeamUpdated={fetchTeams}
        />
      )}
    </>
  );
};

export default MyTeams;