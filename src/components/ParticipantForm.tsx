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

    // if (!form.nisn.trim()) e.nisn = "NIS/NISN wajib diisi";
    // if (!form.school.trim()) e.school = "Asal sekolah wajib diisi";
    // if (!form.whatsapp.trim()) e.whatsapp = "Nomor WhatsApp wajib diisi";
    // if (!form.address.trim()) e.address = "Alamat wajib diisi";
    if (!form.leaderName.trim()) e.leaderName = "Nama ketua wajib diisi";
    if (!form.parentName.trim()) e.parentName = "Nama pembina wajib diisi";

    setErrors(e);

    if (Object.keys(e).length > 0) {
      alert("Masih ada data yang belum diisi");
      return;
    }

    next();
  };

  const addMember = () => {
    updateForm({ members: [...form.members, ""] });
  };

  const removeMember = (index: number) => {
    const updated = form.members.filter((_, i) => i !== index);
    updateForm({ members: updated });
  };

  const updateMember = (index: number, value: string) => {
    const updated = [...form.members];
    updated[index] = value;
    updateForm({ members: updated });
  };

  // return (
  //   <div className="card form-control register-active">
  //     <div className="title">Data Peserta</div>

  //     <label htmlFor="nisn">NIS / NISN</label>
  //     <input
  //       id="nisn"
  //       className={errors.nisn ? "input-error" : ""}
  //       type="text"
  //       maxLength={10}
  //       inputMode="numeric"
  //       placeholder="Masukkan NIS atau NISN (10 digit)"
  //       value={form.nisn}
  //       onChange={(e) => {
  //         const value = e.target.value.replace(/\D/g, "");
  //         updateForm({ nisn: value });
  //       }}
  //     />
  //     {errors.nisn && <div className="field-error">{errors.nisn}</div>}

  //     <label htmlFor="school_name">Asal Sekolah</label>
  //     <input
  //       id="school_name"
  //       className={errors.school ? "input-error" : ""}
  //       type="text"
  //       placeholder="Contoh: SMA Negeri 1 Bandung"
  //       value={form.school}
  //       onChange={(e) => updateForm({ school: e.target.value })}
  //     />
  //     {errors.school && <div className="field-error">{errors.school}</div>}

  //     <label htmlFor="whatsapp_number">No. WhatsApp</label>

  //     <div className="phone-input">
  //       <span className="prefix">+62</span>

  //       <input
  //         id="whatsapp_number"
  //         className={`${errors.whatsapp ? "input-error" : ""} phone-input`}
  //         type="text"
  //         inputMode="numeric"
  //         placeholder="81234567890"
  //         value={form.whatsapp}
  //         maxLength={13}
  //         minLength={9}
  //         onChange={(e) =>
  //           updateForm({
  //             whatsapp: e.target.value.replace(/\D/g, ""),
  //           })
  //         }
  //       />
  //     </div>

  //     {errors.whatsapp && <div className="field-error">{errors.whatsapp}</div>}

  //     <label htmlFor="address">Alamat</label>
  //     <textarea
  //       id="address"
  //       autoComplete="street-address"
  //       className={errors.address ? "input-error" : ""}
  //       rows={3}
  //       placeholder="Alamat lengkap (jalan, desa/kelurahan, kecamatan, kota)"
  //       value={form.address}
  //       onChange={(e) => updateForm({ address: e.target.value })}
  //     />
  //     {errors.address && <div className="field-error">{errors.address}</div>}

  //     <button type="button" className="btn approve mt-2" onClick={validate}>
  //       Lanjut ke Pembayaran
  //     </button>
  //   </div>
  // );
  return (
    <div className="card form-control register-active">
      <div className="title">Data Peserta</div>

      {/* KETUA */}
      <div className="mb-3">
        <label>Nama Ketua</label>
        <input
          className={errors.leaderName ? "input-error" : ""}
          type="text"
          placeholder="Masukkan nama ketua"
          value={form.leaderName}
          onChange={(e) => updateForm({ leaderName: e.target.value })}
        />
        {errors.leaderName && <div className="field-error">{errors.leaderName}</div>}
      </div>

      {/* ANGGOTA */}
      <div className="mb-3">
        <label>Nama Anggota</label>

        {form.members.map((member, index) => (
          <div key={index} className="member-row">
            <input
              className={errors[`member_${index}`] ? "input-error" : ""}
              type="text"
              placeholder={`Anggota ${index + 1}`}
              value={member}
              onChange={(e) => updateMember(index, e.target.value)}
            />

            <button type="button" className="btn-icon width" onClick={() => removeMember(index)}>
              ✕
            </button>
          </div>
        ))}

        <button type="button" className="btn-add" onClick={addMember}>
          + Tambah Anggota
        </button>
      </div>

      {/* WALI */}
      <div>
        <label>Nama Pembina</label>
        <input
          className={errors.parentName ? "input-error" : ""}
          type="text"
          placeholder="Nama pembina"
          value={form.parentName}
          onChange={(e) => updateForm({ parentName: e.target.value })}
        />
        {errors.parentName && <div className="field-error">{errors.parentName}</div>}

        {/* BUTTON */}
        <button type="button" className="btn approve mt-2" onClick={validate}>
          Lanjut ke Pembayaran
        </button>
      </div>
    </div>
  );
}
