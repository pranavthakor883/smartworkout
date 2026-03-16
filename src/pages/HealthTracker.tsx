import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import BMIChart from "@/components/ui/BMIChart";

const HealthTracker = () => {

  const user = JSON.parse(localStorage.getItem("userData") || "{}");
  console.log("USER DATA:", user);

  const [result, setResult] = useState<any>(null);
  const getBMIColor = (color) => {
    if (color === "green") return "text-green-500";
    if (color === "yellow") return "text-yellow-500";
    if (color === "orange") return "text-orange-500";
    if (color === "red") return "text-red-500";
    return "text-gray-500";
  };

  const calculateBMI = async () => {
    try {

      const res = await fetch("http://localhost:5000/bmi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          weight: user.weight,
          height: user.height
        })
      });

      const data = await res.json();

      console.log("BMI API RESPONSE:", data);

      setResult(data);
      const history = JSON.parse(localStorage.getItem("bmiHistory")) || [];

      const lastBMI = history.length ? history[history.length - 1].bmi : data.bmi;

     const newBMI = (Number(lastBMI) - Math.random() * 0.8).toFixed(1);

      history.push({
        date: `Week ${history.length + 1}`,
        bmi: newBMI
      });

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
        { date: "Week 4", bmi: 24.7 }
      ];

      localStorage.setItem("bmiHistory", JSON.stringify(demo));
    }

    if (user.weight && user.height) {
      calculateBMI();
    }
  }, []);

  return (
    <div className="min-h-screen flex justify-center items-center p-6">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-4">

          <h2 className="text-2xl font-bold text-center">
            Health Tracker
          </h2>

          <p className="text-center text-sm">
            Weight: <strong>{user.weight} kg</strong>
          </p>

          <p className="text-center text-sm">
            Height: <strong>{user.height} cm</strong>
          </p>

          {result && (
            <div className="text-center mt-4 space-y-2">

              <p className={`text-lg ${getBMIColor(result.color)}`}>
                BMI: <strong>{result.bmi}</strong>
              </p>

              <p className={`font-semibold ${getBMIColor(result.color)}`}>
                {result.category}
              </p>

              <p className="text-sm text-muted-foreground">
                {result.advice}
              </p>

              <p className="text-sm">
                Ideal Weight: {result.ideal_weight_range}
              </p>

              <BMIChart />

            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
};

export default HealthTracker;