import { useEffect, useState } from "react";
import { Calendar, Zap } from "lucide-react";

type Exercise = {
  name: string;
  sets: number;
  reps: number;
  completed?: boolean;
};

type DaySchedule = {
  day: string;
  exercises: Exercise[];
};

type SmartSchedulingProps = {
  schedule?: DaySchedule[];
  showProgress?: boolean;
  interactive?: boolean; // ✅ new prop
  onToggleExercise?: (dayIndex: number, exIndex: number) => void;
};

const SmartScheduling = ({ schedule = [], showProgress = false, interactive = false, onToggleExercise }: SmartSchedulingProps) => {
  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>([]);

  useEffect(() => {
    const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    const fullSchedule = allDays.map((dayName) => {
      const day = schedule.find((d) => d.day === dayName);

      if (day) {
        const exercises = day.exercises.map((ex) => ({
          ...ex,
          completed: ex.completed ?? (ex.name.toLowerCase().includes("rest") ? true : false),
        }));
        return { ...day, exercises };
      } else {
        return {
          day: dayName,
          exercises: [{ name: "Rest Day", sets: 0, reps: 0, completed: true }],
        };
      }
    });

    setWeeklySchedule(fullSchedule);
  }, [schedule]);

  const calculateDayCompletion = (day: DaySchedule) => {
    if (!day.exercises || day.exercises.length === 0) return 0;
    const doneCount = day.exercises.filter((ex) => ex.completed).length;
    return Math.round((doneCount / day.exercises.length) * 100);
  };

  const calculateGoalCompletion = (schedule: DaySchedule[]) => {
    let totalExercises = 0;
    let completedExercises = 0;
    schedule.forEach((day) => {
      totalExercises += day.exercises.length;
      completedExercises += day.exercises.filter((ex) => ex.completed).length;
    });
    if (totalExercises === 0) return 0;
    return Math.round((completedExercises / totalExercises) * 100);
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
      {weeklySchedule.map((dayItem, dayIdx) => (
        <div
          key={dayIdx}
          className="p-3 rounded-lg bg-background border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{dayItem.day}</span>
          </div>

          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            {dayItem.exercises.map((ex, exIdx) => (
              <li key={exIdx} className="flex items-center gap-2">
                {/* checkbox hidden in read-only */}
                {interactive && (
                  <input
                    type="checkbox"
                    checked={ex.completed}
                    onChange={() => onToggleExercise && onToggleExercise(dayIdx, exIdx)}
                  />
                )}

                {ex.name} - {ex.sets} sets x {ex.reps} reps

                {/* ✅ only show completed, no pending */}
                {ex.completed && (
                  <span className="text-green-500 ml-1 font-semibold">✅ Completed</span>
                )}
              </li>
            ))}
          </ul>

          {showProgress && (
            <div className="mt-2 text-sm text-primary font-semibold">
              Status: {calculateDayCompletion(dayItem)}% Completed
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