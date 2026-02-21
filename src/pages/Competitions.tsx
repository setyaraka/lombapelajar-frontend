import Header from "../components/Header";
import CompetitionCard from "../components/CompetitionCard";

const competitions = [
  {
    id: "olimpiade-mtk",
    title: "Olimpiade Matematika Nasional",
    level: "SD - SMP",
    date: "20 Maret 2026",
    poster: "https://api.lombahub.com/posts/image/df78150c-e5f3-4351-b2f8-478fa2e5c9d8.jpeg"
  },
  {
    id: "ipa",
    title: "Olimpiade IPA Nasional",
    level: "SMP - SMA",
    date: "25 Maret 2026",
    poster: "https://yayorin.com/wp-content/uploads/2025/04/lomba-poster.png"
  },
  {
    id: "english",
    title: "English Competition",
    level: "SD - SMA",
    date: "1 April 2026",
    poster: "https://d1csarkz8obe9u.cloudfront.net/posterpreviews/blue-programming-competition-custom-template-design-01efe9889793f251eab8080aa652010e_screen.jpg"
  },
  {
    id: "olimpiade-mtk",
    title: "Olimpiade Matematika Nasional",
    level: "SD - SMP",
    date: "20 Maret 2026",
    poster: "https://api.lombahub.com/posts/image/df78150c-e5f3-4351-b2f8-478fa2e5c9d8.jpeg"
  },
  {
    id: "ipa",
    title: "Olimpiade IPA Nasional",
    level: "SMP - SMA",
    date: "25 Maret 2026",
    poster: "https://yayorin.com/wp-content/uploads/2025/04/lomba-poster.png"
  },
  {
    id: "english",
    title: "English Competition",
    level: "SD - SMA",
    date: "1 April 2026",
    poster: "https://d1csarkz8obe9u.cloudfront.net/posterpreviews/blue-programming-competition-custom-template-design-01efe9889793f251eab8080aa652010e_screen.jpg"
  },
];

export default function Competitions() {
  return (
    <div className="competitions-page">
      <Header />

      <div className="container">
        <div className="title">Pilih Lomba</div>

        <div className="grid">
          {competitions.map((c) => (
            <CompetitionCard key={c.id} {...c} />
          ))}
        </div>
      </div>

      <footer>
        <p>© 2026 Platform Lomba Pelajar</p>
      </footer>
    </div>
  );
}