import React from 'react';
import renderer from 'react-test-renderer';

import Label from '.';

describe('Label', () => {
  test('It renders', () => {
    const component = renderer.create(<Label />);

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
