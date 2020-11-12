import React, { useState, useMemo } from 'react';
import { Checkbox } from '@atlaskit/checkbox';
import FieldRange from '@atlaskit/range';
import { RadioGroup } from '@atlaskit/radio';
import Textfield from '@atlaskit/textfield';
import { decode, encode } from '@abcnews/base-36-props';
import Viz from '../Viz';
import { Mark, SNAPSHOTS_LOCALSTORAGE_KEY } from '../../constants';
import styles from './styles.scss';
import Toggle from '@atlaskit/toggle';

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
  const [xmin, setXmin] = useState<number>(1800);
  const [xmax, setXmax] = useState<number>(2200);
  const [stopAt, setStopAt] = useState<number>(2020);
  const [extend, setExtend] = useState<'steady' | 'reduce' | undefined>(undefined);

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
    labels,
    chart: showChart
      ? {
          minYear: xmin,
          maxYear: xmax,
          extend,
          stopAt
        }
      : undefined
  };

  const replaceGraphicProps = (props: Mark) => {
    props.blobs.forEach(({ id, emissions }) => {
      id === 'sink' && setSinkEmissions(emissions);
      id === 'future' && setFutureEmissions(emissions);
      id === 'carbon' && setCarbonEmissions(emissions);
    });
    setLimits(props.limits || []);
    setLabels(props.labels || []);
  };

  const encodedMarkerText = encode(marker);

  return (
    <div className={styles.root}>
      <div className={styles.graphic}>
        <div style={{ background: 'white', height: '100%' }}>
          <Viz current={marker} />
        </div>
      </div>

      <div className={styles.controls}>
        <h2>Blobs</h2>
        <div>
          <label>Carbon blob ({carbonEmissions})</label>
          <FieldRange
            isDisabled={showChart}
            min={0}
            max={2000}
            step={10}
            value={carbonEmissions}
            onChange={setCarbonEmissions}
          />
        </div>
        <div>
          <label>Sink blob ({sinkEmissions})</label>
          <FieldRange min={0} max={2000} step={10} value={sinkEmissions} onChange={setSinkEmissions} />
        </div>
        <div>
          <label>Future blob ({futureEmissions})</label>
          <FieldRange
            isDisabled={showChart && typeof extend !== 'undefined'}
            min={0}
            max={2000}
            step={10}
            value={futureEmissions}
            onChange={setFutureEmissions}
          />
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
        <h2>Chart</h2>
        <div style={{ boxSizing: 'content-box' }}>
          <Toggle size="large" onChange={() => setShowChart(prev => !prev)} /> Show chart
        </div>
        <div>
          <label>Min year ({xmin})</label>
          <FieldRange
            min={1800}
            max={2200}
            step={1}
            value={xmin}
            onChange={val => {
              setXmin(val);
              setXmax(Math.max(xmax, val + 10));
              setStopAt(Math.max(stopAt, val));
            }}
          />
        </div>

        <div>
          <label>Max year ({xmax})</label>
          <FieldRange
            min={1800}
            max={2200}
            step={1}
            value={xmax}
            onChange={val => {
              setXmax(val);
              setXmin(Math.min(xmin, val - 10));
              setStopAt(Math.min(stopAt, val));
            }}
          />
        </div>

        <div>
          <label>Stop the real-world series at ({stopAt})</label>
          <FieldRange
            min={1800}
            max={2200}
            step={1}
            value={stopAt}
            onChange={val => {
              setStopAt(Math.max(Math.min(xmax, val), xmin));
            }}
          />
        </div>

        <div key="extend">
          <label>Extend series</label>
          <div className={styles.flexRow}>
            <RadioGroup
              name="extend"
              value={String(extend)}
              options={[
                { label: 'None', value: 'undefined' },
                { label: 'No change', value: 'steady' },
                { label: 'Reduce', value: 'reduce' }
              ]}
              onChange={event => {
                const val = event.currentTarget.value;
                setExtend(val === 'steady' ? 'steady' : val === 'reduce' ? 'reduce' : undefined);
              }}
            />
          </div>
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
        <h2>Tools</h2>
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

        <div key="progress">
          <label>Simulate progress ({progress})</label>
          <FieldRange min={-0.5} max={1} step={0.01} value={progress} onChange={setProgress} />
        </div>
        <details>
          <summary>
            Encoded Marker
            <button onClick={() => navigator.clipboard.writeText(encodedMarkerText)}>Copy to clipboard</button>
          </summary>
          <pre>{encodedMarkerText}</pre>
        </details>
        <p>
          <a
            href={`https://fallback-automation.drzax.now.sh/api?url=${document.location.href}&selector=%5Bdata-preset%5D&width=600`}
            download="fallback.png"
          >
            Download Fallback Image
          </a>
        </p>
      </div>
    </div>
  );
};

export default Explorer;