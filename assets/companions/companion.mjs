/* Koompa companion rig. Geometry helpers and cat design: Roundimals (MIT).
 * Platypus, semantic layers, expressions and reactions: this project. */
import { SPECIES, FACE, EXPRESSIONS, HEAD, BODY, arm, head, fill, line,
  circle, pill, rrect, rtri, tomb, partToSvg, zzz, thoughtDots } from './roundimals-kit.mjs';

export const ANIMALS = {
  cat: { name: 'Chat', nickname: 'Mochi', personality: 'Curieux, doux et toujours partant.', color: '#F8FAFC',
    species: { ...SPECIES.cat, palette: { fur: '#F8FAFC', furShade: '#D1D6DF', light: '#E5E9EF',
      inner: '#FFB2B2', feature: '#515B6C', nose: '#F5A4A4', pattern: '#ADB6C4', pupil: '#3989C8' } } },
  platypus: { name: 'Ornithorynque', nickname: 'Pipo', personality: 'Un drôle de petit explorateur au grand cœur.', color: '#BA8054',
    species: { body: 140, ears: 'none', palette: { fur: '#BA8054', furShade: '#A66E45', light: '#F8DEBA',
      inner: '#F8DEBA', feature: '#613D2B', nose: '#694837', pattern: '#925D3D' } } },
};

export const STATES = [
  { id: 'neutral', label: 'Paisible', category: 'Expression', expression: 'neutral', pose: 'idle',
    message: 'Un petit pas à la fois. Je suis avec toi.', detail: 'Un sourire doux et une respiration tranquille.' },
  { id: 'happy', label: 'Heureux', category: 'Expression', expression: 'happy', pose: 'happy',
    message: 'Ça me fait plaisir de te retrouver !', detail: 'Les yeux sourient, la bouche aussi.' },
  { id: 'laugh', label: 'Amusé', category: 'Expression', expression: 'laugh', pose: 'laugh',
    message: 'Hihi ! On forme une super équipe.', detail: 'Un grand rire, les yeux fermés et le corps qui gigote.' },
  { id: 'thinking', label: 'Pensif', category: 'Expression', expression: 'thinking', pose: 'thinking',
    message: 'Hmm… cherchons une idée ensemble.', detail: 'Une patte sous le menton et le regard qui cherche.' },
  { id: 'surprised', label: 'Surpris', category: 'Expression', expression: 'surprised', pose: 'surprised',
    message: 'Oh ! Je ne m’y attendais pas !', detail: 'Les yeux s’ouvrent et les pattes se lèvent.' },
  { id: 'sad', label: 'Triste', category: 'Expression', expression: 'sad', pose: 'sad',
    message: 'Les petits coups de blues, ça arrive. On reste ensemble.', detail: 'Un regard doux vers le bas et une petite larme.' },
  { id: 'talking', label: 'Bavard', category: 'Expression', expression: 'talking', pose: 'talking',
    message: 'J’ai une idée : on commence par quelque chose de simple ?', detail: 'Une bouche qui parle et une patte qui explique.' },
  { id: 'sleeping', label: 'Endormi', category: 'Expression', expression: 'sleeping', pose: 'sleeping',
    message: 'Zzz… une petite pause fait du bien.', detail: 'Les yeux se ferment, la respiration ralentit.' },
  { id: 'waving', label: 'Bonjour !', category: 'Réaction', expression: 'happy', pose: 'waving',
    message: 'Coucou ! Prêt pour une nouvelle aventure ?', detail: 'Un vrai mouvement de la patte pour dire bonjour.' },
  { id: 'celebrating', label: 'En fête', category: 'Réaction', expression: 'laugh', pose: 'celebrating',
    message: 'Waouh ! Tu peux être fier de toi !', detail: 'Les deux pattes en l’air et un bond de joie.' },
  { id: 'proud', label: 'Fier', category: 'Réaction', expression: 'happy', pose: 'proud',
    message: 'Tu progresses. Tous ces petits efforts comptent !', detail: 'Une patte levée et un petit signe de tête.' },
  { id: 'encouraging', label: 'À tes côtés', category: 'Réaction', expression: 'neutral', pose: 'encouraging',
    message: 'Une note ne raconte pas tout. On essaie ensemble ?', detail: 'Une patte tendue et un sourire rassurant.' },
  { id: 'waiting', label: 'Patient', category: 'Réaction', expression: 'thinking', pose: 'waiting',
    message: 'Je prépare la suite… encore un petit instant.', detail: 'Trois petits points accompagnent l’attente.' },
];

