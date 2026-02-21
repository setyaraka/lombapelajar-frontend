import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ParticipantsTab from "../components/admin/ParticipantsTab";
import CompetitionsTab from "../components/admin/CompetitionsTab";

type Tab = "participants" | "competitions";

export default function AdminParticipants() {
  const [tab, setTab] = useState<Tab>("participants");

  return (
    <div className="admin-page">
      <Header />

      <div className="container">
        {/* TAB NAV */}
        <div className="admin-tabs">
          <button
            className={tab === "participants" ? "active" : ""}
            onClick={() => setTab("participants")}
          >
            Peserta
          </button>

          <button
            className={tab === "competitions" ? "active" : ""}
            onClick={() => setTab("competitions")}
          >
            Lomba
          </button>
        </div>

        {/* TAB CONTENT */}
        {tab === "participants" && <ParticipantsTab />}
        {tab === "competitions" && <CompetitionsTab />}
      </div>

      <Footer />
    </div>
  );
}
