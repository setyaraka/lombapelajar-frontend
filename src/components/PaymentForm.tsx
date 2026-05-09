import imageCompression from "browser-image-compression";
import type { RegisterForm } from "../pages/RegisterCompetition";
import LoadingButton from "./LoadingButton";
export type CompetitionPaymentInfo = {
  title: string;
  price: number;
  bankName?: string | null;
  bankNumber?: string | null;
  bankHolder?: string | null;
  qris?: string | null;
};

export default function PaymentForm({
  form,
  competition,
  updateForm,
  back,
  submit,
  loading,
}: {
  form: RegisterForm;
  competition: CompetitionPaymentInfo | null;
  updateForm: (d: Partial<RegisterForm>) => void;
  back: () => void;
  submit: () => void;
  loading: boolean;
}) {
  const formatRupiah = (n?: number) => (n ? `Rp ${n.toLocaleString("id-ID")}` : "-");

  return (
    <div className="card form-control register-active">
      <div className="title">Pembayaran</div>

      <div className="bank-box">
        {competition ? (
          <>
            <p style={{ marginBottom: 10, fontWeight: 500 }}>Silakan pilih salah satu metode pembayaran berikut:</p>

            <div className="grid">
              {competition.bankName && (
                <div className="method-box">
                  <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>Transfer Bank:</div>
                  <b>
                    {competition.bankName} - {competition.bankNumber}
                  </b>
                  <br />
                  a.n {competition.bankHolder}
                </div>
              )}

              {competition.qris && (
                <div className="method-box">
                  <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>Scan QRIS:</div>
                  <img
                    src={`${import.meta.env.VITE_API_URL}/files/${competition.qris}`}
                    alt="QRIS"
                    style={{ maxWidth: "50%", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  />
                </div>
              )}
            </div>

            <div style={{ marginTop: 15, paddingTop: 15, borderTop: "1px dashed #ddd" }}>
              Total Biaya: <b style={{ color: "var(--primary)", fontSize: 18 }}>{formatRupiah(competition.price)}</b>
            </div>
          </>
        ) : (
          <>Memuat informasi pembayaran...</>
        )}
      </div>

      {/* UPLOAD */}
      <label>Upload Bukti Pembayaran</label>
      <div className="upload">
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            try {
              const compressed = await imageCompression(file, {
                maxSizeMB: 1,
                maxWidthOrHeight: 1280,
                useWebWorker: true,
              });
              updateForm({ paymentProof: compressed });
            } catch {
              updateForm({ paymentProof: file });
            }
          }}
        />

        {form.paymentProof && <div className="file-selected">{form.paymentProof.name}</div>}

        <div style={{ fontSize: 13, color: "#777", marginTop: 8 }}>
          Format JPG/PNG, maksimal 1MB
        </div>
      </div>

      <div className="competitions-footer mt-2">
        <button type="button" className="btn secondary" onClick={back}>
          Kembali
        </button>

        <LoadingButton
          type="button"
          loading={loading}
          className="btn edit"
          disabled={!form.paymentProof || !competition}
          onClick={submit}
        >
          Kirim Pendaftaran
        </LoadingButton>
      </div>
    </div>
  );
}