const stateMap = new Map(STATES.map(state => [state.id, state]));
export const getState = id => stateMap.get(id) || STATES[0];
const svgParts = parts => parts.map(partToSvg).join('');
const group = (name, parts, extra = '') => `<g data-part="${name}" ${extra}>${svgParts(parts)}</g>`;
const hang = side => ({ from: [side * 38, 98], to: [side * 74, 150], side });
// Smaller limbs suit these companions: scale every segment, paw and digit
// together around the fixed shoulder, preserving the articulation and poses.
const ARM_SCALE = .7;

function armsFor(pose) {
  const arms = [hang(-1), hang(1)];
  if (['thinking', 'waiting'].includes(pose)) arms[1] = { from: [38, 98], elbow: [98, 122], to: [30, 64], side: 1, front: true, shade: true };
  if (pose === 'talking') arms[1] = { from: [38, 98], to: [120, 72], paw: 'point', side: 1 };
  if (pose === 'waving') arms[1] = { from: [38, 98], elbow: [104, 100], to: [114, 30], paw: 'wave', side: 1 };
  if (pose === 'proud') arms[0] = { from: [-38, 98], elbow: [-100, 128], to: [-100, 60], paw: 'thumb', side: -1 };
  if (pose === 'celebrating') return [-1, 1].map(side => ({ from: [side * 38, 98], to: [side * 110, -26], side }));
  if (pose === 'surprised') return [-1, 1].map(side => ({ from: [side * 38, 98], elbow: [side * 102, 112], to: [side * 74, 40], side, front: true }));
  if (pose === 'encouraging') arms[1] = { from: [38, 98], elbow: [95, 110], to: [112, 69], side: 1, paw: 'ball' };
  if (['sleeping', 'sad'].includes(pose)) return [-1, 1].map(side => ({ ...hang(side), to: [side * 66, 150] }));
  return arms;
}

function catEars(p) {
  const parts = [];
  for (const side of [-1, 1]) {
    const mirror = pts => pts.map(([x, y]) => [side * x, y]);
    parts.push(fill(rtri(...mirror([[-49, -30], [-40, -98], [-2, -58]]), 8), p.pattern));
    parts.push(fill(rtri(...mirror([[-38, -46], [-36, -82], [-16, -60]]), 5), p.inner));
  }
  return parts;
}

function platypusHead(e, p) {
  // Retain the kit's eye geometry; replace its muzzle/nose/mouth with a wide,
  // flat bill. The eye cuts always use the surrounding fur color.
  const face = head(ANIMALS.platypus.species, e, p);
  const muzzle = face.findIndex(part => part.fill === p.light);
  const eyeParts = face.slice(1, muzzle);
  const bill = [fill(rrect(-59, 17, 118, 39, 19), '#E9B76F'), fill(pill(-12, 24, 7, 4), p.nose), fill(pill(12, 24, 7, 4), p.nose)];
  if (['laugh', 'talk'].includes(e.mouth)) {
    const w = e.mouth === 'laugh' ? 25 : 15;
    bill.push(fill(pill(1, 39, w, e.mouth === 'laugh' ? 14 : 10), p.mouth), fill(pill(2, 43, w * .55, 4), p.tongue));
  } else if (['o', 'snore'].includes(e.mouth)) {
    bill.push(fill(pill(1, 39, e.mouth === 'o' ? 11 : 8, e.mouth === 'o' ? 13 : 9), p.mouth));
  } else {
    const d = e.mouth === 'sad' ? 'M-12 43Q0 35 14 42' : e.mouth === 'flat' ? 'M-5 40H12' : 'M-14 38Q0 49 17 37';
    bill.push(line(d, p.feature, 4));
  }
  const tear = e.tear ? [fill(rtri([-35, 6], [-40, 20], [-31, 20], 2), p.tear), fill(circle(-35, 19, 4.5), p.tear)] : [];
  return { outline: [fill(rrect(HEAD.x, HEAD.y, HEAD.w, HEAD.h, HEAD.r), p.fur)], eyes: eyeParts, bill, tear };
}

