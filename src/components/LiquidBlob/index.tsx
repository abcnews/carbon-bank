import React, { useEffect, useMemo, useRef, useState } from 'react';

export type LiquidBlobProps = {
  id?: string;
  cx: number;
  cy: number;
  r: number;
  showControlPoints?: boolean;
  attrs?: {
    className?: string;
    opacity?: number;
    stroke?: string;
    strokeWidth?: string;
    strokeDasharray?: string;
    fill?: string;
  };
};

const LiquidBlob: React.FC<LiquidBlobProps> = ({ id, cx, cy, r, attrs = {}, showControlPoints = false }) => {
  const [tick, setTick] = useState(Math.PI);
  const tickRef = useRef<number>(Math.PI);
  const blobRef = useRef<SVGPathElement>(null!);

  const p = useMemo(() => (tick: number) => draw(cx, cy, r, tick, 0.02), [cx, cy, r]);
  const d = useMemo(() => (tick: number) => segmentsToPathString(p(tick)), [p]);

  useEffect(() => {
    const update = () => {
      tickRef.current += 0.01;
      blobRef.current.setAttribute('d', d(tickRef.current));
      frameID = requestAnimationFrame(update);
      if (showControlPoints) {
        setTick(tickRef.current);
      }
    };
    let frameID = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(frameID);
    };
  }, [d, showControlPoints]);

  const path = p(tick);
  let points: { cx: number; cy: number }[] = [];
  let lines: { x1: number; y1: number; x2: number; y2: number }[] = [];

  let start: [number, number] = [0, 0];
  path.forEach(seg => {
    if (seg[0] === 'C') {
      const p = [
        { cx: start[0], cy: start[1] },
        { cx: seg[5], cy: seg[6] }
      ];
      const l = [
        { x1: start[0], y1: start[1], x2: seg[1], y2: seg[2] },
        { x1: seg[3], y1: seg[4], x2: seg[5], y2: seg[6] }
      ];

      points = points.concat(p);
      lines = lines.concat(l);
    }
    start = seg.slice(-2) as [number, number];
  });
  console.log('showControlPoints :>> ', showControlPoints);
  return (
    <>
      <path ref={blobRef} id={id} {...attrs} d={d(tickRef.current)} />
      {showControlPoints && (
        <g>
          {lines.map((d, i) => (
            <g key={i}>
              <line {...d} stroke="#ccc" strokeWidth="1" />
              <circle r={1.5} fill="#000" stroke="none" cx={d.x1} cy={d.y1} />
              <circle r={1.5} fill="#000" stroke="none" cx={d.x2} cy={d.y2} />
            </g>
          ))}
          {points.map((d, i) => (
            <circle key={i} r="3" {...d} stroke="red" strokeWidth="1" fill="none" />
          ))}
        </g>
      )}
    </>
  );
};

export default LiquidBlob;

type CurveSegment = ['C', number, number, number, number, number, number];
type MoveSegment = ['M', number, number];
type Segment = CurveSegment | MoveSegment;

function draw(cx: number, cy: number, r: number, tick: number, wander: number = 0) {
  const kappa = (4 * (Math.sqrt(2) - 1)) / 3;
  const perturbation = 0.1;
  const x = cx + wander * r * Math.sin(tick * 0.75);
  const y = cy + wander * r * Math.cos(tick * 1);

  const segments: Segment[] = [];

  // Start at the top of the circle
  segments.push(['M', x + 0, y + -r]);

  let controlOffset: number;

  // 0-90
  controlOffset = kappa + perturbation * Math.sin(tick);
  let c2 = perturbation * Math.cos(tick);
  segments.push([
    'C', // It's a curve
    x + controlOffset * r, // start control x
    y + -r, // start control y
    x + r, // end control x
    y + -controlOffset * r, // end control y
    x + r, // end x
    y // end y
  ]);

  // 90-180
  controlOffset = kappa + perturbation * Math.cos(tick);
  segments.push([
    'C',
    x + r, //
    y + controlOffset * r, //
    x + controlOffset * r, //
    y + r, //
    x, //
    y + r //
  ]);

  // 180-270
  controlOffset = kappa + perturbation * Math.sin(tick / 2);
  segments.push([
    'C', //
    x + -controlOffset * r, //
    y + r, //
    x + -r, //
    y + controlOffset * r, //
    x + -r, //
    y //
  ]);

  // 270-260
  controlOffset = kappa + perturbation * Math.cos(tick + 1);
  segments.push([
    'C',
    x + -r, //
    y + -controlOffset * r, //
    x + -controlOffset * r, //
    y + -r, //
    x, //
    y + -r //
  ]);

  return segments;
}

function segmentsToPathString(segments: Segment[]): string {
  return segments.reduce<('C' | 'M' | number)[]>((flat, d) => flat.concat(d), []).join(' ');
}
