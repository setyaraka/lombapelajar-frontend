import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Isi email & password");
      return;
    }

    // simulasi role
    if (email === "admin@gmail.com") {
      localStorage.setItem("role", "admin");
      localStorage.setItem("isLogin", "true");
      navigate("/admin_verification");
    } else {
      localStorage.setItem("role", "user");
      localStorage.setItem("isLogin", "true");
      navigate("/list");
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
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Masuk</button>
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