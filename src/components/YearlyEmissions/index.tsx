import React, { useMemo } from 'react';
import styles from './styles.scss';
import { scaleLinear } from 'd3-scale';
import { greatest } from 'd3-array';
import { EmissionsData } from '../../common.d';
import data from '../../data.tsv';
import useDimensions from 'react-cool-dimensions';
import { generateSeries, max } from '../../utils';
import { budget } from '../../constants';
import { animated, useTransition } from 'react-spring';

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

export type XAxisExtent = [number | undefined, number | undefined];
export type ExtendMethod = 'steady' | 'reduce';

export type YearlyEmissionsProps = {
  minYear: number;
  maxYear: number;
  stopAt?: number;
  labelYears?: number[];
  extend?: ExtendMethod;
};

const margins: Margins = {
  top: 10,
  right: 30,
  bottom: 25,
  left: 30
};

const YearlyEmissions: React.FC<YearlyEmissionsProps> = ({ minYear, maxYear, stopAt, extend, labelYears }) => {
  const { ref, width, height } = useDimensions<HTMLDivElement>();

  const end = stopAt || maxYear || Infinity;

  // Calculate the budget
  const budgetUsed = data.reduce((t, d) => (d.year <= end ? t + d.emissions : t), 0) / 1000000000;
  const remainingBudget = (budget - budgetUsed) * 1000000000;

  // Create the series
  const bars = useMemo(() => {
    // Start with the real series trimmed to the years of interest
    const bars = data.filter(d => d.year >= minYear && d.year <= end).map(d => ({ ...d, color: '#000' }));

    // What's the final year of of 'real' emissions?
    const peak = greatest(bars, d => d.year)?.emissions || 0;

    // Next extend if we want it
    if (extend) {
      generateSeries(remainingBudget, peak, extend === 'reduce')
        .map((d, i) => ({
          emissions: d,
          year: i + end + 1
        }))
        .forEach(d => {
          if (d.year <= maxYear) bars.push({ ...d, color: 'red' });
        });
    }
    return bars;
  }, [minYear, maxYear, stopAt, extend, remainingBudget]);

  const xScale = useMemo(
    () =>
      scaleLinear()
        .domain([Math.max(minYear || data[0].year) - 1, Math.min(maxYear || bars[bars.length - 1].year) + 1])
        .range([0, width - margins.right - margins.left]),
    [minYear, maxYear, width, margins]
  );

  const delayScale = useMemo(
    () =>
      scaleLinear()
        .domain([Math.max(minYear || data[0].year) - 1, Math.min(maxYear || bars[bars.length - 1].year) + 1])
        .range([0, 1]),
    [minYear, maxYear, bars]
  );

  const yScale = useMemo(
    () =>
      scaleLinear()
        .domain([0, 35000000000])
        .range([height - margins.top - margins.bottom, 0]),
    [height, margins]
  );

  const barWidth = useMemo(() => (xScale(1) - xScale(0)) / 2, [xScale]);

  const xTickValues = useMemo(() => xScale.ticks(), [xScale]);
  const yTickValues = [15, 25, 35].map(d => d * 1000000000);

  const labelTransitions = useTransition(labelYears && height > 0 ? labelYears : [], {
    from: d => ({
      opacity: 0,
      left: xScale(d),
      top: yScale(bars.find(b => b.year === d)?.emissions || 0)
    }),
    enter: d => ({
      opacity: 1,
      left: xScale(d),
      top: yScale(bars.find(b => b.year === d)?.emissions || 0),
      delay: delayScale(d) * 2000
    }),
    update: d => ({
      opacity: 1,
      left: xScale(d),
      top: yScale(bars.find(b => b.year === d)?.emissions || 0),
      delay: 0
    }),
    leave: d => ({
      opacity: 0,
      left: xScale(d),
      top: yScale(bars.find(b => b.year === d)?.emissions || 0),
      delay: delayScale(d) * 2000
    })
  });

  console.timeLog('YearlyEmissions', 'before barTransitions');
  const barTransitions = useTransition(height > 0 ? bars : [], {
    keys: d => '' + d.year + d.color,
    leave: d => {
      return {
        height: yScale(0) - yScale(d.emissions),
        width: barWidth,
        transform: `translate(${xScale(d.year) - barWidth / 2}, ${yScale(d.emissions)})`,
        fill: d.color,
        opacity: 0,
        delay: (1 - delayScale(d.year)) * 2000
      };
    },
    from: d => {
      return {
        height: yScale(0) - yScale(d.emissions),
        width: barWidth,
        transform: `translate(${xScale(d.year) - barWidth / 2}, ${yScale(d.emissions)})`,
        fill: d.color,
        opacity: 0
      };
    },
    enter: d => {
      return {
        height: yScale(0) - yScale(d.emissions),
        width: barWidth,
        transform: `translate(${xScale(d.year) - barWidth / 2}, ${yScale(d.emissions)})`,
        fill: d.color,
        opacity: 1,
        delay: delayScale(d.year) * 2000
      };
    },
    update: d => {
      return {
        height: yScale(0) - yScale(d.emissions),
        width: barWidth,
        transform: `translate(${xScale(d.year) - barWidth / 2}, ${yScale(d.emissions)})`,
        fill: d.color,
        opacity: 1,
        delay: 0
      };
    }
  });

  const axisTransition = useTransition(height > 0 ? xTickValues : [], {
    expires: false,
    key: d => d,
    from: tickValue => ({
      opacity: 0,
      transform: `translate(${xScale(tickValue) + margins.left}px, ${height - margins.bottom}px)`
    }),
    enter: tickValue => ({
      opacity: 1,
      transform: `translate(${xScale(tickValue) + margins.left}px, ${height - margins.bottom}px)`
    }),
    update: tickValue => ({
      opacity: 1,
      transform: `translate(${xScale(tickValue) + margins.left}px, ${height - margins.bottom}px)`
    }),
    leave: tickValue => ({
      opacity: 0,
      transform: `translate(${xScale(tickValue) + margins.left}px, ${height - margins.bottom}px)`
    })
  });

  return (
    <div ref={ref} className={styles.root}>
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
            {barTransitions((props, item) => {
              // console.log('props :>> ', props);
              return (
                <animated.rect
                  className={styles.column}
                  strokeWidth="0"
                  height={props.height}
                  width={props.width}
                  fill={props.fill}
                  transform={props.transform}
                  opacity={props.opacity}
                  data-year={item.year}
                />
              );
            })}
          </g>
        )}

        <g className={styles.axisX}>
          <line
            transform={`translate(${margins.left}, ${height - margins.bottom})`}
            x1={width - margins.left - margins.right}
          />
          {axisTransition((props, tickValue) => {
            return (
              <animated.g className={styles.tickX} style={props}>
                <line y2={6} />
                <text y="17" textAnchor="middle">
                  {tickValue}
                </text>
              </animated.g>
            );
          })}
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
      <div
        style={{
          position: 'absolute',
          width: `${width - margins.left - margins.right}px`,
          height: `${height - margins.top - margins.bottom}px`,
          top: `${margins.top}px`,
          left: `${margins.left}px`
        }}
      >
        {labelTransitions((style, year) => (
          <animated.div className={styles.label} key={`label-${year}`} style={style}>
            {year}
          </animated.div>
        ))}
      </div>
    </div>
  );
};

export default YearlyEmissions;
