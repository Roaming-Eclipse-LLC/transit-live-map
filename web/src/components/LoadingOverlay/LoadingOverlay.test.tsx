import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { LoadingOverlay } from './index';

describe('LoadingOverlay', () => {
  it('shows the default message', () => {
    render(<LoadingOverlay />);

    expect(screen.getByText('Loading transit data...')).toBeInTheDocument();
  });

  it('shows a custom message instead of the default', () => {
    render(<LoadingOverlay message='Connecting...' />);

    expect(screen.getByText('Connecting...')).toBeInTheDocument();
    expect(
      screen.queryByText('Loading transit data...'),
    ).not.toBeInTheDocument();
  });
});
