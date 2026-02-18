const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const FILES = [
  'assets/quotes/pt-br/advent.json',
  'assets/quotes/pt-br/lent.json',
  'assets/quotes/pt-br/christmas.json',
  'assets/quotes/pt-br/easter.json',
  'src/presentation/settings/settings.html',
  'src/presentation/settings/settings.controller.ts',
  'src/presentation/liturgy-reminder/liturgyReminder.html',
  'src/presentation/liturgy-reminder/liturgyReminder.controller.ts',
  'src/presentation/popup/popup.html',
  'src/presentation/angelus/angelus.html',
  'src/presentation/regina-caeli/reginaCaeli.html',
  'src/main/bootstrap/TrayManager.ts',
  'src/main/main.ts',
];

const FORBIDDEN_TOKENS = [
  'Configuracoes',
  'configuracoes',
  'Duracao',
  'duracao',
  'Vesperas',
  'oficio',
  'Conversao',
  'conversao',
  'coracao',
  'Misericordia',
  'Ressurreicao',
  'Encarnacao',
  'Adoracao',
  'Nacoes',
  'Reconciliacao',
  'Acao',
  'acao de gracas',
  'Pascoa',
  'oracao',
  'distracao',
  'esperanca',
  'provacao',
  'salvacao',
  'apostolica',
  'Espirito',
  'Nao ',
  ' nao ',
  'Terca-feira',
  'Sabado',
];

const failures = [];

for (const relFile of FILES) {
  const fullPath = path.join(ROOT, relFile);
  if (!fs.existsSync(fullPath)) {
    failures.push(`${relFile}: missing file`);
    continue;
  }

  const text = fs.readFileSync(fullPath, 'utf8');
  for (const token of FORBIDDEN_TOKENS) {
    if (text.includes(token)) {
      failures.push(`${relFile}: contains "${token}"`);
    }
  }
}

if (failures.length > 0) {
  console.error('PT-BR text validation failed:');
  failures.forEach((line) => console.error(`- ${line}`));
  process.exit(1);
}

console.log('PT-BR text validation passed.');
