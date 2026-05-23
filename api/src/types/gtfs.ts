export interface GtfsPosition {
    latitude: number;
    longitude: number;
    bearing?: number;
    speed?: number;
}

export interface GtfsVehicleDescriptor {
    id?: string;
}

export interface GtfsTrip {
    routeId?: string;
}

export interface GtfsVehiclePosition {
    position?: GtfsPosition;
    trip?: GtfsTrip;
    vehicle?: GtfsVehicleDescriptor;
    timestamp?: number;
}

export interface GtfsFeedEntity {
    id: string;
    vehicle?: GtfsVehiclePosition;
}

export interface GtfsFeedMessage {
    entity: GtfsFeedEntity[];
}