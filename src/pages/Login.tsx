import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingButton from "../components/LoadingButton";
import { useAuth } from "../auth/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Isi email & password");
      return;
    }

    try {
      setLoading(true);

      const loggedInUser = await login(email, password);

      if (loggedInUser.role === "ADMIN") {
        navigate("/admin/participants");
      } else {
        navigate("/list");
      }
    } catch {
      alert("Email atau password salah");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img src="/logo.png" alt="logo" />

        <p className="auth-subtitle">Silakan login untuk melanjutkan</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="admin@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <LoadingButton loading={loading} loadingText="Masuk...">
            Masuk
          </LoadingButton>
        </form>

        <div className="auth-footer">
          Belum punya akun? <a href="/register">Daftar disini</a>
        </div>
      </div>
    </div>
  );
}
