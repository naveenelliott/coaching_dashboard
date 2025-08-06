import { ResponsiveRadar } from '@nivo/radar';

const CoachRadarChart = ({ coachRow, coachColor }) => {
  if (!coachRow) return null;

  const isP5 = coachRow.conference_level === 'P5';

  const getValue = (field) => {
    const val = coachRow[field];
    return typeof val === 'number' && !isNaN(val) ? val : 0;
  };

  const rawData = isP5
    ? [
        { metric: 'Prob of NBA for 1st-Yrs', value: Math.round(getValue('avg_NBA_Prob_first_year')) },
        { metric: 'Prob of Transfer for 1st-Yrs', value: Math.round(getValue('avg_Transfer_Prob_first_year')) },
        { metric: 'Prob of NBA for Multi-Yrs', value: Math.round(getValue('avg_NBA_Prob_multi_year')) },
        { metric: 'Δ in Prob of NBA for Multi-Yrs', value: Math.round(getValue('avg_NBA_Prob_Change_multi_year')) },
        { metric: 'Prob of Transfer for Multi-Yrs', value: Math.round(getValue('avg_Transfer_Prob_multi_year')) },
      ]
    : [
        { metric: 'Prob of NBA for 1st-Yrs', value: Math.round(getValue('avg_NBA_Prob_first_year')) },
        { metric: 'Prob of Transfer to P5 for 1st-Yrs', value: Math.round(getValue('avg_High_Transfer_first_year')) },
        { metric: 'Prob of NBA for Multi-Yrs', value: Math.round(getValue('avg_NBA_Prob_multi_year')) },
        { metric: 'Δ in Prob of NBA for Multi-Yrs', value: Math.round(getValue('avg_NBA_Prob_Change_multi_year')) },
        { metric: 'Prob of Transfer to P5 for Multi-Yrs', value: Math.round(getValue('avg_High_Transfer_multi_year')) },
        { metric: 'Δ in Prob of Transfer to P5 for Multi-Yrs', value: Math.round(getValue('avg_high_transfer_prob_change_multi_year')) },
      ];

  const data = rawData.map(d => ({ metric: d.metric, Coach: d.value }));

  return (
    <div style={{ height: '400px', maxWidth: '100%', marginTop: '1rem' }}>
        <ResponsiveRadar
            data={data}
            keys={['Coach']}
            indexBy="metric"
            maxValue={100}
            margin={{ top: 40, right: 60, bottom: 50, left: 60 }}
            curve="linearClosed"
            borderWidth={2}
            borderColor={{ from: 'color' }}
            gridLevels={5} // number of rings
            gridShape="circular"
            gridLabelOffset={30}
            enableDots={true}
            dotSize={10}
            dotColor={{ from: 'color' }} // filled dots
            dotBorderWidth={2}
            dotBorderColor={{ from: 'color' }}
            colors={[coachColor]}
            fillOpacity={0.6}
            blendMode="multiply"
            animate={true}
            isInteractive={true}
            enableDotLabel={true}
            dotLabel="value"
            dotLabelYOffset={-12}
            // ✅ theme config to ensure ticks + labels are visible
            theme={{
                grid: {
                line: {
                    stroke: '#ccc',
                    strokeWidth: 1,
                },
                },
                axis: {
                domain: {
                    line: {
                    stroke: '#888',
                    strokeWidth: 1,
                    },
                },
                ticks: {
                    line: {
                    stroke: '#888',
                    strokeWidth: 1,
                    },
                    text: {
                      fontSize: window.innerWidth < 600 ? 10 : 12,
                      fill: '#333',
                    },
                },
                },
                tooltip: {
                container: {
                    background: '#fff',
                    color: '#333',
                    fontSize: 13,
                },
                },
                  labels: {
                    text: {
                      fill: coachColor,
                      fontSize: window.innerWidth < 600 ? 10 : 12,
                    },
                  },
            }}
            />
    </div>
  );
};
export default CoachRadarChart;