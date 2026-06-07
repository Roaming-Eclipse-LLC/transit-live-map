import { type VehiclePosition } from '../../types/vehicle';

import styles from './VehiclePanel.module.scss';

interface Props {
  vehicle: VehiclePosition | null;
  onClose: () => void;
}

const VehiclePanel = ({ vehicle, onClose }: Props) => {
  const isVisible = vehicle !== null;

  return (
    <div className={`${styles.panel} ${isVisible ? styles.visible : ''}`}>
      {vehicle && (
        <>
          <div className={styles.header}>
            <h2 className={styles.route}>Route {vehicle.routeId}</h2>
            <button className={styles.closeButton} onClick={onClose}>
              X
            </button>
          </div>

          <div className={styles.details}>
            <div className={styles.detail}>
              <span className={styles.label}>Vehicle</span>
              <span className={styles.value}>{vehicle.id}</span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>Speed</span>
              <span className={styles.value}>
                {vehicle.speed && vehicle.speed > 0
                  ? `${(vehicle.speed * 2.23694).toFixed(1)} mph`
                  : 'Stopped'}
              </span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>Bearing</span>
              <span className={styles.value}>
                {vehicle.bearing !== undefined ? `${vehicle.bearing}°` : '-'}
              </span>
            </div>

            <div className={styles.detail}>
              <span className={styles.label}>Last Updated</span>
              <span className={styles.value}>
                {new Date(vehicle.timestamp * 1000).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export { VehiclePanel };
