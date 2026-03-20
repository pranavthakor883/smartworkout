import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "lucide-react";

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  completed: boolean;
}

interface DaySchedule {
  day: string;
  exercises: Exercise[];
}

interface AIResult {
  goal: string;
  schedule: DaySchedule[];
  fitness_level: string;
  recommended_workout: number;
}

const AdaptiveProgressPage = () => {
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [goalPercent, setGoalPercent] = useState(0);

  useEffect(() => {
    const data = localStorage.getItem("aiResult");
    if (data) {
      const parsed: AIResult = JSON.parse(data);
      setAiResult(parsed);
      calculateGoal(parsed.schedule);
    }
  }, []);

  const calculateGoal = (schedule: DaySchedule[]) => {
    const totalPlanned = schedule.reduce(
      (acc, day) => acc + day.exercises.reduce((a, ex) => a + ex.sets, 0),
      0
    );
    const totalCompleted = schedule.reduce(
      (acc, day) =>
        acc + day.exercises.reduce((a, ex) => a + (ex.completed ? ex.sets : 0), 0),
      0
    );
    const percent = totalPlanned ? Math.round((totalCompleted / totalPlanned) * 100) : 0;
    setGoalPercent(percent);
  };

  const handleToggleComplete = (dayIdx: number, exIdx: number) => {
    if (!aiResult) return;
    const updatedSchedule = [...aiResult.schedule];
    updatedSchedule[dayIdx].exercises[exIdx].completed = !updatedSchedule[dayIdx].exercises[exIdx].completed;
    setAiResult({ ...aiResult, schedule: updatedSchedule });
    calculateGoal(updatedSchedule);
  };

  const chartData = aiResult?.schedule.map((day, idx) => ({
    day: `Day ${idx + 1}`,
    totalSets: day.exercises.reduce((acc, ex) => acc + ex.sets, 0),
    totalReps: day.exercises.reduce((acc, ex) => acc + ex.reps, 0),
  })) || [];

  return (
    <div className="min-h-screen bg-background text-foreground px-6 py-24">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Calendar className="w-6 h-6 text-primary" />
        Adaptive Progress
      </h1>

      {/* Goal Achievement */}
      <Card className="mb-10">
        <CardContent>
          <h2 className="text-xl font-semibold mb-2">Goal Achievement</h2>
          <Progress value={goalPercent} className="h-4" />
          <p className="mt-2 text-sm text-muted-foreground">{goalPercent}% completed</p>
        </CardContent>
      </Card>

      {/* Daily Sets & Reps Chart */}
      <Card className="mb-10">
        <CardContent>
          <h2 className="text-xl font-semibold mb-4">Daily Sets & Reps</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalSets" fill="#0ea5e9" name="Total Sets" />
              <Bar dataKey="totalReps" fill="#f97316" name="Total Reps" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Daily Exercises */}
      {aiResult?.schedule.map((day, dayIdx) => (
        <Card key={dayIdx} className="mb-6">
          <CardContent>
            <h2 className="text-lg font-semibold mb-2">{day.day}</h2>
            <ul className="space-y-2">
              {day.exercises.map((ex, exIdx) => (
                <li
                  key={exIdx}
                  className={`flex justify-between items-center p-2 border rounded-lg cursor-pointer ${
                    ex.completed ? "bg-green-100 line-through" : "hover:bg-gray-100"
                  }`}
                  onClick={() => handleToggleComplete(dayIdx, exIdx)}
                >
                  <span>{ex.name} ({ex.sets} sets x {ex.reps} reps)</span>
                  <span className="text-sm text-muted-foreground">
                    {ex.completed ? "✅" : "❌"}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdaptiveProgressPage;