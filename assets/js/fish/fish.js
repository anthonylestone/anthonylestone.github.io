(function () {
  function startFishTail() {
    const tail = document.querySelector("#tail");
    if (!tail) return; // nothing to do

    // Tail parameters
    const maxWidth = 30;            // px, matches initial border-left width
    const flapAmplitude = 32;       // degrees, ±20° oscillation
    const flapFrequencyHz = 0.8;    // flaps per second

    // Color parameters for subtle light/dark shift with angle
    const baseHue = 200;            // blue-ish
    const baseSaturation = 80;      // %
    const baseLightness = 55;       // % mid-tone
    const lightnessDelta = 2;       // how much lighter/darker at extremes

    // Time bookkeeping for proper Hz-based motion
    const startTime = performance.now();

    function animate() {
      const now = performance.now();
      const elapsedSeconds = (now - startTime) / 1000; // ms → s

      // Tail angle: θ(t) = A sin(2π f t)
      const angleDeg =
        flapAmplitude *
        Math.sin(2 * Math.PI * flapFrequencyHz * elapsedSeconds);
      const angleRad = (angleDeg * Math.PI) / 180;

      // Width proportional to cos(angle):
      // angle = 0°  → width = maxWidth (full tail)
      // angle = 90° → width = 0 (tail disappears)
      const width = maxWidth * Math.cos(angleRad);

      // Keep left vertex fixed: only change the tail "depth" (border width)
      tail.style.borderLeftWidth = width + "px";

      // Color shift: lighter for positive angles, darker for negative
      const normalized = Math.max(-1, Math.min(1, angleDeg / flapAmplitude));
      const lightness = baseLightness + lightnessDelta * normalized;
      tail.style.borderLeftColor = `hsl(${baseHue} ${baseSaturation}% ${lightness}%)`;

      // Anchor the vertex
      tail.style.transform = "translate(-100%, -50%)";

      requestAnimationFrame(animate);
    }

    animate();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startFishTail);
  } else {
    startFishTail();
  }
})();
