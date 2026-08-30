import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loading from "../components/Loading";
import { ExamAPI, type ExamResult } from "../services/exam.service";

export default function AnnouncementPage() {
  const { id } = useParams();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;

      try {
        const data = await ExamAPI.getResult(id);
        setResult(data);
      } catch {
        setResult(null);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  if (loading) return <Loading fullScreen text="Memuat pengumuman..." />;

  return (
    <div className="announcement-page">
      <Header />
      <main className="container announcement-shell">
        <div className="detail-card announcement-card">
          <p className="exam-eyebrow">Pengumuman</p>
          <h1>Hasil Ujian</h1>

          {!result || !result.announced ? (
            <div className="announcement-empty">
              <h2>Hasil ujian belum diumumkan.</h2>
              <p>Silakan menunggu jadwal pengumuman.</p>
              {result?.announcementAt && (
                <p>Tanggal pengumuman: {new Date(result.announcementAt).toLocaleString("id-ID")}</p>
              )}
            </div>
          ) : (
            <div className="announcement-result">
              <div>
                <span>Status kelulusan</span>
                <strong>{result.status}</strong>
              </div>
              <div>
                <span>Nilai</span>
                <strong>{result.score ?? "-"}</strong>
              </div>
              <div>
                <span>Ranking</span>
                <strong>{result.rank ?? "-"}</strong>
              </div>
              <div>
                <span>Tanggal pengumuman</span>
                <strong>
                  {result.announcementAt
                    ? new Date(result.announcementAt).toLocaleString("id-ID")
                    : "-"}
                </strong>
              </div>
              <p>{result.notes}</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
