
# Inline Sass

[![npm version](https://badge.fury.io/js/inline-sass.svg)](https://badge.fury.io/js/inline-sass)

Inline Sass stylesheets into HTML style attributes &mdash; useful in emails and other lo-fi HTML authoring situations.

_A thin wrapper for [inline-css](https://github.com/jonkemp/inline-css) and [Sass](https://github.com/sass/dart-sass)._

## Use

`file.html`:
```html
<!DOCTYPE html>
<html>
	<head>
		<title>Example</title>
		<link rel="stylesheet" href="sass.scss"/>
	</head>
	<body>
		<div id="ex">Hello world</div>
	</body>
</html>
```

`sass.scss`:
```scss
#id {
	color: red;
}
```

```javascript
import inlineSass from "inline-sass";

const filePath = '/path/to/file.html';
inlineSass(filePath, {extractInnerHTMLSelector: 'body'})
  .then(result => console.log(String(result)));
```

Console:

```
<div id="ex" style="color: red">Hello world</div>
```

## API

Passes through all arguments to [inline-css](https://github.com/jonkemp/inline-css#api) with one additional option:

#### extractInnerHTMLSelector
Type: `string`<br>
Default: `undefined`

Selector for an element whose inner HTML should be returned as the result. (useful when building HTML in an environment that expects a valid HTML document, but you only need the, say.... `<body>`)

## How it works

`inline-sass` transpiles any linked `.?css` files and replaces the `<link>` elements with inline `<style>` elements, then runs `inline-css` on the resulting HTML. Right now, this approach is quickly hacked together, and vulnerable to oddities if, for example, you do _not_ want `<link>` or `<style>` elements removed from the resulting HTML.