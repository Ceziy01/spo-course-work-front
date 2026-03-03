import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";
import { getRoleLabel } from "../utils/utils";
import "./UsersPage.css"
import { ReactComponent as BinIcon } from "../assets/bin.svg"
import { ReactComponent as PenIcon } from "../assets/pen.svg"

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [firstName, setFirstname] = useState("");
  const [lastName, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");

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

      const res = await fetch(`${API_BASE_URL}/auth/admin/create-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          username,
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          role: role
        })
      });

      if (!res.ok) return alert("Failed to create user");

      setUsername("");
      setFirstname("");
      setLastname("");
      setEmail("");
      setPassword("");
      setRole("customer");
      loadUsers();
    };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete user?")) return;

    const res = await fetch(`${API_BASE_URL}/auth/admin/users/${id}`, {
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
              <th style={{ width: 30 }}>ID</th>
              <th>Логин</th>
              <th>Имя</th>
              <th>Фамилия</th>
              <th>Почта</th>
              <th style={{ width: 80 }}>Пароль</th>
              <th style={{ width: 120 }}>Тип аккаунта</th>
              <th></th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.first_name}</td>
                <td>{u.last_name}</td>
                <td>{u.email}</td>
                <td>{"********"}</td>
                <td>{getRoleLabel(u.role)}</td>
                <td>
                  <button className="delete-icon-btn" onClick={() => deleteUser(u.id)}>
                    <BinIcon />
                  </button>
                </td>
                <td>
                  <button className="edit-icon-btn" onClick={() => deleteUser(u.id)}>
                    <PenIcon />
                  </button>
                </td>
              </tr>
            ))}

            <tr>
              <td>—</td>

              <td>
                <input
                  placeholder="Логин"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </td>

              <td>
                <input
                  placeholder="Имя"
                  value={firstName}
                  onChange={e => setFirstname(e.target.value)}
                />
              </td>

              <td>
                <input
                  placeholder="Фамилия"
                  value={lastName}
                  onChange={e => setLastname(e.target.value)}
                />
              </td>

              <td>
                <input
                  placeholder="Почта"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
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
                <select
                  name="role"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="table-select"
                >
                  <option value="customer">Клиент</option>
                  <option value="admin">Администратор</option>
                  <option value="management">Руководство</option>
                  <option value="sales_manager">Менеджер по продажам</option>
                  <option value="purchasing_manager">Менеджер по закупкам</option>
                  <option value="warehouse_keeper">Кладовщик</option>
                  <option value="accountant">Бухгалтер</option>
                  <option value="supplier">Поставщик</option>
                </select>
            </td>


              <td>
                <button type="submit" className="primary-btn">Добавить</button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  );
}

export default UsersPage;
