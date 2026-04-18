import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Users, ShieldCheck, Flame, Heart, Activity, CheckCircle2, UserPlus, LogOut, Send, MessageSquare, Share2, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type Group = {
    id: number;
    name: string;
    description: string;
    members: number;
    joined?: boolean;
    category: "strength" | "cardio" | "flexibility" | "hiit";
};

type Post = {
    id: number;
    groupId: number;
    user: string;
    avatar: string;
    content: string;
    likes: number;
    likedByMe: boolean;
    time: string;
};

const CommunityPage = () => {
    const [selectedClubId, setSelectedClubId] = useState<number | null>(null);

    // Clubs State
    const [groups, setGroups] = useState<Group[]>([]);
    const [search, setSearch] = useState("");
    const [notification, setNotification] = useState<string | null>(null);

    // Feed State
    const [newPostContent, setNewPostContent] = useState("");
    const [posts, setPosts] = useState<Post[]>([
        { id: 1, groupId: 1, user: "Alex Fitness", avatar: "A", content: "Just hit a new PR on deadlifts! 180kg for 3 reps 🔥 So pumped right now!", likes: 24, likedByMe: false, time: "2 hours ago" },
        { id: 4, groupId: 1, user: "Mike T", avatar: "M", content: "Anyone have good tips for breaking a bench plateau? Been stuck at 100kg for a month.", likes: 5, likedByMe: false, time: "1 day ago" },
        { id: 2, groupId: 2, user: "Sarah Runs", avatar: "S", content: "Completed my first 10K without stopping. Feeling amazing but my legs are jelly 🏃‍♀️ Drop your favorite recovery tips below!", likes: 56, likedByMe: true, time: "5 hours ago" },
        { id: 3, groupId: 3, user: "Yoga Master", avatar: "Y", content: "Don't forget to stretch today! 15 minutes of mobility work can prevent injuries and improve your lifts.", likes: 12, likedByMe: false, time: "1 day ago" },
    ]);

    useEffect(() => {
        // Simulated API call for clubs
        const fetchGroups = async () => {
            const data: Group[] = [
                { id: 1, name: "Muscle Gain Club", description: "Strength & Power enthusiasts.", members: 1240, category: "strength" },
                { id: 2, name: "Runners United", description: "Endurance & Marathon prep.", members: 890, category: "cardio" },
                { id: 3, name: "Yoga & Mobility", description: "Flexibility & Balance masters.", members: 650, category: "flexibility" },
                { id: 4, name: "HIIT Heroes", description: "High Intensity Training addicts.", members: 530, category: "hiit" },
                { id: 5, name: "Powerlifting Pro", description: "Heavy lifting and PR chasing.", members: 420, category: "strength" },
                { id: 6, name: "Morning Cardio", description: "Start the day with a sweat.", members: 1100, category: "cardio" },
            ];
            setGroups(data);
        };

        fetchGroups();
    }, []);

    // Handlers for Clubs
    const handleJoinLeave = (e: React.MouseEvent, groupId: number) => {
        e.stopPropagation();

        setGroups((prev) =>
            prev.map((g) => {
                if (g.id === groupId) {
                    const joinedNow = !g.joined;

                    setNotification(
                        joinedNow
                            ? `You joined ${g.name} 🎉`
                            : `You left ${g.name}`
                    );

                    return {
                        ...g,
                        joined: joinedNow,
                        members: joinedNow ? g.members + 1 : g.members - 1,
                    };
                }
                return g;
            })
        );

        // ⏳ Auto remove notification after 3 sec
        setTimeout(() => setNotification(null), 3000);
    };

    const filteredGroups = groups.filter((g) =>
        g.name.toLowerCase().includes(search.toLowerCase()) || g.description.toLowerCase().includes(search.toLowerCase())
    );

    // Handlers for Feed
    const handleLike = (postId: number) => {
        setPosts(prev => prev.map(p => {
            if (p.id === postId) {
                return { ...p, likedByMe: !p.likedByMe, likes: p.likedByMe ? p.likes - 1 : p.likes + 1 };
            }
            return p;
        }));
    };

    const handlePost = () => {
        if (!newPostContent.trim() || selectedClubId === null) return;

        const newPost: Post = {
            id: Date.now(),
            groupId: selectedClubId,
            user: "You",
            avatar: "U",
            content: newPostContent,
            likes: 0,
            likedByMe: false,
            time: "Just now"
        };

        setPosts([newPost, ...posts]);
        setNewPostContent("");
    };

    // UI Helpers
    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'strength': return <ShieldCheck className="w-5 h-5 text-blue-500" />;
            case 'cardio': return <Activity className="w-5 h-5 text-red-500" />;
            case 'flexibility': return <Heart className="w-5 h-5 text-emerald-500" />;
            case 'hiit': return <Flame className="w-5 h-5 text-orange-500" />;
            default: return <Users className="w-5 h-5 text-primary" />;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'strength': return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case 'cardio': return "bg-red-500/10 text-red-500 border-red-500/20";
            case 'flexibility': return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
            case 'hiit': return "bg-orange-500/10 text-orange-500 border-orange-500/20";
            default: return "bg-primary/10 text-primary border-primary/20";
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const activeGroup = groups.find(g => g.id === selectedClubId);
    const activeGroupPosts = posts.filter(p => p.groupId === selectedClubId);

    return (
        <div className="min-h-screen bg-background text-foreground px-6 py-24 pb-32">
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-6 py-3 rounded-xl shadow-lg z-50 font-semibold"
                    >
                        {notification}
                    </motion.div>
                )}
            </AnimatePresence>
            <motion.div
                initial="hidden"
                animate="show"
                variants={container}
                className="max-w-6xl mx-auto space-y-10"
            >
                <AnimatePresence mode="wait">
                    {selectedClubId === null ? (
                        <motion.div
                            key="clubs-list"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-10"
                        >
                            {/* Header section */}
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div>
                                    <h1 className="text-4xl md:text-5xl font-bold font-heading flex items-center gap-3">
                                        <Users className="w-10 h-10 text-primary" />
                                        Discover Clubs
                                    </h1>
                                    <p className="text-muted-foreground mt-2 text-lg">
                                        Join groups to see their private feeds, share progress, and stay motivated!
                                    </p>
                                </div>
                            </div>

                            {/* Search Bar */}
                            <div className="relative max-w-xl">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search for clubs or topics..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-card border border-border/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
                                />
                            </div>

                            {/* Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <AnimatePresence>
                                    {filteredGroups.map((group) => (
                                        <motion.div
                                            key={group.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            layout
                                        >
                                            <Card
                                                onClick={() => setSelectedClubId(group.id)}
                                                className="h-full border-border/50 hover:border-primary/50 transition-all shadow-sm bg-card group relative overflow-hidden flex flex-col cursor-pointer hover:-translate-y-1"
                                            >
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors" />
                                                <CardContent className="p-6 flex flex-col flex-grow">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${getCategoryColor(group.category)}`}>
                                                            {getCategoryIcon(group.category)}
                                                        </div>
                                                        <span className="flex items-center gap-1.5 text-sm font-semibold bg-secondary px-3 py-1 rounded-full text-foreground/80">
                                                            <Users className="w-4 h-4" /> {group.members.toLocaleString()}
                                                        </span>
                                                    </div>

                                                    <h2 className="text-xl font-bold font-heading mb-2 group-hover:text-primary transition-colors">{group.name}</h2>
                                                    <p className="text-muted-foreground text-sm flex-grow mb-6">{group.description}</p>

                                                    <button
                                                        onClick={(e) => handleJoinLeave(e, group.id)}
                                                        className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all duration-300 ${group.joined
                                                                ? "bg-secondary text-foreground hover:bg-red-500/10 hover:text-red-500 border border-transparent hover:border-red-500/30"
                                                                : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                                                            }`}
                                                    >
                                                        {group.joined ? (
                                                            <>
                                                                <CheckCircle2 className="w-4 h-4" /> Joined
                                                                <LogOut className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 absolute right-4 transition-opacity" />
                                                            </>
                                                        ) : (
                                                            <>
                                                                <UserPlus className="w-4 h-4" /> Join Club
                                                            </>
                                                        )}
                                                    </button>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {filteredGroups.length === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="col-span-full py-20 text-center"
                                    >
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
                                            <Search className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-xl font-bold font-heading mb-2">No groups found</h3>
                                        <p className="text-muted-foreground">Try adjusting your search terms to find what you're looking for.</p>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="club-detail"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            className="max-w-3xl mx-auto space-y-6"
                        >
                            {/* Detail Header */}
                            <button
                                onClick={() => setSelectedClubId(null)}
                                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-semibold mb-2"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back to Clubs
                            </button>

                            {activeGroup && (
                                <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border/50">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${getCategoryColor(activeGroup.category)}`}>
                                        {getCategoryIcon(activeGroup.category)}
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-bold font-heading text-primary">{activeGroup.name}</h1>
                                        <p className="text-muted-foreground mt-1">{activeGroup.description}</p>
                                    </div>
                                </div>
                            )}

                            {/* Create Post */}
                            <Card className="border-border/50 shadow-sm bg-card mb-8">
                                <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary shrink-0">Y</div>
                                    <input
                                        value={newPostContent}
                                        onChange={(e) => setNewPostContent(e.target.value)}
                                        placeholder={`Post to ${activeGroup?.name}...`}
                                        className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground focus:ring-0 text-sm"
                                        onKeyDown={(e) => e.key === 'Enter' && handlePost()}
                                    />
                                    <button
                                        onClick={handlePost}
                                        disabled={!newPostContent.trim()}
                                        className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send className="w-4 h-4" /> Post
                                    </button>
                                </CardContent>
                            </Card>

                            {/* Feed List */}
                            <div className="space-y-4">
                                <AnimatePresence>
                                    {activeGroupPosts.length > 0 ? (
                                        activeGroupPosts.map(post => (
                                            <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} layout>
                                                <Card className="border-border/50 shadow-sm bg-card hover:border-primary/30 transition-colors">
                                                    <CardContent className="p-5">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-foreground/70">{post.avatar}</div>
                                                            <div>
                                                                <p className="font-semibold text-sm">{post.user}</p>
                                                                <p className="text-xs text-muted-foreground">{post.time}</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm leading-relaxed mb-4">{post.content}</p>
                                                        <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                                                            <button
                                                                onClick={() => handleLike(post.id)}
                                                                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${post.likedByMe ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'}`}
                                                            >
                                                                <Heart className={`w-4 h-4 ${post.likedByMe ? 'fill-current' : ''}`} /> {post.likes}
                                                            </button>
                                                            <button className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                                                <MessageSquare className="w-4 h-4" /> Comment
                                                            </button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="py-10 text-center"
                                        >
                                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
                                                <MessageSquare className="w-8 h-8 text-muted-foreground" />
                                            </div>
                                            <h3 className="text-xl font-bold font-heading mb-2">No posts yet</h3>
                                            <p className="text-muted-foreground">Be the first to share your progress in {activeGroup?.name}!</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default CommunityPage;