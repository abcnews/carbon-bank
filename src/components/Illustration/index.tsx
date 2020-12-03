import React from 'react';
import styles from './styles.scss';
import img from './header-image-data.png';

interface IllustrationProps {}

const Illustration: React.FC<IllustrationProps> = () => {
  return <img src={img} />;
};

export default Illustration;
