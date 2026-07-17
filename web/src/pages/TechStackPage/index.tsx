import { techStackSections } from '../../data/techStack';
import type { TechItem, TechSection } from '../../types/techStack';

import styles from './TechStackPage.module.scss';

const TechCard = ({ name, description }: TechItem) => {
  return (
    <div className={styles.card}>
      <span className={styles.cardName}>{name}</span>
      <span className={styles.cardDescription}>{description}</span>
    </div>
  );
};

const TechSection = ({ title, items }: TechSection) => {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>

      <div className={styles.grid}>
        {items.map((item) => (
          <TechCard key={item.name} {...item} />
        ))}
      </div>
    </section>
  );
};

const TechStackPage = () => {
  return (
    <div className={styles.pages}>
      <div className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>Transit Live Map</h1>

          <p className={styles.subtitle}>
            A real-time transit vehicle tracking application powered by the MBTA
            GTFS-RT vehicle positions feed. Built to demonstrate a
            production-minded, full-stack real-time system.
          </p>
        </header>

        {techStackSections.map((section) => (
          <TechSection key={section.title} {...section} />
        ))}

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Architecture Highlights</h2>

          <div className={styles.highlights}>
            <div className={styles.highlight}>
              <h3 className={styles.highlightTitle}>Real-Time Data Pipeline</h3>

              <p className={styles.highlightText}>
                Polls the MBTA GTFS-RT feed every 10 seconds, decodes binary
                protobuf data, and broadcasts normalized vehicle positions to
                all connected clients via WebSocket.
              </p>
            </div>

            <div className={styles.highlight}>
              <h3 className={styles.highlightTitle}>Decoupled Architecture</h3>

              <p className={styles.highlightText}>
                The backend has no knowledge of the frontend — it only exposes a
                WebSocket stream. This makes it easy to swap or add frontends,
                or adapt to a different transit agency's feed.
              </p>
            </div>

            <div className={styles.highlight}>
              <h3 className={styles.highlightTitle}>
                Production-Minded Deployment
              </h3>

              <p className={styles.highlightText}>
                Multi-stage Docker build for a lean production image, deployed
                to Fly.io for persistent WebSocket support, with the frontend on
                Vercel for fast global delivery.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export { TechStackPage };
