import { useNavigate } from "react-router-dom";

type Props = {
  id: string;
  title: string;
  level: string;
  date: string;
  poster?: string | null;
  submitted?: boolean;
};

export default function CompetitionCard({ id, title, level, date, poster, submitted }: Props) {
  const navigate = useNavigate();

  const openDetail = () => {
    navigate(`/competition/${id}`);
  };

  const defaultPoster = "/default-poster.png";

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = defaultPoster;
  };

  return (
    <div className="card">
      <div className="poster">
        <img
          src={poster || defaultPoster}
          alt={title}
          loading="lazy"
          onError={handleImgError}
        />
      </div>

      <div className="content">
        <div className="lomba-title">{title}</div>
        <div className="info">
          {level.toUpperCase()} | {date}
        </div>

        {submitted && (
          <div className="submitted-info">
            Kamu sudah terdaftar di lomba ini
          </div>
        )}

        <button className="btn" onClick={openDetail}>
          Lihat Detail
        </button>
      </div>
    </div>
  );
}