import React from 'react';
import YearlyEmissions from '../YearlyEmissions';
import Bank from '../Bank';
import styles from './styles.scss';
import { Mark, budget } from '../../constants';
import { emissionsTo } from '../../utils';
import { Animate } from 'react-move';

interface VizProps {
  current: Mark;
  progress?: number;
}

const Viz: React.FC<VizProps> = ({ current, progress }) => {
  // This is what's specified in the data
  const limits = current.limits;
  const from = current.blobs;
  const to = current.next?.blobs || current.blobs;

  // If we have a chart too, we want to auto-add (or override) some blob values.
  if (current.chart && current.chart.stopAt) {
    const carbonBlob = from.find(d => d.id === 'carbon');
    if (carbonBlob) carbonBlob.emissions = emissionsTo(current.chart.stopAt) / 1000000000;

    if (current.chart.extend) {
      const futureBlob = from.find(d => d.id === 'future');
      if (futureBlob) futureBlob.emissions = budget;
    }
  }

  return (
    <div className={styles.root}>
      <Bank
        budget={budget}
        limits={limits}
        blobs={from}
        nextBlobs={to}
        progress={current.useProgress ? progress : false}
      />
      <Animate
        show={!!(current.labels?.includes('carbon') && progress && progress < 0)}
        start={{ opacity: 0 }}
        enter={{ opacity: [1] }}
        leave={{ opacity: [0] }}
      >
        {state => (
          <div className={styles.carbonLabel} style={{ opacity: state.opacity }}>
            This is carbon dioxide
          </div>
        )}
      </Animate>

      {current.chart && <YearlyEmissions {...current.chart} />}
    </div>
  );
};

export default Viz;
