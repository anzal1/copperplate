import { useState, type ReactElement } from 'react';
import {
  Accordion, AccordionItem, Alert, Avatar, Badge, Button, Card, CardBody, CardEyebrow, CardFooter, CardTitle, Checkbox, Coin, Dialog,
  EngravedText, Field, Hallmark, Hint, Input, Kbd, Label, Menu, MenuItem, MenuLabel, MenuRule, Plate, Progress, Radio, RadioGroup, Seal,
  Select, Separator, Skeleton, Slider, Switch, Tab, TabPanel, Tabs, TabsList, Table, TBody, TD, TH, THead, TR, Textarea, Tooltip, toast,
} from '../../kit/components';

/**
 * Every component, once: what it is called, how it is described, a live
 * demo, its usage, its props, and how it behaves. The home page's set pieces
 * and every docs page are drawn from this.
 */

export type Prop = [name: string, type: string, fallback: string, what: string];
export type Entry = {
  slug: string;
  name: string;
  group: string;
  /** The registry item that installs it. */
  item: string;
  /** A headline, as a sentence. */
  title: string;
  line: string;
  body: string[];
  Demo: () => ReactElement;
  usage: string;
  props: Prop[];
  notes: string[];
};

const Arrow = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Star = () => <path d="M50 6l12.9 28.6 31.1 3.3-23.3 20.9 6.6 30.7L50 73.8 22.7 89.5l6.6-30.7L6 37.9l31.1-3.3z" />;
const Bolt = () => <path d="M58 4 18 56h26l-6 40 42-54H54z" />;

const METAL: Prop = ['metal', "'copper' | 'brass' | 'silver' | 'steel' | 'verdigris' | 'oxide'", "'copper'", 'The metal it is struck in.'];

function SwitchDemo() {
  const [on, setOn] = useState(true);
  return (
    <div style={{ display: 'grid', justifyItems: 'center', gap: 22 }}>
      <Switch checked={on} onCheckedChange={setOn} aria-label="Follow the lamp" style={{ ['--cp-sw' as string]: '6.5rem', ['--cp-sh' as string]: '3.4rem' }} />
      <p className="mono dim" style={{ margin: 0 }}>{on ? 'following the lamp' : 'held still'}</p>
    </div>
  );
}
function SliderDemo() {
  const [v, setV] = useState(58);
  return (
    <div style={{ width: 'min(100%, 26rem)' }}>
      <div className="readout"><b>{v}</b><span className="mono dim">relief</span></div>
      <Slider value={v} onValueChange={setV} aria-label="Relief" />
    </div>
  );
}
function DialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="engraved" size="lg" onClick={() => setOpen(true)}>Cancel the plate</Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Cancel the plate?"
        description="A cancelled plate is scored through so no more impressions can be pulled. The edition stays at fifty."
        footer={<><Button variant="engraved" onClick={() => setOpen(false)}>Keep it</Button><Button onClick={() => setOpen(false)}>Cancel plate</Button></>}
      />
    </>
  );
}
function ToastDemo() {
  const lines: [string, string][] = [['Proof struck', 'One trial impression, drying.'], ['Plate inked', 'Wiped and ready for the press.'], ['Edition pulled', 'Fifty impressions, numbered.']];
  const [n, setN] = useState(0);
  return (
    <div style={{ display: 'grid', justifyItems: 'center', gap: 16 }}>
      <Button size="lg" onClick={() => { const [t, b] = lines[n % lines.length]; toast(t, { body: b }); setN(n + 1); }}>Pull an impression</Button>
      <p className="mono dim" style={{ margin: 0 }}>press it a few times, then hover the deck</p>
    </div>
  );
}

