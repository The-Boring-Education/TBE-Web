import { fireEvent,render, screen } from '@testing-library/react';

import Button from '../Button';

describe('<Button />', () => {
  it('renders the provided label and handles clicks', () => {
    const handleClick = jest.fn();

    render(<Button text="Click me" variant="PRIMARY" onClick={handleClick} />);

    const btn = screen.getByRole('button', { name: /click me/i });
    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});