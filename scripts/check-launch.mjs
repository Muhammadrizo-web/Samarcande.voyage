// Vérifie qu'il ne reste aucune donnée provisoire avant un build de production.
import fs from 'node:fs';

const site = fs.readFileSync('src/content/site.ts', 'utf8');
const tour = fs.readFileSync('src/content/tour.ts', 'utf8');
const problems = [];

if (/000 00 00|000000000/.test(site)) problems.push('Téléphone / WhatsApp provisoires dans src/content/site.ts');
if (/street: ''/.test(site)) problems.push('Adresse du bureau vide (SITE.address.street)');
if (/legalName: ''/.test(site)) problems.push('Raison sociale vide (SITE.legalName) — requise pour les mentions légales');
if (!/DEPARTURES[\s\S]*20(2[7-9]|3\d)-/.test(tour)) problems.push('Aucun départ 2027 ou plus dans src/content/tour.ts');
for (const l of ['fr', 'en', 'ru', 'de']) {
  const d = fs.readFileSync(`src/i18n/${l}.ts`, 'utf8');
  const n = (d.match(/\[[^\]]*(À COMPLÉTER|to be completed|заполнить|ergänzen|raison sociale|company name|наименование|Firmenname|INN|numéro|number|номер|Nummer)[^\]]*\]/gi) || []).length;
  if (n) problems.push(`${n} passage(s) juridiques entre crochets à compléter dans src/i18n/${l}.ts`);
}

if (problems.length) {
  console.error('\n✗ Mise en ligne bloquée — à compléter :\n' + problems.map((p) => '  • ' + p).join('\n') + '\n');
  process.exit(1);
}
console.log('✓ Prêt pour la production');
