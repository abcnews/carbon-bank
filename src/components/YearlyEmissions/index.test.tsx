import React from 'react';
import renderer from 'react-test-renderer';

import YearlyEmissions from '.';

describe('YearlyEmissions', () => {
  test('It renders', () => {
    const component = renderer.create(<YearlyEmissions />);

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
