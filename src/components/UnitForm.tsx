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
  isSideline?: boolean;
  attachedToId?: string | null;
  attachmentType?: string | null;
}

interface UnitFormProps {
  onAddUnit?: (unit: Omit<Unit, "id" | "isKO">) => void;
  onSubmit?: (unit: Omit<Unit, "id" | "isKO">) => void;
  onCancel?: () => void;
  allowSideline?: boolean;
}

export const UnitForm = ({ onAddUnit, onSubmit, onCancel, allowSideline = false }: UnitFormProps) => {
  const [collection, setCollection] = useState("");
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [points, setPoints] = useState("");
  const [isSideline, setIsSideline] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (collection && number && name && points) {
      const unitData = {
        collection,
        number,
        name,
        points: parseInt(points),
        isSideline: allowSideline ? isSideline : false,
      };
      
      if (onSubmit) {
        onSubmit(unitData);
      } else if (onAddUnit) {
        onAddUnit(unitData);
      }
      
      setNumber("");
      setName("");
      setPoints("");
      setIsSideline(false);
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

      {allowSideline && (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="sideline"
            checked={isSideline}
            onChange={(e) => setIsSideline(e.target.checked)}
            className="h-4 w-4"
          />
          <Label htmlFor="sideline" className="cursor-pointer">
            Adicionar ao Sideline
          </Label>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="submit"
          className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-black text-lg rounded-xl h-12"
        >
          <Plus className="mr-2 h-5 w-5" />
          Adicionar
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 rounded-xl h-12"
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
};
