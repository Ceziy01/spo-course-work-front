import { useEffect, useState, useRef } from "react";
import { fetchWithAuth } from "../../utils/api";
import { exportTableToExcel } from "../../utils/export";
import ActionButton from "../../components/ActionButton/ActionButton";
import "../../styles/shared.css";

function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const tableRef = useRef(null);

  const loadClients = async () => {
    setLoading(true);
    const res = await fetchWithAuth("/users/customers");
    if (res.ok) {
      const data = await res.json();
      setClients(data);
    } else {
      alert("Не удалось загрузить список клиентов");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleExport = () => {
    if (tableRef.current) {
      exportTableToExcel(tableRef.current, `клиенты_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}`);
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h2 className="page-title">Клиенты</h2>
        <ActionButton type="excel" tip="Экспорт в Excel" onClick={handleExport}>
          <span className="material-symbols-outlined">table_view</span>
        </ActionButton>
      </div>
      <table ref={tableRef} className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Логин</th>
            <th>Имя</th>
            <th>Фамилия</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{client.username}</td>
              <td>{client.first_name || "—"}</td>
              <td>{client.last_name || "—"}</td>
              <td>{client.email || "—"}</td>
            </tr>
          ))}
          {clients.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "30px" }}>
                Нет клиентов
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ClientsPage;