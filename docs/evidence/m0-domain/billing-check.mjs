// M0 hand-calculation check for the three mandatory bills (Roadmap §3.4).
// Integer minor units (cents) only. Run: node docs/evidence/m0-domain/billing-check.mjs
// It prints each bill line by line, writes billing-spreadsheet.csv next to itself,
// and exits non-zero if any total differs from the expected value.
// This is a domain-discovery aid, not production code: tariff values belong in data from M5 on.
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Residential tariff, version 2026-01. Amounts in cents; percentages in basis points.
const TARIFF = {
  version: 'RES-2026-01',
  minimumCharge: 25000, // covers the first 10 m3
  minimumCoversM3: 10,
  blocks: [
    { from: 11, to: 20, rate: 3000 },
    { from: 21, to: 30, rate: 3500 },
    { from: 31, to: 40, rate: 4200 },
    { from: 41, to: Infinity, rate: 5000 },
  ],
  environmentalFeeBp: 1000, // 10% of basic charge
  maintenanceFeeHalfInch: 1500,
  vatBp: 1200, // 12% of (basic + fees)
  penaltyBp: 1000, // 10% of overdue amount, once
};

// Half-up rounding of amount x basisPoints / 10000, for non-negative amounts.
const pct = (amount, bp) => Math.floor((amount * bp + 5000) / 10000);
const fmt = (cents) => (cents / 100).toFixed(2);

function bill({ name, consumptionM3, overdueArrears }) {
  const lines = [];
  const add = (line, calc, amount, kind = 'line') => lines.push({ line, calc, amount, kind });

  add(`Minimum charge (first ${TARIFF.minimumCoversM3} m3)`, 'flat', TARIFF.minimumCharge);
  let basic = TARIFF.minimumCharge;
  for (const b of TARIFF.blocks) {
    const used = Math.max(0, Math.min(consumptionM3, b.to) - b.from + 1);
    if (used === 0) continue;
    const top = Math.min(consumptionM3, b.to);
    const amount = used * b.rate;
    add(`Block ${b.from}-${top} m3`, `${used} m3 x ${fmt(b.rate)}`, amount);
    basic += amount;
  }
  add('Basic charge', 'minimum + blocks', basic, 'subtotal');

  const env = pct(basic, TARIFF.environmentalFeeBp);
  add('Environmental fee', `10% x ${fmt(basic)}`, env);
  add('Meter maintenance fee (1/2")', 'flat', TARIFF.maintenanceFeeHalfInch);
  const subtotal = basic + env + TARIFF.maintenanceFeeHalfInch;
  add('Subtotal (basic + fees)', 'basic + env + maintenance', subtotal, 'subtotal');

  const vatExact = (subtotal * TARIFF.vatBp) / 10000 / 100;
  const vat = pct(subtotal, TARIFF.vatBp);
  add('VAT', `12% x ${fmt(subtotal)} = ${vatExact.toFixed(3)} -> half-up`, vat);
  const current = subtotal + vat;
  add('Current charges', 'subtotal + VAT', current, 'subtotal');

  let total = current;
  if (overdueArrears > 0) {
    add('Arrears (previous unpaid bill)', 'carried forward from ledger', overdueArrears);
    const penalty = pct(overdueArrears, TARIFF.penaltyBp);
    add('Late payment penalty', `10% x ${fmt(overdueArrears)}, once`, penalty);
    total += overdueArrears + penalty;
  }
  add('TOTAL AMOUNT DUE', '', total, 'total');
  return { name, consumptionM3, lines, total };
}

const CASES = [
  { name: 'A: 37 m3 + 500.00 overdue arrears (RES-001-0042)', consumptionM3: 37, overdueArrears: 50000, expected: 203781 },
  { name: 'B: 6 m3, no arrears (minimum charge only)', consumptionM3: 6, overdueArrears: 0, expected: 32480 },
  { name: 'C: 55 m3, no arrears', consumptionM3: 55, overdueArrears: 0, expected: 256704 },
];

const csv = [['case', 'consumption_m3', 'line', 'calculation', 'amount', 'amount_minor_units'].join(',')];
let failures = 0;
for (const c of CASES) {
  const b = bill(c);
  console.log(`\n${b.name}`);
  for (const l of b.lines) {
    console.log(`  ${l.line.padEnd(34)} ${l.calc.padEnd(40)} ${fmt(l.amount).padStart(10)}`);
    csv.push([c.name, c.consumptionM3, l.line, l.calc, fmt(l.amount), l.amount].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','));
  }
  const ok = b.total === c.expected;
  if (!ok) failures++;
  console.log(`  expected ${fmt(c.expected)} -> ${ok ? 'MATCH' : 'MISMATCH'}`);
  csv.push('');
}

csv.push('"Rules","","Order: basic -> environmental fee -> maintenance -> subtotal -> VAT -> current charges -> arrears -> penalty -> total","","",""');
csv.push('"Rounding","","Integer cents throughout; each percentage line (env fee, VAT, penalty) rounded half-up to the cent on its own","","",""');
csv.push('"Penalty","","Applied once by a billing job 3 days after the earlier bill\'s due date; shown on the next bill as its own line (assumption A-07)","","",""');

const out = join(dirname(fileURLToPath(import.meta.url)), 'billing-spreadsheet.csv');
writeFileSync(out, csv.join('\n') + '\n');
console.log(`\nWrote ${out}`);
if (failures) {
  console.error(`${failures} case(s) did not match`);
  process.exit(1);
}
console.log('All three totals match.');
