import React from 'react';
import renderer from 'react-test-renderer';

import BankLimit from '.';

describe('BankLimit', () => {
  test('It renders', () => {
    const component = renderer.create(<BankLimit />);

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
