import { useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const res = await fetch(`${API_BASE_URL}/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString()
    });

    if (!res.ok) return alert(`Login failed \n code: ${res.status}`);
    const data = await res.json();
    const userRes = await fetch(`${API_BASE_URL}/auth/users/me`, {
      headers: { Authorization: `Bearer ${data.access_token}` }
    });

    if (userRes.ok) {
      const userData = await userRes.json();
      login(data.access_token, data.refresh_token, userData);
      navigate("/info");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="title">Вход в систему</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-field">
            <label>Имя пользователя</label>
            <div className="input-wrapper">
              <span className="material-symbols-outlined">person</span>
              <input
                type="text"
                placeholder="логин"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <div className="input-field">
            <label>Пароль</label>
            <div className="input-wrapper">
              <span className="material-symbols-outlined">lock</span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="login-actions">
            <button type="submit" className="btn-primary">
              <span className="material-symbols-outlined">login</span>
              Войти
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;