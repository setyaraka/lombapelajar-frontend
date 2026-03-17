import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/auth.service";
import LoadingButton from "../components/LoadingButton";

type FormData = {
  nama: string;
  birthDate: string;
  school: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>({
    nama: "",
    birthDate: "",
    school: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.password_confirmation) {
      setError("Password tidak sama");
      return;
    }

    if (form.password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await register({
        name: form.nama,
        email: form.email,
        password: form.password,
        birthDate: form.birthDate,
        school: form.school,
      });

      navigate("/login");
    } catch {
      setError("Register gagal, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img src="/logo.png" alt="logo" />

        <h2 className="auth-title">Daftar Akun</h2>
        <p className="auth-subtitle">Isi data diri untuk membuat akun</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Nama Lengkap</label>
            <input
              name="nama"
              placeholder="Budi Santoso"
              value={form.nama}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Tanggal Lahir</label>
            <input
              type="date"
              name="birthDate"
              value={form.birthDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Sekolah / Instansi</label>
            <input
              name="school"
              placeholder="Nama sekolah / kampus"
              value={form.school}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="email@gmail.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Minimal 8 karakter"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Konfirmasi Password</label>
            <input
              type="password"
              name="password_confirmation"
              placeholder="Ulangi password"
              value={form.password_confirmation}
              onChange={handleChange}
              required
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <LoadingButton loading={loading} loadingText="Mendaftarkan...">
            Daftar
          </LoadingButton>
        </form>

        <div className="auth-footer">
          Sudah punya akun? <a href="/login">Login</a>
        </div>
      </div>
    </div>
  );
}
