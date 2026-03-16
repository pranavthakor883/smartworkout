import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

const GoalPlan = () => {

  const [goal,setGoal] = useState("");

  useEffect(()=>{

    const user = JSON.parse(localStorage.getItem("userData") || "{}");
    setGoal(user.fitness_goal || user.goal || "weight_loss");

  },[]);

  const getExercises = () => {

    switch(goal){

      case "muscle_gain":
        return ["Bench Press","Squats","Deadlift","Pull Ups"];

      case "weight_loss":
        return ["Jumping Jacks","Burpees","Mountain Climbers","Running"];

      case "endurance":
        return ["Cycling","Running","Swimming","Jump Rope"];

      default:
        return ["Pushups","Plank","Squats","Stretching"];

    }

  };

  return (

    <div className="min-h-screen flex items-center justify-center">

      <Card className="max-w-xl w-full">

        <CardContent className="p-8">

          <h1 className="text-3xl font-bold mb-4">
            Your Goal Plan
          </h1>

          <p className="mb-6">
            Current Goal :
            <span className="text-primary font-semibold ml-2">
              {goal.replace("_"," ")}
            </span>
          </p>

          <h3 className="font-semibold mb-3">
            Recommended Exercises
          </h3>

          <ul className="list-disc ml-6 space-y-2">

            {getExercises().map((ex,i)=>(
              <li key={i}>{ex}</li>
            ))}

          </ul>

        </CardContent>

      </Card>

    </div>

  );

};

export default GoalPlan;