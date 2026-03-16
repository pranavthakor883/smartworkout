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
  completed?: boolean;
};

type SmartSchedulingProps = {
  schedule?: DaySchedule[];
  showProgress?: boolean; // ✅ optional prop
};

const SmartScheduling = ({ schedule = [], showProgress = false }: SmartSchedulingProps) => {
  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>([]);

  useEffect(() => {
    setWeeklySchedule(schedule);
  }, [schedule]);

  const calculateGoalCompletion = (schedule: DaySchedule[]) => {
    if (!schedule || schedule.length === 0) return 0;
    const total = schedule.length;
    const completed = schedule.filter(day => day.completed).length;
    return Math.round((completed / total) * 100);
  };

  if (weeklySchedule.length === 0)
    return (
      <div>
        <p className="text-sm text-muted-foreground">
          Generate a workout plan to see your weekly schedule.
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
          <Zap className="w-3 h-3 text-primary" />
          AI optimizes workouts and rest days automatically.
        </div>
      </div>
    );

  return (
    <div className="mt-4 space-y-4">
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

          {showProgress && (
            <div className="mt-2 text-sm text-primary font-semibold">
              Status: {dayItem.completed ? "✅ Completed" : "❌ Pending"}
            </div>
          )}
        </div>
      ))}

      {showProgress && (
        <div className="mt-4 text-sm font-semibold text-primary">
          Goal Completion: {calculateGoalCompletion(weeklySchedule)}%
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
        <Zap className="w-3 h-3 text-primary" />
        AI optimizes workouts and rest days automatically.
      </div>
    </div>
  );
};

export default SmartScheduling;