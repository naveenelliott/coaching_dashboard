import React from 'react';

function PlayerJumpTable({ topJumps, conferenceFilter }) {
  return (
    <div style={{ maxHeight: '400px', overflowY: 'scroll', marginTop: '2rem' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>Player</th>
            <th style={thStyle}>Coach</th>
            <th style={thStyle}>Season</th>
            <th style={thStyle}>Change Amount</th>
          </tr>
        </thead>
        <tbody>
          {topJumps.map((row, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #ccc' }}>
              <td style={tdStyle}>
                {row.Name}
                {parseInt(row.eventually_NBA) === 1 && (
                  <img
                    src="./nba_logo.png"
                    alt="NBA"
                    style={{ width: '30px', height: '30px', marginLeft: '8px', verticalAlign: 'middle' }}
                  />
                )}
              </td>
              <td style={tdStyle}>{row.Coach}</td>
              <td style={tdStyle}>{row.season}</td>
              <td style={tdStyle}>
                {(conferenceFilter === 'P5'
                  ? row.NBA_Prob_Change ?? 0
                  : row.Transfer_Prob_Change ?? 0
                ).toFixed(3)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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

export default PlayerJumpTable;
