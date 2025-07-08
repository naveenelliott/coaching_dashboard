import { useParams, Link } from 'react-router-dom';
import CoachRadarChart from './CoachRadarChart';
import Papa from 'papaparse';
import React, { useEffect, useState } from 'react';


const CoachPage = ({ rawData }) => {
  const { coachID } = useParams();
  const [percentileData, setPercentileData] = useState([]);

  useEffect(() => {
    Papa.parse('/coach_percentile_rank_data.csv', {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        setPercentileData(results.data);
      },
    });
  }, []);

  const coachData = rawData.filter(row => row.Coach_ID === coachID);
  const radarRow = percentileData.find(row => row.Coach_ID === coachID);

  if (coachData.length === 0) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>Coach not found</h2>
        <Link to="/">← Back to Dashboard</Link>
      </div>
    );
  }

  const coachName = coachData[0].Coach;
  const nbaPlayers = coachData.filter(row => parseInt(row.Actual_NBA) === 1).length;

  // Get the most recent non-null, non-empty Team
  const recentTeamRow = [...coachData].reverse().find(row => row.Team && row.Team.trim() !== '');
  const teamRaw = recentTeamRow?.Team || 'Unknown';

  // Capitalize team name properly
  const schoolName = teamRaw
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  // Get current conference level from most recent row
  const conferenceLevel = recentTeamRow?.conference_level || 'Other';

  const conference = recentTeamRow?.conference || 'Other';

  // NBA players (P5) or D1 transfers (Other)
  const notablePlayers = coachData.filter(row =>
    conferenceLevel === 'P5'
      ? parseInt(row.Actual_NBA) === 1
      : parseInt(row.Actual_Transfer) === 1
  );

  // Get unique player names
  const playerNames = [...new Set(notablePlayers.map(row => row.Name))];

  const imageUrl = `/default_photo.jpg`;

  let avgProbability = 0;

  const notablePlayersDev = coachData.filter(row =>
    parseFloat(row.NBA_Prob_Change || 0) >= 0.2 || parseInt(row.eventually_NBA || 0) === 1
  );

  const playerNames2 = [...new Set(notablePlayersDev.map(row => row.Name))];


  if (conferenceLevel === 'P5') {
    const relevant = coachData.filter(row => !isNaN(row.NBA_Probability));
    const total = relevant.reduce((sum, row) => sum + parseFloat(row.NBA_Probability || 0), 0);
    avgProbability = relevant.length ? total / relevant.length : 0;
  } else {
    const relevant = coachData.filter(row => !isNaN(row.High_Transfer));
    const total = relevant.reduce((sum, row) => sum + parseFloat(row.High_Transfer || 0), 0);
    avgProbability = relevant.length ? total / relevant.length : 0;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem' }}>
        {/* Left: photo, coach name, school, player count */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img
              src={imageUrl}
              alt={coachName}
              style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '6px' }}
            />
            <div>
              <h2 style={{ margin: 0 }}>{coachName}</h2>
              <h4 style={{ margin: '0.5rem 0 0 0' }}><strong>School:</strong> {schoolName}</h4>
            </div>

            <div style={{ marginLeft: 'auto' }}>
              <h3 style={{ margin: 5 }}>
                <strong>
                  {conferenceLevel === 'P5'
                    ? 'Average Probability of Making it to the NBA:'
                    : 'Average Probability of Transferring to P5 Team:'}
                </strong>{' '}
                {(avgProbability * 100).toFixed(2)}%
              </h3>
            </div>
          </div>


          <div style={{ marginTop: '1.5rem' }}>
            <p style={{ marginTop: '0.25rem' }}><strong>Conference:</strong> {conference}</p>
            <p style={{ marginTop: '0.25rem' }}><strong>Players who made the NBA:</strong> {nbaPlayers}</p>
            <strong>{conferenceLevel === 'P5' ? 'Players Sent to NBA' : 'Players Transferred to D1'}</strong>
            {playerNames.length === 0 ? (
              <p style={{ margin: '0.5rem 0' }}>No players listed.</p>
            ) : (
              <ul style={{ paddingLeft: 0, listStyle: 'none', marginTop: '0.5rem' }}>
                {playerNames.map((name, index) => (
                  <li key={index}>{name}</li>
                ))}
              </ul>
            )}
          </div>
          <strong>Notable Players Developed</strong>
              {playerNames2.length === 0 ? (
                <p style={{ margin: '0.5rem 0' }}>No players listed.</p>
              ) : (
                <ul style={{ paddingLeft: 0, listStyle: 'none', marginTop: '0.5rem' }}>
                  {playerNames2.map((name, index) => (
                    <li key={index}>{name}</li>
                  ))}
                </ul>
              )}
        </div>
      </div>

      {radarRow && (
        <div style={{ marginTop: '2rem' }}>
          <CoachRadarChart coachRow={radarRow} />
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <Link to="/">← Back to Dashboard</Link>
      </div>
    </div>
  );
};

export default CoachPage;
