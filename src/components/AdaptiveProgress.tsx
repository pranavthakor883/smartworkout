import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Activity, Target, TrendingUp, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";
import SmartScheduling from "@/components/SmartScheduling";

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  completed?: boolean;
  actual: {
    setsDone: number;
    repsDone: number;
  };
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
      // Ensure all exercises have a completed flag
      const initializedSchedule = parsed.schedule.map(day => ({
        ...day,
        exercises: day.exercises.map(ex => ({
          ...ex,
          completed: ex.completed ?? false
        }))
      }));
      parsed.schedule = initializedSchedule;
      setAiResult(parsed);
      calculateGoal(initializedSchedule);
    }
  }, []);

  const calculateGoal = (schedule: DaySchedule[]) => {
    let totalPlanned = 0;
    let totalCompleted = 0;

    schedule.forEach(day => {
      day.exercises.forEach(ex => {
        if (!ex.name.toLowerCase().includes("rest")) {
          totalPlanned++;
          if (ex.completed) totalCompleted++;
        }
      });
    });

    const percent = totalPlanned > 0 ? Math.round((totalCompleted / totalPlanned) * 100) : 0;
    setGoalPercent(percent);
  };

  const handleToggleComplete = (dayIdx: number, exIdx: number) => {
    if (!aiResult) return;
    const updatedSchedule = aiResult.schedule.map((day, dIdx) => ({
      ...day,
      exercises: day.exercises.map((ex, eIdx) =>
        dIdx === dayIdx && eIdx === exIdx
          ? { ...ex, completed: !ex.completed }
          : ex
      )
    }));

    const newAiResult = { ...aiResult, schedule: updatedSchedule };
    setAiResult(newAiResult);
    localStorage.setItem("aiResult", JSON.stringify(newAiResult)); // Persist progress
    calculateGoal(updatedSchedule);
  };

  const chartData = aiResult?.schedule.map((day, idx) => ({
    name: day.day.substring(0, 3), // Mon, Tue...
    sets: day.exercises.reduce((acc, ex) => acc + (ex.name.toLowerCase().includes("rest") ? 0 : ex.sets), 0),
    reps: day.exercises.reduce((acc, ex) => acc + (ex.name.toLowerCase().includes("rest") ? 0 : ex.reps), 0),
  })) || [];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background text-foreground px-6 py-24 pb-32">
      <motion.div
        initial="hidden"
        animate="show"
        variants={container}
        className="max-w-6xl mx-auto space-y-8"
      >
        {/* Header */}
        <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold font-heading flex items-center gap-3">
              <Activity className="w-10 h-10 text-primary" />
              Adaptive Tracker
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Monitor your weekly performance and achieve your goals.
            </p>
          </div>
          <div className="bg-card border border-border/50 px-6 py-3 rounded-full flex items-center gap-3 shadow-sm">
            <Target className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm">Goal: <span className="text-primary">{aiResult?.goal || "Fitness"}</span></span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Stats & Chart */}
          <motion.div variants={item} className="lg:col-span-1 space-y-8">
            {/* Modern Goal Progress Card */}
            <Card className="border-border/50 shadow-sm relative overflow-hidden bg-card group hover:border-primary/30 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/20 transition-all" />
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-primary/10 rounded-2xl">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                    Completion
                  </span>
                </div>
                <div>
                  <h3 className="text-5xl font-bold font-heading">{goalPercent}%</h3>
                  <p className="text-sm text-muted-foreground mt-1">of weekly workouts finished</p>
                </div>

                <div className="h-3 w-full bg-secondary rounded-full overflow-hidden mt-6">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${goalPercent}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-primary rounded-full relative"
                  >
                    <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" style={{ transform: 'skewX(-20deg)' }} />
                  </motion.div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Chart Card */}
            <Card className="border-border/50 shadow-sm bg-card hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <CalendarDays className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold">Intensity Volume</h2>
                </div>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <Tooltip
                        cursor={{ fill: '#334155', opacity: 0.1 }}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                      />
                      <Bar dataKey="sets" fill="#0ea5e9" name="Sets" radius={[4, 4, 0, 0]} barSize={12} />
                      <Bar dataKey="reps" fill="#8b5cf6" name="Reps" radius={[4, 4, 0, 0]} barSize={12} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column: Weekly Schedule Interactive */}
          <motion.div variants={item} className="lg:col-span-2">
            <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-heading">Weekly Schedule</h2>
                <span className="text-sm text-primary font-semibold bg-primary/10 px-3 py-1 rounded-full">Interactive</span>
              </div>
              {aiResult ? (
                <SmartScheduling
                  schedule={aiResult.schedule}
                  interactive={true}
                  showProgress={false}
                  onToggleExercise={handleToggleComplete}
                />
              ) : (
                <p className="text-muted-foreground text-sm">Loading schedule data...</p>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdaptiveProgressPage;