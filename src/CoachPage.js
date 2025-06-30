import React from 'react';
import { useParams, Link } from 'react-router-dom';

const CoachPage = ({ rawData }) => {
  const { coachName } = useParams();

  const coachData = rawData.filter(row => row.Coach === coachName);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>{coachName}</h2>
      <p>Showing {coachData.length} players developed under this coach.</p>
      {/* Add tables, charts, or more analytics here */}
      <Link to="/">← Back to Dashboard</Link>
    </div>
  );
};

export default CoachPage;
