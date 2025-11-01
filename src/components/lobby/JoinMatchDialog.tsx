import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, Gamepad2, Eye } from "lucide-react";

interface Match {
  id: string;
  name: string;
  is_public: boolean;
  password_hash?: string;
  player_count: number;
}

interface JoinMatchDialogProps {
  open: boolean;
  match: Match | null;
  onClose: () => void;
  onJoined: (matchId: string) => void;
}

export const JoinMatchDialog = ({ open, match, onClose, onJoined }: JoinMatchDialogProps) => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [joinAsPlayer, setJoinAsPlayer] = useState(true);
  const { toast } = useToast();

  const handleJoin = async () => {
    if (!match) return;

    if (!match.is_public && password !== match.password_hash) {
      toast({
        title: "Senha incorreta",
        description: "A senha digitada está incorreta.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      if (joinAsPlayer && match.player_count < 2) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", user.id)
          .single();

        const { error } = await supabase.from("match_players").insert({
          match_id: match.id,
          user_id: user.id,
          player_slot: match.player_count + 1,
          player_name: profile?.display_name || user.email?.split("@")[0] || "Jogador",
        });

        if (error) throw error;
      } else {
        const { error } = await supabase.from("match_spectators").insert({
          match_id: match.id,
          user_id: user.id,
        });

        if (error) throw error;
      }

      toast({
        title: "Sucesso!",
        description: `Você entrou na partida como ${joinAsPlayer ? "jogador" : "espectador"}.`,
      });

      onJoined(match.id);
    } catch (error: any) {
      toast({
        title: "Erro ao entrar na partida",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!match) return null;

  const canJoinAsPlayer = match.player_count < 2;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase text-accent">
            {match.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-5 w-5" />
            <span>{match.player_count}/2 jogadores</span>
          </div>

          {!match.is_public && (
            <div className="space-y-2">
              <Label htmlFor="matchPassword">Senha da Partida</Label>
              <Input
                id="matchPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha"
                className="border-2 border-accent/50"
              />
            </div>
          )}

          <div className="space-y-3">
            <p className="font-semibold">Entrar como:</p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={joinAsPlayer ? "default" : "outline"}
                className={joinAsPlayer ? "bg-accent" : ""}
                onClick={() => setJoinAsPlayer(true)}
                disabled={!canJoinAsPlayer}
              >
                <Gamepad2 className="mr-2 h-4 w-4" />
                Jogador
              </Button>
              <Button
                variant={!joinAsPlayer ? "default" : "outline"}
                className={!joinAsPlayer ? "bg-accent" : ""}
                onClick={() => setJoinAsPlayer(false)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Espectador
              </Button>
            </div>
            {!canJoinAsPlayer && joinAsPlayer && (
              <p className="text-sm text-muted-foreground">
                Partida cheia. Entre como espectador.
              </p>
            )}
          </div>

          <Button
            onClick={handleJoin}
            className="w-full bg-accent hover:bg-accent/90 font-black"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Entrar na Partida"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};