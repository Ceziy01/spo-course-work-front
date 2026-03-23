import { useEffect, useState } from "react";
import { useAuth } from "../../Auth/AuthContext";
import { fetchWithAuth } from "../../utils/api";
import { ReactComponent as BinIcon } from "../../assets/bin.svg";
import { ReactComponent as PenIcon } from "../../assets/pen.svg";
import { ReactComponent as ApplyIcon } from "../../assets/apply.svg";
import { ReactComponent as DenyIcon } from "../../assets/deny.svg";
import "../../styles/shared.css"
function CategoriesPage() {
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "warehouse_keeper";

  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", description: "" });

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const loadCategories = async () => {
    const res = await fetchWithAuth("/categories");
    if (!res.ok) return alert("Не удалось загрузить категории");
    setCategories(await res.json());
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const createCategory = async (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      alert("Название категории обязательно");
      return;
    }
    const res = await fetchWithAuth("/categories", {
      method: "POST",
      body: JSON.stringify({ name: newName, description: newDescription || null })
    });
    if (!res.ok) {
      const error = await res.json();
      alert(error.detail || "Ошибка создания");
      return;
    }
    setNewName("");
    setNewDescription("");
    loadCategories();
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Удалить категорию?")) return;
    const res = await fetchWithAuth(`/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const error = await res.json();
      alert(error.detail || "Ошибка удаления");
      return;
    }
    loadCategories();
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditForm({ name: cat.name, description: cat.description || "" });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const saveEdit = async () => {
    if (!editForm.name.trim()) {
      alert("Название обязательно");
      return;
    }
    const res = await fetchWithAuth(`/categories/${editingId}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: editForm.name,
        description: editForm.description || null
      })
    });
    if (!res.ok) {
      const error = await res.json();
      alert(error.detail || "Ошибка обновления");
      return;
    }
    cancelEdit();
    loadCategories();
  };

  return (
    <div className="container">
      <h2 className="page-title">Категории</h2>

      <table className="table">
        <thead>
          <tr>
            <th style={{ width: 60 }}>ID</th>
            <th>Название</th>
            <th>Описание</th>
            {canEdit && <th colSpan="2">Действия</th>}
          </tr>
        </thead>
        <tbody>
          {categories.map(cat => (
            cat.id === editingId ? (
              <tr key={cat.id}>
                <td>{cat.id}</td>
                <td><input name="name" value={editForm.name} onChange={handleEditChange} placeholder="Название" /></td>
                <td><input name="description" value={editForm.description} onChange={handleEditChange} placeholder="Описание" /></td>
                <td colSpan="2">
                  <div className="edit-actions">
                    <button type="button" className="action-btn apply-btn" onClick={saveEdit}><ApplyIcon/></button>
                    <button type="button" className="action-btn deny-btn" onClick={cancelEdit}><DenyIcon/></button>
                  </div>
                </td>
              </tr>
            ) : (
              <tr key={cat.id}>
                <td>{cat.id}</td>
                <td>{cat.name}</td>
                <td>{cat.description || "—"}</td>
                {canEdit && (
                  <td colSpan="2">
                    <div className="actions-container">
                      <button type="button" className="action-btn delete-btn" onClick={() => deleteCategory(cat.id)} title="Удалить">
                        <BinIcon />
                      </button>
                      <button type="button" className="action-btn edit-btn" onClick={() => startEdit(cat)} title="Редактировать">
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
              <td><input placeholder="Описание" value={newDescription} onChange={e => setNewDescription(e.target.value)} /></td>
              <td colSpan="2">
                <button type="button" className="primary-btn" onClick={createCategory}>Добавить</button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CategoriesPage;