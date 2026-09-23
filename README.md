# copperplate

Copperplate turns any image into an engraved metal plate that catches a moving light, using nothing but SVG filters. The image's own brightness becomes the depth of the cut, and one shared lamp lights every plate on the page, following the pointer or, with no pointer, sitting where the sun is at the visitor's local hour.

No canvas, no WebGL, no runtime dependencies. About 6 kB gzipped.

## Install

```sh
npm install copperplate
```

## Usage

### Vanilla

```html
<div id="portrait" style="width: 320px; aspect-ratio: 4 / 5"></div>
```

```js
import { engrave } from 'copperplate';

const plate = engrave('#portrait', {
  src: '/knight.jpg',
  alt: 'Albrecht Dürer, Knight, Death and the Devil',
  material: 'copper',
});

plate.update({ relief: 4, material: 'silver' });
plate.destroy();
```

`engrave(target, options)` takes an element or a selector and fills it with the plate. Give the target a size: a width and a height, or a width and an `aspect-ratio`. If its height is left to the content, the plate takes the image's own shape once the image has loaded.

### React

```jsx
import { Engraving, useLamp } from 'copperplate/react';

<Engraving
  src="/knight.jpg"
  alt="Albrecht Dürer, Knight, Death and the Devil"
  material="brass"
  style={{ width: 320, aspectRatio: '4 / 5' }}
/>;
```

`<Engraving>` accepts every option below as a prop, plus the usual `div` props (`className`, `style`, `id` and so on). On the server it renders an empty `div` and the plate appears on mount. React 18 or later is an optional peer dependency; the core never imports it.

`useLamp()` returns the current light as `{ x, y, color, source, still }`, or `null` on the server. It re-renders on every frame the light moves, so use it for things that should agree with the plates, such as a cast shadow.

## Options

| Option | Type | Default | What it does |
| --- | --- | --- | --- |
| `src` | `string` | required | Image URL. Cross-origin images work, since pixels are never read in script. |
| `alt` | `string` | required | Accessible description. An empty string marks the plate as decorative. |
| `material` | preset or `{ shadow, highlight, sheen }` | `'copper'` | `copper`, `brass`, `silver`, `steel`, `gold` or `bronze`, or your own colours as `#rgb`, `#rrggbb` or `rgb()`. |
| `relief` | `number` 0 to 20 | `3.2` | Depth of the relief. |
| `shine` | `number` 0 to 4 | `1` | Strength of the moving glint, as a multiple of the default. |
| `sharpness` | `number` 1 to 128 | `26` | Specular exponent. Higher gives a tighter, harder glint. |
| `fit` | `'cover'` or `'contain'` | `'cover'` | How the image fills the plate. |
| `position` | `string` or `{ x, y }` | `'center'` | Focal point, like CSS `object-position`: `'left top'`, `'30% 60%'`, `'xMinYMid'`, or fractions from 0 to 1. |
| `plateMark` | `boolean` | `true` | The pressed frame an intaglio plate leaves in the paper. |
| `lightHeight` | `number` | `0.55` | Height of the light above the plate, as a multiple of the plate's width. Lower is a more raking light. |
| `static` | `boolean` | `false` | Never follow the light. The plate is lit once from where the sun is, relative to itself. |
| `resolution` | `number` | `800` | Longest side of the filter surface in device pixels. See performance. |

Out-of-range numbers are clamped and non-numbers fall back to the default, so values straight from a range input are fine.

### The lamp

```js
import { getLamp, subscribeLamp, setLamp, requestMotionLight, stopMotionLight } from 'copperplate';
```

- `subscribeLamp(fn)` calls `fn(state)` whenever the light moves and returns an unsubscribe function. `getLamp()` returns the latest state or `null`.
- `setLamp({ x, y })` holds the light at a viewport position, overriding everything else. `setLamp(null)` lets go.
- `requestMotionLight()` lets a phone's tilt move the light. It is opt-in and must be called from a user gesture such as a tap, because iOS only asks for motion permission in response to one. It resolves to `'granted'`, `'denied'` or `'unsupported'`. `stopMotionLight()` turns it off. The mapping is tuned for a phone held upright in portrait.

The light's source is, in order of priority: `setLamp`, device tilt (if enabled), the pointer, then the sun. A change of source glides over about two thirds of a second rather than jumping. A touch moves the light while the finger is down and returns it to the sun when it lifts.

The sun sits low in the east (left) at six in the morning, high in the middle at noon and low in the west (right) at six in the evening, and rests at the horizon overnight. Its colour is a warm white through the day, noticeably warmer around dusk, a little warmer at dawn and faintly cool in the small hours. The colour applies whatever is driving the light.

### Theming the plate mark

The mark follows the page's `color-scheme` where `light-dark()` is supported, and is light otherwise. Set these custom properties on the plate, or anywhere above it, to match your page:

