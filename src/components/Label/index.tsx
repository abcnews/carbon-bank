import React from 'react';
import styles from './styles.scss';

interface LabelProps {}

const Label: React.FC<LabelProps> = () => {
  return (
    <div className={styles.root}>
      Find me in <strong>src/components/Label</strong>
    </div>
  );
}

export default Label;
