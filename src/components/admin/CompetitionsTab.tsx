import { useEffect, useMemo, useState } from "react";
import CreateCompetitionModal from "./CreateCompetitionModal";
import CompetitionParticipantsModal from "./CompetitionParticipantsModal";
import Pagination from "../Pagination";
import RowsPerPage from "../RowsPerPage";

type Competition = {
  id: number;
  title: string;
  category: string;
  level: string;
  participants: number;
  deadline: string;
};

type Participant = {
  id: number;
  name: string;
  school: string;
  status: "pending" | "verified" | "rejected";
};

const initialCompetitions: Competition[] = [
  {
    id: 1,
    title: "Olimpiade Matematika",
    category: "Akademik",
    level: "SD",
    participants: 120,
    deadline: "2026-03-20",
  },
  {
    id: 2,
    title: "English Contest",
    category: "Bahasa",
    level: "SMP",
    participants: 80,
    deadline: "2026-02-25",
  },
  {
    id: 3,
    title: "Science Fair",
    category: "Sains",
    level: "SMA",
    participants: 45,
    deadline: "2026-02-10",
  },
];

const participantMap: Record<number, Participant[]> = {
  1: [
    { id: 1, name: "Budi", school: "SDN 01 Jakarta", status: "verified" },
    { id: 2, name: "Andi", school: "SDIT Harapan", status: "pending" },
  ],
  2: [{ id: 3, name: "Siti", school: "SMPN 5 Bandung", status: "verified" }],
  3: [],
};

export default function CompetitionsTab() {
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState("");
  const [open, setOpen] = useState(false);
  const [competitions, setCompetitions] = useState<Competition[]>(initialCompetitions);
  const [participantOpen, setParticipantOpen] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

  
  const filtered = useMemo(() => {
      return competitions.filter((c) => {
      const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
      const matchLevel = level ? c.level === level : true;
      const matchCategory = category ? c.category === category : true;
      
      return matchSearch && matchLevel && matchCategory;
    });
}, [competitions, search, level, category]);

const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));

const paginated = filtered.slice(
(page - 1) * perPage,
page * perPage
);

useEffect(() => {
  if (page > totalPages) setPage(totalPages);
}, [totalPages, page]);

  function getCompetitionStatus(deadline: string) {
    const now = new Date();
    const d = new Date(deadline);

    const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: "Ditutup", class: "status closed" };
    if (diffDays <= 3) return { label: "Segera Dimulai", class: "status soon" };
    return { label: "Dibuka", class: "status open" };
  }

  const deleteCompetition = (id: number) => {
    if (!confirm("Yakin hapus lomba ini?")) return;
    setCompetitions((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <>
      <CreateCompetitionModal open={open} onClose={() => setOpen(false)} />
      <CompetitionParticipantsModal
        open={participantOpen}
        onClose={() => setParticipantOpen(false)}
        competitionTitle={selectedCompetition?.title}
        participants={selectedCompetition ? participantMap[selectedCompetition.id] || [] : []}
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

          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="">Semua Jenjang</option>
            <option value="SD">SD</option>
            <option value="SMP">SMP</option>
            <option value="SMA">SMA</option>
          </select>

          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Semua Kategori</option>
            <option value="Akademik">Akademik</option>
            <option value="Bahasa">Bahasa</option>
            <option value="Sains">Sains</option>
          </select>
        </div>

        {/* <div style={{ marginBottom: "10px" }}>
        <button className="btn primary" onClick={() => setOpen(true)}>
                + Tambah Lomba
            </button>
        </div> */}
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
            {paginated.map((c) => {
              const status = getCompetitionStatus(c.deadline);

              return (
                <tr key={c.id}>
                  <td>{c.title}</td>
                  <td>{c.category}</td>
                  <td>{c.level}</td>
                  <td>{c.deadline}</td>

                  <td>
                    <span className={status.class}>{status.label}</span>
                  </td>

                  {/* <td>{c.participants}</td> */}
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
                    <button onClick={() => setOpen(true)} className="btn small warning">
                      Edit
                    </button>
                    <button className="btn small danger" onClick={() => deleteCompetition(c.id)}>
                      Hapus
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
  <div></div>

  {totalPages > 1 ? (
    <Pagination
      page={page}
      totalPages={totalPages}
      onChange={setPage}
    />
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
