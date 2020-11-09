import React, { useState, useMemo } from 'react';
import { Checkbox } from '@atlaskit/checkbox';
import FieldRange from '@atlaskit/range';
import { RadioGroup } from '@atlaskit/radio';
import Textfield from '@atlaskit/textfield';
import { decode, encode } from '@abcnews/base-36-props';
import Viz from '../Viz';
import { Mark, SNAPSHOTS_LOCALSTORAGE_KEY } from '../../constants';
import styles from './styles.scss';

interface ExplorerProps {}

const Explorer: React.FC<ExplorerProps> = () => {
  const decodeEncodedUrlParam = () => {
    const result = /[?&]encoded=([^&#]*)/i.exec(String(window.location));

    return result ? decode(result[1]) : null;
  };

  const initialState = {
    showChart: false,
    carbonEmissions: 20,
    sinkEmissions: 0,
    futureEmissions: 0,
    ...decodeEncodedUrlParam()
  };

  const [showChart, setShowChart] = useState(initialState.showChart);
  const [carbonEmissions, setCarbonEmissions] = useState(initialState.carbonEmissions);
  const [sinkEmissions, setSinkEmissions] = useState(initialState.sinkEmissions);
  const [futureEmissions, setFutureEmissions] = useState(initialState.futureEmissions);
  const [limits, setLimits] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  const [progress, setProgress] = useState(0);
  const [snapshots, setSnapshots] = useState(JSON.parse(localStorage.getItem(SNAPSHOTS_LOCALSTORAGE_KEY) || '{}'));

  const createSnapshot = (name: string, urlQuery: string) => {
    const nextSnapshots = {
      [name]: urlQuery,
      ...snapshots
    };

    localStorage.setItem(SNAPSHOTS_LOCALSTORAGE_KEY, JSON.stringify(nextSnapshots));
    setSnapshots(nextSnapshots);
  };

  const deleteSnapshot = (name: string) => {
    const nextSnapshots = { ...snapshots };

    delete nextSnapshots[name];

    localStorage.setItem(SNAPSHOTS_LOCALSTORAGE_KEY, JSON.stringify(nextSnapshots));
    setSnapshots(nextSnapshots);
  };

  const setLimit = (idx: number, show: Boolean) => {
    setLimits(limits.filter(d => d !== idx).concat(show ? idx : []));
  };
  const setLabel = (id: string, show: Boolean) => {
    setLabels(labels.filter(d => d !== id).concat(show ? id : []));
  };

  const marker: Mark = {
    useProgress: false,
    blobs: [
      { id: 'sink', emissions: sinkEmissions },
      { id: 'future', emissions: futureEmissions },
      { id: 'carbon', emissions: carbonEmissions }
    ],
    limits,
    labels
  };
  console.log('labels :>> ', labels);
  const replaceGraphicProps = (props: Mark) => {
    props.blobs.forEach(({ id, emissions }) => {
      id === 'sink' && setSinkEmissions(emissions);
      id === 'future' && setFutureEmissions(emissions);
      id === 'carbon' && setCarbonEmissions(emissions);
    });
    setLimits(props.limits || []);
    setLabels(props.labels || []);
  };

  return (
    <div className={styles.root}>
      <div className={styles.graphic}>
        <Viz current={marker} />
      </div>

      <div className={styles.controls}>
        <div>
          <label>Carbon blob ({carbonEmissions})</label>
          <FieldRange min={0} max={2000} step={10} value={carbonEmissions} onChange={setCarbonEmissions} />
        </div>
        <div>
          <label>Sink blob ({sinkEmissions})</label>
          <FieldRange min={0} max={2000} step={10} value={sinkEmissions} onChange={setSinkEmissions} />
        </div>
        <div>
          <label>Future blob ({futureEmissions})</label>
          <FieldRange min={0} max={2000} step={10} value={futureEmissions} onChange={setFutureEmissions} />
        </div>
        <div key="limits">
          <label>Limits</label>
          <Checkbox
            name="limit0"
            label="Show 0.5°C limit"
            value="Show 0.5°C limit"
            isChecked={limits.includes(0)}
            onChange={event => setLimit(0, event.target.checked)}
          />
          <Checkbox
            name="limit1"
            label="Show 1°C limit"
            value="Show 1°C limit"
            isChecked={limits.includes(1)}
            onChange={event => setLimit(1, event.target.checked)}
          />
          <Checkbox
            name="limit2"
            label="Show 1.5°C limit"
            value="Show 1.5°C limit"
            isChecked={limits.includes(2)}
            onChange={event => setLimit(2, event.target.checked)}
          />
        </div>
        <div key="labels">
          <label>Labels</label>
          <Checkbox
            name="carbon"
            label="Show 'This is carbondioxide' label"
            value="Show 'This is carbondioxide' label"
            isChecked={labels.includes('carbon')}
            onChange={event => setLabel('carbon', event.target.checked)}
          />
        </div>

        <label htmlFor="definitely-not-the-add-button">
          Snapshots
          <button
            onClick={() => {
              const name = prompt('What would you like to call this snapshot?');

              if (!name || !name.length) {
                return alert('No name was provided');
              } else if (snapshots[name]) {
                return alert(`Can't overwrite existing snapshot`);
              }

              createSnapshot(name, encode(marker));
            }}
          >
            add
          </button>
        </label>
        <ul>
          {Object.keys(snapshots).map(name => (
            <li key={name}>
              <button
                onClick={() =>
                  navigator.clipboard.writeText(String(window.location.href).split('?')[0] + snapshots[name])
                }
              >
                share
              </button>
              <button onClick={() => deleteSnapshot(name)}>delete</button>{' '}
              <a
                href={snapshots[name]}
                onClick={event => {
                  event.preventDefault();
                  replaceGraphicProps(decode(snapshots[name]) as Mark);
                }}
              >
                {name}
              </a>
            </li>
          ))}
        </ul>

        <h2>Simulate</h2>
        <div key="progress">
          <label>Progress</label>
          <FieldRange min={0} max={1} step={0.01} value={progress} onChange={setProgress} />
        </div>
      </div>
    </div>
  );
};

export default Explorer;
