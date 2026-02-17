import { NavLink } from "react-router-dom";
import "./SideBar.css"

function Sidebar() {
  return (
    <div className="sidebar">
      <h2>Админ панель</h2>

      <nav>
        <NavLink to="/admin/users" className="nav-item">
          Пользователи
        </NavLink>
        <NavLink to="/admin/settings" className="nav-item">
          Настройки
        </NavLink>
      </nav>
    </div>
  );
}

export default Sidebar;
