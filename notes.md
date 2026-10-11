# Project Notes: AR Safety Training for Industrial Workers (Mini Project 41)

## Goal
Mobile AR-based safety training and certification for mining/steel/mica workers (Jharkhand problem statement). Tamil voiceover added (reviewer asked for Tamil since we are in Tamil Nadu). Review 2 demo on an Android phone.

## Existing solutions and our difference (for review)
- FiAR (NORCAT): AR fire extinguisher trainer, needs iPad + Bluetooth extinguisher handle, English, paid, fire only.
- VR fire safety modules (e.g. Immerse / 3D Media): need Meta Quest headset, English only, score only.
- Research (Massey University): AR training improved knowledge retention vs video training.
- Ours: any Android phone, no headset, free/low cost, Tamil (plus English, language-pluggable), Tamil voiceover for low-literacy workers, offline-capable design, assessment + verifiable QR certificate planned, aligned to Factories Act / Mines Act periodic certification.

## Tech choices
- Web app (PWA), plain HTML/CSS/JS in a single index.html, hosted on GitHub Pages (HTTPS needed for camera and sensors).
- Not Unity: setup too heavy for the one-day timeline; Unity is the planned future upgrade.
- APK will be made at the end with PWABuilder.
- Real AR placement via Google model-viewer (ARCore Scene Viewer) with extinguisher.glb.
- Sensor-anchored AR for the scenario: live camera + phone gyroscope (deviceorientation) + a 3D projection written in JS. Objects stay in fixed directions as the worker turns the phone. They do not attach to real surfaces.
- Tunnel (rocky arch, timber frames, rails, sleepers, pipe, lamps, rock face) is generated in code on a canvas over the camera feed. The earlier photo background (mining_bakground.jpg) was dropped; the file can stay in the repo but is unused.

## Module built: Module 1, Fire and Explosion Response (electrical fire)
Flow:
1. Start screen: choose Tamil or English.
2. Emergency: fire at an electrical panel on the tunnel end wall.
3. Search: worker turns the phone to find the correct extinguisher mounted on the right wall behind them. Arrow shows direction, timer runs, hint pulse after 25 s. Decoy water bucket on the floor gives wrong feedback (never use water on electrical fire).
4. Pick up extinguisher: stays in the worker's hands for the lesson. Search time saved in localStorage as searchTime (to be used in assessment scoring).
5. PASS lesson (5 steps) with Tamil/English text and voice button. Spray animation on Squeeze and Sweep.
6. Sweep step: fire shrinks and goes out, smoke appears, "Fire is out" message. Going back a step brings the fire back.
7. Green button opens real ARCore placement of the extinguisher model in the room.

Other features: landscape support (sensor math uses screen.orientation.angle, side panel layout in landscape), header buttons: தமிழ், EN, 📷 (retry camera), 🕳 (tunnel overlay on/off). Drag-to-look fallback if the phone has no motion sensor.

## Files in the repo
- index.html (the whole app)
- extinguisher.glb (3D model)
- ta0.mp3 to ta5.mp3 (Tamil voice: ta0 = emergency message, ta1 to ta5 = lesson steps; if missing the phone's built-in voice is used)
- mining_bakground.jpg (unused now)
- NOTES.md (this file)

## Known issues
- Camera does not start while a phone call is active or another app holds the camera.
- Objects are fixed by direction only, so walking toward them does not make them closer.
- Tunnel looks stylised (drawn in code), not photographic.
- Tamil text was written by AI; read it once and fix any unnatural wording.
- Gyroscope compass can drift slightly.

## Next
- Part 3: assessment/quiz (scenario questions, include searchTime in the score)
- Part 4: QR certificate (signed payload) + verify page
- Part 5: offline mode (service worker) + APK via PWABuilder
- Part 6: admin dashboard mockup, demo video, README

## If the AI changes
Tell the new AI: "Read NOTES.md and index.html in this repo, then continue from Next. Keep the single-file plain HTML/JS approach and give me complete code files I can copy-paste. I am a complete beginner, so explain every step."
