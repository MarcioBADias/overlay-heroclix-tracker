import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { UnitForm, Unit } from "@/components/UnitForm";
import { UnitList } from "@/components/UnitList";

interface EditTeamDialogProps {
  open: boolean;
  team: { id: string; name: string };
  onClose: () => void;
  onTeamUpdated: () => void;
}

export const EditTeamDialog = ({ open, team, onClose, onTeamUpdated }: EditTeamDialogProps) => {
  const [name, setName] = useState(team.name);
  const [units, setUnits] = useState<Unit[]>([]);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setName(team.name);
      fetchUnits();
    }
  }, [open, team]);

  const fetchUnits = async () => {
    const { data, error } = await supabase
      .from("saved_units")
      .select("*")
      .eq("team_id", team.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching units:", error);
      return;
    }

    const mappedUnits = data?.map(unit => ({
      ...unit,
      isKO: false
    })) || [];

    setUnits(mappedUnits);
  };

  const handleUpdateName = async () => {
    if (!name.trim()) return;

    const { error } = await supabase
      .from("saved_teams")
      .update({ name: name.trim() })
      .eq("id", team.id);

    if (error) {
      toast({
        title: "Erro ao atualizar nome",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Nome atualizado!",
    });

    onTeamUpdated();
  };

  const handleAddUnit = async (unitData: Omit<Unit, "id" | "isKO">) => {
    const { error } = await supabase.from("saved_units").insert({
      team_id: team.id,
      ...unitData,
    });

    if (error) {
      toast({
        title: "Erro ao adicionar unidade",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Unidade adicionada!",
    });

    setShowForm(false);
    fetchUnits();
  };

  const handleDeleteUnit = async (unitId: string) => {
    const { error } = await supabase
      .from("saved_units")
      .delete()
      .eq("id", unitId);

    if (error) {
      toast({
        title: "Erro ao remover unidade",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Unidade removida!",
    });

    fetchUnits();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase text-accent">
            Editar Time
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Team Name */}
          <div className="space-y-2">
            <Label htmlFor="teamName">Nome do Time</Label>
            <div className="flex gap-2">
              <Input
                id="teamName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-2 border-accent/50"
              />
              <Button onClick={handleUpdateName}>Salvar</Button>
            </div>
          </div>

          {/* Units List */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Unidades</Label>
              {!showForm && (
                <Button
                  onClick={() => setShowForm(true)}
                  size="sm"
                  className="bg-accent hover:bg-accent/90"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              )}
            </div>

            {showForm && (
              <div className="mb-4">
                <UnitForm onAddUnit={handleAddUnit} />
                <Button
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="w-full mt-2"
                >
                  Cancelar
                </Button>
              </div>
            )}

            <UnitList
              units={units}
              onKillUnit={handleDeleteUnit}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};