import React from 'react';
import landscape from './landscape.jpg';
import landscape_large from './landscape_large.jpg';
import portrait_large from './portrait.jpg';

interface IllustrationProps {}

const Illustration: React.FC<IllustrationProps> = () => {
  return (
    <picture>
      <source
        srcSet={`${landscape_large} 1535w, ${landscape} 940w`}
        media="(min-aspect-ratio: 1/1)"
        sizes="(min-width: 61.25rem) 59.5rem, (min-width: 43.75rem)and (max-width: 61.1875rem) calc((8.3333333333% + 0.9375rem)*2), calc(100vw - 1.875rem)"
      />

      <source
        srcSet={`${portrait_large} 950w`}
        media="(max-aspect-ratio: 1/1)"
        sizes="(min-width: 61.25rem) 59.5rem, (min-width: 43.75rem)and (max-width: 61.1875rem) calc((8.3333333333% + 0.9375rem)*2), calc(100vw - 1.875rem)"
      />

      <img
        src={portrait_large}
        alt="Collage of imagery depicting fossil fuel extraction and use with historical newspaper clippings about climate change"
      />
    </picture>
  );
};

export default Illustration;
