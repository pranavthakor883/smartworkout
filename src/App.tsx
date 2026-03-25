import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Footer from "@/components/ui/Footer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import CommunityPage from "@/components/CommunityPage";
import Report from "./pages/Report";
import Login from "./pages/Login";
import AdaptiveProgress from "@/components/AdaptiveProgress";
import GoalPlan from "./pages/Goalplan";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import Analytics from "./pages/Analytics";
import Feedback from "./pages/Feedback"
import HealthTracker from "./pages/HealthTracker";
import AIPlan from "./pages/Aiplan";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster position="bottom-right" />
      <BrowserRouter>

        <Routes>

          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/ai-plan" element={<AIPlan />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/adaptive-progress" element={<AdaptiveProgress />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/health-tracker" element={<HealthTracker />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="user">
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/goal-plan" element={<GoalPlan />} />
          <Route path="/report" element={<Report />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;