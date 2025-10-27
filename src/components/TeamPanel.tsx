import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UnitForm, Unit } from "./UnitForm";
import { UnitList } from "./UnitList";
import { Plus, X } from "lucide-react";

interface TeamPanelProps {
  teamColor: "blue" | "red";
  onPointsChange: (points: number) => void;
  victoryPoints: number;
}

export const TeamPanel = ({ teamColor, onPointsChange, victoryPoints }: TeamPanelProps) => {
  const [playerName, setPlayerName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);

  const handleAddUnit = (unitData: Omit<Unit, "id" | "isKO">) => {
    const newUnit: Unit = {
      ...unitData,
      id: crypto.randomUUID(),
      isKO: false,
    };
    setUnits([...units, newUnit]);
    setShowForm(false);
  };

  const handleKillUnit = (id: string) => {
    setUnits((prev) =>
      prev.map((unit) => {
        if (unit.id === id && !unit.isKO) {
          onPointsChange(unit.points);
          return { ...unit, isKO: true };
        }
        return unit;
      })
    );
  };

  const totalPoints = units.reduce((sum, unit) => sum + unit.points, 0);

  const gradientClass = teamColor === "blue" 
    ? "bg-gradient-to-br from-blue-900/50 to-blue-950/50" 
    : "bg-gradient-to-br from-red-900/50 to-red-950/50";
  
  const accentClass = teamColor === "blue" ? "border-primary" : "border-secondary";

  return (
    <div className={`${gradientClass} p-6 rounded-2xl border-4 ${accentClass} relative overflow-hidden`}>
      <div className="comic-dots absolute inset-0 pointer-events-none" />
      
      <div className="relative z-10 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wide text-accent">
              Nome do Jogador
            </label>
            <Input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Digite o nome"
              className="border-2 border-accent/50 bg-input text-lg font-semibold h-12"
            />
          </div>

          <div className="flex items-center justify-between bg-card/80 p-4 rounded-xl border-2 border-accent/50">
            <div>
              <div className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                Pontos de Vitória
              </div>
              <div className="text-4xl font-black text-accent text-stroke">
                {victoryPoints}
              </div>
            </div>
            <div>
              <div className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                Total de Pontos
              </div>
              <div className="text-4xl font-black text-foreground">
                {totalPoints}
              </div>
            </div>
          </div>
        </div>

        {!showForm ? (
          <Button
            onClick={() => setShowForm(true)}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-black text-lg rounded-xl h-12"
          >
            <Plus className="mr-2 h-5 w-5" />
            Adicionar Time
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black uppercase">Adicionar Unidade</h3>
              <Button
                onClick={() => setShowForm(false)}
                size="icon"
                variant="ghost"
                className="h-8 w-8"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <UnitForm onAddUnit={handleAddUnit} />
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-xl font-black uppercase text-accent">Unidades</h3>
          <UnitList units={units} onKillUnit={handleKillUnit} />
        </div>
      </div>
    </div>
  );
};
