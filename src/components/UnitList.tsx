import { Button } from "@/components/ui/button";
import { Skull } from "lucide-react";
import { Unit } from "./UnitForm";

interface UnitListProps {
  units: Unit[];
  onKillUnit: (id: string) => void;
}

export const UnitList = ({ units, onKillUnit }: UnitListProps) => {
  if (units.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma unidade adicionada
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {units.map((unit) => (
        <div
          key={unit.id}
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
          </div>
          <Button
            onClick={() => onKillUnit(unit.id)}
            size="icon"
            variant="destructive"
            className="h-9 w-9 rounded-lg"
            disabled={unit.isKO}
          >
            <Skull className="h-5 w-5" />
          </Button>
        </div>
      ))}
    </div>
  );
};
