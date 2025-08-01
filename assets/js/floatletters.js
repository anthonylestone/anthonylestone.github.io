// assets/js/floatletters.js

console.log('▶ floatletters.js loaded');

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('article.clearfix');
  if (!container) {
    console.error('✖ floatletters: container not found');
    return;
  }
  wrapLetters(container);
  container.addEventListener('click', onLetterClick);
});

function wrapLetters(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
  const nodes = [];
  let n;
  while (n = walker.nextNode()) nodes.push(n);
  nodes.forEach(textNode => {
    if (textNode.parentElement.tagName === 'A') return;
    const frag = document.createDocumentFragment();
    textNode.textContent.split('').forEach(ch => {
      if (/\s/.test(ch)) {
        frag.appendChild(document.createTextNode(ch));
      } else {
        const span = document.createElement('span');
        span.className = 'floatletter';
        span.textContent = ch;
        frag.appendChild(span);
      }
    });
    textNode.parentNode.replaceChild(frag, textNode);
  });
}

function onLetterClick(e) {
  const el = e.target;
  if (!el.classList.contains('floatletter')) return;

  // FIRST click: loosen
  if (!el.classList.contains('loose')) {
    const maxA = cssNum('--loosen-rotation-range');
    const angle = (Math.random() * 2 - 1) * maxA;
    el.style.setProperty('--angle', `${angle}deg`);
    el.classList.add('loose');
    return;
  }

  // ignore if already floating
  if (el.classList.contains('floating')) return;

  // grab position
  const rect = el.getBoundingClientRect();
  const scrollY = window.scrollY || document.documentElement.scrollTop;
  let x = rect.left;
  let y = rect.top + scrollY;

  // clone & style
  const clone = el.cloneNode(true);
  Object.assign(clone.style, {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    pointerEvents: 'none',
    visibility: 'visible'
  });
  clone.classList.add('floating');
  document.body.appendChild(clone);

  // footer collision setup
  const footer = document.querySelector('footer');
  function getFooterTop() {
    if (!footer) return Infinity;
    const rect = footer.getBoundingClientRect();
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    return rect.top + scrollY;
  }
  const floorBuffer = 2; // px gap so it doesn't visually overlap


  // copy font styles
  const cs = getComputedStyle(el);
  [
    'font', 'font-size', 'font-family', 'font-weight',
    'font-style', 'line-height', 'letter-spacing',
    'text-transform', 'color'
  ].forEach(p =>
    clone.style.setProperty(p, cs.getPropertyValue(p))
  );

  // hide original & prepare for recovery
  el.style.transition = '';           // clear any old transitions
  el.style.transform = '';           // reset rotation
  el.classList.remove('loose');          // clear loose state
  el.style.opacity = '0';
  el.style.visibility = 'hidden';
  el.style.pointerEvents = 'none';       // disable clicks

  // read CSS vars (all durations in ms)
  const g = cssNum('--gravity');
  const vT = cssNum('--terminal-velocity');
  const dragC = g / vT;
  const rR = cssNum('--rotation-speed-range');
  const fStd = cssNum('--sway-force-std');
  const pdMin = cssNum('--sway-push-duration-min');
  const pdMax = cssNum('--sway-push-duration-max');
  const fadeSt = cssNum('--fade-start') * 1000;
  const fadeDu = cssNum('--fade-duration') * 1000;
  const recStart = cssNum('--recover-start') * 1000;
  const recDur = cssNum('--recover-duration') * 1000;

  // remove clone after its fade-out
  setTimeout(() => clone.remove(), fadeSt + fadeDu);

  // schedule original fade-in
  setTimeout(() => {
    el.style.visibility = 'visible';
    el.style.transition = `opacity ${recDur / 1000}s ease`;
    // force reflow to pick up transition
    void el.offsetWidth;
    el.style.opacity = '1';
  }, recStart);

  // re-enable click & clean up after fade-in
  setTimeout(() => {
    el.style.transition = '';
    el.style.opacity = '';
    el.style.pointerEvents = '';  // clickable again
  }, recStart + recDur);

  // physics setup
  const initA = parseFloat(el.style.getPropertyValue('--angle'));
  const rSpeed = (Math.random() * 2 - 1) * rR;
  let pushFx = randNorm() * fStd;
  let pushDur = pdMin + Math.random() * (pdMax - pdMin);
  let pushElapsed = 0;
  let vx = 0, vy = 0, t = 0, lastTs = performance.now();

  function step(now) {
    const dt = (now - lastTs) / 1000; lastTs = now; t += dt;

    // 1) gravity
    const Fg = g;
    // 2) drag
    const Fdx = -dragC * vx;
    const Fdy = -dragC * vy;
    // 3) random sway
    pushElapsed += dt;
    if (pushElapsed >= pushDur) {
      pushFx = randNorm() * fStd;
      pushDur = pdMin + Math.random() * (pdMax - pdMin);
      pushElapsed = 0;
    }
    const Frx = pushFx, Fry = 0;
    // 4) sum → accel
    const ax = Fdx + Frx;
    const ay = Fg + Fdy;
    // 5) integrate vel
    vx += ax * dt;
    vy += ay * dt;
    // 6) cap at terminal speed
    const speed = Math.hypot(vx, vy);
    if (speed > vT) {
      const f = vT / speed;
      vx *= f; vy *= f;
    }
    // 7) integrate pos
    x += vx * dt;
    y += vy * dt;

    // --------- floor collision against footer ----------
    const footerTop = getFooterTop();
    const cloneHeight = clone.offsetHeight || 0;
    const wouldOverlap = y + cloneHeight >= footerTop - floorBuffer;
    if (wouldOverlap) {
      // snap to just above footer and stop the animation
      y = footerTop - cloneHeight - floorBuffer;
      vx = 0;
      vy = 0;
      // optionally ease out rotation (could freeze)
      // apply final transform and then stop
      const rot = initA + rSpeed * t;
      clone.style.left = `${x}px`;
      clone.style.top = `${y}px`;
      clone.style.transform = `rotate(${rot}deg)`;
      // don't request another frame: settle here
      return;
    }
    // -------------------------------------------------

    // 8) rotation
    const rot = initA + rSpeed * t;
    // 9) apply to clone
    clone.style.left = `${x}px`;
    clone.style.top = `${y}px`;
    clone.style.transform = `rotate(${rot}deg)`;
    requestAnimationFrame(step);
  }


  requestAnimationFrame(step);
}

function cssNum(name) {
  return parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue(name)
  );
}

function randNorm() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
