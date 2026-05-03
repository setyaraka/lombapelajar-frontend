import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import { getCompetition, uploadJuknis } from "../services/competition.service";
import {
  toCompetitionDetailVM,
  type CompetitionDetailVM,
} from "../mapper/competition-detail.mapper";
import Loading from "../components/Loading";
import LoadingButton from "../components/LoadingButton";

export default function CompetitionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [preview, setPreview] = useState(false);
  const [competition, setCompetition] = useState<CompetitionDetailVM | null>(null);
  const [imgError, setImgError] = useState(false);

  const [loading, setLoading] = useState(true);
  const [downloadJuknisLoading, setDownloadJuknisLoading] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [showJuknisModal, setShowJuknisModal] = useState(false);
  const [juknisFile, setJuknisFile] = useState<File | null>(null);
  const [uploadingJuknis, setUploadingJuknis] = useState(false);

  const defaultPoster = "/default-poster.png";
  const safePoster =
    competition?.poster && !imgError
      ? `${import.meta.env.VITE_API_URL}/files/${competition.poster}`
      : defaultPoster;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return alert("Pilih file dulu!");

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      // nanti ganti ke API kamu
      console.log("UPLOAD FILE:", file);

      alert("Upload berhasil (dummy)");
      setFile(null);
    } catch (err) {
      console.error(err);
      alert("Upload gagal");
    } finally {
      setUploading(false);
    }
  };

  const handleJuknisChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setJuknisFile(selected);
  };

  const handleUploadJuknis = async () => {
    if (!juknisFile || !id) return alert("Pilih file dulu!");

    try {
      setUploadingJuknis(true);

      const res = await uploadJuknis(id, juknisFile);

      setCompetition((prev) =>
        prev
          ? {
              ...prev,
              juknis: res.data.juknis,
            }
          : prev
      );

      alert("Upload juknis berhasil");
      setJuknisFile(null);
      setShowJuknisModal(false);
    } catch (err) {
      console.error(err);
      alert("Upload gagal");
    } finally {
      setUploadingJuknis(false);
    }
  };

  const handleDownloadJuknis = async () => {
    if (!competition?.juknis) {
      return alert("Juknis tidak tersedia");
    }

    try {
      setDownloadJuknisLoading(true);

      const fileUrl = `${import.meta.env.VITE_API_URL}/files/${competition.juknis}`;

      const response = await fetch(fileUrl);

      if (!response.ok) {
        throw new Error("Gagal download file");
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = competition.juknis || "juknis.pdf";
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Gagal download juknis");
    } finally {
      setDownloadJuknisLoading(false);
    }
  };

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

  if (loading) return <Loading fullScreen text="Memuat detail lomba..." />;
  if (!competition) return <div className="container">Lomba tidak ditemukan</div>;

  return (
    <>
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              Upload Karya
              <button className="btn-icon" onClick={() => setShowUploadModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p className="label">Upload file (PDF, PNG, JPG, JPEG)</p>

              <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} />

              {file && (
                <div className="mt-2">
                  📄 <b>{file.name}</b>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn secondary" onClick={() => setShowUploadModal(false)}>
                Batal
              </button>

              <button className="btn" onClick={handleUpload} disabled={!file || uploading}>
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showJuknisModal && (
        <div className="modal-overlay" onClick={() => setShowJuknisModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              Upload Juknis
              <button className="btn-icon" onClick={() => setShowJuknisModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p className="label">Upload Juknis (PDF saja)</p>

              <input type="file" accept=".pdf" onChange={handleJuknisChange} />

              {juknisFile && (
                <div className="mt-2">
                  📄 <b>{juknisFile.name}</b>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn secondary" onClick={() => setShowJuknisModal(false)}>
                Batal
              </button>

              <button
                className="btn"
                onClick={handleUploadJuknis}
                disabled={!juknisFile || uploadingJuknis}
              >
                {uploadingJuknis ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
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

              <div className="grid grid-cols-2">
                <button
                  className="btn width"
                  onClick={() => navigate(`/competition/${competition.id}/register`)}
                >
                  Daftar Sekarang
                </button>

                <button className="btn width">Pengumuman</button>
                {/* <button className="btn width">Juknis</button> */}
                {/* <button className="btn width">Upload</button> */}
                <button className="btn width" onClick={() => setShowJuknisModal(true)}>
                  Upload Juknis
                </button>
                <button className="btn width" onClick={() => setShowUploadModal(true)}>
                  Upload Karya
                </button>
              </div>
              <div className="mt-1">
                <span className="badge approved">Terverifikasi</span>
              </div>
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
              <LoadingButton
                onClick={handleDownloadJuknis}
                loading={downloadJuknisLoading}
                className="btn width"
              >
                Download Juknis
              </LoadingButton>
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
