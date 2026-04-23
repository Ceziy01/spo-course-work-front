import { useEffect, useState } from "react";
import { fetchWithAuth } from "../../utils/api";
import { useAuth } from "../../Auth/AuthContext";
import ActionButton from "../../components/ActionButton/ActionButton";
import PurchaseCreateModal from "./PurchaseCreateModal";
import CompletePurchaseModal from "./CompletePurchaseModal";
import { exportTableToExcel } from "../../utils/export";
import "../../styles/shared.css";

function PurchasesPage() {
    const { user } = useAuth();
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [completeModalOpen, setCompleteModalOpen] = useState(false);
    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [updating, setUpdating] = useState({});

    const canEdit = user?.role === "admin" || user?.role === "purchase_manager";
    const canComplete = user?.role === "admin" || user?.role === "purchase_manager" || user?.role === "warehouse_keeper";

    const loadPurchases = async () => {
        setLoading(true);
        const res = await fetchWithAuth("/purchases");
        if (res.ok) {
            setPurchases(await res.json());
        } else {
            alert("Ошибка загрузки закупок");
        }
        setLoading(false);
    };

    useEffect(() => {
        loadPurchases();
    }, []);

    const handleCreate = () => {
        setCreateModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Удалить закупку?")) return;
        setUpdating(prev => ({ ...prev, [id]: true }));
        const res = await fetchWithAuth(`/purchases/${id}`, { method: "DELETE" });
        setUpdating(prev => ({ ...prev, [id]: false }));
        if (res.ok) {
            loadPurchases();
        } else {
            const err = await res.json();
            alert(err.detail || "Ошибка удаления");
        }
    };

    const handleInitiate = async (id) => {
        if (!window.confirm("Инициировать закупку?")) return;
        setUpdating(prev => ({ ...prev, [id]: true }));
        const res = await fetchWithAuth(`/purchases/${id}/status?status=initiated`, { method: "PATCH" });
        setUpdating(prev => ({ ...prev, [id]: false }));
        if (res.ok) {
            loadPurchases();
        } else {
            const err = await res.json();
            alert(err.detail || "Ошибка изменения статуса");
        }
    };

    const handleCancelClick = async (id) => {
        if (!window.confirm("Вы точно хотите отменить закупку?")) return;
        setUpdating(prev => ({ ...prev, [id]: true }));
        const res = await fetchWithAuth(`/purchases/${id}/status?status=cancelled`, { method: "PATCH" });
        setUpdating(prev => ({ ...prev, [id]: false }));
        if (res.ok) {
            loadPurchases();
        } else {
            //const err = await res.json();
            alert("Ошибка изменения статуса");
        }
    }

    const handleCompleteClick = (purchase) => {
        setSelectedPurchase(purchase);
        setCompleteModalOpen(true);
    };

    const handleSave = () => {
        setCreateModalOpen(false);
        setCompleteModalOpen(false);
        loadPurchases();
    };

    const handleExport = () => {
        const table = document.querySelector(".purchases-table");
        if (table) {
            exportTableToExcel(table, `закупки_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`);
        }
    };

    const statusColors = {
        created: "var(--text-secondary)",
        initiated: "#fd7e14",
        completed: "#28a745",
        cancelled: "red"
    };

    const statusLabels = {
        created: "Создана",
        initiated: "Инициирована",
        completed: "Завершена",
        cancelled: "Отменено"
    };

    if (loading) return <div className="loading">Загрузка...</div>;

    return (
        <div className="container">
            <div className="page-header">
                <h2 className="page-title">Закупки</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {canEdit && (
                        <button className="primary-btn" onClick={handleCreate}>Создать закупку</button>
                    )}
                    <ActionButton type="excel" tip="Экспорт в Excel" onClick={handleExport}>
                        <span className="material-symbols-outlined">table_view</span>
                    </ActionButton>
                </div>
            </div>
            <table className="table purchases-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Товар</th>
                        <th>Кол-во</th>
                        <th>Закуп. цена (₽)</th>
                        <th>Поставщик</th>
                        <th>Склад</th>
                        <th>Статус</th>
                        <th>Дата</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {purchases.map(p => (
                        <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>{p.product_name}</td>
                            <td>{p.quantity}</td>
                            <td>{p.purchase_price.toFixed(2)}</td>
                            <td>{p.supplier_name || p.supplier_id}</td>
                            <td>{p.warehouse_name || p.warehouse_id}</td>
                            <td style={{ color: statusColors[p.status] }}>{statusLabels[p.status]}</td>
                            <td>{new Date(p.created_at).toLocaleString()}</td>
                            <td>
                                <div className="actions-container">
                                    {canEdit && p.status === "created" && (
                                        <ActionButton type="neutral" onClick={() => handleInitiate(p.id)} tip="Инициировать" disabled={updating[p.id]}>
                                            <span className="material-symbols-outlined">play_arrow</span>
                                        </ActionButton>
                                    )}
                                    {canEdit && p.status === "created" && (
                                        <ActionButton type="danger" onClick={() => handleDelete(p.id)} tip="Удалить" disabled={updating[p.id]}>
                                            <span className="material-symbols-outlined">delete</span>
                                        </ActionButton>
                                    )}
                                    {canComplete && p.status === "initiated" && (
                                        <ActionButton type="apply" onClick={() => handleCompleteClick(p)} tip="Завершить" disabled={updating[p.id]}>
                                            <span className="material-symbols-outlined">check</span>
                                        </ActionButton>
                                    )}
                                    {canComplete && p.status === "initiated" && (
                                        <ActionButton type="danger" onClick={() => handleCancelClick(p.id)} tip="Отменить" disabled={updating[p.id]}>
                                            <span className="material-symbols-outlined">close</span>
                                        </ActionButton>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {createModalOpen && (
                <PurchaseCreateModal onClose={() => setCreateModalOpen(false)} onSave={handleSave}/>
            )}

            {completeModalOpen && selectedPurchase && (
                <CompletePurchaseModal purchase={selectedPurchase} onClose={() => setCompleteModalOpen(false)} onSave={handleSave}/>
            )}
        </div>
    );
}

export default PurchasesPage;