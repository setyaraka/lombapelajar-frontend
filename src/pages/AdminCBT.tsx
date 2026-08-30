import { useState, useEffect, useCallback } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { AdminCBTAPI } from "../services/admin-cbt.service";
import { getCompetitions } from "../services/competition.service";
import { renderFormattedText } from "../helper/format";
import type {
  CBTDashboardData,
  CBTStage,
  CBTExam,
  CBTParticipant,
  CBTQuestion,
  CBTQuestionOption,
  CBTMonitoringData,
  CBTResultData,
  CBTEssayAnswer,
  PaginationMeta,
} from "../services/admin-cbt.service";
import toast from "react-hot-toast";
import {
  Play,
  Trash2,
  Edit2,
  Plus,
  Users,
  Award,
  Calendar,
  BookOpen,
  FileDown,
  Search,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

type SubTab =
  | "dashboard"
  | "stages"
  | "exams"
  | "participants"
  | "questions"
  | "monitoring"
  | "results";

function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return fallback;
}

// Dropdown pemilih ujian yang menampilkan "Judul Ujian - Nama Lomba", dipakai
// di Monitoring Ujian & Hasil Ujian supaya ujian dengan judul yang sama dari
// lomba berbeda tetap bisa dibedakan (lihat gaya dropdown ujian di Bank Soal,
// QuestionsView, yang jadi acuan tampilan ini — versi ini tidak butuh
// pencarian server-side/paginasi karena daftar ujiannya sudah dimuat penuh
// oleh view pemanggilnya).
function ExamPickerDropdown({
  exams,
  selectedExamId,
  onSelect,
  allLabel = "Semua Ujian",
}: {
  exams: CBTExam[];
  selectedExamId: string;
  onSelect: (examId: string) => void;
  allLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const examLabel = (exam: CBTExam) =>
    `${exam.title}${exam.competition ? ` - ${exam.competition.title}` : ""}`;

  const selected = exams.find((exam) => exam.id === selectedExamId);
  const triggerLabel = selected ? examLabel(selected) : allLabel;

  const filtered = exams.filter((exam) =>
    examLabel(exam).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ position: "relative", zIndex: open ? 40 : 1 }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          padding: "0.5rem 1rem",
          borderRadius: "8px",
          border: "1px solid #cbd5e1",
          fontSize: "0.95rem",
          fontWeight: 600,
          backgroundColor: "#fff",
          cursor: "pointer",
          display: "flex",
          gap: "0.5rem",
          alignItems: "center",
          minWidth: "250px",
          justifyContent: "space-between",
        }}
      >
        <span>{triggerLabel}</span>
        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>▼</span>
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            width: "100%",
            minWidth: "300px",
            backgroundColor: "#fff",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            marginTop: "4px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            padding: "0.75rem",
          }}
        >
          <input
            type="text"
            placeholder="Cari ujian..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              marginBottom: "0.5rem",
              fontSize: "0.875rem",
            }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              maxHeight: "220px",
              overflowY: "auto",
            }}
          >
            <div
              onClick={() => {
                onSelect("");
                setOpen(false);
              }}
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 600,
                backgroundColor: selectedExamId === "" ? "#f1f5f9" : "transparent",
              }}
            >
              {allLabel}
            </div>
            {filtered.map((exam) => (
              <div
                key={exam.id}
                onClick={() => {
                  onSelect(exam.id);
                  setOpen(false);
                }}
                style={{
                  padding: "0.5rem 0.75rem",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  backgroundColor: selectedExamId === exam.id ? "#f1f5f9" : "transparent",
                }}
              >
                {examLabel(exam)}
              </div>
            ))}
            {filtered.length === 0 && (
              <div
                style={{
                  padding: "0.5rem 0.75rem",
                  fontSize: "0.875rem",
                  color: "#64748b",
                  textAlign: "center",
                }}
              >
                Tidak ditemukan ujian
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminCBT() {
  const [activeTab, setActiveTab] = useState<SubTab>("dashboard");

  return (
    <div
      className="admin-cbt-page"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f8fafc",
      }}
    >
      <Header />
      <main
        style={{
          flex: 1,
          padding: "2rem 1rem",
          maxWidth: "1280px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* Navigation Tabs */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            marginBottom: "2rem",
            borderBottom: "1px solid #e2e8f0",
            paddingBottom: "1rem",
          }}
        >
          {[
            { id: "dashboard", label: "Dashboard", icon: <Award size={18} /> },
            { id: "stages", label: "Tahapan Ujian", icon: <Award size={18} /> },
            { id: "exams", label: "Jadwal & Ujian", icon: <Calendar size={18} /> },
            { id: "participants", label: "Manajemen Peserta", icon: <Users size={18} /> },
            { id: "questions", label: "Bank Soal", icon: <BookOpen size={18} /> },
            { id: "monitoring", label: "Monitoring Ujian", icon: <Play size={18} /> },
            { id: "results", label: "Hasil & Export", icon: <FileDown size={18} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SubTab)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.25rem",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.95rem",
                backgroundColor: activeTab === tab.id ? "#2EC4B6" : "transparent",
                color: activeTab === tab.id ? "#ffffff" : "#64748b",
                transition: "all 0.2s ease",
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "2rem",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
          }}
        >
          {activeTab === "dashboard" && <DashboardView />}
          {activeTab === "stages" && <StagesView />}
          {activeTab === "exams" && <ExamsView />}
          {activeTab === "participants" && <ParticipantsView />}
          {activeTab === "questions" && <QuestionsView />}
          {activeTab === "monitoring" && <MonitoringView />}
          {activeTab === "results" && <ResultsView />}
        </div>
      </main>
      <Footer />
    </div>
  );
}

