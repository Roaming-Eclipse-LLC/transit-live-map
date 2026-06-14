import { Map } from '../../components/Map';

import styles from './MapPage.module.scss';

const MapPage = () => {
  return (
    <div className={styles.page}>
      <Map />
    </div>
  );
};

export { MapPage };
