const elementSymbols = {
  1: 'H',   2: 'He',  3: 'Li',  4: 'Be',  5: 'B',   6: 'C',   7: 'N',   8: 'O',
  9: 'F',  10: 'Ne', 11: 'Na', 12: 'Mg', 13: 'Al', 14: 'Si', 15: 'P',  16: 'S',
 17: 'Cl', 18: 'Ar', 19: 'K',  20: 'Ca', 21: 'Sc', 22: 'Ti', 23: 'V',  24: 'Cr',
 25: 'Mn', 26: 'Fe', 27: 'Co', 28: 'Ni', 29: 'Cu', 30: 'Zn', 31: 'Ga', 32: 'Ge',
 33: 'As', 34: 'Se', 35: 'Br', 36: 'Kr', 37: 'Rb', 38: 'Sr', 39: 'Y',  40: 'Zr',
 41: 'Nb', 42: 'Mo', 43: 'Tc', 44: 'Ru', 45: 'Rh', 46: 'Pd', 47: 'Ag', 48: 'Cd',
 49: 'In', 50: 'Sn', 51: 'Sb', 52: 'Te', 53: 'I',  54: 'Xe', 55: 'Cs', 56: 'Ba',
 57: 'La', 58: 'Ce', 59: 'Pr', 60: 'Nd', 61: 'Pm', 62: 'Sm', 63: 'Eu', 64: 'Gd',
 65: 'Tb', 66: 'Dy', 67: 'Ho', 68: 'Er', 69: 'Tm', 70: 'Yb', 71: 'Lu', 72: 'Hf',
 73: 'Ta', 74: 'W',  75: 'Re', 76: 'Os', 77: 'Ir', 78: 'Pt', 79: 'Au', 80: 'Hg',
 81: 'Tl', 82: 'Pb', 83: 'Bi', 84: 'Po', 85: 'At', 86: 'Rn', 87: 'Fr', 88: 'Ra',
 89: 'Ac', 90: 'Th', 91: 'Pa', 92: 'U',  93: 'Np',94: 'Pu',95: 'Am',96: 'Cm',
 97: 'Bk',98: 'Cf',99: 'Es',100:'Fm',101:'Md',102:'No',103:'Lr',104:'Rf',
105:'Db',106:'Sg',107:'Bh',108:'Hs',109:'Mt',110:'Ds',111:'Rg',112:'Cn',
113:'Nh',114:'Fl',115:'Mc',116:'Lv',117:'Ts',118:'Og'
};

class Nucleon {
  constructor({ type, pos, vel, zIndex }, idx) {
    this.type = type;
    this.pos  = { ...pos };
    this.vel  = { ...vel };
    this.el   = document.createElement('div');
    this.el.classList.add('nucleon', type);
    this.el.id = `${type}-${idx}`;
    this.el.style.zIndex = zIndex;                 // unique stacking
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

        // label stuff
        this.Z = Z;
        this.A = A;
        this.effectiveRadius = correctedRadius * Math.sqrt(pairCount * 2);
        const sym = elementSymbols[this.Z] || this.Z;
        this.label = document.createElement('div');
        this.label.id = 'nucleus-label';
        this.label.textContent = `${sym}-${this.A}`;
        Object.assign(this.label.style, {
            position: 'fixed',
            transform: 'translateX(-50%)',
            fontSize: '1rem',
            zIndex: '1003',
            color: getComputedStyle(document.documentElement)
                .getPropertyValue('--global-text-color').trim(),
        });
        document.body.appendChild(this.label);

        // fill all the nucleons

        for (let i = 0; i < pairCount; i++) {
            // special case: a single nucleon sits dead-center
            if (A === 1) {
                // grab one z-index
                const zIndex = zIndices.shift();
                // it must be a proton (Z=1)
                const type = 'proton';
                // center position & zero velocity
                const pos = { x: 0, y: 0 };
                const vel = { x: 0, y: 0 };
                this.particles.push(
                    new Nucleon({ type, pos, vel, zIndex }, 0)
                );
                // skip the rest of the pair logic
                break;
            }
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

        const top = cy + this.effectiveRadius + 20;   // 12px below the outer ring
        this.label.style.left = `${cx}px`;
        this.label.style.top = `${top}px`;

        requestAnimationFrame(this._step);
    }

    start() {

        if (this.A <= 1) {
            const cx = window.innerWidth / 2 + this.offset.x;
            const cy = window.innerHeight / 2 + this.offset.y;
            // position the lone nucleon
            const p = this.particles[0];
            p.el.style.left = `${cx + p.pos.x - this.halfSize}px`;
            p.el.style.top = `${cy + p.pos.y - this.halfSize}px`;
            // position the label just below
            const top = cy + this.effectiveRadius + 20;
            this.label.style.left = `${cx}px`;
            this.label.style.top = `${top}px`;
            return;
        }

        requestAnimationFrame(this._step);
    }
}

// Usage example:
/*
window.addEventListener('DOMContentLoaded', () => {
    const u238 = new Nucleus({
        Z: 92,
        A: 238,
        radius: 6,            // your deuterium radius
        offset: { x: 0, y: 0 }
    });
    u238.start();
});
*/