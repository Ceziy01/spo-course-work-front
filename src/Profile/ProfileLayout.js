import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../Auth/AuthContext";
import ProfileInfo from "./InfoPage/ProfileInfo";
import UsersPage from "./UsersPage/UsersPage";
import Sidebar from "./Sidebar";
import "./ProfileLayout.css";

function ProfileLayout() {
  const { isAdmin } = useAuth();

  return (
    <div className="profile-layout">
      <Sidebar />
      
      <div className="profile-content">
        <Routes>
          <Route path="/" element={<Navigate to="/info" replace />} />
          <Route path="/info" element={<ProfileInfo />} />
          {isAdmin && <Route path="/users" element={<UsersPage />} />}
          <Route path="*" element={<Navigate to="/info" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default ProfileLayout;