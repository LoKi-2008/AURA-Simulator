# AURA — Anime Power-Up

A browser-based webcam aura experience built with plain HTML, CSS, and JavaScript modules. It uses MediaPipe Tasks Vision for person segmentation and pose detection, WebGL2 for the aura shader, a 2D canvas for effects, and Web Audio for synthesized sound.

## Run locally

From this directory, run:

```bash
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000) and allow camera access. A local HTTP server is required for camera access and ES modules. Models and the MediaPipe runtime download from their pinned CDN/model URLs the first time you start the app.

## Controls

- Hold the default fists-down charging pose, or raise both hands above your shoulders.
- `SPACE`: simulate holding the pose
- `P`: switch pose mode
- `S`: mute/unmute synthesized audio
- `R`: reset power
- `H`: hide/show HUD
- `F`: fullscreen
- `D`: debug mask and pose overlay

## Feature checklist

- [ ] Person segmentation tracks the webcam subject; compare the silhouette against the video.
- [ ] Idle state stays nearly aura-free.
- [ ] Hold the fists-down pose, then try raised arms with `P`; watch the meter rise.
- [ ] Hold long enough to cross each power threshold and check each banner, flash, ring, and sound hit.
- [ ] Release the pose and confirm power decays smoothly.
- [ ] Toggle sound with `S` and verify audio only begins after Start.
- [ ] Use `SPACE` to test charging without posing.
- [ ] Press `R`, `H`, and `D` to check reset, HUD visibility, and debug views.
- [ ] Press `F` to enter or leave fullscreen.
