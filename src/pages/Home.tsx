import { useEffect, useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import Footer from "@/components/ui/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ChevronRight, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dumbbell,
  Brain,
  Target,
  TrendingUp,
  Users,
  BarChart3,
  Calendar,
  Menu,
  X,
} from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import SmartScheduling from "@/components/SmartScheduling";


const Home = () => {
  const [openProfile, setOpenProfile] = useState(false);
  const dropdownRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const user = JSON.parse(localStorage.getItem("userData") || "{}");
  const userName = user?.name || "";
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [goal, setGoal] = useState("weight_loss");
  const displayGoal: string = aiResult?.goal || goal || "your";
  const [activityLevel, setActivityLevel] = useState("sedentary");


  const navigate = useNavigate();


  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5 },
    }),
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenProfile(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    const userData = localStorage.getItem("userData");
    if (userData) {
      const user = JSON.parse(userData);

      setAge(user.age ? String(user.age) : "");
      setWeight(user.weight ? String(user.weight) : "");
      setHeight(user.height ? String(user.height) : "");
      setGoal(user.fitness_goal || user.goal || "weight_loss");
      setActivityLevel(user.activity_level || user.activityLevel || "sedentary");
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  // Ensure Goal-Oriented always gets a value
  const goalForCard = aiResult?.goal || user.fitness_goal || user.goal || goal || "weight_loss";
  const features = useMemo(
    () => [
      {
        icon: Brain,
        title: "AI-Powered Plan",
        description: aiResult
          ? `Fitness Level: ${aiResult.fitness_level} • Recommended Workout: ${aiResult.recommended_workout} mins`
          : "Click 'AI powered plan' to see your personalized plan.",
      },
      {
        icon: Target,
        title: "Goal-Oriented",
        description: (() => {
          switch (goalForCard) {
            case "muscle_gain":
              return "Prioritize strength training & progressive overload for best results.";
            case "weight_loss":
              return "Focus on fat-burning exercises & high-rep workouts.";
            case "endurance":
              return "Include cardio & stamina-building routines.";
            case "general_fitness":
              return "Balanced mix of strength, cardio & mobility for overall health.";
            default:
              return "Your plan adapts to your fitness goals.";
          }
        })()
      },
      {
        icon: TrendingUp,
        title: "Adaptive Progress",
        description:
          "Your workout evolves with you. The AI adjusts intensity and exercises based on your performance.",
      },
      {
        icon: Calendar,
        title: "Health Tracker",
        description: showSchedule
          ? "Your BMI is shown below."
          : "Click to view your BMI.",
      },
      {
        icon: BarChart3,
        title: "Real-Time Analytics",
        description:
          "Track every rep, set, and milestone with detailed performance insights.",
      },
      {
        icon: Users,
        title: "Community Driven",
        description:
          "Connect with athletes, share progress, and stay motivated.",
      },
    ],
    [aiResult]
  );

  const handleGenerateWorkout = async () => {
    console.log("BUTTON CLICKED");
    if (loadingAI) return;
    setLoadingAI(true);
    setAiError(null);

    try {
      //Fetch user data from localStorage
      const user = JSON.parse(localStorage.getItem("userData") || "{}");

      const userAge = Number(user.age || age);
      const userWeight = Number(user.weight || weight);
      const userHeight = Number(user.height || height);
      const userGoal = user.fitness_goal || user.fitnessGoal || goal || "weight_loss";
      const normalizedGoal = (userGoal || "").toLowerCase().replace(" ", "_");
      const userActivity =
        activityLevel || user.activityLevel || user.activity_level || "sedentary";

      console.log("USER INPUTS:", {
        age: userAge,
        weight: userWeight,
        height: userHeight,
        goal: userGoal,
        activityLevel: userActivity,
      });

      //predict API
      const predictRes = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: userAge,
          weight: userWeight,
          height: userHeight,
          fitnessGoal: user.fitness_goal || user.fitnessGoal || goal,
          activityLevel: user.activity_level || user.activityLevel || activityLevel
        }),
      });

      const predictResult = await predictRes.json();
      console.log("Predict Result:", predictResult);

      if (predictResult.error) {
        setAiError(predictResult.error);
        setLoadingAI(false);
        return;
      }

      //generate-workout API
      const finalActivityLevel = userActivity.toLowerCase().replace(" ", "_");

      console.log("Sending to generate-workout:", {
        fitness_level: predictResult.fitness_level,
        recommended_workout: predictResult.recommended_workout,
        activityLevel: finalActivityLevel,
      });

      const workoutRes = await fetch("http://localhost:5000/generate-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fitness_level: predictResult.fitness_level,
          recommended_workout: predictResult.recommended_workout,
          activityLevel: user.activity_level || user.activityLevel || activityLevel,
          goal: user.fitness_goal || user.fitnessGoal || goal
        }),
      });

      const workoutResult = await workoutRes.json();
      console.log("Workout Result:", workoutResult);

      if (workoutResult.error) {
        setAiError(workoutResult.error);
        setLoadingAI(false);
        return;
      }
      const cleanedSchedule = workoutResult.schedule.map((day: any) => ({
        ...day,
        exercises: day.exercises.map((ex: any) => ({
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          completed: false
        }))
      }));

      const finalResult = {
        ...predictResult,
        schedule: cleanedSchedule,
        goal: workoutResult.goal || user.fitness_goal || goal
      };

      console.log("AI Result:", finalResult);

      setAiResult(finalResult);
      localStorage.setItem("aiResult", JSON.stringify(finalResult));
      setShowSchedule(true); // ✅ This will make the SmartScheduling component visible
      navigate("/ai-plan");
    } catch (err) {
      console.error(err);
      setAiError("Failed to fetch AI result");
    } finally {
      setLoadingAI(false);
    }
  };

  const stats = [
    { value: "10K+", label: "Active Users" },
    { value: "500K+", label: "Workouts Generated" },
    { value: "95%", label: "Goal Achievement" },
    { value: "4.9★", label: "User Rating" },
  ];


  return (
    <div className="min-h-screen bg-background text-foreground">

      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/about" className="flex items-center gap-3">
            <Dumbbell className="w-5 h-5 text-primary" />
            <span className="text-xl font-bold">FitAI</span>
          </Link>


          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Blog
            </Link>
            <Link to="/report" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Report
            </Link>
            {user?.role === "admin" && (
              <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Admin Panel
              </Link>
            )}
            <a href="/feedback" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Feedback
            </a>
            <a href="#cta" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Get Started
            </a>
          </div>

          <div className="hidden md:flex items-center gap-3 relative" ref={dropdownRef}>
            {isLoggedIn ? (
              <>
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setOpenProfile(!openProfile)}
                >
                  <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-semibold">
                    {userName.charAt(0).toUpperCase()}
                  </div>

                  <span>({userName})</span>
                </div>

                {openProfile && (
                  <div className="absolute right-0 top-10 bg-black/80 text-white rounded-lg shadow-lg p-4 backdrop-blur-md flex justify-center">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        navigate("/signup");
                      }}
                    >
                      Edit Profile
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        localStorage.removeItem("isLoggedIn");
                        localStorage.clear();
                        window.location.reload();
                      }}
                    >
                      Logout
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Log In</Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">Sign Up Free</Link>
                </Button>
              </>
            )}
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      <section className="relative min-h-screen flex items-center pt-20">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Fitness hero"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-24">
          <h1 className="text-6xl font-bold">
            Your Body. <span className="text-primary">Your AI Coach.</span>
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-lg">
            Smart workout plans powered by machine learning.
          </p>

          {aiError && <p className="text-red-500 mt-4">{aiError}</p>}
        </div>
      </section>


      <section id="stats" className="border-y border-border py-12">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} custom={i} variants={fadeUp}>
              <div className="text-4xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div key={feature.title} custom={i} variants={fadeUp}>
              <Card
                onClick={() => {
                  if (feature.title === "AI-Powered Plan") {
                    handleGenerateWorkout();
                  }

                  if (feature.title === "Health Tracker") {
                    navigate("/health-tracker");
                  }

                  if (feature.title === "Goal-Oriented") {
                    navigate("/goal-plan");
                  }
                  if (feature.title === "Real-Time Analytics") {
                    navigate("/analytics");
                  }
                  // ✅ Add this for Community Driven
                  if (feature.title === "Community Driven") {
                    navigate("/community"); // new route
                  }
                  if (feature.title === "Adaptive Progress") {
                    navigate("/adaptive-progress");
                  }

                }}
                className={feature.title === "AI-Powered Plan" ||
                  feature.title === "Health Tracker" ||
                  feature.title === "Goal-Oriented" ||
                  feature.title === "Real-Time Analytics" ||
                  feature.title === "Community Driven"||
                  feature.title === "Adaptive Progress"
                  ? "cursor-pointer hover:scale-105 transition"
                  : ""}
              >
                <CardContent className="p-6">
                  <feature.icon className="w-6 h-6 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Smart Scheduling */}
        {isLoggedIn && showSchedule && aiResult?.schedule && (
          <div className="mx-auto max-w-7xl px-6 mt-10">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Smart Scheduling
                </h3>

                {/* Goal heading safe check */}
                <h4 className="font-bold text-primary mb-4">
                  {displayGoal.replace("_", " ")} Plan
                </h4>

                <SmartScheduling
                  schedule={aiResult.schedule}
                  showProgress={true}
                   interactive={false} // ✅ read-only
                />
              </CardContent>
            </Card>
          </div>
        )}
      </section>


      <section id="cta" className="py-24">
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
                Ready to Transform Your <span className="text-gradient">Fitness?</span>
              </h2>

              <p className="mt-4 text-muted-foreground max-w-lg mx-auto text-lg">
                Join thousands of athletes already using AI to train smarter. Get your personalized plan in under 2 minutes.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" asChild className="glow-primary-strong text-base h-13 px-10 font-semibold">

                  <Link
                    to={isLoggedIn ? "/" : "/signup"}
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  >
                    {isLoggedIn ? "Go to Dashboard" : "Get Started Free"}
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;