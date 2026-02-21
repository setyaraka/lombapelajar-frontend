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
      window.scrollTo({ top: 0, behavior: "smooth" });
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
  autoComplete="name"
  required
/>

<label>Tanggal Lahir</label>
<input
  type="date"
  name="ttl"
  value={form.ttl}
  onChange={handleChange}
  autoComplete="bday"
  required
/>

<label>Sekolah / Instansi</label>
<input
  name="sekolah"
  placeholder="Nama sekolah / kampus"
  value={form.sekolah}
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

          <button type="submit">Daftar Sekarang</button>
        </form>

        <div className="footer">
          Sudah punya akun? <a href="/login">Login</a>
        </div>
      </div>
    </div>
  );
}
