import { describe, it, expect } from 'vitest';

import { normalizeVehicle, hasPosition } from './normalizeVehicle';
import type { GtfsFeedEntity } from '../types/gtfs';

const mockEntity: GtfsFeedEntity = {
  id: 'v1',
  vehicle: {
    trip: { routeId: '39' },
    position: {
      latitude: 42.3601,
      longitude: -71.0589,
      bearing: 90,
      speed: 10,
    },
    timestamp: 1234567890,
  },
};

describe('hasPosition', () => {
  it('returns true when entity has a position', () => {
    expect(hasPosition(mockEntity)).toBe(true);
  });

  it('returns false when entity has no vehicle', () => {
    const entity: GtfsFeedEntity = { id: 'v1' };
    expect(hasPosition(entity)).toBe(false);
  });

  it('returns false when vehicle has no position', () => {
    const entity: GtfsFeedEntity = {
      id: 'v1',
      vehicle: { trip: { routeId: '39' } },
    };
    expect(hasPosition(entity)).toBe(false);
  });
});

describe('normalizeVehicle', () => {
  it('normalizes a complete entity correctly', () => {
    const result = normalizeVehicle(mockEntity);

    expect(result.id).toBe('v1');
    expect(result.routeId).toBe('39');
    expect(result.latitude).toBe(42.3601);
    expect(result.longitude).toBe(-71.0589);
    expect(result.bearing).toBe(90);
    expect(result.speed).toBe(10);
    expect(result.timestamp).toBe(1234567890);
  });

  it('falls back to unknown routeId when trip is missing', () => {
    const entity: GtfsFeedEntity = {
      id: 'v1',
      vehicle: {
        position: {
          latitude: 42.3601,
          longitude: -71.0589,
        },
      },
    };

    const result = normalizeVehicle(entity);
    expect(result.routeId).toBe('unknown');
  });

  it('handles missing bearing and speed', () => {
    const entity: GtfsFeedEntity = {
      id: 'v1',
      vehicle: {
        trip: { routeId: '39' },
        position: {
          latitude: 42.3601,
          longitude: -71.0589,
        },
      },
    };

    const result = normalizeVehicle(entity);
    expect(result.bearing).toBeUndefined();
    expect(result.speed).toBeUndefined();
  });

  it('falls back to Date.now() when timestamp is missing', () => {
    const entity: GtfsFeedEntity = {
      id: 'v1',
      vehicle: {
        trip: { routeId: '39' },
        position: {
          latitude: 42.3601,
          longitude: -71.0589,
        },
      },
    };

    const before = Date.now();
    const result = normalizeVehicle(entity);
    const after = Date.now();

    expect(result.timestamp).toBeGreaterThanOrEqual(before);
    expect(result.timestamp).toBeLessThanOrEqual(after);
  });
});
