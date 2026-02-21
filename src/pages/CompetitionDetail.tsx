import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useState } from "react";

export default function CompetitionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [preview, setPreview] = useState(false);

  const competition = {
    title: "Olimpiade Matematika Nasional",
    category: "Akademik",
    level: "SMA",
    deadline: "30 Maret 2026",
    price: "Rp50.000",
    poster: "https://api.lombahub.com/posts/image/df78150c-e5f3-4351-b2f8-478fa2e5c9d8.jpeg",
    description:
      "Olimpiade Matematika Nasional merupakan ajang kompetisi untuk menguji kemampuan logika, analisis, dan pemecahan masalah matematika bagi pelajar SMA di seluruh Indonesia.",
    requirements: [
      "Pelajar aktif tingkat SMA",
      "Mengisi formulir pendaftaran",
      "Mengupload bukti pembayaran",
      "Mengikuti seluruh tahapan seleksi",
    ],
    timeline: [
      { title: "Pendaftaran", date: "1 Feb - 30 Mar 2026" },
      { title: "Penyisihan", date: "5 April 2026" },
      { title: "Final", date: "20 April 2026" },
    ],
  };

  return (
    <>
      {preview && (
        <div className="image-viewer" onClick={() => setPreview(false)}>
          <img src={competition.poster} />
        </div>
      )}
      <div className="competition-detail-page">
        <Header />

        <div className="container">
          {/* HERO */}
          <div className="event-hero">
            <div className="event-left">
              <span className="badge">{competition.category}</span>
              <h1>{competition.title}</h1>

              <div className="meta">
                <span>🎓 {competition.level}</span>
                <span>⏰ {competition.deadline}</span>
                <span>💰 {competition.price}</span>
              </div>

              <button className="cta" onClick={() => navigate(`/competition/${id}/register`)}>
                Daftar Sekarang
              </button>
            </div>

            <div className="event-right">
              <img
                src={competition.poster}
                alt={competition.title}
                onClick={() => setPreview(true)}
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
                  <li key={i}>✔ {r}</li>
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
