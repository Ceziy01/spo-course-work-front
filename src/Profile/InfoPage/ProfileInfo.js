import { useEffect, useState } from "react";
import { useAuth } from "../../Auth/AuthContext";
import { fetchWithAuth } from "../../utils/api";
import { getRoleLabel } from "../../utils/utils";
import "./ProfileInfo.css";

function ProfileInfo() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(authUser);

  useEffect(() => {
    if (!user) {
      fetchWithAuth("/auth/users/me")
        .then(res => {
          if (!res.ok) throw new Error("Failed to load profile");
          return res.json();
        })
        .then(setUser)
        .catch(() => alert("Failed to load profile"));
    }
  }, [user]);

  if (!user) return <div className="loading">Загрузка...</div>;

  return (
    <div className="profile-info-container">
      <h2 className="page-title">Информация об аккаунте</h2>
      
      <div className="profile-info-card">
        <div className="profile-info-row">
          <span className="profile-info-label">Логин</span>
          <span className="profile-info-value">{user.username}</span>
        </div>

        <div className="profile-info-row">
          <span className="profile-info-label">Имя</span>
          <span className="profile-info-value">{user.first_name || "—"}</span>
        </div>

        <div className="profile-info-row">
          <span className="profile-info-label">Фамилия</span>
          <span className="profile-info-value">{user.last_name || "—"}</span>
        </div>

        <div className="profile-info-row">
          <span className="profile-info-label">Email</span>
          <span className="profile-info-value">{user.email || "—"}</span>
        </div>

        <div className="profile-info-row">
          <span className="profile-info-label">Тип аккаунта</span>
          <span className="profile-info-value role-badge">{getRoleLabel(user.role)}</span>
        </div>
      </div>
    </div>
  );
}

export default ProfileInfo;