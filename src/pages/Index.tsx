import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Helmet } from "react-helmet";
import { Plus, Trash2, User } from "lucide-react";
import { ImportTeamDialog } from "@/components/match/ImportTeamDialog";
import { UnitForm } from "@/components/UnitForm";

interface Unit {
  id: string;
  collection: string;
  number: string;
  name: string;
  points: number;
  isKO: boolean;
  isSideline: boolean;
  attachedToId?: string;
  attachmentType?: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [player1Name, setPlayer1Name] = useState("Jogador 1");
  const [player2Name, setPlayer2Name] = useState("Jogador 2");
  const [player1Units, setPlayer1Units] = useState<Unit[]>([]);
  const [player2Units, setPlayer2Units] = useState<Unit[]>([]);
  const [showImportPlayer1, setShowImportPlayer1] = useState(false);
  const [showImportPlayer2, setShowImportPlayer2] = useState(false);
  const [showAddUnitPlayer1, setShowAddUnitPlayer1] = useState(false);
  const [showAddUnitPlayer2, setShowAddUnitPlayer2] = useState(false);

  const calculatePoints = (units: Unit[]) => {
    return units
      .filter((u) => !u.isSideline && u.isKO)
      .reduce((sum, u) => sum + u.points, 0);
  };

  const player1Score = calculatePoints(player2Units);
  const player2Score = calculatePoints(player1Units);

  const handleImportTeam = (player: 1 | 2, units: any[]) => {
    const formattedUnits: Unit[] = units.map((u) => ({
      id: Math.random().toString(36).substr(2, 9),
      collection: u.collection,
      number: u.number,
      name: u.name,
      points: u.points,
      isKO: false,
      isSideline: false,
    }));

    if (player === 1) {
      setPlayer1Units(formattedUnits);
    } else {
      setPlayer2Units(formattedUnits);
    }
  };

  const handleAddUnit = (player: 1 | 2, unit: any) => {
    const newUnit: Unit = {
      collection: unit.collection,
      number: unit.number,
      name: unit.name,
      points: unit.points,
      isSideline: unit.isSideline || false,
      id: Math.random().toString(36).substr(2, 9),
      isKO: false,
    };

    if (player === 1) {
      setPlayer1Units([...player1Units, newUnit]);
      setShowAddUnitPlayer1(false);
    } else {
      setPlayer2Units([...player2Units, newUnit]);
      setShowAddUnitPlayer2(false);
    }
  };

  const toggleKO = (player: 1 | 2, unitId: string) => {
    const setUnits = player === 1 ? setPlayer1Units : setPlayer2Units;
    const units = player === 1 ? player1Units : player2Units;

    setUnits(
      units.map((u) => (u.id === unitId ? { ...u, isKO: !u.isKO } : u))
    );
  };

  const deleteUnit = (player: 1 | 2, unitId: string) => {
    const setUnits = player === 1 ? setPlayer1Units : setPlayer2Units;
    const units = player === 1 ? player1Units : player2Units;

    setUnits(units.filter((u) => u.id !== unitId));
  };

  const renderPlayerPanel = (
    player: 1 | 2,
    name: string,
    setName: (name: string) => void,
    units: Unit[],
    score: number,
    showImport: boolean,
    setShowImport: (show: boolean) => void,
    showAddUnit: boolean,
    setShowAddUnit: (show: boolean) => void
  ) => (
    <div className="bg-card/80 p-6 rounded-xl border-2 border-accent/30">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-accent" />
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="font-bold text-lg border-2 border-accent/50"
          />
        </div>

        <div className="text-center p-4 bg-accent/10 rounded-lg">
          <p className="text-sm text-muted-foreground">Pontos de Vitória</p>
          <p className="text-4xl font-black text-accent">{score}</p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setShowImport(true)}
            className="flex-1"
            variant="outline"
          >
            Importar Time
          </Button>
          <Button
            onClick={() => setShowAddUnit(true)}
            className="flex-1"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar
          </Button>
        </div>

        {showAddUnit && (
          <div className="border-2 border-accent/30 rounded-lg p-4">
            <UnitForm
              onSubmit={(unit) => handleAddUnit(player, unit)}
              onCancel={() => setShowAddUnit(false)}
              allowSideline={true}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Unidades ({units.length})</Label>
          {units.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma unidade adicionada
            </p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {units.map((unit) => (
                <div
                  key={unit.id}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    unit.isKO
                      ? "bg-destructive/20 border-destructive/50"
                      : "bg-background/50 border-accent/30"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-bold">{unit.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {unit.collection} #{unit.number} - {unit.points}pts
                        {unit.isSideline && " (Sideline)"}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant={unit.isKO ? "default" : "destructive"}
                        onClick={() => toggleKO(player, unit.id)}
                      >
                        {unit.isKO ? "Reviver" : "KO"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteUnit(player, unit.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Demo Offline - HeroClix Battle</title>
        <meta
          name="description"
          content="Modo offline para jogar HeroClix sem necessidade de conta ou internet."
        />
      </Helmet>

      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <header className="flex flex-col items-center gap-4">
            <h1 className="text-5xl md:text-7xl font-black uppercase text-center text-accent text-stroke tracking-tight">
              HeroClix Battle
            </h1>
            <p className="text-lg text-muted-foreground">Modo Offline</p>
            <Button
              onClick={() => navigate("/auth")}
              variant="outline"
              className="border-2 border-accent/50"
            >
              Ir para Modo Online
            </Button>
          </header>

          <main className="grid md:grid-cols-2 gap-6">
            {renderPlayerPanel(
              1,
              player1Name,
              setPlayer1Name,
              player1Units,
              player1Score,
              showImportPlayer1,
              setShowImportPlayer1,
              showAddUnitPlayer1,
              setShowAddUnitPlayer1
            )}
            {renderPlayerPanel(
              2,
              player2Name,
              setPlayer2Name,
              player2Units,
              player2Score,
              showImportPlayer2,
              setShowImportPlayer2,
              showAddUnitPlayer2,
              setShowAddUnitPlayer2
            )}
          </main>
        </div>
      </div>

      <ImportTeamDialog
        open={showImportPlayer1}
        onClose={() => setShowImportPlayer1(false)}
        onImport={(units) => handleImportTeam(1, units)}
      />

      <ImportTeamDialog
        open={showImportPlayer2}
        onClose={() => setShowImportPlayer2(false)}
        onImport={(units) => handleImportTeam(2, units)}
      />
    </>
  );
};

export default Index;