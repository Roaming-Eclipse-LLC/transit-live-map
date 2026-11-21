import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { App } from './App';

vi.mock('./pages/MapPage', () => ({
  MapPage: (props: { consented?: boolean; hideLoadingOverlay?: boolean }) => (
    <div>
      {`map page consented=${props.consented} hidden=${props.hideLoadingOverlay}`}
    </div>
  ),
}));

const CONSENT_KEY = 'cookieConsent';

const renderApp = (route = '/') =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  );

const acceptButton = () => screen.queryByRole('button', { name: 'Accept' });

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('first visit', () => {
    it('shows the cookie banner and keeps the loading overlay hidden', () => {
      renderApp();

      expect(acceptButton()).toBeInTheDocument();
      expect(
        screen.getByText(/consented=false hidden=true/),
      ).toBeInTheDocument();
    });

    it('shows the banner on any route, not just the map', () => {
      renderApp('/tech-stack');

      expect(acceptButton()).toBeInTheDocument();
    });

    it('releases the map once the banner is accepted', async () => {
      renderApp();

      await userEvent.click(acceptButton()!);

      expect(acceptButton()).not.toBeInTheDocument();
      expect(
        screen.getByText(/consented=true hidden=false/),
      ).toBeInTheDocument();
    });
  });

  describe('returning visit', () => {
    it('skips the banner when consent was already given', () => {
      localStorage.setItem(CONSENT_KEY, 'true');

      renderApp();

      expect(acceptButton()).not.toBeInTheDocument();
      expect(screen.getByText(/consented=true/)).toBeInTheDocument();
    });
  });

  describe('routing', () => {
    beforeEach(() => {
      localStorage.setItem(CONSENT_KEY, 'true');
    });

    it('renders the map page at /', () => {
      renderApp('/');

      expect(screen.getByText(/map page/)).toBeInTheDocument();
    });

    it('renders the tech stack page at /tech-stack', () => {
      renderApp('/tech-stack');

      expect(
        screen.getByRole('heading', { level: 1, name: 'Transit Live Map' }),
      ).toBeInTheDocument();
      expect(screen.queryByText(/map page/)).not.toBeInTheDocument();
    });

    it.each(['/', '/tech-stack'])('shows the nav button at %s', (route) => {
      renderApp(route);

      expect(
        screen.getByRole('button', { name: 'Toggle navigation' }),
      ).toBeInTheDocument();
    });
  });
});
