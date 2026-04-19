import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { Link } from "react-router-dom";
import Footer from "@/components/ui/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";  // Badge theek hai
import { Progress } from "@/components/ui/progress"; // Progress sahi file se
import { Zap, Calendar, Dumbbell, ArrowLeft, Flame, TrendingUp, Timer, Target, Award, ChevronRight, Printer, Share2, MessageCircle, Twitter, Link as LinkIcon } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const reportRef = useRef<HTMLDivElement>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [weeklyData, setWeeklyData] = useState<{ day: string; workouts: number; calories: number }[]>([]);
  const [hasData, setHasData] = useState(false);
  const [goalData, setGoalData] = useState(goals);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("userData") || "{}");
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);

    // Get AI result from localStorage
    const aiResultStr = localStorage.getItem("aiResult");
    if (aiResultStr) {
      const aiResult = JSON.parse(aiResultStr);
      setHasData(true);
      if (aiResult?.schedule) {
        const data = aiResult.schedule.map((day: any) => {
          const exercises = day.exercises ?? [];

          const workouts = exercises.filter((ex: any) => ex.completed).length;

          const calories = exercises
            .filter((ex: any) => ex.completed)
            .reduce((sum: number, ex: any) => {
              return sum + (ex.sets || 0) * (ex.reps || 0) * 5;
            }, 0);

          return { day: day.day, workouts, calories };
        });
        setWeeklyData(data);

        const weeklyWorkouts = data.reduce((sum, d) => {
          return sum + d.workouts;
        }, 0);
        const totalCalories = data.reduce((sum, d) => sum + d.calories, 0);

        setGoalData([
          { ...goals[0], current: weeklyWorkouts },
          { ...goals[1], current: totalCalories },
          { ...goals[2], current: weeklyWorkouts * 30 }, // example: 30 min per workout
          { ...goals[3], current: Math.floor(weeklyWorkouts / 2) }, // example: half of workouts are strength
        ]);
      }
    } else {
      setHasData(false);
    }
  }, []);

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`Check out my latest AI-powered fitness report on FitAI! ${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(`Check out my latest AI-powered fitness report on FitAI!`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link.");
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: "My Fitness Report",
        text: "Check out my latest AI-powered fitness report on FitAI!",
        url: window.location.href,
      });
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareImage = async () => {
    if (!reportRef.current) return;

    const toastId = toast.loading("Preparing image...");

    try {
      await new Promise((r) => setTimeout(r, 500)); // 👈 IMPORTANT FIX

      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: "#0a0a0a",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `FitAI-Report-${new Date().toLocaleDateString()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Image downloaded!", { id: toastId });
    } catch (err) {
      toast.error("Failed to generate image.", { id: toastId });
    }
  };

  const handleDownloadImage = async () => {
    if (!reportRef.current) return;

    const toastId = toast.loading("Preparing image...");

    try {
      // ⬅️ IMPORTANT: wait for layout + animations
      await new Promise((r) => setTimeout(r, 600));
      await new Promise((r) => requestAnimationFrame(() => r(null)));

      // ⬅️ FIX: proper stable capture settings
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: "#0a0a0a", // FIXED (no CSS variable issue)
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        scrollY: -window.scrollY, // FIX: prevents cut content
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
      });

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );

      if (!blob) throw new Error("Image generation failed");

      const file = new File([blob], "FitAI-Report.png", {
        type: "image/png",
      });

      // ✅ Mobile native share
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "My Fitness Report",
          text: "Check out my AI fitness report!",
        });

        toast.success("Shared successfully!", { id: toastId });
        return;
      }

      // 🟡 Desktop fallback → download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `FitAI-Report-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      toast.success("Image downloaded!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate image. Try again.", { id: toastId });
    }
  };

  const copyImageToClipboard = async () => {
    if (!reportRef.current) return;
    const toastId = toast.loading("Copying image...");
    try {
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: "hsl(var(--background))",
        scale: 2,
        useCORS: true,
      });
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Failed to create blob");

      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob })
      ]);
      toast.success("Image copied! Paste it in your chat.", { id: toastId });
    } catch (err) {
      toast.error("Failed to copy image. Try downloading instead.", { id: toastId });
    }
  };


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

      <div ref={reportRef} className="bg-background">
        {/* Header */}
        <section className="pt-32 pb-12">
          <div className="mx-auto max-w-7xl px-6">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Badge variant="secondary" className="mb-4">
                <Flame className="w-3 h-3 mr-1" /> Personalized Training Report
              </Badge>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading leading-tight">
                    Your Fitness <span className="text-gradient">Performance Report</span>
                  </h1>
                  <p className="text-muted-foreground mt-4 text-lg max-w-2xl">
                    Analyze your progress, track your consistency, and celebrate your achievements with your personalized AI-generated report.
                  </p>
                </div>
                <div className="flex gap-3 shrink-0 no-print">
                  <Button variant="outline" size="lg" onClick={handlePrint} className="h-12 px-6">
                    <Printer className="w-4 h-4 mr-2" /> Print
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="lg" className="h-12 px-6 hover:bg-primary/5 hover:text-primary transition-colors">
                        <Share2 className="w-4 h-4 mr-2" /> Share
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={shareToWhatsApp} className="cursor-pointer">
                        <MessageCircle className="w-4 h-4 mr-2 text-green-500" /> WhatsApp (Link)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleShareImage} className="cursor-pointer">
                        <Share2 className="w-4 h-4 mr-2 text-primary" /> Share as Image
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDownloadImage} className="cursor-pointer">
                        <Printer className="w-4 h-4 mr-2 text-primary" /> Download Image
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={copyToClipboard} className="cursor-pointer">
                        <LinkIcon className="w-4 h-4 mr-2" /> Copy Link
                      </DropdownMenuItem>
                      {navigator.share && (
                        <DropdownMenuItem onClick={handleShare} className="cursor-pointer">
                          <Share2 className="w-4 h-4 mr-2" /> System Share
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
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

            {!hasData ? (
              <Card className="bg-card/50 border-border/50 p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Target className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold font-heading">No Report Data Yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Create your first AI workout plan to see your performance metrics and goal progress here.
                  </p>
                  <Button asChild className="mt-4 glow-primary">
                    <Link to="/">Create Your Plan</Link>
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Flame, label: "Workouts", value: weeklyData.reduce((sum, d) => sum + d.workouts, 0) },
                    { icon: Zap, label: "Calories", value: weeklyData.reduce((sum, d) => sum + d.calories, 0) },
                    { icon: Timer, label: "Duration", value: weeklyData.reduce((sum, d) => sum + d.workouts, 0) * 30 + " min" },
                    { icon: Target, label: "Goal Hit", value: Math.min(100, Math.round((weeklyData.reduce((sum, d) => sum + d.workouts, 0) / (goals[0].target || 1)) * 100)) + "%" },
                  ].map((stat, i) => (
                    <motion.div key={stat.label} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                      <Card className="bg-card/50 border-border/50 h-full">
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

                {/* Recharts Bar Chart */}
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
                  <Card className="bg-card/50 border-border/50 h-full overflow-hidden">
                    <CardHeader>
                      <CardTitle className="text-lg font-heading">Weekly Calorie Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px] pt-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                          <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                          />
                          <YAxis hide />
                          <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                            }}
                          />
                          <Bar
                            dataKey="calories"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                          >
                            {weeklyData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.calories > 0 ? 'hsl(var(--primary))' : 'rgba(255,255,255,0.1)'}
                                fillOpacity={0.8}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            )}

            {/* Goals & Achievements */}
            {hasData && (
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
            )}
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
      </div>

      <Footer />
    </div>
  );
};

export default Report;