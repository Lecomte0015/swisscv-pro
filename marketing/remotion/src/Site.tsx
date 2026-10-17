import React from 'react';
import {AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Inter';

const {fontFamily} = loadFont('normal', {weights: ['400', '500', '600', '700', '800', '900'], subsets: ['latin']});
const C = {red: '#D50000', dark: '#0D0D0D', gray: '#E6E6E6', bg: '#F6F7F9', green: '#16A34A', greenBg: '#ECFDF3', yellow: '#F5B400', text: '#555'};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);

const Cross: React.FC<{size: number}> = ({size}) => (
  <div style={{width: size, height: size, background: C.red, borderRadius: size * 0.22, position: 'relative', flexShrink: 0}}>
    <div style={{position: 'absolute', left: '50%', top: '50%', width: size * 0.62, height: size * 0.2, background: '#fff', transform: 'translate(-50%,-50%)'}} />
    <div style={{position: 'absolute', left: '50%', top: '50%', width: size * 0.2, height: size * 0.62, background: '#fff', transform: 'translate(-50%,-50%)'}} />
  </div>
);

const Ring: React.FC<{size: number; value: number; color: string; label: string}> = ({size, value, color, label}) => {
  const r = size * 0.42, c = 2 * Math.PI * r;
  return (
    <div style={{width: size, height: size, position: 'relative'}}>
      <svg width={size} height={size} style={{position: 'absolute', transform: 'rotate(-90deg)'}}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#E5E5E5" strokeWidth={size * 0.08} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={size * 0.08} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontSize: size * 0.32, fontWeight: 900, color: C.dark, lineHeight: 1}}>{Math.round(value)}</div>
      </div>
      <div style={{position: 'absolute', top: size + 10, left: 0, right: 0, textAlign: 'center', fontSize: size * 0.085, fontWeight: 700, letterSpacing: 2, color: '#666'}}>{label}</div>
    </div>
  );
};

const Tap: React.FC<{at: number; x: number; y: number}> = ({at, x, y}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + 16], [0, 1], clamp);
  if (f < at - 8 || f > at + 18) return null;
  const appear = interpolate(f, [at - 8, at], [0, 1], clamp);
  return (
    <>
      <div style={{position: 'absolute', left: x - 22, top: y - 22, width: 44, height: 44, borderRadius: '50%', background: 'rgba(13,13,13,0.25)', border: '2px solid rgba(255,255,255,0.9)', opacity: appear * (1 - p * 0.6), transform: 'scale(' + (1 - p * 0.2) + ')'}} />
      <div style={{position: 'absolute', left: x - 40, top: y - 40, width: 80, height: 80, borderRadius: '50%', border: '3px solid rgba(213,0,0,0.6)', opacity: 1 - p, transform: 'scale(' + (0.4 + p * 0.9) + ')'}} />
    </>
  );
};

/* =====================================================================
   1) HAUT DE PAGE — écran de téléphone, boucle muette de 10 s (540x1170)
   Interface recréée d'après les vrais écrans (aucune donnée personnelle).
   ===================================================================== */
export const HERO_FRAMES = 300;

