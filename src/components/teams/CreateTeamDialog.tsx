import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface CreateTeamDialogProps {
  open: boolean;
  onClose: () => void;
  onTeamCreated: () => void;
}

export const CreateTeamDialog = ({ open, onClose, onTeamCreated }: CreateTeamDialogProps) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({
        title: "Erro",
        description: "Digite um nome para o time",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("saved_teams").insert({
        user_id: user.id,
        name: name.trim(),
      });

      if (error) throw error;

      toast({
        title: "Time criado!",
        description: "Você pode adicionar unidades agora.",
      });

      setName("");
      onClose();
      onTeamCreated();
    } catch (error: any) {
      toast({
        title: "Erro ao criar time",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase text-accent">
            Criar Novo Time
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="teamName">Nome do Time</Label>
            <Input
              id="teamName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Meu Time Épico"
              className="border-2 border-accent/50"
            />
          </div>

          <Button
            onClick={handleCreate}
            className="w-full bg-accent hover:bg-accent/90 font-black"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Criar Time"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};