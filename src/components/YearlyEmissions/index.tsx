import React from 'react';
import styles from './styles.scss';
import { ScaleLinear, scaleLinear } from 'd3-scale';
import { EmissionsData } from '../../common.d';
import data from '../../data.tsv';
import useDimensions from 'react-cool-dimensions';
import { animated, useTransition } from 'react-spring';
import { generateSeries, max } from '../../utils';
import { budget } from '../../constants';

type Margins = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

type EmissionsSeriesMeta = {
  color: string;
};

export type EmissionsSeries = {
  data: EmissionsData;
  meta: EmissionsSeriesMeta;
};

export type YearlyEmissionsProps = {
  xAxisExtent: [number, number];
  stopAt?: number;
  labelYears?: number[];
  extend?: 'steady' | 'reduce';
};

const margins: Margins = {
  top: 10,
  right: 30,
  bottom: 25,
  left: 30
};

type SeriesProps = {
  data: EmissionsData;
  meta: EmissionsSeriesMeta;
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  xAxisExtent: [number, number];
  barWidth: number;
};

const Series: React.FC<SeriesProps> = ({ data, meta: { color }, xScale, yScale, xAxisExtent, barWidth }) => {
  const visibleData = data.filter(d => d.year >= xAxisExtent[0] && d.year <= xAxisExtent[1]);

  const springs = useTransition(visibleData, d => d.year, {
    from: { height: 0, top: yScale(0) },
    update: d => ({
      height: yScale(0) - yScale(d.emissions),
      top: yScale(d.emissions)
    }),
    unique: true
  });

  return (
    <g>
      {springs.map(
        ({ item, props: { top, height } }, i) =>
          item && (
            <animated.rect
              key={i}
              className={styles.column}
              stroke="#fff"
              strokeWidth="0"
              fill={color}
              style={{ transform: `translate(${xScale(item.year) - barWidth / 2}px, 0)` }}
              width={barWidth}
              y={top}
              height={height}
              data-year={item.year}
            />
          )
      )}
    </g>
  );
};

const YearlyEmissions: React.FC<YearlyEmissionsProps> = ({ xAxisExtent, stopAt, extend }) => {
  const { ref, width, height } = useDimensions<HTMLDivElement>();

  const end = stopAt || xAxisExtent[1];

  // Calculate the budget
  const budgetUsed = data.reduce((t, d) => (d.year <= end ? t + d.emissions : t), 0) / 1000000000;
  const remainingBudget = (budget - budgetUsed) * 1000000000;

  // Create the series

  // Start with the real series trimmed to the years of interest
  const series = [
    {
      data: data.filter(d => d.year >= xAxisExtent[0] && d.year <= (stopAt || xAxisExtent[1])),
      meta: {
        color: '#000'
      }
    }
  ];

  const peak = series[0].data[series[0].data.length - 1].emissions;

  // Next extend if we want it
  if (extend) {
    series.push({
      data: generateSeries(remainingBudget, peak, extend === 'reduce').map((d, i) => ({
        emissions: d,
        year: i + end + 1
      })),
      meta: { color: 'red' }
    });
  }

  const xScale = scaleLinear()
    .domain([xAxisExtent[0] - 1, xAxisExtent[1] + 1])
    .range([0, width - margins.right - margins.left]);

  const yScale = scaleLinear()
    .domain([0, 35000000000])
    .range([height - margins.top - margins.bottom, 0]);

  const yTickValues = [15, 25, 35].map(d => d * 1000000000);

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
        {yTickValues.map((tickValue, i) => (
          <line
            key={i}
            x1={margins.left}
            x2={width - margins.left}
            y1={yScale(tickValue) + margins.top}
            y2={yScale(tickValue) + margins.top}
            stroke="#ccc"
          />
        ))}

        {height > 0 && (
          <g transform={`translate(${margins.left} ${margins.top})`}>
            {series.map(({ data, meta }, i) => (
              <Series
                key={i}
                data={data}
                meta={meta}
                xScale={xScale}
                yScale={yScale}
                xAxisExtent={xAxisExtent}
                barWidth={barWidth}
              />
            ))}
          </g>
        )}

        <g className={styles.axisX}>
          <line
            transform={`translate(${margins.left}, ${height - margins.bottom})`}
            x1={width - margins.left - margins.right}
          />
          {xScale.ticks().map((tickValue, i) => (
            <g
              key={i}
              className={styles.tickX}
              transform={`translate(${xScale(tickValue) + margins.left}, ${height - margins.bottom})`}
            >
              <line y2={6} />
              <text y="17" textAnchor="middle">
                {tickValue}
              </text>
            </g>
          ))}
        </g>

        <g className={styles.axisY}>
          <line transform={`translate(${margins.left}, ${margins.top})`} y2={height - margins.top - margins.bottom} />
          {yTickValues.map((tickValue, i) => (
            <g
              key={i}
              className={styles.tickY}
              transform={`translate(${margins.left - 6}, ${yScale(tickValue) + margins.top})`}
            >
              <line x2={6} />
              <text x="-2" dy="0.3em" textAnchor="end">
                {String(tickValue.valueOf() / 1000000000)}
              </text>
            </g>
          ))}
        </g>

        <g className={styles.axisY}>
          <line
            transform={`translate(${width - margins.right}, ${margins.top})`}
            y2={height - margins.top - margins.bottom}
          />
          {yTickValues.map((tickValue, i) => (
            <g
              key={i}
              className={styles.tickY}
              transform={`translate(${width - margins.right}, ${yScale(tickValue) + margins.top})`}
            >
              <line x2={6} />
              <text x="8" dy="0.3em" textAnchor="start">
                {String(tickValue.valueOf() / 1000000000)}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};

export default YearlyEmissions;
