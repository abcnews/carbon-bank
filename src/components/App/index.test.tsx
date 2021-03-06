import React from 'react';
import renderer from 'react-test-renderer';

import App from '.';

describe('App', () => {
  test('It renders', () => {
    const component = renderer.create(<App panels={[]} config={{}} />);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
