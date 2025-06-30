import { render } from '@testing-library/react';

import LoadingSpinner from '../../LoadingSpinner';

describe('<LoadingSpinner />', () => {
  it('renders without crashing', () => {
    const { container } = render(<LoadingSpinner borderColour='red' height={4} width={4} />);
    expect(container.firstChild).toBeTruthy();
  });
});