export function companionSvg(animalId = 'cat', stateId = 'neutral') {
  const id = Object.hasOwn(ANIMALS, animalId) ? animalId : 'cat';
  const animal = ANIMALS[id];
  const state = getState(stateId);
  const p = { ...FACE, ...animal.species.palette };
  const e = EXPRESSIONS[state.expression];
  const arms = armsFor(state.pose);
  const armPalette = id === 'cat' ? { ...p, fur: p.furShade, furShade: p.pattern } : p;
  const renderedArm = spec => {
    const [x, y] = spec.from;
    const parts = [{ t: `translate(${x} ${y}) scale(${ARM_SCALE}) translate(${-x} ${-y})`, kids: arm(spec, armPalette) }];
    return group(spec.side < 0 ? 'arm-left' : 'arm-right', parts, `style="--pivot:${x}px ${y}px"`);
  };
  const w = animal.species.body || BODY.w;
  const torso = [fill(tomb(0, BODY.top, w, BODY.bottom - BODY.top, BODY.r), p.fur), fill(pill(0, 120, w * .56, 74), p.light)];
  const feet = [-1, 1].map(side => fill(pill(side * 30, 166, 50, 30), id === 'platypus' ? '#E9B76F' : p.furShade));
  const tail = id === 'cat'
    ? [line('M-44 150L-98 146L-106 92', p.pattern, 17)]
    : [{ t: 'rotate(25 -48 145)', kids: [fill(rrect(-145, 110, 110, 46, 23), p.pattern)] }];
  let face;
  if (id === 'cat') {
    const parts = head(animal.species, e, p);
    const muzzle = parts.findIndex(part => part.fill === p.light);
    const noseAndMouth = parts.slice(muzzle).filter(part => part.fill !== p.tear);
    const tear = parts.filter(part => part.fill === p.tear);
    face = svgParts(catEars(p)) + svgParts(parts.slice(0, 1)) + group('eyes', parts.slice(1, muzzle))
      + group('mouth', noseAndMouth) + group('tear', tear);
  } else {
    const parts = platypusHead(e, p);
    face = svgParts(parts.outline) + group('eyes', parts.eyes) + group('mouth', parts.bill) + group('tear', parts.tear);
  }
  const accents = state.pose === 'sleeping' ? zzz(p) : state.pose === 'waiting' ? thoughtDots(p) : [];
  return `<svg class="companion-svg" xmlns="http://www.w3.org/2000/svg" viewBox="-170 -165 340 375" role="img" aria-label="${animal.name} : ${state.label}" data-animal="${id}" data-state="${state.id}">
    ${group('shadow', [fill(pill(0, 187, 145, 10), '#C4B5E2')])}
    <g data-part="creature">
      ${group('tail', tail)}
      ${arms.filter(spec => !spec.front).map(renderedArm).join('')}
      ${group('body', torso)}${group('feet', feet)}
      <g data-part="head">${face}</g>
      ${arms.filter(spec => spec.front).map(renderedArm).join('')}
      ${group('accents', accents)}
    </g>
  </svg>`;
}

const motions = new Map();
const kf = transforms => transforms.map(transform => ({ transform }));

export function stopCompanion(container) {
  for (const animation of motions.get(container) || []) animation.cancel();
  motions.delete(container);
}

