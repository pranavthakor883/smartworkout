import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

// ✅ Example motivational content per goal
const motivationalContentMap: Record<string, { type: string; content: string; link?: string }[]> = {
  muscle_gain: [
    { type: "tip", content: "Protein timing matters for muscle gain — consume protein within 30 mins post-workout." },
    { type: "quote", content: "Strength does not come from physical capacity. It comes from an indomitable will." },
    { type: "video", content: "Muscle Recovery Tips", link: "https://www.youtube.com/watch?v=abc123" },
  ],
  weight_loss: [
    { type: "tip", content: "High-intensity interval training burns more calories in less time." },
    { type: "quote", content: "Don’t let a bad day turn into a bad week." },
    { type: "video", content: "Fat Burning Workouts", link: "https://www.youtube.com/watch?v=def456" },
  ],
  endurance: [
    { type: "tip", content: "Consistency is key — gradually increase your distance and intensity." },
    { type: "quote", content: "The body achieves what the mind believes." },
    { type: "video", content: "Endurance Training Guide", link: "https://www.youtube.com/watch?v=ghi789" },
  ],
  default: [
    { type: "tip", content: "Regular activity keeps both mind and body healthy." },
  ],
};

const GoalPlan = () => {
  const [goal, setGoal] = useState("");

  useEffect(() => {
    const updateGoal = () => {
      const user = JSON.parse(localStorage.getItem("userData") || "{}");
      console.log("GoalPlan: fetched from localStorage ->", user.fitnessGoal);
      setGoal(user.fitnessGoal || "weight_loss");
    };

    updateGoal();
    window.addEventListener("storageUpdated", updateGoal);

    return () => window.removeEventListener("storageUpdated", updateGoal);
  }, []);

  const getExercises = () => {
    switch (goal) {
      case "muscle_gain":
        return ["Bench Press", "Squats", "Deadlift", "Pull Ups"];
      case "weight_loss":
        return ["Jumping Jacks", "Burpees", "Mountain Climbers", "Running"];
      case "endurance":
        return ["Cycling", "Running", "Swimming", "Jump Rope"];
      default:
        return ["Pushups", "Plank", "Squats", "Stretching"];
    }
  };

  const motivationalContent = motivationalContentMap[goal] || motivationalContentMap.default;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-xl w-full space-y-6">
        <CardContent className="p-8">
          <h1 className="text-3xl font-bold mb-4">Your Goal Plan</h1>

          <p className="mb-6">
            Current Goal:
            <span className="text-primary font-semibold ml-2">
              {goal.replace(/_/g, " ")}
            </span>
          </p>

          <h3 className="font-semibold mb-3">Recommended Exercises</h3>
          <ul className="list-disc ml-6 space-y-2">
            {getExercises().map((ex, i) => (
              <li key={i}>{ex}</li>
            ))}
          </ul>

          <h3 className="font-semibold mt-6 mb-3">Motivation & Tips</h3>
          <ul className="space-y-2">
            {motivationalContent.map((item, i) => (
              <li key={i} className="p-2 border rounded">
                {item.type === "tip" && <p>💡 {item.content}</p>}
                {item.type === "quote" && <p>🗣 "{item.content}"</p>}
                {item.type === "video" && (
                  <p>
                    🎥 <a href={item.link} target="_blank" className="text-blue-500 underline">{item.content}</a>
                  </p>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoalPlan;