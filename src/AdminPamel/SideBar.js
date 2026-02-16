import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <div className="sidebar">
      <h2>Админ панель</h2>

      <nav>
        <NavLink to="/admin/users" className="nav-item">
          пользователи
        </NavLink>
      </nav>
    </div>
  );
}

export default Sidebar;
