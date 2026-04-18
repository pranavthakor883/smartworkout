import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import BMIChart from "@/components/ui/BMIChart";
import { TrendingUp, Activity, Droplets, Moon, Timer, Scale, Info, HeartPulse } from "lucide-react";
import { motion } from "framer-motion";

const HealthTracker = () => {
  const user = JSON.parse(localStorage.getItem("userData") || "{}");
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --------------------------
  // Health Metrics - Calculated from user stats
  // --------------------------
  const waterIntake = +(user.weight ? user.weight * 0.03 : 2).toFixed(2); // liters
  const sleepHours = +(user.age ? 7 + 0.1 * (user.age - 20) : 7).toFixed(1); // hours
  const cardioMinutes = +(user.weight ? 30 + 0.2 * (user.weight - 70) : 30).toFixed(0); // minutes

  const getBMIColor = (color: string) => {
    if (color === "green") return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (color === "yellow") return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    if (color === "orange") return "text-orange-500 bg-orange-500/10 border-orange-500/20";
    if (color === "red") return "text-red-500 bg-red-500/10 border-red-500/20";
    return "text-primary bg-primary/10 border-primary/20";
  };

  // --------------------------
  // BMI Calculation (AI-Powered with Fallback)
  // --------------------------
  const calculateBMI = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/bmi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight: user.weight, height: user.height }),
      });

      if (!res.ok) throw new Error("Backend failed");
      const data = await res.json();
      setResult(data);

      const history = JSON.parse(localStorage.getItem("bmiHistory") || "[]");
      const lastBMI = history.length ? history[history.length - 1].bmi : data.bmi;
      const newBMI = (Number(lastBMI) - Math.random() * 0.8).toFixed(1);

      history.push({ date: `Week ${history.length + 1}`, bmi: newBMI });
      if (history.length > 6) history.shift();
      localStorage.setItem("bmiHistory", JSON.stringify(history));
    } catch (err) {
      console.error(err);
      // Fallback calculation if backend is down
      if (user.weight && user.height) {
        const heightM = user.height / 100;
        const bmi = (user.weight / (heightM * heightM)).toFixed(1);
        let category = "Normal";
        let color = "green";
        if (Number(bmi) < 18.5) { category = "Underweight"; color = "yellow"; }
        else if (Number(bmi) > 25) { category = "Overweight"; color = "orange"; }
        else if (Number(bmi) > 30) { category = "Obese"; color = "red"; }
        
        setResult({
            bmi,
            category,
            color,
            advice: "Maintain a balanced diet and regular exercise.",
            ideal_weight_range: `${(18.5 * heightM * heightM).toFixed(1)} - ${(24.9 * heightM * heightM).toFixed(1)} kg`
        });
      }
    } finally {
      setIsLoading(false);
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
    else setIsLoading(false);
  }, []);

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
        className="max-w-6xl mx-auto space-y-8"
      >
        {/* Header */}
        <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="text-4xl md:text-5xl font-bold font-heading flex items-center gap-3">
                    <HeartPulse className="w-10 h-10 text-primary" />
                    Health Dashboard
                </h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    Track your vital metrics and body composition in real-time.
                </p>
            </div>
            <div className="bg-card border border-border/50 px-6 py-3 rounded-full flex items-center gap-3 shadow-sm">
                <Scale className="w-5 h-5 text-primary" />
                <span className="font-semibold text-sm">
                    {user.weight ? `${user.weight}kg` : '--'} / {user.height ? `${user.height}cm` : '--'}
                </span>
            </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: BMI & Chart */}
            <motion.div variants={item} className="lg:col-span-2 space-y-8">
                <Card className="border-border/50 shadow-sm relative overflow-hidden bg-card hover:border-primary/30 transition-colors">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                    <CardContent className="p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <Activity className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-bold font-heading">Body Mass Index</h2>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center items-center h-40">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : result ? (
                            <div className="space-y-8">
                                <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
                                    <div className="text-center md:text-left">
                                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Current BMI</p>
                                        <div className="flex items-baseline gap-3 justify-center md:justify-start">
                                            <span className="text-6xl font-bold font-heading">{result.bmi}</span>
                                            <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getBMIColor(result.color)}`}>
                                                {result.category}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-secondary/30 p-5 rounded-2xl border border-border/50 max-w-sm flex-1">
                                        <div className="flex items-start gap-3">
                                            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-foreground leading-relaxed">{result.advice}</p>
                                                <div className="mt-3 pt-3 border-t border-border/50">
                                                    <p className="text-xs text-muted-foreground">Target Weight Range</p>
                                                    <p className="font-semibold text-primary">{result.ideal_weight_range}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">BMI Trend</h3>
                                    <div className="bg-background/50 rounded-2xl p-4 border border-border/30">
                                        <BMIChart />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted-foreground">Please update your profile with weight and height to see your BMI.</p>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Right Column: Daily Targets */}
            <motion.div variants={item} className="lg:col-span-1 space-y-6">
                <h3 className="text-xl font-bold font-heading mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Daily Targets
                </h3>

                {/* Water Card */}
                <Card className="border-border/50 shadow-sm bg-card hover:-translate-y-1 transition-all duration-300">
                    <CardContent className="p-6 flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0">
                            <Droplets className="w-7 h-7 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-muted-foreground mb-1">Water Intake</p>
                            <p className="text-2xl font-bold">{waterIntake} <span className="text-sm font-normal text-muted-foreground">Liters</span></p>
                        </div>
                    </CardContent>
                </Card>

                {/* Sleep Card */}
                <Card className="border-border/50 shadow-sm bg-card hover:-translate-y-1 transition-all duration-300">
                    <CardContent className="p-6 flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                            <Moon className="w-7 h-7 text-indigo-500" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-muted-foreground mb-1">Sleep Goal</p>
                            <p className="text-2xl font-bold">{sleepHours} <span className="text-sm font-normal text-muted-foreground">Hours</span></p>
                        </div>
                    </CardContent>
                </Card>

                {/* Cardio Card */}
                <Card className="border-border/50 shadow-sm bg-card hover:-translate-y-1 transition-all duration-300">
                    <CardContent className="p-6 flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center shrink-0">
                            <Timer className="w-7 h-7 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-muted-foreground mb-1">Active Cardio</p>
                            <p className="text-2xl font-bold">{cardioMinutes} <span className="text-sm font-normal text-muted-foreground">Mins</span></p>
                        </div>
                    </CardContent>
                </Card>

            </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default HealthTracker;