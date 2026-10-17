import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Inter';

const {fontFamily} = loadFont('normal', {weights: ['400', '500', '600', '700', '800', '900'], subsets: ['latin']});
const C = {red: '#D50000', redDeep: '#B80000', dark: '#0D0D0D', white: '#FFFFFF', gray: '#E6E6E6', soft: '#FFF5F5', text: '#444'};

/* ---------- primitives ---------- */

const Cross: React.FC<{size: number; bg?: string; fg?: string; radius?: number; shadow?: boolean}> = ({size, bg = C.red, fg = C.white, radius = 0.22, shadow = true}) => {
  const bar = size * 0.2, len = size * 0.62;
  return (
    <div style={{width: size, height: size, background: bg, borderRadius: size * radius, position: 'relative', flexShrink: 0, boxShadow: shadow ? '0 ' + size * 0.1 + 'px ' + size * 0.28 + 'px rgba(213,0,0,0.3)' : 'none'}}>
      <div style={{position: 'absolute', left: '50%', top: '50%', width: len, height: bar, background: fg, transform: 'translate(-50%,-50%)', borderRadius: bar * 0.12}} />
      <div style={{position: 'absolute', left: '50%', top: '50%', width: bar, height: len, background: fg, transform: 'translate(-50%,-50%)', borderRadius: bar * 0.12}} />
    </div>
  );
};

const Grid: React.FC<{color?: string; opacity?: number; size?: number}> = ({color = C.dark, opacity = 0.05, size = 90}) => (
  <AbsoluteFill style={{opacity, backgroundImage: 'linear-gradient(' + color + ' 1px, transparent 1px), linear-gradient(90deg, ' + color + ' 1px, transparent 1px)', backgroundSize: size + 'px ' + size + 'px'}} />
);

const Browser: React.FC<{src: string; width: number; height: number; position?: string}> = ({src, width, height, position = 'top center'}) => {
  const bar = width * 0.036;
  return (
    <div style={{width, borderRadius: width * 0.016, overflow: 'hidden', background: C.white, boxShadow: '0 40px 90px rgba(13,13,13,0.28), 0 0 0 1px rgba(0,0,0,0.06)'}}>
      <div style={{height: bar, background: '#F3F3F3', display: 'flex', alignItems: 'center', padding: '0 ' + bar * 0.5 + 'px', gap: bar * 0.22, borderBottom: '1px solid #e2e2e2'}}>
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <div key={c} style={{width: bar * 0.3, height: bar * 0.3, borderRadius: '50%', background: c}} />)}
        <div style={{marginLeft: bar * 0.6, width: width * 0.4, height: bar * 0.58, borderRadius: bar, background: C.white, display: 'flex', alignItems: 'center', gap: bar * 0.18, padding: '0 ' + bar * 0.4 + 'px', fontFamily, fontSize: bar * 0.36, color: '#555', fontWeight: 500}}>
          <span style={{color: C.red, fontWeight: 800}}>+</span> swisscv-pro.ch
        </div>
      </div>
      <div style={{width, height: height - bar, overflow: 'hidden'}}>
        <Img src={staticFile('kit/' + src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: position}} />
      </div>
    </div>
  );
};

type Theme = 'light' | 'dark' | 'red' | 'soft';
const themeBg: Record<Theme, string> = {light: C.white, dark: C.dark, red: C.red, soft: C.soft};
const fgOf = (t: Theme) => (t === 'dark' || t === 'red' ? C.white : C.dark);

