import { useEffect, useState } from "react";
import { fetchWithAuth } from "../../utils/api";
import { exportOrdersToExcel } from "../../utils/export";
import ActionButton from "../../components/ActionButton/ActionButton";
import { ReactComponent as ExcelIcon } from "../../assets/excel.svg";
import "../../styles/shared.css";

function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const res = await fetchWithAuth("/orders/my");
    if (res.ok) {
      const data = await res.json();
      setOrders(data);
    } else {
      alert("Ошибка загрузки заказов");
    }
    setLoading(false);
  };

  const handleExport = () => {
    if (orders.length === 0) {
      alert("Нет заказов для экспорта");
      return;
    }
    exportOrdersToExcel(orders, "мои_заказы");
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="container">
      <div className="users-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="page-title" style={{ marginBottom: 0 }}>Мои заказы</h2>
        <ActionButton type="excel" tip="Экспорт в Excel" onClick={handleExport}>
          <ExcelIcon />
        </ActionButton>
      </div>

      {orders.length === 0 ? (
        <p>У вас пока нет заказов</p>
      ) : (
        orders.map(order => (
          <div key={order.id} style={{ marginBottom: "24px", background: "white", borderRadius: "12px", padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
              <strong>Заказ #{order.id}</strong>
              <span>Статус: {order.status}</span>
              <span>Дата: {new Date(order.created_at).toLocaleString()}</span>
              <strong>Сумма: {order.total_price} ₽</strong>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Товар</th>
                  <th>Кол-во</th>
                  <th>Цена</th>
                  <th>Сумма</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map(item => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.price_at_time} ₽</td>
                    <td>{item.price_at_time * item.quantity} ₽</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}

export default MyOrdersPage;