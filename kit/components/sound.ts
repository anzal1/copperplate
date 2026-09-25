/**
 * Sound, off unless you turn it on.
 *
 * Every sound is synthesised on the spot (a few sine partials, or a burst of
 * shaped noise), so there is nothing to download. Each belongs to one
 * gesture: a struck button thuds like a stamp, a switch bolt clicks home, a
 * checkbox tile is struck in, a coin rings. Nothing plays on hover or
 * scroll, and nothing loops.
 *
 * Browsers only allow audio after a real gesture, so before the first click
 * or key press calls are dropped rather than queued.
 */

export type SoundName = 'press' | 'bolt' | 'strike' | 'coin' | 'seal' | 'chime' | 'tick';

let enabled = false;
let unlocked = false;
let ctx: AudioContext | null = null;
let out: GainNode | null = null;
const last: Partial<Record<SoundName, number>> = {};

function unlock() {
  unlocked = true;
}

/** Turn the kit's sounds on or off for the whole page. */
export function setSounds(on: boolean) {
  enabled = on;
  if (typeof window === 'undefined') return;
  if (on) {
    window.addEventListener('pointerdown', unlock, { capture: true, once: true });
    window.addEventListener('keydown', unlock, { capture: true, once: true });
  }
}
export const soundsOn = () => enabled;

function audio() {
  if (!ctx) {
    ctx = new AudioContext();
    out = ctx.createGain();
    out.gain.value = 0.7;
    out.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return { a: ctx, o: out! };
}

function partial(a: AudioContext, o: AudioNode, freq: number, gain: number, decay: number, at = 0) {
  const t = a.currentTime + at;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.frequency.value = freq * (1 + (Math.random() - 0.5) * 0.004);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  osc.connect(g).connect(o);
  osc.start(t);
  osc.stop(t + decay + 0.05);
}

function burst(a: AudioContext, o: AudioNode, seconds: number, type: BiquadFilterType, freq: number, gain: number, q = 1) {
  const t = a.currentTime;
  const buffer = a.createBuffer(1, Math.ceil(a.sampleRate * seconds), a.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource();
  src.buffer = buffer;
  const f = a.createBiquadFilter();
  const g = a.createGain();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
  src.connect(f).connect(g).connect(o);
  src.start(t);
}

function thud(a: AudioContext, o: AudioNode, from: number, to: number, gain: number, len: number) {
  const t = a.currentTime;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.exponentialRampToValueAtTime(to, t + len);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + len + 0.01);
  osc.connect(g).connect(o);
  osc.start(t);
  osc.stop(t + len + 0.03);
}

const SOUNDS: Record<SoundName, { gap: number; play: (a: AudioContext, o: GainNode) => void }> = {
  // A stamp pressed onto paper: the soft thud and the paper's click.
  press: { gap: 80, play: (a, o) => { burst(a, o, 0.03, 'lowpass', 1500, 0.07); thud(a, o, 160, 70, 0.08, 0.09); } },
  // A slide bolt shot home: a dry click with a little metal in it.
  bolt: { gap: 80, play: (a, o) => { burst(a, o, 0.02, 'bandpass', 2600, 0.09, 4); partial(a, o, 3300, 0.012, 0.06); } },
  // A tile struck into its socket: a tight tap and a short ring.
  strike: { gap: 60, play: (a, o) => { burst(a, o, 0.018, 'highpass', 2200, 0.06); partial(a, o, 2200, 0.018, 0.12); } },
  // Small copper: bright, inharmonic partials that die quickly.
  coin: { gap: 120, play: (a, o) => { partial(a, o, 2637, 0.04, 0.24); partial(a, o, 3951, 0.022, 0.18); partial(a, o, 6120, 0.009, 0.1); } },
  // A medal: lower and longer, the ring of a heavier disc.
  seal: { gap: 300, play: (a, o) => { partial(a, o, 587, 0.035, 0.8); partial(a, o, 1244, 0.02, 0.55); partial(a, o, 1987, 0.01, 0.38); } },
  // A notice arriving: a quiet bell, a fifth apart.
  chime: { gap: 600, play: (a, o) => { partial(a, o, 1318.5, 0.028, 1.1); partial(a, o, 1975.5, 0.016, 0.9, 0.05); } },
  // A detent: the smallest click, for tabs and slider steps.
  tick: { gap: 45, play: (a, o) => { burst(a, o, 0.012, 'bandpass', 3800, 0.05, 5); } },
};

export function playSound(name: SoundName) {
  if (!enabled || !unlocked || typeof window === 'undefined') return;
  const now = performance.now();
  if (now - (last[name] ?? 0) < SOUNDS[name].gap) return;
  last[name] = now;
  try {
    const { a, o } = audio();
    SOUNDS[name].play(a, o);
  } catch {
    /* no audio on this device */
  }
}
