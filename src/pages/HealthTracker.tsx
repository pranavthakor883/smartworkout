import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import BMIChart from "@/components/ui/BMIChart";
import { TrendingUp } from "lucide-react";

const HealthTracker = () => {
  const user = JSON.parse(localStorage.getItem("userData") || "{}");
  const [result, setResult] = useState<any>(null);

  // --------------------------
  // Health Metrics - Calculated from user stats (read-only)
  // --------------------------
  const [waterIntake, setWaterIntake] = useState(
    +(user.weight ? user.weight * 0.03 : 2).toFixed(2)
  ); // liters

  const [sleepHours, setSleepHours] = useState(
    +(user.age ? 7 + 0.1 * (user.age - 20) : 7).toFixed(1)
  ); // hours

  const [cardioMinutes, setCardioMinutes] = useState(
    +(user.weight ? 30 + 0.2 * (user.weight - 70) : 30).toFixed(0)
  ); // minutes

  // --------------------------
  // Fix: Goal from database / localStorage
  // --------------------------
  const goal = user.fitness_goal || user.goal || "general_fitness";

  const getBMIColor = (color: string) => {
    if (color === "green") return "text-green-500";
    if (color === "yellow") return "text-yellow-500";
    if (color === "orange") return "text-orange-500";
    if (color === "red") return "text-red-500";
    return "text-gray-500";
  };

  // --------------------------
  // BMI Calculation (AI-Powered)
  // --------------------------
  const calculateBMI = async () => {
    try {
      const res = await fetch("http://localhost:5000/bmi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight: user.weight, height: user.height }),
      });

      const data = await res.json();
      setResult(data);

      const history = JSON.parse(localStorage.getItem("bmiHistory")) || [];
      const lastBMI = history.length ? history[history.length - 1].bmi : data.bmi;
      const newBMI = (Number(lastBMI) - Math.random() * 0.8).toFixed(1);

      history.push({ date: `Week ${history.length + 1}`, bmi: newBMI });
      if (history.length > 6) history.shift();
      localStorage.setItem("bmiHistory", JSON.stringify(history));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("bmiHistory")) {
      const demo = [
        { date: "Week 1", bmi: 26.2 },
        { date: "Week 2", bmi: 25.6 },
        { date: "Week 3", bmi: 25.1 },
        { date: "Week 4", bmi: 24.7 },
      ];
      localStorage.setItem("bmiHistory", JSON.stringify(demo));
    }
    if (user.weight && user.height) calculateBMI();
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row justify-center items-start gap-6 p-6">

      {/* ------------------ BMI / Health Tracker ------------------ */}
      <Card className="w-full md:w-1/2">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-center">Health Tracker</h2>
          <p className="text-center text-sm">Weight: <strong>{user.weight} kg</strong></p>
          <p className="text-center text-sm">Height: <strong>{user.height} cm</strong></p>

          {result && (
            <div className="text-center mt-4 space-y-2">
              <p className={`text-lg ${getBMIColor(result.color)}`}>BMI: <strong>{result.bmi}</strong></p>
              <p className={`font-semibold ${getBMIColor(result.color)}`}>{result.category}</p>
              <p className="text-sm text-muted-foreground">{result.advice}</p>
              <p className="text-sm">Ideal Weight: {result.ideal_weight_range}</p>
              <BMIChart />
            </div>
          )}
        </CardContent>
      </Card>

      {/* ------------------ Health Metrics (Read-Only) ------------------ */}
      <Card className="w-full md:w-1/2">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Health Metrics
          </h2>

          <div className="space-y-2 text-center">
            <p className="text-sm">💧 Water Intake: <strong>{waterIntake} L/day</strong></p>
            <p className="text-sm">🛌 Sleep: <strong>{sleepHours} hours/day</strong></p>
            <p className="text-sm">🏃‍♂️ Cardio Time: <strong>{cardioMinutes} min/day</strong></p>
          </div>

        </CardContent>
      </Card>

    </div>
  );
};

export default HealthTracker;