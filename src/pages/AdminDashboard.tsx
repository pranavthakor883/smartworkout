import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type User = {
    id: number;
    name: string;
    email: string;
    fitnessGoal: string;
    activityLevel: string;
    role: string;
    signupDate: string;
};

type Feedback = {
    id: number;
    user_id: number;
    feedback_text: string;
    name: string;
    email: string;
};

const AdminDashboard = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [search, setSearch] = useState("");
    const [filterGoal, setFilterGoal] = useState("");
    const [filterActivity, setFilterActivity] = useState("");
    const [filterRole, setFilterRole] = useState("");
    const [sortKey, setSortKey] = useState<keyof User | "signupDate">("id");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    // Fetch users
    useEffect(() => {
        fetch("http://127.0.0.1:5000/users")
            .then((res) => res.json())
            .then((data) => {
                const formattedUsers = (data.users || []).map((u: any) => ({
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    fitnessGoal: u.fitness_goal,
                    activityLevel: u.activity_level,
                    role: u.role || "user",
                    signupDate: u.signup_date,
                }));
                setUsers(formattedUsers);
            })
            .catch((err) => console.error(err));
    }, []);

    // Fetch feedbacks
    useEffect(() => {
        fetch("http://127.0.0.1:5000/all-feedbacks")
            .then((res) => res.json())
            .then((data) => setFeedbacks(data.feedbacks || []))
            .catch((err) => console.error(err));
    }, []);

    const handleDelete = (id: number) => {
        console.log("Delete clicked for:", id);
        if (!window.confirm("Are you sure you want to delete this user?")) return;

        fetch(`http://127.0.0.1:5000/delete-user/${id}`, { method: "DELETE", mode: "cors" })
            .then((res) => res.json())
            .then((data) => {
                if (data.status === "deleted") {
                    setUsers(users.filter((u) => Number(u.id) !== Number(id)));
                } else {
                    alert("Delete failed: " + (data.error || "Unknown error"));
                }
            })
            .catch((err) => {
                console.error(err);
                alert("An error occurred while deleting the user.");
            });
    };

    const handleDeleteFeedback = (id: number) => {
        console.log("Delete clicked for:", id);
        if (!window.confirm("Are you sure you want to delete this feedback?")) return;

        fetch(`http://127.0.0.1:5000/delete-feedback/${id}`, { method: "DELETE", mode: "cors" })
            .then((res) => res.json())
            .then((data) => {
                if (data.status === "deleted") {
                    setFeedbacks(feedbacks.filter((fb) => fb.id !== id));
                } else {
                    alert("Error deleting feedback: " + data.error);
                }
            })
            .catch((err) => console.error(err));
    };

    const handleSort = (key: keyof User | "signupDate") => {
        if (sortKey === key) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortOrder("asc");
        }
    };

    const displayedUsers = [...users]
        .filter((u) =>
            u.name.toLowerCase().includes(search.toLowerCase()) &&
            (filterGoal ? u.fitnessGoal === filterGoal : true) &&
            (filterActivity ? u.activityLevel === filterActivity : true) &&
            (filterRole ? u.role === filterRole : true) &&
            u.role !== "admin"
        )
        .sort((a, b) => {
            let valA: any = a[sortKey];
            let valB: any = b[sortKey];
            if (sortKey === "signupDate") {
                valA = new Date(a.signupDate);
                valB = new Date(b.signupDate);
            }
            if (valA < valB) return sortOrder === "asc" ? -1 : 1;
            if (valA > valB) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });

    return (
        <div className="p-6 text-white min-h-screen">
            <h1 className="text-3xl font-bold mb-6">Admin Panel 🛠</h1>

            {/* Filters */}
            <div className="flex gap-4 mb-6 flex-wrap">
                <input
                    type="text"
                    placeholder="Search by name"
                    className="p-2 rounded bg-gray-800"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select className="p-2 rounded bg-gray-800" value={filterGoal} onChange={(e) => setFilterGoal(e.target.value)}>
                    <option value="">All Goals</option>
                    <option value="weight_loss">Weight Loss</option>
                    <option value="muscle_gain">Muscle Gain</option>
                    <option value="endurance">Endurance</option>
                    <option value="general_fitness">General Fitness</option>
                </select>
                <select className="p-2 rounded bg-gray-800" value={filterActivity} onChange={(e) => setFilterActivity(e.target.value)}>
                    <option value="">All Activity Levels</option>
                    <option value="sedentary">Sedentary</option>
                    <option value="lightly_active">Lightly Active</option>
                    <option value="moderately_active">Moderately Active</option>
                    <option value="very_active">Very Active</option>
                </select>
                <select className="p-2 rounded bg-gray-800" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                    <option value="">All Roles</option>
                    <option value="user">User</option>
                </select>
            </div>

            {/* Analytics */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800 p-4 rounded-xl">
                    <h2>Total Users</h2>
                    <p className="text-2xl">{displayedUsers.length}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl">
                    <h2>Weight Loss</h2>
                    <p className="text-2xl">
                        {displayedUsers.filter((u) => u.fitnessGoal === "weight_loss").length}
                    </p>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl">
                    <h2>Muscle Gain</h2>
                    <p className="text-2xl">
                        {displayedUsers.filter((u) => u.fitnessGoal === "muscle_gain").length}
                    </p>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl">
                    <h2>Endurance / General</h2>
                    <p className="text-2xl">
                        {displayedUsers.filter(
                            (u) => u.fitnessGoal === "endurance" || u.fitnessGoal === "general_fitness"
                        ).length}
                    </p>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-gray-900 p-4 rounded-xl mb-6">
                <h2 className="text-xl mb-4">All Users 👥</h2>
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-700">
                            <th onClick={() => handleSort("name")}>Name</th>
                            <th onClick={() => handleSort("email")}>Email</th>
                            <th onClick={() => handleSort("fitnessGoal")}>Goal</th>
                            <th onClick={() => handleSort("activityLevel")}>Activity</th>
                            <th onClick={() => handleSort("role")}>Role</th>
                            <th onClick={() => handleSort("signupDate")}>Signup Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedUsers.map((user) => (
                            <tr key={user.id} className="border-b border-gray-800">
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.fitnessGoal}</td>
                                <td>{user.activityLevel}</td>
                                <td>{user.role}</td>
                                <td>{new Date(user.signupDate).toLocaleDateString()}</td>
                                <td>
                                    <Button onClick={() => handleDelete(user.id)} className="bg-red-500 px-3 py-1 rounded">
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Feedback Table */}
            <div className="bg-gray-900 p-4 rounded-xl">
                <h2 className="text-xl mb-4">User Feedbacks 💬</h2>
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-700">
                            <th>Name</th>
                            <th>Email</th>
                            <th>Feedback</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {feedbacks.map((fb) => (
                            <tr key={fb.id} className="border-b border-gray-800">
                                <td>{fb.name}</td>
                                <td>{fb.email}</td>
                                <td>{fb.feedback_text}</td>
                                <td>
                                    <Button onClick={() => handleDeleteFeedback(fb.id)} className="bg-red-500 px-3 py-1 rounded">
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;