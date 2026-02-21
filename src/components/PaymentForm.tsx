import type { RegisterForm } from "../pages/RegisterCompetition";

export default function PaymentForm({
  //   form,
  updateForm,
  back,
  submit,
}: {
  form: RegisterForm;
  updateForm: (d: Partial<RegisterForm>) => void;
  back: () => void;
  submit: () => void;
}) {
  return (
    <div className="card">
      <div className="title">Pembayaran</div>

      <div className="bank-box">
        Transfer ke:
        <br />
        <b>BCA - 1234567890</b>
        <br />
        a.n Panitia Olimpiade Nasional
        <br />
        <br />
        Biaya: <b>Rp 35.000</b>
      </div>

      <label>Upload Bukti Pembayaran</label>
      <div className="upload">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => updateForm({ paymentProof: e.target.files?.[0] })}
        />
        <div style={{ fontSize: 13, color: "#777", marginTop: 8 }}>
          Format JPG/PNG, maksimal 2MB
        </div>
      </div>

      <button type="button" className="btn-secondary" onClick={back}>
        Kembali
      </button>

      <button type="button" className="btn" onClick={submit}>
        Kirim Pendaftaran
      </button>
    </div>
  );
}
