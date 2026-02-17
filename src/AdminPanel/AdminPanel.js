import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../Auth/AuthContext";
import Sidebar from "./SideBar";
import UsersPage from "./UsersPage";
import "./AdminPanel.css";

function AdminPanel() {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isAdmin) {
    return <Navigate to="/"/>;
  }

  return (
    <div className="admin-layout">
      <Sidebar />

      <div className="admin-content">
        <Routes>
          <Route path="/" element={<Navigate to="users" />} />
          <Route path="users" element={<UsersPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default AdminPanel;
