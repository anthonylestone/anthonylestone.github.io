// assets/js/koi/koiSide.js  (fixed coords + nicer look)
(function () {
  const KoiSide = {};
  let pInst = null;

  KoiSide.start = function start(opts = {}) {
    if (pInst) return pInst;
    const sketch = (p) => {
      // -------- config --------
      const segCount   = opts.segCount   ?? 18;
      const segSpacing = opts.segSpacing ?? 18;
      const baseSpeed  = opts.baseSpeed  ?? 36;
      const chaseSpeed = opts.chaseSpeed ?? 82;
      const maxTurn    = opts.maxTurn    ?? 2.1;     // rad/s
      const noticeDist = opts.noticeDist ?? 220;     // px
      const biteRadius = opts.biteRadius ?? 18;      // px
      const waveAmp    = opts.waveAmp    ?? 12;
      const waveLen    = opts.waveLen    ?? 140;
      const waveHz     = opts.waveHz     ?? 1.1;

      // growth
      let scale = 1.0, scaleStep = 0.04, scaleMax = 1.8;

      // state
      let seg = Array.from({ length: segCount }, () => ({x:0,y:0}));
      let head = { x: 240, y: 240, a: 0 };
      let lastMs = 0;
      let roamTarget = null;

      // theme colors
      const css = (n)=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
      const colors = {
        body:   css('--koi-body')   || '#333',
        accent: css('--koi-accent') || '#0aa',
        shadow: css('--koi-shadow') || 'rgba(0,0,0,.15)'
      };

      // ----- helpers: viewport-based coordinates -----
      const footer = document.querySelector('footer');
      const floorY = () => {
        if (!footer) return Infinity;
        // top Y in **viewport coords**
        return footer.getBoundingClientRect().top;
      };

      function letters() {
        // only floating clones
        return Array.from(document.querySelectorAll('.floatletter.floating'));
      }
      function letterCenter(el){
        const r = el.getBoundingClientRect(); // viewport coords
        return { x: r.left + r.width/2, y: r.top + r.height/2, el };
      }
      function nearestLetter() {
        const L = letters();
        if (!L.length) return null;
        let best=null, bestD2=Infinity;
        for (const el of L){
          const c = letterCenter(el);
          const d2 = (c.x-head.x)**2 + (c.y-head.y)**2;
          if (d2 < bestD2){ bestD2=d2; best=c; best.d2=d2; }
        }
        return best;
      }

      function pickRoam(){
        const yMin = 60;
        const yMax = Math.min(floorY() - 60, p.height - 80);
        const yRangeTop = Number.isFinite(yMax) ? yMax : (p.height - 80);
        const safeMax = Math.max(yMin+1, yRangeTop);
        roamTarget = {
          x: 40 + Math.random()*(p.width - 80),
          y: yMin + Math.random()*(safeMax - yMin)
        };
      }

      const wrapAngle = (a)=> (a>Math.PI? a-2*Math.PI : a<-Math.PI? a+2*Math.PI : a);
      const angleDiff = (a,b)=> { let d=b-a; while(d>Math.PI)d-=2*Math.PI; while(d<-Math.PI)d+=2*Math.PI; return d; };
      const clamp = (mn,mx,v)=> Math.max(mn, Math.min(mx,v));

      function steer(target, dt, speed){
        const dx = target.x - head.x;
        const dy = target.y - head.y;
        const want = Math.atan2(dy, dx);
        let da = angleDiff(head.a, want);
        const maxDa = maxTurn * dt;
        da = clamp(-maxDa, maxDa, da);
        head.a = wrapAngle(head.a + da);
        head.x += Math.cos(head.a) * speed * dt;
        head.y += Math.sin(head.a) * speed * dt;
      }

      function followSpine(t){
        for (let i=1;i<segCount;i++){
          const lead = seg[i-1], cur = seg[i];
          const ang = Math.atan2(lead.y - cur.y, lead.x - cur.x);
          const dist = Math.hypot(lead.x - cur.x, lead.y - cur.y);
          const move = Math.max(0, dist - segSpacing);
          const phase = (t*waveHz*2*Math.PI) - (i*segSpacing/waveLen)*2*Math.PI;
          const side = Math.sin(phase) * waveAmp * (i/segCount);
          cur.x += Math.cos(ang)*move + Math.cos(ang+Math.PI/2)*side;
          cur.y += Math.sin(ang)*move + Math.sin(ang+Math.PI/2)*side;
        }
        seg[0].x = head.x; seg[0].y = head.y;
      }

      function clampFloor(){
        const fy = floorY(); // viewport Y
        if (Number.isFinite(fy)) {
          const maxY = fy - 14; // clearance
          if (head.y > maxY) head.y = maxY;
        }
        head.x = clamp(-50, p.width+50, head.x);
        head.y = clamp(-50, p.height+50, head.y);
      }

      function eatIfClose(target){
        if (!target) return;
        const d = Math.hypot(target.x - head.x, target.y - head.y);
        if (d < biteRadius + 6){
          const el = target.el;
          el.style.transition = 'transform .12s ease, opacity .12s ease';
          // convert fish mouth (viewport) to element center (viewport)
          el.style.transform = `translate(${head.x - target.x}px, ${head.y - target.y}px) scale(0.1)`;
          el.style.opacity = '0';
          setTimeout(()=> el.remove(), 130);
          scale = Math.min(scaleMax, scale + scaleStep);
        }
      }

      function bodyWidthAt(i){
        const t = i/(segCount-1);
        return (1-Math.pow(t,1.7))*18*scale + 8; // beefier
      }

      function drawKoi(t){
        p.clear();

        // subtle gradient fake (two passes)
        for (let pass=0; pass<2; pass++){
          p.fill(pass? colors.body : colors.shadow);
          for (let i=0;i<segCount-1;i++){
            const a = seg[i], b = seg[i+1];
            const cx=(a.x+b.x)/2, cy=(a.y+b.y)/2 + (pass?0:2);
            const len = segSpacing*1.1;
            const bw  = bodyWidthAt(i)*(pass?1:0.9);
            p.push(); p.translate(cx,cy);
            p.rotate(Math.atan2(b.y-a.y, b.x-a.x));
            p.ellipse(0,0,len,bw);
            p.pop();
          }
        }

        // accent blotches near head/body
        p.fill(colors.accent);
        for (let i=1;i<8;i+=3){
          const a = seg[i], b = seg[i+1];
          const cx=(a.x+b.x)/2, cy=(a.y+b.y)/2;
          const len = segSpacing*0.9, bw = bodyWidthAt(i)*0.6;
          p.push(); p.translate(cx,cy);
          p.rotate(Math.atan2(b.y-a.y, b.x-a.x));
          p.ellipse(0,0,len,bw);
          p.pop();
        }

        // head
        const m = seg[0];
        p.push();
        p.translate(m.x, m.y);
        p.rotate(head.a);
        p.fill(colors.body);
        p.ellipse(14*scale, 0, 34*scale, 22*scale); // bigger head
        p.stroke(colors.accent); p.strokeWeight(2); p.noFill();
        p.arc(22*scale, 0, 14*scale, 10*scale, -0.45, 0.45);
        p.noStroke();
        // tiny “barbels”
        p.fill(colors.accent);
        p.ellipse(22*scale, 5*scale, 2.5*scale, 2.5*scale);
        p.ellipse(22*scale,-5*scale, 2.5*scale, 2.5*scale);
        p.pop();

        // tail fin
        const tip = seg[segCount-1];
        const prev= seg[segCount-2];
        const ang = Math.atan2(tip.y-prev.y, tip.x-prev.x);
        p.push();
        p.translate(tip.x, tip.y);
        p.rotate(ang);
        p.fill(colors.accent);
        p.beginShape();
        p.vertex(-20*scale, 0);
        p.vertex(-46*scale,  18*scale);
        p.vertex(-46*scale, -18*scale);
        p.endShape(p.CLOSE);
        p.pop();
      }

      // ----- p5 lifecycle -----
      p.setup = function () {
        const c = p.createCanvas(p.windowWidth, p.windowHeight);
        c.id('koi-canvas');
        p.pixelDensity(window.devicePixelRatio || 1);
        p.noStroke();

        // seed chain
        for (let i=0;i<segCount;i++){
          seg[i].x = head.x - i*segSpacing;
          seg[i].y = head.y;
        }
        lastMs = p.millis();

        // keep floor updated as you scroll
        window.addEventListener('scroll', () => {}, {passive:true});
      };

      p.windowResized = () => p.resizeCanvas(p.windowWidth, p.windowHeight);

      p.draw = function () {
        const now = p.millis();
        const dt = Math.min(33, now - lastMs) / 1000;
        lastMs = now;

        const near = nearestLetter();
        let target = null, speed = baseSpeed;

        if (near && Math.sqrt(near.d2) < noticeDist) { target = near; speed = chaseSpeed; }
        else {
          if (!roamTarget || Math.hypot(head.x-roamTarget.x, head.y-roamTarget.y) < 40) pickRoam();
          target = roamTarget;
        }

        if (target) steer(target, dt, speed);
        clampFloor();
        followSpine(now/1000);

        if (near && Math.sqrt(near.d2) < biteRadius + 40) eatIfClose(near);

        drawKoi(now/1000);
      };
    };

    pInst = new p5(sketch, document.body);
    return pInst;
  };

  window.KoiSide = KoiSide;
})();
