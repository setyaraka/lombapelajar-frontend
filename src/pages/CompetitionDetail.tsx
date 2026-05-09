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
import imageCompression from "browser-image-compression";
import { uploadCreation } from "../services/registration.service";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../auth/useAuth";

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

export default function CompetitionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [preview, setPreview] = useState(false);
  const [competition, setCompetition] = useState<CompetitionDetailVM | null>(null);
  const [imgError, setImgError] = useState(false);

  const [loading, setLoading] = useState(true);
  const [downloadJuknisLoading, setDownloadJuknisLoading] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [showJuknisModal, setShowJuknisModal] = useState(false);
  const [showCreationModal, setShowCreationModal] = useState(false);
  const [juknisFile, setJuknisFile] = useState<File | null>(null);
  const [uploadingJuknis, setUploadingJuknis] = useState(false);

  const defaultPoster = "/default-poster.png";
  const safePoster =
    competition?.poster && !imgError
      ? `${import.meta.env.VITE_API_URL}/files/${competition.poster}`
      : defaultPoster;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.type.startsWith("image/")) {
      try {
        const compressed = await imageCompression(selected, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1280,
          useWebWorker: true,
        });
        setFile(compressed);
      } catch {
        setFile(selected);
      }
    } else {
      setFile(selected);
    }
  };

  const handleJuknisChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setJuknisFile(selected);
  };

  const handleUploadJuknis = async () => {
    if (!juknisFile || !id) return toast.error("Pilih file dulu!");

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

      toast.success("Upload juknis berhasil");
      setJuknisFile(null);
      setShowJuknisModal(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload gagal";
      toast.error(message);
    } finally {
      setUploadingJuknis(false);
    }
  };

  const handleDownloadJuknis = async () => {
    if (!competition?.juknis) {
      return toast.error("Juknis tidak tersedia");
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
      toast.error("Gagal download juknis");
    } finally {
      setDownloadJuknisLoading(false);
    }
  };

  const handleUploadCreation = async () => {
    if (!file || !id) return toast.error("Pilih file dulu!");

    try {
      setUploading(true);

      const res = await uploadCreation(id, file);

      toast.success("Upload karya berhasil");

      setFile(null);
      setShowUploadModal(false);

      // optional: refresh data
      setCompetition((prev) =>
        prev
          ? {
            ...prev,
            creationFile: res.data.creationFile,
          }
          : prev
      );
    } catch (err: unknown) {
      const error = err as ApiError;

      const message = error.response?.data?.message || "Upload gagal";

      toast.error(message);
    } finally {
      setUploading(false);
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
      <Helmet>
        <title>{competition.title} - LombaPelajar</title>
        <meta name="description" content={competition.description?.slice(0, 150) || `Informasi lengkap mengenai ${competition.title}. Daftar sekarang dan raih prestasimu di LombaPelajar.`} />
        <meta property="og:title" content={`${competition.title} - LombaPelajar`} />
        <meta property="og:description" content={competition.description?.slice(0, 150) || `Informasi lengkap mengenai ${competition.title}.`} />
        {competition.poster && <meta property="og:image" content={`${import.meta.env.VITE_API_URL}/files/${competition.poster}`} />}
      </Helmet>
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

              <button className="btn" onClick={handleUploadCreation} disabled={!file || uploading}>
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

              <LoadingButton
                className="btn"
                loading={uploadingJuknis}
                onClick={handleUploadJuknis}
                disabled={!juknisFile || uploadingJuknis}
              >
                Upload
              </LoadingButton>
            </div>
          </div>
        </div>
      )}
      {showCreationModal && competition.creationFile && (
        <div className="modal-overlay" onClick={() => setShowCreationModal(false)}>
          <div className="modal large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              Karya Anda
              <button className="btn-icon" onClick={() => setShowCreationModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body text-center">
              {competition.creationFile.toLowerCase().endsWith(".pdf") ? (
                <div className="file-preview-placeholder">
                  <div style={{ marginBottom: "15px" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 64 64">
                      <path
                        style={{ opacity: 0.2 }}
                        d="M 14.5,8 C 13.115,8 12,9.115 12,10.5 v 45 c 0,1.385 1.115,2.5 2.5,2.5 h 35 C 50.885,58 52,56.885 52,55.5 V 23 L 38.25,21.75 37,8 Z"
                      />
                      <path
                        fill="#c03630"
                        d="m14.5 7c-1.385 0-2.5 1.115-2.5 2.5v45c0 1.385 1.115 2.5 2.5 2.5h35c1.385 0 2.5-1.115 2.5-2.5v-32.5l-13.75-1.25-1.25-13.75z"
                      />
                      <path style={{ opacity: 0.2 }} d="m 37,8 v 12.5 c 0,1.3808 1.1193,2.5 2.5,2.5 H 52 Z" />
                      <path fill="#f36961" d="m37 7v12.5c0 1.3808 1.1193 2.5 2.5 2.5h12.5l-15-15z" />
                      <path
                        style={{ opacity: 0.2 }}
                        d="m 29.976,25.562 c -0.57658,0 -1.1158,0.28221 -1.2462,0.74801 -0.4844,1.7858 0.05775,4.5474 0.96195,7.9883 l -0.27276,0.66618 c -0.69234,1.6876 -1.5578,3.3684 -2.3188,4.8599 -3.1419,6.1475 -5.5861,9.4644 -7.2159,9.6968 l -0.0063,-0.0675 c -0.03537,-0.76682 1.3798,-2.7439 3.2978,-4.3158 0.20006,-0.1618 1.0538,-0.98776 1.0538,-0.98776 0,0 -1.1524,0.60834 -1.4112,0.76522 -2.4035,1.4346 -3.5995,2.872 -3.7945,3.8261 -0.05788,0.2834 -0.02075,0.63212 0.22969,0.7753 l 0.6145,0.30868 c 1.673,0.83744 3.7301,-1.3645 6.465,-6.1578 2.783,-0.91295 6.2554,-1.7725 9.4169,-2.2382 2.83,1.617 6.0762,2.3869 7.3235,2.0545 0.23734,-0.06275 0.487,-0.24905 0.6145,-0.42065 0.1,-0.15789 0.23979,-0.78965 0.23979,-0.78965 0,0 -0.23466,0.31934 -0.42788,0.41348 -0.7894,0.37264 -3.2816,-0.24905 -5.839,-1.5002 2.2112,-0.23535 4.0534,-0.24442 5.0379,0.07025 1.2504,0.39912 1.2514,0.80824 1.2347,0.89158 0.01687,-0.06862 0.07287,-0.34272 0.066,-0.45941 -0.02837,-0.30008 -0.12088,-0.56804 -0.34744,-0.78965 -0.46284,-0.45599 -1.6056,-0.68578 -3.1629,-0.70636 -1.1738,-0.01275 -2.5812,0.09 -4.109,0.30868 -0.70015,-0.40205 -1.439,-0.84402 -2.0244,-1.3912 -1.4846,-1.3866 -2.729,-3.3118 -3.5018,-5.47 0.05275,-0.20691 0.10325,-0.40909 0.1493,-0.61306 0.21479,-0.96589 0.36896,-4.1592 0.36896,-4.1592 0,0 -0.61168,2.399 -0.70778,2.7609 -0.06175,0.22946 -0.13858,0.47438 -0.22684,0.72934 -0.46875,-1.6474 -0.70636,-3.244 -0.70636,-4.455 0,-0.34224 0.02938,-1.0082 0.12631,-1.5348 0.04725,-0.37556 0.18325,-0.57059 0.3245,-0.66474 0.27946,0.06775 0.59229,0.49635 0.91886,1.2132 0.28044,0.61975 0.26271,1.3375 0.26271,1.7818 0,0 0.30076,-1.1 0.23115,-1.7501 -0.04237,-0.39029 -0.4137,-1.3944 -1.2031,-1.3826 h -0.06463 l -0.35174,-0.0038 z m 0.26848,9.9739 c 0.81689,1.6425 1.9435,3.2024 3.4214,4.4536 0.32946,0.27849 0.68,0.54344 1.0409,0.7925 -2.6839,0.49914 -5.5026,1.2013 -8.1219,2.2986 0.47364,-0.84136 0.98576,-1.758 1.5104,-2.7465 1.0159,-1.921 1.6315,-3.4028 2.1492,-4.7981 z"
                      />
                      <path
                        fill="#fff"
                        d="m29.976 24.562c-0.57658 0-1.1158 0.28221-1.2462 0.74801-0.4844 1.7858 0.05775 4.5474 0.96195 7.9883l-0.27276 0.66618c-0.69234 1.6876-1.5578 3.3684-2.3188 4.8599-3.1419 6.1475-5.5861 9.4644-7.2159 9.6968l-0.0063-0.0675c-0.03537-0.76682 1.3798-2.7439 3.2978-4.3158 0.20006-0.1618 1.0538-0.98776 1.0538-0.98776s-1.1524 0.60834-1.4112 0.76522c-2.4035 1.4346-3.5995 2.872-3.7945 3.8261-0.05788 0.2834-0.02075 0.63212 0.22969 0.7753l0.6145 0.30868c1.673 0.83744 3.7301-1.3645 6.465-6.1578 2.783-0.91295 6.2554-1.7725 9.4169-2.2382 2.83 1.617 6.0762 2.3869 7.3235 2.0545 0.23734-0.06275 0.487-0.24905 0.6145-0.42065 0.1-0.15789 0.23979-0.78965 0.23979-0.78965s-0.23466 0.31934-0.42788 0.41348c-0.7894 0.37264-3.2816-0.24905-5.839-1.5002 2.2112-0.23535 4.0534-0.24442 5.0379 0.07025 1.2504 0.39912 1.2514 0.80824 1.2347 0.89158 0.01687-0.06862 0.07287-0.34272 0.066-0.45941-0.02837-0.30008-0.12088-0.56804-0.34744-0.78965-0.46284-0.45599-1.6056-0.68578-3.1629-0.70636-1.1738-0.01275-2.5812 0.09-4.109 0.30868-0.70015-0.40205-1.439-0.84402-2.0244-1.3912-1.4846-1.3866-2.729-3.3118-3.5018-5.47 0.05275-0.20691 0.10325-0.40909 0.1493-0.61306 0.21479-0.96589 0.36896-4.1592 0.36896-4.1592s-0.61168 2.399-0.70778 2.7609c-0.06175 0.22946-0.13858 0.47438-0.22684 0.72934-0.46875-1.6474-0.70636-3.244-0.70636-4.455 0-0.34224 0.02938-1.0082 0.12631-1.5348 0.04725-0.37556 0.18325-0.57059 0.3245-0.66474 0.27946 0.06775 0.59229 0.49635 0.91886 1.2132 0.28044 0.61975 0.26271 1.3375 0.26271 1.7818 0 0 0.30076-1.1 0.23115-1.7501-0.04237-0.39029-0.4137-1.3944-1.2031-1.3826h-0.06463l-0.35174-0.0038zm0.26848 9.9739c0.81689 1.6425 1.9435 3.2024 3.4214 4.4536 0.32946 0.27849 0.68 0.54344 1.0409 0.7925-2.6839 0.49914-5.5026 1.2013-8.1219 2.2986 0.47364-0.84136 0.98576-1.758 1.5104-2.7465 1.0159-1.921 1.6315-3.4028 2.1492-4.7981z"
                      />
                      <path
                        style={{ opacity: 0.2, fill: "#ffffff" }}
                        d="M 14.5,7 C 13.115,7 12,8.115 12,9.5 v 1 C 12,9.115 13.115,8 14.5,8 H 37 c 0,-1 0,0 0,-1 z"
                      />
                    </svg>
                  </div>
                  {/* <p className="mb-2">File: {competition.creationFile.split("/").pop()}</p> */}
                  <a
                    href={`${import.meta.env.VITE_API_URL}/files/${competition.creationFile}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn secondary"
                    style={{ display: "inline-block" }}
                  >
                    Download / Lihat Full
                  </a>
                </div>
              ) : (
                <img
                  src={`${import.meta.env.VITE_API_URL}/files/${competition.creationFile}`}
                  alt="Karya"
                  style={{ maxWidth: "100%", borderRadius: "8px", marginBottom: "15px" }}
                />
              )}
            </div>

            <div className="modal-actions">
              <button
                className="btn secondary"
                onClick={() => {
                  setShowCreationModal(false);
                  setShowUploadModal(true);
                }}
              >
                Edit Karya
              </button>
              <button className="btn" onClick={() => setShowCreationModal(false)}>
                Tutup
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
                {(!competition.registrationStatus || competition.registrationStatus === "REJECTED") && (
                  <button
                    className="btn width"
                    onClick={() => navigate(`/competition/${competition.id}/register`)}
                  >
                    Daftar Sekarang
                  </button>
                )}

                <button className="btn width">Pengumuman</button>
                {/* <button className="btn width">Juknis</button> */}
                {/* <button className="btn width">Upload</button> */}
                {user?.role === "ADMIN" && (
                  <button className="btn width" onClick={() => setShowJuknisModal(true)}>
                    Upload Juknis
                  </button>
                )}
                {competition.registrationStatus === "verified" && (
                  competition.creationFile ? (
                    <button
                      className="btn width"
                      onClick={() => setShowCreationModal(true)}
                    >
                      Lihat File yang Diunggah
                    </button>
                  ) : (
                    <button
                      className="btn width"
                      onClick={() => setShowUploadModal(true)}
                    >
                      Upload Karya
                    </button>
                  )
                )}
              </div>
              <div className="mt-1">
                {competition.registrationStatus === "verified" && (
                  <span className="badge approved">Terverifikasi</span>
                )}
                {competition.registrationStatus === "rejected" && (
                  <span className="badge rejected">Ditolak</span>
                )}
                {competition.registrationStatus === "pending" && (
                  <span className="badge pending">Menunggu Verifikasi</span>
                )}
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
              <p style={{ whiteSpace: "pre-line" }}>{competition.description}</p>
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
