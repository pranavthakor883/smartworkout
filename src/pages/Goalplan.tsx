import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Dumbbell, Flame, PlayCircle, Quote, Lightbulb, Activity, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const exerciseDescriptions: Record<string, string> = {
    "Bench Press": "Lie on a flat bench, grip the barbell slightly wider than shoulder-width. Lower the bar to your mid-chest, then push it back up until your arms are fully extended. Focus on squeezing your chest muscles.",
    "Squats": "Stand with feet shoulder-width apart. Lower your hips back and down as if sitting in a chair, keeping your chest up and knees behind your toes. Push through your heels to return to the starting position.",
    "Deadlift": "Stand with your mid-foot under the barbell. Bend over and grab the bar with a shoulder-width grip. Bend your knees until your shins touch the bar. Lift your chest up and straighten your lower back, then stand up with the weight.",
    "Pull Ups": "Grab the pull-up bar with your palms facing away from you. Hang freely, then pull yourself up until your chin clears the bar. Lower yourself down under control.",
    "Jumping Jacks": "Start standing with your legs together and arms at your sides. Jump up, spreading your legs and raising your arms above your head. Jump back to the starting position.",
    "Burpees": "Start in a standing position. Drop into a squat, kick your feet back into a plank, do a pushup, jump your feet back to the squat, and leap up into the air with your hands reaching up.",
    "Mountain Climbers": "Start in a high plank position. Drive your right knee toward your chest, then quickly switch legs, driving your left knee forward while extending the right leg back. Keep your core tight.",
    "Running": "Maintain a steady pace. Keep your posture upright, swing your arms naturally, and land softly on your midfoot.",
    "Cycling": "Maintain a smooth pedaling motion. Adjust the resistance to match your desired intensity and keep a straight posture.",
    "Swimming": "Use a combination of freestyle, breaststroke, and backstroke to work different muscle groups. Focus on rhythmic breathing.",
    "Jump Rope": "Hold the handles firmly. Swing the rope over your head and jump slightly as it passes under your feet. Land softly on the balls of your feet.",
    "Pushups": "Start in a high plank position. Lower your body until your chest nearly touches the floor, keeping your elbows tucked close to your body. Push back up to the starting position.",
    "Plank": "Hold a pushup position resting on your forearms instead of your hands. Keep your body in a straight line from head to heels and engage your core tightly.",
    "Stretching": "Hold each stretch for 15-30 seconds. Do not bounce. Breathe deeply and try to relax into the stretch to improve flexibility."
};



const motivationalContentMap: Record<string, { type: string; content: string; author?: string; link?: string }[]> = {
  muscle_gain: [
    { type: "tip", content: "Protein timing matters for muscle gain — consume protein within 30 mins post-workout." },
    { type: "quote", content: "Strength does not come from physical capacity. It comes from an indomitable will.", author: "Mahatma Gandhi" },
    { type: "video", content: "Muscle Recovery & Hypertrophy Tips", link: "https://www.youtube.com/watch?v=abc123" },
  ],
  weight_loss: [
    { type: "tip", content: "High-intensity interval training (HIIT) burns more calories in less time." },
    { type: "quote", content: "Don’t let a bad day turn into a bad week.", author: "Anonymous" },
    { type: "video", content: "15-Min Fat Burning Workouts", link: "https://www.youtube.com/watch?v=def456" },
  ],
  endurance: [
    { type: "tip", content: "Consistency is key — gradually increase your distance and intensity by 10% per week." },
    { type: "quote", content: "The body achieves what the mind believes.", author: "Napoleon Hill" },
    { type: "video", content: "Endurance & Stamina Training Guide", link: "https://www.youtube.com/watch?v=ghi789" },
  ],
  default: [
    { type: "tip", content: "Regular activity keeps both mind and body healthy." },
    { type: "quote", content: "The hardest lift of all is lifting your butt off the couch.", author: "Unknown" }
  ],
};

