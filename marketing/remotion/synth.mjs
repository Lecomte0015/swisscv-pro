// Bande-son procédurale calée sur la timeline Remotion (30 i/s, 735 images = 24,5 s).
// Usage : node synth.mjs  → écrit public/music.wav
import fs from 'node:fs';
const SR = 44100, DUR = 24.5, N = Math.round(SR * DUR);
const L = new Float32Array(N), R = new Float32Array(N);
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const add = (t0, len, fn, gain = 1, pan = 0) => {
  const s0 = Math.floor(t0 * SR);
  for (let i = 0; i < len * SR; i++) {
    const k = s0 + i; if (k < 0 || k >= N) continue;
    const v = fn(i / SR) * gain;
    L[k] += v * (1 - pan); R[k] += v * (1 + pan);
  }
};
const kick = (t0, g = 1) => add(t0, 0.45, (t) => Math.sin(2 * Math.PI * (45 * t + 180 * (1 - Math.exp(-t * 28)) / 28)) * Math.exp(-t * 7), 0.9 * g);
const hat = (t0, g = 1) => { let lp = 0; add(t0, 0.08, (t) => { const n = rnd(); const hp = n - lp; lp = n; return hp * Math.exp(-t * 60); }, 0.12 * g, 0.3); };
const clap = (t0) => { let lp = 0; add(t0, 0.25, (t) => { const n = rnd(); lp += (n - lp) * 0.35; return (n - lp) * (Math.exp(-t * 18) + 0.5 * Math.exp(-Math.abs(t - 0.012) * 300)); }, 0.35, -0.2); };
const tick = (t0, f = 2400) => add(t0, 0.05, (t) => Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 120), 0.25);
const bell = (t0, f, g = 0.25) => add(t0, 2.5, (t) => (Math.sin(2 * Math.PI * f * t) + 0.4 * Math.sin(2 * Math.PI * f * 2.76 * t) * Math.exp(-t * 4) + 0.2 * Math.sin(2 * Math.PI * f * 5.4 * t) * Math.exp(-t * 8)) * Math.exp(-t * 2.2), g);
const whoosh = (t0, len = 0.5, g = 0.35) => { let lp = 0; add(t0 - len * 0.6, len, (t) => { const x = t / len; const c = 0.02 + 0.5 * Math.sin(Math.PI * x) ** 2; lp += (rnd() - lp) * c; return lp * Math.sin(Math.PI * x) ** 2; }, g * 2.2, 0); };
const riser = (t0, len, g = 0.35) => { let lp = 0; add(t0, len, (t) => { const x = t / len; lp += (rnd() - lp) * (0.01 + 0.4 * x * x); return lp * x * x + 0.3 * Math.sin(2 * Math.PI * (200 + 900 * x * x) * t) * x * x * 0.3; }, g * 2, 0); };
const impact = (t0, g = 1) => { kick(t0, 1.3 * g); add(t0, 2.2, (t) => Math.sin(2 * Math.PI * 38 * t) * Math.exp(-t * 1.6), 0.6 * g); let lp = 0; add(t0, 1.2, (t) => { lp += (rnd() - lp) * 0.08; return lp * Math.exp(-t * 3.5); }, 0.9 * g); };
const bass = (t0, len, f) => add(t0, len, (t) => { const env = Math.min(1, t * 60) * Math.exp(-t * 1.4); return (Math.sin(2 * Math.PI * f * t) + 0.35 * Math.sin(2 * Math.PI * f * 2 * t)) * env; }, 0.35);
const pad = (t0, len, freqs, g = 0.05) => add(t0, len, (t) => { const env = Math.min(1, t / 0.4) * Math.min(1, (len - t) / 0.6); let v = 0; for (const f of freqs) v += Math.sin(2 * Math.PI * f * t + Math.sin(2 * Math.PI * 0.3 * t)) + 0.3 * Math.sin(2 * Math.PI * f * 2.003 * t); return v * env; }, g);
const pluck = (t0, f, g = 0.12, pan = 0) => add(t0, 0.4, (t) => (Math.sin(2 * Math.PI * f * t) + 0.5 * Math.sin(2 * Math.PI * f * 2 * t) * Math.exp(-t * 20)) * Math.exp(-t * 9), g, pan);

