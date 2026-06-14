import { Link } from 'react-router-dom';

import styles from './TechStackPage.module.scss';

const TechStackPage = () => {
  return (
    <div className={styles.page}>
      <Link to='/' className={styles.backLink}>
        ← Back to Map
      </Link>
      <h1>Tech Stack</h1>
    </div>
  );
};

export { TechStackPage };
