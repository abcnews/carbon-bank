import React, { useEffect, useState } from 'react';
import { useAnimateProps } from 'react-animate-props';
import { usePrevious } from '../../utils';
import YearlyEmissions from '../YearlyEmissions';
import Bank from '../Bank';
import data from '../../data.tsv';
import { generateSeries } from '../../utils';
import styles from './styles.scss';
import { Mark } from '../../constants';
import { useTransition, animated, config } from 'react-spring';

interface VizProps {
  current: Mark;
  next: Mark;
  progress?: number;
}

const Viz: React.FC<VizProps> = ({ current }) => {
  const previous = usePrevious<Mark>(current);
  const carbonLabel = useTransition(current.labels?.includes('carbon'), null, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 }
  });

  const [startYear, setStartYear] = useState(2017);
  const [budget, setBudget] = useState(1800);
  const [xAxisExtent, setXAxisExtent] = useState<[number, number]>([1900, 2100]);

  const budgetUsed = data.reduce((t, d) => (d.year <= startYear ? t + d.emissions : t), 0) / 1000000000;

  const remainingBudget = (budget - budgetUsed) * 1000000000;

  const series2 = {
    data: generateSeries(remainingBudget, data[data.length - 1].emissions).map((d, i) => ({
      emissions: d,
      year: i + startYear + 1
    })),
    meta: { color: 'red' }
  };

  return (
    <div className={styles.root}>
      <Bank budget={budget} limits={current.limits || []} blobs={current.blobs} />

      {carbonLabel.map(
        ({ item, key, props }) =>
          item && (
            <animated.div key={key} className={styles.carbonLabel} style={props}>
              This is carbon
            </animated.div>
          )
      )}

      {current.chart && (
        <YearlyEmissions
          series={[{ data, meta: { color: 'black' } }, series2]}
          xAxisExtent={current.chart.xAxisExtent}
        />
      )}
    </div>
  );
};

export default Viz;
