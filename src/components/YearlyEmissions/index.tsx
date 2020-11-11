import React, { useMemo } from 'react';
import styles from './styles.scss';
import { scaleLinear } from 'd3-scale';
import { greatest } from 'd3-array';
import { EmissionsData } from '../../common.d';
import data from '../../data.tsv';
import useDimensions from 'react-cool-dimensions';
import { generateSeries, max, usePrevious } from '../../utils';
import { animationDuration, budget } from '../../constants';
import { NodeGroup } from 'react-move';
import { interpolate, interpolateTransformSvg } from 'd3-interpolate';

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
    const peak = greatest(bars, d => d.year);

    // Next extend if we want it

    if (extend) {
      generateSeries(remainingBudget, peak?.emissions || 0, extend === 'reduce')
        .map((d, i) => ({
          emissions: d,
          year: i + (peak?.year || 0) + 1
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

  const xScaleOld = usePrevious(xScale);

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
  const attribInterpolator = (begValue, endValue, attr) =>
    attr === 'transform' ? interpolateTransformSvg(begValue, endValue) : interpolate(begValue, endValue);

  const barTransform = d => `translate(${xScale(d.year) - barWidth / 2}, ${yScale(d.emissions)})`;

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
            <NodeGroup
              data={bars}
              keyAccessor={d => `${d.year} - ${d.color}`}
              start={d => ({
                height: yScale(0) - yScale(d.emissions),
                width: barWidth,
                transform: `translate(${xScaleOld(d.year) - barWidth / 2}, ${yScale(d.emissions)})`,
                opacity: 0
              })}
              enter={d => [
                {
                  height: [yScale(0) - yScale(d.emissions)],
                  width: [barWidth],
                  transform: barTransform(d),
                  opacity: [1],
                  timing: { duration: animationDuration, delay: delayScale(d.year) * animationDuration }
                }
              ]}
              update={d => ({
                height: [yScale(0) - yScale(d.emissions)],
                width: [barWidth],
                transform: [barTransform(d)],
                opacity: [1],
                timing: { duration: animationDuration }
              })}
              leave={d => ({
                height: [yScale(0) - yScale(d.emissions)],
                width: [barWidth],
                transform: [barTransform(d)],
                opacity: [0],
                timing: { duration: animationDuration }
              })}
              interpolation={attribInterpolator}
            >
              {nodes => (
                <>
                  {nodes.map(({ key, data, state }) => (
                    <rect
                      key={key}
                      className={styles.column}
                      strokeWidth="0"
                      height={state.height}
                      width={state.width}
                      fill={data.color}
                      transform={state.transform}
                      opacity={state.opacity}
                      data-year={data.year}
                    />
                  ))}
                </>
              )}
            </NodeGroup>
          </g>
        )}

        <g className={styles.axisX}>
          <line
            transform={`translate(${margins.left}, ${height - margins.bottom})`}
            x1={width - margins.left - margins.right}
          />
          <NodeGroup
            data={height ? xTickValues : []}
            keyAccessor={d => d}
            start={d => ({
              opacity: 0,
              transform: `translate(${xScaleOld(d) + margins.left}, ${height - margins.bottom})`
            })}
            enter={d => ({
              opacity: [1],
              transform: [`translate(${xScale(d) + margins.left}, ${height - margins.bottom})`],
              timing: { duration: animationDuration }
            })}
            update={d => ({
              opacity: [1],
              transform: [`translate(${xScale(d) + margins.left}, ${height - margins.bottom})`],
              timing: { duration: animationDuration }
            })}
            leave={d => ({
              opacity: [0],
              transform: [`translate(${xScale(d) + margins.left}, ${height - margins.bottom})`],
              timing: { duration: animationDuration }
            })}
            interpolation={attribInterpolator}
          >
            {nodes => (
              <>
                {nodes.map(({ key, data, state: { opacity, transform } }) => (
                  <g key={key} className={styles.tickX} transform={transform} style={{ opacity }}>
                    <line y2={6} />
                    <text y="17" textAnchor="middle">
                      {data}
                    </text>
                  </g>
                ))}
              </>
            )}
          </NodeGroup>
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
        <NodeGroup
          data={labelYears || []}
          keyAccessor={d => d}
          start={(d, i) => ({ opacity: 0 })}
          enter={d => ({ opacity: [1], timing: { duration: animationDuration } })}
          update={(d, i) => ({ timing: { duration: animationDuration } })}
          leave={d => ({ opacity: [0], timing: { duration: animationDuration } })}
        >
          {nodes => {
            return (
              <>
                {nodes.map(({ key, data, state }) => (
                  <div className={styles.label} key={key} style={{ opacity: state.opacity }}>
                    {data}
                  </div>
                ))}
              </>
            );
          }}
        </NodeGroup>
      </div>
    </div>
  );
};

export default YearlyEmissions;
