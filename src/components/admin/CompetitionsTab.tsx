import { useEffect, useState } from "react";
import CreateCompetitionModal from "./CreateCompetitionModal";
import CompetitionParticipantsModal from "./CompetitionParticipantsModal";
import Pagination from "../Pagination";
import RowsPerPage from "../RowsPerPage";
import { getCompetitions } from "../../services/competition.service";

type Competition = {
  id: string;
  title: string;
  category: string;
  level: string;
  participants: number;
  deadline: string;
  status: "open" | "closed";
};

export default function CompetitionsTab() {
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState("");
  const [open, setOpen] = useState(false);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [participantOpen, setParticipantOpen] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getCompetitions({
          page,
          perPage,
          search,
          level,
          category,
        });

        setCompetitions(res.data);
        setTotalPages(res.meta.totalPages);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, perPage, search, level, category]);

  return (
    <>
      {/* <CreateCompetitionModal open={open} onClose={() => setOpen(false)} /> */}
      <CreateCompetitionModal
        open={open}
        competitionId={editingId}
        onClose={() => {
          setOpen(false);
          setEditingId(null);
        }}
      />

      <CompetitionParticipantsModal
        open={participantOpen}
        onClose={() => setParticipantOpen(false)}
        competitionTitle={selectedCompetition?.title}
        participants={[]} // nanti kita lazy load API participants
      />

      {/* FILTER */}
      <div className="table-toolbar">
        <button className="btn primary btn-inline add-btn" onClick={() => setOpen(true)}>
          + Tambah Lomba
        </button>
      </div>

      <div className="card filter-card">
        <div className="filter-header">
          <div className="filter-title">Filter Lomba</div>
        </div>

        <div className="filter-row">
          <div className="table-controls">
            <input
              placeholder="Cari nama lomba..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
          </div>

          <select
            value={level}
            onChange={(e) => {
              setPage(1);
              setLevel(e.target.value);
            }}
          >
            <option value="">Semua Jenjang</option>
            <option value="SD">SD</option>
            <option value="SMP">SMP</option>
            <option value="SMA">SMA</option>
          </select>

          <select
            value={category}
            onChange={(e) => {
              setPage(1);
              setCategory(e.target.value);
            }}
          >
            <option value="">Semua Kategori</option>
            <option value="Akademik">Akademik</option>
            <option value="Bahasa">Bahasa</option>
            <option value="Sains">Sains</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Nama Lomba</th>
              <th>Kategori</th>
              <th>Jenjang</th>
              <th>Deadline</th>
              <th>Status</th>
              <th>Total Peserta</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center" }}>
                  Loading...
                </td>
              </tr>
            ) : competitions.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center" }}>
                  Tidak ada data
                </td>
              </tr>
            ) : (
              competitions.map((c) => (
                <tr key={c.id}>
                  <td>{c.title.toLocaleUpperCase()}</td>
                  <td>{c.category.toLocaleUpperCase()}</td>
                  <td>{c.level.toLocaleUpperCase()}</td>
                  <td>{new Date(c.deadline).toLocaleDateString("id-ID")}</td>

                  <td>
                    <span className={`status ${c.status}`}>
                      {c.status === "open" ? "Dibuka" : "Ditutup"}
                    </span>
                  </td>

                  <td>
                    <button
                      className="link-btn"
                      onClick={() => {
                        setSelectedCompetition(c);
                        setParticipantOpen(true);
                      }}
                    >
                      {c.participants}
                    </button>
                  </td>

                  <td className="actions">
                    <button
                      className="btn small warning"
                      onClick={() => {
                        setEditingId(c.id);
                        setOpen(true);
                      }}
                    >
                      Edit
                    </button>
                    <button className="btn small danger">Hapus</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
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
    </>
  );
}
