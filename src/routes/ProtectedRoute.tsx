import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

type Props = {
  adminOnly?: boolean;
};

export default function ProtectedRoute({ adminOnly = false }: Props) {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  if (!user) return <Navigate to="/login" replace />;

  if (adminOnly && user.role !== "ADMIN") return <Navigate to="/list" replace />;

  return <Outlet />;
}
