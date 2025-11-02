import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skull, Link as LinkIcon } from "lucide-react";
import { Unit } from "@/components/UnitForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MatchUnitListProps {
  units: Unit[];
  onKillUnit: (id: string) => void;
  onAttachUnit: (unitId: string, targetId: string, type: string) => void;
  isMyTeam: boolean;
  isSpectator: boolean;
}

export const MatchUnitList = ({
  units,
  onKillUnit,
  onAttachUnit,
  isMyTeam,
  isSpectator,
}: MatchUnitListProps) => {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [attachmentType, setAttachmentType] = useState<string>("");
  const [targetUnit, setTargetUnit] = useState<string>("");

  const handleLinkClick = (unit: Unit) => {
    setSelectedUnit(unit);
    setLinkDialogOpen(true);
  };

  const handleConfirmLink = () => {
    if (selectedUnit && targetUnit && attachmentType) {
      onAttachUnit(selectedUnit.id, targetUnit, attachmentType);
      setLinkDialogOpen(false);
      setSelectedUnit(null);
      setAttachmentType("");
      setTargetUnit("");
    }
  };

  const renderUnit = (unit: Unit, isAttached = false) => {
    const attachedUnits = units.filter((u) => u.attachedToId === unit.id);

    return (
      <div key={unit.id} className={isAttached ? "ml-8" : ""}>
        <div
          className={`flex items-center gap-3 p-3 bg-card/80 rounded-lg border-2 ${
            unit.isKO ? "border-destructive" : "border-accent/30"
          } transition-all`}
        >
          <img
            src={`https://storage.googleapis.com/static.hcunits.net/images/set/${unit.collection}/icon.svg`}
            alt={unit.collection}
            className="w-8 h-8"
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/32";
            }}
          />
          <div className={`flex-1 font-semibold ${unit.isKO ? "line-through text-destructive" : ""}`}>
            {unit.number} - {unit.name} - {unit.points} Pontos
            {unit.attachmentType && (
              <span className="text-xs text-muted-foreground ml-2">
                ({unit.attachmentType})
              </span>
            )}
          </div>
          {isMyTeam && !isSpectator && (
            <div className="flex gap-2">
              {!unit.attachedToId && (
                <Button
                  onClick={() => handleLinkClick(unit)}
                  size="icon"
                  variant="outline"
                  className="h-9 w-9 rounded-lg"
                  title="Vincular a outra unidade"
                >
                  <LinkIcon className="h-5 w-5" />
                </Button>
              )}
              <Button
                onClick={() => onKillUnit(unit.id)}
                size="icon"
                variant={unit.isKO ? "secondary" : "destructive"}
                className="h-9 w-9 rounded-lg"
                title={unit.isKO ? "Reverter KO" : "Marcar como KO"}
              >
                <Skull className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>

        {attachedUnits.map((attachedUnit) => renderUnit(attachedUnit, true))}
      </div>
    );
  };

  const mainUnits = units.filter((u) => !u.attachedToId);

  if (mainUnits.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma unidade adicionada
      </div>
    );
  }

  const availableTargets = units.filter(
    (u) => !u.attachedToId && u.id !== selectedUnit?.id && !u.isSideline
  );

  return (
    <>
      <div className="space-y-2">
        {mainUnits.map((unit) => renderUnit(unit))}
      </div>

      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vincular Unidade</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Anexo</label>
              <Select value={attachmentType} onValueChange={setAttachmentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Equipamento">⚔️ Equipamento</SelectItem>
                  <SelectItem value="Avatar">👤 Avatar</SelectItem>
                  <SelectItem value="Outro">🔗 Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Vincular a</label>
              <Select value={targetUnit} onValueChange={setTargetUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  {availableTargets.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.number} - {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleConfirmLink} disabled={!attachmentType || !targetUnit}>
                Confirmar
              </Button>
              <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
