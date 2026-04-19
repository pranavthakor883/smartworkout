import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

const AIInsight = ({ percent, goal }) => {
  const [insight, setInsight] = useState("Analyzing...");

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        const res = await fetch("http://localhost:5000/ai-insight", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            completion: percent,
            goal: goal,
          }),
        });

        const data = await res.json();
        setInsight(data.insight);
      } catch (err) {
        console.error(err);
        setInsight("Unable to fetch AI insight");
      }
    };

    if (percent !== undefined) {
      fetchInsight();
    }
  }, [percent, goal]);

  return (
    <Card className="mt-6 border-primary/30">
      <CardContent className="p-4">
        <h3 className="font-bold text-primary mb-2">🤖 AI Coach Insight</h3>
        <p className="text-sm">{insight}</p>
      </CardContent>
    </Card>
  );
};

export default AIInsight;