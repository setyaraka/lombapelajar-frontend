import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import type { ExamStatus } from "../services/exam.service";

type Props = {
  id: string;
  title: string;
  level: string[];
  date: string;
  poster?: string | null;
  submitted?: boolean;
  creationFile?: string | null;
  examStatus?: ExamStatus | null;
  onEdit?: () => void;
};

export default function CompetitionCard({
  id,
  title,
  level,
  date,
  poster,
  submitted,
  creationFile,
  examStatus,
  onEdit,
}: Props) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const defaultPoster = "/default-poster.png";

  const openDetail = () => navigate(`/competition/${id}`);

  return (
    <div className="card">
      <div className="poster">
        <img
          src={poster ? `${import.meta.env.VITE_API_URL}/files/${poster}` : defaultPoster}
          alt={title}
          loading="lazy"
          onError={(e) => (e.currentTarget.src = defaultPoster)}
        />
      </div>

      <div className="content">
        <div className="competition-name">{title}</div>
        <div className="flex flex-wrap items-center gap-3 mt-1 mb-2">
          <div className="flex flex-wrap gap-1">
            {level.map((lv) => (
              <span key={lv} className={`badge-level ${lv.toLowerCase()}`}>
                {lv}
              </span>
            ))}
          </div>
          <div className="info-row">
            <span className="date-info">{date}</span>
          </div>
          {user && submitted && (
            <>
              {creationFile ? (
                <div className="badge approved">Karya Terupload</div>
              ) : (
                <div className="badge pending">Belum Upload Karya</div>
              )}
            </>
          )}
          {user && examStatus && (
            <div className={`badge exam-status ${examStatus.status.toLowerCase()}`}>
              {examStatus.label}
            </div>
          )}
        </div>

        <div className="competitions-footer">
          <button className="btn" onClick={openDetail}>
            Lihat Detail
          </button>

          {onEdit && user?.role === "ADMIN" && (
            <button className="btn secondary" onClick={onEdit}>
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
