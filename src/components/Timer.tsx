import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

interface TimerProps {
  onTimeEnd: () => void;
}

export const Timer = ({ onTimeEnd }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(50 * 60); // 50 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            onTimeEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onTimeEnd]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setTimeLeft(50 * 60);
    setIsRunning(false);
  };

  return (
    <div className="flex items-center gap-4 bg-card border-4 border-accent rounded-xl p-4 shadow-[0_0_20px_rgba(255,193,7,0.3)]">
      <div className="text-5xl font-black text-accent text-stroke tabular-nums min-w-[140px] text-center">
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </div>
      <div className="flex gap-2">
        <Button
          onClick={toggleTimer}
          size="icon"
          className="h-12 w-12 bg-primary hover:bg-primary/90 rounded-xl"
        >
          {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </Button>
        <Button
          onClick={resetTimer}
          size="icon"
          variant="outline"
          className="h-12 w-12 border-2 border-accent/50 hover:border-accent rounded-xl"
        >
          <RotateCcw className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};
