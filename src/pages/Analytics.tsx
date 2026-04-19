import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import {
  TrendingUp, CheckCircle2, Calendar, Target,
  Flame, Zap, Brain, ChevronRight, Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
const Analytics = () => {
  const [aiResult, setAiResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showPlan, setShowPlan] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("aiResult");
    if (stored) {
      const result = JSON.parse(stored);
      const scheduleWithCompletion = result.schedule.map((day: any) => ({
        ...day,
        exercises: day.exercises.map((ex: any) => ({
          ...ex,
          completed: ex.completed ?? false,
        })),
      }));
      setAiResult({ ...result, schedule: scheduleWithCompletion });
    }
  }, []);

  if (!aiResult?.schedule) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-4">
        <div className="p-4 rounded-full bg-primary/10 text-primary">
          <Target size={48} />
        </div>
        <h2 className="text-2xl font-bold">No Analytics Data Yet</h2>
        <p className="text-muted-foreground max-w-md">
          Start your fitness journey by creating a personalized workout plan. Once you start tracking, your progress will appear here.
        </p>
        <Button onClick={() => window.location.href = "/"}>Get Started</Button>
      </div>
    );
  }

  // Data Calculations
  const totalExercises = aiResult.schedule.flatMap((d) => d.exercises).length;
  const completedExercises = aiResult.schedule
    .flatMap((d) => d.exercises)
    .filter((e) => e.completed).length;
  const progressPercent = totalExercises === 0 ? 0 : Math.round((completedExercises / totalExercises) * 100);

  const chartData = aiResult.schedule.map((day: any, index: number) => ({
    name: `Day ${index + 1}`,
    completed: day.exercises.filter((ex: any) => ex.completed).length,
    total: day.exercises.length,
  }));

  const pieData = [
    { name: 'Completed', value: completedExercises, color: '#10b981' },
    { name: 'Remaining', value: totalExercises - completedExercises, color: '#3b82f6' },
  ];

  const getConsistencyLabel = (percent: number) => {
    if (percent >= 80) return { label: "Elite", color: "text-emerald-500", icon: <Flame className="w-5 h-5" /> };
    if (percent >= 50) return { label: "Steady", color: "text-blue-500", icon: <Zap className="w-5 h-5" /> };
    return { label: "Starting", color: "text-orange-500", icon: <TrendingUp className="w-5 h-5" /> };
  };

  const consistency = getConsistencyLabel(progressPercent);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 pb-20"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Badge variant="outline" className="mb-2 border-primary/30 text-primary">
            Performance Dashboard
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight">Fitness Analytics</h1>
          <p className="text-muted-foreground mt-1">Track your progress and stay motivated with AI insights.</p>
        </div>
        <div className="flex items-center gap-2 bg-card border rounded-lg p-2 shadow-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Last 7 Days</span>
        </div>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Days", value: aiResult.schedule.length, icon: Calendar, color: "text-blue-500", bg: "bg-blue-500/10" },
          { title: "Exercises", value: totalExercises, icon: Target, color: "text-purple-500", bg: "bg-purple-500/10" },
          { title: "Completed", value: completedExercises, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { title: "Progress", value: `${progressPercent}%`, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="overflow-hidden border-none shadow-md bg-card/50 backdrop-blur-sm border border-border/50">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                    <h3 className="text-3xl font-bold mt-1">{stat.value}</h3>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                    <stat.icon size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Activity Chart */}
        <Card className="lg:col-span-2 shadow-xl border-none bg-card/50 backdrop-blur-md">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Activity Trend</CardTitle>
                <CardDescription>Exercise completion per day</CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-none">Completed</Badge>
                <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-none">Planned</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" fillOpacity={0} strokeWidth={2} />
                <Area type="monotone" dataKey="completed" stroke="#10b981" fillOpacity={1} fill="url(#colorCompleted)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AI Insight & Score */}
        <div className="space-y-6">
          <Card className="shadow-xl border-none bg-gradient-to-br from-primary/10 via-card to-card overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Brain size={80} className="text-primary" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <div className="relative">
                  <Brain className="w-5 h-5 text-primary" />
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                </div>
                AI Coach Insight
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-primary/20">
                {progressPercent < 30 ? (
                  <p className="text-sm leading-relaxed">
                    You're off to a slow start. <span className="text-primary font-bold">Don't lose momentum!</span> Even 10 minutes of light activity counts toward your goal.
                  </p>
                ) : progressPercent < 70 ? (
                  <p className="text-sm leading-relaxed">
                    Great progress! You're <span className="text-primary font-bold">building a solid habit.</span> Consistency is key—try to hit 80% completion this week.
                  </p>
                ) : (
                  <p className="text-sm leading-relaxed">
                    <span className="text-primary font-bold">Absolutely crushing it!</span> Your consistency is in the top 5% of users. Ready to increase the intensity?
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                className="w-full justify-between"
                onClick={() => setShowPlan(!showPlan)}
              >
                {showPlan ? "Hide Plan" : "See Detailed Plan"}
              </Button>
            </CardContent>
          </Card>


          <Card className="shadow-xl border-none bg-card/50 backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Consistency Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-full bg-background border ${consistency.color}`}>
                    {consistency.icon}
                  </div>
                  <div>
                    <p className="text-2xl font-black">{consistency.label}</p>
                    <p className="text-xs text-muted-foreground uppercase">Current Level</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">{progressPercent}%</p>
                </div>
              </div>
              <Progress value={progressPercent} className="h-2 mb-2" />
              <p className="text-[10px] text-muted-foreground text-center uppercase tracking-widest font-bold">
                Level up at 80% completion
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Weekly Highlights Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="shadow-lg border-none bg-card/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Workout Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full h-[200px] max-w-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 w-full">
              <div className="flex justify-between items-center border-b border-border/50 pb-2">
                <span className="text-sm text-muted-foreground">Rest Days</span>
                <span className="font-bold">
                  {aiResult.schedule.filter(day => day.exercises.some(ex => ex.name.toLowerCase().includes("rest"))).length}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-border/50 pb-2">
                <span className="text-sm text-muted-foreground">Avg Exercises / Day</span>
                <span className="font-bold">
                  {Math.round(totalExercises / aiResult.schedule.length)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Sessions</span>
                <span className="font-bold">{aiResult.schedule.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-none bg-card/50 backdrop-blur-md overflow-hidden relative">
          <div className="absolute inset-0 bg-primary/5 opacity-50 pointer-events-none"></div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" />
              Quick Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {[
                "Hydration increases performance by up to 25%.",
                "Recovery is just as important as the workout itself.",
                "Small daily wins lead to massive long-term results."
              ].map((tip, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
            <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-primary">Next Milestone</span>
              <span className="text-xs font-black">Day 7 Challenge</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {showPlan && (
        <div className="mt-10 p-6 rounded-2xl bg-card border shadow-lg">
          <h2 className="text-2xl font-bold mb-6">🏋️ Full Workout Plan</h2>

          {aiResult.schedule.map((day: any, index: number) => (
            <div key={index} className="mb-6">
              <h3 className="font-semibold text-primary mb-2">
                Day {index + 1}
              </h3>

              <ul className="space-y-2">
                {day.exercises.map((ex: any, i: number) => (
                  <li
                    key={i}
                    className="flex justify-between bg-muted p-3 rounded-lg"
                  >
                    <span>{ex.name}</span>

                    {!ex.name.toLowerCase().includes("rest") && (
                      <span className="text-sm text-muted-foreground">
                        {ex.sets} × {ex.reps}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Analytics;
