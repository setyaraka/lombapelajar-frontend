import { useEffect } from "react";

export type ProofData = {
  id: number;
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
};

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="proof-field">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

export default function PaymentProofModal({ open, data, onClose }: Props) {
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
            <img
              src="https://www.paper.id/blog/wp-content/uploads/2025/07/contoh-kwitansi-pembayaran.png"
              alt="Bukti Pembayaran"
            />
          </div>

          {/* INFO */}
          <div className="proof-info">
            <Info label="Peserta" value={data.name} />
            <Info label="Sekolah" value={data.school} />
            <Info label="Lomba" value={data.competition} />
            {data.uploadedAt && <Info label="Upload" value={data.uploadedAt} />}
          </div>
        </div>
      </div>
    </div>
  );
}
