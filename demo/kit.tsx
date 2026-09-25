import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../kit/metal.css';
import {
  Accordion, AccordionItem, Alert, Avatar, Coin, Dialog, EngravedText, Hallmark, Menu, MenuItem, MenuLabel, MenuRule, Plate, Seal, Skeleton,
  Table, TBody, TD, TH, THead, TR, Toaster, Tooltip, toast,
  Badge, Button, Card, CardBody, CardEyebrow, CardFooter, CardTitle, Checkbox, Field, Hint, Input, Kbd, Label, Progress,
  Radio, RadioGroup, Select, Separator, Slider, Switch, Tab, TabPanel, Tabs, TabsList, Textarea, type Metal,
} from '../kit/components';

const METALS: Metal[] = ['copper', 'brass', 'silver', 'steel', 'verdigris', 'oxide'];

const Arrow = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

const Star = () => <path d="M50 6l12.9 28.6 31.1 3.3-23.3 20.9 6.6 30.7L50 73.8 22.7 89.5l6.6-30.7L6 37.9l31.1-3.3z" />;
const Bolt = () => <path d="M58 4 18 56h26l-6 40 42-54H54z" />;
const Leaf = () => <path d="M88 10C40 12 12 38 14 80c0 3 1 6 2 8 6-18 20-36 44-48-20 16-32 32-38 52 44 4 70-30 66-82z" />;

