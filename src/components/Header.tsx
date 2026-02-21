import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <h1 className="logo" onClick={() => navigate("/list")}>
          LombaPelajar.id
        </h1>

        <div className="right">
          {user && (
            <>
              <span className="user">Hi, {user.name}</span>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