/* ====================================================
1. DASHBOARD VIEW
==================================================== */
function DashboardView() {
  const [data, setData] = useState<CBTDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // States for search, date filter, and pagination
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await AdminCBTAPI.getDashboard({
        page,
        search: debouncedSearch,
        date: dateFilter,
      });
      setData(res);
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal memuat dashboard"));
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, dateFilter]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading && !data) return <div>Memuat data statistik...</div>;
  if (!data) return <div>Data tidak tersedia.</div>;

  const cardStyle = {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "1.5rem",
    boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
    borderLeft: "5px solid #2EC4B6",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "space-between",
  };

  const listMeta = data.participantsPerExam.meta;
  const listData = data.participantsPerExam.data;

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem", color: "#0f172a" }}>
        Dashboard CBT
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1.5rem",
          marginBottom: "3rem",
        }}
      >
        <div style={{ ...cardStyle, borderLeftColor: "#3b82f6" }}>
          <span style={{ fontSize: "0.875rem", color: "#64748b", fontWeight: 500 }}>
            Total Peserta
          </span>
          <span style={{ fontSize: "2rem", fontWeight: 800, color: "#1e3a8a", margin: "0.5rem 0" }}>
            {data.stats.totalParticipants}
          </span>
        </div>
        <div style={{ ...cardStyle, borderLeftColor: "#10b981" }}>
          <span style={{ fontSize: "0.875rem", color: "#64748b", fontWeight: 500 }}>
            Ujian Aktif Saat Ini
          </span>
          <span style={{ fontSize: "2rem", fontWeight: 800, color: "#065f46", margin: "0.5rem 0" }}>
            {data.stats.activeExams}
          </span>
        </div>
        <div style={{ ...cardStyle, borderLeftColor: "#f59e0b" }}>
          <span style={{ fontSize: "0.875rem", color: "#64748b", fontWeight: 500 }}>
            Ujian Yang Akan Datang
          </span>
          <span style={{ fontSize: "2rem", fontWeight: 800, color: "#92400e", margin: "0.5rem 0" }}>
            {data.stats.upcomingExams}
          </span>
        </div>
        <div style={{ ...cardStyle, borderLeftColor: "#8b5cf6" }}>
          <span style={{ fontSize: "0.875rem", color: "#64748b", fontWeight: 500 }}>
            Sedang Mengerjakan
          </span>
          <span style={{ fontSize: "2rem", fontWeight: 800, color: "#5b21b6", margin: "0.5rem 0" }}>
            {data.stats.inProgress}
          </span>
        </div>
        <div style={{ ...cardStyle, borderLeftColor: "#ec4899" }}>
          <span style={{ fontSize: "0.875rem", color: "#64748b", fontWeight: 500 }}>
            Selesai / Auto Submitted
          </span>
          <span style={{ fontSize: "2rem", fontWeight: 800, color: "#9d174d", margin: "0.5rem 0" }}>
            {data.stats.finished}
          </span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
          Statistik Jumlah Peserta Per Ujian
        </h3>

        {/* Filters */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Cari ujian / lomba..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "0.5rem 0.75rem",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "0.875rem",
              minWidth: "220px",
            }}
          />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setPage(1);
            }}
            style={{
              padding: "0.5rem 0.75rem",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "0.875rem",
            }}
          />
          {(search || dateFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setDateFilter("");
                setPage(1);
              }}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                background: "#f1f5f9",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "2rem 0", color: "#64748b" }}>Memperbarui daftar...</div>
      ) : (
        <>
          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              overflow: "hidden",
              marginBottom: "1rem",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ padding: "1rem" }}>Nama Lomba (Olimpiade)</th>
                  <th style={{ padding: "1rem" }}>Nama Ujian</th>
                  <th style={{ padding: "1rem" }}>Jadwal Ujian</th>
                  <th style={{ padding: "1rem", textAlign: "right" }}>Jumlah Peserta Di-assign</th>
                </tr>
              </thead>
              <tbody>
                {listData.map((item) => (
                  <tr key={item.examId} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "1rem", fontWeight: 600, color: "#475569" }}>
                      {item.competitionTitle}
                    </td>
                    <td style={{ padding: "1rem", fontWeight: 500 }}>
                      {renderFormattedText(item.title)}
                    </td>
                    <td style={{ padding: "1rem", color: "#64748b", fontSize: "0.875rem" }}>
                      {new Date(item.startAt).toLocaleString("id-ID")} s/d{" "}
                      {new Date(item.endAt).toLocaleString("id-ID")}
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        textAlign: "right",
                        fontWeight: 700,
                        color: "#2EC4B6",
                      }}
                    >
                      {item.participants}
                    </td>
                  </tr>
                ))}
                {listData.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}
                    >
                      Tidak ada data ujian aktif atau yang memenuhi kriteria pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {listMeta && listMeta.totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "0.5rem",
                marginTop: "1rem",
              }}
            >
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                Sebelumnya
              </button>
              <span style={{ alignSelf: "center", fontSize: "0.9rem", color: "#475569" }}>
                Halaman {page} dari {listMeta.totalPages}
              </span>
              <button
                disabled={page >= listMeta.totalPages}
                onClick={() => setPage(page + 1)}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                Berikutnya
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ====================================================
2. MANAJEMEN TAHAPAN VIEW
==================================================== */
function StagesView() {
  const [stages, setStages] = useState<CBTStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    position: 0,
    isActive: true,
  });

  const fetchStages = async () => {
    try {
      setLoading(true);
      const data = await AdminCBTAPI.listStages();
      setStages(data);
    } catch {
      toast.error("Gagal memuat tahapan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStages();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Nama tahapan harus diisi");

    try {
      if (formData.id) {
        await AdminCBTAPI.updateStage(formData.id, formData);
        toast.success("Tahapan berhasil diperbarui");
      } else {
        await AdminCBTAPI.createStage(formData);
        toast.success("Tahapan berhasil dibuat");
      }
      setShowModal(false);
      fetchStages();
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal menyimpan tahapan"));
    }
  };

  const handleEdit = (stage: CBTStage) => {
    setFormData({
      id: stage.id,
      name: stage.name,
      description: stage.description || "",
      position: stage.position,
      isActive: stage.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus tahapan ini?")) return;
    try {
      await AdminCBTAPI.deleteStage(id);
      toast.success("Tahapan berhasil dihapus");
      fetchStages();
    } catch {
      toast.error("Gagal menghapus tahapan");
    }
  };

  if (loading) return <div>Memuat data tahapan...</div>;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f172a" }}>
          Manajemen Tahapan Ujian
        </h2>
        <button
          onClick={() => {
            setFormData({ id: "", name: "", description: "", position: 0, isActive: true });
            setShowModal(true);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            backgroundColor: "#2EC4B6",
            color: "#fff",
            border: "none",
            padding: "0.6rem 1.2rem",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          <Plus size={16} /> Tambah Tahapan
        </button>
      </div>

      <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: "1rem" }}>Posisi</th>
              <th style={{ padding: "1rem" }}>Nama Tahapan</th>
              <th style={{ padding: "1rem" }}>Deskripsi</th>
              <th style={{ padding: "1rem" }}>Status</th>
              <th style={{ padding: "1rem", textAlign: "right" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {stages.map((stage) => (
              <tr key={stage.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "1rem" }}>{stage.position}</td>
                <td style={{ padding: "1rem", fontWeight: 600 }}>{stage.name}</td>
                <td style={{ padding: "1rem", color: "#64748b" }}>{stage.description || "-"}</td>
                <td style={{ padding: "1rem" }}>
                  <span
                    style={{
                      padding: "0.25rem 0.6rem",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      backgroundColor: stage.isActive ? "#dcfce7" : "#fee2e2",
                      color: stage.isActive ? "#15803d" : "#b91c1c",
                    }}
                  >
                    {stage.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td style={{ padding: "1rem", textAlign: "right" }}>
                  <button
                    onClick={() => handleEdit(stage)}
                    style={{
                      marginRight: "0.5rem",
                      border: "none",
                      backgroundColor: "transparent",
                      color: "#3b82f6",
                      cursor: "pointer",
                    }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(stage.id)}
                    style={{
                      border: "none",
                      backgroundColor: "transparent",
                      color: "#ef4444",
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "2rem",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "480px",
            }}
          >
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem" }}>
              {formData.id ? "Edit" : "Tambah"} Tahapan
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                  Nama Tahapan
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                  }}
                  placeholder="Contoh: Penyisihan, Semifinal, Final"
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    minHeight: "80px",
                  }}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                  Posisi Urutan
                </label>
                <input
                  type="number"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: parseInt(e.target.value) || 0 })
                  }
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                  }}
                />
              </div>
              <div
                style={{
                  marginBottom: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <label htmlFor="isActive" style={{ fontWeight: 600 }}>
                  Aktif
                </label>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    backgroundColor: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "0.5rem 1rem",
                    border: "none",
                    borderRadius: "8px",
                    backgroundColor: "#2EC4B6",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ====================================================
3. MANAJEMEN UJIAN & JADWAL VIEW
==================================================== */
function ExamsView() {
  const [exams, setExams] = useState<CBTExam[]>([]);
  const [stages, setStages] = useState<CBTStage[]>([]);
  const [competitions, setCompetitions] = useState<Array<{ id: string; title: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  // States for searchable paginated competition selector
  const [compSearch, setCompSearch] = useState("");
  const [compPage, setCompPage] = useState(1);
  const [compMeta, setCompMeta] = useState<PaginationMeta | null>(null);
  const [showCompDropdown, setShowCompDropdown] = useState(false);
  const [selectedCompTitle, setSelectedCompTitle] = useState("");

  const [debouncedCompSearch, setDebouncedCompSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [formData, setFormData] = useState({
    id: "",
    title: "",
    description: "",
    stageId: "",
    competitionId: "",
    startAt: "",
    durationMinutes: 120,
    status: "DRAFT" as "DRAFT" | "ACTIVE" | "INACTIVE" | "ARCHIVED",
    isActive: false,
    maxAttempts: 1,
    randomizeQuestions: true,
    randomizeOptions: true,
  });

  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      const res = await AdminCBTAPI.listExams({ page, perPage: 5, search: debouncedSearch });
      setExams(res.data);
      setMeta(res.meta);
    } catch {
      toast.error("Gagal memuat daftar ujian");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  const fetchStages = async () => {
    try {
      const data = await AdminCBTAPI.listStages();
      setStages(data);
    } catch {
      /* ignore */
    }
  };

  const fetchCompetitions = async (pageNum: number, searchStr: string) => {
    try {
      const res = await getCompetitions({ page: pageNum, perPage: 5, search: searchStr });
      setCompetitions(res.data || []);
      setCompMeta({
        page: res.page,
        perPage: res.perPage,
        total: res.total,
        totalPages: res.totalPages,
      });
    } catch {
      /* ignore */
    }
  };

  // Debounce for Exam Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  // Debounce for Competition Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCompSearch(compSearch);
      setCompPage(1);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [compSearch]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  useEffect(() => {
    fetchStages();
  }, []);

  useEffect(() => {
    fetchCompetitions(compPage, debouncedCompSearch);
  }, [compPage, debouncedCompSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error("Judul ujian harus diisi");
    if (!formData.startAt) return toast.error("Tanggal & jam mulai harus ditentukan");

    try {
      const payload = {
        ...formData,
        stageId: formData.stageId || null,
        competitionId: formData.competitionId || null,
        startAt: new Date(formData.startAt).toISOString(),
      };

      if (formData.id) {
        await AdminCBTAPI.updateExam(formData.id, payload);
        toast.success("Ujian berhasil diperbarui");
      } else {
        await AdminCBTAPI.createExam(payload);
        toast.success("Ujian berhasil dibuat");
      }
      setShowModal(false);
      fetchExams();
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal menyimpan ujian"));
    }
  };

  const handleEdit = (exam: CBTExam) => {
    // Format to local ISO for datetime-local input
    const localStartAt = exam.startAt ? new Date(exam.startAt).toISOString().slice(0, 16) : "";
    setFormData({
      id: exam.id,
      title: exam.title,
      description: exam.description || "",
      stageId: exam.stageId || "",
      competitionId: exam.competitionId || "",
      startAt: localStartAt,
      durationMinutes: exam.durationMinutes,
      status: exam.status,
      isActive: exam.isActive,
      maxAttempts: exam.maxAttempts,
      randomizeQuestions: exam.randomizeQuestions,
      randomizeOptions: exam.randomizeOptions,
    });
    setSelectedCompTitle(exam.competition?.title || "");
    setCompSearch("");
    setCompPage(1);
    setShowCompDropdown(false);
    setShowModal(true);
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    try {
      await AdminCBTAPI.toggleExam(id, !currentActive);
      toast.success(`Ujian berhasil ${!currentActive ? "diaktifkan" : "dinonaktifkan"}`);
      fetchExams();
    } catch {
      toast.error("Gagal mengubah status aktif");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus ujian ini beserta seluruh relasinya?"))
      return;
    try {
      await AdminCBTAPI.deleteExam(id);
      toast.success("Ujian berhasil dihapus");
      fetchExams();
    } catch {
      toast.error("Gagal menghapus ujian");
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f172a" }}>
            Jadwal & Manajemen Ujian
          </h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <Search
              style={{
                position: "absolute",
                left: "12px",
                color: "#94a3b8",
                pointerEvents: "none",
              }}
              size={18}
            />
            <input
              type="text"
              placeholder="Cari ujian..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: "0.6rem 1rem 0.6rem 2.6rem",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "0.9rem",
                width: "260px",
                outline: "none",
                transition: "all 0.2s ease",
              }}
            />
          </div>
          <button
            onClick={() => {
              setFormData({
                id: "",
                title: "",
                description: "",
                stageId: "",
                competitionId: "",
                startAt: "",
                durationMinutes: 120,
                status: "DRAFT",
                isActive: false,
                maxAttempts: 1,
                randomizeQuestions: true,
                randomizeOptions: true,
              });
              setSelectedCompTitle("");
              setCompSearch("");
              setCompPage(1);
              setShowCompDropdown(false);
              setShowModal(true);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "#2EC4B6",
              color: "#fff",
              border: "none",
              padding: "0.6rem 1.4rem",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.9rem",
              transition: "all 0.2s ease",
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#27a79b";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#2EC4B6";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <Plus size={16} /> Buat Ujian
          </button>
        </div>
      </div>

      {loading ? (
        <div>Memuat data ujian...</div>
      ) : (
        <>
          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              overflow: "hidden",
              marginBottom: "1rem",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ padding: "1rem" }}>Nama Ujian</th>
                  <th style={{ padding: "1rem" }}>Tahap</th>
                  <th style={{ padding: "1rem" }}>Mulai</th>
                  <th style={{ padding: "1rem" }}>Durasi</th>
                  <th style={{ padding: "1rem" }}>Soal</th>
                  <th style={{ padding: "1rem" }}>Status</th>
                  <th style={{ padding: "1rem", textAlign: "right" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => {
                  const start = new Date(exam.startAt);
                  const formattedDate = start.toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });
                  const formattedTime = start.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr
                      key={exam.id}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        transition: "background-color 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <td style={{ padding: "1rem" }}>
                        <div style={{ fontWeight: 700, color: "#0f172a" }}>
                          {renderFormattedText(exam.title)}
                        </div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "#64748b",
                            marginTop: "0.15rem",
                            maxWidth: "400px",
                            lineHeight: "1.3",
                          }}
                        >
                          {exam.description || "Tidak ada deskripsi"}
                        </div>
                        {exam.competition && (
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "#2EC4B6",
                              marginTop: "0.35rem",
                              fontWeight: 600,
                            }}
                          >
                            Kompetisi: {exam.competition.title}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <span
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: 500,
                            color: "#475569",
                            backgroundColor: "#f1f5f9",
                            padding: "0.25rem 0.6rem",
                            borderRadius: "6px",
                          }}
                        >
                          {exam.stage?.name || "-"}
                        </span>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <div style={{ fontWeight: 600, color: "#334155", fontSize: "0.9rem" }}>
                          {formattedDate}
                        </div>
                        <div
                          style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.05rem" }}
                        >
                          {formattedTime} WIB
                        </div>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <span style={{ fontWeight: 600, color: "#334155" }}>
                          {exam.durationMinutes}
                        </span>{" "}
                        <span style={{ color: "#64748b", fontSize: "0.8rem" }}>menit</span>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "6px",
                            backgroundColor: "#ecfeff",
                            fontWeight: 700,
                            color: "#0891b2",
                            fontSize: "0.85rem",
                          }}
                        >
                          {exam._count?.questions || 0} soal
                        </span>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <button
                          onClick={() => handleToggle(exam.id, exam.isActive)}
                          style={{
                            padding: "0.3rem 0.75rem",
                            borderRadius: "9999px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            backgroundColor: exam.isActive ? "#dcfce7" : "#fee2e2",
                            color: exam.isActive ? "#15803d" : "#b91c1c",
                            border: "1px solid",
                            borderColor: exam.isActive ? "#bbf7d0" : "#fecaca",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-1px)";
                            e.currentTarget.style.boxShadow = "0 2px 4px 0 rgba(0, 0, 0, 0.07)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
                          }}
                        >
                          {exam.isActive ? "Aktif" : "Nonaktif"}
                        </button>
                      </td>
                      <td style={{ padding: "1rem", textAlign: "right" }}>
                        <button
                          onClick={() => handleEdit(exam)}
                          style={{
                            marginRight: "0.5rem",
                            border: "none",
                            backgroundColor: "transparent",
                            color: "#3b82f6",
                            cursor: "pointer",
                          }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(exam.id)}
                          style={{
                            border: "none",
                            backgroundColor: "transparent",
                            color: "#ef4444",
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {meta && meta.totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                Sebelumnya
              </button>
              <span style={{ alignSelf: "center" }}>
                Halaman {page} dari {meta.totalPages}
              </span>
              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage(page + 1)}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                Berikutnya
              </button>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 100,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "2rem",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "560px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem" }}>
              {formData.id ? "Edit" : "Buat"} Ujian
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                  Nama Ujian
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                  }}
                  required
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    minHeight: "60px",
                  }}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                  Tahap Ujian
                </label>
                <select
                  value={formData.stageId}
                  onChange={(e) => setFormData({ ...formData, stageId: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                  }}
                >
                  <option value="">-- Pilih Tahapan --</option>
                  {stages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: "1rem", position: "relative" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                  Kompetisi (Lomba)
                </label>
                <div
                  onClick={() => setShowCompDropdown(!showCompDropdown)}
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#fff",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ color: selectedCompTitle ? "#0f172a" : "#94a3b8" }}>
                    {selectedCompTitle || "-- Pilih Kompetisi (Opsional) --"}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>▼</span>
                </div>

                {showCompDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      width: "100%",
                      backgroundColor: "#fff",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      marginTop: "4px",
                      zIndex: 1100,
                      boxShadow:
                        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                      padding: "0.75rem",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Cari kompetisi..."
                      value={compSearch}
                      onChange={(e) => {
                        setCompSearch(e.target.value);
                        setCompPage(1);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: "100%",
                        padding: "0.5rem 0.75rem",
                        borderRadius: "6px",
                        border: "1px solid #cbd5e1",
                        marginBottom: "0.5rem",
                        fontSize: "0.875rem",
                      }}
                    />

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                        maxHeight: "200px",
                        overflowY: "auto",
                      }}
                    >
                      <div
                        onClick={() => {
                          setFormData({ ...formData, competitionId: "" });
                          setSelectedCompTitle("");
                          setShowCompDropdown(false);
                        }}
                        style={{
                          padding: "0.5rem 0.75rem",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                          color: "#ef4444",
                          fontWeight: 500,
                          backgroundColor:
                            formData.competitionId === "" ? "#fef2f2" : "transparent",
                        }}
                      >
                        -- Kosongkan / Tanpa Kompetisi --
                      </div>
                      {competitions.map((comp) => (
                        <div
                          key={comp.id}
                          onClick={() => {
                            setFormData({ ...formData, competitionId: comp.id });
                            setSelectedCompTitle(comp.title);
                            setShowCompDropdown(false);
                          }}
                          style={{
                            padding: "0.5rem 0.75rem",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.875rem",
                            backgroundColor:
                              formData.competitionId === comp.id ? "#f1f5f9" : "transparent",
                          }}
                        >
                          {comp.title}
                        </div>
                      ))}
                      {competitions.length === 0 && (
                        <div
                          style={{
                            padding: "0.5rem 0.75rem",
                            fontSize: "0.875rem",
                            color: "#64748b",
                            textAlign: "center",
                          }}
                        >
                          Tidak ditemukan kompetisi
                        </div>
                      )}
                    </div>

                    {compMeta && compMeta.totalPages > 1 && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: "0.75rem",
                          borderTop: "1px solid #f1f5f9",
                          paddingTop: "0.5rem",
                          fontSize: "0.75rem",
                        }}
                      >
                        <button
                          type="button"
                          disabled={compPage <= 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCompPage(compPage - 1);
                          }}
                          style={{
                            padding: "0.25rem 0.5rem",
                            borderRadius: "4px",
                            border: "1px solid #cbd5e1",
                            background: "#fff",
                            cursor: "pointer",
                          }}
                        >
                          Prev
                        </button>
                        <span>
                          Hal {compPage} dari {compMeta.totalPages}
                        </span>
                        <button
                          type="button"
                          disabled={compPage >= compMeta.totalPages}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCompPage(compPage + 1);
                          }}
                          style={{
                            padding: "0.25rem 0.5rem",
                            borderRadius: "4px",
                            border: "1px solid #cbd5e1",
                            background: "#fff",
                            cursor: "pointer",
                          }}
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                    Tanggal & Jam Mulai
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startAt}
                    onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.6rem",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                    }}
                    required
                  />
                </div>
                <div style={{ width: "150px" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                    Durasi (menit)
                  </label>
                  <input
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) =>
                      setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 0 })
                    }
                    style={{
                      width: "100%",
                      padding: "0.6rem",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                    }}
                    required
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.randomizeQuestions}
                    onChange={(e) =>
                      setFormData({ ...formData, randomizeQuestions: e.target.checked })
                    }
                  />
                  Acak Soal
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.randomizeOptions}
                    onChange={(e) =>
                      setFormData({ ...formData, randomizeOptions: e.target.checked })
                    }
                  />
                  Acak Opsi Jawaban
                </label>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    backgroundColor: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "0.5rem 1rem",
                    border: "none",
                    borderRadius: "8px",
                    backgroundColor: "#2EC4B6",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ====================================================
