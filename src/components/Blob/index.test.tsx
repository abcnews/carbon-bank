import React from 'react';
import renderer from 'react-test-renderer';

import Blob from '.';

describe('Blob', () => {
  test('It renders', () => {
    const component = renderer.create(<Blob />);

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
