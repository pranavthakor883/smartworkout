import { useState } from "react";
import { Link } from "react-router-dom";
import Footer from "@/components/ui/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Dumbbell, ArrowLeft, Clock, User } from "lucide-react";


const posts = [
  {
    id: 1,
    title: "How AI is Revolutionizing Personal Fitness",
    excerpt: "Discover how machine learning algorithms create hyper-personalized workout plans that adapt in real-time.",
    category: "AI & Fitness",
    author: "FitAI Team",
    date: "Feb 28, 2026",
    content: "Full content of 'How AI is Revolutionizing Personal Fitness'..."
  },
  {
    id: 2,
    title: "The Science Behind Adaptive Training Programs",
    excerpt: "Understanding periodization, progressive overload, and how FitAI optimizes your gains.",
    category: "Training Science",
    author: "FitAI Team",
    date: "Feb 22, 2026",
    content: "Full content of 'The Science Behind Adaptive Training Programs'..."
  },
  {
    id: 3,
    title: "Nutrition Meets Machine Learning",
    excerpt: "How combining nutritional data with workout analytics creates a complete picture of your fitness journey.",
    category: "Nutrition",
    author: "FitAI Team",
    date: "Feb 15, 2026",
    content: "Full content of 'Nutrition Meets Machine Learning'..."
  },
  {
    id: 4,
    title: "From Beginner to Advanced: AI-Guided Progression",
    excerpt: "Real stories from users who transformed their fitness levels using AI-powered coaching.",
    category: "Success Stories",
    author: "FitAI Team",
    date: "Feb 10, 2026",
    content: "Full content of 'From Beginner to Advanced: AI-Guided Progression'..."
  },
  {
    id: 5,
    title: "Recovery Optimization with Data Analytics",
    excerpt: "Tracking recovery metrics helps prevent overtraining and maximizes performance gains.",
    category: "Recovery",
    author: "FitAI Team",
    date: "Feb 5, 2026",
    content: "Full content of 'Recovery Optimization with Data Analytics'..."
  },
  {
    id: 6,
    title: "Building Consistency: The Role of Smart Scheduling",
    excerpt: "AI scheduling adapts to your lifestyle, making it easier to maintain a consistent workout routine.",
    category: "Lifestyle",
    author: "FitAI Team",
    date: "Jan 30, 2026",
    content: "Full content of 'Building Consistency: The Role of Smart Scheduling'..."
  },
];


const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

const Blog = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Back to Home button */}
          <div className="hidden md:flex items-center">
            <Button variant="ghost" asChild>
              <Link to="/" className="flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>
          </div>


          <button
            className="md:hidden text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? "✖" : "☰"}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background px-6 py-4 space-y-4">
            <Link to="/" className="block text-sm text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/about" className="block text-sm text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>About</Link>

          </div>
        )}
      </nav>

      {/* Header */}
      <section className="pt-32 pb-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl font-bold font-heading"
          >
            The FitAI <span className="text-gradient">Blog</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 text-muted-foreground max-w-xl mx-auto text-lg"
          >
            Insights on AI-powered fitness, training science, and optimizing your health journey.
          </motion.p>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <Link to={`/blog/${post.id}`}>
                <Card
                  onClick={() =>
                    window.open(
                      `https://www.google.com/search?q=${encodeURIComponent(post.title)}`,
                      "_blank"
                    )
                  }
                >
                  <CardContent className="p-6 flex flex-col h-full">
                    <Badge variant="secondary" className="w-fit mb-4 text-xs">{post.category}</Badge>
                    <h3 className="text-lg font-semibold font-heading mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">{post.excerpt}</p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3" />
                        <span>{post.author}</span>
                      </div>
                    </div>
                  </CardContent>
                  <div className="flex justify-center mt-4">
                    <Button variant="ghost" className="p-0 text-primary">
                      Read More →
                    </Button>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>


      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Blog;