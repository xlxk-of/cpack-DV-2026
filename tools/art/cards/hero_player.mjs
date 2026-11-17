// THE TIDECALLER (the player's hero) — a young, set-jawed tide-mage in a deep teal hood, holding up a little lantern
// with a captured star in it. Gold light (drawn, not blurred) on the lantern side of the face, cool shadow on the other.
import { el, g, spline, ribbon, ink, stroke, flat, inkCircle, inkEllipse, sticker, eye, star4, halo, INK, W_SUBJECT, W_INNER, W_DETAIL, W_MID } from '../lib.mjs';

export const out = 'ui';
export const flatOnly = true;

const LX = 796, LY = 700; // the star in the lantern
const ell = (cx, cy, rx, ry) => `M${cx - rx} ${cy}A${rx} ${ry} 0 1 0 ${cx + rx} ${cy}A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}Z`;

export function build(s) {
  // ---- 0: night water in flat bands
  s.bands([[0, '#26418f'], [300, '#1f3580'], [560, '#192a6c'], [820, '#131f56']], { amp: 18, waves: 3 });
  s.shafts({ x: 300, y: -140, angle: 82, spread: 36, n: 3, color: '#8fd0ff', opacity: 0.1, width: 120 });
  s.specks({ n: 34, rmin: 2, rmax: 5, colors: ['#8fd0ff', '#b9a6ff', '#ffe9a8'], opacity: 0.5, layer: 0 });
  s.lumps({ y: 930, amp: 80, n: 6, fill: '#0f1845', layer: 0 });
  s.paper();

  // ---- 1: the lantern's light, drawn as flat rings behind her; a little weed
  s.add(1, el('circle', { cx: LX, cy: LY - 20, r: 420, fill: '#35398f' }), el('circle', { cx: LX, cy: LY - 20, r: 300, fill: '#5a4a98' }), el('circle', { cx: LX, cy: LY - 20, r: 190, fill: '#9a6a92' }));
  s.weed({ x: 70, h: 420, fill: '#1c6f73', sway: 30, width: 52 });
  s.weed({ x: 150, h: 280, fill: '#17595f', sway: 22, width: 44 });

  // ---- 2: the Tidecaller
  const body = [];
  const hood = spline([[505, 96], [660, 126], [792, 248], [830, 420], [798, 595], [700, 722], [512, 760], [324, 722], [226, 595], [194, 420], [232, 248], [364, 126]], true);
  const cloak = spline([[130, 1100], [150, 880], [270, 752], [512, 700], [754, 752], [874, 880], [894, 1100], [512, 1160]], true);
  const tip = ribbon([[470, 190], [400, 84], [316, 60], [262, 104]], 200, 30);
  // the lantern arm: out of the right shoulder, bent at the elbow, up to the hand
  const sleeve = ribbon([[690, 850], [860, 826], [934, 722], [910, 610], [852, 508]], 150, 112);
  body.push(sticker([
    { d: tip, fill: '#1b6876' },
    { d: sleeve, fill: '#24909a' },
    { d: cloak, fill: '#1b6876' },
    { d: hood, fill: '#24909a' },
  ]));
  // one hard shadow tone on the hood (the side away from the lantern) and the cloak under the chin
  body.push(g({ 'clip-path': s.clip(el('path', { d: hood })) }, [
    flat('M130 40L450 40C310 190 280 430 340 630C380 730 460 772 520 800L130 800Z', '#1b6876'),
    flat('M580 136C710 170 782 290 792 420C742 300 670 204 580 136Z', '#7fe0cf'),
  ]));
  body.push(g({ 'clip-path': s.clip(el('path', { d: cloak })) }, [
    flat('M100 700L540 700C400 800 360 930 380 1100L100 1100Z', '#155563'),
    flat('M250 730Q512 880 774 730L774 690L250 690Z', '#155563'),
  ]));
  const offCloak = s.clip(el('path', { d: 'M-200 -200H1300V1400H-200Z' + cloak, 'clip-rule': 'evenodd' }));
  body.push(g({ 'clip-path': offCloak }, [
    g({ 'clip-path': s.clip(el('path', { d: sleeve })) }, flat(ribbon([[700, 912], [884, 884], [998, 744], [972, 596], [908, 480]], 56, 56), '#1b6876')),
    stroke(sleeve, { w: W_INNER }),
  ]));
  body.push(stroke(cloak, { w: W_INNER }));
  body.push(stroke(hood, { w: W_INNER }));
  body.push(stroke('M512 800Q500 900 440 1040', { w: W_INNER }), stroke('M300 800Q290 880 300 960', { w: W_DETAIL }));
  // cuff on the sleeve
  body.push(ink(ribbon([[896, 574], [872, 538]], 120, 116), '#f2c14e', { w: W_INNER }));

  // the hood's opening: a gold hem, dark inside, coming to a point at the chin
  const drop = (k) => `M512 ${452 - 232 * k}C${512 + 150 * k} ${452 - 232 * k} ${512 + 232 * k} ${452 - 120 * k} ${512 + 222 * k} ${452 + 16 * k}C${512 + 214 * k} ${452 + 128 * k} ${512 + 110 * k} ${452 + 206 * k} 512 ${452 + 250 * k}C${512 - 110 * k} ${452 + 206 * k} ${512 - 214 * k} ${452 + 128 * k} ${512 - 222 * k} ${452 + 16 * k}C${512 - 232 * k} ${452 - 120 * k} ${512 - 150 * k} ${452 - 232 * k} 512 ${452 - 232 * k}Z`;
  body.push(ink(drop(1.07), '#f2c14e', { w: W_INNER }));
  body.push(g({ 'clip-path': s.clip(el('path', { d: drop(1.07) })) }, flat('M240 180L500 180C380 260 330 420 370 600L420 720L240 720Z', '#c98f2e')));
  body.push(ink(drop(0.96), '#0f3340', { w: W_INNER }));

  // the face
  const face = 'M330 458C330 330 412 294 512 294C612 294 694 330 694 458C694 572 618 634 512 634C406 634 330 572 330 458Z';
  body.push(ink(face, '#ffd9a8', { w: W_INNER }));
  body.push(g({ 'clip-path': s.clip(el('path', { d: face })) }, [
    flat('M310 280L440 280C380 380 380 530 462 650L310 650Z', '#dd9f8c'),           // cool side
    flat('M712 390C700 510 650 600 566 642L730 650Z', '#fff3c2'),                    // lantern side
  ]));
  body.push(stroke(face, { w: W_INNER }));
  // sea-foam hair: a chunky swept fringe
  const hair = 'M322 462C300 330 396 262 512 262C628 262 724 330 702 462C690 420 668 396 640 384C622 410 590 424 556 424C568 404 572 386 566 366C540 400 490 424 436 424C448 406 452 388 448 372C420 400 384 414 350 410C336 424 328 442 322 462Z';
  body.push(ink(hair, '#d6fff0', { w: W_INNER }));
  body.push(g({ 'clip-path': s.clip(el('path', { d: hair })) }, flat('M290 240L470 240C400 290 372 360 380 480L290 480Z', '#8fd6c8')));
  body.push(stroke(hair, { w: W_INNER }));
  body.push(stroke('M580 300Q632 318 650 362', { w: W_DETAIL, stroke: '#8fd6c8' }));
  // eyes: big, level, a little stern
  body.push(eye(422, 496, 52, { look: [0.3, 0.1], lid: 0.08, lidRot: 12 }), eye(602, 496, 52, { look: [0.3, 0.1], lid: 0.08, lidRot: -12 }));
  body.push(stroke('M366 440L456 456', { w: W_INNER + 4 }), stroke('M658 440L568 456', { w: W_INNER + 4 }));
  body.push(el('ellipse', { cx: 366, cy: 566, rx: 24, ry: 14, fill: '#ff8f8f', opacity: 0.8 }), el('ellipse', { cx: 658, cy: 566, rx: 24, ry: 14, fill: '#ff9f7f', opacity: 0.8 }));
  body.push(stroke('M482 586Q514 604 548 578', { w: W_INNER }));
  body.push(stroke('M504 540q8 8 16 0', { w: W_DETAIL }));

  // the clasp at her throat: a gold button with a star on it
  body.push(inkCircle(512, 760, 42, '#f2c14e', { w: W_INNER }));
  body.push(star4(512, 760, 24, '#fff6c0', W_DETAIL));

  // the lantern's light on her, then the lantern
  body.push(el('circle', { cx: LX, cy: LY - 150, r: 46, fill: 'none', stroke: INK, 'stroke-width': 30 }), el('circle', { cx: LX, cy: LY - 150, r: 46, fill: 'none', stroke: '#f2c14e', 'stroke-width': 14 }));
  const glass = `M${LX - 70} ${LY - 74}Q${LX - 84} ${LY} ${LX - 70} ${LY + 74}L${LX + 70} ${LY + 74}Q${LX + 84} ${LY} ${LX + 70} ${LY - 74}Z`;
  const cap = `M${LX - 62} ${LY - 74}L${LX - 40} ${LY - 112}L${LX + 40} ${LY - 112}L${LX + 62} ${LY - 74}Z`;
  const foot = `M${LX - 70} ${LY + 74}L${LX + 70} ${LY + 74}L${LX + 56} ${LY + 106}L${LX - 56} ${LY + 106}Z`;
  body.push(sticker([{ d: cap, fill: '#f2c14e' }, { d: foot, fill: '#f2c14e' }, { d: glass, fill: '#fff3a8' }]));
  body.push(flat(`M${LX + 14} ${LY - 108}L${LX + 40} ${LY - 108}L${LX + 58} ${LY - 78}L${LX + 30} ${LY - 78}Z`, '#c98f2e'));
  body.push(flat(`M${LX + 20} ${LY + 78}L${LX + 66} ${LY + 78}L${LX + 54} ${LY + 102}L${LX + 20} ${LY + 102}Z`, '#c98f2e'));
  body.push(el('circle', { cx: LX, cy: LY, r: 52, fill: '#ffffff', opacity: 0.6 }));
  body.push(star4(LX, LY, 50, '#ffffff', W_DETAIL + 1));
  body.push(flat(`M${LX - 58} ${LY - 56}Q${LX - 66} ${LY - 10} ${LX - 58} ${LY + 30}L${LX - 46} ${LY + 30}Q${LX - 52} ${LY - 10} ${LX - 44} ${LY - 56}Z`, '#ffffff', { opacity: 0.9 }));
  // her fist on the handle
  body.push(inkCircle(LX + 4, LY - 204, 52, '#ffd9a8', { w: W_SUBJECT - 2 }));
  body.push(flat(`M${LX - 42} ${LY - 204}A46 46 0 0 0 ${LX + 4} ${LY - 158}A62 62 0 0 1 ${LX - 42} ${LY - 204}Z`, '#dd9f8c'));
  body.push(stroke(`M${LX - 20} ${LY - 196}q4 20 0 34M${LX + 6} ${LY - 198}q4 22 0 38M${LX + 32} ${LY - 196}q4 20 0 34`, { w: W_DETAIL }));
  s.add(2, g({ filter: s.wobble(5) }, body));

  // ---- 3: sparks off the star, bubbles
  s.add(3, star4(916, 640, 28, '#fff6c0'), star4(668, 850, 22, '#ffe9a8'), star4(930, 800, 18), star4(170, 230, 30), star4(120, 600, 20, '#b9f3ff'));
  s.inkBubbles({ n: 6, x0: 40, x1: 260, y0: 300, y1: 900, rmin: 9, rmax: 24 });
  s.specks({ n: 12, rmin: 3, rmax: 7, colors: ['#ffffff', '#ffe9a8', '#b9f3ff'], opacity: 0.9 });
}
