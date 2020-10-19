import React from 'react';
import styles from './styles.scss';
import { ScaleLinear, scaleLinear } from 'd3-scale';
import { EmissionsData, EmissionsDatum } from '../../common.d';
import useDimensions from 'react-cool-dimensions';
import { AnimatedAxis, AnimatedGridRows } from '@visx/react-spring';
import { useSprings, animated, useTransition } from 'react-spring';
import { max } from '../../utils';

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

interface YearlyEmissionsProps {
  series: EmissionsSeries[];
  xAxisExtent: [number, number];
}

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
      {springs.map(({ props: { top, height } }, i) => (
        <animated.rect
          key={i}
          className={styles.column}
          stroke="#fff"
          strokeWidth="0"
          fill={color}
          style={{ transform: `translate(${xScale(visibleData[i].year) - barWidth / 2}px, 0)` }}
          width={barWidth}
          y={top}
          height={height}
          data-year={visibleData[i].year}
        />
      ))}
    </g>
  );
};

const YearlyEmissions: React.FC<YearlyEmissionsProps> = ({ series, xAxisExtent }) => {
  const { ref, width, height } = useDimensions<HTMLDivElement>();

  const xScale = scaleLinear()
    .domain(xAxisExtent)
    .range([0, width - margins.right - margins.left]);

  const yScale = scaleLinear()
    .domain([0, max(series.map(d => max(d.data.map(d => d.emissions))))])
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
        <AnimatedGridRows
          animationTrajectory="min"
          scale={yScale}
          width={width - margins.left - margins.right}
          left={margins.left}
          top={margins.top}
          stroke="#ccc"
          tickValues={yTickValues}
        />

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

        <AnimatedAxis
          top={height - margins.bottom}
          left={margins.left}
          animationTrajectory="min"
          orientation="bottom"
          scale={xScale}
          tickFormat={val => String(val)}
        />
        <AnimatedAxis
          animationTrajectory="min"
          top={margins.top}
          left={margins.left}
          orientation="left"
          scale={yScale}
          tickFormat={val => String(val.valueOf() / 1000000000)}
          label="Gt"
          tickLength={0}
          tickValues={yTickValues}
          tickLabelProps={() =>
            ({
              fontFamily: 'sans-serif',
              textAnchor: 'end',
              x: -2,
              y: '0.30em'
            } as const)
          }
        />
        <AnimatedAxis
          animationTrajectory="min"
          top={margins.top}
          left={width - margins.right}
          orientation="right"
          scale={yScale}
          tickFormat={val => String(val.valueOf() / 1000000000)}
          tickLength={0}
          tickValues={yTickValues}
          tickLabelProps={() =>
            ({
              fontFamily: 'sans-serif',
              textAnchor: 'start',
              x: 2,
              y: '0.30em'
            } as const)
          }
        />
      </svg>
    </div>
  );
};

export default YearlyEmissions;
