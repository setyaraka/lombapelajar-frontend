import { useEffect } from "react";

export type ProofData = {
  id: string;
  name: string;
  school: string;
  competition: string;
  imageUrl: string;
  uploadedAt?: string;
};

type Props = {
  open: boolean;
  data: ProofData | null;
  onClose: () => void;
  changeStatus: CallableFunction;
};

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="proof-field">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

export default function PaymentProofModal({ open, data, onClose, changeStatus }: Props) {
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", esc);
      document.body.style.overflow = "auto";
    };
  }, [open, onClose]);

  if (!open || !data) return null;

  const fileUrl = (path?: string) => (path ? `${import.meta.env.VITE_API_URL}${path}` : "");

  const handleChangeStatus = (status: string) => {
    changeStatus(data.id, status);
    onClose();
  };

  return (
    <div className="proof-modal">
      <div className="proof-backdrop" onClick={onClose} />

      <div className="proof-container">
        {/* HEADER */}
        <div className="proof-header">
          <div>
            <h2>Bukti Pembayaran</h2>
            <p>
              {data.name} • {data.school}
            </p>
          </div>

          <button onClick={onClose} className="proof-close">
            ×
          </button>
        </div>

        {/* BODY */}
        <div className="proof-body">
          {/* IMAGE */}
          <div className="proof-image">
            {/* <img src={data.imageUrl} alt="Bukti pembayaran" /> */}
            <img src={fileUrl(data.imageUrl)} alt="Bukti Pembayaran" />
          </div>

          {/* INFO */}
          <div className="proof-info">
            <Info label="Peserta" value={data.name} />
            <Info label="Sekolah" value={data.school} />
            <Info label="Lomba" value={data.competition} />
            {data.uploadedAt && <Info label="Upload" value={data.uploadedAt} />}
            <div className="proof-actions">
              <button onClick={() => handleChangeStatus("VERIFIED")} className="btn approve">
                Terima Pembayaran
              </button>
              <button onClick={() => handleChangeStatus("REJECTED")} className="btn reject">
                Tolak
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