export function animateCompanion(container, stateId, { reducedMotion = false, speed = 1, loop = true } = {}) {
  stopCompanion(container);
  if (reducedMotion || !container.querySelector('svg') || typeof Element.prototype.animate !== 'function') return;
  const state = getState(stateId);
  const active = [];
  const run = (part, transforms, duration, repeat = false, ease = 'ease-in-out', delay = 0) => {
    const element = container.querySelector(`[data-part="${part}"]`);
    if (!element) return;
    const animation = element.animate(kf(transforms), { duration: duration / speed, delay: delay / speed,
      iterations: repeat && loop ? Infinity : 1, easing: ease, fill: 'none' });
    active.push(animation);
  };
  const still = 'translate(0, 0) rotate(0deg) scale(1)';
  const breathe = state.pose === 'sleeping' ? 4100 : 3200;
  run('body', ['scale(1)', 'scale(1.015, 1.025)', 'scale(1)'], breathe, true);
  if (!['sleeping', 'laugh', 'celebrating'].includes(state.pose)) {
    const eyes = container.querySelector('[data-part="eyes"]');
    active.push(eyes.animate([{ transform: 'scaleY(1)', offset: 0 }, { transform: 'scaleY(1)', offset: .94 },
      { transform: 'scaleY(.06)', offset: .97 }, { transform: 'scaleY(1)', offset: 1 }], { duration: 4800 / speed, iterations: loop ? Infinity : 1 }));
  }
  if (state.pose === 'happy') run('creature', [still, 'translate(0, -7px) rotate(-3deg)', still, 'translate(0, -4px) rotate(3deg)', still], 1500, true);
  else if (state.pose === 'laugh') run('creature', [still, 'translate(0, -3px) rotate(-4deg)', 'translate(0, -3px) rotate(4deg)', still], 600, true);
  else if (state.pose === 'thinking' || state.pose === 'waiting') run('head', ['rotate(0deg)', 'rotate(-7deg)', 'rotate(-7deg)', 'rotate(0deg)'], 3200, true);
  else if (state.pose === 'surprised') run('creature', [still, 'translate(0, 4px) scale(1.03, .96)', 'translate(0, -14px) scale(.98, 1.03)', still], 900);
  else if (state.pose === 'sad') { run('head', ['rotate(0deg)', 'rotate(5deg)', 'rotate(3deg)'], 1200); run('tear', ['translateY(0)', 'translateY(8px)', 'translateY(0)'], 2100, true); }
  else if (state.pose === 'talking') { run('mouth', ['scaleY(1)', 'scaleY(.76)', 'scaleY(1)'], 450, true); run('arm-right', ['rotate(0deg)', 'rotate(-6deg)', 'rotate(0deg)'], 1500, true); }
  else if (state.pose === 'waving') run('arm-right', ['rotate(0deg)', 'rotate(-13deg)', 'rotate(8deg)', 'rotate(-13deg)', 'rotate(0deg)'], 1250, true);
  else if (state.pose === 'celebrating') {
    run('creature', [still, 'translate(0, 7px) scale(1.06, .94)', 'translate(0, -33px) rotate(-7deg) scale(.96, 1.04)', 'translate(0, -8px) rotate(5deg)', still], 1300, true);
    run('shadow', ['scaleX(1)', 'scaleX(.75)', 'scaleX(1)'], 1300, true);
  } else if (state.pose === 'proud') run('head', ['rotate(0deg)', 'translateY(4px) rotate(3deg)', 'rotate(0deg)'], 1600, true);
  else if (state.pose === 'encouraging') run('arm-right', ['rotate(0deg)', 'rotate(-7deg)', 'rotate(0deg)'], 2100, true);
  if (!['surprised', 'sad'].includes(state.pose)) run('tail', ['rotate(0deg)', 'rotate(-7deg)', 'rotate(5deg)', 'rotate(0deg)'], state.pose === 'sleeping' ? 6000 : 2600, true);
  if (state.pose === 'sleeping' || state.pose === 'waiting') run('accents', ['translateY(0)', 'translateY(-6px)', 'translateY(0)'], 2400, true);
  motions.set(container, active);
}