// Shared 4:5 post frame: brand bar on top, url footer at the bottom
const Post: React.FC<{theme?: Theme; tag: string; children: React.ReactNode; cta?: string}> = ({theme = 'light', tag, children, cta = 'Essayer gratuitement'}) => {
  const fg = fgOf(theme);
  const onRed = theme === 'red';
  return (
    <AbsoluteFill style={{background: themeBg[theme], fontFamily, color: fg, overflow: 'hidden'}}>
      <Grid color={fg} opacity={theme === 'light' ? 0.045 : 0.07} />
      <div style={{position: 'absolute', top: 60, left: 70, right: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, fontWeight: 800, fontSize: 34, letterSpacing: -0.5}}>
          <Cross size={50} bg={onRed ? C.white : C.red} fg={onRed ? C.red : C.white} shadow={false} radius={0.2} /> SwissCV Pro
        </div>
        <div style={{fontWeight: 700, fontSize: 20, letterSpacing: 4, textTransform: 'uppercase', padding: '10px 18px', borderRadius: 8, border: '2px solid ' + (onRed ? 'rgba(255,255,255,0.6)' : C.red), color: onRed ? C.white : C.red}}>{tag}</div>
      </div>
      <div style={{position: 'absolute', top: 160, left: 70, right: 70, bottom: 160}}>{children}</div>
      <div style={{position: 'absolute', bottom: 60, left: 70, right: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div style={{fontWeight: 700, fontSize: 30, letterSpacing: -0.3}}>swisscv-pro.ch</div>
        <div style={{background: onRed ? C.white : C.red, color: onRed ? C.red : C.white, fontWeight: 700, fontSize: 26, padding: '16px 30px', borderRadius: 12}}>{cta} →</div>
      </div>
    </AbsoluteFill>
  );
};

const H: React.FC<{children: React.ReactNode; size?: number; color?: string}> = ({children, size = 92, color}) => (
  <div style={{fontWeight: 800, fontSize: size, lineHeight: 1.02, letterSpacing: -size * 0.045, color}}>{children}</div>
);
const R: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = C.red}) => <span style={{color}}>{children}</span>;
const P: React.FC<{children: React.ReactNode; size?: number; color?: string; max?: number}> = ({children, size = 34, color, max}) => (
  <div style={{fontWeight: 500, fontSize: size, lineHeight: 1.35, opacity: color ? 1 : 0.78, color, maxWidth: max}}>{children}</div>
);
const Kicker: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = C.red}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 18, fontWeight: 700, fontSize: 24, letterSpacing: 5, textTransform: 'uppercase', color}}>
    <div style={{width: 56, height: 4, background: color}} />{children}
  </div>
);
const Chip: React.FC<{children: React.ReactNode; dark?: boolean}> = ({children, dark}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, fontWeight: 600, fontSize: 24, padding: '12px 20px', borderRadius: 40, background: dark ? 'rgba(255,255,255,0.1)' : C.white, border: dark ? '1px solid rgba(255,255,255,0.2)' : '1px solid ' + C.gray, color: dark ? C.white : C.dark}}>
    <span style={{color: C.red, fontWeight: 800}}>✓</span>{children}
  </div>
);

const Ring: React.FC<{size: number; value?: number}> = ({size, value = 100}) => {
  const r = size * 0.4, c = 2 * Math.PI * r;
  return (
    <div style={{width: size, height: size, borderRadius: '50%', background: C.white, boxShadow: '0 20px 60px rgba(0,0,0,0.22)', position: 'relative'}}>
      <svg width={size} height={size} style={{position: 'absolute', transform: 'rotate(-90deg)'}}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={C.gray} strokeWidth={size * 0.07} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={C.red} strokeWidth={size * 0.07} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily}}>
        <div style={{fontSize: size * 0.3, fontWeight: 900, color: C.dark}}>{value}</div>
        <div style={{fontSize: size * 0.085, fontWeight: 700, color: C.red, letterSpacing: 2}}>SCORE CV</div>
      </div>
    </div>
  );
};

/* ---------- Page kit ---------- */

export const ProfileRed: React.FC = () => (
  <AbsoluteFill style={{background: C.red, alignItems: 'center', justifyContent: 'center'}}>
    <Cross size={560} bg={C.red} fg={C.white} shadow={false} />
  </AbsoluteFill>
);

export const ProfileWhite: React.FC = () => (
  <AbsoluteFill style={{background: C.white, alignItems: 'center', justifyContent: 'center', fontFamily, gap: 40}}>
    <Cross size={360} />
    <div style={{fontWeight: 800, fontSize: 92, letterSpacing: -4, color: C.dark}}>SwissCV <R>Pro</R></div>
  </AbsoluteFill>
);

