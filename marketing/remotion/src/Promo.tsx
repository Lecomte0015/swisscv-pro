import React from 'react';
import {
  AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, spring,
  staticFile, useCurrentFrame, useVideoConfig, Easing,
} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Inter';

const {fontFamily} = loadFont('normal', {weights: ['400', '500', '700', '800', '900'], subsets: ['latin']});

export const C = {red: '#D50000', redDeep: '#B80000', dark: '#0D0D0D', white: '#FFFFFF', gray: '#E6E6E6', soft: '#FFF5F5'};

// Scene boundaries (frames @30fps)
const S1 = 0, S2 = 115, S3 = 165, S4 = 300, FEAT = 48, S5 = 540, S6 = 615;
export const TOTAL = 735;

// Voice-over phrases (ElevenLabs, "Clémence") placed on the timeline: [file, startFrame, durationSec]
const VO: [string, number, number][] = [
  ['vo_p1.wav', 12, 2.98], ['vo_p2.wav', 170, 4.12], ['vo_tpl.wav', 298, 1.68], ['vo_p3a.wav', 351, 1.22], ['vo_p3b.wav', 398, 0.88],
  ['vo_p3c.wav', 446, 1.12], ['vo_tracker.wav', 494, 1.54], ['vo_p4.wav', 548, 0.51], ['vo_p5.wav', 630, 1.36], ['vo_p6.wav', 678, 1.04],
];
// Music ducks under the voice
const musicVolume = (f: number) => {
  let duck = 0;
  for (const [, st, d] of VO) {
    const en = st + d * 30;
    duck = Math.max(duck, interpolate(f, [st - 6, st, en, en + 8], [0, 1, 1, 0], clamp));
  }
  return 0.85 - duck * 0.55;
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const easeIn = Easing.bezier(0.7, 0, 0.84, 0);

const useLayout = () => {
  const {width: W, height: H} = useVideoConfig();
  const u = Math.min(W, H) / 1080;
  const portrait = H > W * 1.2;
  const landscape = W > H * 1.2;
  const square = !portrait && !landscape;
  return {W, H, u, portrait, landscape, square};
};

/* ---------- Primitives ---------- */

const CrossMark: React.FC<{size: number; draw?: number; bg?: string; fg?: string; radius?: number}> = ({size, draw = 1, bg = C.red, fg = C.white, radius = 0.22}) => {
  const bar = size * 0.2;
  const len = size * 0.62 * draw;
  return (
    <div style={{width: size, height: size, background: bg, borderRadius: size * radius, position: 'relative', boxShadow: '0 ' + size * 0.12 + 'px ' + size * 0.3 + 'px rgba(213,0,0,0.35)'}}>
      <div style={{position: 'absolute', left: '50%', top: '50%', width: len, height: bar, background: fg, transform: 'translate(-50%,-50%)', borderRadius: bar * 0.12}} />
      <div style={{position: 'absolute', left: '50%', top: '50%', width: bar, height: len, background: fg, transform: 'translate(-50%,-50%)', borderRadius: bar * 0.12}} />
    </div>
  );
};

// Word-by-word masked reveal
const Words: React.FC<{text: string; delay?: number; size: number; color?: string; red?: number[]; weight?: number; stagger?: number; align?: 'left' | 'center'; underline?: number; lh?: number}> = ({text, delay = 0, size, color = C.dark, red = [], weight = 800, stagger = 3, align = 'left', underline, lh = 1.02}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const words = text.split(' ');
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: align === 'center' ? 'center' : 'flex-start', columnGap: size * 0.26, rowGap: size * 0.02, fontFamily, fontSize: size, fontWeight: weight, letterSpacing: -size * 0.045, lineHeight: lh}}>
      {words.map((w, i) => {
        const s = spring({frame: f - delay - i * stagger, fps, config: {damping: 16, stiffness: 170, mass: 0.7}});
        const isRed = red.includes(i);
        const ul = underline === i ? interpolate(f - delay - i * stagger, [8, 20], [0, 1], {...clamp, easing: ease}) : 0;
        return (
          <span key={i} style={{display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden', paddingBottom: size * 0.08, marginBottom: -size * 0.08, position: 'relative'}}>
            <span style={{display: 'inline-block', color: isRed ? C.red : color, transform: 'translateY(' + (1 - s) * 105 + '%) skewY(' + (1 - s) * 8 + 'deg)'}}>{w}</span>
            {underline === i && <span style={{position: 'absolute', left: 0, bottom: size * 0.04, height: size * 0.09, width: (ul * 100) + '%', background: C.red}} />}
          </span>
        );
      })}
    </div>
  );
};

