import { select } from 'd3-selection';
import { transition } from 'd3-transition';
import { ScaleLinear } from 'd3-scale';
import React, { useEffect, useRef } from 'react';
import styles from './styles.scss';
import { EmissionsData, EmissionsDatum } from '../../common.d';

interface ColumnsProps {
  data: EmissionsData;
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  colour?: string;
}

const Columns: React.FC<ColumnsProps> = ({ data, xScale, yScale }) => {
  const g = useRef<SVGGElement | null>(null);

  useEffect(() => {
    console.log('g :>> ', g);
    if (g.current === null) {
      return;
    }

    select(g.current)
      .selectAll<SVGRectElement, EmissionsDatum>('.column')
      .data(data, d => d.year)
      .join(
        enter =>
          enter
            .append('rect')
            .attr('class', 'column')
            .attr('x', d => xScale(d.year))
            .attr('y', d => yScale.range()[0] - yScale(d.emissions))
            .attr('width', 2)
            .attr('height', 0)
            .call(enter =>
              enter
                .transition()
                .duration(0)
                .delay((d, i) => i * 10)
                .attr('height', d => yScale(d.emissions))
            ),
        update =>
          update.call(update =>
            update
              .transition()
              .duration(0)
              .attr('x', d => xScale(d.year))
              .attr('height', d => yScale(d.emissions))
          )
      );
  }, [data, g.current, yScale, xScale]);

  return <g ref={g}></g>;
};

export default Columns;
