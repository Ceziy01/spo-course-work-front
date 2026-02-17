import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../Auth/AuthContext"
import "./Navigation.css";

function Navigation() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, isAdmin, logout } = useAuth();

    if (location.pathname === "/login" || !isAuthenticated) {
        return null;
    }

    const handleLogout = () => {
        logout();
        navigate("/login");
    }

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <NavLink 
                    to="/" 
                    className={({ isActive }) => 
                        isActive ? "nav-link active" : "nav-link"
                    }
                >
                    Профиль
                </NavLink>
                
                {isAdmin && (
                    <NavLink 
                        to="/admin" 
                        className={({ isActive }) => 
                            isActive ? "nav-link active" : "nav-link"
                        }
                    >
                        Админ панель
                    </NavLink>
                )}
            </div>
            <div className="navbar-right">
                <button onClick={handleLogout} className="logout-nav-btn">Выйти</button>
            </div>
        </nav>
    );
}

export default Navigation;