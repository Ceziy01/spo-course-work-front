import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../Auth/AuthContext";
import "./Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();
  const { isAdmin, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="profile-sidebar">
      <h2>Мой профиль</h2>
      
      <nav className="profile-nav">
        <NavLink 
          to="/info" 
          className={({ isActive }) => 
            `profile-nav-item ${isActive ? "active" : ""}`
          }
        >
          Информация об аккаунте
        </NavLink>
        
        {isAdmin && (
          <NavLink 
            to="/users" 
            className={({ isActive }) => 
              `profile-nav-item ${isActive ? "active" : ""}`
            }
          >
            Управление пользователями
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-sidebar-btn">
          Выйти
        </button>
      </div>
    </div>
  );
}

export default Sidebar;