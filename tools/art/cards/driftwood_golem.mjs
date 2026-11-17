// DRIFTWOOD GOLEM (common 4/5) — a chunky golem of driftwood planks lashed with rope, a pearl caught in the knothole
// of his chest, barnacles on him,
// standing in the shallows at dusk. Doodle style: fat ink line, flat colour, one hard shadow, drawn light.
import { el, g, ribbon, poly, ink, stroke, flat, inkCircle, inkEllipse, eye, star4, halo, waveBand, INK, W_SUBJECT, W_INNER, W_DETAIL, W_MID } from '../lib.mjs';

const circ = (x, y, r) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
const rr = (x, y, w, h, q) => `M${x + q} ${y}h${w - 2 * q}q${q} 0 ${q} ${q}v${h - 2 * q}q0 ${q} ${-q} ${q}h${-(w - 2 * q)}q${-q} 0 ${-q} ${-q}v${-(h - 2 * q)}q0 ${-q} ${q} ${-q}Z`;
const bar = (x, y, w, h, fill, o = {}) => el('rect', { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: h / 2, fill, ...o });

const WOOD = '#ecd7ae', WOOD_D = '#bd9c8c', GRAIN = '#fbefd0';
const ROPE = '#f2b65a', ROPE_D = '#cf8a3e';
const HOLE = '#2c1f52', PEARL = '#fff8ec', PEARL_D = '#e6d2f7';
const WEED = '#4fb58f', SHELLC = '#fff4e2';

