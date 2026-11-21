import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { TechStackPage } from './index';
import { techStackSections } from '../../data/techStack';

const renderPage = () =>
  render(
    <MemoryRouter>
      <TechStackPage />
    </MemoryRouter>,
  );

describe('TechStackPage', () => {
  it('renders the page title', () => {
    renderPage();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Transit Live Map' }),
    ).toBeInTheDocument();
  });

  it.each(techStackSections.map((section) => section.title))(
    'renders the %s section heading',
    (title) => {
      renderPage();

      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    },
  );

  it('renders every tech item from the data file', () => {
    renderPage();

    for (const section of techStackSections) {
      for (const item of section.items) {
        // some names (like TypeScript) appear in more than one section
        expect(screen.getAllByText(item.name).length).toBeGreaterThan(0);
      }
    }
  });

  it('renders the architecture highlights', () => {
    renderPage();

    expect(
      screen.getByRole('heading', { name: 'Architecture Highlights' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Real-Time Data Pipeline')).toBeInTheDocument();
    expect(screen.getByText('Decoupled Architecture')).toBeInTheDocument();
    expect(
      screen.getByText('Production-Minded Deployment'),
    ).toBeInTheDocument();
  });
});
