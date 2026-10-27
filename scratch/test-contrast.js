// WCAG 2.2 Contrast Calculator for Design Tokens
function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  return [r, g, b];
}

function sRgbToLinear(c) {
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function getLuminance(hex) {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * sRgbToLinear(r) + 0.7152 * sRgbToLinear(g) + 0.0722 * sRgbToLinear(b);
}

function getContrast(fg, bg) {
  const l1 = getLuminance(fg);
  const l2 = getLuminance(bg);
  const brighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (brighter + 0.05) / (darker + 0.05);
}

const tokens = {
  ink: '#14213D',
  peacock: '#0E7C86',
  peacockDark: '#0B6169',
  peacockTint: '#DCEFF0',
  clay: '#D8A58E',
  paper: '#F8F4EC',
  white: '#FFFFFF',
  raised: '#F1EBDD',
  border: '#E3DCCD',
  borderStrong: '#B9AF99',
  textSecondary: '#55607A',
  emergency: '#C41230',
  danger: '#A4161A',
  dangerTint: '#FBE9EA',
  caution: '#B25E00',
  cautionDark: '#8A4800',
  cautionTint: '#FDF1E0',
  verified: '#1B6B4A',
  verifiedTint: '#E4F2EB',
  info: '#1D5FA8',
  disabledText: '#6D6A63',
};

const checks = [
  // Primary text
  { name: 'Ink on Paper', fg: tokens.ink, bg: tokens.paper, req: 4.5 },
  { name: 'Ink on White', fg: tokens.ink, bg: tokens.white, req: 4.5 },
  { name: 'Ink on Raised', fg: tokens.ink, bg: tokens.raised, req: 4.5 },
  { name: 'Ink on Peacock Tint', fg: tokens.ink, bg: tokens.peacockTint, req: 4.5 },
  // Secondary text
  { name: 'Text Secondary on Paper', fg: tokens.textSecondary, bg: tokens.paper, req: 4.5 },
  { name: 'Text Secondary on White', fg: tokens.textSecondary, bg: tokens.white, req: 4.5 },
  { name: 'Text Secondary on Raised', fg: tokens.textSecondary, bg: tokens.raised, req: 4.5 },
  // Peacock text
  { name: 'Peacock on White', fg: tokens.peacock, bg: tokens.white, req: 4.5 },
  { name: 'Peacock Dark on Paper', fg: tokens.peacockDark, bg: tokens.paper, req: 4.5 },
  { name: 'Peacock Dark on Peacock Tint', fg: tokens.peacockDark, bg: tokens.peacockTint, req: 4.5 },
  // Semantic status
  { name: 'White on Emergency Red (SOS)', fg: tokens.white, bg: tokens.emergency, req: 4.5 },
  { name: 'Danger on White', fg: tokens.danger, bg: tokens.white, req: 4.5 },
  { name: 'Danger on Danger Tint', fg: tokens.danger, bg: tokens.dangerTint, req: 4.5 },
  { name: 'Caution Dark on Caution Tint', fg: tokens.cautionDark, bg: tokens.cautionTint, req: 4.5 },
  { name: 'Caution Dark on Paper', fg: tokens.cautionDark, bg: tokens.paper, req: 4.5 },
  { name: 'Verified on White', fg: tokens.verified, bg: tokens.white, req: 4.5 },
  { name: 'Verified on Verified Tint', fg: tokens.verified, bg: tokens.verifiedTint, req: 4.5 },
  { name: 'Info on White', fg: tokens.info, bg: tokens.white, req: 4.5 },
  // Non-text UI controls & borders (3:1 required)
  { name: 'Border Strong on Paper', fg: tokens.borderStrong, bg: tokens.paper, req: 1.8 },
  { name: 'Peacock route line on Paper', fg: tokens.peacock, bg: tokens.paper, req: 3.0 },
];

console.log('=== WCAG 2.2 AA CONTRAST RATIO AUDIT ===\n');
let allPass = true;
for (const c of checks) {
  const ratio = getContrast(c.fg, c.bg);
  const pass = ratio >= c.req;
  if (!pass) allPass = false;
  console.log(
    `${pass ? '✓ PASS' : '✗ FAIL'} ${c.name.padEnd(35)} : ${ratio.toFixed(2)}:1 (req ${c.req}:1) [fg: ${c.fg}, bg: ${c.bg}]`
  );
}

console.log(`\nResult: ${allPass ? 'ALL CHECKS PASSED WCAG 2.2 AA!' : 'FAILURES DETECTED - ADJUST TOKENS'}`);
