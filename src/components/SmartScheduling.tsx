import { useEffect, useState } from "react";
import { Calendar, Zap } from "lucide-react";

type Exercise = {
  name: string;
  sets: number;
  reps: number;
};

type DaySchedule = {
  day: string;
  exercises: Exercise[];
};

type SmartSchedulingProps = {
  schedule?: DaySchedule[];
};

const SmartScheduling = ({ schedule }: SmartSchedulingProps) => {
  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>([]);
  useEffect(() => {
    if (schedule && schedule.length > 0) {
      setWeeklySchedule(schedule);
    }
  }, [schedule]);

  return (
    <div className="mt-4 space-y-4">
      {/* Weekly Workout Schedule */}
      {weeklySchedule.length === 0 ? (
        <div>
          <p className="text-sm text-muted-foreground">
            Generate a workout plan to see your weekly schedule.
          </p>

          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
            <Zap className="w-3 h-3 text-primary" />
            AI optimizes workouts and rest days automatically.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {weeklySchedule.map((dayItem, index) => (
            <div
              key={index}
              className="p-3 rounded-lg bg-background border border-border"
            >
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{dayItem.day}</span>
              </div>

              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                {dayItem.exercises.map((ex, exIdx) => (
                  <li key={exIdx}>
                    {ex.name} - {ex.sets} sets x {ex.reps} reps
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
            <Zap className="w-3 h-3 text-primary" />
            AI optimizes workouts and rest days automatically.
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartScheduling;