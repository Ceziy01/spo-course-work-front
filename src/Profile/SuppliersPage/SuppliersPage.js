import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../Auth/AuthContext";
import { fetchWithAuth } from "../../utils/api";
import { ReactComponent as BinIcon } from "../../assets/bin.svg";
import { ReactComponent as PenIcon } from "../../assets/pen.svg";
import { ReactComponent as ApplyIcon } from "../../assets/apply.svg";
import { ReactComponent as DenyIcon } from "../../assets/deny.svg";
import { ReactComponent as ExcelIcon } from "../../assets/excel.svg";
import ActionButton from "../../components/ActionButton/ActionButton";
import { exportTableToExcel } from "../../utils/export";
import "../../styles/shared.css";

function SuppliersPage() {
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "purchase_manager";

  const [suppliers, setSuppliers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", address: "" });

  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const tableRef = useRef(null);

  const handleExport = () => {
    if (tableRef.current) {
      exportTableToExcel(tableRef.current, `поставщики_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}`);
    }
  };

  const loadSuppliers = async () => {
    const res = await fetchWithAuth("/suppliers");
    if (!res.ok) return alert("Не удалось загрузить поставщиков");
    setSuppliers(await res.json());
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const createSupplier = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newAddress.trim()) {
      alert("Заполните все поля");
      return;
    }
    const res = await fetchWithAuth("/suppliers", {
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
    loadSuppliers();
  };

  const deleteSupplier = async (id) => {
    if (!window.confirm("Удалить поставщика?")) return;
    const res = await fetchWithAuth(`/suppliers/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const error = await res.json();
      alert(error.detail || "Ошибка удаления");
      return;
    }
    loadSuppliers();
  };

  const startEdit = (sup) => {
    setEditingId(sup.id);
    setEditForm({ name: sup.name, address: sup.address });
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
    const res = await fetchWithAuth(`/suppliers/${editingId}`, {
      method: "PATCH",
      body: JSON.stringify(editForm)
    });
    if (!res.ok) {
      const error = await res.json();
      alert(error.detail || "Ошибка обновления");
      return;
    }
    cancelEdit();
    loadSuppliers();
  };

  return (
    <div className="container">
      <div className="users-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="page-title">Поставщики</h2>
        <ActionButton type="excel" tip="Экспорт в эксель" onClick={handleExport}><ExcelIcon/></ActionButton>
      </div>

      <table ref={tableRef} className="table">
        <thead>
          <tr>
            <th style={{ width: 60 }}>ID</th>
            <th>Название</th>
            <th>Адрес</th>
            {canEdit && <th style={{ width: 100 }}>Действия</th>}
          </tr>
        </thead>
        <tbody>
          {suppliers.map(sup => (
            sup.id === editingId ? (
              <tr key={sup.id}>
                <td>{sup.id}</td>
                <td><input name="name" value={editForm.name} onChange={handleEditChange} placeholder="Название" /></td>
                <td><input name="address" value={editForm.address} onChange={handleEditChange} placeholder="Адрес" /></td>
                {canEdit && (
                  <td>
                    <div className="edit-actions">
                      <ActionButton type="apply" onClick={saveEdit} tip="Сохранить"><ApplyIcon/></ActionButton>
                      <ActionButton type="danger" onClick={cancelEdit} tip="Отменить"><DenyIcon/></ActionButton>
                    </div>
                  </td>
                )}
              </tr>
            ) : (
              <tr key={sup.id}>
                <td>{sup.id}</td>
                <td>{sup.name}</td>
                <td>{sup.address}</td>
                {canEdit && (
                  <td>
                    <div className="actions-container">
                      <ActionButton type="neutral" onClick={() => startEdit(sup)} tip="Редактировать"><PenIcon/></ActionButton>
                      <ActionButton type="danger" onClick={() => deleteSupplier(sup.id)} tip="Удалить"><BinIcon/></ActionButton>
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
              <td>
                <button type="button" className="primary-btn" onClick={createSupplier}>Добавить</button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default SuppliersPage;