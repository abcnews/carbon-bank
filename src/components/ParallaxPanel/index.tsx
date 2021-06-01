import React, { useEffect, useRef } from 'react';
import styles from './styles.scss';

interface ParallaxPanelProps {
  nodes: Node[];
  reference: (el: HTMLElement) => void;
}

const ParallaxPanel: React.FC<ParallaxPanelProps> = ({ nodes, reference }) => {
  const base = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    reference(base.current);
  }, [reference]);

  useEffect(() => {
    base.current.innerHTML = '';
    nodes.forEach((node: Node) => {
      base.current.appendChild(node);
    });
  }, [nodes]);

  return <div ref={base} className={styles.root}></div>;
};

export default ParallaxPanel;
