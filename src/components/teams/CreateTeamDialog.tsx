import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Link as LinkIcon } from "lucide-react";

interface CreateTeamDialogProps {
  open: boolean;
  onClose: () => void;
  onTeamCreated: () => void;
}

export const CreateTeamDialog = ({ open, onClose, onTeamCreated }: CreateTeamDialogProps) => {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const extractTeamId = (url: string): string | null => {
    const match = url.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
    return match ? match[1] : null;
  };

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

  const handleImport = async () => {
    if (!url.trim()) {
      toast({
        title: "Erro",
        description: "Cole o link do time do HCUnits",
        variant: "destructive",
      });
      return;
    }

    const teamId = extractTeamId(url);
    if (!teamId) {
      toast({
        title: "Link inválido",
        description: "O link deve ser do formato: https://hcunits.net/teams/{id}/",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Import team from HCUnits
      const { data: teamData, error: importError } = await supabase.functions.invoke("import-team", {
        body: { teamId },
      });

      if (importError) throw importError;

      if (!teamData || !teamData.units || teamData.units.length === 0) {
        throw new Error("Nenhuma unidade encontrada no time");
      }

      // Create team in database
      const { data: newTeam, error: teamError } = await supabase
        .from("saved_teams")
        .insert({
          user_id: user.id,
          name: teamData.name || "Time Importado",
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Insert all units
      const unitsToInsert = teamData.units.map((unit: any) => ({
        team_id: newTeam.id,
        collection: unit.collection,
        number: unit.number,
        name: unit.name,
        points: unit.points,
        is_sideline: false,
      }));

      const { error: unitsError } = await supabase
        .from("saved_units")
        .insert(unitsToInsert);

      if (unitsError) throw unitsError;

      toast({
        title: "Time importado!",
        description: `${teamData.units.length} unidades importadas com sucesso.`,
      });

      setUrl("");
      onClose();
      onTeamCreated();
    } catch (error: any) {
      console.error("Import error:", error);
      toast({
        title: "Erro ao importar time",
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

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Criar Manualmente</TabsTrigger>
            <TabsTrigger value="import">Importar</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4">
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
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teamUrl">Link do Time (HCUnits)</Label>
              <Input
                id="teamUrl"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://hcunits.net/teams/..."
                className="border-2 border-accent/50"
              />
              <p className="text-sm text-muted-foreground">
                Cole o link completo do time do HCUnits.net
              </p>
            </div>

            <Button
              onClick={handleImport}
              className="w-full bg-accent hover:bg-accent/90 font-black"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Importar Time
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};