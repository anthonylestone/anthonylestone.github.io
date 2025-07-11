window.addEventListener('DOMContentLoaded', () => {
  const styles = getComputedStyle(document.documentElement);

  const trailSize  = parseFloat(styles.getPropertyValue('--trail-size'))          || 8;
  const G          = parseFloat(styles.getPropertyValue('--trail-gravity'))       || 0.001;
  const VEL_SCALE  = parseFloat(styles.getPropertyValue('--trail-velocity-scale'))|| 1;
  const BOOST      = parseFloat(styles.getPropertyValue('--trail-boost'))         || 0.2;
  const LIFETIME   = parseFloat(styles.getPropertyValue('--trail-lifetime'))      || 1000;

  let lastMouse = { x: 0, y: 0, time: null };

  document.addEventListener('mousemove', event => {
    const now = event.timeStamp;
    let vx = 0, vy = 0;

    if (lastMouse.time !== null) {
      const dt = now - lastMouse.time;
      if (dt > 0) {
        vx = ((event.clientX - lastMouse.x) / dt) * VEL_SCALE;
        vy = ((event.clientY - lastMouse.y) / dt) * VEL_SCALE;
      }
    }
    lastMouse = { x: event.clientX, y: event.clientY, time: now };

    // **random upward kick**:
    vy -= Math.random() * BOOST;

    // spawn droplet…
    const trail = document.createElement('div');
    trail.className = 'trail-circle';
    let x = event.clientX - trailSize/2;
    let y = event.clientY - trailSize/2;
    trail.style.left = `${x}px`;
    trail.style.top  = `${y}px`;
    document.body.appendChild(trail);

    // animate with gravity + fade
    const start = performance.now();
    let t0 = start;
    function animate(t) {
      const elapsed = t - start;
      const dt = t - t0;
      t0 = t;

      vy += G * dt; // gravity
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
  });
});
