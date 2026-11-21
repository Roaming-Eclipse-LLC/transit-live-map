import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { VehiclePanel } from './index';

import type { VehiclePosition } from '../../types/vehicle';

const vehicle: VehiclePosition = {
  id: 'y1614',
  routeId: '39',
  latitude: 42.3601,
  longitude: -71.0589,
  bearing: 90,
  speed: 10,
  timestamp: 1780791463,
};

describe('VehiclePanel', () => {
  it('renders no content when no vehicle is selected', () => {
    render(<VehiclePanel vehicle={null} onClose={vi.fn()} />);

    expect(screen.queryByText(/route/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows the route, vehicle id and bearing', () => {
    render(<VehiclePanel vehicle={vehicle} onClose={vi.fn()} />);

    expect(screen.getByText('Route 39')).toBeInTheDocument();
    expect(screen.getByText('y1614')).toBeInTheDocument();
    expect(screen.getByText('90°')).toBeInTheDocument();
  });

  it('converts speed from meters per second to mph', () => {
    render(<VehiclePanel vehicle={vehicle} onClose={vi.fn()} />);

    expect(screen.getByText('22.4 mph')).toBeInTheDocument();
  });

  it('shows Stopped when speed is 0', () => {
    render(
      <VehiclePanel vehicle={{ ...vehicle, speed: 0 }} onClose={vi.fn()} />,
    );

    expect(screen.getByText('Stopped')).toBeInTheDocument();
  });

  it('shows Stopped when speed is missing', () => {
    render(
      <VehiclePanel
        vehicle={{ ...vehicle, speed: undefined }}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText('Stopped')).toBeInTheDocument();
  });

  it('shows a dash when bearing is missing', () => {
    render(
      <VehiclePanel
        vehicle={{ ...vehicle, bearing: undefined }}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('formats the timestamp as a local time', () => {
    render(<VehiclePanel vehicle={vehicle} onClose={vi.fn()} />);

    const expected = new Date(vehicle.timestamp * 1000).toLocaleTimeString();

    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn();
    render(<VehiclePanel vehicle={vehicle} onClose={onClose} />);

    await userEvent.click(screen.getByRole('button'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
