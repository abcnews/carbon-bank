import React from 'react';
import renderer from 'react-test-renderer';

import Columns from '.';

describe('Columns', () => {
  test('It renders', () => {
    const component = renderer.create(<Columns data={[]} />);

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
