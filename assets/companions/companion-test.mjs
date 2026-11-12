import { ANIMALS, STATES, getState, companionSvg, animateCompanion, stopCompanion } from './companion.mjs';

const $ = selector => document.querySelector(selector);
const stage = $('#stageCompanion');
const gallery = $('#emotionGallery');
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const initial = new URLSearchParams(location.search);
let animalId = Object.hasOwn(ANIMALS, initial.get('animal')) ? initial.get('animal') : 'platypus';
let stateId = getState(initial.get('state')).id;
let paused = motionPreference.matches;
let tourTimer = null;
let previewTimers = new Set();
let isTouring = false;
let beforeHiddenPaused = false;
const options = () => ({ reducedMotion: paused || motionPreference.matches || document.hidden, speed: Number($('#speed').value) });

function syncLocation() {
  const url = new URL(location.href);
  url.searchParams.set('animal', animalId);
  url.searchParams.set('state', stateId);
  history.replaceState(null, '', url);
}

function clearPreviews() {
  for (const timer of previewTimers) clearTimeout(timer);
  previewTimers.clear();
  gallery.querySelectorAll('.emotion-preview').forEach(stopCompanion);
}

function renderGallery() {
  clearPreviews();
  gallery.replaceChildren();
  for (const state of STATES) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'emotion-card';
    card.dataset.state = state.id;
    card.setAttribute('aria-pressed', String(state.id === stateId));
    card.setAttribute('aria-label', `${state.label}, ${state.category.toLowerCase()}`);
    card.innerHTML = `<span class="emotion-preview" aria-hidden="true">${companionSvg(animalId, state.id)}</span><span class="emotion-label">${state.label}</span><span class="emotion-category">${state.category}</span>`;
    card.addEventListener('click', () => { stopTour(); showState(state.id); });
    const preview = card.querySelector('.emotion-preview');
    const startPreview = () => {
      animateCompanion(preview, state.id, { ...options(), loop: false });
      const timer = setTimeout(() => { stopCompanion(preview); previewTimers.delete(timer); }, 5500);
      previewTimers.add(timer);
    };
    card.addEventListener('pointerenter', startPreview);
    card.addEventListener('pointerleave', () => stopCompanion(preview));
    card.addEventListener('focus', startPreview);
    card.addEventListener('blur', () => stopCompanion(preview));
    gallery.append(card);
  }
}

function renderStage() {
  stopCompanion(stage);
  stage.innerHTML = companionSvg(animalId, stateId);
  const animal = ANIMALS[animalId];
  $('#animalName').textContent = animal.nickname;
  $('#personality').textContent = animal.personality;
  stage.setAttribute('aria-label', `Rejouer la réaction de ${animal.nickname}`);
  document.querySelectorAll('.animal-tabs [data-animal]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.animal === animalId)));
  animateCompanion(stage, stateId, options());
}

function showState(id, message) {
  const state = getState(id);
  stateId = state.id;
  $('#speech').textContent = message || state.message;
  $('#sceneStatus').textContent = state.label;
  $('#stateDetail').textContent = state.detail;
  $('#stateCount').textContent = `${String(STATES.indexOf(state) + 1).padStart(2, '0')} / ${STATES.length}`;
  gallery.querySelectorAll('[data-state]').forEach(card => card.setAttribute('aria-pressed', String(card.dataset.state === stateId)));
  document.querySelectorAll('[data-result]').forEach(button => button.setAttribute('aria-pressed', 'false'));
  renderStage();
  syncLocation();
}

function stopTour() {
  clearTimeout(tourTimer);
  tourTimer = null;
  isTouring = false;
  $('#tour').setAttribute('aria-pressed', 'false');
  $('#tour').innerHTML = '<span aria-hidden="true">▷</span> Tout découvrir';
}

function tourStep() {
  if (!isTouring) return;
  const index = STATES.findIndex(state => state.id === stateId);
  if (index === STATES.length - 1) { stopTour(); return; }
  showState(STATES[index + 1].id);
  tourTimer = setTimeout(tourStep, 3200);
}

function updatePause() {
  const effectivePaused = paused || motionPreference.matches;
  $('#motionToggle').setAttribute('aria-pressed', String(effectivePaused));
  $('#motionToggle').textContent = motionPreference.matches ? 'Mouvements réduits' : paused ? 'Reprendre' : 'Mettre en pause';
  $('#motionToggle').disabled = motionPreference.matches;
  clearPreviews();
  animateCompanion(stage, stateId, options());
}

for (const [key] of Object.entries(ANIMALS)) {
  $(`#${key}Avatar`).innerHTML = companionSvg(key, 'happy');
  $(`#${key}Avatar`).setAttribute('aria-hidden', 'true');
}
document.querySelectorAll('.animal-tabs [data-animal]').forEach(button => button.addEventListener('click', () => {
  stopTour();
  animalId = button.dataset.animal;
  renderGallery();
  showState(stateId);
}));
$('#replay').addEventListener('click', () => animateCompanion(stage, stateId, options()));
stage.addEventListener('click', () => animateCompanion(stage, stateId, options()));
$('#speed').addEventListener('change', () => { clearPreviews(); animateCompanion(stage, stateId, options()); });
$('#motionToggle').addEventListener('click', () => { paused = !paused; stopTour(); updatePause(); });
$('#tour').addEventListener('click', () => {
  if (isTouring) { stopTour(); return; }
  isTouring = true;
  $('#tour').setAttribute('aria-pressed', 'true');
  $('#tour').innerHTML = '<span aria-hidden="true">Ⅱ</span> Arrêter la visite';
  showState(STATES[0].id);
  tourTimer = setTimeout(tourStep, 3200);
});
const results = {
  success: { state: 'celebrating', message: '18 sur 20 ! Tes efforts portent leurs fruits. Bravo !' },
  progress: { state: 'proud', message: 'De 10 à 13 ! Tu avances, et ça mérite d’être fêté.' },
  support: { state: 'encouraging', message: '8 sur 20 ? On respire. Je suis là, on va trouver comment progresser.' },
};
document.querySelectorAll('[data-result]').forEach(button => button.addEventListener('click', () => {
  stopTour();
  const result = results[button.dataset.result];
  showState(result.state, result.message);
  button.setAttribute('aria-pressed', 'true');
}));
motionPreference.addEventListener('change', () => { paused = motionPreference.matches; stopTour(); updatePause(); });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { beforeHiddenPaused = paused; paused = true; stopTour(); clearPreviews(); stopCompanion(stage); }
  else { paused = beforeHiddenPaused; updatePause(); }
});
window.addEventListener('pagehide', () => { stopTour(); clearPreviews(); stopCompanion(stage); });
renderGallery();
showState(stateId);
updatePause();
