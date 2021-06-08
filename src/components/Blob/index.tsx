import React, { useState, useEffect } from 'react';
import LiquidBlob from '../LiquidBlob';
import { usePrevious } from '../../utils';

interface BlobProps {
  cx: number | undefined;
  cy: number | undefined;
  r: number | undefined;
  opacity?: number | undefined;
  fill?: string | undefined;
}

const defaultState: BlobProps = {
  r: 0,
  cx: 0,
  cy: 0,
  opacity: 1,
  fill: '#000'
};

const Blob: React.FC<BlobProps> = props => {
  const [state, setState] = useState(defaultState);
  const previousState = usePrevious(state);
  useEffect(() => {
    setState({ ...defaultState, ...(previousState || {}), ...props });
  }, [props, previousState]);

  return <LiquidBlob cx={state.cx || 0} cy={state.cy || 0} r={state.r || 0} />;
};

export default Blob;
