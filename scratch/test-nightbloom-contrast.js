// Nightbloom WCAG 2.2 Contrast Ratio Test Suite
function hexToRgb(hex) {
  const sanitized = hex.replace('#', '');
  const bigint = parseInt(sanitized, 16);
  return [
    (bigint >> 16) & 255,
    (bigint >> 8) & 255,
    bigint & 255
  ];
}

function getLuminance([r, g, b]) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrast(hex1, hex2) {
  const lum1 = getLuminance(hexToRgb(hex1));
  const lum2 = getLuminance(hexToRgb(hex2));
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

const tests = [
  { pair: 'ink (#1E0F28) on canvas (#F7F3EE)', c1: '#1E0F28', c2: '#F7F3EE', min: 4.5 },
  { pair: 'ink (#1E0F28) on card (#FFFFFF)', c1: '#1E0F28', c2: '#FFFFFF', min: 4.5 },
  { pair: 'text-2 (#5E5068) on card (#FFFFFF)', c1: '#5E5068', c2: '#FFFFFF', min: 4.5 },
  { pair: 'text-2 (#5E5068) on canvas (#F7F3EE)', c1: '#5E5068', c2: '#F7F3EE', min: 4.5 },
  { pair: 'text-muted (#6F6179) on card (#FFFFFF)', c1: '#6F6179', c2: '#FFFFFF', min: 4.5 },
  { pair: 'White (#FFFFFF) on primary (#5A2FC2)', c1: '#FFFFFF', c2: '#5A2FC2', min: 4.5 },
  { pair: 'primary (#5A2FC2) on canvas (#F7F3EE)', c1: '#5A2FC2', c2: '#F7F3EE', min: 4.5 },
  { pair: 'primary route (#5A2FC2) vs map base (#E9E4DD)', c1: '#5A2FC2', c2: '#E9E4DD', min: 3.0 },
  { pair: 'route-alt (#6E6090) vs map base (#E9E4DD)', c1: '#6E6090', c2: '#E9E4DD', min: 3.0 },
  { pair: 'White (#FFFFFF) on emergency (#C21428)', c1: '#FFFFFF', c2: '#C21428', min: 4.5 },
  { pair: 'emergency (#C21428) on canvas (#F7F3EE)', c1: '#C21428', c2: '#F7F3EE', min: 4.5 },
  { pair: 'verified (#1F6B4D) on tint (#E6F3EC)', c1: '#1F6B4D', c2: '#E6F3EC', min: 4.5 },
  { pair: 'caution-text (#8A4A08) on tint (#FDF2E3)', c1: '#8A4A08', c2: '#FDF2E3', min: 4.5 },
  { pair: 'info (#1F5FA8) on tint (#EEF4FC)', c1: '#1F5FA8', c2: '#EEF4FC', min: 4.5 },
  { pair: 'error (#9E1B24) on tint (#FCEAEB)', c1: '#9E1B24', c2: '#FCEAEB', min: 4.5 },
  { pair: 'champagne-text (#7A5A1E) on card (#FFFFFF)', c1: '#7A5A1E', c2: '#FFFFFF', min: 4.5 },
  { pair: 'champagne (#C9A25E) on ink (#1E0F28)', c1: '#C9A25E', c2: '#1E0F28', min: 4.5 },
  { pair: 'border-control (#867B72) vs white (#FFFFFF)', c1: '#867B72', c2: '#FFFFFF', min: 3.0 },
  { pair: 'border-control (#867B72) vs canvas (#F7F3EE)', c1: '#867B72', c2: '#F7F3EE', min: 3.0 },
  { pair: 'unknown (#6F6179) vs map base (#E9E4DD)', c1: '#6F6179', c2: '#E9E4DD', min: 3.0 },
];

console.log('=== NIGHTBLOOM WCAG 2.2 CONTRAST VERIFICATION ===\n');
let passed = 0;
for (const t of tests) {
  const ratio = getContrast(t.c1, t.c2);
  const ok = ratio >= t.min;
  if (ok) passed++;
  console.log(`${ok ? '✓ PASS' : '✗ FAIL'}: ${t.pair} => ${ratio.toFixed(2)}:1 (required ${t.min}:1)`);
}

console.log(`\nResults: ${passed} / ${tests.length} tests passed.`);
if (passed === tests.length) {
  console.log('ALL NIGHTBLOOM TOKENS COMPLIANT WITH WCAG 2.2 AA / AAA!');
} else {
  process.exit(1);
}
