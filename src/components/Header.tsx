import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const go = (path: string) => navigate(path);
  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="app-header">
      <div className="app-header-inner">
        {/* LOGO */}
        <h1 className="logo" onClick={() => go("/list")}>
          Maestro.id
        </h1>

        {/* NAVIGATION */}
        {user && (
          <nav className="nav">
            <button className={isActive("/list") ? "active" : ""} onClick={() => go("/list")}>
              Daftar Lomba
            </button>
            {/* 
            <button className={isActive("/my") ? "active" : ""} onClick={() => go("/my")}>
              Pendaftaran Saya
            </button> */}

            {user.role === "ADMIN" && (
              <button
                className={isActive("/admin/participants") ? "active" : ""}
                onClick={() => go("/admin/participants")}
              >
                Admin
              </button>
            )}
          </nav>
        )}

        {/* USER AREA */}
        <div className="right">
          {user && (
            <div className="user-menu">
              <span className="user">Hi, {user.name}</span>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
