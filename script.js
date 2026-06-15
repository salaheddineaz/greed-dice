'use strict';

// --- Audio ---
let audioCtx;

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playSound(type) {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;

    if (type === 'roll') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.setValueAtTime(600, now + 0.05);
      osc.frequency.setValueAtTime(500, now + 0.1);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'hold') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(800, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'win') {
      osc.type = 'sine';
      [523, 659, 784, 1047].forEach((freq, i) => {
        osc.frequency.setValueAtTime(freq, now + i * 0.12);
      });
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'switch') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(150, now + 0.15);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    }
  } catch (e) {}
}

// --- DOM refs ---
const player0EL = document.querySelector('.player--0');
const player1EL = document.querySelector('.player--1');
const score0El = document.getElementById('score--0');
const score1El = document.getElementById('score--1');
const current0El = document.getElementById('current--0');
const current1El = document.getElementById('current--1');
const name0El = document.getElementById('name--0');
const name1El = document.getElementById('name--1');
const diceEl = document.querySelector('.dice');
const btnNew = document.querySelector('.btn--new');
const btnRoll = document.querySelector('.btn--roll');
const btnHold = document.querySelector('.btn--hold');
const themeBtn = document.querySelector('.theme-btn');
const helpBtn = document.querySelector('.help-btn');
const modal = document.querySelector('.modal');
const modalClose = document.querySelector('.modal-close');
const targetBtns = document.querySelectorAll('.target-btn');
const body = document.body;

// --- Game State ---
let scores, currentScore, activePlayer, playing, targetScore;

// --- Init ---
function init(resetTarget) {
  scores = [0, 0];
  currentScore = 0;
  activePlayer = 0;
  playing = true;
  if (resetTarget) targetScore = resetTarget;

  score0El.textContent = 0;
  score1El.textContent = 0;
  current0El.textContent = 0;
  current1El.textContent = 0;
  diceEl.classList.add('hidden');

  player0EL.classList.remove('player--winner', 'winner-celebrate');
  player1EL.classList.remove('player--winner', 'winner-celebrate');
  player0EL.classList.add('player--active');
  player1EL.classList.remove('player--active');

  name0El.textContent = 'Player 1';
  name1El.textContent = 'Player 2';
  name0El.style.color = '';
  name1El.style.color = '';

  btnHold.classList.remove('hidden');
  btnRoll.classList.remove('hidden');
  btnNew.classList.remove('btn--new-winner');
}

// --- Switch Player ---
function switchPlayer() {
  document.getElementById(`current--${activePlayer}`).textContent = 0;
  currentScore = 0;
  activePlayer = activePlayer === 0 ? 1 : 0;
  player0EL.classList.toggle('player--active');
  player1EL.classList.toggle('player--active');
  playSound('switch');
}

// --- Roll Dice ---
function rollDice() {
  if (!playing) return;

  const dice = Math.trunc(Math.random() * 6) + 1;
  diceEl.classList.remove('hidden');
  diceEl.src = `dice-${dice}.png`;

  diceEl.classList.remove('dice-roll');
  void diceEl.offsetWidth;
  diceEl.classList.add('dice-roll');

  playSound('roll');

  if (dice !== 1) {
    currentScore += dice;
    const curEl = document.getElementById(`current--${activePlayer}`);
    curEl.textContent = currentScore;
    curEl.classList.remove('score-pop');
    void curEl.offsetWidth;
    curEl.classList.add('score-pop');
  } else {
    switchPlayer();
  }
}

// --- Hold ---
function hold() {
  if (!playing) return;

  scores[activePlayer] += currentScore;
  const scEl = document.getElementById(`score--${activePlayer}`);
  scEl.textContent = scores[activePlayer];

  scEl.classList.remove('score-pop');
  void scEl.offsetWidth;
  scEl.classList.add('score-pop');

  playSound('hold');

  if (scores[activePlayer] >= (targetScore || 100)) {
    playing = false;
    diceEl.classList.add('hidden');
    btnHold.classList.add('hidden');
    btnRoll.classList.add('hidden');
    btnNew.classList.add('btn--new-winner');

    const winnerEl = document.querySelector(`.player--${activePlayer}`);
    winnerEl.classList.add('player--winner');
    winnerEl.classList.remove('player--active');
    winnerEl.classList.add('winner-celebrate');
    document.getElementById(`name--${activePlayer}`).textContent = 'WINNER';
    document.getElementById(`name--${activePlayer}`).style.color = '#c7365f';
    playSound('win');
  } else {
    switchPlayer();
  }
}

// --- Theme ---
let isLight = false;

function toggleTheme() {
  isLight = !isLight;
  body.classList.toggle('light', isLight);
  themeBtn.textContent = isLight ? 'Dark' : 'Light';
  playSound('click');
}

// --- Help Modal ---
function openModal() {
  modal.classList.remove('hidden');
  playSound('click');
}

function closeModal() {
  modal.classList.add('hidden');
}

// --- Target Score ---
function setTarget(e) {
  const btn = e.target.closest('.target-btn');
  if (!btn) return;

  targetBtns.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  targetScore = Number(btn.dataset.target);
  playSound('click');
  init(targetScore);
}

// --- Player Name Edit ---
name0El.addEventListener('click', () => {
  if (name0El.textContent === 'WINNER') return;
  const newName = prompt('Enter player 1 name:', name0El.textContent);
  if (newName && newName.trim()) name0El.textContent = newName.trim();
});
name1El.addEventListener('click', () => {
  if (name1El.textContent === 'WINNER') return;
  const newName = prompt('Enter player 2 name:', name1El.textContent);
  if (newName && newName.trim()) name1El.textContent = newName.trim();
});

// --- Event Listeners ---
btnRoll.addEventListener('click', rollDice);
btnHold.addEventListener('click', hold);
btnNew.addEventListener('click', () => { playSound('click'); init(targetScore); });
themeBtn.addEventListener('click', toggleTheme);
helpBtn.addEventListener('click', openModal);
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
targetBtns.forEach(btn => btn.addEventListener('click', setTarget));

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (!modal.classList.contains('hidden')) {
    if (e.key === 'Escape') closeModal();
    return;
  }
  if (e.key === ' ' || e.key === 'd') {
    e.preventDefault();
    rollDice();
  } else if (e.key === 'Enter' || e.key === 'h') {
    e.preventDefault();
    hold();
  } else if (e.key === 'r' || e.key === 'R') {
    playSound('click');
    init(targetScore);
  }
});

// --- Start ---
init(100);