export const ENTRIES: Entry[] = [
  {
    slug: 'button', name: 'Button', group: 'Actions', item: 'button',
    title: 'Struck for the one thing that matters.',
    line: 'Struck in copper for the loud action, engraved into the paper for the quiet ones.',
    body: [
      'The loud action is a plate of brushed copper, lettered in and bevelled at the edge. Everything else is engraved into the paper around its label.',
      'Press it and it goes down, then springs back, and a little light comes off it where you struck.',
    ],
    Demo: () => (
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button size="lg">Strike a proof</Button>
        <Button size="lg" variant="engraved">Keep the plate</Button>
      </div>
    ),
    usage: `import { Button } from '@/components/copperplate/button';\n\n<Button>Strike a proof</Button>\n<Button variant="engraved">Keep the plate</Button>\n<Button size="icon" aria-label="Next"><ArrowIcon /></Button>`,
    props: [
      ['variant', "'struck' | 'engraved' | 'plain'", "'struck'", 'Struck is the one loud action in a group. Engraved and plain are quiet.'],
      ['size', "'sm' | 'md' | 'lg' | 'icon'", "'md'", 'Icon makes it square, for a single glyph.'],
      METAL,
      ['...props', 'ButtonHTMLAttributes', '', 'Everything a native button takes.'],
    ],
    notes: ['A native button, so Enter and Space press it and it can be disabled.', 'The strike flash starts where the pointer landed, or from the centre on a key press.', 'Only one struck button per group reads well. Make the rest engraved.'],
  },
  {
    slug: 'badge', name: 'Badge', group: 'Actions', item: 'badge',
    title: 'A small struck tag.',
    line: 'A struck tag, whose metal carries the meaning.',
    body: ['Copper to note something, verdigris when it is done, brass to warn, oxide when it failed. The patina says it before the word does.'],
    Demo: () => (
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Badge>Proof</Badge><Badge metal="verdigris" dot>Shipped</Badge><Badge variant="engraved">Draft</Badge>
      </div>
    ),
    usage: `<Badge>Proof</Badge>\n<Badge metal="verdigris" dot>Shipped</Badge>\n<Badge variant="engraved">Draft</Badge>`,
    props: [['variant', "'struck' | 'engraved'", "'struck'", 'Struck in metal, or cut into the paper.'], METAL, ['dot', 'boolean', 'false', 'A stamped dot before the label, for status.']],
    notes: ['Decorative by default. If the state matters, say it in the label, not only the metal.'],
  },
  {
    slug: 'kbd', name: 'Kbd', group: 'Actions', item: 'kbd',
    title: 'A key, struck in silver.',
    line: 'Keyboard keys for shortcuts, struck like keycaps.',
    body: ['For telling someone which keys to press. Lettered in a sans, like real keycaps.'],
    Demo: () => <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}><Kbd>⌘</Kbd><Kbd>K</Kbd></span>,
    usage: `<Kbd>⌘</Kbd><Kbd>K</Kbd>`,
    props: [['metal', 'Metal', "'silver'", 'The metal of the key.']],
    notes: ['Renders a native kbd element.'],
  },
  {
    slug: 'input', name: 'Input', group: 'Fields', item: 'field',
    title: 'A field cut into the paper.',
    line: 'Text fields cut into the page, with their label and hint wired together.',
    body: ['The field is a channel cut into the paper. Focus burnishes its edge, and an invalid field says so in its rule and its hint.'],
    Demo: () => (
      <div style={{ width: 'min(100%, 22rem)' }}>
        <Field><Label>Name on the plate</Label><Input placeholder="Albrecht Dürer" /><Hint>As it should be engraved.</Hint></Field>
      </div>
    ),
    usage: `import { Field, Label, Input, Hint } from '@/components/copperplate/field';\n\n<Field>\n  <Label>Name on the plate</Label>\n  <Input placeholder="Albrecht Dürer" />\n  <Hint>As it should be engraved.</Hint>\n</Field>`,
    props: [['invalid', 'boolean', 'false', 'On Field. Marks the control invalid and colours the hint.'], ['...props', 'InputHTMLAttributes', '', 'On Input, everything a native input takes.']],
    notes: ['Field gives the label, control and hint matching ids, so the hint is read out with the field.'],
  },
  {
    slug: 'textarea', name: 'Textarea', group: 'Fields', item: 'field',
    title: 'Room to write, in the same cut.',
    line: 'A multi-line field, cut the same way as Input.',
    body: ['The same channel as Input, taller, and resizable up and down.'],
    Demo: () => <div style={{ width: 'min(100%, 22rem)' }}><Field><Label>Note on the back</Label><Textarea placeholder="First state, before the re-cut." /></Field></div>,
    usage: `<Field>\n  <Label>Note on the back</Label>\n  <Textarea />\n</Field>`,
    props: [['...props', 'TextareaHTMLAttributes', '', 'Everything a native textarea takes.']],
    notes: ['Works inside Field, exactly like Input.'],
  },
  {
    slug: 'select', name: 'Select', group: 'Fields', item: 'field',
    title: 'The native select, in the same cut.',
    line: 'A native select dressed as a cut field, so it behaves right everywhere.',
    body: ['On a phone it opens the phone’s own picker, and on a desktop the list is the system’s. Only the field is ours.'],
    Demo: () => <div style={{ width: 'min(100%, 16rem)' }}><Field><Label>Metal</Label><Select defaultValue="copper"><option>copper</option><option>brass</option><option>silver</option><option>steel</option></Select></Field></div>,
    usage: `<Select defaultValue="copper">\n  <option>copper</option>\n  <option>brass</option>\n</Select>`,
    props: [['...props', 'SelectHTMLAttributes', '', 'Everything a native select takes.']],
    notes: ['Native, so keyboard, screen readers and autofill behave as they always do.'],
  },
  {
    slug: 'checkbox', name: 'Checkbox', group: 'Choices', item: 'checkbox',
    title: 'A tile, struck into its socket.',
    line: 'A socket cut into the paper. Checked, a copper tile is struck in and the tick is drawn.',
    body: ['The tile lands with a small overshoot, like a die striking, and a ring of light comes off the socket. Then the tick is drawn in one stroke.'],
    Demo: () => <div style={{ display: 'grid', gap: 14 }}><Checkbox label="Strike a proof first" defaultChecked /><Checkbox label="Keep the plate mark" /><Checkbox label="Cancel after the edition" /></div>,
    usage: `<Checkbox label="Strike a proof first" />`,
    props: [['label', 'ReactNode', '', 'The label, clickable along with the box.'], METAL, ['...props', 'InputHTMLAttributes', '', 'checked, defaultChecked, onChange and the rest.']],
    notes: ['A real checkbox input, visually hidden, so it submits with forms and works with any label.'],
  },
  {
    slug: 'radio', name: 'Radio', group: 'Choices', item: 'radio',
    title: 'Round sockets, and one rivet.',
    line: 'Round sockets. The chosen one takes a domed copper rivet.',
    body: ['Each option is a round socket cut into the paper. Choosing one drives a rivet into it, domed so it catches the lamp.'],
    Demo: () => <RadioGroup defaultValue="line"><Radio value="line" label="Line engraving" /><Radio value="mezzo" label="Mezzotint" /><Radio value="etch" label="Etching" /></RadioGroup>,
    usage: `<RadioGroup defaultValue="line" onValueChange={setTechnique}>\n  <Radio value="line" label="Line engraving" />\n  <Radio value="etch" label="Etching" />\n</RadioGroup>`,
    props: [['value / defaultValue', 'string', '', 'On RadioGroup, the chosen value.'], ['onValueChange', '(value: string) => void', '', 'On RadioGroup, called with the new value.'], ['name', 'string', 'auto', 'On RadioGroup, the form name.'], ['value', 'string', '', 'On Radio, the value it stands for.']],
    notes: ['Native radio inputs, so the arrow keys move between options.'],
  },
  {
    slug: 'switch', name: 'Switch', group: 'Choices', item: 'switch',
    title: 'A slide bolt, shot home.',
    line: 'A copper bolt in a cut slot. It stretches as it travels and settles into place.',
    body: ['The slot is cut into the paper and the bolt is a copper slug with grip lines. It stretches as it travels, settles into place, and the inlay shows behind it once it is home.'],
    Demo: SwitchDemo,
    usage: `const [on, setOn] = useState(true);\n\n<Switch checked={on} onCheckedChange={setOn} aria-label="Follow the lamp" />`,
    props: [['checked / defaultChecked', 'boolean', 'false', 'Controlled or uncontrolled state.'], ['onCheckedChange', '(checked: boolean) => void', '', 'Called with the new state.'], METAL],
    notes: ['A button with role switch, so it announces itself as on or off.', 'Give it a label, either wrapping text or aria-label.'],
  },
  {
    slug: 'slider', name: 'Slider', group: 'Choices', item: 'slider',
    title: 'An engraved scale, and a disc riding the groove.',
    line: 'An engraved scale, copper poured to the value, and a knurled disc riding the groove.',
    body: ['Copper is poured along the channel to the value. The knurled disc lifts when you take hold of it, a tag with the value rides above it, and the scale lights up around it as it moves.', 'Underneath it is a real range input, so keys, screen readers and touch work as they always do.'],
    Demo: SliderDemo,
    usage: `<Slider value={relief} onValueChange={setRelief} min={0} max={100} aria-label="Relief" />`,
    props: [['value / defaultValue', 'number', '50', 'Controlled or uncontrolled value.'], ['min / max / step', 'number', '0 / 100 / 1', 'The range.'], ['onValueChange', '(value: number) => void', '', 'Called as it moves.'], ['format', '(value: number) => string', 'String', 'How the value reads on the tag while dragging.'], METAL],
    notes: ['The arrow keys, Page Up and Page Down, Home and End all work, since it is a native range.'],
  },
  {
    slug: 'tabs', name: 'Tabs', group: 'Choices', item: 'tabs',
    title: 'A tray, and a plate dragged under the chosen tab.',
    line: 'A tray with a struck plate that is dragged under the chosen tab.',
    body: ['The plate does not jump. Its leading edge runs ahead across both tabs, then the trailing edge catches up.'],
    Demo: () => (
      <Tabs defaultValue="plate">
        <TabsList><Tab value="plate">Plate</Tab><Tab value="proof">Proof</Tab><Tab value="edition">Edition</Tab></TabsList>
        <TabPanel value="plate"><p className="dim" style={{ margin: '16px 0 0', textAlign: 'center' }}>The copper, before any ink.</p></TabPanel>
        <TabPanel value="proof"><p className="dim" style={{ margin: '16px 0 0', textAlign: 'center' }}>A trial impression, to check the cut.</p></TabPanel>
        <TabPanel value="edition"><p className="dim" style={{ margin: '16px 0 0', textAlign: 'center' }}>Fifty, numbered, then the plate is cancelled.</p></TabPanel>
      </Tabs>
    ),
    usage: `<Tabs defaultValue="plate">\n  <TabsList>\n    <Tab value="plate">Plate</Tab>\n    <Tab value="proof">Proof</Tab>\n  </TabsList>\n  <TabPanel value="plate">…</TabPanel>\n  <TabPanel value="proof">…</TabPanel>\n</Tabs>`,
    props: [['value / defaultValue', 'string', '', 'On Tabs, the chosen tab.'], ['onValueChange', '(value: string) => void', '', 'On Tabs.'], ['metal', 'Metal', "'copper'", 'On TabsList, the plate’s metal.'], ['value', 'string', '', 'On Tab and TabPanel, which tab they belong to.']],
    notes: ['Arrow keys, Home and End move between tabs, and only the chosen tab is in the tab order.'],
  },
  {
    slug: 'card', name: 'Card', group: 'Surfaces', item: 'card',
    title: 'A plaque, a plate mark, or the whole card in metal.',
    line: 'A plaque with an engraved double rule, a pressed plate mark, or a struck card.',
    body: ['Most cards are paper, with a double rule cut round them or the bevel a press leaves. One card on a page can be struck in metal, and that one tilts toward you under the pointer.'],
    Demo: () => (
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Card variant="plate" style={{ width: 250 }}><CardEyebrow>Plate</CardEyebrow><CardTitle>The plate mark</CardTitle><CardBody>The bevel a press leaves round a printed plate.</CardBody></Card>
        <Card variant="struck" style={{ width: 250 }}><CardEyebrow>Struck</CardEyebrow><CardTitle>One loud card</CardTitle><CardBody>For the one thing on the page that should shine.</CardBody><CardFooter><Kbd metal="copper">⌘</Kbd><Kbd metal="copper">K</Kbd></CardFooter></Card>
      </div>
    ),
    usage: `<Card variant="plate">\n  <CardEyebrow>Plate</CardEyebrow>\n  <CardTitle>The plate mark</CardTitle>\n  <CardBody>…</CardBody>\n  <CardFooter>…</CardFooter>\n</Card>`,
    props: [['variant', "'plaque' | 'plate' | 'struck'", "'plaque'", 'Paper with a double rule, a press’s plate mark, or metal.'], METAL],
    notes: ['A plain div. Give it a heading inside if it stands for a section.'],
  },
  {
    slug: 'alert', name: 'Alert', group: 'Surfaces', item: 'alert',
    title: 'A notice, marked by a struck strip.',
    line: 'A notice on a plaque, marked by a strip of metal down its edge.',
    body: ['The strip’s metal is the meaning. Oxide alerts are announced straight away; the others politely.'],
    Demo: () => <div style={{ width: 'min(100%, 24rem)', display: 'grid', gap: 12 }}><Alert metal="verdigris" title="Edition complete">Fifty impressions pulled and numbered.</Alert><Alert metal="oxide" title="The bed will not travel">Check the gearing before the next pull.</Alert></div>,
    usage: `<Alert metal="verdigris" title="Edition complete">\n  Fifty impressions pulled and numbered.\n</Alert>`,
    props: [METAL, ['title', 'ReactNode', '', 'The notice’s first line.']],
    notes: ['role alert for oxide, role status for the rest, unless you pass your own.'],
  },
  {
    slug: 'table', name: 'Table', group: 'Surfaces', item: 'table',
    title: 'A ruled ledger.',
    line: 'Rows ruled like a ledger, with mono column heads and figures.',
    body: ['Engraved rules between rows, and numbers set in the mono with tabular figures so they line up.'],
    Demo: () => (
      <div style={{ width: 'min(100%, 30rem)' }}>
        <Table>
          <THead><TR><TH>Impression</TH><TH>State</TH><TH style={{ textAlign: 'right' }}>Pulled</TH></TR></THead>
          <TBody>
            <TR><TD>Trial proof</TD><TD><Badge variant="engraved">I</Badge></TD><TD data-num>1513.04</TD></TR>
            <TR><TD>First edition</TD><TD><Badge metal="verdigris" dot>Final</Badge></TD><TD data-num>1513.05</TD></TR>
          </TBody>
        </Table>
      </div>
    ),
    usage: `<Table>\n  <THead><TR><TH>Impression</TH></TR></THead>\n  <TBody><TR><TD data-num>1513</TD></TR></TBody>\n</Table>`,
    props: [['data-num', 'on TD', '', 'Right-aligns the cell and sets its figures in the mono.']],
    notes: ['A real table, so it reads as one to screen readers.'],
  },
  {
    slug: 'progress', name: 'Progress', group: 'Surfaces', item: 'progress',
    title: 'Metal poured along a channel.',
    line: 'Copper poured along an engraved channel, with light running over it.',
    body: ['With no value it is indeterminate, and a bead of copper runs along the channel instead.'],
    Demo: () => <div style={{ width: 'min(100%, 22rem)', display: 'grid', gap: 16 }}><Progress value={64} aria-label="Inking" /><Progress aria-label="Waiting for the press" /></div>,
    usage: `<Progress value={64} aria-label="Inking" />\n<Progress aria-label="Waiting" />`,
    props: [['value', 'number', 'none', 'Leave it out for an indeterminate bar.'], ['max', 'number', '100', ''], METAL],
    notes: ['role progressbar with its value, so it is announced.'],
  },
  {
    slug: 'separator', name: 'Separator', group: 'Surfaces', item: 'separator',
    title: 'An engraved rule.',
    line: 'A rule cut into the paper, or a printer’s rule with a struck lozenge.',
    body: ['A cut line with its light lip. The ornament sets a small struck lozenge in the middle, as a printer would between sections.'],
    Demo: () => <div style={{ width: 'min(100%, 24rem)' }}><Separator /><Separator variant="ornament" /></div>,
    usage: `<Separator />\n<Separator variant="ornament" />`,
    props: [['variant', "'rule' | 'ornament'", "'rule'", ''], METAL],
    notes: ['role separator.'],
  },
  {
    slug: 'skeleton', name: 'Skeleton', group: 'Surfaces', item: 'skeleton',
    title: 'Shapes cut in, waiting.',
    line: 'Placeholders cut into the paper, with light passing slowly over them.',
    body: ['For the moment before content arrives. Shape them like what is coming.'],
    Demo: () => <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', width: 'min(100%, 22rem)' }}><Skeleton style={{ width: 52, height: 52, borderRadius: '50%' }} /><div style={{ flex: 1, display: 'grid', gap: 9 }}><Skeleton style={{ width: '70%', height: 14 }} /><Skeleton style={{ height: 10 }} /><Skeleton style={{ width: '85%', height: 10 }} /></div></div>,
    usage: `<Skeleton style={{ width: '70%', height: 14 }} />`,
    props: [['...props', 'HTMLAttributes', '', 'Size it with style or a class.']],
    notes: ['Hidden from screen readers. Announce loading elsewhere.'],
  },
  {
    slug: 'tooltip', name: 'Tooltip', group: 'Overlays', item: 'tooltip',
    title: 'A tag, hanging off what it names.',
    line: 'A small struck tag that swings in off whatever it describes.',
    body: ['It hangs off its anchor, so it arrives with a small swing and settles. It shows on hover after a moment, and at once on keyboard focus.'],
    Demo: () => <Tooltip content="Strike a proof"><Button size="icon" aria-label="Strike a proof"><Arrow /></Button></Tooltip>,
    usage: `<Tooltip content="Strike a proof">\n  <Button size="icon" aria-label="Strike a proof">…</Button>\n</Tooltip>`,
    props: [['content', 'ReactNode', '', 'What the tag says.'], ['side', "'top' | 'bottom'", "'top'", ''], METAL],
    notes: ['The child gets aria-describedby, so the tag is read with it. The child must be focusable.'],
  },
  {
    slug: 'menu', name: 'Menu', group: 'Overlays', item: 'menu',
    title: 'Choices on a small plate.',
    line: 'A menu on a small plate that unfolds downward, its items arriving in turn.',
    body: ['The chosen row is struck in copper as you move over it, with the pointer or the arrow keys.'],
    Demo: () => (
      <Menu trigger={(p) => <Button variant="engraved" size="lg" {...p}>The plate ▾</Button>}>
        <MenuLabel>Plate</MenuLabel>
        <MenuItem onSelect={() => toast('Proof struck')}>Strike a proof <Kbd>P</Kbd></MenuItem>
        <MenuItem>Re-cut the lines</MenuItem>
        <MenuRule />
        <MenuItem disabled>Cancel the plate</MenuItem>
      </Menu>
    ),
    usage: `<Menu trigger={(props) => <Button variant="engraved" {...props}>Plate</Button>}>\n  <MenuItem onSelect={strike}>Strike a proof</MenuItem>\n  <MenuRule />\n  <MenuItem disabled>Cancel</MenuItem>\n</Menu>`,
    props: [['trigger', '(props) => ReactNode', '', 'Render your trigger and spread the props onto it.'], ['align', "'start' | 'end'", "'start'", 'Which edge of the trigger it hangs from.'], METAL, ['onSelect', '() => void', '', 'On MenuItem.']],
    notes: ['Arrow keys walk the items, Escape closes and returns focus to the trigger, and a click outside closes it.'],
  },
  {
    slug: 'dialog', name: 'Dialog', group: 'Overlays', item: 'dialog',
    title: 'A plate laid over the page.',
    line: 'A plate laid down over the page, on the native dialog element.',
    body: ['It comes in from just above, a touch large, and its shadow tightens as it lands. It lifts off again when closed.'],
    Demo: DialogDemo,
    usage: `<Dialog\n  open={open}\n  onOpenChange={setOpen}\n  title="Cancel the plate?"\n  description="…"\n  footer={<Button onClick={() => setOpen(false)}>Cancel plate</Button>}\n/>`,
    props: [['open', 'boolean', '', ''], ['onOpenChange', '(open: boolean) => void', '', 'Called on Escape, a backdrop click, or close.'], ['title', 'ReactNode', '', ''], ['description', 'ReactNode', '', ''], ['footer', 'ReactNode', '', 'Usually the actions.']],
    notes: ['The native dialog traps focus, closes on Escape and makes the page behind it inert.'],
  },
  {
    slug: 'toast', name: 'Toast', group: 'Overlays', item: 'toast',
    title: 'A deck of small plates.',
    line: 'Notices that stack into a deck, fan out when you look at them, and can be flicked away.',
    body: ['Each plate’s time runs out along an engraved line at its foot. Hover the deck and it fans out, with every timer paused. Flick one to the right to send it away early.'],
    Demo: ToastDemo,
    usage: `import { toast, Toaster } from '@/components/copperplate/toast';\n\n// once, near the root\n<Toaster />\n\ntoast('Edition pulled', { body: 'Fifty impressions.', metal: 'verdigris' });`,
    props: [['title', 'ReactNode', '', 'First argument to toast().'], ['body', 'ReactNode', '', ''], ['metal', 'Metal', "'copper'", ''], ['duration', 'number', '4600', 'In milliseconds.']],
    notes: ['Announced politely through a live region.', 'Timers pause while the deck is open.'],
  },
  {
    slug: 'accordion', name: 'Accordion', group: 'Overlays', item: 'accordion',
    title: 'Sections behind engraved rules.',
    line: 'Sections that open behind engraved rules, on native details.',
    body: ['Give the items the same name and only one opens at a time.'],
    Demo: () => (
      <div style={{ width: 'min(100%, 26rem)' }}>
        <Accordion>
          <AccordionItem title="Why copper?" name="faq" open>It is soft enough to cut cleanly and hard enough to print a whole edition.</AccordionItem>
          <AccordionItem title="What is a plate mark?" name="faq">The bevel a press leaves in the paper round the plate.</AccordionItem>
          <AccordionItem title="Can a plate be re-cut?" name="faq">Yes, and later states of a print often show it.</AccordionItem>
        </Accordion>
      </div>
    ),
    usage: `<Accordion>\n  <AccordionItem title="Why copper?" name="faq">…</AccordionItem>\n</Accordion>`,
    props: [['title', 'ReactNode', '', 'On AccordionItem.'], ['name', 'string', '', 'Shared by items that should open one at a time.'], ['open', 'boolean', 'false', 'Start open.']],
    notes: ['Native details and summary, so it works with the keyboard and find in page.'],
  },
  {
    slug: 'seal', name: 'Seal', group: 'Struck pieces', item: 'seal',
    title: 'A medal, struck with a legend.',
    line: 'A letter in the field and a legend round the rim, inside a ring of beads.',
    body: ['For the project with no picture, or the release, or the member with no photo. It is drawn in greys and lit as real relief, so it tilts toward the pointer and catches the lamp.'],
    Demo: () => (
      <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Seal initial="K" legend="Knight · Death · Devil · 1513" className="seal-lg" />
        <Seal initial="G" legend="Guardian · judgement sidecar" metal="silver" className="seal-lg" />
      </div>
    ),
    usage: `<Seal initial="K" legend="Knight · Death · Devil · 1513" />`,
    props: [['initial', 'string', '', 'The letter in the field.'], ['legend', 'string', '', 'Lettered round the rim.'], METAL, ['label', 'string', 'initial and legend', 'Its accessible name.']],
    notes: ['A light is carried across it the first time it is seen.'],
  },
  {
    slug: 'coin', name: 'Coin', group: 'Struck pieces', item: 'coin',
    title: 'A mark, struck into a coin.',
    line: 'A logo, icon or letter struck into a coin. Flip it and it spins.',
    body: ['Draw the mark on a hundred-unit grid and it is struck into the field. It tilts toward the pointer, and clicked it spins once and rings.'],
    Demo: () => (
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Coin size={72} label="Star"><Star /></Coin>
        <Coin size={72} metal="brass" label="Bolt"><Bolt /></Coin>
        <Coin size={72} metal="silver" text="Go" />
      </div>
    ),
    usage: `<Coin label="Star"><path d="…" /></Coin>\n<Coin text="Go" metal="silver" size={40} />`,
    props: [['children', 'SVG shapes', '', 'Drawn on a 100 by 100 grid, filled white.'], ['text', 'string', '', 'A short word instead of a mark.'], ['size', 'number', '40', 'In pixels.'], ['flip', 'boolean', 'true', 'Spin and ring when clicked.'], METAL],
    notes: ['Decorative unless you give it a label.'],
  },
  {
    slug: 'hallmark', name: 'Hallmark', group: 'Struck pieces', item: 'hallmark',
    title: 'A maker’s mark.',
    line: 'Initials punched into a cut cartouche, for footers and signatures.',
    body: ['Silversmiths punch a mark into finished work. This is that, for the foot of a page.'],
    Demo: () => <Hallmark initials="AA" className="hallmark-lg" />,
    usage: `<Hallmark initials="AA" />`,
    props: [['initials', 'string', '', 'Two or three letters.'], METAL],
    notes: ['Size it with a height; the width follows.'],
  },
  {
    slug: 'avatar', name: 'Avatar', group: 'Struck pieces', item: 'avatar',
    title: 'A portrait struck as a coin.',
    line: 'A photo engraved into the field of a coin, or the initials struck when there is none.',
    body: ['The photo is engraved with the same filter as the plates, so every face on the page is the same metal.'],
    Demo: () => <div style={{ display: 'flex', gap: 16 }}><Avatar name="Félix Nadar" src="/gallery/nadar-self-portrait.webp" size={84} /><Avatar name="Albrecht Dürer" size={84} /></div>,
    usage: `<Avatar name="Félix Nadar" src="/nadar.jpg" size={48} />\n<Avatar name="Albrecht Dürer" />`,
    props: [['name', 'string', '', 'Its accessible name, and the initials when there is no photo.'], ['src', 'string', '', 'The photo.'], ['size', 'number', '48', 'In pixels.'], METAL],
    notes: ['Tilts toward the pointer like the coins.'],
  },
  {
    slug: 'engraved-text', name: 'Engraved text', group: 'Struck pieces', item: 'engraved-text',
    title: 'Type cut into metal.',
    line: 'A heading or nameplate cut into metal, catching the lamp as it moves.',
    body: ['It measures its own line, so it sizes like text. Set a font size on it and it follows.'],
    Demo: () => <EngravedText style={{ fontSize: 'clamp(3rem, 8vw, 4.5rem)' }}>Copperplate</EngravedText>,
    usage: `<EngravedText as="h1" style={{ fontSize: 72 }}>Copperplate</EngravedText>`,
    props: [['children', 'string', '', 'The text.'], ['as', "'span' | 'h1' | 'h2' | 'h3' | 'p'", "'span'", ''], ['weight', 'number', '480', ''], ['italic', 'boolean', 'false', ''], ['sweep', 'boolean', 'true', 'Carry a light across it the first time it is seen.'], METAL],
    notes: ['The text is its accessible name, so it reads as normal text.'],
  },
  {
    slug: 'plate', name: 'Plate', group: 'Struck pieces', item: 'plate',
    title: 'Any image, engraved.',
    line: 'Any image as an engraved plate. Its brightness becomes the depth of the cut.',
    body: ['The library’s Engraving with the kit’s defaults. The playground on the plates page lets you try it on your own picture.'],
    Demo: () => <Plate src="/gallery/durer-knight.webp" alt="Dürer, Knight, Death and the Devil" style={{ width: 'min(100%, 15rem)', aspectRatio: '487 / 625', ['--copperplate-mark-bg' as string]: 'var(--cp-paper-2)', ['--copperplate-mark-line' as string]: 'var(--cp-rule-2)' }} />,
    usage: `<Plate src="/knight.jpg" alt="Dürer, Knight, Death and the Devil" style={{ width: 320, aspectRatio: '487 / 625' }} />`,
    props: [['src / alt', 'string', '', ''], ['material', "'copper' | 'brass' | 'silver' | 'steel' | 'gold' | 'bronze'", "'copper'", ''], ['relief', 'number', '3.2', 'Depth of the cut.'], ['shine', 'number', '1', 'Strength of the glint.'], ['plateMark', 'boolean', 'true', 'The pressed frame round the image.']],
    notes: ['See the plates page for every option and the playground.'],
  },
];

export const GROUPS = [...new Set(ENTRIES.map((e) => e.group))];
export const bySlug = (slug: string) => ENTRIES.find((e) => e.slug === slug);
