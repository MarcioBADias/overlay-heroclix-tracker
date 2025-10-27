import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HC_UNIT_EDITIONS } from "@/data/collections";
import { Plus } from "lucide-react";

export interface Unit {
  id: string;
  collection: string;
  number: string;
  name: string;
  points: number;
  isKO: boolean;
}

interface UnitFormProps {
  onAddUnit: (unit: Omit<Unit, "id" | "isKO">) => void;
}

export const UnitForm = ({ onAddUnit }: UnitFormProps) => {
  const [collection, setCollection] = useState("");
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [points, setPoints] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (collection && number && name && points) {
      onAddUnit({
        collection,
        number,
        name,
        points: parseInt(points),
      });
      setNumber("");
      setName("");
      setPoints("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-card/50 p-4 rounded-xl border-2 border-accent/30">
      <div className="space-y-2">
        <Label htmlFor="collection" className="text-sm font-bold uppercase tracking-wide">
          Coleção
        </Label>
        <Select value={collection} onValueChange={setCollection}>
          <SelectTrigger id="collection" className="border-2 border-accent/50 bg-input">
            <SelectValue placeholder="Selecione a coleção" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-2 border-accent/50 max-h-[300px]">
            {HC_UNIT_EDITIONS.map((col) => (
              <SelectItem key={col.value} value={col.value}>
                {col.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label htmlFor="number" className="text-sm font-bold uppercase tracking-wide">
            Número
          </Label>
          <Input
            id="number"
            type="text"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="001"
            className="border-2 border-accent/50 bg-input"
            required
          />
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="name" className="text-sm font-bold uppercase tracking-wide">
            Nome
          </Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Superman"
            className="border-2 border-accent/50 bg-input"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="points" className="text-sm font-bold uppercase tracking-wide">
          Pontos
        </Label>
        <Input
          id="points"
          type="number"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          placeholder="100"
          className="border-2 border-accent/50 bg-input"
          required
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-black text-lg rounded-xl h-12"
      >
        <Plus className="mr-2 h-5 w-5" />
        Adicionar Unidade
      </Button>
    </form>
  );
};
