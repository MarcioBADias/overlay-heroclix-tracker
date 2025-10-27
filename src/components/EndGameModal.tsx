import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

interface EndGameModalProps {
  open: boolean;
  onClose: () => void;
  player1Name: string;
  player2Name: string;
  player1Points: number;
  player2Points: number;
}

export const EndGameModal = ({
  open,
  onClose,
  player1Name,
  player2Name,
  player1Points,
  player2Points,
}: EndGameModalProps) => {
  const winner =
    player1Points > player2Points
      ? player1Name || "Jogador 1"
      : player2Points > player1Points
      ? player2Name || "Jogador 2"
      : "Empate";

  const isDraw = player1Points === player2Points;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-4 border-accent">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black text-center uppercase text-accent text-stroke">
            Fim de Jogo!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex justify-center">
            <Trophy className="h-20 w-20 text-accent animate-pulse-slow" />
          </div>

          {!isDraw ? (
            <div className="text-center space-y-2">
              <div className="text-xl font-bold uppercase text-muted-foreground">
                Vencedor
              </div>
              <div className="text-5xl font-black text-accent text-stroke">
                {winner}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-5xl font-black text-accent text-stroke">
                Empate!
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary/20 p-4 rounded-xl border-2 border-primary text-center">
              <div className="text-sm font-bold uppercase text-muted-foreground">
                {player1Name || "Jogador 1"}
              </div>
              <div className="text-4xl font-black text-primary">
                {player1Points}
              </div>
            </div>
            <div className="bg-secondary/20 p-4 rounded-xl border-2 border-secondary text-center">
              <div className="text-sm font-bold uppercase text-muted-foreground">
                {player2Name || "Jogador 2"}
              </div>
              <div className="text-4xl font-black text-secondary">
                {player2Points}
              </div>
            </div>
          </div>

          <Button
            onClick={onClose}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-black text-lg rounded-xl h-12"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
