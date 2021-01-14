import React from 'react';
import styles from './styles.scss';
import desktop_jpg from './desktop.jpg';
import mobile_jpg from './mobile.jpg';

interface IllustrationProps {}

const Illustration: React.FC<IllustrationProps> = () => {
  return (
    <picture>
      <source srcSet={`${desktop_jpg} 940w`} media="(min-aspect-ratio: 1/1)" type="image/png" />
      <source srcSet={`${mobile_jpg} 950w`} media="(max-aspect-ratio: 1/1)" type="image/png" />
      <img
        src={mobile_jpg}
        alt="Collage of imagery depicting fossil fuel extraction and use with historical newspaper clippings about climate change"
      />
    </picture>
  );
};

export default Illustration;