4. MANAJEMEN PESERTA VIEW
==================================================== */
function ParticipantsView() {
  const [participants, setParticipants] = useState<CBTParticipant[]>([]);
  const [stages, setStages] = useState<CBTStage[]>([]);
  const [exams, setExams] = useState<CBTExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    participantNumber: "",
    stageId: "",
    isActive: true,
  });

  const [assignData, setAssignData] = useState({
    participantIds: [] as string[],
    examIds: [] as string[],
    stageId: "",
    examId: "",
    mode: "individual" as "individual" | "stage",
    assignType: "stage_competition" as "exam" | "stage_competition",
    competitionId: "",
    sourceStageId: "",
  });

  const [registeredUsers, setRegisteredUsers] = useState<
    Array<{ id: string; user: { name: string; email: string }; competition: { title: string } }>
  >([]);
  const [selectedRegUserId, setSelectedRegUserId] = useState("");
  const [competitions, setCompetitions] = useState<Array<{ id: string; title: string }>>([]);

  const fetchParticipants = useCallback(async () => {
    try {
      setLoading(true);
      const res = await AdminCBTAPI.listParticipants({ page, search });
      setParticipants(res.data);
      setMeta(res.meta);
    } catch {
      toast.error("Gagal memuat peserta");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  const loadFilterData = async () => {
    try {
      const [stageList, examList, regUsers, compList] = await Promise.all([
        AdminCBTAPI.listStages(),
        AdminCBTAPI.listExams({ perPage: 100 }),
        AdminCBTAPI.listRegisteredUsers(),
        getCompetitions({ page: 1, perPage: 100 }),
      ]);
      setStages(stageList);
      setExams(examList.data);
      setRegisteredUsers(regUsers);
      setCompetitions(compList.data || compList);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  useEffect(() => {
    loadFilterData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Nama harus diisi");
    if (!formData.email.trim()) return toast.error("Email harus diisi");
    if (!formData.participantNumber.trim()) return toast.error("Nomor peserta harus diisi");

    try {
      const payload = {
        ...formData,
        stageId: formData.stageId || null,
      };

      if (formData.id) {
        await AdminCBTAPI.updateParticipant(formData.id, payload);
        toast.success("Peserta berhasil diperbarui");
      } else {
        await AdminCBTAPI.createParticipant(payload);
        toast.success("Peserta berhasil ditambahkan (Password = nomor peserta)");
      }
      setShowModal(false);
      setSelectedRegUserId("");
      fetchParticipants();
      loadFilterData(); // Refresh list of available registered users
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal menyimpan peserta"));
    }
  };

  const handleEdit = (p: CBTParticipant) => {
    setFormData({
      id: p.id,
      name: p.name,
      email: p.email,
      participantNumber: p.participantNumber,
      stageId: p.stageId || "",
      isActive: p.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus peserta ini?")) return;
    try {
      await AdminCBTAPI.deleteParticipant(id);
      toast.success("Peserta berhasil dihapus");
      fetchParticipants();
      loadFilterData();
    } catch {
      toast.error("Gagal menghapus peserta");
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload: {
        participantIds?: string[];
        stageId?: string;
        examIds?: string[];
        examId?: string;
        competitionId?: string;
        sourceStageId?: string;
      } = {};

      if (assignData.assignType === "exam") {
        if (!assignData.examId) return toast.error("Ujian harus dipilih");
        payload.examId = assignData.examId;
      } else {
        if (!assignData.competitionId) return toast.error("Kompetisi/Lomba harus dipilih");
        if (!assignData.stageId) return toast.error("Babak target harus dipilih");
        payload.competitionId = assignData.competitionId;
        payload.stageId = assignData.stageId;
      }

      if (assignData.mode === "individual") {
        if (assignData.participantIds.length === 0)
          return toast.error("Pilih minimal satu peserta");
        payload.participantIds = assignData.participantIds;
      } else {
        if (!assignData.sourceStageId) return toast.error("Tahap sumber harus dipilih");
        payload.sourceStageId = assignData.sourceStageId;
      }

      const res = await AdminCBTAPI.assignParticipants(payload);
      toast.success(`Berhasil meng-assign ${res.assigned} peserta.`);
      setShowAssignModal(false);

      // Reset assign state
      setAssignData({
        participantIds: [],
        examIds: [],
        stageId: "",
        examId: "",
        mode: "individual",
        assignType: "stage_competition",
        competitionId: "",
        sourceStageId: "",
      });

      fetchParticipants();
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal melakukan assignment"));
    }
  };

  const toggleParticipantSelection = (id: string) => {
    setAssignData((prev) => {
      const isSelected = prev.participantIds.includes(id);
      return {
        ...prev,
        participantIds: isSelected
          ? prev.participantIds.filter((pId) => pId !== id)
          : [...prev.participantIds, id],
      };
    });
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f172a" }}>Manajemen Peserta</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <Search
              style={{
                position: "absolute",
                left: "12px",
                color: "#94a3b8",
                pointerEvents: "none",
              }}
              size={18}
            />
            <input
              type="text"
              placeholder="Cari peserta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: "0.6rem 1rem 0.6rem 2.6rem",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "0.9rem",
                width: "260px",
                outline: "none",
                transition: "all 0.2s ease",
              }}
            />
          </div>
          <button
            onClick={() => {
              // Peserta yang sudah dicentang (via checkbox "Pilih" di tabel)
              // dipertahankan di sini - dulu di-reset ke [] setiap tombol ini
              // diklik, jadi centangan dari tabel selalu hilang sebelum modal
              // sempat dipakai (FACT, kode sebelumnya).
              if (assignData.participantIds.length === 0) {
                toast.error("Pilih minimal satu peserta terlebih dahulu");
                return;
              }
              setAssignData((prev) => ({
                ...prev,
                examIds: [],
                stageId: "",
                examId: "",
                mode: "individual",
                assignType: "stage_competition",
                competitionId: "",
                sourceStageId: "",
              }));
              setShowAssignModal(true);
            }}
            style={{
              backgroundColor: assignData.participantIds.length === 0 ? "#93c5fd" : "#3b82f6",
              color: "#fff",
              border: "none",
              padding: "0.6rem 1.4rem",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.9rem",
              transition: "all 0.2s ease",
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            }}
            onMouseEnter={(e) => {
              if (assignData.participantIds.length === 0) return;
              e.currentTarget.style.backgroundColor = "#2563eb";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              if (assignData.participantIds.length === 0) return;
              e.currentTarget.style.backgroundColor = "#3b82f6";
              e.currentTarget.style.transform = "translateY(0)";
            }}
            title={
              assignData.participantIds.length === 0
                ? "Pilih minimal satu peserta di tabel terlebih dahulu"
                : undefined
            }
          >
            Assign Ujian ({assignData.participantIds.length})
          </button>
          <button
            onClick={() => {
              setFormData({
                id: "",
                name: "",
                email: "",
                participantNumber: "",
                stageId: "",
                isActive: true,
              });
              setShowModal(true);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "#2EC4B6",
              color: "#fff",
              border: "none",
              padding: "0.6rem 1.4rem",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.9rem",
              transition: "all 0.2s ease",
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#27a79b";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#2EC4B6";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <Plus size={16} /> Tambah Peserta
          </button>
        </div>
      </div>

      {loading ? (
        <div>Memuat data peserta...</div>
      ) : (
        <>
          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              overflow: "hidden",
              marginBottom: "1rem",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ padding: "1rem", width: "40px" }}>Pilih</th>
                  <th style={{ padding: "1rem" }}>No. Peserta</th>
                  <th style={{ padding: "1rem" }}>Nama</th>
                  <th style={{ padding: "1rem" }}>Email</th>
                  <th style={{ padding: "1rem" }}>Tahap</th>
                  <th style={{ padding: "1rem" }}>Ujian Diikuti</th>
                  <th style={{ padding: "1rem", textAlign: "right" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "1rem" }}>
                      <input
                        type="checkbox"
                        checked={assignData.participantIds.includes(p.id)}
                        onChange={() => toggleParticipantSelection(p.id)}
                      />
                    </td>
                    <td style={{ padding: "1rem", fontWeight: 600 }}>{p.participantNumber}</td>
                    <td style={{ padding: "1rem" }}>{p.name}</td>
                    <td style={{ padding: "1rem" }}>{p.email}</td>
                    <td style={{ padding: "1rem" }}>{p.stage?.name || "-"}</td>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                        {p.assignments?.map((a) => (
                          <span
                            key={a.id}
                            style={{
                              backgroundColor: "#f1f5f9",
                              padding: "0.2rem 0.5rem",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                            }}
                          >
                            {a.exam.title}
                          </span>
                        ))}
                        {!p.assignments?.length && (
                          <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                            Belum ada ujian
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "right" }}>
                      <button
                        onClick={() => handleEdit(p)}
                        style={{
                          marginRight: "0.5rem",
                          border: "none",
                          backgroundColor: "transparent",
                          color: "#3b82f6",
                          cursor: "pointer",
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        style={{
                          border: "none",
                          backgroundColor: "transparent",
                          color: "#ef4444",
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && meta.totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                Sebelumnya
              </button>
              <span style={{ alignSelf: "center" }}>
                Halaman {page} dari {meta.totalPages}
              </span>
              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage(page + 1)}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                Berikutnya
              </button>
            </div>
          )}
        </>
      )}

      {/* Participant Add/Edit Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "2rem",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "480px",
            }}
          >
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem" }}>
              {formData.id ? "Edit" : "Tambah"} Peserta
            </h3>
            <form onSubmit={handleSubmit}>
              {!formData.id && (
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                    Pilih Pendaftar Lomba
                  </label>
                  <select
                    value={selectedRegUserId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedRegUserId(val);
                      const selected = registeredUsers.find((r) => r.id === val);
                      if (selected) {
                        const year = new Date().getFullYear();
                        const rand = Math.floor(1000 + Math.random() * 9000);
                        setFormData({
                          ...formData,
                          name: selected.user.name,
                          email: selected.user.email,
                          participantNumber: `MTS-${year}-${rand}`,
                        });
                      } else {
                        setFormData({
                          ...formData,
                          name: "",
                          email: "",
                          participantNumber: "",
                        });
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: "0.6rem",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                    }}
                    required
                  >
                    <option value="">-- Pilih Pendaftar (Approved) --</option>
                    {registeredUsers.map((reg) => (
                      <option key={reg.id} value={reg.id}>
                        {reg.user.name} ({reg.user.email}) - {reg.competition.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: !formData.id ? "#f1f5f9" : "#fff",
                  }}
                  required
                  readOnly={!formData.id}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: !formData.id ? "#f1f5f9" : "#fff",
                  }}
                  required
                  readOnly={!formData.id}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                  Nomor Peserta
                </label>
                <input
                  type="text"
                  value={formData.participantNumber}
                  onChange={(e) => setFormData({ ...formData, participantNumber: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                  }}
                  placeholder="Contoh: MTS-2026-001"
                  required
                />
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                  Tahapan
                </label>
                <select
                  value={formData.stageId}
                  onChange={(e) => setFormData({ ...formData, stageId: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                  }}
                >
                  <option value="">-- Pilih Tahapan --</option>
                  {stages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedRegUserId("");
                  }}
                  style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    backgroundColor: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "0.5rem 1rem",
                    border: "none",
                    borderRadius: "8px",
                    backgroundColor: "#2EC4B6",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Exam Modal */}
      {showAssignModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "2rem",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "560px",
            }}
          >
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem" }}>
              Assign Peserta ke Ujian
            </h3>
            <form onSubmit={handleAssign}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                  Tipe Target
                </label>
                <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name="assignType"
                      checked={assignData.assignType === "stage_competition"}
                      onChange={() =>
                        setAssignData({ ...assignData, assignType: "stage_competition" })
                      }
                    />
                    Babak & Lomba (Rekomendasi)
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name="assignType"
                      checked={assignData.assignType === "exam"}
                      onChange={() => setAssignData({ ...assignData, assignType: "exam" })}
                    />
                    Ujian Spesifik
                  </label>
                </div>
              </div>

              {assignData.assignType === "exam" ? (
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                    Pilih Ujian Target
                  </label>
                  <select
                    value={assignData.examId}
                    onChange={(e) => setAssignData({ ...assignData, examId: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.6rem",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                    }}
                    required
                  >
                    <option value="">-- Pilih Ujian --</option>
                    {exams.map((exam) => (
                      <option key={exam.id} value={exam.id}>
                        {exam.title}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                      Pilih Lomba (Kompetisi) Target
                    </label>
                    <select
                      value={assignData.competitionId}
                      onChange={(e) =>
                        setAssignData({ ...assignData, competitionId: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: "0.6rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                      }}
                      required
                    >
                      <option value="">-- Pilih Lomba --</option>
                      {competitions.map((comp) => (
                        <option key={comp.id} value={comp.id}>
                          {comp.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                      Pilih Babak (Stage) Target
                    </label>
                    <select
                      value={assignData.stageId}
                      onChange={(e) => setAssignData({ ...assignData, stageId: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "0.6rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                      }}
                      required
                    >
                      <option value="">-- Pilih Babak --</option>
                      {stages.map((stage) => (
                        <option key={stage.id} value={stage.id}>
                          {stage.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                  Metode Assignment
                </label>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name="assignMode"
                      checked={assignData.mode === "individual"}
                      onChange={() => setAssignData({ ...assignData, mode: "individual" })}
                    />
                    Peserta Terpilih ({assignData.participantIds.length})
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name="assignMode"
                      checked={assignData.mode === "stage"}
                      onChange={() => setAssignData({ ...assignData, mode: "stage" })}
                    />
                    Berdasarkan Tahap
                  </label>
                </div>
              </div>

              {assignData.mode === "stage" && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                    Pilih Tahapan Ujian Sumber
                  </label>
                  <select
                    value={assignData.sourceStageId}
                    onChange={(e) =>
                      setAssignData({ ...assignData, sourceStageId: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "0.6rem",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                    }}
                    required
                  >
                    <option value="">-- Pilih Tahap Sumber --</option>
                    {stages.map((stage) => (
                      <option key={stage.id} value={stage.id}>
                        {stage.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.75rem",
                  marginTop: "2rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    backgroundColor: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "0.5rem 1rem",
                    border: "none",
                    borderRadius: "8px",
                    backgroundColor: "#2EC4B6",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Assign Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ====================================================
5. MANAJEMEN BANK SOAL VIEW
==================================================== */
function QuestionsView() {
  const [exams, setExams] = useState<CBTExam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [questions, setQuestions] = useState<CBTQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // States for searchable paginated exam selector in Bank Soal
  const [examSearch, setExamSearch] = useState("");
  const [debouncedExamSearch, setDebouncedExamSearch] = useState("");
  const [examPage, setExamPage] = useState(1);
  const [examMeta, setExamMeta] = useState<PaginationMeta | null>(null);
  const [showExamDropdown, setShowExamDropdown] = useState(false);
  const [selectedExamTitle, setSelectedExamTitle] = useState("");

  const [formData, setFormData] = useState({
    id: "",
    text: "",
    type: "SINGLE_CHOICE" as "SINGLE_CHOICE" | "ESSAY",
    points: 3,
    position: 0,
    options: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ] as CBTQuestionOption[],
  });

  const fetchExams = async (pageNum: number, searchStr: string) => {
    try {
      // sortBy: "updatedAt" - picker Bank Soal ini mau ujian yang baru
      // saja diedit muncul di paling atas (beda dari tabel Jadwal & Ujian
      // yang tetap default urut startAt, lihat listExams di backend).
      const res = await AdminCBTAPI.listExams({
        page: pageNum,
        perPage: 5,
        search: searchStr,
        sortBy: "updatedAt",
      });
      setExams(res.data);
      setExamMeta(res.meta);
      if (res.data.length > 0) {
        if (!selectedExamId) {
          setSelectedExamId(res.data[0].id);
          setSelectedExamTitle(
            `${res.data[0].title}${res.data[0].competition ? ` - ${res.data[0].competition.title}` : ""}`
          );
        } else {
          const current = res.data.find((e) => e.id === selectedExamId);
          if (current) {
            setSelectedExamTitle(
              `${current.title}${current.competition ? ` - ${current.competition.title}` : ""}`
            );
          }
        }
      }
    } catch {
      /* ignore */
    }
  };

  const fetchQuestions = async (examId: string) => {
    if (!examId) return;
    try {
      setLoading(true);
      const data = await AdminCBTAPI.listQuestions(examId);
      setQuestions(data);
    } catch {
      toast.error("Gagal memuat soal");
    } finally {
      setLoading(false);
    }
  };

  // Debounce for Exam Selection Search in Bank Soal
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedExamSearch(examSearch);
      setExamPage(1);
    }, 400);

    return () => clearTimeout(handler);
  }, [examSearch]);

  useEffect(() => {
    // fetchExams also closes over selectedExamId (to keep the title in sync),
    // but it must NOT be a dep here: this effect should only re-run when the
    // page/search changes, exactly as before.
    fetchExams(examPage, debouncedExamSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examPage, debouncedExamSearch]);

  useEffect(() => {
    if (selectedExamId) {
      fetchQuestions(selectedExamId);
    }
  }, [selectedExamId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.text.trim()) return toast.error("Pertanyaan harus diisi");
    if (formData.points < 1 || formData.points > 10)
      return toast.error("Bobot nilai harus antara 1 - 10 poin");

    if (formData.type === "SINGLE_CHOICE") {
      const validOptions = formData.options.filter((o) => o.text.trim());
      if (validOptions.length < 2) return toast.error("Minimal harus mengisi 2 opsi jawaban");
      const hasCorrect = validOptions.some((o) => o.isCorrect);
      if (!hasCorrect) return toast.error("Tentukan salah satu opsi sebagai jawaban benar");
    }

    if (formData.type === "ESSAY" && !formData.options[0]?.text.trim()) {
      return toast.error(
        "Isi kunci jawaban untuk soal esai (dipakai sistem untuk menilai otomatis)"
      );
    }

    try {
      // Untuk ESSAY, "options" bukan pilihan jawaban — cuma dipakai untuk
      // menyimpan satu kunci jawaban (isCorrect selalu true) yang dibandingkan
      // exact-match ke jawaban peserta saat submit. Lihat exam.service.js
      // calculateScore/gradeAnswer di backend.
      const options =
        formData.type === "ESSAY"
          ? [{ text: formData.options[0].text.trim(), isCorrect: true, position: 0 }]
          : formData.options.filter((o) => o.text.trim());

      const payload = {
        examId: selectedExamId,
        text: formData.text,
        type: formData.type,
        points: formData.points,
        position: formData.position,
        options,
      };

      if (formData.id) {
        await AdminCBTAPI.updateQuestion(formData.id, payload);
        toast.success("Soal berhasil diperbarui");
      } else {
        await AdminCBTAPI.createQuestion(payload);
        toast.success("Soal berhasil ditambahkan");
      }
      setShowModal(false);
      fetchQuestions(selectedExamId);
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal menyimpan soal"));
    }
  };

  const handleEdit = (q: CBTQuestion) => {
    // Fill options up to 4 elements
    const filledOptions = [...q.options];
    while (filledOptions.length < 4) {
      filledOptions.push({ text: "", isCorrect: false, position: filledOptions.length });
    }

    setFormData({
      id: q.id,
      text: q.text,
      type: q.type as "SINGLE_CHOICE" | "ESSAY",
      points: q.points,
      position: q.position,
      options: filledOptions,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus soal ini?")) return;
    try {
      await AdminCBTAPI.deleteQuestion(id);
      toast.success("Soal berhasil dihapus");
      fetchQuestions(selectedExamId);
    } catch {
      toast.error("Gagal menghapus soal");
    }
  };

  const updateOptionText = (index: number, text: string) => {
    const updated = [...formData.options];
    updated[index].text = text;
    setFormData({ ...formData, options: updated });
  };

  const setOptionCorrect = (index: number) => {
    const updated = formData.options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    setFormData({ ...formData, options: updated });
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f172a" }}>Bank Soal</h2>
          <div style={{ position: "relative", zIndex: showExamDropdown ? 40 : 1 }}>
            <div
              onClick={() => setShowExamDropdown(!showExamDropdown)}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "0.95rem",
                fontWeight: 600,
                backgroundColor: "#fff",
                cursor: "pointer",
                display: "flex",
                gap: "0.5rem",
                alignItems: "center",
                minWidth: "250px",
                justifyContent: "space-between",
              }}
            >
              <span>{selectedExamTitle || "-- Pilih Ujian --"}</span>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>▼</span>
            </div>

            {showExamDropdown && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  width: "100%",
                  minWidth: "300px",
                  backgroundColor: "#fff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  marginTop: "4px",
                  boxShadow:
                    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                  padding: "0.75rem",
                }}
              >
                <input
                  type="text"
                  placeholder="Cari ujian..."
                  value={examSearch}
                  onChange={(e) => {
                    setExamSearch(e.target.value);
                    setExamPage(1);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    marginBottom: "0.5rem",
                    fontSize: "0.875rem",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                    maxHeight: "200px",
                    overflowY: "auto",
                  }}
                >
                  {exams.map((exam) => {
                    const titleWithComp = `${exam.title}${exam.competition ? ` - ${exam.competition.title}` : ""}`;
                    return (
                      <div
                        key={exam.id}
                        onClick={() => {
                          setSelectedExamId(exam.id);
                          setSelectedExamTitle(titleWithComp);
                          setShowExamDropdown(false);
                        }}
                        style={{
                          padding: "0.5rem 0.75rem",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                          backgroundColor: selectedExamId === exam.id ? "#f1f5f9" : "transparent",
                        }}
                      >
                        {titleWithComp}
                      </div>
                    );
                  })}
                  {exams.length === 0 && (
                    <div
                      style={{
                        padding: "0.5rem 0.75rem",
                        fontSize: "0.875rem",
                        color: "#64748b",
                        textAlign: "center",
                      }}
                    >
                      Tidak ditemukan ujian
                    </div>
                  )}
                </div>

                {examMeta && examMeta.totalPages > 1 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "0.75rem",
                      borderTop: "1px solid #f1f5f9",
                      paddingTop: "0.5rem",
                      fontSize: "0.75rem",
                    }}
                  >
                    <button
                      type="button"
                      disabled={examPage <= 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        setExamPage(examPage - 1);
                      }}
                      style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        border: "1px solid #cbd5e1",
                        background: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      Prev
                    </button>
                    <span>
                      Hal {examPage} dari {examMeta.totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={examPage >= examMeta.totalPages}
                      onClick={(e) => {
                        e.stopPropagation();
                        setExamPage(examPage + 1);
                      }}
                      style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        border: "1px solid #cbd5e1",
                        background: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {selectedExamId && (
          <button
            onClick={() => {
              setFormData({
                id: "",
                text: "",
                type: "SINGLE_CHOICE",
                points: 3,
                position: questions.length,
                options: [
                  { text: "", isCorrect: false, position: 0 },
                  { text: "", isCorrect: false, position: 1 },
                  { text: "", isCorrect: false, position: 2 },
                  { text: "", isCorrect: false, position: 3 },
                ],
              });
              setShowModal(true);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "#2EC4B6",
              color: "#fff",
              border: "none",
              padding: "0.6rem 1.2rem",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            <Plus size={16} /> Tambah Soal
          </button>
        )}
      </div>

      {loading ? (
        <div>Memuat daftar soal...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {questions.map((q, idx) => (
            <div
              key={q.id}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "1.5rem",
                backgroundColor: "#ffffff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      padding: "0.25rem 0.5rem",
                      borderRadius: "4px",
                      backgroundColor: "#f1f5f9",
                      marginRight: "0.5rem",
                    }}
                  >
                    Soal #{idx + 1}
                  </span>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      padding: "0.25rem 0.5rem",
                      borderRadius: "4px",
                      backgroundColor: q.type === "ESSAY" ? "#fef3c7" : "#e0f2fe",
                      color: q.type === "ESSAY" ? "#b45309" : "#0369a1",
                      marginRight: "0.5rem",
                    }}
                  >
                    {q.type === "ESSAY" ? "Esai" : "Pilihan Ganda"}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                    Bobot: <strong>{q.points}</strong> poin
                  </span>
                </div>
                <div>
                  <button
                    onClick={() => handleEdit(q)}
                    style={{
                      marginRight: "0.5rem",
                      border: "none",
                      backgroundColor: "transparent",
                      color: "#3b82f6",
                      cursor: "pointer",
                    }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    style={{
                      border: "none",
                      backgroundColor: "transparent",
                      color: "#ef4444",
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 600,
                  marginBottom: "1rem",
                  whiteSpace: "pre-line",
                }}
              >
                {renderFormattedText(q.text)}
              </div>

              {q.type === "SINGLE_CHOICE" && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.75rem",
                    paddingLeft: "1rem",
                  }}
                >
                  {q.options.map((opt, i) => (
                    <div
                      key={opt.id || i}
                      style={{
                        padding: "0.75rem",
                        borderRadius: "8px",
                        border: "1px solid",
                        borderColor: opt.isCorrect ? "#10b981" : "#e2e8f0",
                        backgroundColor: opt.isCorrect ? "#f0fdf4" : "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <span
                        style={{ fontWeight: 700, color: opt.isCorrect ? "#15803d" : "#64748b" }}
                      >
                        {String.fromCharCode(65 + i)}.
                      </span>
                      <span>{renderFormattedText(opt.text)}</span>
                      {opt.isCorrect && (
                        <CheckCircle2 size={16} style={{ marginLeft: "auto", color: "#10b981" }} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {q.type === "ESSAY" && (
                <div
                  style={{
                    paddingLeft: "1rem",
                    fontSize: "0.9rem",
                    color: "#64748b",
                  }}
                >
                  Kunci Jawaban:{" "}
                  <strong style={{ color: "#0f172a" }}>
                    {q.options[0]?.text || "(belum diisi)"}
                  </strong>
                </div>
              )}
            </div>
          ))}

          {questions.length === 0 && (
            <div
              style={{
                padding: "3rem",
                textAlign: "center",
                color: "#94a3b8",
                border: "2px dashed #e2e8f0",
                borderRadius: "12px",
              }}
            >
              Belum ada soal pada ujian ini. Silakan tambah soal baru.
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "2rem",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem" }}>
              {formData.id ? "Edit" : "Tambah"} Soal Ujian
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                  Jenis Soal
                </label>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name="qType"
                      checked={formData.type === "SINGLE_CHOICE"}
                      onChange={() =>
                        setFormData({ ...formData, type: "SINGLE_CHOICE", points: 3 })
                      }
                    />
                    Pilihan Ganda
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name="qType"
                      checked={formData.type === "ESSAY"}
                      onChange={() => setFormData({ ...formData, type: "ESSAY", points: 5 })}
                    />
                    Esai
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                  Pertanyaan
                </label>
                <textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    minHeight: "80px",
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                  Bobot Nilai
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={formData.points}
                  onChange={(e) => {
                    const parsed = parseInt(e.target.value) || 1;
                    setFormData({ ...formData, points: Math.min(10, Math.max(1, parsed)) });
                  }}
                  style={{
                    width: "120px",
                    padding: "0.6rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                  }}
                  required
                />
              </div>

              {formData.type === "SINGLE_CHOICE" && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", marginBottom: "0.75rem", fontWeight: 600 }}>
                    Opsi Jawaban & Kunci Jawaban
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {formData.options.map((opt, i) => (
                      <div
                        key={i}
                        style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
                      >
                        <span style={{ fontWeight: 700 }}>{String.fromCharCode(65 + i)}</span>
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => updateOptionText(i, e.target.value)}
                          placeholder={`Opsi ${String.fromCharCode(65 + i)}`}
                          style={{
                            flex: 1,
                            padding: "0.5rem",
                            borderRadius: "6px",
                            border: "1px solid #cbd5e1",
                          }}
                          required={i < 2}
                        />
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                          }}
                        >
                          <input
                            type="radio"
                            name="correctOpt"
                            checked={opt.isCorrect}
                            onChange={() => setOptionCorrect(i)}
                          />
                          Benar
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formData.type === "ESSAY" && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", marginBottom: "0.75rem", fontWeight: 600 }}>
                    Kunci Jawaban
                  </label>
                  <input
                    type="text"
                    value={formData.options[0]?.text || ""}
                    onChange={(e) => updateOptionText(0, e.target.value)}
                    placeholder="Jawaban yang dianggap benar"
                    style={{
                      width: "100%",
                      padding: "0.6rem",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                    }}
                    required
                  />
                  <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.4rem" }}>
                    Sistem menilai otomatis dengan mencocokkan persis (termasuk huruf besar/kecil
                    dan spasi) jawaban peserta dengan kunci ini. Kalau tidak cocok tapi menurut kamu
                    sebenarnya benar, nilainya bisa dikoreksi manual di halaman Hasil Ujian.
                  </p>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    backgroundColor: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "0.5rem 1rem",
                    border: "none",
                    borderRadius: "8px",
                    backgroundColor: "#2EC4B6",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ====================================================
6. REALTIME MONITORING VIEW
==================================================== */
function MonitoringView() {
  const [monitoringData, setMonitoringData] = useState<CBTMonitoringData[]>([]);
  const [exams, setExams] = useState<CBTExam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState("");

  const fetchExams = useCallback(async () => {
    try {
      const res = await AdminCBTAPI.listExams({ perPage: 100 });
      setExams(res.data);
    } catch {
      /* ignore */
    }
  }, []);

  const fetchMonitoring = useCallback(async () => {
    try {
      const res = await AdminCBTAPI.getMonitoring({ examId: selectedExamId || undefined });
      setMonitoringData(res.data);
    } catch {
      /* ignore */
    }
  }, [selectedExamId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchExams();
  }, [fetchExams]);

  // Poll monitoring data every 5 seconds
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMonitoring();
    const interval = setInterval(fetchMonitoring, 5000);
    return () => clearInterval(interval);
  }, [fetchMonitoring]);

  const formatRemainingTime = (ms: number) => {
    if (ms <= 0) return "Habis";
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const getStatusColor = (status: CBTMonitoringData["status"]) => {
    switch (status) {
      case "Waiting":
        return { bg: "#f1f5f9", text: "#64748b" };
      case "In Progress":
        return { bg: "#dbeafe", text: "#1d4ed8" };
      case "Finished":
        return { bg: "#dcfce7", text: "#15803d" };
      case "Auto Submitted":
        return { bg: "#fee2e2", text: "#b91c1c" };
      case "Disconnected":
        return { bg: "#fef3c7", text: "#d97706" };
      default:
        return { bg: "#f1f5f9", text: "#64748b" };
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f172a" }}>
            Monitoring Ujian Realtime
          </h2>
          <ExamPickerDropdown
            exams={exams}
            selectedExamId={selectedExamId}
            onSelect={setSelectedExamId}
          />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "#64748b",
            fontSize: "0.9rem",
          }}
        >
          <RefreshCw size={14} className="animate-spin" />
          <span>Update otomatis setiap 5 detik</span>
        </div>
      </div>

      <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: "1rem" }}>Nomor Peserta</th>
              <th style={{ padding: "1rem" }}>Nama Peserta</th>
              <th style={{ padding: "1rem" }}>Ujian</th>
              <th style={{ padding: "1rem" }}>Lomba</th>
              <th style={{ padding: "1rem" }}>Status</th>
              <th style={{ padding: "1rem" }}>Sisa Waktu</th>
              <th style={{ padding: "1rem" }}>Progres Jawaban</th>
            </tr>
          </thead>
          <tbody>
            {monitoringData.map((row) => {
              const statusStyle = getStatusColor(row.status);
              return (
                <tr key={row.assignmentId} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "1rem", fontWeight: 600 }}>
                    {row.participant.participantNumber}
                  </td>
                  <td style={{ padding: "1rem" }}>{row.participant.name}</td>
                  <td style={{ padding: "1rem" }}>{row.exam.title}</td>
                  <td style={{ padding: "1rem", color: "#64748b" }}>
                    {row.competitionTitle || "-"}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span
                      style={{
                        padding: "0.25rem 0.6rem",
                        borderRadius: "9999px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.text,
                      }}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", fontFamily: "monospace", fontWeight: 700 }}>
                    {row.status === "In Progress" || row.status === "Disconnected"
                      ? formatRemainingTime(row.remainingMs)
                      : "-"}
                  </td>
                  <td style={{ padding: "1rem", fontWeight: 600 }}>
                    {row.status !== "Waiting" ? `${row.answeredCount} Terjawab` : "-"}
                  </td>
                </tr>
              );
            })}
            {monitoringData.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
                  Tidak ada peserta yang di-assign untuk dipantau.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ====================================================
7. HASIL & EXPORT VIEW
==================================================== */
function ResultsView() {
  const [results, setResults] = useState<CBTResultData[]>([]);
  const [exams, setExams] = useState<CBTExam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [loading, setLoading] = useState(false);

  // Koreksi manual esai — auto-grading exact-match sudah jalan saat peserta
  // submit, modal ini untuk admin meninjau/override kalau exact-match-nya
  // keliru (mis. peserta benar tapi beda kapitalisasi/spasi).
  const [gradingAttemptId, setGradingAttemptId] = useState<string | null>(null);
  const [essayAnswers, setEssayAnswers] = useState<CBTEssayAnswer[]>([]);
  const [essayLoading, setEssayLoading] = useState(false);
  const [essayDrafts, setEssayDrafts] = useState<Record<string, string>>({});
  const [savingAnswerId, setSavingAnswerId] = useState<string | null>(null);
  const [rankingLoading, setRankingLoading] = useState(false);

  // Ranking dihitung per Stage (bisa gabungan >1 exam dalam satu tahap),
  // bukan otomatis tiap submit — lihat komentar recomputeStageRanking di
  // admin-cbt.service.js. Stage-nya diturunkan dari exam yang lagi dipilih
  // di dropdown.
  const selectedExam = exams.find((exam) => exam.id === selectedExamId);
  const selectedStageId = selectedExam?.stage?.id || "";

  const fetchExams = async () => {
    try {
      const res = await AdminCBTAPI.listExams({ perPage: 100 });
      setExams(res.data);
    } catch {
      /* ignore */
    }
  };

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      const res = await AdminCBTAPI.getResults({ examId: selectedExamId || undefined });
      setResults(res.data);
    } catch {
      toast.error("Gagal memuat hasil ujian");
    } finally {
      setLoading(false);
    }
  }, [selectedExamId]);

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleExport = async () => {
    try {
      const blob = await AdminCBTAPI.exportResults({ examId: selectedExamId || undefined });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `hasil-ujian-${selectedExamId || "all"}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch {
      toast.error("Gagal mengekspor hasil");
    }
  };

  const handleExportPdf = async () => {
    try {
      const blob = await AdminCBTAPI.exportResultsPdf({ examId: selectedExamId || undefined });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `hasil-ujian-${selectedExamId || "all"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch {
      toast.error("Gagal mengekspor PDF");
    }
  };

  const handleRecomputeRanking = async () => {
    if (!selectedStageId) return;
    setRankingLoading(true);
    try {
      const res = await AdminCBTAPI.recomputeStageRanking(selectedStageId);
      toast.success(`Ranking dihitung untuk ${res.participantsRanked} peserta`);
      fetchResults();
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal menghitung ranking"));
    } finally {
      setRankingLoading(false);
    }
  };

  const openEssayGrading = async (attemptId: string) => {
    setGradingAttemptId(attemptId);
    setEssayLoading(true);
    try {
      const data = await AdminCBTAPI.getEssayAnswers(attemptId);
      setEssayAnswers(data.questions);
      const drafts: Record<string, string> = {};
      data.questions.forEach((q) => {
        if (q.answerId) drafts[q.answerId] = String(q.pointsEarned ?? 0);
      });
      setEssayDrafts(drafts);
    } catch {
      toast.error("Gagal memuat jawaban esai");
      setGradingAttemptId(null);
    } finally {
      setEssayLoading(false);
    }
  };

  const closeEssayGrading = () => {
    setGradingAttemptId(null);
    setEssayAnswers([]);
    setEssayDrafts({});
  };

  const saveEssayGrade = async (answerId: string, maxPoints: number) => {
    const raw = Number(essayDrafts[answerId]);
    const pointsEarned = Number.isFinite(raw) ? Math.max(0, Math.min(maxPoints, raw)) : 0;
    setSavingAnswerId(answerId);
    try {
      await AdminCBTAPI.gradeEssayAnswer(answerId, {
        pointsEarned,
        isCorrect: pointsEarned > 0,
      });
      toast.success("Nilai esai tersimpan");
      setEssayAnswers((prev) =>
        prev.map((q) =>
          q.answerId === answerId
            ? { ...q, pointsEarned, isCorrect: pointsEarned > 0, gradedManually: true }
            : q
        )
      );
      fetchResults();
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal menyimpan nilai"));
    } finally {
      setSavingAnswerId(null);
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f172a" }}>
            Hasil Ujian & Export
          </h2>
          <ExamPickerDropdown
            exams={exams}
            selectedExamId={selectedExamId}
            onSelect={setSelectedExamId}
          />
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={handleRecomputeRanking}
            disabled={!selectedStageId || rankingLoading}
            title={
              !selectedStageId
                ? "Pilih ujian yang tergabung ke sebuah tahapan (stage) dulu"
                : "Hitung ulang ranking untuk semua ujian pada tahapan ini"
            }
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: !selectedStageId ? "#e2e8f0" : "#f59e0b",
              color: !selectedStageId ? "#94a3b8" : "#fff",
              border: "none",
              padding: "0.6rem 1.2rem",
              borderRadius: "8px",
              cursor: !selectedStageId || rankingLoading ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            <Award size={16} /> {rankingLoading ? "Menghitung..." : "Hitung Ranking"}
          </button>
          <button
            onClick={handleExport}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "#10b981",
              color: "#fff",
              border: "none",
              padding: "0.6rem 1.2rem",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {/* Catatan: tombol ini memanggil endpoint Excel (.xlsx), bukan
                CSV — labelnya sudah begini dari sebelum perubahan ini,
                belum diganti supaya diff tetap fokus ke penambahan PDF. */}
            <FileDown size={16} /> Export ke CSV
          </button>
          <button
            onClick={handleExportPdf}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "#ef4444",
              color: "#fff",
              border: "none",
              padding: "0.6rem 1.2rem",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            <FileDown size={16} /> Export PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div>Memuat data hasil ujian...</div>
      ) : (
        <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "1rem" }}>Nomor Peserta</th>
                <th style={{ padding: "1rem" }}>Nama Peserta</th>
                <th style={{ padding: "1rem" }}>Ujian</th>
                <th style={{ padding: "1rem" }}>Lomba</th>
                <th style={{ padding: "1rem" }}>Jumlah Jawaban</th>
                <th style={{ padding: "1rem" }}>Selesai Pada</th>
                <th style={{ padding: "1rem", textAlign: "right" }}>Nilai Akhir</th>
                <th style={{ padding: "1rem", textAlign: "center" }}>Ranking</th>
                <th style={{ padding: "1rem" }}></th>
              </tr>
            </thead>
            <tbody>
              {results.map((row) => (
                <tr key={row.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "1rem", fontWeight: 600 }}>{row.participantNumber}</td>
                  <td style={{ padding: "1rem" }}>{row.participantName}</td>
                  <td style={{ padding: "1rem" }}>{row.examTitle}</td>
                  <td style={{ padding: "1rem", color: "#64748b" }}>
                    {row.competitionTitle || "-"}
                  </td>
                  <td style={{ padding: "1rem" }}>{row.answerCount} Terjawab</td>
                  <td style={{ padding: "1rem" }}>
                    {row.finishedAt ? new Date(row.finishedAt).toLocaleString("id-ID") : "-"}
                  </td>
                  <td
                    style={{
                      padding: "1rem",
                      textAlign: "right",
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      color: "#2EC4B6",
                    }}
                  >
                    {row.score !== null ? row.score : "-"}
                  </td>
                  <td style={{ padding: "1rem", textAlign: "center", fontWeight: 700 }}>
                    {row.rank !== null ? `#${row.rank}` : "-"}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <button
                      onClick={() => openEssayGrading(row.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        border: "1px solid #cbd5e1",
                        backgroundColor: "#fff",
                        borderRadius: "6px",
                        padding: "0.4rem 0.7rem",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Edit2 size={14} /> Koreksi Esai
                    </button>
                  </td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}
                  >
                    Belum ada hasil ujian yang tersedia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {gradingAttemptId && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "2rem",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "640px",
              maxHeight: "85vh",
              overflowY: "auto",
            }}
          >
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.25rem" }}>
              Koreksi Jawaban Esai
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1.5rem" }}>
              Nilai sudah dihitung otomatis (exact-match). Ubah poin di sini kalau menurutmu
              penilaian otomatisnya keliru — nilai akhir peserta akan dihitung ulang begitu
              disimpan.
            </p>

            {essayLoading ? (
              <div>Memuat jawaban esai...</div>
            ) : essayAnswers.length === 0 ? (
              <div style={{ color: "#64748b" }}>Ujian ini tidak punya soal esai.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {essayAnswers.map((q) => (
                  <div
                    key={q.questionId}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      padding: "1rem",
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
                      {renderFormattedText(q.text)}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "0.25rem" }}>
                      Kunci jawaban: <strong>{q.answerKey ?? "(belum diisi)"}</strong>
                    </div>
                    <div style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                      Jawaban peserta: <strong>{q.submittedAnswer || "(tidak dijawab)"}</strong>
                      {q.isCorrect !== null && (
                        <span
                          style={{
                            marginLeft: "0.5rem",
                            color: q.isCorrect ? "#10b981" : "#ef4444",
                            fontWeight: 600,
                          }}
                        >
                          {q.isCorrect ? "Cocok otomatis" : "Tidak cocok otomatis"}
                        </span>
                      )}
                      {q.gradedManually && (
                        <span style={{ marginLeft: "0.5rem", color: "#f59e0b", fontWeight: 600 }}>
                          (dikoreksi manual)
                        </span>
                      )}
                    </div>

                    {q.answerId ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <input
                          type="number"
                          min={0}
                          max={q.points}
                          value={essayDrafts[q.answerId] ?? ""}
                          onChange={(e) =>
                            setEssayDrafts((prev) => ({
                              ...prev,
                              [q.answerId as string]: e.target.value,
                            }))
                          }
                          style={{
                            width: "80px",
                            padding: "0.4rem",
                            borderRadius: "6px",
                            border: "1px solid #cbd5e1",
                          }}
                        />
                        <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                          / {q.points} poin
                        </span>
                        <button
                          onClick={() => saveEssayGrade(q.answerId as string, q.points)}
                          disabled={savingAnswerId === q.answerId}
                          style={{
                            marginLeft: "auto",
                            backgroundColor: "#2EC4B6",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            padding: "0.4rem 0.9rem",
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                          }}
                        >
                          {savingAnswerId === q.answerId ? "Menyimpan..." : "Simpan"}
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                        Peserta belum menjawab soal ini.
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
              <button
                onClick={closeEssayGrading}
                style={{
                  padding: "0.5rem 1.2rem",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
