import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../Auth/AuthContext";
import "./Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  
  const canViewInventory = user && !["customer"].includes(user.role);
  const canManageItems = user && (user.role === 'admin' || user.role === 'warehouse_keeper');
  const canViewCatalog = user && !canManageItems;
  const isCustomer = user?.role === "customer";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="profile-sidebar">
      <h2>Профиль</h2>
      
      <nav className="profile-nav">
        <NavLink 
          to="/info" 
          className={({ isActive }) => `profile-nav-item ${isActive ? "active" : ""}`}
        >
          Информация об аккаунте
        </NavLink>
        
        {isAdmin && (
          <NavLink 
            to="/users" 
            className={({ isActive }) => `profile-nav-item ${isActive ? "active" : ""}`}
          >Управление пользователями</NavLink>
        )}
        {isCustomer && (
          <>
            <NavLink 
              to="/catalog"
              className={({ isActive }) => `profile-nav-item ${isActive ? "active" : ""}`}
              >Каталог</NavLink>

            <NavLink 
              to="/cart"
              className={({ isActive }) => `profile-nav-item ${isActive ? "active" : ""}`}
            >Корзина</NavLink>
          </>
        )}
        {canViewInventory && (
          <>
            <NavLink 
              to="/items" 
              className={({ isActive }) => `profile-nav-item ${isActive ? "active" : ""}`}
            >
              Товары
            </NavLink>

            <NavLink 
              to="/warehouses" 
              className={({ isActive }) => `profile-nav-item ${isActive ? "active" : ""}`}
            >
              Склады
            </NavLink>

            <NavLink 
              to="/categories" 
              className={({ isActive }) => `profile-nav-item ${isActive ? "active" : ""}`}
            >
              Категории
            </NavLink>
          </>
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