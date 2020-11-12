import React, { useState } from 'react';
import { nanoid } from 'nanoid';
import { Animate } from 'react-move';

interface BankLimitProps {
  r: number;
  cx: number;
  cy: number;
  label: string;
  visible?: boolean;
  labelOffset?: number;
  progress?: number | false;
}

const BankLimit: React.FC<BankLimitProps> = ({ r, cx, cy, label, visible = true, labelOffset = 5 }) => {
  const [id] = useState(nanoid);
  const circumference = 2 * Math.PI * r;
  const dashLength = Math.ceil(circumference / 4);
  const dasharray = ['0', String(Math.ceil(circumference))].concat(new Array(dashLength).fill('2 2')).join(' ');
  return (
    <Animate
      show={visible}
      start={{
        opacity: 0,
        strokeDashoffset: 0
      }}
      enter={{
        opacity: [1],
        strokeDashoffset: [-circumference]
      }}
      update={{
        opacity: [1],
        strokeDashoffset: [-circumference]
      }}
      leave={{
        opacity: [0],
        strokeDashoffset: [-circumference]
      }}
    >
      {({ strokeDashoffset, opacity }) => (
        <g>
          <path
            transform={`translate(${cx} ${cy})`}
            d={`M 0 ${-r} A ${r} ${r} 0 1 1 0 ${r} A ${r} ${r} 0 1 1 0 ${-r}`}
            strokeDasharray={dasharray}
            stroke="#444"
            strokeWidth="2"
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
              {label}
            </textPath>
          </text>
        </g>
      )}
    </Animate>
  );
};

export default BankLimit;