const fr = (f) => f / 30;
// Accroche (0 – 3,8 s) : nappe, tic-tac pendant le compteur « 6 », montée vers la prise de contrôle rouge
pad(0, fr(118), [55, 82.4, 110], 0.06);
for (let i = 0; i < 6; i++) tick(fr(32) + i * (fr(58) - fr(32)) / 6, i % 2 ? 2000 : 2600);
riser(fr(86), fr(115) - fr(86), 0.4);
impact(fr(115), 0.9);
// Groove 120 BPM (3,8 – 18 s)
const prog = [[55, [220, 261.6, 329.6]], [43.65, [174.6, 220, 261.6]], [65.4, [196, 261.6, 329.6]], [49, [196, 246.9, 293.7]]];
const start = fr(115), stop = fr(540);
for (let b = 0, t = start; t < stop - 0.01; b++, t += 0.5) {
  kick(t, b % 4 === 0 ? 1 : 0.85);
  hat(t + 0.25); if (b % 2 === 1) hat(t + 0.375, 0.6);
  if (b % 2 === 1 && t > fr(165)) clap(t);
  const [root, chord] = prog[Math.floor(b / 4) % 4];
  if (b % 4 === 0) { bass(t, 1.9, root); pad(t, 2.05, chord, 0.035); }
  if (t > fr(165)) pluck(t + 0.25, chord[b % 3] * 2, 0.07, b % 2 ? 0.4 : -0.4);
}
// Transitions
[fr(165), fr(198), fr(250), fr(300)].forEach((t) => whoosh(t, 0.45, 0.3));
for (let i = 1; i <= 5; i++) whoosh(fr(300 + i * 48), 0.4, 0.28);
// Compteur du score + carillon à 100
riser(fr(256), fr(289) - fr(256), 0.12); bell(fr(290), 1318.5, 0.18);
// Mur d'écrans (18 – 20,5 s) : respiration + grande montée
pad(fr(540), fr(620) - fr(540), [110, 164.8, 220, 277.2], 0.05);
for (let i = 0; i < 5; i++) kick(fr(540) + i * 0.5, 0.5);
riser(fr(575), fr(615) - fr(575), 0.55);
// Écran de fin : impact + carillon du logo + accord final
impact(fr(615), 1.1);
bell(fr(621), 880, 0.22); bell(fr(629), 1318.5, 0.14); bell(fr(677), 1760, 0.08);
pad(fr(615), DUR - fr(615), [110, 220, 277.2, 329.6], 0.05);

// Master : saturation douce + fondu final
const out = Buffer.alloc(44 + N * 4);
let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(Math.tanh(L[i])), Math.abs(Math.tanh(R[i])));
const gain = 0.89 / peak;
out.write('RIFF', 0); out.writeUInt32LE(36 + N * 4, 4); out.write('WAVEfmt ', 8); out.writeUInt32LE(16, 16);
out.writeUInt16LE(1, 20); out.writeUInt16LE(2, 22); out.writeUInt32LE(SR, 24); out.writeUInt32LE(SR * 4, 28); out.writeUInt16LE(4, 32); out.writeUInt16LE(16, 34);
out.write('data', 36); out.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  const fade = Math.min(1, (N - i) / (SR * 1.2));
  out.writeInt16LE(Math.round(Math.tanh(L[i]) * gain * fade * 32767), 44 + i * 4);
  out.writeInt16LE(Math.round(Math.tanh(R[i]) * gain * fade * 32767), 46 + i * 4);
}
fs.mkdirSync(new URL('./public/', import.meta.url), {recursive: true});
fs.writeFileSync(new URL('./public/music.wav', import.meta.url), out);
console.log('music.wav écrit');
