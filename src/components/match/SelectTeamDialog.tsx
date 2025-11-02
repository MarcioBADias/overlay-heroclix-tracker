import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface SelectTeamDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (teamId: string) => void;
}

export const SelectTeamDialog = ({ open, onClose, onSelect }: SelectTeamDialogProps) => {
  const [teams, setTeams] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      loadTeams();
    }
  }, [open]);

  const loadTeams = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("saved_teams")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setTeams(data || []);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Selecionar Time</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {teams.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Você ainda não tem times salvos
            </p>
          ) : (
            teams.map((team) => (
              <Button
                key={team.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => onSelect(team.id)}
              >
                {team.name}
              </Button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
