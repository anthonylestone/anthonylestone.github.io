// assets/js/particle.js

/**
 * Draws a looping particle from left→right inside the given container.
 * @param {string} selector – a CSS selector for your container <div>
 */
export function initParticleLoop(selector) {
  const container = document.querySelector(selector);
  if (!container) return;
  const width  = container.clientWidth;
  const height = container.clientHeight;

  // make a canvas and size it to fill the container
  const canvas = document.createElement('canvas');
  canvas.width  = width;
  canvas.height = height;
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let x = 0;
  const speed = 2;
  const radius = Math.min(width, height) * 0.05;

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.arc(x, height / 2, radius, 0, Math.PI * 2);
    ctx.fill();
    x += speed;
    if (x - radius > width) x = -radius;
    requestAnimationFrame(draw);
  }

  draw();
}
