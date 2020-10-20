import React, { useState } from 'react';
import { nanoid } from 'nanoid';
import { useTransition, animated } from 'react-spring';
import styles from './styles.scss';
import { transition } from 'd3-transition';

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
  const transitions = useTransition(visible, null, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    unique: true
  });
  const circumference = 2 * Math.PI * r;
  const dashLength = Math.ceil(circumference / 4);
  const dasharray = ['0', String(Math.ceil(circumference))].concat(new Array(dashLength).fill('2 2')).join(' ');
  return (
    <>
      {transitions.map(
        ({ item, key, props: { opacity } }) =>
          item && (
            <g key={key}>
              <animated.path
                transform={`translate(${cx} ${cy})`}
                d={`M 0 ${-r} A ${r} ${r} 0 1 1 0 ${r} A ${r} ${r} 0 1 1 0 ${-r}`}
                strokeDasharray={dasharray}
                stroke="#444"
                strokeWidth="2"
                fill="none"
                style={{
                  strokeDashoffset: opacity?.interpolate(value => -circumference * ((value as number) || 0))
                }}
              />
              <path
                transform={`translate(${cx} ${cy})`}
                id={`label-arc-${id}`}
                d={`M ${-r - labelOffset} 0 A ${r + labelOffset} ${r + labelOffset} 180 1 1 ${r + labelOffset} 0`}
                fill="none"
                stroke="none"
              />
              <animated.text textAnchor="middle" fill="#444" style={{ opacity }}>
                <textPath startOffset="50%" href={`#label-arc-${id}`}>
                  {label}
                </textPath>
              </animated.text>
            </g>
          )
      )}
    </>
  );
};

export default BankLimit;
