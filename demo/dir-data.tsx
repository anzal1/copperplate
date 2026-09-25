import { useState, type ReactElement } from 'react';
import {
  Accordion, AccordionItem, Alert, Avatar, Badge, Button, Card, CardBody, CardEyebrow, CardFooter, CardTitle, Checkbox, Coin, EngravedText,
  Field, Hallmark, Hint, Input, Kbd, Label, Progress, Radio, RadioGroup, Seal, Select, Separator, Skeleton, Slider, Switch, Tab, TabPanel,
  Tabs, TabsList, Tooltip, toast,
} from '../kit/components';

export const Arrow = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Star = () => <path d="M50 6l12.9 28.6 31.1 3.3-23.3 20.9 6.6 30.7L50 73.8 22.7 89.5l6.6-30.7L6 37.9l31.1-3.3z" />;

function SwitchDemo() {
  const [on, setOn] = useState(true);
  return <label style={{ display: 'inline-flex', gap: 12, alignItems: 'center', fontFamily: 'var(--cp-font-body)', fontSize: 17 }}><Switch checked={on} onCheckedChange={setOn} /> Follow the lamp</label>;
}
function SliderDemo() {
  const [v, setV] = useState(58);
  return <div style={{ width: 280 }}><Slider value={v} onValueChange={setV} aria-label="Relief" /><p className="cp-label" style={{ marginTop: 8 }}>Relief · {v}</p></div>;
}

export type Entry = { slug: string; name: string; group: string; line: string; demo: () => ReactElement; code: string };

