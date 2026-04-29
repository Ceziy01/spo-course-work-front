import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { fetchWithAuth } from "../../utils/api";
import { API_BASE_URL } from "../../config";
import "./ItemModal.css";

function ItemModal({ item, onClose, onSave }) {
  const isEditing = !!item;

  const [form, setForm] = useState({
    name: "",
    description: "",
    article: "",
    quantity: 0,
    unit: "шт",
    shelf_life_days: "",
    price: 0,
    category_id: "",
    warehouse_id: "",
    image_url: null
  });

  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      const [catRes, whRes] = await Promise.all([
        fetchWithAuth("/categories"),
        fetchWithAuth("/warehouses")
      ]);
      if (catRes.ok) setCategories(await catRes.json());
      if (whRes.ok) setWarehouses(await whRes.json());
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name || "",
        description: item.description || "",
        article: item.article || "",
        quantity: item.quantity || 0,
        unit: item.unit || "шт",
        shelf_life_days: item.shelf_life_days ?? "",
        price: item.price || 0,
        category_id: item.category_id || "",
        warehouse_id: item.warehouse_id || "",
        image_url: item.image_url || null
      });
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE_URL}/items/upload-image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: formData
    });

    if (!res.ok) {
      toast.error("Ошибка загрузки картинки");
      return;
    }

    const data = await res.json();

    setForm(prev => ({
      ...prev,
      image_url: data.image_url
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.article.trim() || !form.category_id || !form.warehouse_id) {
      toast.error("Заполните обязательные поля");
      return;
    }

    setLoading(true);

    const url = isEditing ? `/items/${item.id}` : "/items";
    const method = isEditing ? "PATCH" : "POST";

    const data = {
      ...form,
      shelf_life_days: form.shelf_life_days === "" ? null : form.shelf_life_days,
      quantity: Number(form.quantity),
      price: Number(form.price)
    };

    const res = await fetchWithAuth(url, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    setLoading(false);

    if (!res.ok) {
      const error = await res.json();
      toast.error(error.detail || "Ошибка");
      return;
    }

    onSave();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content item-modal" onClick={e => e.stopPropagation()}>
        <h3>{isEditing ? "Редактировать товар" : "Добавить товар"}</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <input name="article" placeholder="Артикул *" value={form.article} onChange={handleChange} required />
            <input name="name" placeholder="Название *" value={form.name} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <textarea name="description" placeholder="Описание" value={form.description} onChange={handleChange} />
          </div>

          <div className="form-row">
            <select name="category_id" value={form.category_id} onChange={handleChange} required>
              <option value="">Категория *</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <select name="warehouse_id" value={form.warehouse_id} onChange={handleChange} required>
              <option value="">Склад *</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>

          <div className="form-row">
            <input type="number" name="quantity" value={form.quantity} onChange={handleChange} />
            <input name="unit" value={form.unit} onChange={handleChange} />
          </div>

          <div className="form-row">
            <input type="number" name="price" value={form.price} onChange={handleChange} />
            <input type="number" name="shelf_life_days" value={form.shelf_life_days} onChange={handleChange} />
          </div>

          <input type="file" onChange={handleFileUpload} />

          {form.image_url && (
            <div style={{ marginTop: "10px" }}>
              <img
                src={`${API_BASE_URL}${form.image_url}`}
                alt=""
                style={{ maxWidth: "150px", borderRadius: "6px" }}
              />
            </div>
          )}

          <div className="modal-actions">
            <button type="button" onClick={onClose}>Отмена</button>
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ItemModal;