const GoalPlan = () => {
  const [goal, setGoal] = useState("");
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null);

  useEffect(() => {
    const updateGoal = () => {
      const user = JSON.parse(localStorage.getItem("userData") || "{}");
      setGoal(user.fitnessGoal || user.goal || "weight_loss");
    };

    updateGoal();
    window.addEventListener("storageUpdated", updateGoal);
    return () => window.removeEventListener("storageUpdated", updateGoal);
  }, []);

  const getExercises = () => {
    const goalLower = goal.toLowerCase();
    if (goalLower.includes("muscle")) return ["Bench Press", "Squats", "Deadlift", "Pull Ups"];
    if (goalLower.includes("weight") || goalLower.includes("loss") || goalLower.includes("fat")) return ["Jumping Jacks", "Burpees", "Mountain Climbers", "Running"];
    if (goalLower.includes("endurance") || goalLower.includes("stamina")) return ["Cycling", "Running", "Swimming", "Jump Rope"];
    return ["Pushups", "Plank", "Squats", "Stretching"];
  };

  const getGoalIcon = () => {
      const goalLower = goal.toLowerCase();
      if (goalLower.includes("muscle")) return <Dumbbell className="w-8 h-8 text-blue-500" />;
      if (goalLower.includes("weight") || goalLower.includes("loss")) return <Flame className="w-8 h-8 text-orange-500" />;
      return <Activity className="w-8 h-8 text-emerald-500" />;
  };

  const formattedGoalName = goal.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "General Fitness";
  const exercises = getExercises();
  const motivationalContent = motivationalContentMap[goal.toLowerCase()] || motivationalContentMap.default;

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
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
        className="max-w-6xl mx-auto space-y-12"
      >
        {/* Header */}
        <motion.div variants={item} className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-6 ring-8 ring-primary/5">
                <Target className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6">Your Path to <span className="text-primary">{formattedGoalName}</span></h1>
            <p className="text-xl text-muted-foreground">We've tailored a specific strategy, exercises, and motivation to help you crush your goal.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Recommended Exercises */}
            <motion.div variants={item} className="lg:col-span-2 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                    {getGoalIcon()}
                    <h2 className="text-2xl font-bold font-heading">Core Exercises for Your Goal</h2>
                </div>
                
                <div className="flex flex-col gap-3">
                    {exercises.map((ex, i) => {
                        const isExpanded = expandedExercise === i;
                        return (
                        <Card 
                            key={i} 
                            className="border-border/50 hover:border-primary/50 transition-all shadow-sm bg-card cursor-pointer overflow-hidden"
                            onClick={() => setExpandedExercise(isExpanded ? null : i)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 font-bold font-heading text-lg">
                                        {String(i + 1).padStart(2, '0')}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg font-heading">{ex}</h3>
                                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 mt-0.5">
                                            <Activity className="w-3 h-3" /> Focus: {formattedGoalName}
                                        </span>
                                    </div>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isExpanded ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                                        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                                            <ChevronDown className="w-4 h-4" />
                                        </motion.div>
                                    </div>
                                </div>
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                            animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
                                                <p className="text-sm text-foreground leading-relaxed">
                                                    {exerciseDescriptions[ex] || "Follow proper form and technique for this exercise to maximize benefits and avoid injury."}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </CardContent>
                        </Card>
                    )})}
                </div>
            </motion.div>

            {/* Right Column: Motivation & Tips */}
            <motion.div variants={item} className="lg:col-span-1 space-y-6">
                <h2 className="text-2xl font-bold font-heading mb-6 flex items-center gap-2">
                    <Lightbulb className="w-6 h-6 text-yellow-500" />
                    Expert Advice
                </h2>

                <div className="space-y-4">
                    {motivationalContent.map((content, i) => {
                        if (content.type === "tip") {
                            return (
                                <Card key={i} className="border-l-4 border-l-yellow-500 border-border/50 bg-yellow-500/5 shadow-sm">
                                    <CardContent className="p-5">
                                        <div className="flex gap-3">
                                            <Lightbulb className="w-5 h-5 text-yellow-600 shrink-0" />
                                            <p className="text-sm font-medium leading-relaxed">{content.content}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        }
                        if (content.type === "quote") {
                            return (
                                <Card key={i} className="border-border/50 bg-card shadow-sm">
                                    <CardContent className="p-6 relative">
                                        <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10" />
                                        <p className="text-lg italic font-medium leading-relaxed mb-4 text-foreground/90">"{content.content}"</p>
                                        <p className="text-sm font-bold text-primary">— {content.author}</p>
                                    </CardContent>
                                </Card>
                            )
                        }
                        if (content.type === "video") {
                            return (
                                <a key={i} href={content.link} target="_blank" rel="noreferrer" className="block">
                                    <Card className="border-border/50 bg-card shadow-sm hover:border-primary/50 transition-colors group cursor-pointer">
                                        <CardContent className="p-4 flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500 transition-colors">
                                                <PlayCircle className="w-6 h-6 text-red-500 group-hover:text-white transition-colors" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">Recommended Watch</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">{content.content}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </a>
                            )
                        }
                    })}
                </div>
            </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default GoalPlan;