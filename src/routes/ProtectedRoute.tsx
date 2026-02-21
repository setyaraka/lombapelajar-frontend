// import { Navigate, Outlet } from "react-router-dom";
// import { useAuth } from "../auth/useAuth";

// export default function ProtectedRoute() {
//   const { user, loading } = useAuth();

//   if (loading) return <p>Loading...</p>;
//   if (!user) return <Navigate to="/login" replace />;

//   return <Outlet />;
// }
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

type Props = {
  adminOnly?: boolean;
};

export default function ProtectedRoute({ adminOnly = false }: Props) {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  // belum login
  if (!user) return <Navigate to="/login" replace />;

  // bukan admin tapi masuk halaman admin
  if (adminOnly && user.role !== "ADMIN") return <Navigate to="/list" replace />;

  return <Outlet />;
}
