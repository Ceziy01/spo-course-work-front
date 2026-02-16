import { useState } from "react";
import "./Login.css"

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const res = await fetch("http://localhost:8000/auth/token", {
      method: "POST",
      headers: {"Content-Type": "application/x-www-form-urlencoded"},
      body: formData.toString()
    });

    if (!res.ok) return alert(`Login failed \n code: ${res.status}`);
    const data = await res.json();
    localStorage.setItem("token", data.access_token);
    window.location.href = "/";
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username"/>
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"/>
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
