import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";
import "./Profile.css";
import { getRoleLabel } from "../utils/utils";

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
          <span>Логин</span>
          <b>{user.username}</b>
        </div>

        <div className="profile-row">
          <span>Имя</span>
          <b>{user.first_name}</b>
        </div>

        <div className="profile-row">
          <span>Фамилия</span>
          <b>{user.last_name}</b>
        </div>

        <div className="profile-row">
          <span>Почта</span>
          <b>{user.email}</b>
        </div>

        <div className="profile-row">
          <span>Тип аккаунта</span>
          <b>{getRoleLabel(user.role)}</b>
        </div>
      </div>
    </div>
  );

}

export default Profile;
