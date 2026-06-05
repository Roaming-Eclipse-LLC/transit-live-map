import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { useVehicles } from '../../hooks/useVehicles';
import { createArrowImage } from '../../utils/arrowImage';

import { LoadingOverlay } from '../LoadingOverlay';

import styles from './Map.module.scss';

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;
const SOURCE_ID = 'vehicles';
const LAYER_ID = 'vehicle-circles';
const IMAGE_ID = 'vehicle-arrow';

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

      const arrowImage = createArrowImage(40);
      map.current.addImage(IMAGE_ID, arrowImage);

      map.current.addSource(SOURCE_ID, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      map.current.addLayer({
        id: LAYER_ID,
        type: 'symbol',
        source: SOURCE_ID,
        layout: {
          'icon-image': IMAGE_ID,
          'icon-size': 0.6,
          'icon-rotate': ['get', 'bearing'],
          'icon-rotation-alignment': 'map',
          'icon-allow-overlap': true,
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

  const isLoading = !mapLoaded || vehicles.length === 0;

  return (
    <div className={styles.mapWrapper}>
      {isLoading && <LoadingOverlay />}
      <div ref={mapContainer} className={styles.mapContainer} />
    </div>
  );
};

export { Map };
