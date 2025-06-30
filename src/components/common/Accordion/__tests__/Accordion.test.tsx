import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import Accordion from '../index';

const TITLE = 'Sample Accordion';
const CONTENT_TEXT = 'Some hidden content';

describe('<Accordion />', () => {
  it('toggles content visibility on click', async () => {
    render(
      <Accordion title={TITLE}>
        <div>{CONTENT_TEXT}</div>
      </Accordion>
    );

    // Content should be hidden initially (not in DOM)
    expect(screen.queryByText(CONTENT_TEXT)).not.toBeInTheDocument();

    // Find the button by role (there should be only one button)
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Wait for content to become visible
    await waitFor(() => {
      expect(screen.getByText(CONTENT_TEXT)).toBeVisible();
    });
  });
});
