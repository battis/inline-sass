import fs from 'fs';
import InlineCSS from 'inline-css';
import { parse } from 'node-html-parser';
import os from 'os';
import path from 'path';
import sass from 'sass';

type InlineSassOptions = InlineCSS.Options & {
  deleteTempDir?: boolean;
};

const defaultOptions = {
  deleteTempDir: true
};

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'css-'));

function transpileSass(dom: HTMLElement, base: string) {
  const links = dom.querySelectorAll('link[href$=".sass"],link[href$=".scss"]');
  for (const link of links) {
    const href = link.getAttribute('href') as string;
    let sassFile = href;
    if (base) {
      sassFile = path.join(base, sassFile);
    }
    const cssFile = path.join(
      tmp,
      path.basename(path.basename(href, '.sass'), '.scss') + '.css'
    );
    fs.writeFileSync(cssFile, sass.compile(sassFile).css);
    link.setAttribute('href', `file://${cssFile}`);
    link.setAttribute('data-original-href', href);
  }
  return dom;
}

export default async function inlineSass(
  path_or_html: string,
  options: InlineSassOptions
) {
  options = { ...defaultOptions, ...options };
  let html = path_or_html;
  let dir =
    options.url.search(/^file:\/\//) === 0
      ? options.url.replace(/^file:\/\//, '')
      : undefined;

  if (fs.existsSync(path_or_html)) {
    html = fs.readFileSync(path_or_html).toString();
    dir = path.dirname(path_or_html);
  }
  let dom = parse(html) as unknown as HTMLElement;

  if (!dom) {
    if (dir) {
      throw 'file "' + path_or_html + '" unparseable';
    } else {
      throw '"' + path_or_html + '" not HTML';
    }
  }

  dom = transpileSass(dom, dir || options.url.replace(/(^\w+:\/\/)/, ''));

  let result = undefined;
  try {
    result = await InlineCSS(String(dom), {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      url: `file://${dir}/`, // sheesh eslint/ts (I know it could get over-written -- that's _the point_)
      ...options
    });
  } catch (e) {
    console.log(e);
  }

  if (options.deleteTempDir) {
    fs.rmSync(tmp, { recursive: true });
  } else {
    console.log(`Temp dir: ${tmp}`);
  }
  return result;
}
