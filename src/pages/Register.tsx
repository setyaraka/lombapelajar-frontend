import { useState } from "react";

type FormData = {
  nama: string;
  ttl: string;
  sekolah: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export default function Register() {
  const [form, setForm] = useState<FormData>({
    nama: "",
    ttl: "",
    sekolah: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [error, setError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.password_confirmation) {
      setError("Password tidak sama!");
      return;
    }

    if (form.password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }

    setError("");

    console.log("DATA REGISTER:", form);

    // TODO: kirim ke backend
    // await api.post("/auth/register", form);
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
            required
          />

          <label>Tanggal Lahir</label>
          <input
            type="date"
            name="ttl"
            placeholder="Pilih tanggal lahir"
            value={form.ttl}
            onChange={handleChange}
            required
          />

          <label>Sekolah / Instansi</label>
          <input
            name="sekolah"
            placeholder="Contoh: SMA Negeri 1 Bandung / Universitas Indonesia"
            value={form.sekolah}
            onChange={handleChange}
            required
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="contoh@email.com"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Minimal 8 karakter, kombinasi huruf & angka"
            value={form.password}
            onChange={handleChange}
            required
          />

          <label>Konfirmasi Password</label>
          <input
            type="password"
            name="password_confirmation"
            placeholder="Ulangi password yang sama"
            value={form.password_confirmation}
            onChange={handleChange}
            required
          />

          {error && <p className="error">{error}</p>}

          <button type="submit">Daftar Sekarang</button>
        </form>

        <div className="footer">
          Sudah punya akun? <a href="/login">Login</a>
        </div>
      </div>
    </div>
  );
}
