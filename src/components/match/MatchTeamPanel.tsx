import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Upload, FolderOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { UnitForm, Unit } from "@/components/UnitForm";
import { MatchUnitList } from "./MatchUnitList";
import { ImportTeamDialog } from "./ImportTeamDialog";
import { SelectTeamDialog } from "./SelectTeamDialog";
import { useToast } from "@/hooks/use-toast";

interface MatchTeamPanelProps {
  matchId: string;
  playerSlot: number;
  currentUserId: string;
  canJoinAsPlayer: boolean;
  isSpectator: boolean;
}

export const MatchTeamPanel = ({
  matchId,
  playerSlot,
  currentUserId,
  canJoinAsPlayer,
  isSpectator,
}: MatchTeamPanelProps) => {
  const { toast } = useToast();
  const [player, setPlayer] = useState<any>(null);
  const [playerName, setPlayerName] = useState("");
  const [units, setUnits] = useState<Unit[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showSelect, setShowSelect] = useState(false);
  const [showSideline, setShowSideline] = useState(false);

  const isMyTeam = player?.user_id === currentUserId;

  useEffect(() => {
    loadPlayerAndUnits();

    const channel = supabase
      .channel(`match-team:${matchId}:${playerSlot}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_players",
          filter: `match_id=eq.${matchId}`,
        },
        () => loadPlayerAndUnits()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_units",
          filter: `match_id=eq.${matchId}`,
        },
        () => loadPlayerAndUnits()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, playerSlot]);

  const loadPlayerAndUnits = async () => {
    const { data: playerData } = await supabase
      .from("match_players")
      .select("*")
      .eq("match_id", matchId)
      .eq("player_slot", playerSlot)
      .maybeSingle();

    setPlayer(playerData);
    if (playerData) {
      setPlayerName(playerData.player_name);

      const { data: unitsData } = await supabase
        .from("match_units")
        .select("*")
        .eq("match_id", matchId)
        .eq("player_slot", playerSlot)
        .order("created_at");

      setUnits(
        unitsData?.map((u) => ({
          id: u.id,
          name: u.name,
          number: u.number,
          points: u.points,
          collection: u.collection,
          isKO: u.is_ko,
          isSideline: u.is_sideline,
          attachedToId: u.attached_to_id,
          attachmentType: u.attachment_type,
        })) || []
      );
    }
  };

  const handleJoinAsPlayer = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", user.id)
      .single();

    await supabase.from("match_players").insert({
      match_id: matchId,
      player_slot: playerSlot,
      user_id: user.id,
      player_name: profile?.display_name || "Jogador",
      victory_points: 0,
      total_points: 0,
    });
  };

  const handleAddUnit = async (unitData: Omit<Unit, "id" | "isKO">) => {
    if (!player) return;

    await supabase.from("match_units").insert({
      match_id: matchId,
      player_slot: playerSlot,
      name: unitData.name,
      number: unitData.number,
      points: unitData.points,
      collection: unitData.collection,
      is_ko: false,
      is_sideline: unitData.isSideline || false,
      attached_to_id: unitData.attachedToId || null,
      attachment_type: unitData.attachmentType || null,
    });

    // Update total points
    const newTotal = units
      .filter(u => !u.isSideline && !u.attachedToId)
      .reduce((sum, u) => sum + u.points, 0) + unitData.points;

    await supabase
      .from("match_players")
      .update({ total_points: newTotal })
      .eq("id", player.id);

    setShowForm(false);
  };

  const handleKillUnit = async (unitId: string) => {
    const unit = units.find((u) => u.id === unitId);
    if (!unit || !player) return;

    const newKOStatus = !unit.isKO;

    // Update unit KO status
    await supabase
      .from("match_units")
      .update({ is_ko: newKOStatus })
      .eq("id", unitId);

    // If unit has attachments, detach them
    if (!newKOStatus && unit.attachedToId === null) {
      await supabase
        .from("match_units")
        .update({ attached_to_id: null, attachment_type: null })
        .eq("attached_to_id", unitId);
    }

    // Update opponent's victory points
    const opponentSlot = playerSlot === 1 ? 2 : 1;
    const { data: opponent } = await supabase
      .from("match_players")
      .select("victory_points")
      .eq("match_id", matchId)
      .eq("player_slot", opponentSlot)
      .single();

    if (opponent) {
      const pointsDelta = newKOStatus ? unit.points : -unit.points;
      await supabase
        .from("match_players")
        .update({ victory_points: opponent.victory_points + pointsDelta })
        .eq("match_id", matchId)
        .eq("player_slot", opponentSlot);
    }
  };

  const handleAttachUnit = async (unitId: string, targetId: string, type: string) => {
    await supabase
      .from("match_units")
      .update({
        attached_to_id: targetId,
        attachment_type: type,
      })
      .eq("id", unitId);
  };

  const handleImportTeam = (importedUnits: Unit[]) => {
    importedUnits.forEach((unit) => {
      handleAddUnit(unit);
    });
    setShowImport(false);
    toast({
      title: "Time importado!",
      description: `${importedUnits.length} unidades adicionadas.`,
    });
  };

  const handleSelectTeam = async (teamId: string) => {
    const { data: savedUnits } = await supabase
      .from("saved_units")
      .select("*")
      .eq("team_id", teamId);

    if (savedUnits) {
      for (const unit of savedUnits) {
        await handleAddUnit({
          name: unit.name,
          number: unit.number,
          points: unit.points,
          collection: unit.collection,
          isSideline: unit.is_sideline,
          attachedToId: unit.attached_to_id,
          attachmentType: unit.attachment_type,
        });
      }
      setShowSelect(false);
      toast({
        title: "Time carregado!",
        description: `${savedUnits.length} unidades adicionadas.`,
      });
    }
  };

  const teamColor = playerSlot === 1 ? "blue" : "red";
  const mainUnits = units.filter((u) => !u.isSideline && !u.attachedToId);
  const sidelineUnits = units.filter((u) => u.isSideline);
  const totalPoints = mainUnits.reduce((sum, u) => sum + u.points, 0);

  if (!player && canJoinAsPlayer && !isSpectator) {
    return (
      <div className={`bg-card border-4 border-${teamColor}-500 rounded-xl p-6`}>
        <Button onClick={handleJoinAsPlayer} className="w-full">
          Entrar como Jogador {playerSlot}
        </Button>
      </div>
    );
  }

  if (!player) {
    return (
      <div className={`bg-card border-4 border-${teamColor}-500 rounded-xl p-6`}>
        <div className="text-center text-muted-foreground">
          Aguardando Jogador {playerSlot}...
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card border-4 border-${teamColor}-500 rounded-xl p-6 space-y-4`}>
      <div className="space-y-2">
        <Input
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="text-xl font-bold text-center"
          disabled={!isMyTeam}
        />
        <div className="flex justify-between text-lg font-semibold">
          <span>Pontos de Vitória: {player.victory_points}</span>
          <span>Total: {totalPoints}</span>
        </div>
      </div>

      {isMyTeam && mainUnits.length === 0 && (
        <div className="flex gap-2">
          <Button onClick={() => setShowForm(true)} className="flex-1 gap-2">
            <Plus className="h-4 w-4" />
            Criar Time
          </Button>
          <Button onClick={() => setShowSelect(true)} variant="outline" className="flex-1 gap-2">
            <FolderOpen className="h-4 w-4" />
            Selecionar
          </Button>
          <Button onClick={() => setShowImport(true)} variant="outline" className="flex-1 gap-2">
            <Upload className="h-4 w-4" />
            Importar
          </Button>
        </div>
      )}

      <MatchUnitList
        units={units}
        onKillUnit={handleKillUnit}
        onAttachUnit={handleAttachUnit}
        isMyTeam={isMyTeam}
        isSpectator={isSpectator}
      />

      {showSideline && sidelineUnits.length > 0 && (
        <div className="border-t-2 border-accent/30 pt-4">
          <h3 className="text-lg font-bold mb-2">Sideline</h3>
          <MatchUnitList
            units={sidelineUnits}
            onKillUnit={handleKillUnit}
            onAttachUnit={handleAttachUnit}
            isMyTeam={isMyTeam}
            isSpectator={isSpectator}
          />
        </div>
      )}

      {isMyTeam && mainUnits.length > 0 && (
        <div className="space-y-2">
          {!showForm ? (
            <>
              <Button onClick={() => setShowForm(true)} variant="outline" className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Unidade
              </Button>
              <Button
                onClick={() => setShowSideline(!showSideline)}
                variant="outline"
                className="w-full"
              >
                {showSideline ? "Ocultar" : "Mostrar"} Sideline
              </Button>
            </>
          ) : (
            <UnitForm
              onSubmit={handleAddUnit}
              onCancel={() => setShowForm(false)}
              allowSideline={true}
            />
          )}
        </div>
      )}

      <ImportTeamDialog
        open={showImport}
        onClose={() => setShowImport(false)}
        onImport={handleImportTeam}
      />

      <SelectTeamDialog
        open={showSelect}
        onClose={() => setShowSelect(false)}
        onSelect={handleSelectTeam}
      />
    </div>
  );
};
