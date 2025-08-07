import React from 'react';
import {
  Radar
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

// Register required components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const CoachRadarChart = ({ coachRow, coachColor = '#4F46E5' }) => {
  if (!coachRow) return null;

  const isP5 = coachRow.conference_level === 'P5';

  const getValue = (field) => {
    const val = coachRow[field];
    return typeof val === 'number' && !isNaN(val) ? Math.round(val) : 0;
  };

  const rawData = isP5
    ? [
        { label: 'Prob of NBA for 1st-Yrs', value: getValue('avg_NBA_Prob_first_year') },
        { label: 'Prob of Transfer for 1st-Yrs', value: getValue('avg_Transfer_Prob_first_year') },
        { label: 'Prob of NBA for Multi-Yrs', value: getValue('avg_NBA_Prob_multi_year') },
        { label: 'Δ in Prob of NBA for Multi-Yrs', value: getValue('avg_NBA_Prob_Change_multi_year') },
        { label: 'Prob of Transfer for Multi-Yrs', value: getValue('avg_Transfer_Prob_multi_year') },
      ]
    : [
        { label: 'Prob of NBA for 1st-Yrs', value: getValue('avg_NBA_Prob_first_year') },
        { label: 'Prob of Transfer to P5 for 1st-Yrs', value: getValue('avg_High_Transfer_first_year') },
        { label: 'Prob of NBA for Multi-Yrs', value: getValue('avg_NBA_Prob_multi_year') },
        { label: 'Δ in Prob of NBA for Multi-Yrs', value: getValue('avg_NBA_Prob_Change_multi_year') },
        { label: 'Prob of Transfer to P5 for Multi-Yrs', value: getValue('avg_High_Transfer_multi_year') },
        { label: 'Δ in Prob of Transfer to P5 for Multi-Yrs', value: getValue('avg_high_transfer_prob_change_multi_year') },
      ];

  const labels = rawData.map((d) => d.label);
  const values = rawData.map((d) => d.value);

  const data = {
    labels,
    datasets: [
      {
        label: coachRow.Coach || 'Coach',
        data: values,
        backgroundColor: `${coachColor}88`, // semi-transparent fill
        borderColor: coachColor,
        pointBackgroundColor: coachColor,
        pointBorderColor: '#fff',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        min: 0,
        max: 100,
        ticks: {
          backdropColor: 'transparent',
          color: '#6B7280',
          stepSize: 20,
          font: {
            size: 12,
          },
        },
        grid: {
          color: '#e5e7eb',
        },
        pointLabels: {
          font: {
            size: 11,
          },
          color: '#374151',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.raw}%`,
        },
      },
    },
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 700,
        margin: '2rem auto',
        padding: '1rem 1.5rem',
        border: '1px solid #e5e7eb',
        borderRadius: '0.75rem',
        background: '#ffffff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        fontFamily: 'sans-serif',
        height: '400px',
      }}
    >
      <h2 style={{ textAlign: 'center', marginBottom: 8 }}>
        {coachRow.Coach}
      </h2>
      <Radar data={data} options={options} />
    </div>
  );
};

export default CoachRadarChart;
