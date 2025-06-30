import { fireEvent,render, screen } from '@testing-library/react';
import React from 'react';

import Accordion from '../index';

const TITLE = 'Sample Accordion';
const CONTENT_TEXT = 'Some hidden content';

describe('<Accordion />', () => {
  it('toggles content visibility on click', () => {
    render(
      <Accordion title={TITLE}>
        <div>{CONTENT_TEXT}</div>
      </Accordion>
    );

    // Content should be hidden initially
    expect(screen.queryByText(CONTENT_TEXT)).not.toBeVisible();

    const button = screen.getByRole('button', { name: TITLE });
    fireEvent.click(button);

    // Now content becomes visible
    expect(screen.getByText(CONTENT_TEXT)).toBeVisible();
  });
});