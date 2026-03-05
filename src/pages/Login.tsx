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

      await login(email, password);
      navigate("/list")

      // if (loggedInUser.role === "ADMIN") {
      //   navigate("/admin/participants");
      // } else {
      //   navigate("/list");
      // }
    } catch {
      alert("Email atau password salah");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="container">
        <div className="logo">
          <h1>Platform Lomba</h1>
        </div>

        <div className="subtitle">Silakan login untuk melanjutkan</div>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            placeholder="email@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            inputMode="email"
            autoComplete="email"
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <LoadingButton loading={loading} loadingText="Masuk...">
            Masuk
          </LoadingButton>
        </form>

        <div className="footer">
          <p>
            Belum punya akun? <a href="/register">Daftar disini</a>
          </p>
        </div>
      </div>
    </div>
  );
}
