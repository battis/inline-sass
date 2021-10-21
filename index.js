import fs from "fs";
import path from "path";
import { parse } from "node-html-parser";
import sass from "sass";
import inlineCSS from "inline-css";

const defaults = {
	devEltSelector: '[data-purpose="dev"]'
};

const inlineSass = async (path_or_html, options) => {
	
	options = {...defaults, ...options};
	
	const removeDevElements = (dom, selector) => {
		for(const elt of dom.querySelectorAll(selector)) {
			elt.remove();
		}
		return dom;
	}
	
	const embedTranspiledLinkedSass = (dom, base) => {
		const links = dom.querySelectorAll('link[rel="stylesheet"][href$="css"]');
		for(const link of links) {
			let file = link._attrs.href;
			if (base) {
				file = path.join(base, file);
			}
			const css = sass.renderSync({file}).css;
			dom.insertAdjacentHTML('afterbegin', '<style>\n' + String(css) + '\n</style>');
			link.remove();
		}
		return dom;
	};
	
	let html = path_or_html;
	let dir = undefined;
	if (fs.existsSync(path_or_html)) {
		html = fs.readFileSync(path_or_html);	
		dir = path.dirname(path_or_html);	
	}
	let dom = parse(html);
	
	if (!dom) {
		if (isPath) {
			throw 'file "' + path_or_html + '" unparseable';
		} else {
			throw '"' + path_or_html + '" not HTML';
		}
	}
	
	if (options.devEltSelector) {
		dom = removeDevElements(dom, options.devEltSelector);
	}
	
	dom = embedTranspiledLinkedSass(dom, dir);
	
	
	let result = undefined;
	try {
		result = await inlineCSS(String(dom), {url: dir, ...options});
	} catch (e) {
		console.log(e);
	}
	return result;
}

export default inlineSass;