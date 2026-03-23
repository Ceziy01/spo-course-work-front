import { useEffect, useState } from "react";
import { useAuth } from "../../Auth/AuthContext";
import { fetchWithAuth } from "../../utils/api";
import { API_BASE_URL } from "../../config";
import ItemModal from "./ItemModal";
import { ReactComponent as BinIcon } from "../../assets/bin.svg";
import { ReactComponent as PenIcon } from "../../assets/pen.svg";
import "./ItemsManagePage.css";

function ItemsManagePage() {
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "warehouse_keeper";

  const [items, setItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");

  const loadItems = async () => {
    const res = await fetchWithAuth("/items");
    if (!res.ok) return alert("Не удалось загрузить товары");
    setItems(await res.json());
  };

  const searchItems = async () => {
    if (!searchQuery.trim()) {
      loadItems();
      return;
    }
    const res = await fetchWithAuth(`/items/search/${encodeURIComponent(searchQuery)}`);
    if (!res.ok) {
      alert("Ошибка поиска");
      return;
    }
    const data = await res.json();
    setItems(data);
  };

  const resetSearch = () => {
    setSearchQuery("");
    loadItems();
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Удалить товар?")) return;

    const res = await fetchWithAuth(`/items/${id}`, { method: "DELETE" });

    if (!res.ok) {
      const error = await res.json();
      alert(error.detail || "Ошибка удаления");
      return;
    }

    loadItems();
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleSave = () => {
    closeModal();
    loadItems();
  };

  const formatShelfLife = (days) => {
    if (days === null || days === undefined) return "бессрочно";
    return `${days} дн.`;
  };

  return (
    <div className="container">
      <div className="items-header">
        <h2 className="page-title">Товары</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <input
              type="text"
              placeholder="Поиск"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchItems()}
              className="line-input"
            />
              <button onClick={() => {setSearchQuery('');loadItems()}} className="cross-btn">✕</button>
          </div>
          <button className="primary-btn" onClick={searchItems}>
            Поиск
          </button>
          {canEdit && (
            <button className="primary-btn" onClick={openCreateModal}>
              Добавить товар
            </button>
          )}
        </div>
      </div>

      <table className="table items-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Артикул</th>
            <th>Название</th>
            <th>Категория</th>
            <th>Кол-во</th>
            <th>Ед.</th>
            <th>Цена</th>
            <th>Склад</th>
            <th>Срок</th>
            {canEdit && <th>Действия</th>}
          </tr>
        </thead>

        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.article}</td>
              <td>{item.name}</td>
              <td>{item.category_name || "—"}</td>
              <td>{item.quantity}</td>
              <td>{item.unit}</td>
              <td>{item.price} ₽</td>
              <td>{item.warehouse_name || "—"}</td>
              <td>{formatShelfLife(item.shelf_life_days)}</td>

              {canEdit && (
                <td>
                  <div className="actions-container">
                    {item.image_url && (
                      <button
                        type="button"
                        className="action-btn"
                        title="Просмотр"
                        onClick={() => {
                          setSelectedImage(item.image_url);
                          setImageModalOpen(true);
                        }}>👁</button>
                    )}

                    <button
                      type="button"
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(item.id)}
                      title="Удалить"
                    ><BinIcon /></button>

                    <button
                      type="button"
                      className="action-btn edit-btn"
                      onClick={() => openEditModal(item)}
                      title="Редактировать"
                    ><PenIcon /></button>
                  </div>
                </td>
              )}
            </tr>
          ))}

          {items.length === 0 && (
            <tr>
              <td colSpan={canEdit ? 10 : 9} style={{ textAlign: "center", padding: "30px" }}>
                Ничего не найдено
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {modalOpen && (
        <ItemModal
          item={editingItem}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}

      {imageModalOpen && (
        <div
          className="image-modal-overlay"
          onClick={() => setImageModalOpen(false)}
        >
          <div
            className="image-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={`${API_BASE_URL}${selectedImage}`}
              alt=""
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ItemsManagePage;