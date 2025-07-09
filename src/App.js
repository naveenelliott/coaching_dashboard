import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import CoachScatterPlot from './CoachScatterPlot';
import PlayerJumpTable from './PlayerJumpTable';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import CoachPage from './CoachPage';

function App() {
  const [rawData, setRawData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [seasonOptions, setSeasonOptions] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState('All');
  const [playerType, setPlayerType] = useState('oneYears');
  const [minTransferChange, setMinTransferChange] = useState(0);
  const [minNBAEntrants, setMinNBAEntrants] = useState(0);
  const [conferenceFilter, setConferenceFilter] = useState('P5');
  const [highlightCoach, setHighlightCoach] = useState('');
  useEffect(() => {
    document.title = "CBB Coach Dashboard";
  }, []);

  useEffect(() => {
    Papa.parse('/final_merged.csv', {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const rawRows = results.data.filter(row => row.Coach && !isNaN(row.NBA_Prob_Change));
        const teamToConference = {};
        rawRows.forEach(row => {
          if (row.teamId && row.conference_level && !teamToConference[row.teamId]) {
            teamToConference[row.teamId] = row.conference_level;
          }
        });
        const filledRows = rawRows.map(row => ({
          ...row,
          conference_level: row.conference_level || teamToConference[row.teamId] || 'Other'
        }));
        setRawData(filledRows);
        const seasons = Array.from(new Set(filledRows.map(row => row.season))).sort();
        setSeasonOptions(['All', ...seasons]);
      },
    });
  }, []);

  useEffect(() => {
    let filtered = rawData;
    if (selectedSeason !== 'All') {
      filtered = filtered.filter(row => String(row.season) === String(selectedSeason));
    }
    filtered = filtered.filter(row => row.conference_level === conferenceFilter);

    const coachStats = {};
    filtered.forEach((row) => {
      const coach = row.Coach;
      const coachID = row.Coach_ID;
      const nbaProb = parseFloat(row.NBA_Probability) || 0;
      const transferChange = parseFloat(row.Transfer_Prob_Change) || 0;
      const actualNBA = parseInt(row.Actual_NBA) || 0;
      const oneYear = parseInt(row.oneYears) === 1;

      if (!coachStats[coach]) {
        coachStats[coach] = {
          Coach: coach,
          coachID,
          oneYearProbs: [],
          multiYearProbs: [],
          transferChanges: [],
          actualNBAEntrants: 0,
        };
      }

      if ((playerType === 'oneYears' && oneYear) || (playerType === 'multiYears' && !oneYear)) {
        if (oneYear) coachStats[coach].oneYearProbs.push(nbaProb);
        else coachStats[coach].multiYearProbs.push(nbaProb);

        coachStats[coach].transferChanges.push(transferChange);
        coachStats[coach].actualNBAEntrants += actualNBA;

        const transferred = parseInt(row.Actual_Transfer) || 0;
        coachStats[coach].transferEntrants = (coachStats[coach].transferEntrants || 0) + transferred;
      }
    });

    const aggregated = Object.values(coachStats)
      .map(coach => {
        const avgOneYear = coach.oneYearProbs.length
          ? coach.oneYearProbs.reduce((a, b) => a + b, 0) / coach.oneYearProbs.length
          : 0;
        const avgMultiYear = coach.multiYearProbs.length
          ? coach.multiYearProbs.reduce((a, b) => a + b, 0) / coach.multiYearProbs.length
          : 0;
        const avgTransfer = coach.transferChanges.length
          ? coach.transferChanges.reduce((a, b) => a + b, 0) / coach.transferChanges.length
          : 0;

        return {
          Coach: coach.Coach,
          coachID: coach.coachID,
          Avg_NBA_Prob_OneYear: avgOneYear,
          Avg_NBA_Prob_MultiYear: avgMultiYear,
          Avg_Transfer_Prob_Change: avgTransfer,
          NBA_Entrants: coach.actualNBAEntrants,
          Transfer_Entrants: coach.transferEntrants || 0,
        };
      })
      .filter(coach =>
        coach.Avg_Transfer_Prob_Change >= minTransferChange &&
        coach.NBA_Entrants >= minNBAEntrants
      );

    setFilteredData(aggregated);
  }, [rawData, selectedSeason, playerType, minTransferChange, minNBAEntrants, conferenceFilter]);

  const topJumps = [...rawData]
    .filter(row => {
      const oneYear = parseInt(row.oneYears) === 1;
      const matchesPlayerType = (playerType === 'oneYears' && oneYear) || (playerType === 'multiYears' && !oneYear);
      const matchesConference = row.conference_level === conferenceFilter;
      const matchesSeason = selectedSeason === 'All' || String(row.season) === String(selectedSeason);

      if (!matchesPlayerType || !matchesConference || !matchesSeason) return false;

      return conferenceFilter === 'P5'
        ? !isNaN(row.NBA_Prob_Change)
        : !isNaN(row.Transfer_Prob_Change);
    })
    .sort((a, b) => {
      const metricA = conferenceFilter === 'P5' ? a.NBA_Prob_Change : a.Transfer_Prob_Change;
      const metricB = conferenceFilter === 'P5' ? b.NBA_Prob_Change : b.Transfer_Prob_Change;
      return metricB - metricA;
    })
    .slice(0, 100);

    const uniqueJumps = Array.from(
        new Map(topJumps.map(row => [row.Name, row])).values()
    );

  return (
    <Routes>
      <Route path="/" element={
        <div className="App">
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center', fontFamily: 'Merriweather, serif'  }}>
            College Basketball Coach Dashboard
          </h1>

          <div className="filters-container">
            <div className="filter-box">
              <label>Season:</label>
              <select value={selectedSeason} onChange={e => setSelectedSeason(e.target.value)}>
                {seasonOptions.map(season => (
                  <option key={season} value={season}>{season}</option>
                ))}
              </select>
            </div>
            <div className="filter-box">
              <label>Conference Level:</label>
              <select value={conferenceFilter} onChange={e => setConferenceFilter(e.target.value)}>
                <option value="P5">P5</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="filter-box">
              <label>Player Type:</label>
              <select value={playerType} onChange={e => setPlayerType(e.target.value)}>
                <option value="oneYears">One-Year Players</option>
                <option value="multiYears">Multi-Year Players</option>
              </select>
            </div>
            <div className="filter-box">
              <label>Highlight Coach:</label>
              <input
                list="coach-list"
                type="text"
                value={highlightCoach}
                onChange={(e) => setHighlightCoach(e.target.value)}
                placeholder="Start typing coach name"
              />
              <datalist id="coach-list">
                {Array.from(new Set(rawData.map(row => row.Coach)))
                  .sort()
                  .map((coach, i) => (
                    <option key={i} value={coach} />
                  ))}
              </datalist>
            </div>
          </div>

          <div className="visualizations">
            <div>
              <CoachScatterPlot
                data={filteredData}
                xField="NBA_Entrants"
                yField={playerType === 'oneYears' ? 'Avg_NBA_Prob_OneYear' : 'Avg_NBA_Prob_MultiYear'}
                xLabel="# of NBA Entrants"
                yLabel="Avg NBA Probability Change"
                title="NBA Development by Coach"
                highlightCoach={highlightCoach}
              />
              {conferenceFilter === 'Other' && (
                <div style={{ marginTop: '2rem' }}>
                  <CoachScatterPlot
                    data={filteredData}
                    xField="Transfer_Entrants"
                    yField="Avg_Transfer_Prob_Change"
                    xLabel="# of Players Transferred to P5"
                    yLabel="Avg Transfer-to-P5 Probability"
                    title="Transfers to P5 by Coach"
                    highlightCoach={highlightCoach}
                  />
                </div>
              )}
            </div>

            <div>
              <h2 style={{
                fontSize: '1.4rem',
                fontWeight: 500,
                margin: '1.0rem 0 1rem',
                textAlign: 'center'
              }}>
                Top Player Jumps – {conferenceFilter === 'P5' ? 'NBA Probability' : 'Transfer to P5'}
              </h2>


              <PlayerJumpTable topJumps={uniqueJumps} conferenceFilter={conferenceFilter} />
            </div>
          </div>
        </div>
      }
      />
      <Route path="/coach/:coachID" element={<CoachPage rawData={rawData} />} />
    </Routes>
  );
}

export default App;