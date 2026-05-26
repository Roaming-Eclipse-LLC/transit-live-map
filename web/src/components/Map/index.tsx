import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import styles from './Map.module.scss';

const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

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

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  return <div ref={mapContainer} className={styles.mapContainer} />;
};

export default Map;
