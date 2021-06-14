import React, { useMemo } from 'react';
import styles from './styles.scss';
import { scaleLinear } from 'd3-scale';
import { EmissionsData } from '../../common.d';
import useDimensions from 'react-cool-dimensions';
import { usePrevious } from '../../utils';
import { animationDuration } from '../../constants';
import { NodeGroup } from 'react-move';
import { interpolate, interpolateTransformSvg } from 'd3-interpolate';
import { easeQuadOut } from 'd3-ease';

type Margins = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type EmissionsSeries = {
  year: number;
  emissions: number;
  color: string;
};

export type XAxisExtent = [number | undefined, number | undefined];
export type ExtendMethod = 'steady' | 'reduce';

export type YearlyEmissionsProps = {
  series: EmissionsData;
  maxYear: number;
  labelYears?: number[];
};

const margins: Margins = {
  top: 28,
  right: 17,
  bottom: 80,
  left: 25
};

const YearlyEmissions: React.FC<YearlyEmissionsProps> = ({ series, labelYears, maxYear }) => {
  const { observe, width, height } = useDimensions<HTMLDivElement | null>();
  const first = series[0];
  const last = series[series.length - 1];

  const bottomMargin = margins.bottom;

  const xScale = useMemo(
    () =>
      scaleLinear()
        .domain([first.year - 1, maxYear + 1])
        .range([0, width - margins.right - margins.left]),
    [first, width, maxYear]
  );

  const xScaleOld = usePrevious(xScale);

  const delayScale = useMemo(
    () =>
      scaleLinear()
        .domain([first.year - 1, last.year + 1])
        .range([0, 1]),
    [first, last]
  );

  const yScale = useMemo(
    () =>
      scaleLinear()
        .domain([0, 35000000000])
        .range([height - margins.top - bottomMargin, 0]),
    [height, bottomMargin]
  );

  const barWidth = useMemo(() => Math.max(1, (xScale(1) - xScale(0)) / 2), [xScale]);

  const xTickValues = useMemo(() => xScale.ticks((width - margins.left - margins.right) / 60), [xScale, width]);
  const yTickValues = [15, 25, 35].map(d => d * 1000000000);
  const attribInterpolator = (begValue: string, endValue: string, attr: string | undefined) =>
    attr === 'transform' ? interpolateTransformSvg(begValue, endValue) : interpolate(begValue, endValue);

  return (
    <div ref={observe} className={styles.root}>
      <h3 className={styles.title}>
        Gt CO<sub>2</sub>
      </h3>
      <svg width="100%" height="100%">
        <mask id="chartArea">
          <rect x="0" y="0" width="100%" height="100%" fill="black" />
          <rect
            fill="white"
            x={0}
            y={-100}
            width={width - margins.right - margins.left}
            height={height - margins.top - bottomMargin + 100}
          />
        </mask>

        {yTickValues.map((tickValue, i) => (
          <line
            key={i}
            x1={margins.left}
            x2={width - margins.right}
            y1={yScale(tickValue) + margins.top}
            y2={yScale(tickValue) + margins.top}
            className={styles.scaleLine}
          />
        ))}

        <g transform={`translate(${margins.left} ${margins.top})`} mask="url(#chartArea)">
          <NodeGroup
            data={height ? series.filter(d => d.year <= maxYear) : []}
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
                height: [yScale(0) - yScale(d.emissions)],
                y: [yScale(d.emissions)],
                opacity: [0],
                timing: { duration: animationDuration, ease: easeQuadOut }
              },
              {
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
            transform={`translate(${margins.left}, ${height - bottomMargin})`}
            x1={width - margins.left - margins.right}
          />
          <NodeGroup
            data={height ? xTickValues : []}
            keyAccessor={d => d}
            start={d => ({
              opacity: 0,
              transform: `translate(${xScaleOld(d) + margins.left}, ${height - bottomMargin})`
            })}
            enter={d => ({
              opacity: [1],
              transform: [`translate(${xScale(d) + margins.left}, ${height - bottomMargin})`],
              timing: { duration: animationDuration, ease: easeQuadOut }
            })}
            update={d => ({
              opacity: [1],
              transform: [`translate(${xScale(d) + margins.left}, ${height - bottomMargin})`],
              timing: { duration: animationDuration, ease: easeQuadOut }
            })}
            leave={d => ({
              opacity: [0],
              transform: [`translate(${xScale(d) + margins.left}, ${height - bottomMargin})`],
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
          <line transform={`translate(${margins.left}, ${margins.top})`} y2={height - margins.top - bottomMargin} />
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
            y2={height - margins.top - bottomMargin}
          />
        </g>
      </svg>
      <div
        style={{
          position: 'absolute',
          width: `${width - margins.left - margins.right}px`,
          height: `${height - margins.top - bottomMargin}px`,
          top: `${margins.top}px`,
          left: `${margins.left}px`
        }}
      >
        <NodeGroup
          data={(height && labelYears) || []}
          keyAccessor={d => d}
          start={d => ({
            opacity: 0,
            left: xScale(d),
            top: yScale(series.find(y => y.year === d)?.emissions || 0)
          })}
          enter={d => ({
            opacity: [1],
            left: [xScale(d)],
            top: [yScale(series.find(y => y.year === d)?.emissions || 0)],
            timing: { duration: animationDuration, ease: easeQuadOut, delay: delayScale(d) * animationDuration }
          })}
          update={d => ({
            opacity: [1],
            left: [xScale(d)],
            top: [yScale(series.find(y => y.year === d)?.emissions || 0)],
            timing: { duration: animationDuration, ease: easeQuadOut }
          })}
          leave={d => [
            {
              opacity: [0],
              left: [xScale(d)],
              timing: { duration: animationDuration, ease: easeQuadOut }
            },
            {
              top: [yScale(series.find(y => y.year === d)?.emissions || 0)],
              timing: { duration: animationDuration, ease: easeQuadOut, delay: animationDuration }
            }
          ]}
        >
          {nodes => {
            return (
              <>
                {nodes.map(({ key, data, state: { top, left, opacity } }) => (
                  <div className={styles.label} key={key} style={{ opacity, left, top }}>
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
