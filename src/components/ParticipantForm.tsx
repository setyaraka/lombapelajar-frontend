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
  return (
    <div className="card form-control">
      <div className="title">Data Peserta</div>

      <label>Nama Peserta</label>
      <input
        type="text"
        placeholder="Contoh: Ahmad Rizki Pratama"
        value={form.name}
        onChange={(e) => updateForm({ name: e.target.value })}
      />

      <label>NIS / NISN</label>
      <input
        type="text"
        inputMode="numeric"
        placeholder="Contoh: 1234567890"
        value={form.nisn}
        onChange={(e) => updateForm({ nisn: e.target.value })}
      />

      <label>Asal Sekolah</label>
      <input
        type="text"
        placeholder="Contoh: SMA Negeri 5 Surabaya"
        value={form.school}
        onChange={(e) => updateForm({ school: e.target.value })}
      />

      <label>Pilih Jenjang</label>
      <select value={form.level} onChange={(e) => updateForm({ level: e.target.value })}>
        <option value="">Pilih jenjang pendidikan</option>
        <option>SD</option>
        <option>SMP</option>
        <option>SMA</option>
      </select>

      <label>No. WhatsApp</label>
      <input
        type="tel"
        placeholder="Contoh: 081234567890"
        value={form.whatsapp}
        onChange={(e) => updateForm({ whatsapp: e.target.value })}
      />

      <label>Alamat</label>
      <textarea
        rows={3}
        placeholder="Masukkan alamat lengkap peserta"
        value={form.address}
        onChange={(e) => updateForm({ address: e.target.value })}
      />

      <button type="button" className="btn" onClick={next}>
        Lanjut ke Pembayaran
      </button>
    </div>
  );
}
