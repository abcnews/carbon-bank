import React, { useState } from 'react';
import { nanoid } from 'nanoid';
import { Animate } from 'react-move';
import { animationDuration } from '../../constants';
import { easeQuadOut } from 'd3-ease';

interface BankLimitProps {
  r: number;
  cx: number;
  cy: number;
  label: string;
  visible?: boolean;
  labelOffset?: number;
  progress?: number | false;
}

const BankLimit: React.FC<BankLimitProps> = ({ r, cx, cy, label, visible = true, labelOffset = 8 }) => {
  const [id] = useState(nanoid);
  const circumference = 2 * Math.PI * r;
  const dashStride = 12;
  const dashLength = Math.ceil(circumference / dashStride);
  const dasharray = ['0', String(Math.ceil(circumference))]
    .concat(new Array(dashLength).fill(`${dashStride / 2} ${dashStride / 2}`))
    .join(' ');
  const duration = animationDuration * 1.2;
  return (
    <Animate
      show={visible}
      start={{
        opacity: 0,
        strokeDashoffset: 0
      }}
      enter={{
        opacity: [1],
        strokeDashoffset: [-circumference],
        timing: { duration: duration, ease: easeQuadOut }
      }}
      update={{
        opacity: [1],
        strokeDashoffset: [-circumference],
        timing: { duration: duration }
      }}
      leave={{
        opacity: [0],
        strokeDashoffset: [-circumference],
        timing: { duration: duration }
      }}
    >
      {({ strokeDashoffset, opacity }) => (
        <g>
          <path
            transform={`translate(${cx} ${cy})`}
            d={`M 0 ${-r} A ${r} ${r} 0 1 1 0 ${r} A ${r} ${r} 0 1 1 0 ${-r}`}
            strokeDasharray={dasharray}
            stroke="#DD7936"
            strokeWidth="3"
            fill="none"
            style={{ strokeDashoffset, opacity }}
          />
          <path
            transform={`translate(${cx} ${cy})`}
            id={`label-arc-${id}`}
            d={`M ${-r - labelOffset} 0 A ${r + labelOffset} ${r + labelOffset} 180 1 1 ${r + labelOffset} 0`}
            fill="none"
            stroke="none"
          />
          <text textAnchor="middle" fill="#444" style={{ opacity }}>
            <textPath startOffset="50%" href={`#label-arc-${id}`}>
              {}
            </textPath>
          </text>
        </g>
      )}
    </Animate>
  );
};

export default BankLimit;
