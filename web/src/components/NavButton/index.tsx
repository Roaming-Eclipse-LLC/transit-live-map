import { Link } from 'react-router-dom';

import styles from './NavButton.module.scss';
import { useState } from 'react';

const NavButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.navButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label='Toggle navigation'
      >
        <span className={styles.bar} />
        <span className={styles.bar} />
        <span className={styles.bar} />
      </button>

      {isOpen && (
        <nav className={styles.menu}>
          <Link
            to='/'
            className={styles.menuLink}
            onClick={() => setIsOpen(false)}
          >
            Map
          </Link>
          <Link
            to='/tech-stack'
            className={styles.menuLink}
            onClick={() => setIsOpen(false)}
          >
            Tech Stack
          </Link>
        </nav>
      )}
    </div>
  );
};

export { NavButton };
