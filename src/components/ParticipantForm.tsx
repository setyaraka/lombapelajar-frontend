import { useState } from "react";
import type { RegisterForm } from "../pages/RegisterCompetition";

export default function ParticipantForm({
  form,
  updateForm,
  next,
}: {
  form: RegisterForm;
  updateForm: (d: Partial<RegisterForm>) => void;
  next: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};

    if (!form.nisn.trim()) e.nisn = "NIS/NISN wajib diisi";
    if (!form.school.trim()) e.school = "Asal sekolah wajib diisi";
    if (!form.whatsapp.trim()) e.whatsapp = "Nomor WhatsApp wajib diisi";
    if (!form.address.trim()) e.address = "Alamat wajib diisi";

    setErrors(e);

    if (Object.keys(e).length > 0) {
      alert("Masih ada data yang belum diisi");
      return;
    }

    next();
  };

  return (
    <div className="card form-control register-active">
      <div className="title">Data Peserta</div>

      <label>NIS / NISN</label>
      <input
        className={errors.nisn ? "input-error" : ""}
        type="text"
        inputMode="numeric"
        placeholder="Masukkan NIS atau NISN (10 digit)"
        value={form.nisn}
        onChange={(e) => updateForm({ nisn: e.target.value })}
      />
      {errors.nisn && <div className="field-error">{errors.nisn}</div>}

      <label>Asal Sekolah</label>
      <input
        className={errors.school ? "input-error" : ""}
        type="text"
        placeholder="Contoh: SMA Negeri 1 Bandung"
        value={form.school}
        onChange={(e) => updateForm({ school: e.target.value })}
      />
      {errors.school && <div className="field-error">{errors.school}</div>}

      <label>No. WhatsApp</label>
      <input
        className={errors.whatsapp ? "input-error" : ""}
        type="tel"
        placeholder="08xxxxxxxxxx (aktif untuk konfirmasi lomba)"
        value={form.whatsapp}
        onChange={(e) => updateForm({ whatsapp: e.target.value })}
      />
      {errors.whatsapp && <div className="field-error">{errors.whatsapp}</div>}

      <label>Alamat</label>
      <textarea
        className={errors.address ? "input-error" : ""}
        rows={3}
        placeholder="Alamat lengkap (jalan, desa/kelurahan, kecamatan, kota)"
        value={form.address}
        onChange={(e) => updateForm({ address: e.target.value })}
      />
      {errors.address && <div className="field-error">{errors.address}</div>}

      <button type="button" className="btn" onClick={validate}>
        Lanjut ke Pembayaran
      </button>
    </div>
  );
}
