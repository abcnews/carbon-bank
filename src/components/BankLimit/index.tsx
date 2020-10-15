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

const BankLimit: React.FC<BankLimitProps> = ({
  r,
  cx,
  cy,
  label,
  visible = true,
  duration = 1000,
  labelOffset = 5
}) => {
  const [id] = useState(nanoid);
  const circumference = 2 * Math.PI * r;
  const dashLength = Math.ceil(circumference / 4);
  const dasharray = ['0', String(Math.ceil(circumference))].concat(new Array(dashLength).fill('2 2')).join(' ');
  return (
    <Transition in={visible} timeout={duration}>
      {state => {
        return (
          <g>
            <path
              transform={`translate(${cx} ${cy})`}
              d={`M 0 ${-r} A ${r} ${r} 0 1 1 0 ${r} A ${r} ${r} 0 1 1 0 ${-r}`}
              strokeDasharray={dasharray}
              stroke="#ccc"
              fill="none"
              style={{
                opacity: ['entering', 'entered'].includes(state) ? 1 : 0,
                strokeDashoffset: ['entering', 'entered'].includes(state) ? -circumference : 0,
                transition: `opacity ${duration}ms ease-in-out, stroke-dashoffset ${duration * 3}ms ease-in-out`
              }}
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
