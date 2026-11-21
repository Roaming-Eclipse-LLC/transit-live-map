import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Map } from './index';
import { useVehicles } from '../../hooks/useVehicles';
import type { VehiclePosition } from '../../types/vehicle';

// vi.mock calls are hoisted above the imports, so anything their factories
// use has to be created with vi.hoisted.
const mocks = vi.hoisted(() => {
  type Handler = (event?: unknown) => void;

  class FakeMap {
    static instances: FakeMap[] = [];

    options: Record<string, unknown>;
    handlers: { event: string; layer?: string; handler: Handler }[] = [];
    source = { setData: vi.fn() };
    canvas = { style: { cursor: '' } };

    addImage = vi.fn();
    addSource = vi.fn();
    addLayer = vi.fn();
    setFilter = vi.fn();
    queryRenderedFeatures = vi.fn().mockReturnValue([]);
    getSource = vi.fn().mockReturnValue(this.source);
    getCanvas = vi.fn().mockReturnValue(this.canvas);
    remove = vi.fn();

    constructor(options: Record<string, unknown>) {
      this.options = options;
      FakeMap.instances.push(this);
    }

    // Mirrors MapLibre's overloads: on(event, handler) and on(event, layerId, handler)
    on(event: string, layerOrHandler: string | Handler, handler?: Handler) {
      if (typeof layerOrHandler === 'string') {
        this.handlers.push({ event, layer: layerOrHandler, handler: handler! });
      } else {
        this.handlers.push({ event, handler: layerOrHandler });
      }
    }

    fire(event: string, payload?: unknown, layer?: string) {
      this.handlers
        .filter((h) => h.event === event && h.layer === layer)
        .forEach((h) => h.handler(payload));
    }
  }

  return { FakeMap, setWorkerUrl: vi.fn() };
});

vi.mock('maplibre-gl', () => ({
  Map: mocks.FakeMap,
  setWorkerUrl: mocks.setWorkerUrl,
}));

vi.mock('maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url', () => ({
  default: 'worker-url',
}));

vi.mock('../../hooks/useVehicles', () => ({ useVehicles: vi.fn() }));

vi.mock('../../utils/arrowImage', () => ({
  createArrowImage: vi.fn(() => ({})),
}));

const LAYER_ID = 'vehicle-arrows';
const SELECTED_LAYER_ID = 'vehicle-arrows-selected';
const NO_SELECTION = ['==', ['get', 'id'], ''];

const vehicleA: VehiclePosition = {
  id: 'v1',
  routeId: '39',
  latitude: 42.3601,
  longitude: -71.0589,
  bearing: 90,
  speed: 10,
  timestamp: 1780791463,
};

const vehicleB: VehiclePosition = {
  id: 'v2',
  routeId: '1',
  latitude: 42.35,
  longitude: -71.07,
  bearing: 180,
  speed: 0,
  timestamp: 1780791470,
};

const getMap = () => mocks.FakeMap.instances[0];

const loadMap = () => {
  act(() => {
    getMap().fire('load');
  });
};

const lastGeoJson = () =>
  getMap().source.setData.mock.lastCall![0] as { features: unknown[] };

// One real click fires the layer listeners (only if a vehicle is under the
// pointer) and then the general map listeners. The fake does the same.
const clickAt = (features: unknown[]) => {
  const fake = getMap();
  const event = { point: { x: 1, y: 1 } };

  fake.queryRenderedFeatures.mockReturnValue(features);

  act(() => {
    if (features.length > 0) {
      fake.fire('click', event, LAYER_ID);
    }
    fake.fire('click', event);
  });
};

