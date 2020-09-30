import React, { useState } from 'react';
import styles from './styles.scss';
import data from '../../data.tsv';
import Bank from '../Bank';
import { marks } from '../../constants';
import YearlyEmissions from '../YearlyEmissions';
import Scrollyteller, { PanelDefinition } from '@abcnews/scrollyteller';
import { PanelData } from '../../common.d';
import { generateSeries } from '../../utils';

interface AppProps {
  panels: PanelDefinition<PanelData>[];
}

const App: React.FC<AppProps> = ({ panels }) => {
  const [current, setCurrent] = useState<PanelData | null>(null);
  const [next, setNext] = useState<PanelData | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [startYear, setStartYear] = useState(2017);

  window.setStartYear = setStartYear;

  const [budget, setBudget] = useState(1800);

  const [xAxisExtent, setXAxisExtent] = useState<[number, number]>([1900, 2100]);
  const budgetUsed = data.reduce((t, d) => (d.year <= startYear ? t + d.emissions : t), 0) / 1000000000;

  const remainingBudget = (budget - budgetUsed) * 1000000000;

  const series2 = {
    data: generateSeries(remainingBudget, data[data.length - 1].emissions).map((d, i) => ({
      emissions: d,
      year: i + 2018
    })),
    meta: { color: 'red' }
  };

  return (
    <Scrollyteller
      panels={panels}
      onMarker={current => {
        setCurrent(current);
        setNext(current.next || current);
      }}
      onProgress={m => setProgress(m.pctAboveFold)}
    >
      <div className={styles.root}>
        {current && progress && (
          <Bank
            budget={budget}
            progress={progress}
            begin={marks[current.index].blobs}
            end={next && marks[next.index].blobs}
          />
        )}
        <YearlyEmissions series={[{ data, meta: { color: 'black' } }, series2]} xAxisExtent={xAxisExtent} />
      </div>
    </Scrollyteller>
  );
};

export default App;
