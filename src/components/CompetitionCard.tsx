import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

type Props = {
  id: string;
  title: string;
  level: string;
  date: string;
  poster?: string | null;
  submitted?: boolean;
  onEdit?: () => void;
};

export default function CompetitionCard({
  id,
  title,
  level,
  date,
  poster,
  submitted,
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
        <div className="lomba-title">{title}</div>
        <div className="info">
          {level.toUpperCase()} | {date}
        </div>

        {submitted && <div className="submitted-info">Kamu sudah terdaftar di lomba ini</div>}

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
  );
}
