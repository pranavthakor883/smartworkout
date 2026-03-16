import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import SmartScheduling from "@/components/SmartScheduling";

const AIPlan = () => {
  const [aiResult, setAiResult] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("aiResult");
    if (data) {
      setAiResult(JSON.parse(data));
    }
  }, []);

  if (!aiResult) {
    return <p className="text-center mt-20">No AI Plan generated</p>;
  }

  return (
    <div className="max-w-5xl mx-auto mt-24 px-6">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">AI Fitness Plan</h2>

          <p>Fitness Level: {aiResult.fitness_level}</p>
          <p>Workout Time: {aiResult.recommended_workout} minutes</p>

          {aiResult.schedule && (
            <SmartScheduling schedule={aiResult.schedule} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIPlan;