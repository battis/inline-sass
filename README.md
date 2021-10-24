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
    <link rel="stylesheet" href="sass.scss" />
  </head>
  <body>
    <div id="ex">Hello world</div>
  </body>
</html>
```

`sass.scss`:

```scss
#ex {
  color: red;
}
```

```javascript
import inlineSass from 'inline-sass';

inlineSass('/path/to/file.html')
  .then(result => console.log(String(result)))
  .catch(console.error);
```

Console:

```
<!DOCTYPE html>
<html>
  <head>
    <title>Example</title>
  </head>
  <body>
    <div id="ex" style="color: red;">Hello world</div>
  </body>
</html>
```

## API

Passes through all arguments to [inline-css](https://github.com/jonkemp/inline-css#api). Plus:

### deleteTempDir

Type: `boolean`<br>
Default: `true`

Whether or not to delete the temporary directory of transpiled CSS.

## How it works

inline-sass transpiles any linked `.sass` or `.scss` files into a temporary directory, re-writing the `<link>` tags in the HTML to refer to the temporary `.css` files (but storing the original href in the `data-original-href` attribute). At the end of the run, the temporary directory is deleted. Unless overridden by another value, the directory containing the HTML file will be passed as the `url` option to inline-css.

It is also possible to pass literal HTML as the first argument to inline-sass, in which case the options object _must_ contain an [`url`](https://www.npmjs.com/package/inline-css#optionsurl) value to act as a basepath for any relative references in the `<link>` tags:

```javascript
import inlineSass from `inline-sass`;

inlineSass(
  `<html>
    <head
      <title>Literal HTML</title>
      <link rel="stylesheet" href="styles/sass.scss"/>
    </head>
    <body>
      <div id="ex">Hello World</div>
    </body>
  </html>`,
  'file:///path/to/my'
)
  .then(result => console.log(String(result)))
  .catch(console.error);
```

In this case, Sass would attempt to transpile the file `/path/to/my/styles/sass.scss`. A concrete example of this approach can be found in [@battis/inline-sass-to-clipboard](https://github.com/battis/inline-sass-to-clipboard/blob/054ef93260f05192071fff5f41374280179aa669/index.js#L38-L68).
