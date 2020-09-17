import React, { useEffect, useState } from 'react';
import styles from './styles.scss';
import data from '../../data.tsv';
import Bank, { BankProps } from '../Bank';
import Columns from '../Columns';
import YearlyEmissions from '../YearlyEmissions';
import useDimensions from 'react-cool-dimensions';

interface AppProps {
  projectName: string;
}

const App: React.FC<AppProps> = ({ projectName }) => {
  const [startYear, setStartYear] = useState(1990);
  const [budget, setBudget] = useState(1800);
  const [xAxisExtent, setXAxisExtent] = useState<[number, number]>([1990, 2020]);

  const [bankProps, setBankProps] = useState<BankProps>({
    budget,
    blobs: [
      {
        size: 1
      }
    ]
  });

  // useEffect(() => {
  //   const timeout = setInterval(
  //     () => setXAxisExtent([xAxisExtent[0], xAxisExtent[1] === 2050 ? 2020 : xAxisExtent[1] + 10]),
  //     1000
  //   );
  //   return () => {
  //     clearInterval(timeout);
  //   };
  // });

  const budgetUsed = data.reduce((t, d) => (d.year <= startYear ? t + d.emissions : t), 0) / 1000000000;
  console.log('bankProps :>> ', bankProps);
  return (
    <div className={styles.root}>
      <label>
        Start reducing emissions in year: {startYear}
        <input type="range" min="1950" max="2017" onChange={ev => setStartYear(+ev.target.value)} value={startYear} />
      </label>
      <p>Remaining budget: {Math.round(budget - budgetUsed)}</p>
      <label>
        Total emissions budget: {budget}
        <input type="range" min="1800" max="2500" onChange={ev => setBudget(+ev.target.value)} value={budget} />
      </label>
      <button
        onClick={ev => setBankProps(JSON.parse(ev.currentTarget.dataset.config || ''))}
        data-config={JSON.stringify({ budget, blobs: [{ size: 0.5 }] })}
      >
        Small
      </button>
      <button
        onClick={ev => setBankProps(JSON.parse(ev.currentTarget.dataset.config || ''))}
        data-config={JSON.stringify({ budget, blobs: [{ size: 1 }, { size: 0, fill: 'red' }] })}
      >
        Big
      </button>
      <button
        onClick={ev => setBankProps(JSON.parse(ev.currentTarget.dataset.config || ''))}
        data-config={JSON.stringify({ budget, blobs: [{ size: 1 }, { size: 0.4, fill: 'green', label: 'Green!' }] })}
      >
        More
      </button>
      <Bank {...bankProps} />
      <YearlyEmissions data={data} xAxisExtent={xAxisExtent} />
    </div>
  );
};

export default App;
