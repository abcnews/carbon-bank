import React, { useEffect, useState } from 'react';
import { useAnimateProps } from 'react-animate-props';
import { usePrevious } from '../../utils';
import YearlyEmissions from '../YearlyEmissions';
import Bank from '../Bank';
import data from '../../data.tsv';
import { generateSeries } from '../../utils';
import styles from './styles.scss';
import { Mark } from '../../constants';

interface VizProps {
  current: Mark;
  next: Mark;
  progress?: number;
}

const Viz: React.FC<VizProps> = ({ current }) => {
  const previous = usePrevious<Mark>(current);

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
      <Bank
        budget={budget}
        limits={current.limits || []}
        carbon={current.carbon}
        future={current.future}
        sink={current.sink}
      />

      <div className={styles.carbonLabel} style={{ opacity: current.labels?.includes('carbon') ? 1 : 0 }}>
        This is carbon
      </div>

      {current.series && (
        <YearlyEmissions series={[{ data, meta: { color: 'black' } }, series2]} xAxisExtent={xAxisExtent} />
      )}
    </div>
  );
};

export default Viz;
