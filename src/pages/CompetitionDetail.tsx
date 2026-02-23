import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import { getCompetition } from "../services/competition.service";
import {
  toCompetitionDetailVM,
  type CompetitionDetailVM,
} from "../mapper/competition-detail.mapper";

export default function CompetitionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [preview, setPreview] = useState(false);
  const [competition, setCompetition] = useState<CompetitionDetailVM | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  const defaultPoster = "/default-poster.png";
  const safePoster = competition?.poster && !imgError ? competition.poster : defaultPoster;

  useEffect(() => {
    const load = async () => {
      try {
        if (!id) return;
        const res = await getCompetition(id);
        setCompetition(toCompetitionDetailVM(res));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) return <div className="container">Loading...</div>;
  if (!competition) return <div className="container">Lomba tidak ditemukan</div>;

  return (
    <>
      {/* IMAGE PREVIEW */}
      {preview && (
        <div className="image-viewer" onClick={() => setPreview(false)}>
          <img src={safePoster} alt={competition.title} />
        </div>
      )}

      <div className="competition-detail-page">
        <Header />

        <div className="container">
          {/* HERO */}
          <div className="event-hero">
            <div className="event-left">
              <span className="badge">{competition.category.toUpperCase()}</span>
              <h1>{competition.title}</h1>

              <div className="meta">
                <span>{competition.level.toUpperCase()}</span>
                <span>{competition.deadline}</span>
                <span>{competition.price}</span>
              </div>

              <button
                className="cta"
                onClick={() => navigate(`/competition/${competition.id}/register`)}
              >
                Daftar Sekarang
              </button>
            </div>

            <div className="event-right">
              <img
                src={safePoster}
                alt={competition.title}
                onClick={() => setPreview(true)}
                onError={() => setImgError(true)}
                className="clickable-poster"
              />
            </div>
          </div>

          {/* INFO GRID */}
          <div className="info-grid">
            <div className="detail-card">
              <h3>Deskripsi</h3>
              <p>{competition.description}</p>
            </div>

            <div className="detail-card">
              <h3>Persyaratan</h3>
              <ul>
                {competition.requirements.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* TIMELINE */}
          <div className="timeline">
            <h3>Timeline</h3>

            <div className="timeline-steps">
              {competition.timeline.map((t, i) => (
                <div className="step" key={i}>
                  <div className="circle">{i + 1}</div>
                  <div className="step-info">
                    <b>{t.title}</b>
                    <span>{t.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
