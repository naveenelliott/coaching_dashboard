import React from 'react';
import { Link } from 'react-router-dom';

const CoachProbabilityTable = ({ coachData, conferenceFilter }) => {

  const toTitleCase = (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div style={{ maxHeight: '400px', overflowY: 'scroll', marginTop: '2rem' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>Coach</th>
            <th style={thStyle}>Team</th>
            <th style={thStyle}>
              {conferenceFilter === 'P5' ? 'Avg NBA Probability' : 'Avg Transfer to P5 Probability'}
            </th>
          </tr>
        </thead>
        <tbody>
          {coachData.map((coach, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #ccc' }}>
              <td style={tdStyle}>
                <Link 
                  to={`/coach/${coach.coachID}`}
                  style={{ color: '#007acc', textDecoration: 'none' }}
                >
                  {coach.Coach}
                </Link>
              </td>
              <td style={tdStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <img
                    src={`/Schools/${toTitleCase(coach.Team)}.png`}
                    alt={`${toTitleCase(coach.Team)} logo`}
                    onError={(e) => {
                      // if .png fails, try .jpg
                      if (e.target.src.endsWith(".png")) {
                        e.target.src = `/Schools/${toTitleCase(coach.Team)}.jpg`;
                      }
                      else if (e.target.src.endsWith(".jpg")) {
                        e.target.src = `/Schools/${toTitleCase(coach.Team)}.webp`;
                      } else {
                        e.target.style.display = "none"; // hide if jpg also missing
                      }
                    }}
                    style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                  />
                  {toTitleCase(coach.Team)}
                </div>
              </td>
              <td style={tdStyle}>
                {conferenceFilter === 'P5' 
                  ? `${(coach.Avg_NBA_Prob_OneYear * 100).toFixed(1)}%`
                  : `${(coach.Avg_Transfer_Prob_Change * 100).toFixed(1)}%`
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const thStyle = {
  backgroundColor: '#f0f0f0',
  padding: '0.75rem',
  textAlign: 'left',
  position: 'sticky',
  top: 0,
  zIndex: 1,
};

const tdStyle = {
  padding: '0.75rem',
};

export default CoachProbabilityTable; 