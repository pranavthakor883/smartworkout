import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import SmartScheduling from "@/components/SmartScheduling";
import { motion } from "framer-motion";
import { Brain, Activity, Clock, Target, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const AIPlan = () => {
  const [aiResult, setAiResult] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const data = localStorage.getItem("aiResult");
    if (data) {
      setAiResult(JSON.parse(data));
    }
  }, []);

  if (!aiResult) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground pt-20">
        <Brain className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-2xl font-bold mb-2">No Plan Found</h2>
        <p className="text-muted-foreground mb-6">Let's generate a personalized AI fitness plan for you.</p>
        <Button onClick={() => navigate("/")} className="glow-primary">Go to Home</Button>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-6">
      <motion.div 
        className="max-w-6xl mx-auto space-y-8"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Header Section */}
        <motion.div variants={item} className="relative rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-8 sm:p-12 overflow-hidden shadow-xl shadow-primary/5">
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-primary/20 rounded-xl">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold font-heading">Your AI Protocol</h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-xl">
                Generated dynamically based on your physical metrics, goals, and activity profile.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-background/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-primary/20 shadow-lg">
              <Activity className="w-6 h-6 text-primary" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Primary Focus</span>
                <span className="font-bold text-foreground capitalize">{aiResult.goal?.replace("_", " ") || "Fitness"}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card border-border/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
            <CardContent className="p-6 flex items-center gap-5">
              <div className="p-4 bg-primary/10 rounded-2xl">
                <Target className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Assessed Level</p>
                <p className="text-2xl font-bold capitalize">{aiResult.fitness_level}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
            <CardContent className="p-6 flex items-center gap-5">
              <div className="p-4 bg-primary/10 rounded-2xl">
                <Clock className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Daily Commitment</p>
                <p className="text-2xl font-bold">{aiResult.recommended_workout} <span className="text-lg text-muted-foreground font-normal">mins</span></p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
            <CardContent className="p-6 flex items-center gap-5">
              <div className="p-4 bg-primary/10 rounded-2xl">
                <Flame className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Intensity Profile</p>
                <p className="text-2xl font-bold capitalize">Optimized</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Schedule Section */}
        {aiResult.schedule && (
          <motion.div variants={item} className="space-y-6 pt-4">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-bold font-heading">Your Weekly Schedule</h2>
              <div className="h-px bg-border flex-1" />
            </div>
            <div className="bg-card border border-border rounded-3xl p-4 sm:p-6 shadow-xl shadow-black/5">
              <SmartScheduling schedule={aiResult.schedule} />
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default AIPlan;