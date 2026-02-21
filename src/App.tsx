import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import Login from "./pages/Login";
import ProtectedRoute from "./routes/ProtectedRoute";
import Register from "./pages/Register";

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
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
