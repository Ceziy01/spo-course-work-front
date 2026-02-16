import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import "./Login.css"

function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    navigate("/");
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/")
      return;
    } 

    fetch("http://localhost:8000/auth/users/me", {
      headers: {"Authorization": `Bearer ${token}`}
    })
      .then(res => {
        if (res.status === 401) {
          logout();
          return;
      }
      return res.json();
      })
      .then(data => setUser(data))
  }, [logout, navigate]);

  if (!user) return <p>Loading...</p>;
  return (
    <form>
      <h2 style={{ textAlign: "center" }}>Profile</h2>

      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>Role:</strong> {user.is_admin ? "Administrator" : "User"}</p>

      {user.is_admin && (
        <button
          type="button"
          onClick={() => navigate("/admin")}
        >
          Admin Panel
        </button>
      )}

      <button type="button" onClick={logout}>
        Logout
      </button>
    </form>
  );
}

export default Profile;