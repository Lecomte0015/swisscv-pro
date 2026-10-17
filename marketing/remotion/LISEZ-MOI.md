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
