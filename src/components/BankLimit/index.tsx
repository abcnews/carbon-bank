import React, { useState } from 'react';
import { Transition } from 'react-transition-group';
import { nanoid } from 'nanoid';
import styles from './styles.scss';

interface BankLimitProps {
  r: number;
  cx: number;
  cy: number;
  label: string;
  visible?: boolean;
  duration?: number;
  labelOffset?: number;
}

const BankLimit: React.FC<BankLimitProps> = ({ r, cx, cy, label, visible = true, duration = 0, labelOffset = 5 }) => {
  const [id] = useState(nanoid);
  return (
    <Transition in={visible} timeout={duration}>
      {state => {
        return (
          <g>
            <circle
              style={{
                opacity: ['entering', 'entered'].includes(state) ? 1 : 0,
                transition: `opacity ${duration}ms ease-in-out`
              }}
              cx={cx}
              cy={cy}
              r={r}
              strokeDasharray="2 2"
              stroke="#ccc"
              fill="none"
            />
            <path
              transform={`translate(${cx} ${cy})`}
              id={`label-arc-${id}`}
              d={`M ${-r - labelOffset} 0 A ${r + labelOffset} ${r + labelOffset} 180 1 1 ${r + labelOffset} 0`}
              fill="none"
              stroke="none"
            />
            <text
              textAnchor="middle"
              fill="pink"
              style={{
                opacity: ['entering', 'entered'].includes(state) ? 1 : 0,
                transition: `opacity ${duration}ms ease-in-out`
              }}
            >
              <textPath startOffset="50%" href={`#label-arc-${id}`}>
                {label}
              </textPath>
            </text>
          </g>
        );
      }}
    </Transition>
  );
};

export default BankLimit;
