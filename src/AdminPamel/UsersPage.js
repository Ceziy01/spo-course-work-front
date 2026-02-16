import { useEffect, useState } from "react";

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const token = localStorage.getItem("token");

  const loadUsers = async () => {
    const res = await fetch("http://localhost:8000/auth/admin/users", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) return alert("Failed to load users");
    setUsers(await res.json());
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const createUser = async (e) => {
      e.preventDefault();

      const res = await fetch("http://localhost:8000/auth/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          username,
          password,
          is_admin: isAdmin
        })
      });

      if (!res.ok) return alert("Failed to create user");

      setUsername("");
      setPassword("");
      setIsAdmin(false);
      loadUsers();
    };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete user?")) return;

    const res = await fetch(`http://localhost:8000/auth/admin/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) return alert("Failed to delete user");

    loadUsers();
  };

  return (
    <div>
      <h2 className="page-title">Пользователи</h2>

      <form onSubmit={createUser}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 70 }}>ID</th>
              <th>Имя пользователя</th>
              <th style={{ width: 140 }}>Пароль</th>
              <th style={{ width: 120 }}>Тип аккаунта</th>
              <th style={{ width: 120 }}></th>
            </tr>
          </thead>

          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{"********"}</td>
                <td>{u.is_admin ? "Админ" : "Пользователь"}</td>
                <td>
                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() => deleteUser(u.id)}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}

            <tr>
              <td>—</td>

              <td>
                <input
                  placeholder="Имя пользователя"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </td>

              <td>
                <input
                  type="password"
                  placeholder="Пароль"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </td>

              <td>
                <label className="role-checkbox">
                    <input
                        type="checkbox"
                        checked={isAdmin}
                        onChange={e => setIsAdmin(e.target.checked)}
                    />
                    <span>Админ</span>
                </label>
            </td>


              <td>
                <button type="submit">Добавить</button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  );
}

export default UsersPage;
