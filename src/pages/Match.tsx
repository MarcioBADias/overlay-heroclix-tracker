import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet";
import { MatchTimer } from "@/components/match/MatchTimer";
import { MatchTeamPanel } from "@/components/match/MatchTeamPanel";
import { EndGameModal } from "@/components/EndGameModal";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MatchData {
  id: string;
  name: string;
  status: string;
  host_id: string;
  timer_state: string;
  timer_remaining: number;
  timer_last_update: string | null;
}

interface PlayerData {
  id: string;
  player_name: string;
  player_slot: number;
  victory_points: number;
  total_points: number;
  user_id: string;
}

const Match = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [match, setMatch] = useState<MatchData | null>(null);
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<"player" | "spectator" | null>(null);
  const [showEndGameModal, setShowEndGameModal] = useState(false);

  useEffect(() => {
    const initMatch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setCurrentUser(user);

      // Load match data
      const { data: matchData } = await supabase
        .from("matches")
        .select("*")
        .eq("id", matchId)
        .single();

      if (!matchData) {
        toast({
          title: "Partida não encontrada",
          variant: "destructive",
        });
        navigate("/lobby");
        return;
      }

      setMatch(matchData);

      // Load players
      const { data: playersData } = await supabase
        .from("match_players")
        .select("*")
        .eq("match_id", matchId)
        .order("player_slot");

      setPlayers(playersData || []);

      // Determine user role
      const isPlayer = playersData?.some(p => p.user_id === user.id);
      if (isPlayer) {
        setUserRole("player");
      } else {
        setUserRole("spectator");
        // Add as spectator if not already
        const { data: spectatorData } = await supabase
          .from("match_spectators")
          .select("*")
          .eq("match_id", matchId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (!spectatorData) {
          await supabase.from("match_spectators").insert({
            match_id: matchId!,
            user_id: user.id,
          });
        }
      }
    };

    initMatch();

    // Subscribe to match changes
    const matchChannel = supabase
      .channel(`match:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
          filter: `id=eq.${matchId}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setMatch(payload.new as MatchData);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_players",
          filter: `match_id=eq.${matchId}`,
        },
        async () => {
          const { data } = await supabase
            .from("match_players")
            .select("*")
            .eq("match_id", matchId)
            .order("player_slot");
          setPlayers(data || []);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(matchChannel);
    };
  }, [matchId, navigate, toast]);

  const handleLeaveMatch = async () => {
    if (!currentUser) return;

    if (userRole === "player") {
      await supabase
        .from("match_players")
        .delete()
        .eq("match_id", matchId)
        .eq("user_id", currentUser.id);
    } else {
      await supabase
        .from("match_spectators")
        .delete()
        .eq("match_id", matchId)
        .eq("user_id", currentUser.id);
    }

    navigate("/lobby");
  };

  const handleTimeEnd = () => {
    setShowEndGameModal(true);
  };

  if (!match || !currentUser) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Carregando...</div>;
  }

  const player1 = players.find(p => p.player_slot === 1);
  const player2 = players.find(p => p.player_slot === 2);
  const canJoinAsPlayer = players.length < 2 && userRole === "spectator";

  return (
    <>
      <Helmet>
        <title>{match.name} - HeroClix Battle</title>
      </Helmet>

      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <header className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-between w-full">
              <h1 className="text-3xl md:text-5xl font-black uppercase text-accent">
                {match.name}
              </h1>
              <Button
                onClick={handleLeaveMatch}
                variant="outline"
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
            <MatchTimer
              matchId={matchId!}
              userRole={userRole!}
              onTimeEnd={handleTimeEnd}
            />
            {userRole === "spectator" && (
              <div className="text-muted-foreground text-sm">
                Você está assistindo esta partida
              </div>
            )}
          </header>

          {/* Teams */}
          <main className="grid md:grid-cols-2 gap-6">
            <MatchTeamPanel
              matchId={matchId!}
              playerSlot={1}
              currentUserId={currentUser.id}
              canJoinAsPlayer={canJoinAsPlayer && !player1}
              isSpectator={userRole === "spectator"}
            />
            <MatchTeamPanel
              matchId={matchId!}
              playerSlot={2}
              currentUserId={currentUser.id}
              canJoinAsPlayer={canJoinAsPlayer && !player2}
              isSpectator={userRole === "spectator"}
            />
          </main>
        </div>

        <EndGameModal
          open={showEndGameModal}
          onClose={() => setShowEndGameModal(false)}
          player1Name={player1?.player_name || "Jogador 1"}
          player2Name={player2?.player_name || "Jogador 2"}
          player1Points={player1?.victory_points || 0}
          player2Points={player2?.victory_points || 0}
        />
      </div>
    </>
  );
};

export default Match;
