import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useVehicles } from './useVehicles';
import type { VehiclePosition } from '../types/vehicle';

class FakeWebSocket {
  static instances: FakeWebSocket[] = [];

  url: string;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  close = vi.fn();

  constructor(url: string) {
    this.url = url;
    FakeWebSocket.instances.push(this);
  }
}

const latestSocket = () => FakeWebSocket.instances[0];

const vehicle = (id: string): VehiclePosition => ({
  id,
  routeId: '39',
  latitude: 42.3601,
  longitude: -71.0589,
  bearing: 90,
  speed: 10,
  timestamp: 1780791463,
});

describe('useVehicles', () => {
  beforeEach(() => {
    FakeWebSocket.instances = [];
    vi.stubGlobal('WebSocket', FakeWebSocket);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('starts with an empty list and opens one connection', () => {
    const { result } = renderHook(() => useVehicles());

    expect(result.current).toEqual([]);
    expect(FakeWebSocket.instances).toHaveLength(1);
    expect(latestSocket().url).toMatch(/^wss?:\/\//);
  });

  it('updates the vehicles when a message arrives', () => {
    const { result } = renderHook(() => useVehicles());
    const vehicles = [vehicle('v1'), vehicle('v2')];

    act(() => {
      latestSocket().onmessage?.({ data: JSON.stringify(vehicles) });
    });

    expect(result.current).toEqual(vehicles);
  });

  it('replaces the list with the newest message', () => {
    const { result } = renderHook(() => useVehicles());

    act(() => {
      latestSocket().onmessage?.({ data: JSON.stringify([vehicle('v1')]) });
    });
    act(() => {
      latestSocket().onmessage?.({ data: JSON.stringify([vehicle('v2')]) });
    });

    expect(result.current).toEqual([vehicle('v2')]);
  });

  it('logs a warning when the connection errors', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderHook(() => useVehicles());

    latestSocket().onerror?.();

    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('closes the connection on unmount', () => {
    const { unmount } = renderHook(() => useVehicles());

    unmount();

    expect(latestSocket().close).toHaveBeenCalledTimes(1);
  });

  it('falls back to localhost when VITE_WS_URL is not set', async () => {
    vi.stubEnv('VITE_WS_URL', undefined);
    vi.resetModules();

    // Import both after the reset so they share one copy of React
    const { renderHook } = await import('@testing-library/react');
    const { useVehicles: freshUseVehicles } = await import('./useVehicles');

    renderHook(() => freshUseVehicles());

    expect(latestSocket().url).toBe('ws://localhost:3001');
  });
});
