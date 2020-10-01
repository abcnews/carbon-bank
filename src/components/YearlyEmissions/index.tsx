import React from 'react';
import styles from './styles.scss';
import { scaleLinear } from 'd3-scale';
import { EmissionsData } from '../../common.d';
import useDimensions from 'react-cool-dimensions';
import { AxisBottom, AxisLeft } from '@visx/axis';

type Margins = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type EmissionsSeries = {
  data: EmissionsData;
  meta: {
    color: string;
  };
};

interface YearlyEmissionsProps {
  series: EmissionsSeries[];
  xAxisExtent: [number, number];
}

const height: number = 100;
const margins: Margins = {
  top: 10,
  right: 30,
  bottom: 25,
  left: 30
};
const tickSize = 6;
const xAxisLabelWidth: number = 60;

const YearlyEmissions: React.FC<YearlyEmissionsProps> = ({ series, xAxisExtent }) => {
  const { ref, width, height } = useDimensions<HTMLDivElement>();

  const xScale = scaleLinear()
    .domain(xAxisExtent)
    .range([0, width - margins.right - margins.left]);

  const yScale = scaleLinear()
    .domain([0, 36153261645])
    .range([height - margins.top - margins.bottom, 0]);

  const barWidth = (xScale(1) - xScale(0)) / 2;

  const labels = [
    {
      text: '2017',
      x: xScale(2017),
      y: yScale(series[0].data.find(d => d.year === 2017)?.emissions || 0)
    }
  ];

  return (
    <div ref={ref} className={styles.root}>
      <div
        style={{
          position: 'absolute',
          width: `${width}px`,
          height: `${height}px`,
          top: `${margins.top}px`,
          left: `${margins.left}px`
        }}
      >
        {labels.map(({ text, x, y }, i) => (
          <div
            className={styles.label}
            key={`label-${i}`}
            style={{ position: 'absolute', top: `${y}px`, left: `${x}px` }}
          >
            {text}
          </div>
        ))}
      </div>
      <svg width={width} height={height}>
        <g transform={`translate(${margins.left} ${margins.top})`}>
          {series.map(({ data, meta }, i) => (
            <g key={i}>
              {data.map((d, i) => (
                <rect
                  key={d.year}
                  className={styles.column}
                  stroke="#fff"
                  strokeWidth="0"
                  fill={meta.color}
                  style={{ transform: `translate(${xScale(d.year) - barWidth / 2}px, 0)` }}
                  width={barWidth}
                  y={yScale(d.emissions)}
                  height={height - margins.top - margins.bottom - yScale(d.emissions)}
                  data-year={d.year}
                />
              ))}
            </g>
          ))}
        </g>
        <g transform={`translate(${margins.left} ${height - margins.bottom})`}>
          <AxisBottom scale={xScale} tickFormat={val => String(val)} />
        </g>
        <g transform={`translate(${margins.left} ${margins.top})`}>
          <AxisLeft scale={yScale} />
        </g>
      </svg>
    </div>
  );
};

export default YearlyEmissions;
