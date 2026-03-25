import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userData") || "{}");

  return (
    <div>
      <h1>User Dashboard 👤</h1>

      {/* ✅ Admin button only for admin */}
      {user.role === "admin" && (
        <button onClick={() => navigate("/admin")}>
          Go to Admin Dashboard
        </button>
      )}
    </div>
  );
};

export default UserDashboard;