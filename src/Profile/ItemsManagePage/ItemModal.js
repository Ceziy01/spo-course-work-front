import { useEffect, useState } from "react";
import { fetchWithAuth } from "../../utils/api";
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
    warehouse_id: ""
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
        warehouse_id: item.warehouse_id || ""
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.article.trim() || !form.category_id || !form.warehouse_id) {
      alert("Заполните обязательные поля: название, артикул, категория, склад");
      return;
    }
    if (form.price < 0 || form.quantity < 0) {
      alert("Цена и количество не могут быть отрицательными");
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
      body: JSON.stringify(data)
    });

    setLoading(false);
    if (!res.ok) {
      const error = await res.json();
      alert(error.detail || "Ошибка сохранения");
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
            <input
              name="article"
              placeholder="Артикул *"
              value={form.article}
              onChange={handleChange}
              required
            />
            <input
              name="name"
              placeholder="Название *"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <textarea
              name="description"
              placeholder="Описание"
              value={form.description}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-row">
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              required
            >
              <option value="">Выберите категорию *</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <select
              name="warehouse_id"
              value={form.warehouse_id}
              onChange={handleChange}
              required
            >
              <option value="">Выберите склад *</option>
              {warehouses.map(wh => (
                <option key={wh.id} value={wh.id}>{wh.name}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <input
              type="number"
              name="quantity"
              placeholder="Количество *"
              value={form.quantity}
              onChange={handleChange}
              min="0"
              step="any"
              required
            />
            <input
              name="unit"
              placeholder="Ед. измерения *"
              value={form.unit}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <input
              type="number"
              name="price"
              placeholder="Цена за ед. *"
              value={form.price}
              onChange={handleChange}
              min="0"
              step="any"
              required
            />
            <input
              type="number"
              name="shelf_life_days"
              placeholder="Срок хранения (дней), пусто = бессрочно"
              value={form.shelf_life_days}
              onChange={handleChange}
              min="1"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="modal-btn secondary" onClick={onClose} disabled={loading}>
              Отмена
            </button>
            <button type="submit" className="modal-btn primary" disabled={loading}>
              {loading ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ItemModal;