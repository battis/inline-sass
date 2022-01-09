import os from 'os';
import fs from 'fs';
import path from 'path';
import { parse } from 'node-html-parser';
import sass from 'sass';
import inlineCSS from 'inline-css';

const defaults = {
    deleteTempDir: true
};

const inlineSass = async (path_or_html, options) => {
    options = { ...defaults, ...options };
    let html = path_or_html;
    let dir =
        options.url.search(/^file:\/\//) === 0
            ? options.url.replace(/^file:\/\//, '')
            : undefined;
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'css-'));

    const transpileSass = (dom, base) => {
        const links = dom.querySelectorAll(
            'link[href$=".sass"],link[href$=".scss"]'
        );
        for (const link of links) {
            const href = link.getAttribute('href');
            let sassFile = href;
            if (base) {
                sassFile = path.join(base, sassFile);
            }
            let cssFile = path.join(
                tmp,
                path.basename(path.basename(href, '.sass'), '.scss') + '.css'
            );
            fs.writeFileSync(cssFile, sass.renderSync({ file: sassFile }).css);
            link.setAttribute('href', `file://${cssFile}`);
            link.setAttribute('data-original-href', href);
        }
        return dom;
    };

    if (fs.existsSync(path_or_html)) {
        html = fs.readFileSync(path_or_html);
        dir = path.dirname(path_or_html);
    }
    let dom = parse(html);

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
        result = await inlineCSS(String(dom), {
            url: `file://${dir}/`,
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
};

export default inlineSass;