const PhoneBar: React.FC = () => (
  <div style={{position: 'relative', zIndex: 5, height: 92, background: '#fff', borderBottom: '1px solid #EEE', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 26px 16px'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 22}}><Cross size={30} /> SwissCV Pro</div>
    <div style={{background: C.dark, color: '#fff', fontWeight: 700, fontSize: 15, padding: '8px 14px', borderRadius: 10}}>Crédits : 5</div>
  </div>
);

const UploadScreen: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fly = spring({frame: f - 12, fps, config: {damping: 15, stiffness: 110}});
  const landed = f >= 34;
  const card = spring({frame: f - 34, fps, config: {damping: 14, stiffness: 160}});
  const press = f >= 44 && f < 52 ? 0.95 : 1;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <PhoneBar />
      <div style={{padding: '30px 24px'}}>
        <div style={{fontWeight: 800, fontSize: 32, letterSpacing: -1}}>Analysez votre CV</div>
        <div style={{fontSize: 17, color: C.text, marginTop: 8, lineHeight: 1.4}}>Score global, recommandations personnalisées, optimisation ATS.</div>
        <div style={{marginTop: 26, height: 300, borderRadius: 18, border: '3px dashed ' + (f > 20 && !landed ? C.red : '#D5D5D5'), background: f > 20 && !landed ? '#FFF5F5' : '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14}}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={C.dark} strokeWidth="1.8"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
          <div style={{fontWeight: 700, fontSize: 21}}>Glissez-déposez votre CV ici</div>
          <div style={{background: C.red, color: '#fff', fontWeight: 700, fontSize: 17, padding: '12px 22px', borderRadius: 10}}>Choisir un fichier</div>
        </div>
        {landed && (
          <div style={{marginTop: 18, display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderRadius: 14, background: C.greenBg, border: '1px solid #BBF7D0', transform: 'scale(' + card + ')', opacity: card}}>
            <div style={{width: 34, height: 34, borderRadius: '50%', background: C.green, color: '#fff', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✓</div>
            <div><div style={{fontWeight: 700, fontSize: 18}}>mon-cv.pdf</div><div style={{fontSize: 14, color: '#666'}}>352 Ko</div></div>
          </div>
        )}
        <div style={{marginTop: 22, textAlign: 'center'}}>
          <div style={{display: 'inline-block', background: landed ? C.red : '#CFCFCF', color: '#fff', fontWeight: 800, fontSize: 20, padding: '18px 34px', borderRadius: 12, boxShadow: landed ? '0 10px 24px rgba(213,0,0,0.3)' : 'none', transform: 'scale(' + press + ')'}}>Analyser mon CV <span style={{fontSize: 14, opacity: 0.8}}>(1 crédit)</span></div>
        </div>
      </div>
      {!landed && (
        <div style={{position: 'absolute', left: interpolate(fly, [0, 1], [420, 200]), top: interpolate(fly, [0, 1], [1000, 330]), transform: 'rotate(' + (1 - fly) * 18 + 'deg)', opacity: f > 10 ? 1 : 0}}>
          <div style={{width: 120, height: 150, background: '#fff', borderRadius: 10, boxShadow: '0 18px 40px rgba(0,0,0,0.25)', position: 'relative', padding: 16}}>
            {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{height: 8, borderRadius: 4, background: i === 0 ? C.dark : '#DDD', width: i === 0 ? '70%' : (90 - i * 8) + '%', marginBottom: 10}} />)}
            <div style={{position: 'absolute', bottom: 12, right: 12, background: C.red, color: '#fff', fontWeight: 800, fontSize: 13, padding: '4px 8px', borderRadius: 5}}>PDF</div>
          </div>
        </div>
      )}
      <Tap at={46} x={270} y={690} />
    </AbsoluteFill>
  );
};

const AnalysingScreen: React.FC = () => {
  const f = useCurrentFrame();
  const items = ['Structure du CV', 'Standards suisses', 'Compatibilité ATS'];
  return (
    <AbsoluteFill style={{background: 'rgba(13,13,13,0.94)', alignItems: 'center', justifyContent: 'center', color: '#fff'}}>
      <div style={{width: 70, height: 70, borderRadius: '50%', border: '6px solid rgba(255,255,255,0.15)', borderTopColor: C.red, transform: 'rotate(' + f * 14 + 'deg)'}} />
      <div style={{fontWeight: 800, fontSize: 26, marginTop: 26}}>Analyse en cours…</div>
      <div style={{marginTop: 30, display: 'flex', flexDirection: 'column', gap: 14}}>
        {items.map((t, i) => {
          const on = interpolate(f, [8 + i * 12, 16 + i * 12], [0, 1], clamp);
          return (
            <div key={t} style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 19, fontWeight: 600, opacity: 0.35 + on * 0.65}}>
              <div style={{width: 26, height: 26, borderRadius: '50%', background: on > 0.5 ? C.green : 'transparent', border: '2px solid ' + (on > 0.5 ? C.green : 'rgba(255,255,255,0.4)'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15}}>{on > 0.5 ? '✓' : ''}</div>{t}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const ResultCard: React.FC<{at: number; children: React.ReactNode; style?: React.CSSProperties}> = ({at, children, style}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - at, fps, config: {damping: 18, stiffness: 140}});
  return <div style={{transform: 'translateY(' + (1 - s) * 60 + 'px)', opacity: s, ...style}}>{children}</div>;
};

const ResultsScreen: React.FC = () => {
  const f = useCurrentFrame();
  const score = interpolate(f, [4, 40], [0, 62], {...clamp, easing: Easing.out(Easing.cubic)});
  const scroll = interpolate(f, [70, 100], [0, -230], {...clamp, easing: ease});
  const point = (ok: boolean, t: string) => (
    <div style={{padding: '12px 14px', borderLeft: '4px solid ' + (ok ? C.green : C.yellow), background: ok ? '#F0FDF4' : '#FFFBEB', borderRadius: 8, fontSize: 16, lineHeight: 1.35, marginTop: 10}}>{t}</div>
  );
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <div style={{position: 'absolute', top: 92, left: 0, right: 0, padding: '28px 24px', transform: 'translateY(' + scroll + 'px)'}}>
        <div style={{background: '#fff', borderRadius: 18, padding: '30px 0 56px', display: 'flex', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.05)'}}>
          <Ring size={190} value={score} color={C.yellow} label="SCORE GLOBAL" />
        </div>
        <ResultCard at={44}>
          <div style={{marginTop: 18, background: C.dark, color: '#fff', borderRadius: 14, padding: '18px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12}}>
            <div><div style={{fontWeight: 800, fontSize: 17}}>Refaire ce CV au format suisse ?</div><div style={{fontSize: 13, opacity: 0.75, marginTop: 4}}>6 modèles, aperçu en temps réel</div></div>
            <div style={{background: '#fff', color: C.dark, fontWeight: 800, fontSize: 14, padding: '10px 12px', borderRadius: 8, whiteSpace: 'nowrap', boxShadow: f > 110 ? '0 0 0 ' + (3 + Math.sin(f / 3) * 2) + 'px rgba(213,0,0,0.6)' : 'none'}}>Créer mon CV →</div>
          </div>
        </ResultCard>
        <ResultCard at={54}>
          <div style={{marginTop: 18, background: '#fff', borderRadius: 14, padding: 18}}>
            <div style={{fontWeight: 800, fontSize: 20}}>✓ Points forts</div>
            {point(true, 'Expérience concrète et bien mise en valeur')}
            {point(true, 'Permis de travail indiqué clairement')}
          </div>
        </ResultCard>
        <ResultCard at={64}>
          <div style={{marginTop: 18, background: '#fff', borderRadius: 14, padding: 18}}>
            <div style={{fontWeight: 800, fontSize: 20}}>⚠ Points à améliorer</div>
            {point(false, 'Regroupez vos compétences par poste occupé')}
            {point(false, 'Indiquez le niveau CECR de chaque langue')}
          </div>
        </ResultCard>
      </div>
      <PhoneBar />
      <Tap at={118} x={440} y={224} />
    </AbsoluteFill>
  );
};

const BuilderScreen: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pct = interpolate(f, [6, 46], [0, 100], {...clamp, easing: Easing.out(Easing.cubic)});
  const cv = spring({frame: f, fps, config: {damping: 18, stiffness: 120}});
  const lines = Math.floor(interpolate(f, [4, 40], [0, 9], clamp));
  const btn = spring({frame: f - 50, fps, config: {damping: 12, stiffness: 160}});
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <PhoneBar />
      <div style={{padding: '26px 24px'}}>
        <div style={{fontWeight: 800, fontSize: 30, letterSpacing: -1}}>Votre CV suisse</div>
        <div style={{marginTop: 18, display: 'flex', gap: 16, alignItems: 'stretch'}}>
          <div style={{width: 260, height: 360, background: '#fff', borderRadius: 10, overflow: 'hidden', display: 'flex', boxShadow: '0 14px 34px rgba(0,0,0,0.14)', transform: 'scale(' + (0.9 + cv * 0.1) + ')', opacity: cv}}>
            <div style={{width: 84, background: '#1F2A44', padding: 12}}>
              <div style={{width: 52, height: 52, borderRadius: '50%', background: '#C9D3E6', margin: '0 auto 14px'}} />
              {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} style={{height: 5, borderRadius: 3, background: 'rgba(255,255,255,' + (i < lines ? 0.6 : 0.12) + ')', marginBottom: 9, width: (90 - (i % 3) * 18) + '%'}} />)}
            </div>
            <div style={{flex: 1, padding: 14}}>
              <div style={{height: 11, width: '70%', background: C.dark, borderRadius: 3, marginBottom: 6}} />
              <div style={{height: 6, width: '45%', background: C.red, borderRadius: 3, marginBottom: 16}} />
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => <div key={i} style={{height: 5, borderRadius: 3, background: i < lines ? (i % 4 === 0 ? '#999' : '#D6D6D6') : '#F1F1F1', marginBottom: 11, width: (96 - (i % 4) * 12) + '%'}} />)}
            </div>
          </div>
          <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 10}}>
            <div style={{background: 'linear-gradient(135deg,#16A34A,#15803D)', color: '#fff', borderRadius: 14, padding: '16px 10px', textAlign: 'center'}}>
              <div style={{fontSize: 46, fontWeight: 900, lineHeight: 1}}>{Math.round(pct)}<span style={{fontSize: 22}}>%</span></div>
              <div style={{fontSize: 13, fontWeight: 600, marginTop: 4}}>CV complet</div>
            </div>
            {['Coordonnées', 'Permis', 'Expérience', 'Langues', 'Photo'].map((t, i) => {
              const on = pct >= (i + 1) * 19;
              return <div key={t} style={{fontSize: 15, fontWeight: 600, color: on ? C.green : '#AAA'}}>{on ? '✓' : '○'} {t}</div>;
            })}
          </div>
        </div>
        <div style={{marginTop: 30, textAlign: 'center', transform: 'scale(' + btn + ')', opacity: btn}}>
          <div style={{display: 'inline-block', background: C.red, color: '#fff', fontWeight: 800, fontSize: 20, padding: '18px 30px', borderRadius: 12, boxShadow: '0 10px 24px rgba(213,0,0,0.3)'}}>⬇ Télécharger mon CV en PDF</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const HeroPhone: React.FC = () => {
  const f = useCurrentFrame();
  const fadeTo = (a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);
  return (
    <AbsoluteFill style={{fontFamily, color: C.dark, background: C.bg, zoom: 1.42}}>
      <Sequence from={0} durationInFrames={70}><UploadScreen /></Sequence>
      <Sequence from={56} durationInFrames={50}><AbsoluteFill style={{opacity: fadeTo(56, 64) * (1 - fadeTo(98, 106))}}><AnalysingScreen /></AbsoluteFill></Sequence>
      <Sequence from={100} durationInFrames={132}><AbsoluteFill style={{opacity: fadeTo(100, 106)}}><ResultsScreen /></AbsoluteFill></Sequence>
      <Sequence from={226} durationInFrames={74}><AbsoluteFill style={{opacity: fadeTo(226, 234)}}><BuilderScreen /></AbsoluteFill></Sequence>
      {/* retour en douceur vers la première image pour une boucle sans à-coup */}
      <Sequence from={288} durationInFrames={12}><AbsoluteFill style={{opacity: fadeTo(288, 299)}}><UploadScreen /></AbsoluteFill></Sequence>
    </AbsoluteFill>
  );
};

/* =====================================================================
   2) « COMMENT ÇA MARCHE » — vidéo carrée 1080x1080, vraies images
   Chapitres : 0–7 s Déposez · 7–13 s Analyse · 13–19 s CV suisse
   ===================================================================== */
export const HOWTO_FRAMES = 570;
export const HOWTO_CHAPTERS = [0, 210, 390];

const STEPS = [
  {n: '1', t: 'Déposez votre CV', s: 'PDF, Word ou texte — l’analyse démarre en un clic.'},
  {n: '2', t: 'Recevez votre analyse', s: 'Score global, points forts et points à améliorer.'},
  {n: '3', t: 'Optimisez et postulez', s: 'Refaites votre CV au format suisse, prêt en PDF.'},
];

// Caméra : affiche la région (x, y, w) d'une vidéo source de largeur srcW dans le cadre (W x H)
const Cam: React.FC<{src: string; srcW: number; srcH: number; from: [number, number, number]; to?: [number, number, number]; t0?: number; t1?: number; W: number; H: number; startFrom?: number}> = ({src, srcW, srcH, from, to, t0 = 0, t1 = 1, W, H}) => {
  const f = useCurrentFrame();
  const k = to ? interpolate(f, [t0, t1], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)}) : 0;
  const lerp = (a: number, b: number) => a + (b - a) * k;
  const x = to ? lerp(from[0], to[0]) : from[0], y = to ? lerp(from[1], to[1]) : from[1], w = to ? lerp(from[2], to[2]) : from[2];
  const s = W / w;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <OffthreadVideo src={staticFile(src)} muted style={{position: 'absolute', left: -x * s, top: -y * s, width: srcW * s, height: srcH * s}} />
    </AbsoluteFill>
  );
};

