import React from 'react';
import landscape from './landscape.jpg';
import portrait from './portrait.jpg';
import './styles.scss';

const Illustration: React.FC = () => {
  return (
    <picture>
      <source
        srcSet={`${landscape} 1605w`}
        media="(min-aspect-ratio: 1/1)"
        sizes="(min-width: 61.25rem) 59.5rem, (min-width: 43.75rem)and (max-width: 61.1875rem) calc((8.3333333333% + 0.9375rem)*2), calc(100vw - 1.875rem)"
      />

      <source
        srcSet={`${portrait} 950w`}
        media="(max-aspect-ratio: 1/1)"
        sizes="(min-width: 61.25rem) 59.5rem, (min-width: 43.75rem)and (max-width: 61.1875rem) calc((8.3333333333% + 0.9375rem)*2), calc(100vw - 1.875rem)"
      />
      <img
        src={portrait}
        alt="Collage of imagery depicting fossil fuel extraction and use with historical newspaper clippings about climate change"
      />
    </picture>
  );
};

export default Illustration;
