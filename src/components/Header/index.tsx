import React from 'react';
import styles from './styles.scss';
import desktop_jpg from './desktop.jpg';
import desktop_png from './desktop_optimised.png';
import mobile_jpg from './mobile.jpg';
import mobile_png from './mobile_optimised.png';

interface IllustrationProps {}

const Illustration: React.FC<IllustrationProps> = () => {
  return (
    <picture>
      <source srcSet={`${desktop_png} 1200w`} media="(min-aspect-ratio: 1/1)" type="image/png" />
      <source srcSet={`${mobile_png} 1000w`} media="(max-aspect-ratio: 1/1)" type="image/png" />
      <img
        src={desktop_png}
        alt="Collage of imagery depicting fossil fuel extraction and use with historical newspaper clippings about climate change"
      />
    </picture>
  );
};

export default Illustration;
