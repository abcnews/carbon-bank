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
import { easeQuadOut } from 'd3-ease';

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
  steady?: number;
};

const margins: Margins = {
  top: 10,
  right: 15,
  bottom: 25,
  left: 20
};

const YearlyEmissions: React.FC<YearlyEmissionsProps> = ({ minYear, maxYear, stopAt, extend, steady, labelYears }) => {
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
      let budget = remainingBudget;
      let series: number[] = [];

      if (steady && steady > 0) {
        let val = peak?.emissions || 0;
        for (let i = 0; i < steady; i++) {
          series.push(val);
          budget -= val;
        }
      }
      series
        .concat(generateSeries(budget, peak?.emissions || 0, extend === 'reduce'))
        .map((d, i) => ({
          emissions: d,
          year: i + (peak?.year || 0) + 1
        }))
        .forEach(d => {
          if (d.year <= maxYear) bars.push({ ...d, color: 'red' });
        });
    }

    return bars;
  }, [minYear, maxYear, stopAt, extend, steady, remainingBudget, width, height]);

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

  const barWidth = useMemo(() => Math.max(1, (xScale(1) - xScale(0)) / 2), [xScale]);

  const xTickValues = useMemo(() => xScale.ticks((width - margins.left - margins.right) / 60), [xScale, width]);
  const yTickValues = [15, 25, 35].map(d => d * 1000000000);
  const attribInterpolator = (begValue, endValue, attr) =>
    attr === 'transform' ? interpolateTransformSvg(begValue, endValue) : interpolate(begValue, endValue);

  return (
    <div ref={ref} className={styles.root}>
      <svg width={width} height={height}>
        {yTickValues.map((tickValue, i) => (
          <line
            key={i}
            x1={margins.left}
            x2={width - margins.right}
            y1={yScale(tickValue) + margins.top}
            y2={yScale(tickValue) + margins.top}
            stroke="#ccc"
          />
        ))}

        <g transform={`translate(${margins.left} ${margins.top})`}>
          <NodeGroup
            data={height ? bars : []}
            keyAccessor={d => d.year}
            start={d => ({
              height: 0,
              width: barWidth,
              x: xScaleOld(d.year) - barWidth / 2,
              y: yScale(0),
              opacity: 0
            })}
            enter={d => [
              {
                width: [barWidth],
                x: [xScale(d.year) - barWidth / 2],
                timing: { duration: animationDuration, ease: easeQuadOut }
              },
              {
                height: [yScale(0) - yScale(d.emissions)],
                y: [yScale(d.emissions)],
                opacity: [1],
                timing: {
                  duration: animationDuration,
                  delay: delayScale(d.year) * animationDuration,
                  ease: easeQuadOut
                }
              }
            ]}
            update={d => [
              {
                width: [barWidth],
                x: [xScale(d.year) - barWidth / 2],
                timing: { duration: animationDuration, ease: easeQuadOut }
              },
              {
                height: [yScale(0) - yScale(d.emissions)],
                y: [yScale(d.emissions)],
                opacity: [1],
                timing: {
                  duration: animationDuration,
                  delay: delayScale(d.year) * animationDuration,
                  ease: easeQuadOut
                }
              }
            ]}
            leave={d => [
              {
                width: [barWidth],
                x: [xScale(d.year) - barWidth / 2],
                timing: { duration: animationDuration }
              },
              {
                height: [0],
                y: [yScale(0)],
                opacity: [0],
                timing: { duration: animationDuration, delay: delayScale(d.year) * animationDuration }
              }
            ]}
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
                    transform={`translate(${state.x}, ${state.y})`}
                    opacity={state.opacity}
                    data-year={data.year}
                  />
                ))}
              </>
            )}
          </NodeGroup>
        </g>

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
              timing: { duration: animationDuration, ease: easeQuadOut }
            })}
            update={d => ({
              opacity: [1],
              transform: [`translate(${xScale(d) + margins.left}, ${height - margins.bottom})`],
              timing: { duration: animationDuration, ease: easeQuadOut }
            })}
            leave={d => ({
              opacity: [0],
              transform: [`translate(${xScale(d) + margins.left}, ${height - margins.bottom})`],
              timing: { duration: animationDuration, ease: easeQuadOut }
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
              transform={`translate(${margins.left - 3}, ${yScale(tickValue) + margins.top})`}
            >
              <text x="" dy="0.3em" textAnchor="end">
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
          enter={d => ({ opacity: [1], timing: { duration: animationDuration, ease: easeQuadOut } })}
          update={(d, i) => ({ opacity: [1], timing: { duration: animationDuration, ease: easeQuadOut } })}
          leave={d => ({ opacity: [0], timing: { duration: animationDuration, ease: easeQuadOut } })}
        >
          {nodes => {
            return (
              <>
                {nodes.map(({ key, data, state }) => (
                  <div
                    className={styles.label}
                    key={key}
                    style={{
                      opacity: state.opacity,
                      left: xScale(data),
                      top: yScale(bars.find(d => d.year === data)?.emissions || 0)
                    }}
                  >
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
