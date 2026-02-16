import { useEffect, useState } from "react";
import "./Profile.css";

function Profile() {
  const [user, setUser] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:8000/auth/users/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(setUser)
      .catch(() => alert("Failed to load profile"));
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  if (!user) return <div className="profile-page">Loading...</div>;

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h2>Профиль</h2>

        <div className="profile-row">
          <span>Имя пользователя</span>
          <b>{user.username}</b>
        </div>

        <div className="profile-row">
          <span>Тип аккаунта</span>
          <b>{user.is_admin ? "Admin" : "User"}</b>
        </div>

        {user.is_admin && (
          <button
            className="admin-btn"
            onClick={() => (window.location.href = "/admin")}
          >
            Админ панель
          </button>
        )}

        <button className="logout-btn" onClick={logout}>
          Выйти
        </button>
      </div>
    </div>
  );

}

export default Profile;
