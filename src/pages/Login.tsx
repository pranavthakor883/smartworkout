import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dumbbell, Eye, EyeOff, Mail, Lock } from "lucide-react";
import fitnessBg from "@/assets/fitness-bg.jpg";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const storedUser = localStorage.getItem("userData");
  const userId = storedUser ? JSON.parse(storedUser).id : null;
  const user = storedUser ? JSON.parse(storedUser) : null;
  const feedbackKey = `feedbackSubmitted_${userId}`;

  useEffect(() => {
    const submitted = localStorage.getItem(feedbackKey) === "true";
    setFeedbackSubmitted(submitted);
  }, [feedbackKey]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      const loginData = data.user;

      if (data.status === "success") {
        toast.success("Login Successful! 🎉 Welcome to FitAI.");

        localStorage.setItem("isLoggedIn", "true");

          const userData = {
    id: data.user.id,
    name: data.user.name,
    age: data.user.age,
    weight: data.user.weight,
    height: data.user.height,
    email: data.user.email,
    fitnessGoal: loginData.fitness_goal || loginData.goal || "weight_loss",
    activityLevel: data.user.activityLevel || data.user.activity_level,
    role: data.user.role,
    is_main_admin: data.user.is_main_admin
  };

        localStorage.setItem("userData", JSON.stringify(userData));
        window.dispatchEvent(new Event("storageUpdated"));
        console.log("Login: userData saved ->", userData);
        console.log("Check localStorage ->", localStorage.getItem("userData"));
        console.log("LOGIN USER DATA:", userData);
        console.log(JSON.parse(localStorage.getItem("userData")));

        if (data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }

      } else {
        alert(data.message || "Invalid credentials ❌");
        toast.error("Login Failed ❌");
      }
    } catch (error) {
      alert("Server error. Is Flask running?");
      console.error(error);
    }
  };

  return (
    <div className="flex min-h-screen">


      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={fitnessBg}
          alt="Fitness background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
        <div className="relative z-10 flex flex-col justify-end p-12">
          <h2 className="text-4xl font-bold font-heading text-gradient leading-tight">
            Train Smarter.<br />Not Harder.
          </h2>
          <p className="mt-4 text-muted-foreground max-w-md text-lg">
            AI-powered workout plans that adapt to your body, your goals, and your progress.
          </p>
        </div>
      </div>


      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 glow-primary">
              <Dumbbell className="w-6 h-6 text-primary" />
            </div>
            <span className="text-2xl font-bold font-heading">FitAI</span>
          </div>

          {(!user || user.role !== "admin") && (
            <Link
              to="/"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              ← Back to Home
            </Link>
          )}

          <div>
            <h1 className="text-3xl font-bold font-heading">Welcome back</h1>
            <p className="mt-2 text-muted-foreground">
              Log in to access your smart workout plan
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-card border-border focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-card border-border focus:ring-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link to="#" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full glow-primary text-base h-12 font-semibold">
              Log In
            </Button>
          </form>

          <p className="text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>

  );
};

export default Login;
