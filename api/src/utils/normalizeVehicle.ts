import type { VehiclePosition } from '../types/vehicle';
import type { GtfsFeedEntity } from '../types/gtfs';
import { convertLong } from './convertLong';

export function normalizeVehicle(entity: GtfsFeedEntity): VehiclePosition {
  const v = entity.vehicle!;

  return {
    id: entity.id,
    routeId: v.trip?.routeId ?? 'unknown',
    latitude: v.position!.latitude,
    longitude: v.position!.longitude,
    bearing: v.position?.bearing ?? undefined,
    speed: v.position?.speed ?? undefined,
    timestamp: convertLong(v.timestamp),
  } satisfies VehiclePosition;
}

export function hasPosition(entity: GtfsFeedEntity): boolean {
  return !!entity.vehicle?.position;
}
