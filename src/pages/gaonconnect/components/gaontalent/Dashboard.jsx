import React, { useEffect, useState } from "react";
import {
  getAllCompetitions,
  getEntriesByCategory
} from "../../services/gaonTalentService";

export default function Dashboard() {

  const [totalCompetitions, setTotalCompetitions] = useState(0);
  const [activeCompetitions, setActiveCompetitions] = useState(0);
  const [closedCompetitions, setClosedCompetitions] = useState(0);

  const [totalParticipants, setTotalParticipants] = useState(0);
  const [totalWinners, setTotalWinners] = useState(0);

  useEffect(() => {
    loadSummary();
  }, []);

  // FIX DATE PARSING FOR SPRING BOOT LocalDateTime
  const parseDate = (dt) => new Date(dt.replace(" ", "T"));

  const loadSummary = async () => {
    const comp = await getAllCompetitions();
    const competitions = comp.data;

    const now = new Date();

    let active = 0;
    let closed = 0;

    competitions.forEach((c) => {
      if (!c.startDate || !c.endDate) return;

      const start = parseDate(c.startDate);
      const end = parseDate(c.endDate);

      if (now >= start && now <= end) {
        active++;
      } else if (now > end) {
        closed++;
      }
    });

    setTotalCompetitions(competitions.length);
    setActiveCompetitions(active);
    setClosedCompetitions(closed);

    // LOAD PARTICIPANTS CATEGORY-WISE
    const categories = [
      "ART",
      "DANCING",
      "PUBLIC_SPEAKING",
      "SINGING",
      "ENTERTAINMENT"
    ];

    let participants = [];

    for (let cat of categories) {
      const res = await getEntriesByCategory(cat);
      participants = [...participants, ...res.data];
    }

    const winners = participants.filter((p) => p.winner);

    setTotalParticipants(participants.length);
    setTotalWinners(winners.length);
  };

  return (
    <div className="summary-grid">

      <div className="summary-card">
        <h4>Total Competitions</h4>
        <h2>{totalCompetitions}</h2>
      </div>

      <div className="summary-card" >
        <h4>Active Competitions</h4>
        <h2>{activeCompetitions}</h2>
      </div>

      <div className="summary-card" >
        <h4>Closed Competitions</h4>
        <h2>{closedCompetitions}</h2>
      </div>

      <div className="summary-card">
        <h4>Total Participants</h4>
        <h2>{totalParticipants}</h2>
      </div>

      <div className="summary-card">
        <h4>Total Winners</h4>
        <h2>{totalWinners}</h2>
      </div>

    </div>
  );
}
