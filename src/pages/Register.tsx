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

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.password_confirmation) {
      setError("Password tidak sama!");
      window.scrollTo({ top: 0, behavior: "smooth" });
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

      alert("Register berhasil, silakan login");
      navigate("/login");
    } catch {
      setError("Register gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="container">
        <div className="logo">
          <h1>Daftar Peserta</h1>
        </div>

        <div className="subtitle">Isi data diri untuk membuat akun</div>

        <form onSubmit={handleSubmit}>
          <label>Nama Lengkap</label>
          <input
            name="nama"
            placeholder="Contoh: Budi Santoso"
            value={form.nama}
            onChange={handleChange}
            autoComplete="name"
            required
          />

          <label>Tanggal Lahir</label>
          <input
            type="date"
            name="birthDate"
            value={form.birthDate}
            onChange={handleChange}
            autoComplete="bday"
            required
          />

          <label>Sekolah / Instansi</label>
          <input
            name="school"
            placeholder="Nama sekolah / kampus"
            value={form.school}
            onChange={handleChange}
            autoComplete="organization"
            required
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            inputMode="email"
            autoComplete="email"
            placeholder="email@gmail.com"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="Minimal 8 karakter"
            value={form.password}
            onChange={handleChange}
            required
          />

          <label>Konfirmasi Password</label>
          <input
            type="password"
            name="password_confirmation"
            autoComplete="new-password"
            placeholder="Ulangi password"
            value={form.password_confirmation}
            onChange={handleChange}
            required
          />

          {error && <p className="error">{error}</p>}

          <LoadingButton loading={loading} loadingText="Memuat...">
            Masuk
          </LoadingButton>
        </form>

        <div className="footer">
          Sudah punya akun? <a href="/login">Login</a>
        </div>
      </div>
    </div>
  );
}
