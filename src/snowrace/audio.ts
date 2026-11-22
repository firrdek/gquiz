// Synthesised audio (Web Audio API): a driving music loop and a low snowmobile engine hum.
// No audio files are needed. Audio must be started from a user gesture.

const MUTE_KEY = 'snowrace-muted';
const BPM = 150;
const STEP = 60 / BPM / 2; // eighth note
const MUSIC_VOL = 0.09;
const ENGINE_VOL = 0.035;

// A minor, 16 steps (two bars): bass root notes and arpeggio degrees, in semitones from A
const BASS = [0, 0, 12, 0, 0, 0, 12, 0, -2, -2, 10, -2, -4, -4, 8, -4];
const ARP = [0, 3, 7, 12, 7, 3, 0, 3, 0, 3, 7, 12, 7, 3, 7, 10];
const A2 = 110;

const hz = (semi: number, base = A2) => base * Math.pow(2, semi / 12);

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let musicGain: GainNode | null = null;
let engGain: GainNode | null = null;
let engOsc: OscillatorNode | null = null;
let engOsc2: OscillatorNode | null = null;
let engFilter: BiquadFilterNode | null = null;
let noiseBuf: AudioBuffer | null = null;
let timer: number | null = null;
let nextTime = 0;
let step = 0;
let muted = typeof localStorage !== 'undefined' && localStorage.getItem(MUTE_KEY) === '1';

export const isMuted = () => muted;

export function setMuted(m: boolean) {
  muted = m;
  localStorage.setItem(MUTE_KEY, m ? '1' : '0');
  if (master && ctx) master.gain.setTargetAtTime(m ? 0 : 1, ctx.currentTime, 0.05);
}

function tone(type: OscillatorType, f: number, t: number, dur: number, vol: number, dest: AudioNode) {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = f;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(dest);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise(t: number, dur: number, vol: number, hp: number, dest: AudioNode) {
  if (!ctx || !noiseBuf) return;
  const s = ctx.createBufferSource();
  const f = ctx.createBiquadFilter();
  const g = ctx.createGain();
  s.buffer = noiseBuf;
  f.type = 'highpass';
  f.frequency.value = hp;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  s.connect(f).connect(g).connect(dest);
  s.start(t);
  s.stop(t + dur + 0.02);
}

function scheduleStep(i: number, t: number) {
  if (!musicGain) return;
  const k = i % 16;
  tone('sawtooth', hz(BASS[k], A2), t, STEP * 0.9, 0.5, musicGain);
  tone('square', hz(ARP[k], A2 * 4), t, STEP * 0.6, 0.18, musicGain);
  if (k % 4 === 0) tone('sine', 55, t, 0.14, 0.9, musicGain); // kick
  if (k % 8 === 4) noise(t, 0.12, 0.5, 1800, musicGain); // snare
  if (k % 2 === 1) noise(t, 0.04, 0.18, 7000, musicGain); // hat
}

function pump() {
  if (!ctx) return;
  while (nextTime < ctx.currentTime + 0.25) {
    scheduleStep(step, nextTime);
    nextTime += STEP;
    step += 1;
  }
}

function init() {
  if (ctx) return;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = muted ? 0 : 1;
  master.connect(ctx.destination);
  musicGain = ctx.createGain();
  musicGain.gain.value = MUSIC_VOL;
  musicGain.connect(master);

  noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

  // engine: two slightly detuned saws through a low-pass filter
  engGain = ctx.createGain();
  engGain.gain.value = 0;
  engFilter = ctx.createBiquadFilter();
  engFilter.type = 'lowpass';
  engFilter.frequency.value = 260;
  engOsc = ctx.createOscillator();
  engOsc2 = ctx.createOscillator();
  engOsc.type = 'sawtooth';
  engOsc2.type = 'sawtooth';
  engOsc.frequency.value = 40;
  engOsc2.frequency.value = 40.7;
  engOsc.connect(engFilter);
  engOsc2.connect(engFilter);
  engFilter.connect(engGain).connect(master);
  engOsc.start();
  engOsc2.start();
}

// Call from a click/tap handler
export function startAudio() {
  init();
  if (!ctx) return;
  void ctx.resume();
  if (timer === null) {
    nextTime = ctx.currentTime + 0.08;
    step = 0;
    timer = window.setInterval(pump, 60);
  }
  engGain?.gain.setTargetAtTime(ENGINE_VOL, ctx.currentTime, 0.2);
}

// speed in world units/s (about 560..764); throttle 0..1 scales the hum while finishing
export function setEngine(speed: number, level = 1) {
  if (!ctx || !engOsc || !engOsc2 || !engFilter || !engGain) return;
  const f = 32 + speed * 0.045;
  const t = ctx.currentTime;
  engOsc.frequency.setTargetAtTime(f, t, 0.1);
  engOsc2.frequency.setTargetAtTime(f * 1.017, t, 0.1);
  engFilter.frequency.setTargetAtTime(200 + speed * 0.3, t, 0.1);
  engGain.gain.setTargetAtTime(ENGINE_VOL * level, t, 0.15);
}

export function setMusicLevel(v: number) {
  if (ctx && musicGain) musicGain.gain.setTargetAtTime(MUSIC_VOL * v, ctx.currentTime, 0.2);
}

export function stopAudio() {
  if (timer !== null) {
    window.clearInterval(timer);
    timer = null;
  }
  if (ctx) {
    engGain?.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
    void ctx.suspend();
  }
}
