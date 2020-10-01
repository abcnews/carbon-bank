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
  const [current, setCurrent] = useState<PanelData | undefined>(undefined);
  const next = current?.next;
  const from = current ? marks[current.index] : undefined;
  const to = next ? marks[next.index] : undefined;

  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [startYear, setStartYear] = useState(2017);
  const [budget, setBudget] = useState(1800);

  window.setStartYear = setStartYear;
  window.setBudget = setBudget;

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
  const duration = 3000;
  const transitionStyles = {
    entering: { opacity: 1 },
    entered: { opacity: 1 },
    exiting: { opacity: 0 },
    exited: { opacity: 0 }
  };
  const defaultStyle = {
    transition: `opacity ${duration}ms ease-in-out`,
    opacity: 0
  };

  return (
    <Scrollyteller panels={panels} onMarker={setCurrent} onProgress={m => setProgress(m.pctAboveFold)}>
      <div className={styles.root}>
        <Transition in={current?.index === 0} timeout={3000}>
          {state => (
            <div className={styles.carbonLabel} style={{ ...defaultStyle, ...transitionStyles[state] }}>
              This is carbon
            </div>
          )}
        </Transition>

        {from && progress && (
          <Bank budget={budget} progress={progress} begin={from.blobs} end={to?.blobs} limits={from.limits || []} />
        )}

        {from?.series && (
        <YearlyEmissions series={[{ data, meta: { color: 'black' } }, series2]} xAxisExtent={xAxisExtent} />
        )}
      </div>
    </Scrollyteller>
  );
};

export default App;