const Kicker: React.FC<{text: string; delay?: number; size: number; color?: string}> = ({text, delay = 0, size, color = C.red}) => {
  const f = useCurrentFrame();
  const p = interpolate(f - delay, [0, 14], [0, 1], {...clamp, easing: ease});
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: size * 0.7, fontFamily, fontWeight: 700, fontSize: size, letterSpacing: size * 0.22, color, textTransform: 'uppercase', whiteSpace: 'nowrap', opacity: p}}>
      <div style={{width: size * 2.6 * p, height: size * 0.18, background: color}} />
      <span style={{transform: 'translateX(' + (1 - p) * -20 + 'px)'}}>{text}</span>
    </div>
  );
};

const Browser: React.FC<{width: number; src: string; aspect?: number; position?: string; children?: React.ReactNode; from?: number}> = ({width, src, aspect = 1.6, position = 'top center', children, from = 0}) => {
  const bar = width * 0.034;
  return (
    <div style={{width, borderRadius: width * 0.014, overflow: 'hidden', background: C.white, boxShadow: '0 ' + width * 0.04 + 'px ' + width * 0.09 + 'px rgba(13,13,13,0.35), 0 0 0 1px rgba(0,0,0,0.06)', position: 'relative'}}>
      <div style={{height: bar, background: '#F3F3F3', display: 'flex', alignItems: 'center', padding: '0 ' + bar * 0.5 + 'px', gap: bar * 0.22, borderBottom: '1px solid #e2e2e2'}}>
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <div key={c} style={{width: bar * 0.3, height: bar * 0.3, borderRadius: '50%', background: c}} />)}
        <div style={{marginLeft: bar * 0.6, flex: 1, maxWidth: width * 0.42, height: bar * 0.58, borderRadius: bar, background: C.white, display: 'flex', alignItems: 'center', gap: bar * 0.18, padding: '0 ' + bar * 0.4 + 'px', fontFamily, fontSize: bar * 0.34, color: '#555', fontWeight: 500}}>
          <span style={{color: C.red, fontWeight: 800}}>+</span> swisscv-pro.ch
        </div>
      </div>
      <div style={{width, height: width / aspect, position: 'relative', overflow: 'hidden', background: C.white}}>
        <Sequence from={from} layout="none"><OffthreadVideo src={staticFile(src)} muted style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: position}} /></Sequence>
        {children}
      </div>
    </div>
  );
};

// Red slash wipe used between shots inside a device
const Wipe: React.FC<{at: number; dur?: number}> = ({at, dur = 12}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at - dur / 2, at + dur / 2], [-1.3, 1.3], clamp);
  if (f < at - dur / 2 || f > at + dur / 2) return null;
  return <AbsoluteFill style={{background: C.red, transform: 'translateX(' + p * 100 + '%) skewX(-18deg)', zIndex: 5}} />;
};

const SwissGrid: React.FC<{color?: string; opacity?: number; drift?: number}> = ({color = C.dark, opacity = 0.06, drift = 0}) => {
  const {u} = useLayout();
  const s = 90 * u;
  return (
    <AbsoluteFill style={{opacity, backgroundImage: 'linear-gradient(' + color + ' 1px, transparent 1px), linear-gradient(90deg, ' + color + ' 1px, transparent 1px)', backgroundSize: s + 'px ' + s + 'px', backgroundPosition: drift + 'px ' + drift * 0.5 + 'px'}} />
  );
};

/* ---------- Scenes ---------- */

