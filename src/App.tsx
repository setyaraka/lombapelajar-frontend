import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import Login from "./pages/Login";
import ProtectedRoute from "./routes/ProtectedRoute";
import Register from "./pages/Register";
import Competitions from "./pages/Competitions";
import CompetitionDetail from "./pages/CompetitionDetail";
import RegisterCompetition from "./pages/RegisterCompetition";

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
            <Route path="/competition/:id" element={<CompetitionDetail />} />
          </Route>
            <Route path="/competition/:id/register" element={<RegisterCompetition />} />

          {/* NOT FOUND -> LOGIN */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
