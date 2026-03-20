import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dumbbell, Eye, EyeOff, Mail, Lock, User, Target } from "lucide-react";
import fitnessBg from "@/assets/fitness-bg.jpg";

const Signup = () => {

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    height: "",
    weight: "",
    fitnessGoal: "",
    activityLevel: "",
  });
  const [savedUser, setSavedUser] = useState(null);


  useEffect(() => {

    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const user = JSON.parse(localStorage.getItem("userData") || "null");

    console.log("AutoFill User:", user);

    if (isLoggedIn && user) {

      setSavedUser(user);

      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        age: user.age || "",
        height: user.height || "",
        weight: user.weight || "",
        fitnessGoal: user.fitnessGoal || "",
        activityLevel: user.activityLevel || ""
      });

    }

  }, []);
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("User Input:", formData);

    try {
      const response = await fetch("http://127.0.0.1:5000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          age: Number(formData.age),
          height: Number(formData.height),
          weight: Number(formData.weight),
          fitness_goal: formData.fitnessGoal,
          activity_level: formData.activityLevel
        })
      });

      const data = await response.json();
      console.log("Signup response:", data);

      if (data.status === "success" || data.status === "updated") {

        if (data.status === "success") {
          toast.success("Signup Successful! 🎉 Welcome to FitAI.");
        } else {
          toast.success("Profile Updated Successfully ✅");
        }

        const userData = {
          id: data.user?.id,
          name: data.user?.name || formData.name,
          age: data.user?.age || formData.age,
          weight: data.user?.weight || formData.weight,
          height: data.user?.height || formData.height,
          fitnessGoal: formData.fitnessGoal,
          activityLevel: data.user?.activityLevel || formData.activityLevel,
          email: data.user?.email || formData.email,
          role: formData.email.trim().toLowerCase() === "admin@gmail.com"
  ? "admin"
  : "user"
        };

        localStorage.setItem("userData", JSON.stringify(userData));

        window.dispatchEvent(new Event("storageUpdated"));

        console.log("EMAIL:", formData.email);
        console.log("ROLE:", formData.email.trim().toLowerCase());

        console.log("Saved userData:", userData);
        console.log("Check localStorage:", localStorage.getItem("userData"));
        console.log("NAVIGATING TO:", userData.role === "admin" ? "/admin" : "/dashboard");
        localStorage.setItem("isLoggedIn", "true");

       navigate("/");
      } else {
        toast.error(data.message || "Signup failed ❌");
      }

    } catch (error) {
      alert("Server error. Is Flask running?");
      console.error(error);
    }

  };

  return (<div className="flex min-h-screen">
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
      <img
        src={fitnessBg}
        alt="Fitness background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />

      <div className="relative z-10 flex flex-col justify-end p-12">
        <h2 className="text-4xl font-bold font-heading text-gradient leading-tight">
          Your Fitness.<br />Powered by AI.
        </h2>

        <p className="mt-4 text-muted-foreground max-w-md text-lg">
          Tell us about yourself and let our ML models craft the perfect workout plan for you.
        </p>
      </div>
    </div>

    <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12">

      <div className="w-full max-w-md space-y-6">

        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 glow-primary">
            <Dumbbell className="w-6 h-6 text-primary" />
          </div>
          <span className="text-2xl font-bold font-heading">FitAI</span>
        </div>

        <Link to="/" className="text-sm text-primary hover:underline flex items-center gap-1">
          ← Back to Home
        </Link>

        <div>
          <h1 className="text-3xl font-bold font-heading">
            {savedUser ? "Update Profile" : "Create your account"}
          </h1>

          <p className="mt-2 text-muted-foreground">
            Enter your details to get a personalized workout plan
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="space-y-2">
              <Label>Full Name</Label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                <Input
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">

            <Label>Password</Label>

            <div className="relative">

              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="pl-10 pr-10"
                required
                minLength={8}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>

            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="25"
                min={10}
                max={100}
                value={formData.age}
                onChange={(e) => handleChange("age", e.target.value)}
                className="bg-card border-border"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                placeholder="175"
                min={50}
                max={300}
                value={formData.height}
                onChange={(e) => handleChange("height", e.target.value)}
                className="bg-card border-border"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="70"
                min={20}
                max={500}
                value={formData.weight}
                onChange={(e) => handleChange("weight", e.target.value)}
                className="bg-card border-border"
                required
              />
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="space-y-2">
              <Label>Fitness Goal</Label>
              <Select
                value={formData.fitnessGoal}
                onValueChange={(v) => handleChange("fitnessGoal", v)}
                required
              >
                <SelectTrigger className="bg-card border-border">
                  <SelectValue placeholder="Select goal" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="weight_loss">Weight Loss</SelectItem>
                  <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                  <SelectItem value="endurance">Endurance</SelectItem>
                  <SelectItem value="general_fitness">General Fitness</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Activity Level</Label>
              <Select
                value={formData.activityLevel}
                onValueChange={(v) => handleChange("activityLevel", v)}
                required
              >
                <SelectTrigger className="bg-card border-border">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="sedentary">Sedentary</SelectItem>
                  <SelectItem value="lightly_active">Lightly Active</SelectItem>
                  <SelectItem value="moderately_active">Moderately Active</SelectItem>
                  <SelectItem value="very_active">Very Active</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>

          <Button type="submit" className="w-full">
            {savedUser ? "Update Profile" : "Create Account"}
          </Button>

        </form>

        <p className="text-center text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>

      </div>

    </div>
  </div>

  );
};

export default Signup;
