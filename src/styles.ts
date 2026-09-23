/**
 * The few rules a plate needs, installed once on first use. They sit inside
 * :where() so any stylesheet of yours overrides them without a fight, and the
 * plate mark is themable through custom properties:
 *
 *   --copperplate-mark-padding  width of the pressed margin (10px)
 *   --copperplate-mark-bg       paper colour inside the mark
 *   --copperplate-mark-line     the fine line at the mark's edge
 *   --copperplate-mark-bevel    the inner shadows that press it into the paper
 *
 * Without your own values the mark follows the page's color-scheme where
 * light-dark() is supported, and is light otherwise.
 *
 * Constructable stylesheets are used where available because they are not
 * blocked by a strict style-src Content Security Policy.
 */
const LIGHT_BEVEL = 'inset 2px 2px 3px rgb(0 0 0 / .10), inset -2px -2px 3px rgb(255 255 255 / .35), 0 1px 0 rgb(255 255 255 / .4)';
// The same bevel with scheme-aware colours: pale paper wants a soft shadow and
// a bright lip, dark paper a deep shadow and almost no lip.
const SCHEME_BEVEL =
  'inset 2px 2px 3px light-dark(rgb(0 0 0 / .10), rgb(0 0 0 / .5)), inset -2px -2px 3px light-dark(rgb(255 255 255 / .35), rgb(255 255 255 / .05)), 0 1px 0 light-dark(rgb(255 255 255 / .4), transparent)';

const CSS = `
:where(.copperplate){display:block;position:relative;box-sizing:border-box;width:100%;height:100%;overflow:hidden}
:where(.copperplate)>svg{display:block;width:100%;height:100%;overflow:hidden}
:where(.copperplate[data-plate-mark]){padding:var(--copperplate-mark-padding,10px);background:var(--copperplate-mark-bg,#ebe6dc);box-shadow:inset 0 0 0 1px var(--copperplate-mark-line,#cbc2b0),var(--copperplate-mark-bevel,${LIGHT_BEVEL})}
@supports (color:light-dark(#000,#fff)){
:where(.copperplate[data-plate-mark]){background:var(--copperplate-mark-bg,light-dark(#ebe6dc,#131211));box-shadow:inset 0 0 0 1px var(--copperplate-mark-line,light-dark(#cbc2b0,#332f2a)),var(--copperplate-mark-bevel,${SCHEME_BEVEL})}
}
`;

const installed = new WeakSet<Document>();

export function installStyles(doc: Document) {
  if (installed.has(doc)) return;
  installed.add(doc);
  try {
    if ('adoptedStyleSheets' in doc && typeof CSSStyleSheet !== 'undefined' && 'replaceSync' in CSSStyleSheet.prototype) {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(CSS);
      // Put ours first so page styles of equal weight still win.
      doc.adoptedStyleSheets = [sheet, ...doc.adoptedStyleSheets];
      return;
    }
  } catch {
    /* fall through to a style element */
  }
  const el = doc.createElement('style');
  el.setAttribute('data-copperplate', '');
  el.textContent = CSS;
  doc.head.prepend(el);
}
