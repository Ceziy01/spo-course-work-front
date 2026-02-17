import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";
import "./Profile.css";

function Profile() {
  const [user, setUser] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${API_BASE_URL}/auth/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(setUser)
      .catch(() => alert("Failed to load profile"));
  }, []);

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
          <b>{user.is_admin ? "Админ" : "Пользователь"}</b>
        </div>
      </div>
    </div>
  );

}

export default Profile;
