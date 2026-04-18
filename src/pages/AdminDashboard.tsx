import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, ArrowLeft, Flame, Timer, Target, Award, ChevronRight, Bell } from "lucide-react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Users,
    MessageSquare,
    BarChart3,
    TrendingUp,
    LogOut,
    Activity,
    Dumbbell,
    Heart,
    Zap,
    Search,
    ArrowUpDown,
    MoreVertical,
    Trash2,
    Lock,
    Unlock,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const API_BASE = "http://127.0.0.1:5000";

type User = {
    id: number;
    name: string;
    email: string;
    fitnessGoal: string;
    activityLevel: string;
    role: string;
    signupDate: string;
    is_main_admin?: boolean;
    is_blocked?: boolean;

};

type Feedback = {
    id: number;
    user_id: number;
    feedback_text: string;
    name: string;
    email: string;
    rating: number;
};

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const Admin = () => {
    const [authenticated, setAuthenticated] = useState(false);
    const [activeTab, setActiveTab] = useState<"overview" | "feedbacks" | "users">("overview");

    const [users, setUsers] = useState<User[]>([]);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

    const [search, setSearch] = useState("");
    const [filterGoal, setFilterGoal] = useState("all");
    const [filterActivity, setFilterActivity] = useState("all");
    const [filterRole, setFilterRole] = useState("all");
    const [sortKey, setSortKey] = useState<string>("id");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const navigate = useNavigate();
    const currentAdminId = JSON.parse(localStorage.getItem("userData") || "{}").id;
    const admin = JSON.parse(localStorage.getItem("userData") || "{}");
    const blockUser = async (id: number) => {
        const admin = JSON.parse(localStorage.getItem("userData") || "{}");

        const res = await fetch(`${API_BASE}/block-user/${id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                email: admin.email,
            },
        });

        const data = await res.json();

        if (data.status === "success") {
            toast.success("User Blocked 🚫");
            setUsers(prev =>
                prev.map(u => u.id === id ? { ...u, is_blocked: true } : u)
            );
        }
    };

    const unblockUser = async (id: number) => {
        const admin = JSON.parse(localStorage.getItem("userData") || "{}");

        const res = await fetch(`${API_BASE}/unblock-user/${id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                email: admin.email,
            },
        });

        const data = await res.json();

        if (data.status === "success") {
            toast.success("User Unblocked ✅");
            setUsers(prev =>
                prev.map(u => u.id === id ? { ...u, is_blocked: false } : u)
            );
        }
    };
    const notifications = [
        ...users.slice(0, 3).map(u => ({
            text: `${u.name} joined`,
            time: u.signupDate
                ? new Date(u.signupDate).toLocaleDateString()
                : "recent"
        })),
        ...feedbacks.slice(0, 3).map(f => ({
            text: `${f.name} gave feedback`,
            time: "recent"
        }))
    ];

    // Check admin on mount
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("userData") || "{}");
        if (user.role === "admin") {
            setAuthenticated(true);
        }
    }, []);

    // Fetch users
    useEffect(() => {
        if (!authenticated) return;
        fetch(`${API_BASE}/users`)
            .then((res) => res.json())
            .then((data) => {
                const formatted = (data.users || []).map((u: any) => ({
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    fitnessGoal: u.fitness_goal,
                    activityLevel: u.activity_level,
                    role: u.role?.toLowerCase() || "user",
                    signupDate: u.signup_date,
                    is_main_admin: u.is_main_admin || false,
                    is_blocked: u.is_blocked || false,
                }));
                setUsers(formatted);
            })
            .catch((err) => console.error(err));
    }, [authenticated]);

    // Fetch feedbacks
    useEffect(() => {
        if (!authenticated) return;
        fetch(`${API_BASE}/all-feedbacks`)
            .then((res) => res.json())
            .then((data) => setFeedbacks(data.feedbacks || []))
            .catch((err) => console.error(err));
    }, [authenticated]);

    const handleLogin = () => {
        const user = JSON.parse(localStorage.getItem("userData") || "{}");
        if (user.role === "admin") {
            setAuthenticated(true);
            toast.success("Welcome, Admin!");
        } else {
            toast.error("Access denied! Admin only.");
        }
    };


    const promoteUser = async (userId: number) => {
        const admin = JSON.parse(localStorage.getItem("userData") || "{}");

        try {
            const res = await fetch(`${API_BASE}/promote-user/${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    email: admin.email,  // Logged-in admin
                },
            });
            const data = await res.json();
            if (data.status === "success") {
                toast.success("User promoted to Admin!");
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: "admin" } : u));
            } else {
                toast.error(data.message || "Promotion failed");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error promoting user");
        }
    };

    const demoteUser = async (userId: number) => {
        const admin = JSON.parse(localStorage.getItem("userData") || "{}");

        try {
            const res = await fetch(`${API_BASE}/demote-user/${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    email: admin.email, // Logged-in admin
                },
            });
            const data = await res.json();
            if (data.status === "success") {
                toast.success("Admin demoted to User!");
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: "user" } : u));
            } else {
                toast.error(data.message || "Demotion failed");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error demoting admin");
        }
    };

    const handleDeleteUser = (id: number) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        const user = JSON.parse(localStorage.getItem("userData") || "{}");

        fetch(`${API_BASE}/delete-user/${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json", email: user.email },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.status === "deleted") {
                    setUsers((prev) => prev.filter((u) => u.id !== id));
                    toast.success("User deleted");
                } else {
                    toast.error(data.message || "Delete failed");
                }
            })
            .catch(() => toast.error("Error deleting user"));
    };

    const handleDeleteFeedback = (id: number) => {
        if (!window.confirm("Are you sure you want to delete this feedback?")) return;
        const user = JSON.parse(localStorage.getItem("userData") || "{}");

        fetch(`${API_BASE}/delete-feedback/${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json", email: user.email },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.status === "deleted") {
                    setFeedbacks((prev) => prev.filter((fb) => fb.id !== id));
                    toast.success("Feedback deleted");
                } else {
                    toast.error(data.message || "Error deleting feedback");
                }
            })
            .catch(() => toast.error("Error deleting feedback"));
    };

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortOrder("asc");
        }
    };

    const displayedUsers = [...users]
        .filter(
            (u) =>
                u.name.toLowerCase().includes(search.toLowerCase()) &&
                (filterGoal !== "all" ? u.fitnessGoal === filterGoal : true) &&
                (filterActivity !== "all" ? u.activityLevel === filterActivity : true) &&
                (filterRole !== "all" ? u.role === filterRole : true)
        )
        .sort((a: any, b: any) => {
            let valA = a[sortKey];
            let valB = b[sortKey];
            if (sortKey === "signupDate") {
                valA = new Date(a.signupDate).getTime();
                valB = new Date(b.signupDate).getTime();
            }
            if (valA < valB) return sortOrder === "asc" ? -1 : 1;
            if (valA > valB) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });

    const stats = [
        { label: "Total Users", value: displayedUsers.length, icon: Users, color: "text-primary" },
        { label: "Weight Loss", value: displayedUsers.filter((u) => u.fitnessGoal === "weight_loss").length, icon: Heart, color: "text-destructive" },
        { label: "Muscle Gain", value: displayedUsers.filter((u) => u.fitnessGoal === "muscle_gain").length, icon: Dumbbell, color: "text-primary" },
        { label: "Endurance / General", value: displayedUsers.filter((u) => u.fitnessGoal === "endurance" || u.fitnessGoal === "general_fitness").length, icon: Zap, color: "text-accent-foreground" },
    ];

    // Login screen
    if (!authenticated) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.6, ease }}
                >
                    <Card className="w-full max-w-sm border-border bg-card">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                                <Lock className="h-7 w-7 text-primary" />
                            </div>
                            <CardTitle className="font-heading text-2xl">Admin Access</CardTitle>
                            <CardDescription>Login as admin to access dashboard</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button onClick={handleLogin} className="w-full">
                                Enter Dashboard
                            </Button>
                            <Link to="/login" className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                                ← Back to Home
                            </Link>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    const tabs = [
        { key: "overview" as const, label: "Overview", icon: BarChart3 },
        { key: "users" as const, label: "Users", icon: Users },
        { key: "feedbacks" as const, label: "Feedbacks", icon: MessageSquare },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">

                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        <h1 className="text-lg font-semibold">Admin Dashboard</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* ❌ Main Admin ko Back button nahi dikhega */}
                        {!JSON.parse(localStorage.getItem("userData") || "{}")?.is_main_admin && (
                            <Button variant="ghost" size="sm" asChild>
                                <Link to="/">
                                    <ArrowLeft className="w-4 h-4 mr-1" />
                                    Back
                                </Link>
                            </Button>
                        )}

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                localStorage.clear();
                                window.location.reload();
                            }}
                        >
                            <LogOut className="w-4 h-4 mr-1" />
                            Logout
                        </Button>

                        {/* 🔔 Notification Bell (LAST me add karo) */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="relative ml-6">
                                    <Bell className="h-5 w-5" />

                                    {/* 🔴 Badge */}
                                    {notifications.length > 0 && (
                                        <span className="absolute -top-1 -right-1 text-[10px] bg-red-500 text-white rounded-full px-1">
                                            {notifications.length}
                                        </span>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-64">
                                {notifications.length === 0 ? (
                                    <p className="text-sm text-center p-3">No notifications</p>
                                ) : (
                                    notifications.map((n, i) => (
                                        <DropdownMenuItem key={i} className="flex flex-col items-start">
                                            <span className="text-sm">{n.text}</span>
                                            <span className="text-xs text-muted-foreground">{n.time}</span>
                                        </DropdownMenuItem>
                                    ))
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                </div>
            </header>

            <div className="mx-auto max-w-7xl px-6 py-8">
                {/* Tabs */}
                <div className="mb-8 flex gap-1 rounded-xl bg-card p-1 w-fit border border-border/50">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${activeTab === tab.key
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Overview */}
                {activeTab === "overview" && (
                    <motion.div
                        initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.5, ease }}
                    >
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                            {stats.filter((s) => s.value > 0).map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: i * 0.08, ease }}
                                >
                                    <Card className="border-border/50 bg-card hover:shadow-lg transition-shadow duration-300">
                                        <CardContent className="p-5">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                                </div>
                                            </div>
                                            <p className="text-2xl font-bold font-heading tabular-nums">{stat.value}</p>
                                            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>

                        {/* Recent sections */}
                        <div className="grid gap-6 lg:grid-cols-2">
                            <Card className="border-border/50 bg-card">
                                <CardHeader>
                                    <CardTitle className="text-lg font-heading flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5 text-primary" />
                                        Latest Feedbacks
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {feedbacks.length === 0 && (
                                        <p className="text-sm text-muted-foreground text-center py-6">
                                            No feedbacks yet
                                        </p>
                                    )}
                                    {feedbacks.slice(0, 3).map((fb) => (
                                        <div
                                            key={fb.id}
                                            className="flex items-start gap-3 rounded-lg bg-background/50 p-3 border border-border/30"
                                        >
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                                {fb.name?.charAt(0) || "?"}
                                            </div>

                                            <div className="min-w-0 flex-1">

                                                {/* Top Row: Name + Rating */}
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-sm">{fb.name}</span>

                                                    {/* ⭐ Rating Right Side */}
                                                    <span className="text-green-500 text-sm">
                                                        {"⭐".repeat(Number(fb.rating) || 0)}
                                                    </span>
                                                </div>

                                                {/* Feedback text */}
                                                <p className="text-sm text-muted-foreground mt-0.5 truncate">
                                                    {fb.feedback_text}
                                                </p>

                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                            <Card className="border-border/50 bg-card">
                                <CardHeader>
                                    <CardTitle className="text-lg font-heading flex items-center gap-2">
                                        <Users className="h-5 w-5 text-primary" />
                                        Recent Users
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {users.length === 0 && (
                                        <p className="text-sm text-muted-foreground text-center py-6">No users yet</p>
                                    )}
                                    {users.filter((u) => u.role !== "admin").slice(0, 4).map((user) => (
                                        <div key={user.id} className="flex items-center gap-3 rounded-lg bg-background/50 p-3 border border-border/30">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm">{user.name}</p>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                            <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary">
                                                {user.fitnessGoal}
                                            </span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                )}

                {/* Users Tab */}
                {activeTab === "users" && (
                    <motion.div
                        initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.5, ease }}
                    >
                        {/* Filters */}
                        <div className="flex flex-wrap gap-3 mb-6">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 bg-card border-border/50"
                                />
                            </div>
                            <Select value={filterGoal} onValueChange={setFilterGoal}>
                                <SelectTrigger className="w-[160px] bg-card border-border/50">
                                    <SelectValue placeholder="All Goals" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Goals</SelectItem>
                                    <SelectItem value="weight_loss">Weight Loss</SelectItem>
                                    <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                                    <SelectItem value="endurance">Endurance</SelectItem>
                                    <SelectItem value="general_fitness">General Fitness</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filterActivity} onValueChange={setFilterActivity}>
                                <SelectTrigger className="w-[180px] bg-card border-border/50">
                                    <SelectValue placeholder="All Activity" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Activity Levels</SelectItem>
                                    <SelectItem value="sedentary">Sedentary</SelectItem>
                                    <SelectItem value="lightly_active">Lightly Active</SelectItem>
                                    <SelectItem value="moderately_active">Moderately Active</SelectItem>
                                    <SelectItem value="very_active">Very Active</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filterRole} onValueChange={setFilterRole}>
                                <SelectTrigger className="w-[130px] bg-card border-border/50">
                                    <SelectValue placeholder="All Roles" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Card className="border-border/50 bg-card">
                            <CardHeader>
                                <CardTitle className="font-heading">All Users 👥</CardTitle>
                                <CardDescription>{displayedUsers.length} users found</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                                                <span className="flex items-center gap-1">Name <ArrowUpDown className="h-3 w-3" /></span>
                                            </TableHead>
                                            <TableHead className="cursor-pointer" onClick={() => handleSort("email")}>
                                                <span className="flex items-center gap-1">Email <ArrowUpDown className="h-3 w-3" /></span>
                                            </TableHead>
                                            <TableHead className="hidden sm:table-cell cursor-pointer" onClick={() => handleSort("fitnessGoal")}>
                                                <span className="flex items-center gap-1">Goal <ArrowUpDown className="h-3 w-3" /></span>
                                            </TableHead>
                                            <TableHead className="hidden md:table-cell cursor-pointer" onClick={() => handleSort("activityLevel")}>
                                                <span className="flex items-center gap-1">Activity <ArrowUpDown className="h-3 w-3" /></span>
                                            </TableHead>
                                            <TableHead className="hidden md:table-cell cursor-pointer" onClick={() => handleSort("signupDate")}>
                                                <span className="flex items-center gap-1">Joined <ArrowUpDown className="h-3 w-3" /></span>
                                            </TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {displayedUsers.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-bold">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">{user.name}</span>

                                                            {user.is_main_admin && (
                                                                <span className="text-xs px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-600 font-medium">
                                                                    👑 Main
                                                                </span>
                                                            )}

                                                            {!user.is_main_admin && user.role === "admin" && (
                                                                <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-600 font-medium">
                                                                    Admin
                                                                </span>
                                                            )}
                                                            {user.is_blocked && (
                                                                <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-600 font-medium">
                                                                    🚫 Blocked
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary">
                                                        {user.fitnessGoal}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell text-muted-foreground">{user.activityLevel}</TableCell>
                                                <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                                                    {user.signupDate ? new Date(user.signupDate).toLocaleDateString() : "—"}
                                                </TableCell>

                                                <TableCell className="text-right">
                                                    <div className="flex justify-end">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button size="icon" variant="ghost" className="h-8 w-8">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>

                                                            <DropdownMenuContent align="end" className="w-44">

                                                                {/* 🔼 PROMOTE (ONLY MAIN ADMIN) */}
                                                                {user.role === "user" && admin?.is_main_admin && (
                                                                    <DropdownMenuItem onClick={() => promoteUser(user.id)}>
                                                                        ⬆️ Promote
                                                                    </DropdownMenuItem>
                                                                )}

                                                                {/* 🔽 DEMOTE (ONLY MAIN ADMIN, NOT SELF) */}
                                                                {user.role === "admin" &&
                                                                    user.id !== currentAdminId &&
                                                                    admin?.is_main_admin && (
                                                                        <DropdownMenuItem onClick={() => demoteUser(user.id)}>
                                                                            ⬇️ Demote
                                                                        </DropdownMenuItem>
                                                                    )}

                                                                {/* 🔒 BLOCK / UNBLOCK */}
                                                                {(
                                                                    (admin?.is_main_admin && user.id !== currentAdminId) ||
                                                                    (!admin?.is_main_admin &&
                                                                        user.role === "user" &&
                                                                        user.id !== currentAdminId)
                                                                ) && (
                                                                        !user.is_blocked ? (
                                                                            <DropdownMenuItem onClick={() => blockUser(user.id)}>
                                                                                <Lock className="h-4 w-4 mr-2 text-yellow-500" />
                                                                                Block
                                                                            </DropdownMenuItem>
                                                                        ) : (
                                                                            <DropdownMenuItem onClick={() => unblockUser(user.id)}>
                                                                                <Unlock className="h-4 w-4 mr-2 text-green-500" />
                                                                                Unblock
                                                                            </DropdownMenuItem>
                                                                        )
                                                                    )}

                                                                {/* Delete (same old style ✅) */}
                                                                {user.id !== currentAdminId &&
                                                                    !user.is_main_admin &&
                                                                    (admin?.is_main_admin || user.role !== "admin") && (
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            onClick={() => handleDeleteUser(user.id)}
                                                                            className="h-8 px-3 flex items-center gap-1
                                                                                        text-red-500 
                                                                                        hover:bg-red-500"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                            Delete
                                                                        </Button>
                                                                    )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {displayedUsers.length === 0 && (
                                    <div className="py-12 text-center text-muted-foreground">
                                        <Users className="mx-auto h-10 w-10 mb-3 opacity-40" />
                                        <p>No users found</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Feedbacks Tab */}
                {activeTab === "feedbacks" && (
                    <motion.div
                        initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 0.5, ease }}
                    >
                        <Card className="border-border/50 bg-card">
                            <CardHeader>
                                <CardTitle className="font-heading">User Feedbacks 💬</CardTitle>
                                <CardDescription>{feedbacks.length} total feedbacks</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead className="hidden sm:table-cell">Feedback</TableHead>
                                            <TableHead>Rating</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {feedbacks.map((fb) => (
                                            <TableRow key={fb.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                                            {fb.name?.charAt(0) || "?"}
                                                        </div>
                                                        <span className="font-medium">{fb.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{fb.email}</TableCell>
                                                <TableCell className="hidden sm:table-cell max-w-[250px] truncate text-muted-foreground">
                                                    {fb.feedback_text}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-green-500 text-sm mt-1">
                                                        {"⭐".repeat(Number(fb.rating) || 0)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteFeedback(fb.id)}
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {feedbacks.length === 0 && (
                                    <div className="py-12 text-center text-muted-foreground">
                                        <MessageSquare className="mx-auto h-10 w-10 mb-3 opacity-40" />
                                        <p>No feedbacks yet</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Admin;
