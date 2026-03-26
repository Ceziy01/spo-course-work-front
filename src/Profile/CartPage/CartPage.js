import { useCart } from "../../hooks/useCart";
import { fetchWithAuth } from "../../utils/api";
import "./CartPage.css";
import { ReactComponent as BinIcon } from "../../assets/bin.svg";
import { useNavigate } from "react-router-dom";

function CartPage() {
  const { cart, loading, updating, updateQuantity, removeItem, loadCart } = useCart();
  const navigate = useNavigate();

  const checkout = async () => {
    if (!window.confirm("Оформить заказ? Корзина будет очищена.")) return;
    const res = await fetchWithAuth("/cart/checkout", { method: "POST" });
    if (res.ok) {
      alert("Заказ оформлен!");
      loadCart();
      navigate("/orders");
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