const Chip: React.FC<{children: React.ReactNode; at: number; x: number; y: number; dark?: boolean}> = ({children, at, x, y, dark}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - at, fps, config: {damping: 13, stiffness: 160}});
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: 'scale(' + s + ')', opacity: s, background: dark ? C.dark : C.red, color: '#fff', fontWeight: 800, fontSize: 30, padding: '14px 24px', borderRadius: 40, boxShadow: '0 12px 30px rgba(0,0,0,0.25)', whiteSpace: 'nowrap'}}>{children}</div>
  );
};

export const HowTo: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ch = f < HOWTO_CHAPTERS[1] ? 0 : f < HOWTO_CHAPTERS[2] ? 1 : 2;
  const chStart = HOWTO_CHAPTERS[ch];
  const head = spring({frame: f - chStart, fps, config: {damping: 16, stiffness: 140}});
  const VW = 1000, VH = 760; // fenêtre « écran » sous le titre
  const drop = spring({frame: f - 50, fps, config: {damping: 14, stiffness: 120}});
  return (
    <AbsoluteFill style={{background: C.bg, fontFamily, color: C.dark}}>
      {/* En-tête du chapitre */}
      <div style={{position: 'absolute', left: 40, right: 40, top: 34, height: 210, display: 'flex', alignItems: 'center', gap: 28}}>
        <div style={{width: 110, height: 110, borderRadius: 26, background: C.red, color: '#fff', fontWeight: 900, fontSize: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'scale(' + head + ') rotate(' + (1 - head) * -30 + 'deg)', flexShrink: 0}}>{STEPS[ch].n}</div>
        <div style={{transform: 'translateX(' + (1 - head) * 40 + 'px)', opacity: head}}>
          <div style={{fontWeight: 800, fontSize: 58, letterSpacing: -2, lineHeight: 1.05}}>{STEPS[ch].t}</div>
          <div style={{fontWeight: 500, fontSize: 28, color: C.text, marginTop: 10}}>{STEPS[ch].s}</div>
        </div>
      </div>
      {/* Progression des 3 étapes */}
      <div style={{position: 'absolute', left: 40, right: 40, top: 250, display: 'flex', gap: 12}}>
        {[0, 1, 2].map((i) => {
          const a = HOWTO_CHAPTERS[i], b = i < 2 ? HOWTO_CHAPTERS[i + 1] : HOWTO_FRAMES;
          return <div key={i} style={{flex: 1, height: 8, borderRadius: 4, background: '#E2E2E2', overflow: 'hidden'}}><div style={{height: '100%', width: interpolate(f, [a, b], [0, 100], clamp) + '%', background: C.red}} /></div>;
        })}
      </div>
      {/* Écran */}
      <div style={{position: 'absolute', left: 40, top: 290, width: VW, height: VH, borderRadius: 22, overflow: 'hidden', background: '#fff', boxShadow: '0 24px 60px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.06)'}}>
        {/* Chapitre 1 : dépôt (vraie page) + fichier animé + analyse */}
        <Sequence from={0} durationInFrames={150}>
          <Cam src="a_drop.mp4" srcW={1440} srcH={756} from={[300, 150, 800]} to={[420, 210, 600]} t0={10} t1={60} W={VW} H={VH} />
          <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
            <div style={{transform: 'translate(' + (1 - drop) * 380 + 'px,' + ((1 - drop) * 420 - 40) + 'px) rotate(' + (1 - drop) * 20 + 'deg)', opacity: f > 40 ? 1 : 0}}>
              <div style={{width: 150, height: 190, background: '#fff', borderRadius: 12, boxShadow: '0 24px 50px rgba(0,0,0,0.3)', padding: 20, position: 'relative'}}>
                {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} style={{height: 9, borderRadius: 4, background: i === 0 ? C.dark : '#DDD', width: i === 0 ? '70%' : (92 - i * 9) + '%', marginBottom: 12}} />)}
                <div style={{position: 'absolute', bottom: 14, right: 14, background: C.red, color: '#fff', fontWeight: 800, fontSize: 16, padding: '5px 10px', borderRadius: 6}}>PDF</div>
              </div>
            </div>
          </AbsoluteFill>
          <Chip at={88} x={300} y={600}>✓ mon-cv.pdf chargé</Chip>
        </Sequence>
        <Sequence from={150} durationInFrames={60}>
          <Cam src="a_wait.mp4" srcW={1440} srcH={756} from={[340, 64, 760]} W={VW} H={VH} />
          <Chip at={8} x={330} y={560} dark>≈ 30 secondes</Chip>
        </Sequence>
        {/* Chapitre 2 : score qui monte puis recommandations (vraie page) */}
        <Sequence from={210} durationInFrames={180}>
          <Cam src="a_score.mp4" srcW={1440} srcH={756} from={[470, 40, 500]} to={[230, 66, 980]} t0={70} t1={110} W={VW} H={VH} />
          {/* masque : rien sous les bandeaux (le contenu de l'analyse reste privé) */}
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: interpolate(f - 210, [70, 110], [0, 176], clamp), background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0, #fff 40px)'}} />
          <Chip at={130} x={150} y={640}>Recommandations personnalisées</Chip>
        </Sequence>
        {/* Chapitre 3 : générateur de CV suisse (modèles puis CV complet) */}
        <Sequence from={390} durationInFrames={80}>
          <Cam src="tpl.mp4" srcW={1300} srcH={1072} from={[220, 250, 1080]} to={[260, 280, 900]} t0={0} t1={80} W={VW} H={VH} />
          <Chip at={14} x={40} y={640} dark>6 modèles suisses</Chip>
        </Sequence>
        <Sequence from={470} durationInFrames={100}>
          <Cam src="score.mp4" srcW={1300} srcH={1026} from={[0, 0, 1300]} to={[0, 0, 1050]} t0={0} t1={100} W={VW} H={VH} />
          <Chip at={16} x={560} y={560}>CV complet 100 %</Chip>
          <Chip at={40} x={560} y={650} dark>PDF prêt à envoyer</Chip>
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};
