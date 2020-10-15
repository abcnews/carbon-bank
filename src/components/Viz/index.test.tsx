import React from 'react';
import renderer from 'react-test-renderer';

import Viz from '.';

describe('Viz', () => {
  test('It renders', () => {
    const component = renderer.create(<Viz />);

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
