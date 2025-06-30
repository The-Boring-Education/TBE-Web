import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from '../Navbar';

// Mock heavy child sub-components to keep test light-weight
jest.mock('@/components', () => ({
  Logo: () => <div data-testid='logo'>Logo</div>,
  NotificationPopover: () => <div data-testid='notif'>N</div>,
  UserPointButton: () => <button data-testid='points'>P</button>,
  UserAvatar: () => <div data-testid='avatar'>A</div>,
  LoginRedirectButton: ({ text }: { text: string }) => <button>{text}</button>,
  PopoverContainer: ({ label }: { label: string; children: React.ReactNode }) => <div>{label}</div>,
  NavbarDropdownContainer: () => <div />,
  FlexContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  MobileNavbarLinksContainer: () => <div />,
  Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}));

describe('<Navbar />', () => {
  it('renders logo and desktop login button', () => {
    render(<Navbar />);
    expect(screen.getByTestId('logo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('opens mobile menu when hamburger clicked', () => {
    render(<Navbar />);
    const hamburger = screen.getAllByRole('button')[0]; // first button is hamburger
    fireEvent.click(hamburger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});