export interface VehiclePosition {
  id: string;
  routeId: string;
  latitude: number;
  longitude: number;
  bearing?: number;
  speed?: number;
  timestamp: number;
}
