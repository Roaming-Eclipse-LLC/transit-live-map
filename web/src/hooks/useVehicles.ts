import { useEffect, useState } from 'react';

import type { VehiclePosition } from '../types/vehicle';

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:3001';

export const useVehicles = (): VehiclePosition[] => {
  const [vehicles, setVehicles] = useState<VehiclePosition[]>([]);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data) as VehiclePosition[];

      setVehicles(data);
    };

    ws.onerror = () => {
      console.warn('WebSocket connection failed - retrying...');
    };

    return () => {
      ws.close();
    };
  }, []);

  return vehicles;
};
