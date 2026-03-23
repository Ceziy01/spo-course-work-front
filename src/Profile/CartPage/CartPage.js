import { useEffect, useState } from "react";
import { fetchWithAuth } from "../../utils/api";
import "./CartPage.css";
import { ReactComponent as BinIcon } from "../../assets/bin.svg";
import { API_BASE_URL } from "../../config";

function CartPage() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    setLoading(true);
    const res = await fetchWithAuth("/cart");
    if (res.ok) {
      setCart(await res.json());
    } else {
      alert("Ошибка загрузки корзины");
    }
    setLoading(false);
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      await removeItem(itemId);
      return;
    }
    setUpdating({ ...updating, [itemId]: true });
    const res = await fetchWithAuth(`/cart/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity: newQuantity })
    });
    setUpdating({ ...updating, [itemId]: false });
    if (res.ok) {
      loadCart();
    } else if (res.status === 204) {
      loadCart();
    } else {
      const error = await res.json();
      alert(error.detail || "Ошибка обновления");
    }
  };

  const removeItem = async (itemId) => {
    setUpdating({ ...updating, [itemId]: true });
    const res = await fetchWithAuth(`/cart/items/${itemId}`, { method: "DELETE" });
    setUpdating({ ...updating, [itemId]: false });
    if (res.ok) {
      loadCart();
    } else {
      const error = await res.json();
      alert(error.detail || "Ошибка удаления");
    }
  };

  const checkout = async () => {
    if (!window.confirm("Оформить заказ? Корзина будет очищена.")) return;
    const res = await fetchWithAuth("/cart/checkout", { method: "POST" });
    if (res.ok) {
      alert("Заказ оформлен!");
      loadCart();
    } else {
      const error = await res.json();
      alert(error.detail || "Ошибка оформления");
    }
  };

  const total = cart.reduce((sum, item) => sum + item.total_price, 0);

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="cart-container">
      <h2>Корзина</h2>
      {cart.length === 0 ? (
        <p>Корзина пуста</p>
      ) : (
        <>
          <table className="cart-table">
            <thead>
              <tr>
                <th>Товар</th>
                <th>Цена</th>
                <th>Количество</th>
                <th>Сумма</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.map(item => (
                <tr key={item.item_id}>
                  <td>{item.name}</td>
                  <td>{item.price} ₽</td>
                  <td>
                    <button 
                      onClick={() => updateQuantity(item.item_id, item.quantity - 1)}
                      disabled={updating[item.item_id]}
                    >-</button>
                    {item.quantity}
                    <button 
                      onClick={() => updateQuantity(item.item_id, item.quantity + 1)}
                      disabled={updating[item.item_id]}
                    >+</button>
                  </td>
                  <td>{item.total_price} ₽</td>
                  <td>
                    <button
                      type="button"
                      className="action-btn delete-btn"
                      onClick={() => removeItem(item.item_id)}
                      disabled={updating[item.item_id]}
                      title="Удалить"
                    ><BinIcon /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="cart-total">
            Итого: {total} ₽
          </div>
          <button onClick={checkout} className="checkout-btn">
            Оформить заказ
          </button>
        </>
      )}
    </div>
  );
}

export default CartPage;