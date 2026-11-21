import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CookieBanner } from './index';

const CONSENT_KEY = 'cookieConsent';

describe('CookieBanner', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows the banner when consent has not been given', () => {
    render(<CookieBanner onAccept={vi.fn()} />);

    expect(screen.getByText(/this site uses cookies/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Accept' })).toBeInTheDocument();
  });

  it('renders nothing when consent was already given', () => {
    localStorage.setItem(CONSENT_KEY, 'true');

    const { container } = render(<CookieBanner onAccept={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('stores consent, hides the banner and calls onAccept when accepted', async () => {
    const onAccept = vi.fn();
    render(<CookieBanner onAccept={onAccept} />);

    await userEvent.click(screen.getByRole('button', { name: 'Accept' }));

    expect(localStorage.getItem(CONSENT_KEY)).toBe('true');
    expect(onAccept).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole('button', { name: 'Accept' }),
    ).not.toBeInTheDocument();
  });

  it('links to the MapTiler privacy policy in a new tab', () => {
    render(<CookieBanner onAccept={vi.fn()} />);

    const link = screen.getByRole('link', { name: 'MapTiler' });

    expect(link).toHaveAttribute(
      'href',
      'https://www.maptiler.com/privacy-policy/',
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });
});
