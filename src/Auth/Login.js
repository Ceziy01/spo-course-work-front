import { useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import "./Login.css"

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
      headers: {"Content-Type": "application/x-www-form-urlencoded"},
      body: formData.toString()
    });

    if (!res.ok) return alert(`Login failed \n code: ${res.status}`);
    const data = await res.json();
    const userRes = await fetch(`${API_BASE_URL}/auth/users/me`, {
      headers: { Authorization: `Bearer ${data.access_token}`}
    });

    if (userRes.ok) {
      const userData = await userRes.json();
      login(data.access_token, userData);
      navigate("/");
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Имя пользователя"/>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Пароль"/>
        <button type="submit">Войти</button>
      </form>
    </div>
  );
}

export default Login;
