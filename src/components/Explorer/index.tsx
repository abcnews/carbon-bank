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
import { emissionsTo } from '../../utils';

interface ExplorerProps {}

const Explorer: React.FC<ExplorerProps> = () => {
  const decodeEncodedUrlParam = () => {
    const result = /[?&]encoded=([^&#]*)/i.exec(String(window.location));

    return result ? decode(result[1]) : null;
  };

  const initialState: Mark = {
    blobs: [
      { id: 'sink', emissions: 0 },
      { id: 'future', emissions: 0 },
      { id: 'carbon', emissions: 1800 }
    ],
    ...decodeEncodedUrlParam()
  };

  const [showChart, setShowChart] = useState<boolean>(!!initialState.chart);
  const [carbonEmissions, setCarbonEmissions] = useState(initialState.blobs[2].emissions);
  const [sinkEmissions, setSinkEmissions] = useState(initialState.blobs[0].emissions);
  const [futureEmissions, setFutureEmissions] = useState(initialState.blobs[1].emissions);
  const [limits, setLimits] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [xmin, setXmin] = useState<number>(1800);
  const [xmax, setXmax] = useState<number>(2200);
  const [stopAt, setStopAt] = useState<number>(2020);
  const [extend, setExtend] = useState<'steady' | 'reduce' | undefined>(undefined);
  const [steady, setSteady] = useState<number>(0);
  const [yearLabels, setYearLabels] = useState<string>('');

  const [progress, setProgress] = useState(0);
  const [snapshots, setSnapshots] = useState(JSON.parse(localStorage.getItem(SNAPSHOTS_LOCALSTORAGE_KEY) || '{}'));

  const createSnapshot = (name: string, marker: Mark) => {
    const nextSnapshots = {
      [name]: encode({ ...marker, showChart }),
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
          stopAt,
          steady,
          labelYears: yearLabels
            .split(',')
            .map(d => d.trim())
            .filter(d => d.length)
            .map(d => +d)
        }
      : undefined
  };

  const replaceGraphicProps = (props: Mark & { showChart?: boolean }) => {
    props.blobs.forEach(({ id, emissions }) => {
      id === 'sink' && setSinkEmissions(emissions);
      id === 'future' && setFutureEmissions(emissions);
      id === 'carbon' && setCarbonEmissions(emissions);
    });
    setLimits(props.limits || []);
    setLabels(props.labels || []);
    setShowChart(props.showChart || false);
    if (props.chart) {
      setYearLabels((props.chart.labelYears || []).join(', '));
      setXmax(props.chart.maxYear);
      setXmin(props.chart.minYear);
      setExtend(props.chart.extend);
      setStopAt(props.chart.stopAt || 2020);
      setSteady(props.chart.steady || 0);
    }
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
          <label>
            Carbon blob (
            {carbonEmissions < 1800
              ? 'Off'
              : `Year: ${carbonEmissions}, Gt: ${(emissionsTo(carbonEmissions) / 1000000000).toFixed(1)}`}
            )
          </label>
          <FieldRange
            isDisabled={showChart}
            min={1799}
            max={2020}
            step={1}
            value={carbonEmissions}
            onChange={val => setCarbonEmissions(val < 1800 ? 0 : val)}
          />
        </div>
        <div>
          <label>
            Sink blob (
            {sinkEmissions < 1800
              ? 'Off'
              : `Year: ${sinkEmissions}, Gt: ${(emissionsTo(sinkEmissions) / 1000000000).toFixed(1)}`}
            )
          </label>
          <FieldRange
            min={1799}
            max={2020}
            step={1}
            value={sinkEmissions}
            onChange={val => setSinkEmissions(val < 1800 ? 0 : val)}
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
        <div className={styles.toggle}>
          <Toggle size="large" isChecked={showChart} onChange={() => setShowChart(prev => !prev)} /> Show chart
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

        <div key="steady">
          <label>Steady ({steady})</label>
          <div className={styles.flexRow}>
            <FieldRange
              min={0}
              max={10}
              step={1}
              value={steady}
              onChange={val => {
                setSteady(val);
              }}
            />
          </div>
        </div>

        <div key="labels">
          <label>Comma separated list of years to label in the chart</label>
          <Textfield
            name="year-labels"
            label="Years to label"
            value={yearLabels}
            onChange={ev => setYearLabels(ev.currentTarget.value)}
          />
          <label>Other labels</label>
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

              createSnapshot(name, marker);
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

        {/* <div key="progress">
          <label>Simulate progress ({progress})</label>
          <FieldRange min={-0.5} max={1} step={0.01} value={progress} onChange={setProgress} />
        </div> */}
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
