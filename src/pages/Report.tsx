import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "@/components/ui/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";  // Badge theek hai
import { Progress } from "@/components/ui/progress"; // Progress sahi file se
import { Zap, Calendar, Dumbbell, ArrowLeft, Flame, TrendingUp, Timer, Target, Award, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import SmartScheduling from "@/components/SmartScheduling";

const goals = [
  { label: "Weekly Workouts", target: 5, unit: "sessions", current: 0 },
  { label: "Calories Burned", target: 3000, unit: "kcal", current: 0 },
  { label: "Active Minutes", target: 350, unit: "min", current: 0 },
  { label: "Strength Sessions", target: 4, unit: "sessions", current: 0 },
];

const achievements = [
  { icon: Flame, title: "5-Day Streak", description: "Completed 5 workouts this week" },
  { icon: TrendingUp, title: "Personal Best", description: "New deadlift PR: 120kg" },
  { icon: Award, title: "Consistency King", description: "4 weeks of 5+ workouts" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const Report = () => {
  const [user, setUser] = useState<any>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [weeklyData, setWeeklyData] = useState<{ day: string; workouts: number; calories: number }[]>([]);
  const [goalData, setGoalData] = useState(goals);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("userData") || "{}");
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setUser(storedUser);
    setIsLoggedIn(loggedIn);

    // Get AI result from localStorage
    const aiResult = JSON.parse(localStorage.getItem("aiResult") || "{}");

    if (aiResult?.schedule) {
      const data = aiResult.schedule.map((day: any) => {
        const workouts = day.exercises.length;
        const calories = day.exercises.reduce((sum: number, ex: any) => sum + ex.sets * ex.reps * 5, 0); // Example calories
        return { day: day.day, workouts, calories };
      });
      setWeeklyData(data);

      // Update goals dynamically
      const weeklyWorkouts = data.reduce((sum, d) => sum + d.workouts, 0);
      const totalCalories = data.reduce((sum, d) => sum + d.calories, 0);

      setGoalData([
        { ...goals[0], current: weeklyWorkouts },
        { ...goals[1], current: totalCalories },
        { ...goals[2], current: weeklyWorkouts * 30 }, // example: 30 min per workout
        { ...goals[3], current: Math.floor(weeklyWorkouts / 2) }, // example: half of workouts are strength
      ]);
    }
  }, []);

  const maxCalories = Math.max(...weeklyData.map((d) => d.calories), 1);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 glow-primary">
              <Dumbbell className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold font-heading">FitAI</span>
          </Link>
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Home
            </Link>
          </Button>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-32 pb-12">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge variant="secondary" className="mb-4">
              <Zap className="w-3 h-3 mr-1" /> 2026 Industry Report
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading leading-tight">
              AI Fitness <span className="text-gradient">Technology Report</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Weekly Performance */}
      <section className="pb-12">
        <div className="mx-auto max-w-7xl px-6">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl font-bold font-heading mb-6"
          >
            Your Weekly Performance
          </motion.h2>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Flame, label: "Workouts", value: weeklyData.reduce((sum, d) => sum + d.workouts, 0) },
                { icon: Zap, label: "Calories", value: weeklyData.reduce((sum, d) => sum + d.calories, 0) },
                { icon: Timer, label: "Duration", value: weeklyData.reduce((sum, d) => sum + d.workouts, 0) * 30 + " min" },
                { icon: Target, label: "Goal Hit", value: Math.min(100, Math.round((weeklyData.reduce((sum, d) => sum + d.workouts, 0) / goals[0].target) * 100)) + "%" },
              ].map((stat, i) => (
                <motion.div key={stat.label} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                  <Card className="bg-card/50 border-border/50">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
                          <stat.icon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm text-muted-foreground">{stat.label}</span>
                      </div>
                      <div className="text-2xl font-bold font-heading">{stat.value}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Bar Chart */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
              <Card className="bg-card/50 border-border/50 h-full">
                <CardHeader>
                  <CardTitle className="text-lg font-heading">Calories Burned This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between gap-3 h-48">
                    {weeklyData.map((d) => (
                      <div key={d.day} className="flex flex-col items-center gap-2 flex-1">
                        <span className="text-xs text-muted-foreground">{d.calories || "—"}</span>
                        <div
                          className="w-full rounded-t-md bg-primary/20 relative overflow-hidden"
                          style={{ height: `${(d.calories / maxCalories) * 100}%`, minHeight: d.calories ? 8 : 2 }}
                        >
                          <div className="absolute inset-0 bg-primary/60 rounded-t-md" />
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">{d.day}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Goals & Achievements */}
          <div className="grid lg:grid-cols-2 gap-6 mt-6">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
              <Card className="bg-card/50 border-border/50 h-full">
                <CardHeader>
                  <CardTitle className="text-lg font-heading">Goal Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {goalData.map((goal) => {
                    const pct = Math.min((goal.current / goal.target) * 100, 100);
                    return (
                      <div key={goal.label}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-foreground font-medium">{goal.label}</span>
                          <span className="text-muted-foreground">
                            {goal.current}/{goal.target} {goal.unit}
                          </span>
                        </div>
                        <Progress value={pct} className="h-2" />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
              <Card className="bg-card/50 border-border/50 h-full">
                <CardHeader>
                  <CardTitle className="text-lg font-heading">Achievements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {achievements.map((a) => (
                    <div key={a.title} className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 shrink-0">
                        <a.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold font-heading">{a.title}</h3>
                        <p className="text-sm text-muted-foreground">{a.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="relative rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-12 sm:p-16 text-center overflow-hidden"
          >
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold font-heading">
                Experience AI-Powered <span className="text-gradient">Training</span>
              </h2>

              <p className="mt-4 text-muted-foreground max-w-lg mx-auto text-lg">
                Join the next generation of fitness. Get a personalized AI workout plan built from the latest research and technology.
              </p>

              <div className="mt-8">
                <Button size="lg" asChild className="glow-primary-strong text-base h-13 px-10 font-semibold">
                  <Link
                    to={isLoggedIn ? "/" : "/signup"} // login -> dashboard, else signup
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  >
                    {isLoggedIn ? "View AI Plan" : "Start Your AI Plan"}
                    {!isLoggedIn && <ChevronRight className="w-4 h-4 ml-1" />}
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>



      <Footer />
    </div>
  );
};

export default Report;