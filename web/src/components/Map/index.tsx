import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { useVehicles } from '../../hooks/useVehicles';

import styles from './Map.module.scss';

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;
const SOURCE_ID = 'vehicles';
const LAYER_ID = 'vehicle-circles';

const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);

  const vehicles = useVehicles();

  useEffect(() => {
    if (map.current || !mapContainer.current) {
      return;
    }

    if (!MAPTILER_KEY) {
      throw new Error('Missing VITE_MAPTILER_KEY in .env');
    }

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `
        https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}
    `,
      center: [-71.0589, 42.3601], // Current location of the MBTA (Boston, MA)
      zoom: 12,
    });

    map.current.on('load', () => {
      if (!map.current) {
        return;
      }

      map.current.addSource(SOURCE_ID, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      map.current.addLayer({
        id: LAYER_ID,
        type: 'circle',
        source: SOURCE_ID,
        paint: {
          'circle-radius': 6,
          'circle-color': '#0aacbb',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#000000',
        },
      });

      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    console.log(`Received ${vehicles.length} vehicles`);

    const m = map.current;

    if (!m || !mapLoaded) {
      return;
    }

    const source = m.getSource(SOURCE_ID) as maplibregl.GeoJSONSource;

    if (!source) {
      return;
    }

    source.setData({
      type: 'FeatureCollection',
      features: vehicles.map((v) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [v.longitude, v.latitude],
        },
        properties: {
          id: v.id,
          routeId: v.routeId,
          bearing: v.bearing ?? 0,
          speed: v.speed ?? 0,
        },
      })),
    });
  }, [vehicles, mapLoaded]);

  return <div ref={mapContainer} className={styles.mapContainer} />;
};

export default Map;
