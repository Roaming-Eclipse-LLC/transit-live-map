import { Map } from '../../components/Map';

import styles from './MapPage.module.scss';

interface Props {
  hideLoadingOverlay?: boolean;
  consented?: boolean;
}

const MapPage = ({ hideLoadingOverlay, consented }: Props) => {
  return (
    <div className={styles.page}>
      <Map hideLoadingOverlay={hideLoadingOverlay} consented={consented} />
    </div>
  );
};

export { MapPage };
