class Nucleon {
    constructor({ type, pos, vel, zIndex }, idx) {
        this.type = type;
        this.pos = { ...pos };
        this.vel = { ...vel };
        this.el = document.createElement('div');
        this.el.classList.add('nucleon', type);
        this.el.id = `${type}-${idx}`;
        // assign the unique stacking order
        this.el.style.zIndex = zIndex;
        document.body.appendChild(this.el);
    }
}

class Nucleus {
    constructor({ Z, A, radius, offset }) {
        const s = getComputedStyle(document.documentElement);
        this.k = +s.getPropertyValue('--ho-spring-constant') || 4;
        this.maxDT = +s.getPropertyValue('--ho-max-dt') || 0.05;
        this.offset = offset || { x: 0, y: 0 };
        const nucSize = parseFloat(s.getPropertyValue('--nucleon-size')) || 20;
        this.halfSize = nucSize / 2;

        // --- compute effective radius so that for A=2 it's exactly `radius` ---
        const correctedRadius = radius / Math.sqrt(2);

        // generate one shuffled z-index per nucleon
        const zIndices = Array.from({ length: A }, (_, i) => 1000 + i);
        for (let i = zIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [zIndices[i], zIndices[j]] = [zIndices[j], zIndices[i]];
        }

        // angles: 0°, 90°, 45°, 135°, then random
        const first = [0, Math.PI / 2, Math.PI / 4, 3 * Math.PI / 4];
        const pairCount = Math.ceil(A / 2);
        const angles = Array.from({ length: pairCount }, (_, i) =>
            i < first.length ? first[i] : Math.random() * 2 * Math.PI
        );

        let remP = Z, rem = A;
        this.particles = [];

        for (let i = 0; i < pairCount; i++) {
            // effective radius for this pair
            const effectiveRadius = correctedRadius * Math.sqrt((i + 1) * 2);

            const θ = angles[i];

            // uniform in disk up to effectiveRadius
            const r = Math.sqrt(Math.random()) * effectiveRadius;
            const dx = r * Math.cos(θ),
                dy = r * Math.sin(θ);

            // compute radial speed so turning radius is exactly effectiveRadius
            const vmag = Math.sqrt(
                Math.max(this.k * (effectiveRadius * effectiveRadius - r * r), 0)
            );

            // 50/50 outward or inward
            const sign = Math.random() < 0.5 ? -1 : 1;

            for (let side = 0; side < 2; side++) {
                if (this.particles.length >= A) break;

                // pick proton vs neutron
                let type;
                if (remP === rem) type = 'proton';
                else if (remP === 0) type = 'neutron';
                else type = (Math.random() < remP / rem) ? 'proton' : 'neutron';
                if (type === 'proton') remP--; rem--;

                // symmetric positions
                const pos = {
                    x: side === 0 ? dx : -dx,
                    y: side === 0 ? dy : -dy
                };

                // radial unit vector
                const mag = Math.hypot(pos.x, pos.y);
                const ux = mag > 0 ? pos.x / mag : 0;
                const uy = mag > 0 ? pos.y / mag : 0;

                const vel = { x: sign * vmag * ux, y: sign * vmag * uy };

                 // grab a unique z-index
                const zIndex = zIndices.shift();

                this.particles.push(
                    new Nucleon({ type, pos, vel, zIndex }, this.particles.length)
                );
            }
        }

        this.lastTime = performance.now();
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) this.lastTime = performance.now();
        });
        this._step = this._step.bind(this);
    }

    _step(now) {
        let dt = (now - this.lastTime) / 1000;
        dt = Math.min(dt, this.maxDT);
        this.lastTime = now;

        // velocity‐Verlet in 2D
        for (const p of this.particles) {
            const { pos, vel } = p;
            const a1 = { x: -this.k * pos.x, y: -this.k * pos.y };
            pos.x += vel.x * dt + 0.5 * a1.x * dt * dt;
            pos.y += vel.y * dt + 0.5 * a1.y * dt * dt;
            const a2 = { x: -this.k * pos.x, y: -this.k * pos.y };
            vel.x += 0.5 * (a1.x + a2.x) * dt;
            vel.y += 0.5 * (a1.y + a2.y) * dt;
        }

        // render at (center + offset)
        const cx = window.innerWidth / 2 + this.offset.x;
        const cy = window.innerHeight / 2 + this.offset.y;
        for (const p of this.particles) {
            p.el.style.left = `${cx + p.pos.x - this.halfSize}px`;
            p.el.style.top = `${cy + p.pos.y - this.halfSize}px`;
        }

        requestAnimationFrame(this._step);
    }

    start() {
        requestAnimationFrame(this._step);
    }
}

// Usage example:
window.addEventListener('DOMContentLoaded', () => {
    const nucleus = new Nucleus({
        Z: 92,
        A: 238,
        radius: 6,            // your deuterium radius
        offset: { x: 0, y: 0 }
    });
    nucleus.start();
});
