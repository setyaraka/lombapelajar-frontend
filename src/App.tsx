import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import Login from "./pages/Login";
import ProtectedRoute from "./routes/ProtectedRoute";
import Register from "./pages/Register";
import Competitions from "./pages/Competitions";

const Dashboard = () => <h1>Dashboard (Private)</h1>;

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* private */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Competitions />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/competition/:id" element={<h1>Detail lomba</h1>} />
          </Route>

          {/* NOT FOUND -> LOGIN */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