| Property | Default |
| --- | --- |
| `--copperplate-mark-padding` | `10px` |
| `--copperplate-mark-bg` | `#ebe6dc` light, `#131211` dark |
| `--copperplate-mark-line` | `#cbc2b0` light, `#332f2a` dark |
| `--copperplate-mark-bevel` | a pair of inset shadows that press the mark into the paper |

The plate's styles sit inside `:where(.copperplate)`, so any rule of yours wins without `!important`. They are installed as a constructable stylesheet where possible, which a strict `style-src` Content Security Policy does not block.

## How it works

Each plate is an inline SVG holding one `<image>` and one filter:

1. `feColorMatrix` maps the image's luminance onto the metal: black lands on the material's shadow colour, white on its highlight, every grey on the line between.
2. A second `feColorMatrix` with `luminanceToAlpha` turns brightness into a height map, and a slight `feGaussianBlur` softens it so the cut lines read as grooves rather than steps.
3. `feDiffuseLighting` with a fixed `feDistantLight` raking from the upper left shades the relief.
4. `feSpecularLighting` with an `fePointLight` gives the glint. This is the only part that moves.
5. Two `feComposite` steps multiply the toned image by the shading and add the glint on top.

When the light moves, only the point light's `x` and `y` attributes change. The filter is built once and never rebuilt.

## Accessibility

- With a non-empty `alt`, the plate is a `role="img"` element labelled by it. The SVG inside is `aria-hidden`.
- With `alt: ''`, the whole plate is `aria-hidden`.
- Under `prefers-reduced-motion: reduce` the light stops following anything: each plate is lit from the sun's position relative to itself, so nothing changes as the page scrolls, and device tilt is ignored. The lamp reports `still: true`.
- The glint is decoration. Nothing important should depend on seeing it.

## Performance

- One set of listeners for the whole page, however many plates there are. Pointer, scroll and resize events only schedule an animation frame, and each frame does all its layout reads before any writes.
- Plates are culled with an IntersectionObserver: only plates on or near the screen are relit.
- Plate positions are cached in page coordinates, so ordinary page scrolling needs no measuring. They are re-measured after a resize, after a nested scroll, when the plate itself resizes, and every half second while the light is moving, as cheap insurance against layout shifts.
- Attributes are only written when their value changes.
- SVG lighting is rasterised on the GPU in Chrome and costs roughly in proportion to device pixels. A plate whose longest side would exceed `resolution` device pixels is drawn smaller and scaled up on its own compositor layer. In a trace of 16 large plates on a 2560 by 1600 viewport at 2x, this halved GPU time compared with no cap. Raise `resolution` for a large hero on a dense screen if you want a finer grain; the demo's hero uses 1600.

Measured with `npm run perf` (puppeteer driving the real mouse in a circle over a grid of plates, sampling frame times with requestAnimationFrame) in headless Chrome 153 on an Apple M5 Max laptop, 1440 by 900 at 2x, with every plate on screen at once:

| Plates on screen | Mean fps | Frames over 20 ms |
| --- | --- | --- |
| 24 | 60 | 0% |
| 40 | 60 | 0% |
| 48 | 58 to 60 | 1 to 4% |
| 64 | 44 | 35% |
| 96 | 31 | 90% |

So about 40 plates hold 60 fps when all are visible together. Plates off screen cost nothing while the light moves. Slower machines will manage fewer; treat these as a ceiling, not a promise.

## Browser support

- **Chrome and Edge**: tested (Chrome 153, desktop and a phone-sized viewport). This is the reference look.
- **Safari**: not tested. WebKit supports every filter primitive used, so the plate should render, but I have not checked how closely it matches Chrome. SVG lighting filters are generally slower outside Chrome, so expect fewer plates at full frame rate, and differences in how filters are resolved on high-density screens can make the relief and glint look a little softer or stronger.
- **Firefox**: not tested. The same applies: every primitive is supported, but the look and the frame rate have not been checked.

Please treat the Chrome numbers and screenshots as the reference, and try the demo in the browsers you care about before relying on the look.

A browser without SVG filter support shows nothing in the plate, so give the target a background if that matters to you.

## Development

```sh
npm install
npm test          # vitest: materials, sun position, option parsing, server imports
npm run build     # tsc to dist/
npm run dev       # demo at http://localhost:5178
npm run perf      # frame-time measurement, needs the dev server and Chrome
npm run shots     # demo screenshots into demo/shots/
```

## Credits

The demo artworks are in the public domain:

- Albrecht Dürer, *Knight, Death and the Devil*, engraving, 1513.
- Michelangelo, *The Creation of Adam*, detail, fresco, c. 1512, Sistine Chapel (via Wikimedia Commons).
- Hubert Robert, *A Colonnade in Ruins*, The Metropolitan Museum of Art.

The demo sets its text in Fraunces, Newsreader and JetBrains Mono, all under the SIL Open Font License.

## Licence

MIT, Anzal Abidi.
