import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MatchTimerProps {
  matchId: string;
  userRole: "player" | "spectator";
  onTimeEnd: () => void;
}

export const MatchTimer = ({ matchId, userRole, onTimeEnd }: MatchTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(3000); // 50 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  useEffect(() => {
    const loadTimer = async () => {
      const { data } = await supabase
        .from("matches")
        .select("timer_state, timer_remaining, timer_last_update")
        .eq("id", matchId)
        .single();

      if (data) {
        setIsRunning(data.timer_state === "running");
        setLastUpdate(data.timer_last_update);
        
        if (data.timer_state === "running" && data.timer_last_update) {
          const elapsed = Math.floor((Date.now() - new Date(data.timer_last_update).getTime()) / 1000);
          setTimeLeft(Math.max(0, data.timer_remaining - elapsed));
        } else {
          setTimeLeft(data.timer_remaining);
        }
      }
    };

    loadTimer();

    // Subscribe to timer changes
    const channel = supabase
      .channel(`timer:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "matches",
          filter: `id=eq.${matchId}`,
        },
        (payload) => {
          const newData = payload.new as any;
          setIsRunning(newData.timer_state === "running");
          setLastUpdate(newData.timer_last_update);
          
          if (newData.timer_state === "running" && newData.timer_last_update) {
            const elapsed = Math.floor((Date.now() - new Date(newData.timer_last_update).getTime()) / 1000);
            setTimeLeft(Math.max(0, newData.timer_remaining - elapsed));
          } else {
            setTimeLeft(newData.timer_remaining);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handlePause();
            onTimeEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onTimeEnd]);

  const handleToggle = async () => {
    const newState = isRunning ? "paused" : "running";
    await supabase
      .from("matches")
      .update({
        timer_state: newState,
        timer_remaining: timeLeft,
        timer_last_update: newState === "running" ? new Date().toISOString() : null,
      })
      .eq("id", matchId);
  };

  const handlePause = async () => {
    await supabase
      .from("matches")
      .update({
        timer_state: "paused",
        timer_remaining: timeLeft,
        timer_last_update: null,
      })
      .eq("id", matchId);
  };

  const handleReset = async () => {
    await supabase
      .from("matches")
      .update({
        timer_state: "stopped",
        timer_remaining: 3000,
        timer_last_update: null,
      })
      .eq("id", matchId);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex items-center gap-4 bg-card border-4 border-accent rounded-xl p-4 shadow-[0_0_20px_rgba(255,193,7,0.3)]">
      {userRole === "spectator" ? (
        <div className="text-5xl font-black text-accent text-stroke tabular-nums min-w-[140px] text-center">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            onClick={handleToggle}
            size="icon"
            className="h-12 w-12 bg-primary hover:bg-primary/90 rounded-xl"
          >
            {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>
          <Button
            onClick={handleReset}
            size="icon"
            variant="outline"
            className="h-12 w-12 border-2 border-accent/50 hover:border-accent rounded-xl"
          >
            <RotateCcw className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  );
};
