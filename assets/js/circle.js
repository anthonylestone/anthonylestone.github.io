// circle.js
window.addEventListener('DOMContentLoaded', () => {
//   const circle = document.getElementById('circle');
  const styles = getComputedStyle(document.documentElement);

  // pull in our CSS vars
  const trailDistance = styles.getPropertyValue('--trail-distance').trim();
  const trailSize     = parseFloat(styles.getPropertyValue('--trail-size'))       || 8;
  const fallDuration  = parseFloat(styles.getPropertyValue('--trail-fall-duration')) || 800;
  const fadeDuration  = parseFloat(styles.getPropertyValue('--trail-fade-duration')) || fallDuration;

  document.addEventListener('mousemove', event => {
    // 1) move the main circle
    // const x = event.clientX - circle.offsetWidth  / 2;
    // const y = event.clientY - circle.offsetHeight / 2;
    // circle.style.transform = `translate(${x}px, ${y}px)`;

    // 2) spawn a tiny trail circle
    const trail = document.createElement('div');
    trail.className = 'trail-circle';
    trail.style.left = `${event.clientX - trailSize/2}px`;
    trail.style.top  = `${event.clientY - trailSize/2}px`;
    document.body.appendChild(trail);

    // 3) on next frame, trigger fall+fade
    requestAnimationFrame(() => {
      trail.style.transform = `translateY(${trailDistance})`;
      trail.style.opacity   = '0';
    });

    // 4) clean up after animation finishes
    const cleanupDelay = Math.max(fallDuration, fadeDuration);
    setTimeout(() => trail.remove(), cleanupDelay);
  });
});
