import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface CreateMatchDialogProps {
  open: boolean;
  onClose: () => void;
  onMatchCreated: (matchId: string) => void;
}

export const CreateMatchDialog = ({ open, onClose, onMatchCreated }: CreateMatchDialogProps) => {
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({
        title: "Erro",
        description: "Digite um nome para a partida",
        variant: "destructive",
      });
      return;
    }

    if (!isPublic && !password.trim()) {
      toast({
        title: "Erro",
        description: "Digite uma senha para a partida privada",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const matchData: any = {
        name: name.trim(),
        is_public: isPublic,
        host_id: user.id,
        status: "waiting",
      };

      if (!isPublic && password) {
        matchData.password_hash = password;
      }

      const { data, error } = await supabase
        .from("matches")
        .insert(matchData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Partida criada!",
        description: "Você será redirecionado para a sala de jogo.",
      });

      onMatchCreated(data.id);
    } catch (error: any) {
      toast({
        title: "Erro ao criar partida",
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
            Criar Nova Partida
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="matchName">Nome da Partida</Label>
            <Input
              id="matchName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Minha Partida Épica"
              className="border-2 border-accent/50"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isPublic">Partida Pública</Label>
            <Switch
              id="isPublic"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          {!isPublic && (
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite uma senha"
                className="border-2 border-accent/50"
              />
            </div>
          )}

          <Button
            onClick={handleCreate}
            className="w-full bg-accent hover:bg-accent/90 font-black"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Criar Partida"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};