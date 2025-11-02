import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Link as LinkIcon } from "lucide-react";

interface ImportTeamDialogProps {
  open: boolean;
  onClose: () => void;
  onTeamImported?: (units: any[]) => void;
  onImport?: (units: any[]) => void;
}

export const ImportTeamDialog = ({ open, onClose, onTeamImported, onImport }: ImportTeamDialogProps) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const extractTeamId = (url: string): string | null => {
    // Extract UUID from URL like https://hcunits.net/teams/acc0bd69-4a1f-4d01-ab7a-3d0df654655e/
    const match = url.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
    return match ? match[1] : null;
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
      const { data, error } = await supabase.functions.invoke("import-team", {
        body: { teamId },
      });

      if (error) throw error;

      if (!data || !data.units || data.units.length === 0) {
        throw new Error("Nenhuma unidade encontrada no time");
      }

      toast({
        title: "Time importado!",
        description: `${data.units.length} unidades importadas com sucesso.`,
      });

      if (onTeamImported) {
        onTeamImported(data.units);
      } else if (onImport) {
        onImport(data.units);
      }
      setUrl("");
      onClose();
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
            Importar Time
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
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
        </div>
      </DialogContent>
    </Dialog>
  );
};