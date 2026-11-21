import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { MapPage } from './index';

vi.mock('../../components/Map', () => ({
  Map: (props: { consented?: boolean; hideLoadingOverlay?: boolean }) => (
    <div>{`map consented=${props.consented} hidden=${props.hideLoadingOverlay}`}</div>
  ),
}));

describe('MapPage', () => {
  it('passes consented and hideLoadingOverlay through to the map', () => {
    render(<MapPage consented={false} hideLoadingOverlay />);

    expect(
      screen.getByText('map consented=false hidden=true'),
    ).toBeInTheDocument();
  });
});
