import { useEffect, useState } from "react";
import { fetchWithAuth } from "../../utils/api";
import { exportOrdersToExcel } from "../../utils/export";
import ActionButton from "../../components/ActionButton/ActionButton";
import { ReactComponent as BinIcon } from "../../assets/bin.svg";
import { ReactComponent as ExcelIcon } from "../../assets/excel.svg";
import "../../styles/shared.css";

function OrdersManagePage({ readOnly = false }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState({});

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        const res = await fetchWithAuth("/orders");
        if (res.ok) {
            const data = await res.json();
            setOrders(data);
        } else {
            alert("Ошибка загрузки заказов");
        }
        setLoading(false);
    };

    const deleteOrder = async (orderId) => {
        if (!window.confirm(`Удалить заказ #${orderId}?`)) return;
        setUpdating(prev => ({ ...prev, [orderId]: true }));
        const res = await fetchWithAuth(`/orders/${orderId}`, { method: "DELETE" });
        setUpdating(prev => ({ ...prev, [orderId]: false }));
        if (res.ok) {
            loadOrders();
        } else {
            const error = await res.json();
            alert(error.detail || "Ошибка удаления заказа");
        }
    };

    const handleExport = () => {
        if (orders.length === 0) {
            alert("Нет заказов для экспорта");
            return;
        }
        exportOrdersToExcel(orders, "заказы");
    };

    const changeStatus = async (orderId, newStatus) => {
        if (!window.confirm(`Изменить статус заказа #${orderId} на "${newStatus}"?`)) return;
        setUpdating(prev => ({ ...prev, [orderId]: true }));
        const res = await fetchWithAuth(`/orders/${orderId}`, {
            method: "PATCH",
            body: JSON.stringify({ status: newStatus })
        });
        setUpdating(prev => ({ ...prev, [orderId]: false }));
        if (res.ok) {
            loadOrders();
        } else {
            const error = await res.json();
            alert(error.detail || "Ошибка обновления");
        }
    };

    if (loading) return <div className="loading">Загрузка...</div>;

    return (
        <div className="container">
            <div className="users-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="page-title" style={{ marginBottom: 0 }}>Управление заказами</h2>
                <ActionButton type="excel" tip="Экспорт в Excel" onClick={handleExport}>
                    <ExcelIcon />
                </ActionButton>
            </div>

            {orders.length === 0 ? (
                <p>Нет заказов</p>
            ) : (
                orders.map(order => (
                    <div key={order.id} style={{ marginBottom: "24px", background: "white", borderRadius: "12px", padding: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", alignItems: "center" }}>
                            <strong>Заказ #{order.id}</strong>
                            <span>Пользователь: {order.user_id}</span>
                            <span>Статус: {order.status}</span>
                            <span>Дата: {new Date(order.created_at).toLocaleString()}</span>
                            <strong>Сумма: {order.total_price} ₽</strong>
                            {!readOnly && (
                                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                    <select
                                        value={order.status}
                                        onChange={(e) => changeStatus(order.id, e.target.value)}
                                        disabled={updating[order.id]}
                                        style={{ padding: "6px 12px", borderRadius: "6px" }}
                                    >
                                        <option value="created">Создан</option>
                                        <option value="confirmed">Подтверждён</option>
                                        <option value="cancelled">Отменён</option>
                                    </select>
                                    <ActionButton
                                        type="danger"
                                        tip="Удалить заказ"
                                        onClick={() => deleteOrder(order.id)}
                                        disabled={updating[order.id]}
                                    >
                                        <BinIcon />
                                    </ActionButton>
                                </div>
                            )}
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

export default OrdersManagePage;