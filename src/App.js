import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./Auth/AuthContext";
import Login from "./Auth/Login";
import Profile from "./Profile/Profile";
import AdminPanel from "./AdminPanel/AdminPanel";
import Navigation from "./Navigation/Navigation";

function AppRoutes() {
  const { isAuthenticated, loading} = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navigation/>
      <Routes>
        {!isAuthenticated ? (
          <Route path="*" element={<Login/>}/>
        ) : (
          <>
            <Route path="/" element={<Profile/>}/>
            <Route path="/admin/*" element={<AdminPanel/>}/>
            <Route path="*" element={<Navigate to="/"/>}/>
          </>
        )
      }
      </Routes>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes/>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