// 1. Hook — "6 secondes"
const SceneHook: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {u, W, H, portrait} = useLayout();
  const mark = spring({frame: f, fps, config: {damping: 12, stiffness: 120}});
  const draw = interpolate(f, [6, 22], [0, 1], {...clamp, easing: ease});
  const count = Math.round(interpolate(f, [32, 58], [0, 6], {...clamp, easing: Easing.out(Easing.cubic)}));
  const big = spring({frame: f - 30, fps, config: {damping: 14, stiffness: 140}});
  const tail = interpolate(f, [70, 84], [0, 1], {...clamp, easing: ease});
  const cover = interpolate(f, [98, 115], [0, 1], {...clamp, easing: easeIn});
  const markSize = 120 * u;
  const coverScale = 1 + cover * (Math.hypot(W, H) / markSize) * 1.6;
  const numSize = (W > H * 1.2 ? 380 : 290) * u;
  return (
    <AbsoluteFill style={{background: C.dark, alignItems: 'center', justifyContent: 'center'}}>
      <SwissGrid color="#fff" opacity={0.05} drift={f * 0.6} />
      <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 * u, opacity: 1 - cover}}>
        <div style={{transform: 'scale(' + mark + ') rotate(' + (1 - mark) * -90 + 'deg)'}}>
          <CrossMark size={markSize * (1 - cover * 0.2)} draw={draw} />
        </div>
        <div style={{marginTop: 20 * u}}><Kicker text="En Suisse, votre CV a" delay={12} size={(portrait ? 24 : 26) * u} color="#fff" /></div>
        <div style={{display: 'flex', alignItems: 'baseline', fontFamily, color: C.white, fontWeight: 900, letterSpacing: -numSize * 0.06, transform: 'scale(' + (0.6 + big * 0.4) + ')', opacity: big, lineHeight: 0.9}}>
          <span style={{fontSize: numSize, color: C.red, fontVariantNumeric: 'tabular-nums'}}>{count}</span>
          <span style={{fontSize: numSize * 0.36, marginLeft: 18 * u, letterSpacing: -numSize * 0.008}}>secondes</span>
        </div>
        <div style={{fontFamily, fontWeight: 700, fontSize: numSize * 0.17, color: C.white, opacity: tail, transform: 'translateY(' + (1 - tail) * 30 + 'px)', letterSpacing: -2 * u}}>
          pour <span style={{color: C.red}}>convaincre.</span>
        </div>
      </div>
      {/* red takeover */}
      <div style={{position: 'absolute', width: markSize, height: markSize, background: C.red, borderRadius: markSize * 0.22 * (1 - cover), transform: 'scale(' + coverScale + ') rotate(' + cover * 45 + 'deg)', opacity: cover > 0 ? 1 : 0}} />
    </AbsoluteFill>
  );
};

