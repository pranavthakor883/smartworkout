import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { MessageSquare, Star, Send, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Footer from "@/components/ui/Footer";

const ratings = [1, 2, 3, 4, 5];

const Feedback = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !message.trim() || rating === 0) {
      toast.error("Please fill in your name, rating, and feedback message.");
      return;
    }

    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    const userId = userData.id;

    setSubmitting(true);

    try {
      const res = await fetch("http://localhost:5000/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          feedback: message,
          rating
        }),
      });
      console.log("UserId at feedback submit:", userId);

      const data = await res.json();

      if (data.success) {
        toast.success("Thank you for your feedback! 🎉");
        setName("");
        setEmail("");
        setRating(0);
        setMessage("");
      } else {
        toast.error(data.error || "Failed to submit feedback");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error. Try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          </Link>
          <div className="flex-1"></div>
          <div className="hidden md:flex items-center">
            <Button variant="ghost" asChild>
              <Link to="/" className="flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </nav>
      <section className="pt-28 pb-24 px-6">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
                <MessageSquare className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold font-heading">
                We'd Love Your <span className="text-gradient">Feedback</span>
              </h1>
              <p className="mt-3 text-muted-foreground max-w-md mx-auto">
                Help us improve FitAI by sharing your experience and suggestions.
              </p>
            </div>
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-heading">Share Your Thoughts</CardTitle>
                <CardDescription>All fields marked with * are required</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      maxLength={255}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Rating *</Label>
                    <div className="flex gap-2">
                      {ratings.map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 transition-colors ${star <= (hoverRating || rating) ? "text-primary fill-primary" : "text-muted-foreground"}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Your Feedback *</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us what you think about FitAI..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      maxLength={1000}
                      rows={5}
                    />
                    <p className="text-xs text-muted-foreground text-right">{message.length}/1000</p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full glow-primary font-semibold"
                    size="lg"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit Feedback"}
                    <Send className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Feedback;