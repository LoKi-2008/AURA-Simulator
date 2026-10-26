# AURA — Anime Power-Up

A browser-based webcam aura experience built with plain HTML, CSS, and JavaScript modules. It uses MediaPipe Tasks Vision for person segmentation, pose and hand tracking; WebGL2 for the aura shader; a 2D canvas for effects; and Web Audio for music control and synthesized accents.

## Run locally

From this directory, run:

```bash
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000) and allow camera access. A local HTTP server is required for camera access and ES modules. Models and the MediaPipe runtime download from their pinned CDN/model URLs the first time you start the app.

## Controls

- Show one hand and point the index finger straight up, curling the other fingers, to charge the aura. No body or arm pose is required.
- Hand movement and height modulate the bundled music track's volume, filter and playback speed; motion adds a subtle synthesized accent.
- `SPACE`: simulate holding the pose
- `S`: mute/unmute sound
- `R`: reset power
- `H`: hide/show HUD
- `F`: fullscreen
- `D`: debug mask and pose overlay

## Music credit

“Rizz” by alanajordan, downloaded from [Pixabay](https://pixabay.com/music/beats-rizz-296500/) and bundled as `assets/rizz.mp3`. The track page lists it as free for use under the [Pixabay Content License](https://pixabay.com/service/license-summary/). Keep the track page and license summary as proof of the download license.

## Feature checklist

- [ ] Person segmentation tracks the webcam subject; compare the silhouette against the video.
- [ ] Point an index finger upright to start charging; the hand gesture alone is the pose.
- [ ] Confirm the gold halo follows the head and the purple wings appear behind the segmented silhouette.
- [ ] Confirm the track begins after the pose activates, hand motion modulates it, and `S` mutes it.
- [ ] Hold long enough to cross each power threshold and check each banner, flash, ring, and sound hit.
- [ ] Release the pose and confirm power decays smoothly.
- [ ] Use `SPACE`, `R`, `H`, and `D` to test simulated charge, reset, HUD visibility, and debug views.
- [ ] Press `F` to enter or leave fullscreen.
