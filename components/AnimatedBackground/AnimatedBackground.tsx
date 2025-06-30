import styles from './AnimatedBackground.module.css';

export function AnimatedBackground() {
  return (
    <div className={styles.animatedBg}>
      <div className={styles.circle + ' ' + styles.circle1}></div>
      <div className={styles.circle + ' ' + styles.circle2}></div>
      <div className={styles.circle + ' ' + styles.circle3}></div>
      <div className={styles.circle + ' ' + styles.circle4}></div>
      {/* Add more circles as desired */}
    </div>
  );
}
