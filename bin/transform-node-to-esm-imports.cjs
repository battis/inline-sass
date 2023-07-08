#!/usr/bin/env node
const shell = require('shelljs');
const path = require('path');
const { jack } = require('jackspeak');

const j = jack()
  .opt({
    src: {
      short: 's',
      description: 'Source directory of Typescript files',
      default: 'src'
    },
    target: {
      short: 't',
      description: 'Target directory of compiles ES6 files',
      default: 'dist'
    }
  })
  .flag({ help: { short: 'h', description: 'Usage' } });
const { values: opt } = j.parse();
if (opt.help) {
  console.log(j.usage());
  process.exit(0);
}
opt.src.replace(/\/$/, '');
opt.target.replace(/\/$/, '');

process.chdir(path.join(__dirname, '..'));

const src = Array.from(shell.find(path.join(opt.src, '**/*.ts')))
  .map((s) => s.replace(opt.src, '').replace('.ts', ''))
  .map((s) => `${path.join(opt.target, s)}.mjs`)
  .filter((s) => s.length > 0);

function relativePath(from, to) {
  const base = path.relative(
    path.dirname(path.join(process.cwd(), from)),
    path.join(process.cwd(), to)
  );
  if (/\.\.\//.test(base)) {
    return base;
  }
  return `./${base}`;
}

shell.find(path.join(opt.target, '**/*.js')).forEach((file) => {
  src.forEach((s) => {
    let replacement = relativePath(file, s);
    let target = replacement.replace(/(\/index)?\.mjs$/, '');
    const pattern = `(import .* from ['"])${target}(['"])`;
    replacement = `$1${replacement}$2`;
    shell.sed('-i', pattern, replacement, file);
  });
  shell.mv(file, file.replace(/.js$/, '.mjs'));
});