// 2. Statement — "Votre CV mérite mieux."
const SceneStatement: React.FC = () => {
  const f = useCurrentFrame();
  const {u, portrait} = useLayout();
  const panel = interpolate(f, [0, 14], [100, 0], {...clamp, easing: ease});
  const out = interpolate(f, [40, 50], [0, 1], {...clamp, easing: easeIn});
  const size = (portrait ? 170 : 150) * u;
  return (
    <AbsoluteFill style={{background: C.red}}>
      <AbsoluteFill style={{background: C.white, transform: 'translateY(' + panel + '%)', alignItems: 'center', justifyContent: 'center', padding: 80 * u}}>
        <SwissGrid drift={-f} />
        <div style={{transform: 'scale(' + (1 + f * 0.0025) + ') translateY(' + out * -40 + 'px)', opacity: 1 - out, filter: 'blur(' + out * 12 + 'px)', width: portrait ? '90%' : '80%'}}>
          <Words text="Votre CV mérite mieux." delay={8} size={size} red={[3]} underline={3} stagger={4} align="center" />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Layout helper: text block + device, responsive
const Split: React.FC<{text: React.ReactNode; device: React.ReactNode; bg?: string}> = ({text, device, bg = C.white}) => {
  const {portrait, square, u} = useLayout();
  if (portrait || square) {
    return (
      <AbsoluteFill style={{background: bg, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: (portrait ? 110 : 50) * u, padding: (portrait ? 70 : 60) * u}}>
        <div style={{width: '100%'}}>{text}</div>
        <div style={{perspective: 1800 * u}}>{device}</div>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{background: bg, flexDirection: 'row', alignItems: 'center', padding: '0 ' + 110 * u + 'px', gap: 80 * u}}>
      <div style={{width: '36%'}}>{text}</div>
      <div style={{flex: 1, perspective: 2200 * u, display: 'flex', justifyContent: 'center'}}>{device}</div>
    </AbsoluteFill>
  );
};

const deviceWidth = (W: number, portrait: boolean, square: boolean) => (portrait ? W * 0.9 : square ? W * 0.8 : W * 0.54);

const ScoreRing: React.FC<{start: number; size: number}> = ({start, size}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame: f - start, fps, config: {damping: 11, stiffness: 160}});
  const val = interpolate(f - start, [4, 34], [0, 100], {...clamp, easing: Easing.out(Easing.cubic)});
  const r = size * 0.4, c = 2 * Math.PI * r;
  return (
    <div style={{width: size, height: size, borderRadius: '50%', background: C.white, boxShadow: '0 ' + size * 0.08 + 'px ' + size * 0.25 + 'px rgba(0,0,0,0.25)', transform: 'scale(' + pop + ') rotate(' + (1 - pop) * -40 + 'deg)', position: 'relative', fontFamily}}>
      <svg width={size} height={size} style={{position: 'absolute', transform: 'rotate(-90deg)'}}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={C.gray} strokeWidth={size * 0.07} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={C.red} strokeWidth={size * 0.07} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - val / 100)} />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontSize: size * 0.3, fontWeight: 900, color: C.dark, letterSpacing: -size * 0.015, fontVariantNumeric: 'tabular-nums'}}>{Math.round(val)}</div>
        <div style={{fontSize: size * 0.085, fontWeight: 700, color: C.red, letterSpacing: size * 0.01}}>SCORE CV</div>
      </div>
    </div>
  );
};

// 3. Analyse — hero → upload → score
const SceneAnalyse: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {W, u, portrait, square} = useLayout();
  const dw = deviceWidth(W, portrait, square);
  const enter = spring({frame: f, fps, config: {damping: 18, stiffness: 90}});
  const exit = interpolate(f, [125, 135], [0, 1], {...clamp, easing: easeIn});
  const rotY = portrait || square ? 0 : -14 + (1 - enter) * -30 + f * 0.05;
  const rotX = portrait || square ? 8 - f * 0.04 : 6;
  const hs = (portrait ? 118 : square ? 92 : 104) * u;
  const step = f < 33 ? 0 : f < 85 ? 1 : 2;
  const titles = ['SwissCV Pro', 'Analysé. Optimisé.', 'Compatible ATS.'];
  const starts = [0, 33, 85];
  const stag = [4, 25, 6][step];
  const text = (
    <div style={{display: 'flex', flexDirection: 'column', gap: 26 * u, alignItems: portrait || square ? 'center' : 'flex-start'}}>
      <Kicker text="01 — Analyse IA" delay={2} size={24 * u} />
      <Sequence from={starts[step]} layout="none" key={step}>
        <Words text={titles[step]} size={hs} stagger={stag} delay={step === 0 ? 5 : 0} red={step === 2 ? [1] : step === 1 ? [1] : [1]} align={portrait || square ? 'center' : 'left'} />
      </Sequence>
      <div style={{fontFamily, fontSize: 30 * u, color: '#555', fontWeight: 500, opacity: interpolate(f, [16, 30], [0, 1], clamp), textAlign: portrait || square ? 'center' : 'left'}}>
        Optimisé pour les standards suisses et les logiciels ATS.
      </div>
    </div>
  );
  const device = (
    <div style={{transform: 'translateY(' + ((1 - enter) * 300 + exit * -80) * u + 'px) rotateY(' + rotY + 'deg) rotateX(' + rotX + 'deg) scale(' + (0.9 + enter * 0.1 + f * 0.0006) + ')', opacity: 1 - exit, position: 'relative'}}>
      <Browser width={dw} src={step === 0 ? 'hero.mp4' : step === 1 ? 'upload.mp4' : 'score.mp4'} aspect={1.6} position={step === 2 ? 'center top' : 'top center'} from={starts[step]} key={step}>
        <Wipe at={33} />
        <Wipe at={85} />
      </Browser>
      {f >= 90 && (
        <div style={{position: 'absolute', right: -dw * 0.05, bottom: -dw * 0.07}}>
          <ScoreRing start={90} size={dw * (portrait ? 0.32 : 0.26)} />
        </div>
      )}
    </div>
  );
  return <Split text={text} device={device} />;
};

