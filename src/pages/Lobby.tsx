import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Users, Lock, Unlock, LogOut, Swords, Trash2 } from "lucide-react";
import { CreateMatchDialog } from "@/components/lobby/CreateMatchDialog";
import { JoinMatchDialog } from "@/components/lobby/JoinMatchDialog";

interface Match {
  id: string;
  name: string;
  is_public: boolean;
  status: string;
  host_id: string;
  created_at: string;
  player_count: number;
}

const Lobby = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    fetchMatches();

    const channel = supabase
      .channel("lobby")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
        },
        () => fetchMatches()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMatches = async () => {
    const { data, error } = await supabase
      .from("matches")
      .select(`
        *,
        match_players(count)
      `)
      .eq("status", "waiting")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching matches:", error);
      return;
    }

    const formattedMatches = data?.map((match: any) => ({
      ...match,
      player_count: match.match_players?.[0]?.count || 0,
    }));

    setMatches(formattedMatches || []);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleDeleteMatch = async (matchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm("Tem certeza que deseja excluir esta partida?")) return;

    const { error } = await supabase
      .from("matches")
      .delete()
      .eq("id", matchId);

    if (error) {
      toast({
        title: "Erro ao excluir partida",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Partida excluída",
      description: "A partida foi removida com sucesso.",
    });
  };

  return (
    <>
      <Helmet>
        <title>Lobby - HeroClix Battle</title>
      </Helmet>

      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <h1 className="text-5xl md:text-6xl font-black uppercase text-accent text-stroke">
              Lobby
            </h1>
            <div className="flex gap-3">
              <Button
                onClick={() => navigate("/my-teams")}
                variant="outline"
                className="border-2 border-accent/50 font-bold"
              >
                <Swords className="mr-2 h-5 w-5" />
                Meus Times
              </Button>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="border-2 border-destructive/50 font-bold"
              >
                <LogOut className="mr-2 h-5 w-5" />
                Sair
              </Button>
            </div>
          </header>

          {/* Create Match Button */}
          <div className="mb-8">
            <Button
              onClick={() => setShowCreateDialog(true)}
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-black text-lg h-14 w-full md:w-auto"
            >
              <Plus className="mr-2 h-6 w-6" />
              Criar Partida
            </Button>
          </div>

          {/* Matches List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Partidas Disponíveis</h2>
            {matches.length === 0 ? (
              <div className="bg-card/50 p-8 rounded-xl border-2 border-accent/30 text-center">
                <p className="text-muted-foreground text-lg">
                  Nenhuma partida disponível. Crie uma nova partida!
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matches.map((match) => (
                  <div
                    key={match.id}
                    className="bg-card/80 p-6 rounded-xl border-2 border-accent/30 hover:border-accent/60 transition-all cursor-pointer"
                    onClick={() => setSelectedMatch(match)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold">{match.name}</h3>
                      {match.is_public ? (
                        <Unlock className="h-5 w-5 text-green-500" />
                      ) : (
                        <Lock className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{match.player_count}/2 jogadores</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMatch(match);
                        }}
                      >
                        Entrar
                      </Button>
                      {user && match.host_id === user.id && (
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={(e) => handleDeleteMatch(match.id, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateMatchDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onMatchCreated={(matchId) => {
          setShowCreateDialog(false);
          navigate(`/match/${matchId}`);
        }}
      />

      <JoinMatchDialog
        open={!!selectedMatch}
        match={selectedMatch}
        onClose={() => setSelectedMatch(null)}
        onJoined={(matchId) => {
          setSelectedMatch(null);
          navigate(`/match/${matchId}`);
        }}
      />
    </>
  );
};

export default Lobby;