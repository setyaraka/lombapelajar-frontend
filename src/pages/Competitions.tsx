import Header from "../components/Header";
import CompetitionCard from "../components/CompetitionCard";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import { getCompetitions } from "../services/competition.service";
import { toCompetitionCardVM, type CompetitionCardVM } from "../mapper/competition.mapper";

export default function Competitions() {
  const [competitions, setCompetitions] = useState<CompetitionCardVM[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getCompetitions({ page: 0, perPage: 10 });
        setCompetitions(res.data.map(toCompetitionCardVM));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="competitions-page">
      <Header />

      <div className="container">
        <section className="competition-hero">
          <h1>Temukan & Ikuti Kompetisi Terbaikmu</h1>
          <p>Raih prestasi dan bangun portofolio sejak sekarang</p>
        </section>
        <div className="title">Pilih Lomba</div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid">
            {competitions.map((c) => (
              <CompetitionCard
                key={c.id}
                id={c.id}
                title={c.title}
                level={c.level}
                date={c.date}
                poster={c.poster}
                submitted={false}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
