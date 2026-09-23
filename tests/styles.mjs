import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

// Guard against missing stylesheets when retiring or consolidating CSS.
for (const name of fs.readdirSync('site').filter(name => name.endsWith('.html'))) {
  const html = fs.readFileSync(path.join('site', name), 'utf8');
  const seen = new Set();
  for (const match of html.matchAll(/<link\b[^>]*href=["']([^"']+\.css(?:\?[^"']*)?)["'][^>]*>/g)) {
    const href = match[1].split('?')[0];
    if (/^https?:/.test(href)) continue;
    const file = path.resolve('site', href.replace(/^\//, ''));
    assert(fs.existsSync(file), name + ': missing stylesheet ' + href);
    assert(!seen.has(file), name + ': duplicate stylesheet ' + href);
    seen.add(file);
  }
}
console.log('Stylesheet references: all pages resolve without duplicate loads.');
