import React from 'react';
import renderer from 'react-test-renderer';

import LiquidBlob from '.';

describe('LiquidBlob', () => {
  test('It renders', () => {
    const component = renderer.create(<LiquidBlob cy={0} cx={0} r={1} />);

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
