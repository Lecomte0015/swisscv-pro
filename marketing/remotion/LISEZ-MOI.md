# Sources des visuels et de la vidéo SwissCV Pro (Remotion)

- `src/Promo.tsx` : la vidéo de 24,5 s (formats 16:9, 9:16, 1:1, 4:5)
- `src/Kit.tsx` : photos de profil, couverture Facebook, 11 publications, image d'aperçu des liens (og-image)
- `public/` : extraits de la capture d'écran, phrases de la voix off (ElevenLabs, voix « Clémence »), captures pour le kit
- `synth.mjs` : génère la musique `public/music.wav` (calée image par image sur la vidéo)

## Refaire un rendu

```bash
npm install
node synth.mjs
npx remotion render src/index.ts Landscape out/video-16x9.mp4
npx remotion still src/index.ts P04-ats out/P04.png
```

Compositions : `HeroPhone` (boucle du haut de page, 540×1170), `HowTo` (« Comment ça marche », 1080×1080), `Landscape`, `Portrait`, `Square`, `Feed45`, `profil-rouge`, `profil-blanc`, `couverture`, `og-image`, `P01-lancement` … `P11-pack`.

## Vidéo « face caméra » (19.10.2026)

- `src/Talk.tsx` : 5 prises du fondateur détourées sur un fond de marque, l'application en illustration, sous-titres mot par mot (compositions `TalkPortrait`, `TalkFeed45`, `TalkSquare`, `TalkLandscape`, 26,7 s).
- `public/talk/*.mp4` : prises raccourcies à la partie parlée ; `public/talk/cut/*.webm` : versions détourées (fond transparent) ; `public/talk/cut/*.wav` : voix au volume harmonisé.
- Détourage local, rien n'est envoyé en ligne : `.venv-matting/bin/python scripts/matte.py public/talk/p1-accroche.mp4 public/talk/cut/p1-accroche.webm` (modèle RobustVideoMatting dans `.rvm/`, environnement Python `.venv-matting/`, tous deux exclus de Git).
- Musique : `node synth-talk.mjs` → `public/music-talk.wav`.
- Les temps des sous-titres sont dans `SEG` (`src/Talk.tsx`) ; changer une prise = recalculer ses temps.

```bash
npx remotion render src/index.ts TalkPortrait out/face-camera-9x16.mp4
```
