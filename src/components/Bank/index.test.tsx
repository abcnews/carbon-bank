import React from 'react';
import renderer from 'react-test-renderer';

import Bank from '.';

describe('Bank', () => {
  test('It renders', () => {
    const component = renderer.create(<Bank scale={n => n} limits={[]} blobs={[]} nextBlobs={[]} />);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
