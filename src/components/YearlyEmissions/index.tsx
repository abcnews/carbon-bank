import React, { useMemo } from 'react';
import styles from './styles.scss';
import { ScaleLinear, scaleLinear } from 'd3-scale';
import { greatest } from 'd3-array';
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

const YearlyEmissions: React.FC<YearlyEmissionsProps> = ({ xAxisExtent, stopAt, extend }) => {
  const { ref, width, height } = useDimensions<HTMLDivElement>();

  const end = stopAt || xAxisExtent[1];

  // Calculate the budget
  const budgetUsed = data.reduce((t, d) => (d.year <= end ? t + d.emissions : t), 0) / 1000000000;
  const remainingBudget = (budget - budgetUsed) * 1000000000;

  // Create the series
  const bars: { emissions: number; color: string; year: number }[] = [];

  // Start with the real series trimmed to the years of interest
  data
    .filter(d => d.year >= xAxisExtent[0] && d.year <= (stopAt || xAxisExtent[1]))
    .forEach(d => {
      bars.push({ ...d, color: '#000' });
    });

  // What's the peak of 'real' emissions?
  const peak = greatest(bars, d => d.emissions)?.emissions || 0;

  // Next extend if we want it
  if (extend) {
    generateSeries(remainingBudget, peak, extend === 'reduce')
      .map((d, i) => ({
        emissions: d,
        year: i + end + 1
      }))
      .forEach(d => {
        bars.push({ ...d, color: 'red' });
      });
  }

  const xScale = useMemo(
    () =>
      scaleLinear()
        .domain([xAxisExtent[0] - 1, xAxisExtent[1] + 1])
        .range([0, width - margins.right - margins.left]),
    [xAxisExtent, width, margins]
  );

  const yScale = useMemo(
    () =>
      scaleLinear()
        .domain([0, 35000000000])
        .range([height - margins.top - margins.bottom, 0]),
    [xAxisExtent, height, margins]
  );

  const barWidth = useMemo(() => (xScale(1) - xScale(0)) / 2, [xScale]);

  console.log('render');

  // Bar transitions
  const barSprings = useTransition(bars, ({ color, year }) => color + year, {
    from: d => ({
      height: 0,
      width: barWidth,
      transform: `translate(${xScale(d.year) - barWidth / 2}, ${yScale(0)})`,
      fill: d.color
    }),
    initial: d => ({
      height: 0,
      width: barWidth,
      transform: `translate(${xScale(d.year) - barWidth / 2}, ${yScale(0)})`,
      fill: d.color
    }),
    leave: d => ({
      height: 0,
      width: barWidth,
      transform: `translate(${xScale(d.year) - barWidth / 2}, ${yScale(0)})`,
      fill: d.color
    }),
    enter: d => ({
      height: yScale(0) - yScale(d.emissions),
      width: barWidth,
      transform: `translate(${xScale(d.year) - barWidth / 2}, ${yScale(d.emissions)})`,
      fill: d.color
    }),
    update: d => ({
      height: yScale(0) - yScale(d.emissions),
      width: barWidth,
      transform: `translate(${xScale(d.year) - barWidth / 2}, ${yScale(d.emissions)})`,
      fill: d.color
    }),
    unique: true
  });

  const yTickValues = [15, 25, 35].map(d => d * 1000000000);

  const labels = [];
  // [
  //   {
  //     text: '2017',
  //     x: xScale(2017),
  //     y: yScale(series[0].data.find(d => d.year === 2017)?.emissions || 0)
  //   }
  // ];

  const renderedLabels = (
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
  );

  return (
    <div ref={ref} className={styles.root}>
      {renderedLabels}
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
            {barSprings.map(
              ({ item, key, props: { height, width, fill, transform } }) =>
                item && (
                  <animated.rect
                    key={key}
                    className={styles.column}
                    strokeWidth="0"
                    data-year={item.year}
                    height={height}
                    width={width}
                    fill={fill}
                    transform={transform}
                  />
                )
            )}
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
