
import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

const CoachResume = ({ coachID, conference, conferenceLevel, nbaPlayers, playerNames, playerNames2 }) => {
  const [stats, setStats] = useState({
    winPct: null,
    totalWins: null,
    totalLosses: null,
    avgPace: null,
    avgOffRating: null,
    avgSRS: null,
  });
  
  const [rankings, setRankings] = useState({
    winPctRank: null,
    paceRank: null,
    offRatingRank: null,
    srsRank: null,
  });
  
  const [allCoachesData, setAllCoachesData] = useState([]);

  const isP5 = conferenceLevel === 'P5';

  const transferPlayers = (typeof props !== 'undefined' && props.transferPlayers) || [];
  const playersLabel = isP5 ? 'Players who\nmade NBA' : 'Players who\ntransferred to P5';
  const playersList  = isP5 ? (nbaPlayers || playerNames || []) : transferPlayers;

  useEffect(() => {
    Papa.parse(process.env.PUBLIC_URL + '/CbbTeamStats.csv', {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        console.log('CoachResume: Loaded CSV data, looking for coachID:', coachID);
        
        // Filter data for 2021 and later (transfer portal era)
        const transferPortalEraData = results.data.filter(row => 
          row.Season && parseInt(row.Season) >= 2021 && row.Coach_ID && row.Coach_ID.trim() !== ''
        );
        
        // Get data for this specific coach
        const coachData = transferPortalEraData.filter(row => String(row.Coach_ID) === String(coachID));
        console.log('CoachResume: Found', coachData.length, 'rows for coachID:', coachID);
        
        if (coachData.length === 0) {
          console.log('CoachResume: No data found for coachID:', coachID);
          return;
        }
        
        // Calculate stats for this coach
        const totalWins = coachData.reduce((sum, r) => sum + (r.W || 0), 0);
        const totalLosses = coachData.reduce((sum, r) => sum + (r.L || 0), 0);
        const winPct = totalWins / (totalWins + totalLosses);
        const avgPace = coachData.reduce((sum, r) => sum + (r.Pace || 0), 0) / coachData.length;
        const avgOffRating = coachData.reduce((sum, r) => sum + (r.ORtg || 0), 0) / coachData.length;
        const avgSRS = coachData.reduce((sum, r) => sum + (r.SRS || 0), 0) / coachData.length;
        
        console.log('CoachResume: Calculated stats:', { winPct, totalWins, totalLosses, avgPace, avgOffRating, avgSRS });
        setStats({ winPct, totalWins, totalLosses, avgPace, avgOffRating, avgSRS });
        
        // Calculate rankings among all coaches
        const coachStats = {};
        transferPortalEraData.forEach(row => {
          const coachId = row.Coach_ID;
          if (!coachStats[coachId]) {
            coachStats[coachId] = {
              wins: 0,
              losses: 0,
              pace: [],
              offRating: [],
              srs: []
            };
          }
          coachStats[coachId].wins += (row.W || 0);
          coachStats[coachId].losses += (row.L || 0);
          coachStats[coachId].pace.push(row.Pace || 0);
          coachStats[coachId].offRating.push(row.ORtg || 0);
          coachStats[coachId].srs.push(row.SRS || 0);
        });
        
        // Calculate averages and win percentages for all coaches
        const allCoachAverages = Object.entries(coachStats).map(([coachId, data]) => ({
          coachId,
          winPct: data.wins / (data.wins + data.losses),
          avgPace: data.pace.reduce((sum, p) => sum + p, 0) / data.pace.length,
          avgOffRating: data.offRating.reduce((sum, o) => sum + o, 0) / data.offRating.length,
          avgSRS: data.srs.reduce((sum, s) => sum + s, 0) / data.srs.length
        }));
        
        // Sort and find rankings
        const sortedByWinPct = [...allCoachAverages].sort((a, b) => b.winPct - a.winPct);
        const sortedByPace = [...allCoachAverages].sort((a, b) => b.avgPace - a.avgPace);
        const sortedByOffRating = [...allCoachAverages].sort((a, b) => b.avgOffRating - a.avgOffRating);
        const sortedBySRS = [...allCoachAverages].sort((a, b) => b.avgSRS - a.avgSRS);
        
        const winPctRank = sortedByWinPct.findIndex(coach => coach.coachId === coachID) + 1;
        const paceRank = sortedByPace.findIndex(coach => coach.coachId === coachID) + 1;
        const offRatingRank = sortedByOffRating.findIndex(coach => coach.coachId === coachID) + 1;
        const srsRank = sortedBySRS.findIndex(coach => coach.coachId === coachID) + 1;
        
        setRankings({ winPctRank, paceRank, offRatingRank, srsRank });
        setAllCoachesData(allCoachAverages);
      },
      error: (err) => console.error('Error loading CbbTeamStats.csv', err)
    });
  }, [coachID]);

  // Helper function to get color based on ranking
  const getRankColor = (rank, totalCoaches) => {
    if (!rank || !totalCoaches) return '#666';
    const percentile = rank / totalCoaches;
    if (percentile <= 0.1) return '#22c55e'; // Top 10% - Green
    if (percentile <= 0.25) return '#84cc16'; // Top 25% - Light Green
    if (percentile <= 0.5) return '#eab308'; // Top 50% - Yellow
    if (percentile <= 0.75) return '#f97316'; // Top 75% - Orange
    return '#ef4444'; // Bottom 25% - Red
  };

  // Helper function to format ranking text
  const formatRank = (rank, totalCoaches) => {
    if (!rank || !totalCoaches) return '';
    const suffix = rank === 1 ? 'st' : rank === 2 ? 'nd' : rank === 3 ? 'rd' : 'th';
    return `(${rank}${suffix} of ${totalCoaches})`;
  };

  if (stats.winPct === null) {
    return <div>Loading coach resume...</div>;
  }

  if (stats.winPct === 0 && stats.avgPace === 0 && stats.avgOffRating === 0 && stats.avgSRS === 0) {
    return (
      <div style={{ textAlign: 'left', minWidth: '250px' }}>
        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem', fontWeight: 'bold' }}>Coach Resume</h3>
        <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#666' }}>Stats since 2021 (Transfer Portal Era)</p>
        <p style={{ margin: '0.25rem 0', color: '#666' }}>No team stats available</p>
      </div>
    );
  }

  const totalCoaches = allCoachesData.length;

  return (
    <div style={{ 
      textAlign: 'left', 
      minWidth: '280px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '1rem',
      backgroundColor: '#f9fafb'
    }}>
      <h3 style={{ 
        margin: '0 0 0.25rem', 
        fontSize: '1.4rem', 
        fontWeight: 'bold',
        color: '#1f2937'
      }}>
        Coach Resume
      </h3>
      <h4 style={{ 
        margin: '0 0 1.5rem', 
        fontSize: '.9rem', 
        fontWeight: '500',
        color: '#1f2937'
      }}>
        <br />
        Conference: {conference}
      </h4>
      
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {/* Win % and Wins row */}
          <tr>
            <td style={{ 
              padding: '0.5rem 0.75rem', 
              borderBottom: '1px solid #e5e7eb',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>
              Win %
            </td>
            <td style={{ 
              padding: '0.5rem 0.75rem', 
              borderBottom: '1px solid #e5e7eb',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              color: getRankColor(rankings.winPctRank, totalCoaches)
            }}>
              {(stats.winPct * 100).toFixed(1)}%
              <span style={{ 
                fontSize: '0.8rem', 
                color: '#6b7280',
                marginLeft: '0.5rem'
              }}>
                {formatRank(rankings.winPctRank, totalCoaches)}
              </span>
            </td>
          </tr>
          
          {/* Offensive Rating and Pace row */}
          <tr>
            <td style={{ 
              padding: '0.5rem 0.75rem', 
              borderBottom: '1px solid #e5e7eb',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>
              Offensive Rating
            </td>
            <td style={{ 
              padding: '0.5rem 0.75rem', 
              borderBottom: '1px solid #e5e7eb',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              color: getRankColor(rankings.offRatingRank, totalCoaches)
            }}>
              {stats.avgOffRating.toFixed(1)}
              <span style={{ 
                fontSize: '0.8rem', 
                color: '#6b7280',
                marginLeft: '0.5rem'
              }}>
                {formatRank(rankings.offRatingRank, totalCoaches)}
              </span>
            </td>
          </tr>
          <tr>
            <td style={{ 
              padding: '0.5rem 0.75rem', 
              borderBottom: '1px solid #e5e7eb',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>
              Pace
            </td>
            <td style={{ 
              padding: '0.5rem 0.75rem', 
              borderBottom: '1px solid #e5e7eb',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              color: getRankColor(rankings.paceRank, totalCoaches)
            }}>
              {stats.avgPace.toFixed(1)}
              <span style={{ 
                fontSize: '0.8rem', 
                color: '#6b7280',
                marginLeft: '0.5rem'
              }}>
                {formatRank(rankings.paceRank, totalCoaches)}
              </span>
            </td>
          </tr>
          
          {/* SRS row */}
          <tr>
            <td style={{ 
              padding: '0.5rem 0.75rem', 
              fontSize: '0.9rem',
              fontWeight: '500',
              borderBottom: '1px solid #e5e7eb',
            }}>
              SRS
            </td>
            <td style={{ 
              padding: '0.5rem 0.75rem', 
              fontSize: '0.9rem',
              fontWeight: 'bold',
              color: getRankColor(rankings.srsRank, totalCoaches),
              borderBottom: '1px solid #e5e7eb',
            }}>
              {stats.avgSRS.toFixed(1)}
              <span style={{ 
                fontSize: '0.8rem', 
                color: '#6b7280',
                marginLeft: '0.5rem'
              }}>
                {formatRank(rankings.srsRank, totalCoaches)}
              </span>
            </td>
          </tr>

          {/* Players who made NBA row */}
          <tr>
            <td style={{
              padding: '0.5rem 0.75rem',
              fontSize: '0.9rem',
              fontWeight: '500',
              borderBottom: '1px solid #e5e7eb'
            }}>
              {playersLabel.split('\n').map((line, i) =>
                i ? <><br key={i} />{line}</> : <span key={i}>{line}</span>
              )}
            </td>
            <td style={{
              padding: '0.5rem 0.75rem',
              fontSize: '0.8rem',
              fontWeight: '500',
              maxWidth: '200px',
              whiteSpace: 'normal',
              wordWrap: 'break-word',
              color: '#6b7280',
              borderBottom: '1px solid #e5e7eb'
            }}>
              {playersList && playersList.length ? playersList.join(', ') : 'No players listed.'}
            </td>
          </tr>

        {/* Notable Players Developed */}
          <tr>
            <td style={{ 
              padding: '0.5rem 0.75rem', 
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>
              Notable Players
              <br />
              Developed
            </td>
            <td style={{ 
              padding: '0.5rem 0.75rem', 
              fontSize: '0.8rem',
              fontWeight: '500',
              maxWidth: '500px',
              whiteSpace: 'normal',
              wordWrap: 'break-word',
              color: '#6b7280',
            }}>
              <p>
                {playerNames2.length === 0
                  ? 'No players listed.'
                  : playerNames2.join(', ')}
              </p>
            </td>
          </tr>

        </tbody>
      </table>

      <br />
      <p style={{ 
        margin: '0 0 1rem', 
        fontSize: '0.9rem', 
        color: '#6b7280',
        fontStyle: 'italic'
      }}>
        Stats since 2021 (Transfer Portal Era)
      </p>

    </div>
  );
};

export default CoachResume;
