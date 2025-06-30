import React from 'react';
import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

ChartJS.register(PointElement, LinearScale, Title, Tooltip, Legend, annotationPlugin);

function CoachScatterPlot({ data, xField = 'NBA_Entrants', yField = 'Avg_Prob_Change', xLabel, yLabel, title, highlightCoach }) {
  if (data.length === 0) return <p>No data available.</p>;

  const avgX = data.reduce((sum, d) => sum + (d[xField] || 0), 0) / data.length;
  const avgY = data.reduce((sum, d) => sum + (d[yField] || 0), 0) / data.length;

  const chartData = {
    datasets: [
      {
        label: 'Coaches',
        data: data.map((c) => ({
          x: c[xField],
          y: c[yField],
          coach: c.Coach,
        })),
        backgroundColor: data.map(c =>
          highlightCoach && c.Coach.toLowerCase().includes(highlightCoach.toLowerCase())
            ? 'red'
            : 'rgba(75, 192, 192, 0.6)'
        ),
        pointRadius: data.map(c =>
          highlightCoach && c.Coach.toLowerCase().includes(highlightCoach.toLowerCase())
            ? 8
            : 5
        ),
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const point = ctx.raw;
            return `${point.coach}: ${xLabel} = ${point.x}, ${yLabel} = ${point.y?.toFixed(3)}`;
          },
        },
      },
      legend: {
        display: false,
      },
      title: {
        display: !!title,
        text: title,
      },
      annotation: {
        annotations: {
          xLine: {
            type: 'line',
            xMin: avgX,
            xMax: avgX,
            borderColor: 'black',
            borderWidth: 2
          },
          yLine: {
            type: 'line',
            yMin: avgY,
            yMax: avgY,
            borderColor: 'black',
            borderWidth: 2
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: xLabel,
        },
        grid: {
          display: false,
        },
      },
      y: {
        title: {
          display: true,
          text: yLabel,
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return <Scatter data={chartData} options={options} />;
}

export default CoachScatterPlot;