// 4. Features carousel — one per beat block
const FEATURES = [
  {src: 'tpl.mp4', title: 'Modèles suisses', sub: 'Des designs pros, prêts pour Zurich, Genève ou Lausanne.', aspect: 1.25},
  {src: 'letter.mp4', title: 'Lettre de motivation', sub: "Rédigée par l'IA, adaptée à chaque offre.", aspect: 1.6},
  {src: 'jobs.mp4', title: "Offres d'emploi", sub: 'Trouvez et comparez les offres avec votre CV.', aspect: 1.6},
  {src: 'interview.mp4', title: 'Entretiens', sub: 'Questions fréquentes et conseils par secteur.', aspect: 1.6},
  {src: 'tracker.mp4', title: 'Suivi des candidatures', sub: 'Toutes vos candidatures, en un coup d’œil.', aspect: 1.6},
];

const FeatureCard: React.FC<{i: number}> = ({i}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {W, u, portrait, square} = useLayout();
  const ft = FEATURES[i];
  const dw = deviceWidth(W, portrait, square) * (ft.aspect < 1.4 ? 0.82 : 1);
  const enter = spring({frame: f, fps, config: {damping: 17, stiffness: 120}});
  const exit = interpolate(f, [FEAT - 9, FEAT], [0, 1], {...clamp, easing: easeIn});
  const vertical = portrait || square;
  const tx = vertical ? 0 : (1 - enter) * 700 * u - exit * 900 * u;
  const ty = vertical ? (1 - enter) * 500 * u - exit * 600 * u : 0;
  const rotY = vertical ? 0 : (1 - enter) * -45 - 10 + exit * 35;
  const rotX = vertical ? (1 - enter) * 30 + 6 - exit * 20 : 4;
  const hs = (portrait ? 120 : square ? 92 : 110) * u;
  const num = String(i + 2).padStart(2, '0');
  const text = (
    <div style={{position: 'relative', display: 'flex', flexDirection: 'column', gap: 22 * u, alignItems: vertical ? 'center' : 'flex-start', opacity: 1 - exit, transform: 'translateX(' + exit * -60 * u + 'px)'}}>
      <div style={{position: 'absolute', top: -230 * u, left: vertical ? '50%' : -20 * u, transform: (vertical ? 'translateX(-50%) ' : '') + 'translateY(' + (1 - enter) * 60 + 'px)', fontFamily, fontWeight: 900, fontSize: 300 * u, lineHeight: 1, color: 'transparent', WebkitTextStroke: 2 * u + 'px rgba(213,0,0,0.18)', letterSpacing: -12 * u}}>{num}</div>
      <Kicker text={num + ' — Outils'} size={24 * u} />
      <Words text={ft.title} size={hs} red={[ft.title.split(' ').length - 1]} align={vertical ? 'center' : 'left'} delay={2} />
      <div style={{fontFamily, fontSize: 30 * u, color: '#555', fontWeight: 500, opacity: interpolate(f, [10, 22], [0, 1], clamp), textAlign: vertical ? 'center' : 'left', maxWidth: 640 * u}}>{ft.sub}</div>
    </div>
  );
  const device = (
    <div style={{transform: 'translate(' + tx + 'px,' + ty + 'px) rotateY(' + rotY + 'deg) rotateX(' + rotX + 'deg) scale(' + (1 + f * 0.0012) + ')'}}>
      <Browser width={dw} src={ft.src} aspect={ft.aspect} />
    </div>
  );
  return <Split text={text} device={device} />;
};

