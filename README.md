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

const filePath = '/path/to/file.html';
inlineSass(filePath, { extractInnerHTMLSelector: 'body' }).then(result =>
  console.log(String(result))
);
```

Console:

```
<div id="ex" style="color: red">Hello world</div>
```

## API

Passes through all arguments to [inline-css](https://github.com/jonkemp/inline-css#api), with one caveat:
