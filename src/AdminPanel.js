import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function AdminPanel() {
  const navigate = useNavigate();

  const [authorized, setAuthorized] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    fetch("http://localhost:8000/auth/users/me", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => {
        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/");
          return;
        }
        return res.json();
      })
      .then(data => {
        if (!data.is_admin) {
          navigate("/");
        } else {
          setAuthorized(true);
        }
      });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:8000/auth/admin/create-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        username,
        password,
        is_admin: isAdmin
      })
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
      navigate("/");
      return;
    }

    if (res.status === 403) {
      alert("Admins only");
      navigate("/");
      return;
    }

    if (res.ok) {
      alert("User created");
      setUsername("");
      setPassword("");
      setIsAdmin(false);
    }
  };

  if (!authorized) return <p>Checking access...</p>;

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={{ textAlign: "center" }}>Admin Panel</h2>

      <input
        value={username}
        onChange={e => setUsername(e.target.value)}
        placeholder="Username"
      />

      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
      />

      <label style={{ fontSize: "0.9rem" }}>
        <input
          type="checkbox"
          checked={isAdmin}
          onChange={e => setIsAdmin(e.target.checked)}
        />
        Make admin
      </label>

      <button type="submit">Create User</button>
    </form>
  );
}

export default AdminPanel;
