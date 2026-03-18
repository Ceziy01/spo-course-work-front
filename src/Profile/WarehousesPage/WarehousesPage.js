import { useEffect, useState } from "react";
import { useAuth } from "../../Auth/AuthContext";
import { fetchWithAuth } from "../../utils/api";
import { ReactComponent as BinIcon } from "../../assets/bin.svg";
import { ReactComponent as PenIcon } from "../../assets/pen.svg";
import "../UsersPage/UsersPage.css";

function WarehousesPage() {
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "warehouse_keeper";

  const [warehouses, setWarehouses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", address: "" });

  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");

  const loadWarehouses = async () => {
    const res = await fetchWithAuth("/warehouses");
    if (!res.ok) return alert("Не удалось загрузить склады");
    setWarehouses(await res.json());
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  const createWarehouse = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newAddress.trim()) {
      alert("Заполните все поля");
      return;
    }
    const res = await fetchWithAuth("/warehouses", {
      method: "POST",
      body: JSON.stringify({ name: newName, address: newAddress })
    });
    if (!res.ok) {
      const error = await res.json();
      alert(error.detail || "Ошибка создания");
      return;
    }
    setNewName("");
    setNewAddress("");
    loadWarehouses();
  };

  const deleteWarehouse = async (id) => {
    if (!window.confirm("Удалить склад?")) return;
    const res = await fetchWithAuth(`/warehouses/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const error = await res.json();
      alert(error.detail || "Ошибка удаления");
      return;
    }
    loadWarehouses();
  };

  const startEdit = (wh) => {
    setEditingId(wh.id);
    setEditForm({ name: wh.name, address: wh.address });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const saveEdit = async () => {
    if (!editForm.name.trim() || !editForm.address.trim()) {
      alert("Все поля обязательны");
      return;
    }
    const res = await fetchWithAuth(`/warehouses/${editingId}`, {
      method: "PATCH",
      body: JSON.stringify(editForm)
    });
    if (!res.ok) {
      const error = await res.json();
      alert(error.detail || "Ошибка обновления");
      return;
    }
    cancelEdit();
    loadWarehouses();
  };

  return (
    <div className="container">
      <h2 className="page-title">Склады</h2>

      <table className="table">
        <thead>
          <tr>
            <th style={{ width: 60 }}>ID</th>
            <th>Название</th>
            <th>Адрес</th>
            {canEdit && <th colSpan="2">Действия</th>}
          </tr>
        </thead>
        <tbody>
          {warehouses.map(wh => (
            wh.id === editingId ? (
              <tr key={wh.id}>
                <td>{wh.id}</td>
                <td><input name="name" value={editForm.name} onChange={handleEditChange} placeholder="Название" /></td>
                <td><input name="address" value={editForm.address} onChange={handleEditChange} placeholder="Адрес" /></td>
                <td colSpan="2">
                  <div className="edit-actions">
                    <button type="button" className="save-btn" onClick={saveEdit}>Сохранить</button>
                    <button type="button" className="cancel-btn" onClick={cancelEdit}>Отмена</button>
                  </div>
                </td>
              </tr>
            ) : (
              <tr key={wh.id}>
                <td>{wh.id}</td>
                <td>{wh.name}</td>
                <td>{wh.address}</td>
                {canEdit && (
                  <td colSpan="2">
                    <div className="actions-container">
                      <button type="button" className="action-btn delete-btn" onClick={() => deleteWarehouse(wh.id)} title="Удалить">
                        <BinIcon />
                      </button>
                      <button type="button" className="action-btn edit-btn" onClick={() => startEdit(wh)} title="Редактировать">
                        <PenIcon />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            )
          ))}
          {canEdit && (
            <tr>
              <td></td>
              <td><input placeholder="Название" value={newName} onChange={e => setNewName(e.target.value)} /></td>
              <td><input placeholder="Адрес" value={newAddress} onChange={e => setNewAddress(e.target.value)} /></td>
              <td colSpan="2">
                <button type="button" className="primary-btn" onClick={createWarehouse}>Добавить</button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default WarehousesPage;