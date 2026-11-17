const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}
for (const directory of ['src', 'scripts', 'tests']) {
  for (const file of walk(path.join(root, directory)).filter((file) =>
    /\.(?:js|cjs)$/.test(file),
  )) {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
  }
}
for (const name of ['index.html', 'flow-review.html', 'workflow.html', 'design-system.html']) {
  const html = fs.readFileSync(path.join(root, name), 'utf8');
  if (/<style\b|<script(?![^>]*\bsrc=)|\son\w+=|\sstyle=/i.test(html)) {
    throw new Error(`${name}: use external CSS/JavaScript instead of inline code`);
  }
  for (const [, reference] of html.matchAll(/(?:src|href)="(src\/[^"#]+)"/g)) {
    if (!fs.existsSync(path.join(root, reference)))
      throw new Error(`${name}: missing ${reference}`);
  }
}
console.log('Syntax and external asset references passed.');
