import React from 'react';
import renderer from 'react-test-renderer';

import Illustration from '.';

describe('Illustration', () => {
  test('It renders', () => {
    const component = renderer.create(<Illustration />);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