// 1640x624 — key content kept in the centre ~1100px (mobile crop) and away from bottom-left (profile photo)
export const Cover: React.FC = () => (
  <AbsoluteFill style={{background: C.dark, fontFamily, overflow: 'hidden'}}>
    <Grid color="#fff" opacity={0.06} size={78} />
    <div style={{position: 'absolute', right: -60, top: 70, transform: 'perspective(2200px) rotateY(-16deg) rotateX(6deg)', display: 'flex', gap: 30}}>
      <Browser src="score.png" width={560} height={380} position="center top" />
    </div>
    <div style={{position: 'absolute', right: 320, top: 300, transform: 'perspective(2200px) rotateY(-16deg) rotateX(6deg)'}}>
      <Browser src="jobs.png" width={520} height={330} />
    </div>
    <AbsoluteFill style={{background: 'linear-gradient(90deg, #0D0D0D 0%, #0D0D0D 38%, rgba(13,13,13,0.85) 55%, rgba(13,13,13,0.1) 100%)'}} />
    <div style={{position: 'absolute', left: 300, top: 120, width: 720, color: C.white}}>
      <Kicker>CV · Lettres · Offres · Entretiens</Kicker>
      <div style={{height: 26}} />
      <H size={78} color={C.white}>Décrochez plus d'entretiens <R>en Suisse.</R></H>
      <div style={{height: 26}} />
      <P size={28} color="rgba(255,255,255,0.8)">Analyse IA de votre CV, modèles suisses, lettres de motivation et offres d'emploi — au même endroit.</P>
    </div>
  </AbsoluteFill>
);

/* ---------- Launch posts (1080x1350) ---------- */

export const P01Launch: React.FC = () => (
  <Post theme="red" tag="Nouveau">
    <div style={{display: 'flex', flexDirection: 'column', gap: 30}}>
      <H size={104} color={C.white}>Votre CV suisse, enfin à la hauteur.</H>
      <P size={34} color="rgba(255,255,255,0.9)">Analyse IA, modèles suisses, lettres de motivation, offres d'emploi et suivi de candidatures. Une seule plateforme.</P>
    </div>
    <div style={{position: 'absolute', left: 40, right: -160, bottom: -40, transform: 'perspective(2000px) rotateY(-14deg) rotateX(8deg) rotateZ(2deg)'}}>
      <Browser src="hero.png" width={1040} height={560} />
    </div>
  </Post>
);

export const P02Seconds: React.FC = () => (
  <Post theme="dark" tag="Le saviez-vous ?" cta="Analyser mon CV">
    <div style={{display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', gap: 10}}>
      <Kicker>Premier tri d'un recruteur</Kicker>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 24, marginTop: 10}}>
        <span style={{fontSize: 520, fontWeight: 900, color: C.red, lineHeight: 0.85, letterSpacing: -30}}>6</span>
        <span style={{fontSize: 130, fontWeight: 800, letterSpacing: -6}}>secondes.</span>
      </div>
      <div style={{height: 30}} />
      <P size={40} max={880}>C'est à peu près le temps qu'un recruteur consacre à votre CV avant de décider de le lire… ou non.</P>
      <div style={{height: 16}} />
      <P size={40} color={C.white} max={880}><b>Chaque ligne doit compter.</b></P>
    </div>
  </Post>
);

const RULES: [string, string][] = [
  ['Une photo professionnelle', 'Courante et souvent attendue en Suisse.'],
  ['Nationalité & permis de travail', 'Permis B, C, G… à indiquer clairement.'],
  ['Vos langues avec leur niveau', 'Échelle européenne : A1 à C2.'],
  ['Certificats de travail & références', 'Un vrai atout dans le recrutement suisse.'],
  ['Deux pages maximum', 'Expériences de la plus récente à la plus ancienne.'],
];
export const P03Rules: React.FC = () => (
  <Post theme="light" tag="Conseil CV">
    <H size={88}>Le CV suisse : <R>5 règles d'or.</R></H>
    <div style={{display: 'flex', flexDirection: 'column', gap: 18, marginTop: 50}}>
      {RULES.map(([t, d], i) => (
        <div key={t} style={{display: 'flex', alignItems: 'center', gap: 28, background: C.white, border: '1px solid ' + C.gray, borderRadius: 18, padding: '22px 28px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)'}}>
          <div style={{width: 74, height: 74, borderRadius: 14, background: i === 0 ? C.red : C.dark, color: C.white, fontWeight: 900, fontSize: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>{i + 1}</div>
          <div>
            <div style={{fontWeight: 800, fontSize: 36, letterSpacing: -1}}>{t}</div>
            <div style={{fontWeight: 500, fontSize: 26, color: '#666', marginTop: 4}}>{d}</div>
          </div>
        </div>
      ))}
    </div>
  </Post>
);

export const P04Ats: React.FC = () => (
  <Post theme="soft" tag="Conseil CV" cta="Tester mon CV">
    <Kicker>ATS, kézako ?</Kicker>
    <div style={{height: 24}} />
    <H size={86}>Votre CV passe-t-il <R>le filtre des robots ?</R></H>
    <div style={{height: 26}} />
    <P size={32} max={900}>Beaucoup d'entreprises trient les candidatures avec un logiciel (ATS) avant qu'un humain ne les lise. Mauvaise structure = CV écarté.</P>
    <div style={{position: 'absolute', left: 0, right: 80, bottom: -10}}>
      <Browser src="score.png" width={860} height={520} position="center top" />
    </div>
    <div style={{position: 'absolute', right: -10, bottom: 20}}><Ring size={290} /></div>
  </Post>
);

export const P05Templates: React.FC = () => (
  <Post theme="dark" tag="Modèles" cta="Voir les modèles">
    <H size={92} color={C.white}>6 modèles de CV <R>pensés pour la Suisse.</R></H>
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 34}}>
      {['Geneva Executive', 'Zurich Corporate', 'Swiss Digital', 'Basel Tech', 'Lausanne Studio', 'Berne Design'].map((n) => <Chip key={n} dark>{n}</Chip>)}
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: -20, display: 'flex', justifyContent: 'center', transform: 'perspective(2000px) rotateX(10deg)'}}>
      <Browser src="tpl.png" width={900} height={600} position="top left" />
    </div>
  </Post>
);

