import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./SideBar";
import UsersPage from "./UsersPage";
import "./AdminPanel.css";

function AdminPanel() {
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
