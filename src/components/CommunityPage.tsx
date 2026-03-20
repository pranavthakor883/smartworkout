import { useEffect, useState } from "react";

type Group = {
  id: number;
  name: string;
  description: string;
  members: number;
  joined?: boolean;
};

const CommunityPage = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // TODO: Replace this with API call
    const fetchGroups = async () => {
      const data: Group[] = [
        { id: 1, name: "Muscle Gain Club", description: "Strength & Power", members: 120 },
        { id: 2, name: "Runners Club", description: "Endurance & Cardio", members: 80 },
        { id: 3, name: "Yoga & Mobility", description: "Flexibility & Balance", members: 60 },
        { id: 4, name: "HIIT Heroes", description: "High Intensity Training", members: 50 },
      ];
      setGroups(data);
    };

    fetchGroups();
  }, []);

  const handleJoinLeave = (groupId: number) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, joined: !g.joined, members: g.joined ? g.members - 1 : g.members + 1 } : g
      )
    );
  };

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <h1 className="text-3xl font-bold mb-6">Fitness Groups / Clubs</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search groups..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 p-2 rounded border border-gray-600 w-full max-w-md"
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => (
          <div key={group.id} className="p-4 bg-gray-800 rounded-xl flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold">{group.name}</h2>
              <p className="text-gray-300 mb-2">{group.description}</p>
              <p className="text-sm">Members: {group.members}</p>
            </div>
            <button
              onClick={() => handleJoinLeave(group.id)}
              className={`mt-4 px-3 py-1 rounded text-white ${
                group.joined ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {group.joined ? "Leave Group" : "Join Group"}
            </button>
          </div>
        ))}

        {filteredGroups.length === 0 && (
          <p className="text-gray-400 col-span-full text-center mt-6">
            No groups found
          </p>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;