// circle.js
window.addEventListener('DOMContentLoaded', () => {
  const styles = getComputedStyle(document.documentElement);
  const trailSize  = parseFloat(styles.getPropertyValue('--trail-size'))            || 8;
  const G          = parseFloat(styles.getPropertyValue('--trail-gravity'))         || 0.001;
  const VEL_SCALE  = parseFloat(styles.getPropertyValue('--trail-velocity-scale'))  || 1;
  const BOOST      = parseFloat(styles.getPropertyValue('--trail-boost'))           || 0.2;
  const LIFETIME   = parseFloat(styles.getPropertyValue('--trail-lifetime'))        || 1000;

  let last = { x: 0, y: 0, time: null };

  function handleMove(xPos, yPos, timeStamp) {
    let vx = 0, vy = 0;
    if (last.time !== null) {
      const dt = timeStamp - last.time;
      if (dt > 0) {
        vx = ((xPos - last.x) / dt) * VEL_SCALE;
        vy = ((yPos - last.y) / dt) * VEL_SCALE;
      }
    }
    last = { x: xPos, y: yPos, time: timeStamp };
    vy -= Math.random() * BOOST;

    const trail = document.createElement('div');
    trail.className = 'trail-circle';
    let x = xPos - trailSize / 2;
    let y = yPos - trailSize / 2;
    trail.style.left = `${x}px`;
    trail.style.top  = `${y}px`;
    document.body.appendChild(trail);

    const start = performance.now();
    let prev = start;
    function animate(now) {
      const elapsed = now - start;
      const dt      = now - prev;
      prev = now;

      vy += G * dt;
      x  += vx * dt;
      y  += vy * dt;

      const p = elapsed / LIFETIME;
      trail.style.left    = `${x}px`;
      trail.style.top     = `${y}px`;
      trail.style.opacity = `${Math.max(1 - p, 0)}`;

      if (p < 1) requestAnimationFrame(animate);
      else       trail.remove();
    }
    requestAnimationFrame(animate);
  }

  // SINGLE listener, covers mouse + touch
  document.addEventListener('pointermove', e => {
    handleMove(e.clientX, e.clientY, e.timeStamp);
  });
});
