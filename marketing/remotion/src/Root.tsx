import React from 'react';
import {Composition, Still} from 'remotion';
import {Promo, TOTAL} from './Promo';
import * as K from './Kit';
import * as S from './Site';

const POSTS: [string, React.FC][] = [
  ['P01-lancement', K.P01Launch], ['P02-6-secondes', K.P02Seconds], ['P03-5-regles', K.P03Rules], ['P04-ats', K.P04Ats],
  ['P05-modeles', K.P05Templates], ['P06-lettre', K.P06Letter], ['P07-offres', K.P07Jobs], ['P08-suivi', K.P08Tracker],
  ['P09-entretien', K.P09Interview], ['P10-5-credits', K.P10Free], ['P11-pack', K.P11Pack],
];

export const Root: React.FC = () => (
  <>
    <Composition id="Landscape" component={Promo} durationInFrames={TOTAL} fps={30} width={1920} height={1080} />
    <Composition id="Portrait" component={Promo} durationInFrames={TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="Square" component={Promo} durationInFrames={TOTAL} fps={30} width={1080} height={1080} />
    <Composition id="Feed45" component={Promo} durationInFrames={TOTAL} fps={30} width={1080} height={1350} />
    <Still id="profil-rouge" component={K.ProfileRed} width={1080} height={1080} />
    <Still id="profil-blanc" component={K.ProfileWhite} width={1080} height={1080} />
    <Still id="couverture" component={K.Cover} width={1640} height={624} />
    <Composition id="HeroPhone" component={S.HeroPhone} durationInFrames={S.HERO_FRAMES} fps={30} width={540} height={1170} />
    <Composition id="HowTo" component={S.HowTo} durationInFrames={S.HOWTO_FRAMES} fps={30} width={1080} height={1080} />
    <Still id="og-image" component={K.OgImage} width={1200} height={630} />
    {POSTS.map(([id, c]) => <Still key={id} id={id} component={c} width={1080} height={1350} />)}
  </>
);
