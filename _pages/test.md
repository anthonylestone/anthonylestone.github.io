---
layout: about
title: Test Page
description: A simple page with a circle following the cursor.
permalink: /test/
---

This is a test page.

[test link](https://www.google.com)

<!-- Interactive timeline diagram (inline SVG) -->
<!-- Paste into a Markdown file (Jekyll usually allows raw HTML). -->
<style>
  .timeline-wrap {
    max-width: 1100px;
    margin: 1.5rem auto;
    padding: 0 0.5rem;
  }
  svg.timeline {
    width: 100%;
    height: auto;
    display: block;
  }

  /* Clickable nodes */
  .node { cursor: pointer; }
  .node .bubble { transition: transform 120ms ease, filter 120ms ease; transform-origin: center; }
  .node:hover .bubble { transform: scale(1.03); filter: drop-shadow(0 6px 10px rgba(0,0,0,0.18)); }
  .node:focus-visible .bubble { outline: none; filter: drop-shadow(0 0 0 rgba(0,0,0,0)); }

  /* Text styling */
  .label { font: 700 18px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; fill: #111; }
  .small { font: 600 15px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
  .tiny { font: 600 13px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }

  /* Boxes */
  .box { rx: 10; ry: 10; }
  .boxText { font: 600 14px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; fill: #111; }

  /* Lines/arrows */
  .arrow { stroke: #111; stroke-width: 3; fill: none; }
</style>

<div class="timeline-wrap">
<svg class="timeline" viewBox="0 0 1100 520" role="img" aria-label="PhD timeline with clickable milestones">
  <defs>
    <marker id="arrowhead" markerWidth="12" markerHeight="10" refX="10" refY="5" orient="auto">
      <path d="M 0 0 L 12 5 L 0 10 z" fill="#111"></path>
    </marker>
  </defs>

  <!-- Arrows (roughly matching your flow) -->
  <path class="arrow" marker-end="url(#arrowhead)" d="M 155 120 C 220 120, 240 170, 290 200" />
  <path class="arrow" marker-end="url(#arrowhead)" d="M 410 220 C 470 180, 520 150, 575 140" />
  <path class="arrow" marker-end="url(#arrowhead)" d="M 675 140 C 760 140, 780 180, 820 210" />
  <path class="arrow" marker-end="url(#arrowhead)" d="M 910 240 C 980 290, 980 355, 900 395" />
  <path class="arrow" marker-end="url(#arrowhead)" d="M 810 390 C 760 385, 720 350, 690 320" />
  <path class="arrow" marker-end="url(#arrowhead)" d="M 600 320 C 520 320, 460 350, 420 395" />
  <path class="arrow" marker-end="url(#arrowhead)" d="M 330 395 C 250 395, 200 360, 160 335" />

  <!-- ====== NODES ====== -->

  <!-- Fall 2024 bubble -->
  <a class="node" href="/timeline/fall-2024/" aria-label="Fall 2024 details">
    <g tabindex="0">
      <circle class="bubble" cx="120" cy="95" r="70" fill="#f8cfd2" stroke="#111" stroke-width="2"/>
      <text class="label" x="120" y="88" text-anchor="middle">Fall</text>
      <text class="label" x="120" y="112" text-anchor="middle">2024</text>
    </g>
  </a>

  <!-- Begin PhD / Join Cyclotron box -->
  <a class="node" href="/timeline/begin-phd/" aria-label="Begin PhD and join Cyclotron Institute details">
    <g tabindex="0">
      <rect class="bubble box" x="35" y="170" width="220" height="70" fill="#f2b6bd" stroke="#111" stroke-width="2"/>
      <text class="boxText" x="60" y="198">• Begin PhD</text>
      <text class="boxText" x="60" y="220">• Join Cyclotron</text>
    </g>
  </a>

  <!-- ANASEN arrives box -->
  <a class="node" href="/timeline/anasen-arrives/" aria-label="ANASEN chamber arrives at TAMU details">
    <g tabindex="0">
      <rect class="bubble box" x="235" y="60" width="260" height="60" fill="#f4e3c6" stroke="#111" stroke-width="2"/>
      <text class="boxText" x="365" y="95" text-anchor="middle">ANASEN chamber</text>
      <text class="boxText" x="365" y="115" text-anchor="middle">arrives at TAMU</text>
    </g>
  </a>

  <!-- Fall 2025 bubble -->
  <a class="node" href="/timeline/fall-2025/" aria-label="Fall 2025 details">
    <g tabindex="0">
      <circle class="bubble" cx="360" cy="220" r="70" fill="#f5e2c7" stroke="#111" stroke-width="2"/>
      <text class="label" x="360" y="212" text-anchor="middle">Fall</text>
      <text class="label" x="360" y="236" text-anchor="middle">2025</text>
    </g>
  </a>

  <!-- Spring 2026 bubble -->
  <a class="node" href="/timeline/spring-2026/" aria-label="Spring 2026 details">
    <g tabindex="0">
      <circle class="bubble" cx="625" cy="135" r="70" fill="#fbf3c9" stroke="#111" stroke-width="2"/>
      <text class="label" x="625" y="127" text-anchor="middle">Spring</text>
      <text class="label" x="625" y="151" text-anchor="middle">2026</text>
    </g>
  </a>

  <!-- TeBAT commissioning box -->
  <a class="node" href="/timeline/tebat-commissioning/" aria-label="TeBAT commissioning details">
    <g tabindex="0">
      <rect class="bubble box" x="520" y="220" width="210" height="55" fill="#f4e3c6" stroke="#111" stroke-width="2"/>
      <text class="boxText" x="545" y="252">• TeBAT commissioning</text>
    </g>
  </a>

  <!-- Fission TPC box -->
  <a class="node" href="/timeline/fission-tpc/" aria-label="Fission TPC construction and coupling details">
    <g tabindex="0">
      <rect class="bubble box" x="760" y="45" width="300" height="80" fill="#cfead3" stroke="#111" stroke-width="2"/>
      <text class="boxText" x="785" y="80">• Fission TPC construction</text>
      <text class="boxText" x="785" y="105">• Coupling to ANASEN chamber</text>
    </g>
  </a>

  <!-- Summer 2026 bubble -->
  <a class="node" href="/timeline/summer-2026/" aria-label="Summer 2026 details">
    <g tabindex="0">
      <circle class="bubble" cx="860" cy="240" r="70" fill="#d8f0d6" stroke="#111" stroke-width="2"/>
      <text class="label" x="860" y="232" text-anchor="middle">Summer</text>
      <text class="label" x="860" y="256" text-anchor="middle">2026</text>
    </g>
  </a>

  <!-- 238U commissioning run box -->
  <a class="node" href="/timeline/udpf-commissioning/" aria-label="U-238 d,pf commissioning run details">
    <g tabindex="0">
      <rect class="bubble box" x="730" y="320" width="360" height="65" fill="#cfe0ea" stroke="#111" stroke-width="2"/>
      <text class="boxText" x="760" y="352">• <tspan baseline-shift="super" font-size="11">238</tspan>U(d,pf) commissioning run</text>
    </g>
  </a>

  <!-- Fall 2026 bubble -->
  <a class="node" href="/timeline/fall-2026/" aria-label="Fall 2026 details">
    <g tabindex="0">
      <circle class="bubble" cx="860" cy="410" r="70" fill="#cfe0ea" stroke="#111" stroke-width="2"/>
      <text class="label" x="860" y="402" text-anchor="middle">Fall</text>
      <text class="label" x="860" y="426" text-anchor="middle">2026</text>
    </g>
  </a>

  <!-- Spring 2027 bubble -->
  <a class="node" href="/timeline/spring-2027/" aria-label="Spring 2027 details">
    <g tabindex="0">
      <circle class="bubble" cx="625" cy="320" r="70" fill="#dccff2" stroke="#111" stroke-width="2"/>
      <text class="label" x="625" y="312" text-anchor="middle">Spring</text>
      <text class="label" x="625" y="336" text-anchor="middle">2027</text>
    </g>
  </a>

  <!-- Coursework / prelim box -->
  <a class="node" href="/timeline/coursework-prelim/" aria-label="Coursework and preliminary exam details">
    <g tabindex="0">
      <rect class="bubble box" x="460" y="415" width="330" height="70" fill="#e7daf7" stroke="#111" stroke-width="2"/>
      <text class="boxText" x="485" y="445">• Complete coursework</text>
      <text class="boxText" x="485" y="468">• Preliminary exam</text>
    </g>
  </a>

  <!-- Summer 2027-2028 bubble -->
  <a class="node" href="/timeline/summer-2027-2028/" aria-label="Summer 2027 to Summer 2028 details">
    <g tabindex="0">
      <circle class="bubble" cx="360" cy="410" r="70" fill="#efc9df" stroke="#111" stroke-width="2"/>
      <text class="small" x="360" y="396" text-anchor="middle">Summer</text>
      <text class="small" x="360" y="418" text-anchor="middle">2027</text>
      <text class="small" x="360" y="440" text-anchor="middle">– Summer 2028</text>
    </g>
  </a>

  <!-- Analysis / thesis writing box -->
  <a class="node" href="/timeline/analysis-writing/" aria-label="Analysis and thesis writing details">
    <g tabindex="0">
      <rect class="bubble box" x="235" y="290" width="250" height="70" fill="#efc9df" stroke="#111" stroke-width="2"/>
      <text class="boxText" x="260" y="320">• Analysis</text>
      <text class="boxText" x="260" y="345">• Thesis writing</text>
    </g>
  </a>

  <!-- Fall 2028–Spring 2029 bubble -->
  <a class="node" href="/timeline/fall-2028-spring-2029/" aria-label="Fall 2028 to Spring 2029 details">
    <g tabindex="0">
      <circle class="bubble" cx="120" cy="320" r="78" fill="#ffffff" stroke="#111" stroke-width="2"/>
      <text class="small" x="120" y="300" text-anchor="middle">Fall 2028</text>
      <text class="small" x="120" y="324" text-anchor="middle">–</text>
      <text class="small" x="120" y="348" text-anchor="middle">Spring 2029</text>
    </g>
  </a>

  <!-- Complete thesis / Graduate box -->
  <a class="node" href="/timeline/graduation/" aria-label="Complete thesis and graduate details">
    <g tabindex="0">
      <rect class="bubble box" x="35" y="420" width="260" height="70" fill="#ffffff" stroke="#111" stroke-width="2"/>
      <text class="boxText" x="60" y="450">• Complete thesis</text>
      <text class="boxText" x="60" y="475">• Graduate</text>
    </g>
  </a>

  <!-- OPTIONAL: “done” checkmarks like your screenshot -->
  <path d="M 62 140 L 85 160 L 122 110" stroke="#35c225" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
  <path d="M 205 205 L 228 225 L 268 175" stroke="#35c225" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
</svg>
</div>
