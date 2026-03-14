import Header from "../components/Header";
import CompetitionCard from "../components/CompetitionCard";
import Footer from "../components/Footer";
import Pagination from "../components/Pagination";
import RowsPerPage from "../components/RowsPerPage";

import { useEffect, useState } from "react";
import { getCompetitions } from "../services/competition.service";
import { toCompetitionCardVM, type CompetitionCardVM } from "../mapper/competition.mapper";
import CreateCompetitionModal from "../components/admin/CreateCompetitionModal";

export default function Competitions() {
  const [competitions, setCompetitions] = useState<CompetitionCardVM[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [onlyMine, setOnlyMine] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string | null>(null);

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedCompetitionId(null);
  };

  const handleModalSuccess = async () => {
    try {
      const res = await getCompetitions({
        page: 0,
        perPage,
      });

      setLoading(true);
      setPage(1);
      setCompetitions(res.data.map(toCompetitionCardVM));
      setTotalPages(res.totalPages ?? 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const res = await getCompetitions({
          page: page - 1,
          perPage,
          joined: onlyMine,
        });

        setCompetitions(res.data.map(toCompetitionCardVM));
        setTotalPages(res.totalPages ?? 1);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [page, perPage, onlyMine]);

  return (
    <div className="competitions-page">
      <CreateCompetitionModal
        open={modalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        competitionId={selectedCompetitionId}
      />
      <Header />

      <div className="container">
        <section className="competition-hero">
          <h1>Temukan & Ikuti Kompetisi Terbaikmu</h1>
          <p>Raih prestasi dan bangun portofolio sejak sekarang</p>
        </section>

        <div className="title-row">
          <div className="title">Pilih Lomba</div>

          <label className="mine-toggle">
            <input
              type="checkbox"
              checked={onlyMine}
              onChange={(e) => {
                setOnlyMine(e.target.checked);
                setPage(1);
              }}
            />
            Lomba yang saya ikuti
          </label>
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : competitions.length === 0 ? (
          <div className="empty">Tidak ada lomba ditemukan</div>
        ) : (
          <>
            <div className="grid">
              {competitions.map((c) => (
                <CompetitionCard
                  key={c.id}
                  id={c.id}
                  title={c.title}
                  level={c.level}
                  date={c.date}
                  poster={c.poster}
                  submitted={c.submitted}
                  onEdit={() => {
                    setSelectedCompetitionId(c.id);
                    setModalOpen(true);
                  }}
                />
              ))}
            </div>

            <div className="list-footer" style={{ marginTop: "25px" }}>
              <div></div>

              {totalPages > 1 ? (
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              ) : (
                <div></div>
              )}

              <RowsPerPage
                value={perPage}
                onChange={(v) => {
                  setPerPage(v);
                  setPage(1);
                }}
              />
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
