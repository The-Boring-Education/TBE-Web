import { render } from '@testing-library/react';
import React from 'react';

import CircularProgressBar from '../CircularProgressBar';

describe('<CircularProgressBar />', () => {
  it('renders svg with calculated strokeDashoffset based on percentage', () => {
    const { container } = render(
      <CircularProgressBar percentage={50} />
    );

    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(2);

    const radius = (56 - 6) / 2;
    const circumference = 2 * Math.PI * radius;
    const expectedOffset = circumference - 0.5 * circumference;

    // second circle is progress bar
    const progressCircle = circles[1];
    expect(progressCircle.getAttribute('stroke-dashoffset')).toBe(
      expectedOffset.toString()
    );
  });
});