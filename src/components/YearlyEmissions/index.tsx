import React from 'react';
import styles from './styles.scss';
import { line, area } from 'd3-shape';
import { scaleLinear, scaleBand } from 'd3-scale';
import { ticks } from 'd3-array';
import { max } from '../../utils';
import { Data } from '../../common.d';
import useDimensions from 'react-cool-dimensions';
import Columns from '../Columns';

type Margins = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

interface YearlyEmissionsProps {
  data: Data;
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

const YearlyEmissions: React.FC<YearlyEmissionsProps> = ({ data, xAxisExtent }) => {
  const { ref, width, height } = useDimensions<HTMLDivElement>();
  const xScale = scaleLinear()
    .domain([xAxisExtent[0], xAxisExtent[1]])
    .range([0, width - margins.right - margins.left]);

  const xTicks = ticks(
    xAxisExtent[0],
    xAxisExtent[1],
    Math.floor((width - margins.right - margins.left) / xAxisLabelWidth)
  );

  const yScale = scaleLinear()
    .range([height - margins.top - margins.bottom, 0])
    .domain([0, max(data, d => d.emissions)]);

  const barWidth = (xScale(1) - xScale(0)) / 2;

  return (
    <div ref={ref} className={styles.root}>
      <svg width={width} height={height}>
        <g transform={`translate(${margins.left} ${margins.top})`}>
          {data.map((d, i) => (
            <rect
              key={d.year}
              className={styles.column}
              stroke="#fff"
              strokeWidth="0"
              fill="#000"
              style={{ transform: `translate(${xScale(d.year)}px, 0)` }}
              width={barWidth}
              y={yScale(d.emissions)}
              height={height - margins.top - margins.bottom - yScale(d.emissions)}
              data-year={d.year}
            />
          ))}
        </g>
        <g>
          <line
            x1={xScale(xScale.domain()[0])}
            x2={xScale(xScale.domain()[1])}
            y1={height - margins.bottom}
            y2={height - margins.bottom}
            stroke="currentColor"
          />
          <g className={styles.ticks}>
            {xTicks.map(tick => (
              <g key={tick} className={styles.tick} style={{ transform: `translate(${xScale(tick)}px,0)` }}>
                <line y1={height - margins.bottom} y2={height - margins.bottom + tickSize} stroke="currentColor" />
                <text dy={20} textAnchor="middle" y={height - margins.bottom}>
                  {tick}
                </text>
              </g>
            ))}
          </g>
        </g>

        {/* <Columns data={data} xScale={xScale} yScale={yScale} /> */}
      </svg>
    </div>
  );
};

export default YearlyEmissions;
