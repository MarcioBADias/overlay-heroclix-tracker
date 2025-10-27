import { useState } from "react";
import { Timer } from "@/components/Timer";
import { TeamPanel } from "@/components/TeamPanel";
import { EndGameModal } from "@/components/EndGameModal";
import { Helmet } from "react-helmet";

const Index = () => {
  const [player1Points, setPlayer1Points] = useState(0);
  const [player2Points, setPlayer2Points] = useState(0);
  const [showEndGameModal, setShowEndGameModal] = useState(false);

  const handlePlayer1Kill = (points: number) => {
    setPlayer2Points((prev) => prev + points);
  };

  const handlePlayer2Kill = (points: number) => {
    setPlayer1Points((prev) => prev + points);
  };

  const handleTimeEnd = () => {
    setShowEndGameModal(true);
  };

  return (
    <>
      <Helmet>
        <title>HeroClix Battle Overlay - Gerenciador de Partidas</title>
        <meta
          name="description"
          content="Sistema completo de overlay para partidas de HeroClix com timer, gerenciamento de times e pontuação em tempo real."
        />
      </Helmet>

      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header com Timer */}
          <header className="flex flex-col items-center gap-4">
            <h1 className="text-5xl md:text-7xl font-black uppercase text-center text-accent text-stroke tracking-tight">
              HeroClix Battle
            </h1>
            <Timer onTimeEnd={handleTimeEnd} />
          </header>

          {/* Painéis dos Times */}
          <main className="grid md:grid-cols-2 gap-6">
            <TeamPanel
              teamColor="blue"
              victoryPoints={player1Points}
              onPointsChange={handlePlayer1Kill}
            />
            <TeamPanel
              teamColor="red"
              victoryPoints={player2Points}
              onPointsChange={handlePlayer2Kill}
            />
          </main>
        </div>

        <EndGameModal
          open={showEndGameModal}
          onClose={() => setShowEndGameModal(false)}
          player1Name="Jogador 1"
          player2Name="Jogador 2"
          player1Points={player1Points}
          player2Points={player2Points}
        />
      </div>
    </>
  );
};

export default Index;
