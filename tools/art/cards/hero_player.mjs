// THE TIDECALLER (the player's hero) — a young, set-jawed tide-mage in a deep teal hood, holding up a little lantern
// with a captured star in it. Gold light (drawn, not blurred) on the lantern side of the face, cool shadow on the other.
import { el, g, spline, ribbon, ink, stroke, flat, inkCircle, inkEllipse, sticker, eye, star4, halo, INK, W_SUBJECT, W_INNER, W_DETAIL, W_MID } from '../lib.mjs';

export const out = 'ui';
export const flatOnly = true;

const LX = 800, LY = 668; // the star in the lantern
const ell = (cx, cy, rx, ry) => `M${cx - rx} ${cy}A${rx} ${ry} 0 1 0 ${cx + rx} ${cy}A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}Z`;

export function build(s) {
  // ---- 0: night water in flat bands
  s.bands([[0, '#26418f'], [300, '#1f3580'], [560, '#192a6c'], [820, '#131f56']], { amp: 18, waves: 3 });
  s.shafts({ x: 300, y: -140, angle: 82, spread: 36, n: 3, color: '#8fd0ff', opacity: 0.1, width: 120 });
  s.specks({ n: 34, rmin: 2, rmax: 5, colors: ['#8fd0ff', '#b9a6ff', '#ffe9a8'], opacity: 0.5, layer: 0 });
  s.lumps({ y: 930, amp: 80, n: 6, fill: '#0f1845', layer: 0 });
  s.paper();

  // ---- 1: the lantern's light, drawn as flat rings behind her; a little weed
  s.add(1, halo(LX, LY - 20, 400, '#ffd76a', 3, 0.42));
  s.weed({ x: 70, h: 420, fill: '#1c6f73', sway: 30, width: 52 });
  s.weed({ x: 150, h: 280, fill: '#17595f', sway: 22, width: 44 });

  // ---- 2: the Tidecaller
  const body = [];
  const hood = spline([[505, 112], [650, 140], [775, 255], [812, 420], [782, 585], [690, 708], [512, 746], [334, 708], [242, 585], [212, 420], [249, 255], [374, 140]], true);
  const cloak = spline([[130, 1100], [150, 880], [270, 742], [512, 690], [754, 742], [874, 880], [894, 1100], [512, 1160]], true);
  const tip = ribbon([[420, 170], [330, 96], [236, 110], [196, 176]], 130, 26);
  const sleeve = ribbon([[1060, 900], [968, 700], [830, 548]], 210, 112);
  body.push(sticker([
    { d: tip, fill: '#1b6876' },
    { d: cloak, fill: '#1b6876' },
    { d: sleeve, fill: '#1f7a85' },
    { d: hood, fill: '#24909a' },
  ]));
  // one hard shadow tone on the hood (the side away from the lantern) and the cloak under the chin
  body.push(g({ 'clip-path': s.clip(el('path', { d: hood })) }, [
    flat('M150 60L470 60C330 190 300 430 360 620C400 720 470 760 520 780L150 780Z', '#1b6876'),
    flat('M560 150C690 180 760 300 770 420C720 300 650 215 560 150Z', '#7fe0cf'),
  ]));
  body.push(g({ 'clip-path': s.clip(el('path', { d: cloak })) }, [
    flat('M100 700L560 700C420 800 380 930 400 1100L100 1100Z', '#155563'),
    flat('M250 720Q512 860 774 720L774 690L250 690Z', '#155563'),
  ]));
  body.push(stroke(hood, { w: W_INNER }));
  // cuff on the sleeve
  body.push(ink(ribbon([[872, 610], [826, 546]], 128, 122), '#f2c14e', { w: W_INNER }));

  // the hood's opening: gold trim, dark inside
  body.push(ink(ell(512, 448, 226, 238), '#f2c14e', { w: W_INNER }));
  body.push(flat('M512 214A226 238 0 0 0 290 420C330 300 400 240 512 232Z', '#c98f2e'));
  body.push(ink(ell(512, 452, 198, 210), '#0f3340', { w: W_INNER }));

  // the face
  const face = 'M342 450C342 330 420 290 512 290C604 290 682 330 682 450C682 560 610 622 512 622C414 622 342 560 342 450Z';
  body.push(ink(face, '#ffd9a8', { w: W_INNER }));
  body.push(g({ 'clip-path': s.clip(el('path', { d: face })) }, [
    flat('M330 280L450 280C392 380 392 520 470 640L330 640Z', '#dd9f8c'),           // cool side
    flat('M700 380C690 500 640 590 560 630L720 640Z', '#fff3c2'),                    // lantern side
  ]));
  body.push(stroke(face, { w: W_INNER }));
  // sea-foam hair: a chunky swept fringe
  const hair = 'M336 452C316 330 400 262 512 262C624 262 708 330 688 452L654 388L612 424L566 362L506 418L452 356L398 420L372 384Z';
  body.push(ink(hair, '#d6fff0', { w: W_INNER }));
  body.push(g({ 'clip-path': s.clip(el('path', { d: hair })) }, flat('M300 240L470 240C400 290 372 360 380 470L300 470Z', '#8fd6c8')));
  body.push(stroke(hair, { w: W_INNER }));
  body.push(stroke('M560 300Q610 318 628 370', { w: W_DETAIL, stroke: '#8fd6c8' }));
  // eyes: big, level, a little stern
  body.push(eye(424, 478, 50, { look: [0.3, 0.1], lid: 0.1, lidRot: 12 }), eye(600, 478, 50, { look: [0.3, 0.1], lid: 0.1, lidRot: -12 }));
  body.push(stroke('M366 418L456 436', { w: W_INNER + 4 }), stroke('M658 418L568 436', { w: W_INNER + 4 }));
  body.push(el('ellipse', { cx: 372, cy: 546, rx: 24, ry: 14, fill: '#ff8f8f', opacity: 0.8 }), el('ellipse', { cx: 652, cy: 546, rx: 24, ry: 14, fill: '#ff9f7f', opacity: 0.8 }));
  body.push(stroke('M482 574Q514 592 548 566', { w: W_INNER }));
  body.push(stroke('M506 520q8 8 16 0', { w: W_DETAIL }));

  // the clasp at her throat: a gold shell-button
  body.push(inkCircle(512, 770, 40, '#f2c14e', { w: W_INNER }));
  body.push(star4(512, 770, 22, '#fff6c0', W_DETAIL));

  // the lantern's light on her, then the lantern
  body.push(halo(LX, LY, 170, '#ffe58a', 2, 0.4));
  body.push(stroke(`M${LX - 34} ${LY - 96}C${LX - 40} ${LY - 170} ${LX + 40} ${LY - 170} ${LX + 34} ${LY - 96}`, { w: W_SUBJECT + 10 }));
  body.push(stroke(`M${LX - 34} ${LY - 96}C${LX - 40} ${LY - 170} ${LX + 40} ${LY - 170} ${LX + 34} ${LY - 96}`, { w: 10, stroke: '#f2c14e' }));
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
  body.push(inkCircle(LX + 4, LY - 152, 50, '#ffd9a8', { w: W_SUBJECT - 2 }));
  body.push(flat(`M${LX - 40} ${LY - 152}A44 44 0 0 0 ${LX + 4} ${LY - 108}A60 60 0 0 1 ${LX - 40} ${LY - 152}Z`, '#dd9f8c'));
  body.push(stroke(`M${LX - 22} ${LY - 166}q4 22 0 34M${LX + 4} ${LY - 170}q4 24 0 40M${LX + 30} ${LY - 166}q4 22 0 34`, { w: W_DETAIL }));
  s.add(2, g({ filter: s.wobble(5) }, body));

  // ---- 3: sparks off the star, bubbles
  s.add(3, star4(905, 500, 30, '#fff6c0'), star4(668, 820, 22, '#ffe9a8'), star4(930, 800, 18), star4(170, 230, 30), star4(120, 600, 20, '#b9f3ff'));
  s.inkBubbles({ n: 6, x0: 40, x1: 260, y0: 300, y1: 900, rmin: 9, rmax: 24 });
  s.specks({ n: 12, rmin: 3, rmax: 7, colors: ['#ffffff', '#ffe9a8', '#b9f3ff'], opacity: 0.9 });
}
