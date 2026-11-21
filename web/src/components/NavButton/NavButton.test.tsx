import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { NavButton } from './index';

const renderNavButton = () =>
  render(
    <MemoryRouter>
      <NavButton />
    </MemoryRouter>,
  );

const toggle = () => screen.getByRole('button', { name: 'Toggle navigation' });

describe('NavButton', () => {
  it('starts with the menu closed', () => {
    renderNavButton();

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('opens the menu with links to both pages', async () => {
    renderNavButton();

    await userEvent.click(toggle());

    expect(screen.getByRole('link', { name: 'Map' })).toHaveAttribute(
      'href',
      '/',
    );
    expect(screen.getByRole('link', { name: 'Tech Stack' })).toHaveAttribute(
      'href',
      '/tech-stack',
    );
  });

  it('closes the menu when the button is clicked again', async () => {
    renderNavButton();

    await userEvent.click(toggle());
    await userEvent.click(toggle());

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('closes the menu after a link is chosen', async () => {
    renderNavButton();

    await userEvent.click(toggle());
    await userEvent.click(screen.getByRole('link', { name: 'Tech Stack' }));

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it.each(['Map', 'Tech Stack'])(
    'closes the menu after the %s link is chosen',
    async (name) => {
      renderNavButton();

      await userEvent.click(toggle());
      await userEvent.click(screen.getByRole('link', { name }));

      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    },
  );
});