const SceneFeatures: React.FC = () => (
  <AbsoluteFill style={{background: C.white}}>
    <SwissGrid opacity={0.04} />
    {FEATURES.map((_, i) => (
      <Sequence key={i} from={i * FEAT} durationInFrames={FEAT}>
        <FeatureCard i={i} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

// 5. Mosaic wall — "Tout-en-un."
const WALL = ['dash.mp4', 'tpl.mp4', 'jobs.mp4', 'score.mp4', 'letter.mp4', 'tracker.mp4', 'interview.mp4', 'modal.mp4', 'upload.mp4', 'hero.mp4', 'jobs.mp4', 'dash.mp4'];
const SceneWall: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {W, H, u, portrait} = useLayout();
  const zoom = interpolate(f, [0, 75], [1.9, 1.15], {...clamp, easing: Easing.out(Easing.cubic)});
  const cols = portrait ? 3 : 4;
  const tileW = (Math.max(W, H) * 1.25) / cols;
  const t = spring({frame: f - 12, fps, config: {damping: 15, stiffness: 130}});
  const hs = (W > H * 1.2 ? 190 : 150) * u;
  return (
    <AbsoluteFill style={{background: C.dark, overflow: 'hidden', perspective: 2000 * u}}>
      <div style={{position: 'absolute', left: '50%', top: '50%', display: 'grid', gridTemplateColumns: 'repeat(' + cols + ', ' + tileW + 'px)', gap: 30 * u, transform: 'translate(-50%,-50%) rotateX(28deg) rotateZ(-14deg) scale(' + zoom + ') translateY(' + -f * 2 * u + 'px)'}}>
        {WALL.concat(WALL.slice(0, portrait ? 6 : 4)).map((s, i) => {
          const d = spring({frame: f - (i % 5) * 2, fps, config: {damping: 20}});
          return (
            <div key={i} style={{width: tileW, height: tileW / 1.6, borderRadius: 14 * u, overflow: 'hidden', opacity: d, transform: 'translateY(' + (1 - d) * 120 + 'px)', boxShadow: '0 30px 60px rgba(0,0,0,0.5)'}}>
              <OffthreadVideo src={staticFile(s)} muted style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top'}} />
            </div>
          );
        })}
      </div>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(13,13,13,0.55) 0%, rgba(13,13,13,0.85) 70%)'}} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 30 * u}}>
        <div style={{transform: 'scale(' + (0.8 + t * 0.2) + ')'}}>
          <div style={{display: 'flex', alignItems: 'flex-end'}}><Words text="Tout-en-un" size={hs} color={C.white} delay={10} weight={900} align="center" /><span style={{fontFamily, fontWeight: 900, fontSize: hs, color: C.red, lineHeight: 1.02, opacity: t}}>.</span></div>
        </div>
        <div style={{fontFamily, color: 'rgba(255,255,255,0.85)', fontWeight: 600, fontSize: (portrait ? 34 : 32) * u, letterSpacing: 4 * u, opacity: t, textAlign: 'center', padding: '0 ' + 60 * u + 'px'}}>
          {['Analyse', 'Modèles', 'Lettres', 'Offres', 'Entretiens', 'Suivi'].map((w, i) => (
            <span key={w} style={{opacity: interpolate(f, [22 + i * 4, 30 + i * 4], [0, 1], clamp)}}>{w}{i < 5 ? <span style={{color: C.red}}>{'  ·  '}</span> : null}</span>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// 6. End card
const SceneEnd: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {W, H, u, portrait} = useLayout();
  const reveal = interpolate(f, [0, 16], [0, Math.hypot(W, H) * 0.6], {...clamp, easing: ease});
  const mark = spring({frame: f - 6, fps, config: {damping: 10, stiffness: 140}});
  const draw = interpolate(f, [10, 24], [0, 1], {...clamp, easing: ease});
  const wm = 'SwissCV Pro';
  const cta = spring({frame: f - 62, fps, config: {damping: 13, stiffness: 150}});
  const pulse = 1 + Math.sin(Math.max(0, f - 78) / 5) * 0.015;
  const ms = (portrait ? 190 : 150) * u;
  return (
    <AbsoluteFill style={{clipPath: 'circle(' + reveal + 'px at 50% 50%)', background: C.white, alignItems: 'center', justifyContent: 'center'}}>
      <SwissGrid opacity={0.045} drift={f * 0.4} />
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34 * u}}>
        <div style={{transform: 'scale(' + mark + ') rotate(' + (1 - mark) * 180 + 'deg)'}}>
          <CrossMark size={ms} draw={draw} />
        </div>
        <div style={{display: 'flex', fontFamily, fontWeight: 800, fontSize: (portrait ? 120 : 110) * u, letterSpacing: -5 * u, color: C.dark}}>
          {wm.split('').map((ch, i) => {
            const s = spring({frame: f - 14 - i * 1.5, fps, config: {damping: 14, stiffness: 200}});
            return <span key={i} style={{display: 'inline-block', whiteSpace: 'pre', opacity: s, transform: 'translateY(' + (1 - s) * 40 + 'px)'}}>{ch}</span>;
          })}
        </div>
        <div style={{width: portrait ? '86%' : 'auto'}}>
          <Words text="Décrochez plus d'entretiens en Suisse." size={(portrait ? 58 : 48) * u} weight={600} red={[4, 5]} delay={16} stagger={3} align="center" color="#333" lh={1.15} />
        </div>
        <div style={{marginTop: 14 * u, transform: 'scale(' + cta * pulse + ')', opacity: cta, background: C.red, color: C.white, fontFamily, fontWeight: 700, fontSize: (portrait ? 40 : 34) * u, padding: 22 * u + 'px ' + 46 * u + 'px', borderRadius: 14 * u, boxShadow: '0 18px 40px rgba(213,0,0,0.35)'}}>
          Essayer gratuitement → swisscv-pro.ch
        </div>
        <div style={{fontFamily, fontSize: (portrait ? 28 : 24) * u, color: '#777', fontWeight: 500, opacity: interpolate(f, [74, 88], [0, 1], clamp)}}>
          5 crédits offerts · Sans carte bancaire
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Global chrome ---------- */

const Chrome: React.FC = () => {
  const f = useCurrentFrame();
  const {u} = useLayout();
  const show = interpolate(f, [S3, S3 + 10, S5 - 5, S5], [0, 1, 1, 0], clamp);
  return (
    <>
      <div style={{position: 'absolute', top: 44 * u, left: 54 * u, display: 'flex', alignItems: 'center', gap: 12 * u, opacity: show, fontFamily, fontWeight: 800, fontSize: 26 * u, color: C.dark, letterSpacing: -0.5 * u}}>
        <CrossMark size={34 * u} radius={0.2} /> SwissCV Pro
      </div>
      <div style={{position: 'absolute', left: 0, bottom: 0, height: 6 * u, width: (f / TOTAL) * 100 + '%', background: C.red, opacity: f < S6 ? 1 : 0}} />
    </>
  );
};

export const Promo: React.FC = () => (
  <AbsoluteFill style={{background: C.white, fontFamily}}>
    <Sequence from={S1} durationInFrames={S2 - S1}><SceneHook /></Sequence>
    <Sequence from={S2} durationInFrames={S3 - S2}><SceneStatement /></Sequence>
    <Sequence from={S3} durationInFrames={S4 - S3}><SceneAnalyse /></Sequence>
    <Sequence from={S4} durationInFrames={S5 - S4}><SceneFeatures /></Sequence>
    <Sequence from={S5} durationInFrames={S6 - S5 + 16}><SceneWall /></Sequence>
    <Sequence from={S6} durationInFrames={TOTAL - S6}><SceneEnd /></Sequence>
    <Chrome />
    <Audio src={staticFile('music.wav')} volume={musicVolume} />
    {VO.map(([file, st]) => (
      <Sequence key={file} from={st}><Audio src={staticFile(file)} volume={1} /></Sequence>
    ))}
  </AbsoluteFill>
);