function Side({ theme }: { theme: 'light' | 'dark' }) {
  const [vol, setVol] = useState(62);
  const [on, setOn] = useState(true);
  const [dlg, setDlg] = useState(false);
  return (
    <section className={`side cp-${theme}`}>
      <h2>{theme === 'light' ? 'Day' : 'Night'}</h2>
      <p className="lede">Paper and ink, with metal kept for what matters.</p>

      <div className="sec">
        <span className="cp-label">Buttons</span>
        <div className="row">
          <Button>Let&rsquo;s talk <Arrow /></Button>
          <Button variant="engraved">Resume</Button>
          <Button variant="plain">Read more</Button>
          <Button size="icon" aria-label="Next"><Arrow /></Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button size="sm" variant="engraved">Small</Button>
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          {METALS.map((m) => <Button key={m} metal={m} size="sm">{m}</Button>)}
        </div>
      </div>

      <div className="sec">
        <span className="cp-label">Badges</span>
        <div className="row">
          {METALS.map((m) => <Badge key={m} metal={m}>{m}</Badge>)}
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          <Badge metal="verdigris" dot>Shipped</Badge>
          <Badge metal="brass" dot>Review</Badge>
          <Badge metal="oxide" dot>Failing</Badge>
          <Badge variant="engraved">Draft</Badge>
          <Badge variant="engraved" metal="verdigris" dot>Live</Badge>
        </div>
      </div>

      <div className="sec">
        <span className="cp-label">Fields</span>
        <div className="col">
          <Field>
            <Label>Name</Label>
            <Input placeholder="Albrecht Dürer" />
          </Field>
          <Field invalid>
            <Label>Email</Label>
            <Input defaultValue="durer@nuremberg" />
            <Hint>That address is missing its domain.</Hint>
          </Field>
          <Field>
            <Label>Metal</Label>
            <Select defaultValue="copper">{METALS.map((m) => <option key={m}>{m}</option>)}</Select>
          </Field>
          <Field>
            <Label>Note</Label>
            <Textarea placeholder="Engraved on the back of the plate." />
            <Hint>Up to 280 characters.</Hint>
          </Field>
        </div>
      </div>

      <div className="sec">
        <span className="cp-label">Choices</span>
        <div className="row" style={{ gap: 28, alignItems: 'flex-start' }}>
          <div className="col" style={{ gap: 12 }}>
            <Checkbox label="Strike a proof first" defaultChecked />
            <Checkbox label="Keep the plate mark" />
            <Checkbox label="Unavailable" disabled />
          </div>
          <RadioGroup defaultValue="line">
            <Radio value="line" label="Line engraving" />
            <Radio value="mezzo" label="Mezzotint" />
            <Radio value="etch" label="Etching" />
          </RadioGroup>
          <div className="col" style={{ gap: 14 }}>
            <label className="row" style={{ gap: 12, fontFamily: 'var(--cp-font-body)' }}><Switch checked={on} onCheckedChange={setOn} /> Follow the pointer</label>
            <label className="row" style={{ gap: 12, fontFamily: 'var(--cp-font-body)' }}><Switch metal="verdigris" /> Weathered</label>
          </div>
        </div>
      </div>

      <div className="sec">
        <span className="cp-label">Slider · {vol}</span>
        <div className="col"><Slider value={vol} onValueChange={setVol} aria-label="Relief" /></div>
      </div>

      <div className="sec">
        <span className="cp-label">Tabs</span>
        <Tabs defaultValue="plate">
          <TabsList>
            <Tab value="plate">Plate</Tab>
            <Tab value="proof">Proof</Tab>
            <Tab value="edition">Edition</Tab>
          </TabsList>
          <TabPanel value="plate"><p className="lede" style={{ marginTop: 14 }}>The copper, before any ink.</p></TabPanel>
          <TabPanel value="proof"><p className="lede" style={{ marginTop: 14 }}>A trial impression, to check the cut.</p></TabPanel>
          <TabPanel value="edition"><p className="lede" style={{ marginTop: 14 }}>Fifty, numbered, then the plate is cancelled.</p></TabPanel>
        </Tabs>
      </div>

      <div className="sec">
        <span className="cp-label">Cards</span>
        <div className="cards">
          <Card>
            <CardEyebrow>Plaque</CardEyebrow>
            <CardTitle>Knight, Death and the Devil</CardTitle>
            <CardBody>Dürer, 1513. The rider does not look at either of them.</CardBody>
            <CardFooter><Badge variant="engraved">1513</Badge></CardFooter>
          </Card>
          <Card variant="plate">
            <CardEyebrow>Plate</CardEyebrow>
            <CardTitle>The plate mark</CardTitle>
            <CardBody>The bevel the press leaves round a printed plate.</CardBody>
            <CardFooter><Button size="sm" variant="engraved">Open</Button></CardFooter>
          </Card>
          <Card variant="struck">
            <CardEyebrow className="cp-stamped">Struck</CardEyebrow>
            <CardTitle className="cp-stamped">One loud card</CardTitle>
            <CardBody>For the single thing on the page that should shine.</CardBody>
            <CardFooter><Kbd metal="copper">⌘</Kbd><Kbd metal="copper">K</Kbd></CardFooter>
          </Card>
        </div>
      </div>

      <div className="sec">
        <span className="cp-label">Rules, keys, progress</span>
        <Separator />
        <Separator variant="ornament" />
        <div className="row" style={{ marginTop: 8 }}>
          <span className="lede">Press</span><Kbd>⌘</Kbd><Kbd>K</Kbd><span className="lede">to search</span>
        </div>
        <div className="col" style={{ marginTop: 22, gap: 14 }}>
          <Progress value={64} aria-label="Upload" />
          <Progress metal="verdigris" value={100} aria-label="Done" />
          <Progress aria-label="Loading" />
        </div>
      </div>

      <div className="sec">
        <span className="cp-label">Struck and engraved</span>
        <EngravedText as="h2" style={{ fontSize: 56 }}>Copperplate</EngravedText>
        <div className="row" style={{ marginTop: 18, gap: 18 }}>
          <Seal initial="K" legend="Knight · Death · Devil · 1513" className="seal" />
          <Seal initial="G" legend="Guardian · Judgement sidecar" metal="silver" className="seal" />
          <Seal initial="W" legend="Witness · Provenance proxy" metal="verdigris" className="seal" />
        </div>
        <div className="row" style={{ marginTop: 18, gap: 14 }}>
          <Hallmark initials="AA" className="hallmark" />
          <Coin label="Star"><Star /></Coin>
          <Coin metal="brass" label="Bolt"><Bolt /></Coin>
          <Coin metal="verdigris" label="Leaf"><Leaf /></Coin>
          <Coin metal="silver" text="Go" />
          <Avatar name="Félix Nadar" src="/gallery/nadar-self-portrait.webp" size={52} />
          <Avatar name="Albrecht Dürer" size={52} />
        </div>
        <div style={{ marginTop: 18, maxWidth: 300 }}>
          <Plate src="/gallery/durer-knight.webp" alt="Dürer, Knight, Death and the Devil" style={{ width: '100%', aspectRatio: '487 / 625' }} />
        </div>
      </div>

      <div className="sec">
        <span className="cp-label">Overlays</span>
        <div className="row">
          <Tooltip content="Strike a proof"><Button size="icon" aria-label="Proof"><Arrow /></Button></Tooltip>
          <Menu trigger={(p) => <Button variant="engraved" {...p}>Plate ▾</Button>}>
            <MenuLabel>Plate</MenuLabel>
            <MenuItem onSelect={() => toast('Proof struck', { body: 'One trial impression, drying.' })}>Strike a proof <Kbd>P</Kbd></MenuItem>
            <MenuItem>Re-cut the lines</MenuItem>
            <MenuRule />
            <MenuItem disabled>Cancel the plate</MenuItem>
          </Menu>
          <Button variant="engraved" onClick={() => setDlg(true)}>Open dialog</Button>
          <Button size="sm" metal="verdigris" onClick={() => toast('Edition shipped', { body: 'Fifty impressions, numbered.', metal: 'verdigris' })}>Toast</Button>
          <Button size="sm" metal="oxide" onClick={() => toast('Press jammed', { body: 'The bed will not travel.', metal: 'oxide' })}>Error toast</Button>
        </div>
        <Dialog
          open={dlg}
          onOpenChange={setDlg}
          title="Cancel the plate?"
          description="A cancelled plate is scored through so no further impressions can be pulled. The edition stays at fifty."
          footer={<><Button variant="engraved" onClick={() => setDlg(false)}>Keep it</Button><Button metal="oxide" onClick={() => setDlg(false)}>Cancel plate</Button></>}
        />
      </div>

      <div className="sec">
        <span className="cp-label">Notices</span>
        <div className="col" style={{ gap: 12, maxWidth: 520 }}>
          <Alert title="A proof is drying">It will be ready to inspect in about ten minutes.</Alert>
          <Alert metal="verdigris" title="Edition complete">Fifty impressions pulled and numbered.</Alert>
          <Alert metal="brass" title="Ink running low">Enough for about a dozen more.</Alert>
          <Alert metal="oxide" title="The bed will not travel">Check the gearing before the next pull.</Alert>
        </div>
      </div>

      <div className="sec">
        <span className="cp-label">Accordion</span>
        <Accordion>
          <AccordionItem title="What is a plate mark?" name={`faq-${theme}`} open>The bevel a press leaves in the paper round the edge of the plate.</AccordionItem>
          <AccordionItem title="Why copper?" name={`faq-${theme}`}>It is soft enough to cut cleanly and hard enough to print a whole edition.</AccordionItem>
          <AccordionItem title="Can a plate be re-cut?" name={`faq-${theme}`}>Yes, and later states of a print often show it.</AccordionItem>
        </Accordion>
      </div>

      <div className="sec">
        <span className="cp-label">Table</span>
        <Table>
          <THead><TR><TH>Impression</TH><TH>State</TH><TH style={{ textAlign: 'right' }}>Pulled</TH></TR></THead>
          <TBody>
            <TR><TD>Trial proof</TD><TD><Badge variant="engraved">I</Badge></TD><TD data-num>1513.04.02</TD></TR>
            <TR><TD>First edition</TD><TD><Badge metal="verdigris" dot>Final</Badge></TD><TD data-num>1513.05.11</TD></TR>
            <TR><TD>Late impression</TD><TD><Badge metal="brass" dot>Worn</Badge></TD><TD data-num>1580.09.30</TD></TR>
          </TBody>
        </Table>
      </div>

      <div className="sec">
        <span className="cp-label">Skeleton</span>
        <div className="row" style={{ gap: 14, alignItems: 'flex-start' }}>
          <Skeleton style={{ width: 52, height: 52, borderRadius: '50%' }} />
          <div className="col" style={{ gap: 8, flex: 1, maxWidth: 320 }}>
            <Skeleton style={{ width: '70%', height: 14 }} />
            <Skeleton style={{ width: '100%', height: 10 }} />
            <Skeleton style={{ width: '85%', height: 10 }} />
          </div>
        </div>
      </div>
    </section>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="sheet">
      <Side theme="light" />
      <Side theme="dark" />
      <Toaster />
    </div>
  </StrictMode>,
);
