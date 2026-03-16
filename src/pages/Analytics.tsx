import { useEffect, useState } from "react";
import SmartScheduling from "@/components/SmartScheduling";
const Analytics = () => {
  const [aiResult, setAiResult] = useState<any>(null);

  const dummySchedule = [
    { day: "Monday", exercises: [{ name: "Push Ups", sets: 3, reps: 15 }], completed: true },
    { day: "Tuesday", exercises: [{ name: "Squats", sets: 3, reps: 20 }], completed: false },
    { day: "Wednesday", exercises: [{ name: "Plank", sets: 2, reps: 60 }], completed: true },
    { day: "Thursday", exercises: [{ name: "Lunges", sets: 3, reps: 12 }], completed: false },
    { day: "Friday", exercises: [{ name: "Jumping Jacks", sets: 3, reps: 30 }], completed: false },
    { day: "Saturday", exercises: [{ name: "Burpees", sets: 3, reps: 10 }], completed: true },
    { day: "Sunday", exercises: [{ name: "Rest Day", sets: 0, reps: 0 }], completed: true },
  ];

  useEffect(() => {
    const stored = localStorage.getItem("aiResult");
    if (stored) {
      const result = JSON.parse(stored);
      if (result.schedule && result.schedule.length > 0) {
        const scheduleWithCompletion = result.schedule.map((day: any) => ({
          ...day,
          completed: day.completed ?? false,
        }));
        setAiResult({ ...result, schedule: scheduleWithCompletion });
      } else {
        setAiResult({ schedule: dummySchedule });
      }
    } else {
      setAiResult({ schedule: dummySchedule });
    }
  }, []);

  // ✅ Add return statement
  if (!aiResult?.schedule) return <p className="p-6">No schedule available.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Real-Time Analytics</h1>
      <SmartScheduling schedule={aiResult.schedule} showProgress={true} />
    </div>
  );
};

export default Analytics;