import { useNavigate } from "react-router-dom";

type Props = {
  id: string;
  title: string;
  level: string;
  date: string;
  poster: string;
  submitted?: boolean;
};

export default function CompetitionCard({ id, title, level, date, poster, submitted }: Props) {
  const navigate = useNavigate();

  const openDetail = () => {
    navigate(`/competition/${id}`);
  };

  return (
    <div className="card">
      <div className="poster">
        <img src={poster} alt={title} loading="lazy" />
      </div>

      <div className="content">
        <div className="lomba-title">{title}</div>
        <div className="info">
          {level} | {date}
        </div>

        {submitted && <div className="submitted-info">✓ Kamu sudah terdaftar di lomba ini</div>}
        <button className="btn" onClick={openDetail}>
          Lihat Detail
        </button>
      </div>
    </div>
  );
}
