import { Link } from "react-router-dom";
import Footer from "@/components/ui/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Dumbbell,
  Brain,
  Heart,
  Shield,
  Sparkles,
  Code,
  Database,
  Server,
  GraduationCap,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const team = [
  { name: "Pranav Thakor", role: "Frontend Developer (React)", icon: Code },
  { name: "Om Patel", role: "Database Engineer (MySql)", icon: Database },
  { name: "Pratik Suthar", role: "Backend Developer (Flask)", icon: Server },
  { name: "Tirth Sir", role: "Project Mentor", icon: GraduationCap },
];

const values = [
  {
    icon: Brain,
    title: "Science-First Approach",
    description:
      "Every recommendation is backed by sports science and validated by certified trainers.",
    link: "https://www.google.com/search?q=sports+science+fitness",
  },
  {
    icon: Heart,
    title: "Inclusive Fitness",
    description:
      "We believe fitness is for everyone — regardless of age, ability, or experience level.",
    link: "https://www.google.com/search?q=inclusive+fitness",
  },
  {
    icon: Shield,
    title: "Privacy & Trust",
    description:
      "Your body metrics and health data are encrypted and never shared with third parties.",
    link: "https://www.google.com/search?q=data+privacy+in+health+apps",
  },
  {
    icon: Sparkles,
    title: "Continuous Innovation",
    description:
      "Our ML models improve daily, learning from anonymized patterns to deliver better results.",
    link: "https://www.google.com/search?q=machine+learning+in+fitness",
  },
];

const About = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
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

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background px-6 py-4 space-y-4">
            <Button variant="ghost" asChild className="w-full">
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                Back to Home
              </Link>
            </Button>
            <Link
              to="/about"
              className="block text-sm text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <div className="flex gap-3 pt-2">
              {!loggedIn ? (
                <>
                  <Button variant="ghost" asChild className="flex-1">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      Log In
                    </Link>
                  </Button>
                  <Button asChild className="flex-1 glow-primary">
                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
                </>
              ) : (
                <Button asChild className="flex-1 glow-primary">
                  <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                    Home
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Page Content */}
      <main className="pt-32">
        {/* Hero Section */}
        <section className="pb-20">
          <div className="mx-auto max-w-7xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading leading-[1.1] tracking-tight">
                Redefining Fitness with{" "}
                <span className="text-gradient">Artificial Intelligence</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                FitAI was born from a simple idea: everyone deserves a personal trainer. We
                use machine learning to make expert-level fitness guidance accessible,
                adaptive, and affordable.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 border-y border-border bg-card/30">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={0}
              >
                <h2 className="text-3xl sm:text-4xl font-bold font-heading">
                  Our <span className="text-gradient">Mission</span>
                </h2>
                <p className="mt-6 text-muted-foreground leading-relaxed">
                  We're on a mission to democratize personal fitness coaching. Traditional
                  personal training is expensive and inaccessible for most people. FitAI
                  bridges that gap by combining cutting-edge AI with proven exercise science.
                </p>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  Our platform learns your unique body composition, tracks your progress in
                  real time, and continuously adapts your workouts to keep you challenged
                  and progressing — just like a world-class coach would.
                </p>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={2}
                className="grid grid-cols-2 gap-4"
              >
                {[
                  { value: "2024", label: "Founded" },
                  { value: "10K+", label: "Users" },
                  { value: "50+", label: "Countries" },
                  { value: "24/7", label: "AI Support" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-border bg-card/50 p-6 text-center"
                  >
                    <div className="text-2xl font-bold font-heading text-gradient">{stat.value}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold font-heading">
                What We <span className="text-gradient">Stand For</span>
              </h2>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                Our core values guide every feature we build and every decision we make.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, i) => (
                <motion.div
                  key={value.title}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                >
                  <Card
                    onClick={() => window.open(value.link, "_blank")}
                    className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors h-full group cursor-pointer"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 group-hover:glow-primary transition-shadow mb-4">
                        <value.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold font-heading mb-2">{value.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-24 border-t border-border bg-card/30">
          <div className="mx-auto max-w-7xl px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold font-heading">
                Meet the <span className="text-gradient">Team</span>
              </h2>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                A passionate group of engineers, trainers, and AI researchers building the future of fitness.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, i) => (
                <motion.div
                  key={member.name}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                >
                  <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors text-center group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 group-hover:glow-primary transition-shadow mx-auto mb-4">
                        <member.icon className="w-7 h-7 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold font-heading">{member.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{member.role}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24">
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
                  Join the <span className="text-gradient">Movement</span>
                </h2>
                <p className="mt-4 text-muted-foreground max-w-lg mx-auto text-lg">
                  Start your AI-powered fitness journey today. No credit card required.
                </p>
                <div className="mt-8">
                  <Button size="lg" asChild className="glow-primary-strong text-base h-13 px-10 font-semibold">
                    <Link to={"/"}>
                      {"Go to Home"}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default About;