export const P06Letter: React.FC = () => (
  <Post theme="light" tag="Lettre de motivation" cta="Générer ma lettre">
    <H size={90}>Votre lettre de motivation, <R>sur mesure.</R></H>
    <div style={{height: 26}} />
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 12}}>
      <Chip>Adaptée à chaque offre</Chip><Chip>Ton professionnel suisse</Chip><Chip>Prête en quelques secondes</Chip>
    </div>
    <div style={{position: 'absolute', left: -20, right: -20, bottom: -30, transform: 'perspective(2000px) rotateY(10deg) rotateX(6deg)'}}>
      <Browser src="letter.png" width={980} height={620} />
    </div>
  </Post>
);

export const P07Jobs: React.FC = () => (
  <Post theme="light" tag="Offres d'emploi" cta="Trouver une offre">
    <H size={92}>Trouvez l'offre. <R>Postulez en 1 clic.</R></H>
    <div style={{height: 24}} />
    <P size={32} max={900}>Depuis une offre : CV adapté au poste, lettre personnalisée et score de compatibilité, en un seul clic.</P>
    <div style={{position: 'absolute', left: -10, bottom: 90, transform: 'perspective(2000px) rotateY(-10deg)'}}>
      <Browser src="jobs.png" width={760} height={520} />
    </div>
    <div style={{position: 'absolute', right: -30, bottom: -30, transform: 'perspective(2000px) rotateY(-10deg)'}}>
      <Browser src="modal.png" width={600} height={420} position="center center" />
    </div>
  </Post>
);

export const P08Tracker: React.FC = () => (
  <Post theme="soft" tag="Suivi" cta="Organiser ma recherche">
    <H size={92}>Toutes vos candidatures, <R>au même endroit.</R></H>
    <div style={{display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 30}}>
      {['À consulter', 'Postulé', 'Entretien', 'Offre'].map((n) => <Chip key={n}>{n}</Chip>)}
    </div>
    <div style={{position: 'absolute', left: -20, right: -20, bottom: -30, transform: 'perspective(2000px) rotateX(8deg)'}}>
      <Browser src="tracker.png" width={980} height={640} />
    </div>
  </Post>
);

export const P09Interview: React.FC = () => (
  <Post theme="light" tag="Entretien" cta="Me préparer">
    <Kicker>Vous avez décroché l'entretien ?</Kicker>
    <div style={{height: 24}} />
    <H size={92}>Arrivez prêt <R>à convaincre.</R></H>
    <div style={{height: 24}} />
    <P size={32} max={900}>Questions fréquentes et conseils personnalisés selon votre secteur : IT, finance, santé, ingénierie, commerce, hôtellerie…</P>
    <div style={{position: 'absolute', left: -10, right: -10, bottom: -30, transform: 'perspective(2000px) rotateY(-8deg) rotateX(6deg)'}}>
      <Browser src="interview.png" width={980} height={580} />
    </div>
  </Post>
);

