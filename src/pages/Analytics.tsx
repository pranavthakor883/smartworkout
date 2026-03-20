import { useEffect, useState } from "react";
import SmartScheduling from "@/components/SmartScheduling";

const Analytics = () => {
  const [aiResult, setAiResult] = useState<any>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Load AI schedule from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("aiResult");
    if (stored) {
      const result = JSON.parse(stored);
      if (result.schedule && result.schedule.length > 0) {
        const scheduleWithCompletion = result.schedule.map((day: any) => {
          const exercises = day.exercises.map((ex: any) => ({
            ...ex,
            completed: ex.completed ?? (ex.name === "Rest Day" ? true : false),
          }));
          return { ...day, exercises };
        });
        setAiResult({ ...result, schedule: scheduleWithCompletion });
      } else {
        setAiResult({ schedule: [] });
      }
    } else {
      setAiResult({ schedule: [] });
    }
  }, []);

  // ✅ Handle toggle when user ticks an exercise
  const handleToggleExercise = (dayIndex: number, exIndex: number) => {
    if (!aiResult) return;
    const updatedSchedule = [...aiResult.schedule];
    const ex = updatedSchedule[dayIndex].exercises[exIndex];
    ex.completed = !ex.completed;

    setAiResult({ ...aiResult, schedule: updatedSchedule });

    // Optional toast
    const totalExercises = updatedSchedule.flatMap(d => d.exercises).length;
    const completedExercises = updatedSchedule.flatMap(d => d.exercises).filter(e => e.completed).length;
    setToast(`✅ ${ex.name} completed! ${completedExercises}/${totalExercises} exercises done.`);
    setTimeout(() => setToast(null), 3000);
  };

  if (!aiResult?.schedule || aiResult.schedule.length === 0) {
    return <p className="p-6 text-center">No schedule available. Generate your plan first.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Real-Time Analytics</h1>

      {/* Toast notification */}
      {toast && (
        <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {toast}
        </div>
      )}

      <SmartScheduling
        schedule={aiResult.schedule}
        showProgress={true}
        interactive={true} // ✅ user can tick
        onToggleExercise={handleToggleExercise}
      />
    </div>
  );
};

export default Analytics;