export function build(s) {
  const form = (d, fill, inside = [], w = W_INNER) => g({}, [flat(d, fill), inside.length ? g({ 'clip-path': s.clip(el('path', { d })) }, inside) : '', stroke(d, { w })]);
  const contour = (ds, w = W_SUBJECT) => g({}, ds.map((d) => el('path', { d, fill: INK, stroke: INK, 'stroke-width': w * 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' })));
  const H = 646;                               // the horizon

  // ---- 0: dusk sky in flat bands, a setting sun, flat sea
  s.bands([[0, '#3b2a78'], [150, '#66388c'], [300, '#a3468f'], [430, '#e0607c'], [540, '#ff975c']], { amp: 14, waves: 3 });
  s.specks({ n: 22, y1: 230, rmin: 2, rmax: 4, colors: ['#fff3c4', '#ffd1ef'], opacity: 0.8, layer: 0 });
  s.add(0, star4(150, 120, 14, '#fff3c4', 0), star4(884, 86, 11, '#fff3c4', 0), star4(690, 150, 9, '#ffd1ef', 0));
  // flat clouds
  s.add(0, bar(190, 250, 300, 34, '#7d3f93'), bar(270, 284, 200, 26, '#7d3f93'), bar(850, 210, 260, 30, '#7d3f93'), bar(900, 372, 330, 34, '#c2528f'),
    bar(120, 420, 260, 30, '#c2528f'), bar(820, 404, 180, 24, '#c2528f'), bar(240, 520, 300, 26, '#f27c6c'));
  s.add(0, halo(852, H - 40, 220, '#ffe9a0', 3, 0.5), el('circle', { cx: 852, cy: H - 40, r: 84, fill: '#fff3c4' }));
  // far islands, no line
  s.add(0, flat(`M-60 ${H + 4}L-60 ${H - 50}Q30 ${H - 96} 110 ${H - 60}Q160 ${H - 84} 215 ${H - 34}Q262 ${H - 30} 300 ${H + 4}Z`, '#7a3f8e'));
  s.add(0, flat(`M900 ${H + 4}Q960 ${H - 52} 1010 ${H - 40}Q1050 ${H - 60} 1090 ${H - 30}L1090 ${H + 4}Z`, '#7a3f8e'));
  s.add(0, el('rect', { x: -40, y: H, width: 1104, height: 500, fill: '#5d4aa6' }));
  s.add(0, flat(waveBand(1024, 1024, 740, 7, 4, 1), '#4a3b93'), flat(waveBand(1024, 1024, 850, 9, 3, 2.6), '#382d7c'));
  // the sun's road on the water
  s.add(0, bar(852, H + 16, 250, 16, '#ffc37a'), bar(862, H + 48, 180, 14, '#ffc37a'), bar(832, H + 80, 240, 14, '#ffa873'), bar(872, H + 116, 150, 12, '#ffa873'),
    bar(250, H + 30, 190, 10, '#7f66c4'), bar(120, H + 70, 150, 10, '#7f66c4'), bar(330, H + 124, 130, 10, '#6a55b4'), bar(930, H + 160, 150, 10, '#6a55b4'));
  s.paper();

  // ---- 1: rocks in the water, gulls, quiet
  const rock = (x, y, k, f) => g({ transform: `translate(${x} ${y}) scale(${k})` }, [
    ink('M-90 30Q-96 -40 -40 -62Q-6 -92 34 -60Q92 -44 92 30Z', f, { w: W_MID / k }),
    flat('M-60 4Q-50 -34 -22 -44Q-40 -20 -40 6Z', '#8f79d0'),
    bar(0, 34, 230, 14, '#8f79d0')]);
  s.add(1, rock(118, 716, 1, '#4d3a8c'), rock(930, 760, 0.8, '#4d3a8c'), rock(246, 700, 0.5, '#57439a'));
  s.add(1, stroke('M178 196q22 -22 40 0q20 -22 40 0', { w: W_MID }), stroke('M300 150q14 -14 26 0q14 -14 26 0', { w: W_MID - 2 }),
    stroke('M800 286q16 -16 30 0q16 -16 30 0', { w: W_MID - 1 }));
  s.add(1, bar(600, 760, 220, 10, '#7f66c4'), bar(420, 728, 150, 10, '#7f66c4'), bar(700, 800, 120, 10, '#7f66c4'));

  // ---- 2: the golem
  const body = [];
  const legL = 'M398 610L494 610L502 980L386 980Z', legR = 'M530 610L626 610L638 980L522 980Z';
  // the torso is three planks side by side: splintered ends at the shoulders and along the bottom
  const torso = 'M392 328L640 328L648 290L660 316L672 282L680 330L676 400L668 622L652 606L638 636L620 616L604 640L600 664L576 646L552 674L524 652L498 676L472 654L448 672L424 652L420 636L402 648L386 626L370 644L358 620L348 400Q344 338 392 328Z';
  // the head is a short log with one snapped end
  const head = 'M404 196L606 188Q642 188 642 224L642 308Q642 342 608 342L410 342L384 318L402 296L378 270L400 246L380 222Z';
  const twig = ribbon([[574, 194], [596, 150], [636, 128]], 26, 18);
  const leaf = 'M634 128q10 -44 58 -40q4 44 -58 40z';
  const armL = ribbon([[362, 370], [312, 470], [292, 590]], 100, 88);
  const splitL = 'M304 376L302 316L326 346L344 298L368 372Z';     // the snapped top of that arm
  const armR = ribbon([[656, 384], [724, 366], [756, 290]], 100, 86);
  const fistL = rr(208, 556, 160, 150, 62), fistR = rr(682, 160, 152, 150, 62);
  body.push(contour([legL, legR, splitL, armL, armR, torso, head, twig, leaf, fistL, fistR]));

  const grain = (d) => stroke(d, { w: W_DETAIL });
  body.push(form(legL, WOOD, [flat('M376 600h50l-8 400h-50z', WOOD_D), grain('M466 690v56M448 722v44M474 764v30')]));
  body.push(form(legR, WOOD, [flat('M512 600h48l-6 400h-48z', WOOD_D), grain('M600 684v60M584 730v40M608 762v30')]));
  body.push(form(splitL, WOOD, [flat('M290 300h28v80h-28z', WOOD_D)]));
  body.push(form(armL, WOOD, [flat(ribbon([[310, 350], [262, 458], [244, 590]], 22, 22), WOOD_D), grain('M330 400q-16 36 -22 76M306 470q-8 30 -10 56M346 452q-8 26 -10 44')]));
  body.push(form(armR, WOOD, [flat(ribbon([[650, 414], [730, 396], [770, 310]], 44, 40), WOOD_D), grain('M690 366q24 -4 36 -22M700 342q14 -6 22 -22M724 388q20 -14 28 -40')]));
  body.push(form(torso, WOOD, [
    flat('M330 310h100Q404 480 440 660h-110z', WOOD_D),
    flat('M330 598h360v60h-360z', WOOD_D),
    // the seams between the three planks, and their grain
    stroke('M420 382V640M604 382V644', { w: W_INNER }),
    grain('M386 430q-6 36 0 72M402 520v44M376 556v40M640 410q8 50 0 100M626 540v50M654 548v44M470 604v36M512 616v30M552 600v38'),
    // rope round the top
    flat('M330 340h370v42h-370z', ROPE), flat('M330 368h370v14h-370z', ROPE_D),
    stroke('M330 340h370M330 382h370', { w: W_DETAIL }),
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => stroke(`M${372 + i * 40} 382l16 -42`, { w: W_DETAIL })),
  ]));
  // the knothole in his chest and the pearl caught in it
  const knothole = 'M512 410Q566 404 588 452Q604 500 572 544Q540 574 492 566Q444 556 434 506Q426 452 462 424Q484 410 512 410Z';
  body.push(form(knothole, WOOD_D, [], W_INNER));
  body.push(form('M508 426Q556 420 574 458Q588 498 562 534Q536 556 494 550Q456 540 448 500Q442 458 472 436Q488 426 508 426Z', HOLE, [], W_DETAIL));
  // rope lashed crosswise over the planks and across the hole: it is what holds the pearl in
  const lash = [[[352, 396], [672, 588]], [[672, 396], [352, 588]]];
  body.push(g({ 'clip-path': s.clip(el('path', { d: torso })) }, [
    ...lash.map((q) => ink(ribbon(q, 30, 30), ROPE, { w: W_DETAIL })),
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => stroke(`M${378 + i * 37} ${396 + i * 22.2}l-6 30M${646 - i * 37} ${396 + i * 22.2}l6 30`, { w: W_DETAIL - 1 })),
  ]));
  body.push(form(circ(516, 496, 46), PEARL_D, [flat(circ(526, 486, 46), PEARL), flat(circ(534, 476, 13), '#ffffff'), el('circle', { cx: 510, cy: 464, r: 5, fill: '#fff' })], W_INNER));
  body.push(star4(566, 446, 22, '#ffffff'));
  // fists: stumps with rope at the wrist
  body.push(form(fistL, WOOD, [
    flat('M190 540h200v40h-200z', ROPE), flat('M190 566h200v14h-200z', ROPE_D), stroke('M190 580h200', { w: W_DETAIL }),
    ...[0, 1, 2, 3].map((i) => stroke(`M${232 + i * 38} 580l14 -36`, { w: W_DETAIL })),
    flat('M190 540h60q-14 90 10 180h-70z', WOOD_D), flat('M190 668h200v50h-200z', WOOD_D),
    grain('M270 672v34M310 676v30M330 620h-30'),
  ]));
  body.push(form(fistR, WOOD, [
    flat('M660 286h200v40h-200z', ROPE), flat('M660 312h200v14h-200z', ROPE_D), stroke('M660 286h200', { w: W_DETAIL }),
    ...[0, 1, 2, 3].map((i) => stroke(`M${704 + i * 38} 322l14 -36`, { w: W_DETAIL })),
    flat('M660 150h64q-12 70 6 140h-70z', WOOD_D),
    grain('M748 164v32M786 168v28M800 240h-30'),
    flat('M738 216h44q9 0 9 8t-9 8h-44q-9 0 -9 -8t9 -8z', '#ffffff', { opacity: 0.85 }),
  ]));
  // the head
  body.push(form(twig, WOOD_D), form(leaf, WEED, [stroke('M638 124q24 -6 44 -28', { w: W_DETAIL })]));
  body.push(form(head, WOOD, [
    flat('M360 170h80q-22 80 6 190h-86z', WOOD_D), flat('M360 318h300v40h-300z', WOOD_D),
    flat('M474 204h112q9 0 9 8t-9 8h-112q-9 0 -9 -8t9 -8z', '#ffffff', { opacity: 0.85 }),
    grain('M622 236v40M612 300h-30M420 300h26'),
  ]));
  // the set's white eyes, each sitting in a knot of the log
  body.push(el('ellipse', { cx: 458, cy: 272, rx: 50, ry: 45, fill: WOOD_D, transform: 'rotate(-14 458 272)' }), el('ellipse', { cx: 570, cy: 272, rx: 50, ry: 45, fill: WOOD_D, transform: 'rotate(14 570 272)' }));
  body.push(eye(462, 270, 36, { look: [0.2, 0.1] }), eye(566, 270, 36, { look: [0.2, 0.1] }));
  body.push(stroke('M488 318q28 14 56 0', { w: W_INNER }));
  // weed over one shoulder, barnacles
  body.push(ink(ribbon([[436, 326], [404, 346], [372, 404], [384, 474]], 40, 20), WEED, { w: W_INNER }));
  // barnacles: little ridged cones with a slit on top, in clumps
  const barnacle = (x, y, q, rot = 0) => g({ transform: `rotate(${rot} ${x} ${y})` }, [
    ink(`M${x - q} ${y + q * 0.7}Q${x - q * 0.8} ${y - q * 0.7} ${x - q * 0.34} ${y - q * 0.8}L${x + q * 0.34} ${y - q * 0.8}Q${x + q * 0.8} ${y - q * 0.7} ${x + q} ${y + q * 0.7}Z`, SHELLC, { w: W_DETAIL }),
    flat(`M${x - q} ${y + q * 0.7}Q${x - q * 0.8} ${y - q * 0.7} ${x - q * 0.34} ${y - q * 0.8}L${x - q * 0.1} ${y + q * 0.7}Z`, '#e3cfc0'),
    stroke(`M${x - q * 0.3} ${y - q * 0.2}l${-q * 0.14} ${q * 0.7}M${x + q * 0.3} ${y - q * 0.2}l${q * 0.14} ${q * 0.7}`, { w: W_DETAIL - 1 }),
    el('ellipse', { cx: x, cy: y - q * 0.74, rx: q * 0.38, ry: q * 0.2, fill: INK }),
  ]);
  body.push(barnacle(390, 602, 24, -8), barnacle(434, 612, 18, 6), barnacle(646, 452, 22, 10), barnacle(618, 476, 16, -8), barnacle(606, 208, 20, 8));
  s.add(2, g({ filter: s.wobble(5) }, g({ transform: 'translate(0 30)' }, body)));

  // ---- 3: the shallows in front of his feet, foam, sparks off the core

  const foam = (x, y) => {
    const ds = [[-60, 2, 20], [-24, -8, 28], [20, -6, 25], [58, 4, 19]].map(([dx, dy, q]) => circ(x + dx, y + dy, q)).concat([rr(x - 84, y - 6, 168, 36, 18)]);
    return g({}, [contour(ds, W_DETAIL), ...ds.map((d) => flat(d, '#ffffff')), stroke(`M${x - 34} ${y + 2}q10 -12 22 -4M${x + 14} ${y + 4}q10 -12 22 -4`, { w: W_DETAIL })]);
  };
  s.add(3, foam(446, 804), foam(578, 806));
  s.add(3, ink(waveBand(1024, 1024, 812, 8, 5, 0.6), '#4a3b93', { w: W_INNER }));
  s.add(3, flat(waveBand(1024, 1024, 900, 10, 4, 2), '#382d7c'));
  s.add(3, bar(230, 850, 180, 12, '#7f66c4'), bar(800, 846, 200, 12, '#7f66c4'), bar(520, 884, 240, 12, '#6a55b4'));
  s.add(3, star4(404, 148, 26, '#bff3ff'), star4(300, 300, 18, '#ffffff'), star4(736, 500, 24, '#bff3ff'), star4(244, 470, 14, '#fff3c4'));
  s.specks({ n: 14, y0: 120, y1: 700, rmin: 3, rmax: 6, colors: ['#bff3ff', '#fff3c4', '#ffffff'], opacity: 0.9 });
}
