import { useMemo, useState } from "react";
import CreateCompetitionModal from "./CreateCompetitionModal";

type Competition = {
  id: number;
  title: string;
  category: string;
  level: string;
  participants: number;
};

const competitions: Competition[] = [
  { id: 1, title: "Olimpiade Matematika", category: "Akademik", level: "SD", participants: 120 },
  { id: 2, title: "English Contest", category: "Bahasa", level: "SMP", participants: 80 },
  { id: 3, title: "Science Fair", category: "Sains", level: "SMA", participants: 45 },
];

export default function CompetitionsTab() {
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    return competitions.filter((c) => {
      const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());

      const matchLevel = level ? c.level === level : true;
      const matchCategory = category ? c.category === category : true;

      return matchSearch && matchLevel && matchCategory;
    });
  }, [search, level, category]);

  return (
    <>
      <CreateCompetitionModal open={open} onClose={() => setOpen(false)} />
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
              onChange={(e) => setSearch(e.target.value)}
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
              <th>Total Peserta</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td>{c.title}</td>
                <td>{c.category}</td>
                <td>{c.level}</td>
                <td>{c.participants}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
