import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function CompetitionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // nanti diganti fetch API berdasarkan id
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
      { title: "Pendaftaran", date: "1 Februari - 30 Maret 2026" },
      { title: "Babak Penyisihan", date: "5 April 2026" },
      { title: "Final", date: "20 April 2026" },
    ],
  };

  return (
    <div className="competition-detail-page">
      {/* HEADER */}
      <Header />

      <div className="container">
        {/* HEADER BOX */}
        <div className="header-box">
          <span className="badge">{competition.category}</span>
          <h1>{competition.title}</h1>

          <div className="poster-container">
            <img src={competition.poster} alt={competition.title} />
          </div>

          <div className="header-info">
            <span>Tingkat: {competition.level}</span>
            <span>Deadline: {competition.deadline}</span>
            <span>Biaya: {competition.price}</span>
          </div>
        </div>

        {/* DESKRIPSI */}
        <div className="detail-box">
          <h3>Deskripsi Lomba</h3>
          <p>{competition.description}</p>
        </div>

        {/* REQUIREMENTS */}
        <div className="detail-box requirements">
          <h3>Persyaratan Peserta</h3>
          <ul>
            {competition.requirements.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>

        {/* TIMELINE */}
        <div className="detail-box">
          <h3>Timeline Lomba</h3>

          {competition.timeline.map((t, i) => (
            <div className="timeline-item" key={i}>
              <div className="timeline-title">{t.title}</div>
              <div className="timeline-date">{t.date}</div>
            </div>
          ))}
        </div>

        <button
          className="btn"
          style={{ marginTop: 22 }}
          onClick={() => navigate(`/competition/${id}/register`)}
        >
          Daftar Sekarang
        </button>
      </div>

      <Footer />
    </div>
  );
}