describe('Map', () => {
  beforeEach(() => {
    mocks.FakeMap.instances = [];
    vi.mocked(useVehicles).mockReturnValue([vehicleA, vehicleB]);
  });

  describe('setup', () => {
    it('creates the map with the MapTiler style, Boston center and zoom', () => {
      render(<Map />);

      expect(mocks.FakeMap.instances).toHaveLength(1);
      expect(getMap().options).toEqual(
        expect.objectContaining({
          center: [-71.0589, 42.3601],
          zoom: 12,
          style: expect.stringContaining('key=test-key'),
        }),
      );
    });

    it('registers the bundled worker URL with MapLibre', async () => {
      vi.resetModules();
      mocks.setWorkerUrl.mockClear();

      await import('./index');

      expect(mocks.setWorkerUrl).toHaveBeenCalledWith('worker-url');
    });

    it('adds the vehicle source and both arrow layers once the map loads', () => {
      render(<Map />);

      expect(getMap().addSource).not.toHaveBeenCalled();

      loadMap();

      expect(getMap().addSource).toHaveBeenCalledWith(
        'vehicles',
        expect.objectContaining({ type: 'geojson' }),
      );
      expect(getMap().addImage).toHaveBeenCalledTimes(2);
      expect(getMap().addLayer.mock.calls.map(([layer]) => layer.id)).toEqual([
        LAYER_ID,
        SELECTED_LAYER_ID,
      ]);
    });

    it('removes the map on unmount', () => {
      const { unmount } = render(<Map />);
      const fake = getMap();

      unmount();

      expect(fake.remove).toHaveBeenCalledTimes(1);
    });
  });

  describe('vehicle data', () => {
    it('feeds vehicles into the map source as GeoJSON points', () => {
      render(<Map />);
      loadMap();

      const { features } = lastGeoJson();

      expect(features).toHaveLength(2);
      expect(features[0]).toEqual({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [-71.0589, 42.3601] },
        properties: {
          id: 'v1',
          routeId: '39',
          bearing: 90,
          speed: 10,
          timestamp: 1780791463,
        },
      });
    });

    it('defaults a missing bearing and speed to 0', () => {
      vi.mocked(useVehicles).mockReturnValue([
        { ...vehicleA, bearing: undefined, speed: undefined },
      ]);

      render(<Map />);
      loadMap();

      expect(lastGeoJson().features[0]).toEqual(
        expect.objectContaining({
          properties: expect.objectContaining({ bearing: 0, speed: 0 }),
        }),
      );
    });

    it('keeps arrows off the map until consent is given', () => {
      const { rerender } = render(<Map consented={false} />);
      loadMap();

      expect(getMap().source.setData).toHaveBeenLastCalledWith({
        type: 'FeatureCollection',
        features: [],
      });

      rerender(<Map consented />);

      expect(lastGeoJson().features).toHaveLength(2);
    });
  });

  describe('loading overlay', () => {
    it('shows until the map has loaded', () => {
      render(<Map />);

      expect(screen.getByText('Loading transit data...')).toBeInTheDocument();

      loadMap();

      expect(
        screen.queryByText('Loading transit data...'),
      ).not.toBeInTheDocument();
    });

    it('stays visible while there are no vehicles', () => {
      vi.mocked(useVehicles).mockReturnValue([]);

      render(<Map />);
      loadMap();

      expect(screen.getByText('Loading transit data...')).toBeInTheDocument();
    });

    it('can be hidden with hideLoadingOverlay', () => {
      render(<Map hideLoadingOverlay />);

      expect(
        screen.queryByText('Loading transit data...'),
      ).not.toBeInTheDocument();
    });
  });

  describe('selection', () => {
    it('selects a vehicle on click, showing the panel and highlighting it', () => {
      render(<Map />);
      loadMap();

      expect(screen.queryByText('Route 39')).not.toBeInTheDocument();

      clickAt([{ properties: vehicleA }]);

      expect(screen.getByText('Route 39')).toBeInTheDocument();
      expect(getMap().setFilter).toHaveBeenLastCalledWith(SELECTED_LAYER_ID, [
        '==',
        ['get', 'id'],
        'v1',
      ]);
    });

    it('clears the selection when empty map is clicked', () => {
      render(<Map />);
      loadMap();

      clickAt([{ properties: vehicleA }]);
      clickAt([]);

      expect(screen.queryByText('Route 39')).not.toBeInTheDocument();
      expect(getMap().setFilter).toHaveBeenLastCalledWith(
        SELECTED_LAYER_ID,
        NO_SELECTION,
      );
    });

    it('clears the highlight when the panel is closed with its button', async () => {
      render(<Map />);
      loadMap();

      clickAt([{ properties: vehicleA }]);
      await userEvent.click(screen.getByRole('button'));

      expect(screen.queryByText('Route 39')).not.toBeInTheDocument();
      expect(getMap().setFilter).toHaveBeenLastCalledWith(
        SELECTED_LAYER_ID,
        NO_SELECTION,
      );
    });
  });

  describe('cursor', () => {
    it('shows a pointer over a vehicle and resets when leaving', () => {
      render(<Map />);
      loadMap();

      getMap().fire('mouseenter', undefined, LAYER_ID);
      expect(getMap().canvas.style.cursor).toBe('pointer');

      getMap().fire('mouseleave', undefined, LAYER_ID);
      expect(getMap().canvas.style.cursor).toBe('');
    });
  });

  it('ignores a layer click when no vehicle is found under the pointer', () => {
    render(<Map />);
    loadMap();

    const fake = getMap();
    fake.queryRenderedFeatures.mockReturnValue([]);

    act(() => {
      fake.fire('click', { point: { x: 1, y: 1 } }, LAYER_ID);
    });

    expect(screen.queryByText(/^Route /)).not.toBeInTheDocument();
    expect(fake.setFilter).not.toHaveBeenCalled();
  });

  it('does nothing when the vehicle source is missing', () => {
    render(<Map />);
    getMap().getSource.mockReturnValue(undefined);

    loadMap();

    expect(getMap().source.setData).not.toHaveBeenCalled();
  });
});
