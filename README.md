# Ultraviolette F77 Mach 2 Clone

A high-performance, cinematic, vanilla web recreation of the official **[Ultraviolette F77 Mach 2](https://www.ultraviolette.com)** website. Built strictly with standard HTML5, CSS3, and JavaScript, focusing on lightweight rendering, hardware-accelerated scroll engines, and interactive WebGL/Web Audio systems.

---

## ◼ Preview

![Preview](preview.png)

<div align="center">

`🔗` **[ultraviolette-automobile-clone.vercel.app](https://ultraviolette-automobile-clone.vercel.app/)**

</div>

---

## Project Overview

This repository houses a high-fidelity recreation of the landing page for the Ultraviolette F77 Mach 2. The objective of this project is to implement advanced layout paradigms, custom audio synthesis, and hardware-accelerated rendering using vanilla web standards. By avoiding client-side framework libraries, the project achieves near-instantaneous load times and a highly performant execution pipeline.

---

## Architectural and Performance Engineering

### Kinematic Scroll Smoothing
Scrolling velocity is virtualized and controlled via the Lenis scroll engine. By translating scroll inputs along mathematical deceleration curves, the layout achieves elastic inertia on mouse and touchpad events. This smoothing layer directly coordinates all viewport-relative scroll triggers.

### GPU-Accelerated Parallax Threading
Elements annotated with the parallax attribute are calculated dynamically relative to the viewport center. Calculations run inside a browser requestAnimationFrame loop, updating CSS translations via GPU compositor threads using will-change properties. This architecture mitigates layout thrashing and paint bottlenecks.

### Programmatic Web Audio Powertrain Synthesizer
Rather than streaming compressed audio files, the app synthesizes motorcycle drone signatures in real-time. It configures native browser oscillator and lowpass filter nodes through a master gain control, adjusting pitch frequencies dynamically in response to scroll velocity.

### Service Worker Caching and Cache Invalidation
A Progressive Web App service worker operates a cache-first strategy for structural assets. Upon updates, cache keys are incremented to trigger activate events that prune outdated cache allocations, forcing browsers to fetch newly deployed configurations and resources.

---

## Technical Specifications and Features

* **Real-Time Range and Charge Simulator:** Implements mathematical models predicting battery depletion and charging curves based on base and Recon trim parameters.
* **Interactive Specs Column Isolator:** Filters columns dynamically to highlight a chosen trim level. Hides inactive columns on responsive viewports to fit small displays without table overflows.
* **TFT Instrument Dashboard Cluster Simulation:** Updates simulated motorcycle parameters (riding modes, alert statuses, time ticks) in response to click triggers.
* **Typewriter Diagnostics Terminal Logs:** Sequential string rendering routine that logs diagnostic parameters on engine ignition sequences.
* **Vector Path HUD Connector Lines:** Uses SVG stroke-dasharray and stroke-dashoffset transitions to sweep lines outward from schematic hotspots to information cards.
* **Holographic Variant Card Shimmers:** Employs CSS linear gradients sliding horizontally on card container hover events.

---

## Project Directory Structure

```text
ultraviolette-website-clone/
├── css/
│   ├── critical.css      # Above-the-fold inline styling
│   └── main.css          # Core layouts, responsive design, and transitions
├── js/
│   ├── main.js           # Interactive state controllers, simulators, and synth nodes
│   └── webgl-nebula.js   # WebGL noise canvas fragment shader pipeline
├── assets/
│   ├── images/           # WebP bike variant images
│   └── icons/            # Manifest and home icons
├── sw.js                 # Service worker cache script
├── site.webmanifest      # Progressive Web App configuration
├── preview.png           # Repository thumbnail
└── README.md             # Project documentation
```

---

## Getting Started

### Local Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/mantisdarling/ultraviolette-website-clone.git
   cd ultraviolette-website-clone
   ```

2. Start a local server to resolve WebGL and Service Worker assets:
   ```bash
   # Python server
   python -m http.server 8080

   # Node.js server
   npx http-server . -p 8080
   ```

3. Navigate to `http://localhost:8080` in your web browser.

---

## UI Archaeology Series
This project represents the inaugural entry in the UI Archaeology Series, dedicated to analyzing and recreating visual engineering designs using basic web APIs.

| Entry | Target Project | Tech Stack | Status |
| :---: | :--- | :--- | :---: |
| 001 | Ultraviolette Automotive Landing Page | HTML5, CSS3, JS, WebGL, Web Audio API | Completed |
| 002 | Upcoming project | To be announced | In planning |

---

<div align="center">
  <p>Created by Mantis Darling</p>
  <a href="https://github.com/mantisdarling"><img src="https://img.shields.io/badge/GitHub-000000?style=flat-square&logo=github&logoColor=7B2CBF" alt="GitHub Profile" /></a>
  &nbsp;
  <a href="https://github.com/mantisdarling/ultraviolette-website-clone"><img src="https://komarev.com/ghpvc/?username=mantisdarling&style=flat-square&color=6A0DAD&label=views" alt="repository views" /></a>
</div>
