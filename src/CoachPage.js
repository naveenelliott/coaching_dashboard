import { useParams, Link } from 'react-router-dom';
import CoachRadarChart from './CoachRadarChart';
import Papa from 'papaparse';
import React, { useEffect, useState } from 'react';
import CoachResume from './CoachResume';


const CoachPage = ({ rawData }) => {
  const { coachID } = useParams();

  const [percentileData, setPercentileData] = useState([]);

  useEffect(() => {
    Papa.parse(process.env.PUBLIC_URL + '/coach_percentile_rank_data.csv', {
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

  const radarColor = coachData[0]?.color || '#000';

  const [imageUrl, setImageUrl] = useState(process.env.PUBLIC_URL + '/default_photo.jpg');

  const [coachName, setCoachName] = useState('');

  useEffect(() => {
    if (coachData.length > 0) {
      setCoachName(coachData[0].Coach);
    }
  }, [coachData]);

  useEffect(() => {
    const extensions = ['jpg', 'jpeg', 'png', 'webp'];
    const formattedName = coachName?.replace(/\*/g, '').trim() || '';

    const tryLoadImage = async () => {
      for (let ext of extensions) {
        const imgPath = process.env.PUBLIC_URL + `/CBB Coaches/${formattedName}.${ext}`;
        console.log(`Trying to load image: ${imgPath}`);
        try {
          const res = await fetch(imgPath);
          if (
            res.ok &&
            res.headers.get('Content-Type')?.startsWith('image/')
          ) {
            console.log(`Found image: ${imgPath}`);
            setImageUrl(imgPath);
            return;
          } else {
            console.log(`Not found: ${imgPath}`);
          }
        } catch (e) {
          console.error(`Error loading image: ${imgPath}`, e);
        }
      }
      console.log('No image found — using default');
    };

    if (coachName) {
      (async () => {
        await tryLoadImage();
      })();
    }
  }, [coachName]);

  if (coachData.length === 0) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>Coach not found</h2>
        <Link to="/">← Back to Dashboard</Link>
      </div>
    );
  };

  const nbaPlayers = new Set(
    coachData.filter(row => parseInt(row.Actual_NBA) === 1).map(row => row.Name)
  ).size;

  // Get the most recent non-null, non-empty Team
  const recentTeamRow = [...coachData].reverse().find(row => row.Team && row.Team.trim() !== '');
  const teamRaw = recentTeamRow?.Team || 'Unknown';

  // Capitalize team name properly
  const schoolName = teamRaw
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  // School logo path
  const schoolLogo = process.env.PUBLIC_URL + `/Schools/${schoolName}.png`;

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

  let avgProbability = 0;

  const notablePlayersDev = coachData.filter(row =>
    parseFloat(row.NBA_Prob_Change || 0) >= 0.2 || parseInt(row.eventually_NBA || 0) === 1
  );

  const playerNames2 = [...new Set(notablePlayersDev.map(row => row.Name))];

  const formattedName = coachName?.replace(/\*/g, '').trim() || '';


  if (conferenceLevel === 'P5') {
    const relevant = coachData.filter(row => !isNaN(row.NBA_Probability));
    const total = relevant.reduce((sum, row) => sum + parseFloat(row.NBA_Probability || 0), 0);
    avgProbability = relevant.length ? total / relevant.length : 0;
  } else {
    const relevant = coachData.filter(row => !isNaN(row.High_Transfer));
    const total = relevant.reduce((sum, row) => sum + parseFloat(row.High_Transfer || 0), 0);
    avgProbability = relevant.length ? total / relevant.length : 0;
  }

  const transferToP5NamesForCoach = [
    ...new Set(
      coachData
        .filter(row => Number(row.Actual_Transfer) === 1)
        .map(row => row.Name)
        .filter(Boolean)
    )
  ];

  const nbaPlayerNamesForCoach = [
  ...new Set(
    coachData
      .filter(row => Number(row.Actual_NBA) === 1)
      .map(row => row.Name)
      .filter(Boolean)
  )
];


  console.log('Radar Row:', radarRow);

  return (
    <div style={{ padding: '3rem 5vw', fontFamily: 'Inter, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
        <img
          src={imageUrl}
          alt={coachName}
          onError={() => setImageUrl('/default_photo.jpg')}
          style={{ width: '200px', height: '200px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #ccc' }}
        />
        <img
          src={schoolLogo}
          alt={`${schoolName} logo`}
          onError={(e) => { e.target.style.display = 'none'; }}
          style={{ width: '80px', height: '80px', objectFit: 'contain', marginTop: '1rem' }}
        />
        <div>
          <h1 style={{ margin: 0, fontSize: '2.2rem' }}>{formattedName}</h1>
          <h3 style={{ margin: '0.5rem 0 0 0', color: radarColor }}>{schoolName}</h3>
        </div>
        <div style={{ width: '100%', textAlign: 'center', marginLeft: '1.5rem' }}>
          <div style={{ fontSize: '1.2rem', color: '#0e1111', marginBottom: '0.25rem' }}>
            {conferenceLevel === 'P5'
              ? 'Average Probability of Making it to the NBA:'
              : 'Average Probability of Transferring to P5 Team:'}
          </div>
          <div style={{ fontFamily: 'Karantina', fontSize: '7rem', lineHeight: '1', color: radarColor }}>
            {(avgProbability * 100).toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Resume + Radar Chart Side by Side */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem' }}>
        <div style={{ flex: 0.3 }}>
          <CoachResume
            coachID={coachID}
            conference={conference}
            conferenceLevel={conferenceLevel}
            nbaPlayers={nbaPlayerNamesForCoach}
            playerNames={playerNames}
            playerNames2={playerNames2}
            transferPlayers={transferToP5NamesForCoach}
          />
        </div>
        {radarRow && (
          <div style={{ flex: 1 }}>
            <CoachRadarChart coachRow={radarRow} coachColor={radarColor} />
          </div>
        )}
      </div>

      <div style={{
              marginTop: '1rem',
              border: '1px solid #ccc',
              borderRadius: '10px',
              padding: '1rem',
              background: '#f9f9f9',
              fontSize: '0.9rem',
              color: '#333'
            }}>
              <h3 style={{ marginTop: 0, textAlign: 'center' }}>Radar Chart Key</h3>
              <ul style={{ listStyle: 'none', paddingLeft: 0, lineHeight: 1.5 }}>
                <li><strong>Prob of NBA for 1st-Yrs</strong>: Percentile rank of average NBA chance for freshmen</li>
                <li><strong>Prob of Transfer for 1st-Yrs</strong>: Percentile rank of transfer likelihood for freshmen</li>
                <li><strong>Δ in Prob of NBA</strong>: Change in NBA probability under coach</li>
                {radarRow?.avg_high_transfer_prob_change_multi_year !== null && (
                  <>
                    <li><strong>Prob of Transfer to P5 for 1st-Yrs</strong>: Likelihood of freshman transferring to Power 5</li>
                    <li><strong>Δ in Prob of Transfer to P5</strong>: Change in that likelihood under coach</li>
                  </>
                )}
              </ul>
              
              <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>Additional Statistics</h4>
              <ul style={{ listStyle: 'none', paddingLeft: 0, lineHeight: 1.5 }}>
                <li><strong>Offensive Rating</strong>: Points scored per 100 possessions. The formula is 100 * (PTS / Poss)</li>
                <li><strong>Pace</strong>: An estimate of the number of possessions per team per 40 minutes. The formula is 40 * (Poss / (0.2 * Tm MP))</li>
                <li><strong>SRS</strong>: Simple Rating System; a rating that takes into account average point differential and strength of schedule. The rating is denominated in points above/below average, where zero is average. Non-Division I games are excluded from the ratings</li>
              </ul>
        </div>

      {/* Back Link */}
      <div style={{ marginTop: '3rem', textAlign: 'center' }}>
        <Link to="/" style={{ fontSize: '1rem', color: '#007acc' }}>
          ← Back to Dashboard
        </Link>
      </div>
    </div>
);
};


export default CoachPage;
