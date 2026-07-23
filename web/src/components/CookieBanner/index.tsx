import { useState } from 'react';

import styles from './CookieBanner.module.scss';

const CONSENT_KEY = 'cookieConsent';

interface Props {
  onAccept: () => void;
}

const CookieBanner = ({ onAccept }: Props) => {
  const [visible, setVisible] = useState(
    () => !localStorage.getItem(CONSENT_KEY),
  );

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'true');
    setVisible(false);
    onAccept();
  };

  if (!visible) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.banner}>
        <p className={styles.text}>
          This site uses cookies and collects anonymous usage data to improve
          your experience. Map tiles are provided by{' '}
          <a
            href='https://www.maptiler.com/privacy-policy/'
            target='_blank'
            rel='noopener noreferrer'
            className={styles.link}
          >
            MapTiler
          </a>
        </p>

        <button className={styles.button} onClick={handleAccept}>
          Accept
        </button>
      </div>
    </div>
  );
};

export { CookieBanner };
