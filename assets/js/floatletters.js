// assets/js/floatletters.js

console.log('▶ floatletters.js loaded');

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('article.clearfix');
  if (!container) {
    console.error('✖ floatletters: container not found');
    return;
  }

  wrapLetters(container);
  console.log(
    '✔ floatletters: wrapped',
    container.querySelectorAll('span.floatletter').length,
    'letters'
  );

  container.addEventListener('click', onLetterClick);
});

/** 
 * Recursively wrap every non‑space char in a span.floatletter,
 * skipping any text inside <a> tags so links stay clickable.
 */
function wrapLetters(root) {
  // Use TreeWalker to grab text nodes only
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  const textNodes = [];
  let node;
  while (node = walker.nextNode()) textNodes.push(node);

  textNodes.forEach(textNode => {
    // don’t touch text inside links
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
    const maxA = parseFloat(
      getComputedStyle(document.documentElement)
        .getPropertyValue('--loosen-rotation-range')
    );
    const angle = (Math.random() * 2 - 1) * maxA;
    el.style.setProperty('--angle', `${angle}deg`);
    el.classList.add('loose');
    return;
  }

  // SECOND click: if already floating, do nothing
  if (el.classList.contains('floating')) return;

  // Otherwise spawn a physics‑driven clone
  const rect    = el.getBoundingClientRect();
  const scrollY = window.scrollY || document.documentElement.scrollTop;
  let   x       = rect.left;
  let   y       = rect.top + scrollY;

  // clone & hide original
  const clone = el.cloneNode(true);
  Object.assign(clone.style, {
    position:      'absolute',
    left:          `${x}px`,
    top:           `${y}px`,
    pointerEvents: 'none',
    visibility:    'visible'
  });
  clone.classList.add('floating');
  // 1) Append the clone so it has layout (needed for getComputedStyle)
    document.body.appendChild(clone);

    // 2) Copy computed font styles from the original <span> to the clone
    const cs = window.getComputedStyle(el);
    [
        'font',
        'font-size',
        'font-family',
        'font-weight',
        'font-style',
        'line-height',
        'letter-spacing',
        'text-transform',
        'color'
    ].forEach(prop => {
        clone.style.setProperty(prop, cs.getPropertyValue(prop));
    });

    // 3) Now you can hide the original and start the physics:
    el.style.visibility = 'hidden';
  el.style.visibility = 'hidden';

  // read CSS vars
  const g      = cssNum('--gravity');                   
  const vT     = cssNum('--terminal-velocity');         
  const dragC  = g / vT;                                
  const rR     = cssNum('--rotation-speed-range');      
  const fStd   = cssNum('--sway-force-std');            
  const pdMin  = cssNum('--sway-push-duration-min');    
  const pdMax  = cssNum('--sway-push-duration-max');    
  const fadeSt = cssNum('--fade-start') * 1000;         
  const fadeDu = cssNum('--fade-duration') * 1000;      

  // remove after fade
  setTimeout(() => clone.remove(), fadeSt + fadeDu);

  // initial rotation
  const initA  = parseFloat(el.style.getPropertyValue('--angle'));
  const rSpeed = (Math.random() * 2 - 1) * rR;

  // random sway cycle
  let pushFx      = randNorm() * fStd;
  let pushDur     = pdMin + Math.random() * (pdMax - pdMin);
  let pushElapsed = 0;

  // dynamics state
  let vx     = 0, vy = 0;
  let t      = 0, lastTs = performance.now();
  const bottomY = window.innerHeight + scrollY;

  function step(now) {
    const dt = (now - lastTs) / 1000;
    lastTs = now;
    t += dt;

    // 1) Gravity
    const Fg = g;

    // 2) Drag
    const Fdx = -dragC * vx;
    const Fdy = -dragC * vy;

    // 3) Random sway (x only)
    pushElapsed += dt;
    if (pushElapsed >= pushDur) {
      pushFx      = randNorm() * fStd;
      pushDur     = pdMin + Math.random() * (pdMax - pdMin);
      pushElapsed = 0;
    }
    const Frx = pushFx, Fry = 0;

    // 4) Sum forces → acceleration
    const ax = Fdx + Frx;
    const ay = Fg  + Fdy;

    // 5) Integrate velocity
    vx += ax * dt;
    vy += ay * dt;

    // 6) Cap at terminal speed
    const speed = Math.hypot(vx, vy);
    if (speed > vT) {
      const f = vT / speed;
      vx *= f; vy *= f;
    }

    // 7) Integrate position
    x += vx * dt;
    y += vy * dt;

    // 8) Rotation
    const rot = initA + rSpeed * t;

    // 9) Apply to clone
    clone.style.left      = `${x}px`;
    clone.style.top       = `${Math.min(y, bottomY)}px`;
    clone.style.transform = `rotate(${rot}deg)`;

    if (y < bottomY) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

// read numeric CSS var helper
function cssNum(name) {
  return parseFloat(
    getComputedStyle(document.documentElement)
      .getPropertyValue(name)
  );
}

// Gaussian N(0,1)
function randNorm() {
  let u=0, v=0;
  while(u===0) u=Math.random();
  while(v===0) v=Math.random();
  return Math.sqrt(-2*Math.log(u)) * Math.cos(2*Math.PI*v);
}
