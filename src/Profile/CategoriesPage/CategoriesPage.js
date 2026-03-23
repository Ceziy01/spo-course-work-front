import { useEffect, useState } from "react";
import { fetchWithAuth } from "../../utils/api";
import { useCart } from "../../hooks/useCart";
import "../../styles/shared.css";
import { API_BASE_URL } from "../../config";

function CatalogPage() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const { cart, updating, addToCart, updateQuantity } = useCart();

  // строим карту товаров в корзине для быстрого доступа к количеству
  const cartMap = cart.reduce((map, item) => {
    map[item.item_id] = { quantity: item.quantity };
    return map;
  }, {});

  const loadItems = async () => {
    setSearching(true);
    try {
      const res = await fetchWithAuth("/items");
      if (res.ok) {
        setItems(await res.json());
      } else {
        alert("Ошибка загрузки товаров");
      }
    } catch (error) {
      console.error("Ошибка загрузки:", error);
      alert("Ошибка загрузки товаров");
    } finally {
      setSearching(false);
    }
  };

  const searchItems = async () => {
    if (!searchQuery.trim()) {
      loadItems();
      return;
    }
    setSearching(true);
    try {
      const res = await fetchWithAuth(`/items/search/${encodeURIComponent(searchQuery)}`);
      if (!res.ok) {
        alert("Ошибка поиска");
        return;
      }
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error("Ошибка поиска:", error);
      alert("Ошибка поиска");
    } finally {
      setSearching(false);
    }
  };

  const resetSearch = () => {
    setSearchQuery("");
    loadItems();
  };

  useEffect(() => {
    loadItems();
  }, []);

  return (
    <div className="catalog-container">
      <div className="catalog-header">
        <h2>Каталог товаров</h2>
        <div className="search-section">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Поиск"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchItems()}
              className="catalog-search-input"
            />
            <button
              onClick={resetSearch}
              className="catalog-search-clear"
              aria-label="Очистить поиск"
            >✕</button>
          </div>
          <button className="catalog-search-btn" onClick={searchItems}>
            Найти
          </button>
        </div>
      </div>

      {searching ? (
        <div className="loading">Загрузка...</div>
      ) : (
        <div className="cards-grid">
          {items.map(item => {
            const cartItem = cartMap[item.id];
            const isInCart = !!cartItem;
            const quantity = isInCart ? cartItem.quantity : 0;

            return (
              <div key={item.id} className="product-card">
                <img src={`${API_BASE_URL}${item.image_url}`} alt={item.name} />
                <h3>{item.name}</h3>
                <p>Артикул: {item.article}</p>
                <p className="price">{item.price} ₽</p>
                <p>Категория: {item.category_name}</p>
                {isInCart ? (
                  <div className="cart-controls">
                    <button 
                      onClick={() => updateQuantity(item.id, quantity - 1)}
                      disabled={updating[item.id]}
                    >-</button>
                    <span className="cart-quantity">{quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, quantity + 1)}
                      disabled={updating[item.id]}
                    >+</button>
                  </div>
                ) : (
                  <button 
                    onClick={() => addToCart(item.id)}
                    disabled={updating[item.id]}
                  >
                    {updating[item.id] ? "Добавление..." : "В корзину"}
                  </button>
                )}
              </div>
            );
          })}
          {items.length === 0 && <p className="no-results">Ничего не найдено</p>}
        </div>
      )}
    </div>
  );
}

export default CatalogPage;