export const P10Free: React.FC = () => (
  <Post theme="red" tag="Offre de bienvenue" cta="Créer mon compte">
    <div style={{display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center'}}>
      <div style={{fontSize: 360, fontWeight: 900, lineHeight: 0.85, letterSpacing: -20, color: C.white}}>5</div>
      <H size={120} color={C.white}>crédits offerts.</H>
      <div style={{height: 40}} />
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 14}}>
        {['Sans carte bancaire', 'Sans engagement', '1 analyse de CV = 1 crédit'].map((t) => (
          <div key={t} style={{fontWeight: 700, fontSize: 30, padding: '16px 26px', borderRadius: 50, background: 'rgba(255,255,255,0.14)', border: '2px solid rgba(255,255,255,0.5)'}}>{t}</div>
        ))}
      </div>
    </div>
  </Post>
);

export const P11Pack: React.FC = () => (
  <Post theme="dark" tag="Pack" cta="Découvrir le Pack">
    <Kicker>Vous cherchez un emploi maintenant ?</Kicker>
    <div style={{height: 26}} />
    <H size={96} color={C.white}>Pack Recherche <R>d'Emploi.</R></H>
    <div style={{display: 'flex', alignItems: 'flex-end', gap: 50, marginTop: 70}}>
      <div>
        <div style={{fontSize: 34, fontWeight: 600, opacity: 0.7}}>Paiement unique</div>
        <div style={{fontSize: 170, fontWeight: 900, letterSpacing: -8, lineHeight: 1}}><span style={{fontSize: 70, letterSpacing: -2}}>CHF </span>19.90</div>
      </div>
    </div>
    <div style={{display: 'flex', flexDirection: 'column', gap: 18, marginTop: 50}}>
      {['55 crédits, sans date d\'expiration', 'Aucun abonnement, aucun engagement', 'Analyses, lettres, candidatures en 1 clic'].map((t) => (
        <div key={t} style={{display: 'flex', alignItems: 'center', gap: 20, fontSize: 36, fontWeight: 600}}>
          <Cross size={44} shadow={false} radius={0.2} />{t}
        </div>
      ))}
    </div>
  </Post>
);

/* ---------- Image d'aperçu des liens (Open Graph) 1200x630 ---------- */
export const OgImage: React.FC = () => (
  <AbsoluteFill style={{background: C.dark, fontFamily, overflow: 'hidden', color: C.white}}>
    <Grid color="#fff" opacity={0.06} size={70} />
    <div style={{position: 'absolute', right: -120, top: 120, transform: 'perspective(2000px) rotateY(-18deg) rotateX(6deg)'}}>
      <Browser src="score.png" width={600} height={400} position="center top" />
    </div>
    <AbsoluteFill style={{background: 'linear-gradient(90deg, #0D0D0D 0%, #0D0D0D 45%, rgba(13,13,13,0.75) 62%, rgba(13,13,13,0) 100%)'}} />
    <div style={{position: 'absolute', left: 72, top: 64, display: 'flex', alignItems: 'center', gap: 18, fontWeight: 800, fontSize: 40, letterSpacing: -1}}>
      <Cross size={62} shadow={false} radius={0.22} /> SwissCV Pro
    </div>
    <div style={{position: 'absolute', left: 72, top: 172, width: 700}}>
      <H size={64} color={C.white}>Décrochez plus d'entretiens <R>en Suisse.</R></H>
      <div style={{height: 20}} />
      <P size={27} color="rgba(255,255,255,0.8)">Analyse IA de votre CV, modèles suisses, lettres de motivation et offres d'emploi.</P>
    </div>
    <div style={{position: 'absolute', left: 72, bottom: 60, display: 'flex', gap: 14, alignItems: 'center'}}>
      <div style={{background: C.red, fontWeight: 700, fontSize: 26, padding: '14px 26px', borderRadius: 12}}>5 crédits offerts</div>
      <div style={{fontWeight: 600, fontSize: 26, opacity: 0.85}}>swisscv-pro.ch</div>
    </div>
  </AbsoluteFill>
);
