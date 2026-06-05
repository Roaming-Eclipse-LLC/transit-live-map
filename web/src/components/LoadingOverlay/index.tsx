import styles from './LoadingOverlay.module.scss';

interface Props {
  message?: string;
}

const LoadingOverlay = ({ message = 'Loading transit data...' }: Props) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.spinner} />
      <p className={styles.message}>{message}</p>
    </div>
  );
};

export { LoadingOverlay };
