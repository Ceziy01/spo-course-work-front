import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./Login";
import Profile from "./Profile";
import AdminPanel from "./AdminPanel";

function App() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        {!token && (
          <>
            <Route path="*" element={<Login />} />
          </>
        )}

        {token && (
          <>
            <Route path="/" element={<Profile />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}

      </Routes>
    </BrowserRouter>
  );
}

export default App;
