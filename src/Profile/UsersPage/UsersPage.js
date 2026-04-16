import { useEffect, useState, useRef } from "react";
import { fetchWithAuth } from "../../utils/api";
import { getRoleLabel } from "../../utils/utils";
import "../../styles/shared.css";
import ActionButton from "../../components/ActionButton/ActionButton";
import ResetPasswordModal from "./ResetPasswordModal";
import { exportTableToExcel } from "../../utils/export";

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    role: "customer"
  });

  const [username, setUsername] = useState("");
  const [firstName, setFirstname] = useState("");
  const [lastName, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const tableRef = useRef(null);

  const [resetPasswordModal, setResetPasswordModal] = useState({
    isOpen: false,
    userId: null,
    username: ""
  });

  const impersonate = async (userId) => {
    if (!window.confirm("Войти от имени этого пользователя?")) return;
    try {
      const res = await fetchWithAuth(`/auth/admin/impersonate/${userId}`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.access_token);
        window.location.href = "/info";
      } else {
        const error = await res.json();
        alert(error.detail || "Ошибка входа");
      }
    } catch (error) {
      console.error("Impersonate error:", error);
      alert("Ошибка входа");
    }
  };

  const handleExport = () => {
    if (tableRef.current) {
      exportTableToExcel(tableRef.current, `пользователи_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`);
    }
  };

  const loadUsers = async () => {
    const res = await fetchWithAuth("/auth/admin/users");
    if (!res.ok) return alert("Failed to load users");
    setUsers(await res.json());
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const createUser = async (e) => {
    e.preventDefault();

    const res = await fetchWithAuth("/auth/admin/create-user", {
      method: "POST",
      body: JSON.stringify({
        username,
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        role
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

    const res = await fetchWithAuth(`/auth/admin/users/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) return alert("Failed to delete user");

    loadUsers();
  };

  const startEdit = (user) => {
    setEditingId(user.id);
    setEditForm({
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async () => {
    if (!editForm.username.trim() || !editForm.first_name.trim() || !editForm.last_name.trim() || !editForm.email.trim()) {
      alert("Все поля (кроме пароля) обязательны");
      return;
    }

    const res = await fetchWithAuth(`/auth/admin/users/${editingId}`, {
      method: "PATCH",
      body: JSON.stringify(editForm)
    });

    if (!res.ok) {
      const error = await res.json();
      alert(error.detail || "Failed to update user");
      return;
    }

    cancelEdit();
    loadUsers();
  };

  const openResetPasswordModal = (userId, username) => {
    setResetPasswordModal({
      isOpen: true,
      userId,
      username
    });
  };

  const closeResetPasswordModal = () => {
    setResetPasswordModal({
      isOpen: false,
      userId: null,
      username: ""
    });
  };

  const resetPassword = async (newPassword) => {
    const res = await fetchWithAuth(`/auth/admin/users/${resetPasswordModal.userId}/reset-password`, {
      method: "POST",
      body: JSON.stringify({ new_password: newPassword })
    });

    if (!res.ok) {
      const error = await res.json();
      alert(error.detail || "Failed to reset password");
      return;
    }

    alert("Пароль успешно сброшен");
    closeResetPasswordModal();
  };

  return (
    <div className="container">
      <ResetPasswordModal
        isOpen={resetPasswordModal.isOpen}
        onClose={closeResetPasswordModal}
        onConfirm={resetPassword}
        username={resetPasswordModal.username}
      />

      <form onSubmit={createUser}>
        <div className="page-header" style={{ marginBottom: '24px' }}>
          <h2 className="page-title" style={{ marginBottom: 0 }}>Пользователи</h2>
          <div className="header-actions">
            <ActionButton type="excel" tip="Экспорт в Excel" onClick={handleExport}>
              <span className="material-symbols-outlined">table_view</span>
            </ActionButton>
          </div>
        </div>

        <table ref={tableRef} className="table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>ID</th>
              <th>Логин</th>
              <th>Имя</th>
              <th>Фамилия</th>
              <th>Почта</th>
              <th style={{ width: '120px' }}>Пароль</th>
              <th style={{ width: '160px' }}>Тип аккаунта</th>
              <th style={{ width: '180px' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) =>
              u.id === editingId ? (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td><input name="username" value={editForm.username} onChange={handleEditChange} placeholder="Логин" /></td>
                  <td><input name="first_name" value={editForm.first_name} onChange={handleEditChange} placeholder="Имя" /></td>
                  <td><input name="last_name" value={editForm.last_name} onChange={handleEditChange} placeholder="Фамилия" /></td>
                  <td><input name="email" value={editForm.email} onChange={handleEditChange} placeholder="Почта" /></td>
                  <td>********</td>
                  <td>
                    <select name="role" value={editForm.role} onChange={handleEditChange} className="table-select">
                      <option value="customer">Клиент</option>
                      <option value="admin">Администратор</option>
                      <option value="management">Руководство</option>
                      <option value="sales_manager">Менеджер по продажам</option>
                      <option value="purchase_manager">Менеджер по закупкам</option>
                      <option value="warehouse_keeper">Кладовщик</option>
                      <option value="accountant">Бухгалтер</option>
                      <option value="supplier">Поставщик</option>
                    </select>
                  </td>
                  <td>
                    <div className="edit-actions">
                      <ActionButton type="apply" onClick={saveEdit} tip="Сохранить"><span className="material-symbols-outlined">check</span></ActionButton>
                      <ActionButton type="danger" onClick={cancelEdit} tip="Отменить"><span className="material-symbols-outlined">close</span></ActionButton>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.first_name}</td>
                  <td>{u.last_name}</td>
                  <td>{u.email}</td>
                  <td>********</td>
                  <td><span className="badge-role">{getRoleLabel(u.role)}</span></td>
                  <td>
                    <div className="actions-container">
                      <ActionButton type="danger" onClick={() => deleteUser(u.id)} tip="Удалить"><span className="material-symbols-outlined">delete</span></ActionButton>
                      <ActionButton type="neutral" onClick={() => startEdit(u)} tip="Редактировать"><span className="material-symbols-outlined">edit</span></ActionButton>
                      <ActionButton type="extra" onClick={() => openResetPasswordModal(u.id, u.username)} tip="Сменить пароль"><span className="material-symbols-outlined">lock_reset</span></ActionButton>
                      <ActionButton type="impersonate" tip="Войти как пользователь" onClick={() => impersonate(u.id)}><span className="material-symbols-outlined">switch_account</span></ActionButton>
                    </div>
                  </td>
                </tr>
              )
            )}
            <tr>
              <td></td>
              <td><input placeholder="Логин" value={username} onChange={(e) => setUsername(e.target.value)} /></td>
              <td><input placeholder="Имя" value={firstName} onChange={(e) => setFirstname(e.target.value)} /></td>
              <td><input placeholder="Фамилия" value={lastName} onChange={(e) => setLastname(e.target.value)} /></td>
              <td><input placeholder="Почта" value={email} onChange={(e) => setEmail(e.target.value)} /></td>
              <td><input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%' }} /></td>
              <td>
                <select name="role" value={role} onChange={(e) => setRole(e.target.value)} className="table-select">
                  <option value="customer">Клиент</option>
                  <option value="admin">Администратор</option>
                  <option value="management">Руководство</option>
                  <option value="sales_manager">Менеджер по продажам</option>
                  <option value="purchase_manager">Менеджер по закупкам</option>
                  <option value="warehouse_keeper">Кладовщик</option>
                  <option value="accountant">Бухгалтер</option>
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