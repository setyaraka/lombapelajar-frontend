import { useEffect } from "react";

type Participant = {
  id: number;
  name: string;
  school: string;
  status: "pending" | "verified" | "rejected";
};

type Props = {
  open: boolean;
  onClose: () => void;
  competitionTitle?: string;
  participants: Participant[];
};

export default function CompetitionParticipantsModal({
  open,
  onClose,
  competitionTitle,
  participants,
}: Props) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal large">
        <div className="modal-header">
          <h2>Peserta - {competitionTitle}</h2>
          <button className="icon-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="participants-container">
          <table className="participants-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Sekolah</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {participants.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center" }}>
                    Belum ada peserta
                  </td>
                </tr>
              ) : (
                participants.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.school}</td>
                    <td>
                      <span className={`badge ${p.status}`}>{p.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
