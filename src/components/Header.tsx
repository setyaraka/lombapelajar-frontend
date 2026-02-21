import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token"); // nanti ganti auth context
    navigate("/login");
  };

  return (
    <div className="header">
      <h1>LombaPelajar.id</h1>
      <button className="logout" onClick={logout}>Logout</button>
    </div>
  );
}