export const ENTRIES: Entry[] = [
  { slug: 'button', name: 'Button', group: 'Actions', line: 'Struck for the one loud action, engraved for the quiet ones. Presses in.', demo: () => <div style={{ display: 'flex', gap: 12 }}><Button>Let&rsquo;s talk <Arrow /></Button><Button variant="engraved">Resume</Button></div>, code: `<Button>Let's talk</Button>\n<Button variant="engraved">Resume</Button>` },
  { slug: 'badge', name: 'Badge', group: 'Actions', line: 'A struck tag. The metal is the meaning: verdigris done, brass warn, oxide failed.', demo: () => <div style={{ display: 'flex', gap: 8 }}><Badge metal="verdigris" dot>Shipped</Badge><Badge metal="brass" dot>Review</Badge><Badge metal="oxide" dot>Failing</Badge></div>, code: `<Badge metal="verdigris" dot>Shipped</Badge>` },
  { slug: 'kbd', name: 'Kbd', group: 'Actions', line: 'A key, struck in silver.', demo: () => <span style={{ display: 'inline-flex', gap: 6 }}><Kbd>⌘</Kbd><Kbd>K</Kbd></span>, code: `<Kbd>⌘</Kbd><Kbd>K</Kbd>` },
  { slug: 'input', name: 'Input', group: 'Fields', line: 'A field cut into the paper. Focus burnishes its edge.', demo: () => <div style={{ width: 300 }}><Field><Label>Name</Label><Input placeholder="Albrecht Dürer" /><Hint>As it should appear on the plate.</Hint></Field></div>, code: `<Field>\n  <Label>Name</Label>\n  <Input placeholder="Albrecht Dürer" />\n</Field>` },
  { slug: 'select', name: 'Select', group: 'Fields', line: 'The native select, in the same cut field.', demo: () => <div style={{ width: 240 }}><Select defaultValue="copper"><option>copper</option><option>brass</option><option>silver</option></Select></div>, code: `<Select>\n  <option>copper</option>\n</Select>` },
  { slug: 'checkbox', name: 'Checkbox', group: 'Choices', line: 'A socket; checked, a copper tile is struck into it.', demo: () => <div style={{ display: 'grid', gap: 10 }}><Checkbox label="Strike a proof first" defaultChecked /><Checkbox label="Keep the plate mark" /></div>, code: `<Checkbox label="Strike a proof first" />` },
  { slug: 'radio', name: 'Radio', group: 'Choices', line: 'Round sockets; the chosen one takes a domed rivet.', demo: () => <RadioGroup defaultValue="line"><Radio value="line" label="Line engraving" /><Radio value="etch" label="Etching" /></RadioGroup>, code: `<RadioGroup defaultValue="line">\n  <Radio value="line" label="Line engraving" />\n</RadioGroup>` },
  { slug: 'switch', name: 'Switch', group: 'Choices', line: 'A slide bolt in a cut slot. Shot home, the inlay shows.', demo: SwitchDemo, code: `<Switch checked={on} onCheckedChange={setOn} />` },
  { slug: 'slider', name: 'Slider', group: 'Choices', line: 'An engraved scale, metal poured to the value, a knurled disc in the groove.', demo: SliderDemo, code: `<Slider value={v} onValueChange={setV} />` },
  { slug: 'tabs', name: 'Tabs', group: 'Choices', line: 'A tray, and a struck plate that slides under the chosen tab.', demo: () => <Tabs defaultValue="plate"><TabsList><Tab value="plate">Plate</Tab><Tab value="proof">Proof</Tab><Tab value="edition">Edition</Tab></TabsList><TabPanel value="plate" /></Tabs>, code: `<Tabs defaultValue="plate">\n  <TabsList>\n    <Tab value="plate">Plate</Tab>\n  </TabsList>\n</Tabs>` },
  { slug: 'card', name: 'Card', group: 'Surfaces', line: 'A plaque, a plate mark, or the whole card in metal.', demo: () => <Card variant="plate" style={{ width: 280 }}><CardEyebrow>Plate</CardEyebrow><CardTitle>The plate mark</CardTitle><CardBody>The bevel a press leaves round a printed plate.</CardBody><CardFooter><Button size="sm" variant="engraved">Open</Button></CardFooter></Card>, code: `<Card variant="plate">\n  <CardTitle>The plate mark</CardTitle>\n</Card>` },
  { slug: 'alert', name: 'Alert', group: 'Surfaces', line: 'A notice marked by a struck strip down its edge.', demo: () => <div style={{ width: 340 }}><Alert metal="verdigris" title="Edition complete">Fifty impressions pulled and numbered.</Alert></div>, code: `<Alert metal="verdigris" title="Edition complete" />` },
  { slug: 'progress', name: 'Progress', group: 'Surfaces', line: 'Metal poured along an engraved channel.', demo: () => <div style={{ width: 300, display: 'grid', gap: 12 }}><Progress value={64} aria-label="Upload" /><Progress aria-label="Loading" /></div>, code: `<Progress value={64} />` },
  { slug: 'separator', name: 'Separator', group: 'Surfaces', line: 'An engraved rule, or a printer’s rule with a struck lozenge.', demo: () => <div style={{ width: 300 }}><Separator variant="ornament" /></div>, code: `<Separator variant="ornament" />` },
  { slug: 'skeleton', name: 'Skeleton', group: 'Surfaces', line: 'Shapes cut into the paper, light passing over them.', demo: () => <div style={{ width: 260, display: 'grid', gap: 8 }}><Skeleton style={{ height: 14, width: '70%' }} /><Skeleton style={{ height: 10 }} /></div>, code: `<Skeleton style={{ height: 14 }} />` },
  { slug: 'tooltip', name: 'Tooltip', group: 'Overlays', line: 'A small struck tag hanging off what it names.', demo: () => <Tooltip content="Strike a proof"><Button size="icon" aria-label="Proof"><Arrow /></Button></Tooltip>, code: `<Tooltip content="Strike a proof">\n  <Button size="icon" />\n</Tooltip>` },
  { slug: 'toast', name: 'Toast', group: 'Overlays', line: 'A plate that slides in, says one thing, and goes.', demo: () => <Button size="sm" metal="verdigris" onClick={() => toast('Edition shipped', { body: 'Fifty impressions, numbered.', metal: 'verdigris' })}>Ship edition</Button>, code: `toast('Edition shipped', { metal: 'verdigris' })` },
  { slug: 'accordion', name: 'Accordion', group: 'Overlays', line: 'Sections behind engraved rules, on native details.', demo: () => <div style={{ width: 340 }}><Accordion><AccordionItem title="Why copper?" open>Soft enough to cut, hard enough to print an edition.</AccordionItem><AccordionItem title="What is a plate mark?">The bevel a press leaves.</AccordionItem></Accordion></div>, code: `<AccordionItem title="Why copper?">…</AccordionItem>` },
  { slug: 'seal', name: 'Seal', group: 'Signatures', line: 'A medal: a letter in the field, a legend round the rim.', demo: () => <Seal initial="K" legend="Knight · Death · Devil · 1513" className="demo-seal" />, code: `<Seal initial="K" legend="Knight · Death · Devil" />` },
  { slug: 'coin', name: 'Coin', group: 'Signatures', line: 'A logo or icon struck into a coin.', demo: () => <div style={{ display: 'flex', gap: 10 }}><Coin size={52} label="Star"><Star /></Coin><Coin size={52} metal="silver" text="Go" /><Coin size={52} metal="verdigris" text="Py" /></div>, code: `<Coin text="Go" metal="silver" />` },
  { slug: 'hallmark', name: 'Hallmark', group: 'Signatures', line: 'A maker’s mark for footers and signatures.', demo: () => <Hallmark initials="AA" className="demo-hallmark" />, code: `<Hallmark initials="AA" />` },
  { slug: 'avatar', name: 'Avatar', group: 'Signatures', line: 'A portrait struck as a coin; initials when there is no photo.', demo: () => <div style={{ display: 'flex', gap: 12 }}><Avatar name="Félix Nadar" src="/gallery/nadar-self-portrait.webp" size={64} /><Avatar name="Albrecht Dürer" size={64} /></div>, code: `<Avatar name="Félix Nadar" src="/nadar.jpg" />` },
  { slug: 'engraved-text', name: 'Engraved text', group: 'Signatures', line: 'Type cut into metal, catching the lamp.', demo: () => <EngravedText style={{ fontSize: 54 }}>Copperplate</EngravedText>, code: `<EngravedText>Copperplate</EngravedText>` },
];

export const GROUPS = [...new Set(ENTRIES.map((e) => e.group))];
export const INSTALL = 'npx shadcn add https://copperplate.anzalabidi.dev/r/switch.json';
