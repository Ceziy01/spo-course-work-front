import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../Auth/AuthContext";
import ProfileInfo from "./InfoPage/ProfileInfo";
import UsersPage from "./UsersPage/UsersPage";
import ItemsManagePage from "./ItemsManagePage/ItemsManagePage";
import WarehousesPage from "./WarehousesPage/WarehousesPage";
import CategoriesPage from "./CategoriesPage/CategoriesPage";
import MyOrdersPage from "./MyOrdersPage/MyOrdersPage";
import OrdersManagePage from "./OrdersManagePage/OrdersManagePage";
import CartPage from "./CartPage/CartPage";
import CatalogPage from "./CatalogPage/CatalogPage";
import Sidebar from "./Sidebar";
import "./ProfileLayout.css";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/info" replace />;
  }

  return children;
}

function ProfileLayout() {
  const { user, isAdmin } = useAuth();

  return (
    <div className="profile-layout">
      <Sidebar />

      <div className="profile-content">
        <Routes>
          <Route path="/" element={<Navigate to="/info" replace />} />
          <Route path="/info" element={<ProfileInfo />} />

          {isAdmin && <Route path="/users" element={<UsersPage />} />}

          <Route path="/items" element={
            <ProtectedRoute allowedRoles={["admin", "warehouse_keeper", "management", "sales_manager", "purchase_manager", "accountant", "supplier"]}>
              <ItemsManagePage />
            </ProtectedRoute>
          } />

          <Route path="/warehouses" element={
            <ProtectedRoute allowedRoles={["admin", "warehouse_keeper", "management", "sales_manager", "purchase_manager", "accountant", "supplier"]}>
              <WarehousesPage />
            </ProtectedRoute>
          } />

          <Route path="/categories" element={
            <ProtectedRoute allowedRoles={["admin", "warehouse_keeper", "management", "sales_manager", "purchase_manager", "accountant", "supplier"]}>
              <CategoriesPage />
            </ProtectedRoute>
          } />
          <Route path="/catalog" element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CatalogPage />
            </ProtectedRoute>
          } />
          <Route path="/cart" element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CartPage />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <MyOrdersPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute allowedRoles={["admin", "sales_manager", "management", "accountant"]}>
              <OrdersManagePage readOnly={user?.role === "management" || user?.role === "accountant"} />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/info" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default ProfileLayout;