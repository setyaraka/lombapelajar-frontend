import { useCallback, useEffect, useState } from "react";
import Pagination from "../Pagination";
import RowsPerPage from "../RowsPerPage";
import PaymentProofModal from "../PaymentProofModal";
import type { ProofData } from "../PaymentProofModal";
import { getParticipants, updateParticipantStatus } from "../../services/participant.service";

type Status = "pending" | "approved" | "rejected";

type Participant = {
  id: string;
  name: string;
  school: string;
  competition: string;
  status: Status;
  proofUrl?: string;
  uploadedAt?: string;
};

export default function ParticipantsTab() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const [proof, setProof] = useState<ProofData | null>(null);
  const [open, setOpen] = useState(false);

  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });

  // ================= LOAD DATA =================
  const loadParticipants = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getParticipants({
        page,
        perPage,
        search,
        status: statusFilter,
      });

      setParticipants(res.data);
      setTotalPages(res.meta.totalPages);
      setStats(res.stats);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, statusFilter]);

  useEffect(() => {
    loadParticipants();
  }, [loadParticipants]);

  const changeStatus = async (id: string, status: Status) => {
    await updateParticipantStatus(id, status);
    loadParticipants();
  };

  const badgeClass = (status: Status) => `status ${status}`;

  return (
    <>
      <PaymentProofModal open={open} data={proof} onClose={() => setOpen(false)} />

      <div className="admin-page">
        <div className="container">
          {/* ===== STATS ===== */}
          <div className="admin-stats">
            <div className="stat pending">
              <b>{stats.pending}</b>
              <span>Menunggu Verifikasi</span>
            </div>

            <div className="stat approved">
              <b>{stats.approved}</b>
              <span>Diterima</span>
            </div>

            <div className="stat rejected">
              <b>{stats.rejected}</b>
              <span>Ditolak</span>
            </div>

            <div className="stat total">
              <b>{stats.total}</b>
              <span>Total Peserta</span>
            </div>
          </div>

          {/* ===== FILTER ===== */}
          <div className="card filter-card">
            <div className="filter-title">Filter Peserta</div>

            <div className="filter-row">
              <div className="table-controls">
                <input
                  placeholder="Cari nama, sekolah, atau lomba..."
                  value={search}
                  onChange={(e) => {
                    setPage(1);
                    setSearch(e.target.value);
                  }}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setPage(1);
                  setStatusFilter(e.target.value);
                }}
              >
                <option value="">Semua Status</option>
                <option value="pending">Menunggu</option>
                <option value="approved">Diterima</option>
                <option value="rejected">Ditolak</option>
              </select>
            </div>
          </div>

          {/* ===== TABLE ===== */}
          <div className="card">
            <table>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Sekolah</th>
                  <th>Lomba</th>
                  <th>Pembayaran</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center" }}>
                      Loading...
                    </td>
                  </tr>
                ) : participants.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center" }}>
                      Tidak ada peserta
                    </td>
                  </tr>
                ) : (
                  participants.map((p) => {
                    const paymentUploaded = p.proofUrl ? true : false;
                    console.log(paymentUploaded, ">>>", p)

                    return (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>{p.school}</td>
                        <td>{p.competition}</td>

                        {/* ===== BUKTI ===== */}
                        <td>
                          {p.proofUrl ? (
                            <button
                              className="btn view"
                              onClick={() => {
                                setProof({
                                  id: p.id,
                                  name: p.name,
                                  school: p.school,
                                  competition: p.competition,
                                  imageUrl: p.proofUrl!,
                                  uploadedAt: new Date(p.uploadedAt!).toLocaleString("id-ID"),
                                });
                                setOpen(true);
                              }}
                            >
                              Lihat Bukti
                            </button>
                          ) : (
                            <span className="muted">Belum upload</span>
                          )}
                        </td>

                        {/* ===== STATUS ===== */}
                        <td>
                          <span className={badgeClass(p.status)}>
                            {p.status === "pending" && "Menunggu"}
                            {p.status === "approved" && "Diterima"}
                            {p.status === "rejected" && "Ditolak"}
                          </span>
                        </td>

                        {/* ===== ACTION ===== */}
                        <td className="actions">
                          <button
                            className="btn approve"
                            disabled={!paymentUploaded}
                            title={!paymentUploaded ? "Peserta belum upload bukti pembayaran" : ""}
                            onClick={() => changeStatus(p.id, "approved")}
                          >
                            Terima
                          </button>

                          <button
                            className="btn reject"
                            disabled={!paymentUploaded}
                            title={!paymentUploaded ? "Peserta belum upload bukti pembayaran" : ""}
                            onClick={() => changeStatus(p.id, "rejected")}
                          >
                            Tolak
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ===== FOOTER ===== */}
          <div className="table-footer">
            <div></div>

            {totalPages > 1 ? (
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            ) : (
              <div></div>
            )}

            <RowsPerPage
              value={perPage}
              onChange={(v) => {
                setPage(1);
                setPerPage(v);
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
