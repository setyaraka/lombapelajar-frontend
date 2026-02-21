import { useMemo, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Pagination from "../components/Pagination";
import RowsPerPage from "../components/RowsPerPage";
import PaymentProofModal from "../components/PaymentProofModal";
import type { ProofData } from "../components/PaymentProofModal";

type Status = "pending" | "approved" | "rejected";

type Participant = {
  id: number;
  name: string;
  school: string;
  competition: string;
  status: Status;
};

const dummyData: Participant[] = [
  {
    id: 1,
    name: "Budi Santoso",
    school: "SDN 1 Jakarta",
    competition: "Olimpiade Matematika",
    status: "pending",
  },
  {
    id: 2,
    name: "Siti Rahma",
    school: "SMPN 5 Bandung",
    competition: "Olimpiade IPA",
    status: "approved",
  },
  {
    id: 3,
    name: "Andi Pratama",
    school: "SMAN 3 Surabaya",
    competition: "English Competition",
    status: "rejected",
  },
  {
    id: 4,
    name: "Rina Putri",
    school: "SMPN 2 Bekasi",
    competition: "Olimpiade Matematika",
    status: "pending",
  },
  {
    id: 5,
    name: "Dedi Saputra",
    school: "SMAN 1 Bogor",
    competition: "English Competition",
    status: "pending",
  },
  {
    id: 6,
    name: "Rudi Hartono",
    school: "SDN 5 Depok",
    competition: "Olimpiade IPA",
    status: "approved",
  },
];

export default function AdminParticipants() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [proof, setProof] = useState<ProofData | null>(null);
  const [open, setOpen] = useState(false);

  // FILTER
  const filtered = useMemo(() => {
    return dummyData.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.school.toLowerCase().includes(search.toLowerCase()) ||
        p.competition.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter ? p.status === statusFilter : true;

      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  // PAGINATION
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const changeStatus = (id: number, status: Status) => {
    alert(`Ubah status peserta ${id} → ${status}`);
    // nanti: await api.patch(`/admin/participant/${id}`, {status})
  };

  const badgeClass = (status: Status) => `status ${status}`;

  return (
    <>
      <PaymentProofModal open={open} data={proof} onClose={() => setOpen(false)} />
      <div className="admin-page">
        <Header />

        <div className="container">
          {/* FILTER */}
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

          {/* TABLE */}
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
                {paginated.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.school}</td>
                    <td>{p.competition}</td>

                    <td>
                      <button
                        className="btn view"
                        onClick={() => {
                          setProof({
                            id: p.id,
                            name: p.name,
                            school: p.school,
                            competition: p.competition,
                            imageUrl: "/dummy-bukti.jpg",
                            uploadedAt: "21 Feb 2026 21:30",
                          });
                          setOpen(true);
                        }}
                      >
                        Lihat Bukti
                      </button>
                    </td>

                    <td>
                      <span className={badgeClass(p.status)}>
                        {p.status === "pending" && "Menunggu"}
                        {p.status === "approved" && "Diterima"}
                        {p.status === "rejected" && "Ditolak"}
                      </span>
                    </td>

                    <td className="actions">
                      <button
                        className="btn approve"
                        onClick={() => changeStatus(p.id, "approved")}
                      >
                        Terima
                      </button>

                      <button className="btn reject" onClick={() => changeStatus(p.id, "rejected")}>
                        Tolak
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

        <Footer />
      </div>
    </>
  );
}
