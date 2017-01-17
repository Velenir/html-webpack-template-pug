# HTML Webpack Template Pug
[![Build Status](https://travis-ci.org/Velenir/html-webpack-template-pug.svg?branch=master)](https://travis-ci.org/Velenir/html-webpack-template-pug)
[![npm version](https://badge.fury.io/js/html-webpack-template-pug.svg)](https://badge.fury.io/js/html-webpack-template-pug)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![devDependencies](https://david-dm.org/velenir/html-webpack-template-pug/dev-status.svg)](https://david-dm.org/velenir/html-webpack-template-pug?type=dev)
[![peerDependencies](https://david-dm.org/velenir/html-webpack-template-pug/peer-status.svg)](https://david-dm.org/velenir/html-webpack-template-pug?type=peer)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/velenir/html-webpack-template-pug/blob/master/LICENSE)

This is a [Pug](https://pugjs.org/) template for the [webpack](http://webpack.github.io/) plugin [html-webpack-plugin](https://www.npmjs.com/package/html-webpack-plugin). Inspired by another template, [html-webpack-template](https://github.com/jaketrent/html-webpack-template).

In addition to the options that should cover most needs of a single-page app, a custom Pug file can be used to extend the provided **layout.pug** or to completely rewrite the template while utilizing mixins from **mixins.pug**.

Loading the template requires that [pug-loader](https://github.com/pugjs/pug-loader) and consequently [pug](https://github.com/pugjs/pug) be available in node_modules.

## Installation

Install the template with npm:

```shell
npm install html-webpack-template-pug --save-dev
```

or together with peer dependencies:

```shell
npm install pug pug-loader html-webpack-plugin html-webpack-template-pug --save-dev
```

## Basic Usage

Required parameters, to be passed to `new HtmlWebpackPlugin(options)` as properties on `options`:

- `inject: false` -- Disables resource injection by **html-webpack-plugin**
- `template`: provided `layout.pug` or a custom `*.pug` file.

**Pug-loader** should either be set for all `*.pug` files:

```javascript
module: {
  loaders: [
    //...
    {
      test: /\.pug$/,
      loader: 'pug-loader'
    }
  ]
}
```
or explicitly together with the template:

```javascript
template: '!!pug-loader!custom_template.pug'
```

Optional parameters:
- `appMountId: String or [String,...]` -- Id or an array of ids for the `<div>` elements to be included in the `<body>`, for mounting JavaScript app, etc.
- `mobile: Boolean = false` -- Adds a meta tag for viewport size and page scaling on mobile.
- `inline: String or [String,...]` -- A chunk name or an array of chunk names to be inlined. A chunk name corresponds to the name of the entry point and can include `:css` or `:js` postfix to limit resources to be inlined to CSS or JavaScript respectively.
- `excludeJSWithCSS: Boolean = false` -- Excludes JavaScript files from chunks that contain CSS files. Intended for use cases when a JavaScript file (e.g `style.js`) is created as a byproduct of a CSS-only entry chunk (`entry: {style: 'main.css'}`).
- `excludeJSChunks: String or [String,...]` -- A chunk name or an array of chunk names. Excludes JavaScript files from specific chunks. Intended for use cases when a JavaScript file (e.g `style.js`) is created as a byproduct of a CSS-only entry chunk (`entry: {style: 'main.css'}`).
- `injectExtras.head: [tag,...]` -- An array of Objects representing **tags** to be injected in `<head>`. A tag can be:
  + A String ending with **".css"**. Then the injected **tag** becomes `<link rel="stylesheet" href=tag>`.
  + A String ending with **".js"**. Then the injected **tag** becomes `<script src=tag></script>`.
  + An object with one required property **tag** that will serve as the tag name. All other properties will be set on the injected **tag** as its attributes. **innerHTML** property, if set, will be passed as content to non-self-closing **tags**.
  + To give an example:
	
    ```javascript
    {
      tag: "meta",
      name: "description",
      content: "A description of the page"
    }
    ```
		
    becomes    
		
    ```html
    <meta name="description" content="A description of the page">
    ```
		
- `injectExtras.body: [tag,...]` -- Same as `injectExtras.head` but to be injected at the bottom of the `<body>`.


And other options from [html-webpack-plugin#configuration](https://github.com/ampedandwired/html-webpack-plugin#configuration).

### Example of basic usage

An example of webpack configuration utilizing the options above:

```javascript
{
  // ...
  plugins: [
    new HtmlWebpackPlugin({
      // Required
      inject: false,
      template: require('html-webpack-template-pug'),
      // template: '!!pug-loader!node_modules/html-webpack-template-pug/layout.pug'
      
      // Optional
      appMountId: 'app',
      // appMountId: ['app1', 'app2']
      mobile: true,
      injectExtras: {
        head: [
          "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css",
          {
            tag: 'link',
            rel: 'dns-prefetch',
            href: '//example.com/'
          },
          {
            tag: 'base',
            href: '../assets/page.html'
          },
          {
            tag: 'meta',
            name: 'description',
            content: 'A description of the page'
          }
        ],
        body: [
          'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.0/jquery.min.js',
          'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/js/bootstrap.min.js',
          {
            tag: 'noscript',
            innerHTML: "JavaScript is disabled in your browser. <a href='http://www.enable-javascript.com/' target='_blank'>Here</a> is how to enable it."
          }
        ]
      },
      title: 'My App'
      // Other html-webpack-plugin options...
    })
  ]
}
```
---
An example of webpack configuration with extracting a CSS-only entry chunk:

```javascript
{
  entry: {
		app: './app',
		style: './app/main.css'
	},
	output: {
		path: './build',
		filename: '[name].js'
	},
	module: {
		loaders: [
      // ...
			{
				test: /\.css$/,
				loader: ExtractTextPlugin.extract('style', 'css')
			}
		]
	},
  // ...
  plugins: [
    new HtmlWebpackPlugin({
      // Required
      inject: false,
      template: require('html-webpack-template-pug'),
      // template: '!!pug-loader!node_modules/html-webpack-template-pug/layout.pug'
      
      // Optional
      excludeJSChunks: 'style',	// don't include specific chunks in scripts (when .js is a byproduct of an already extracted .css)
			// excludeJSChunks: ['style1', 'style2']
      appMountId: 'app',
      mobile: true,
      title: 'My App'
      // Other html-webpack-plugin options...
    }),
    new ExtractTextPlugin('[name].css')
  ]
}
```

## Intermediate Usage

The **layout.pug** that is used by default with `require('html-webpack-template-pug')` amounts to the following:

```pug
include ./mixins.pug

doctype html
html(lang='en', manifest=htmlWebpackPlugin.files.manifest)
	head
		meta(charset='utf-8')
		meta(http-equiv='X-UA-Compatible', content='IE=edge')
		
		block defaultHead
			+mobile
			+title
			+favicon
			+injectExtrasHead
			+CSS

		block head

	body

		block content
			+appMount
			
		block defaultBody
			+injectExtrasBody
			+JS
			
		block scripts
```

And can be extended like any other **.pug** template:

```pug
//- index.pug
//- include/extends ~%PATH% resolves to node_modules/%PATH%
extends ~html-webpack-template-pug/layout.pug

block head
	link(rel="stylesheet", href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css")

block content
	header
		h2 Header
	
	main
		+appMount
	
	footer
		h2 Footer

block scripts
	script(src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.0/jquery.min.js")
	script(src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/js/bootstrap.min.js")
```

### Example of intermediate usage

An example of webpack configuration with a custom template extending the default:

```javascript
{
  // ...
  plugins: [
    new HtmlWebpackPlugin({
      // Required
      inject: false,
      template: '!!pug-loader!index.pug',      
      // Optional
      appMountId: 'app',
      mobile: true,
      title: 'My App'
      // Other options...
    })
  ]
}
```

## Advanced usage

For more flexibility it is possible to directly include **mixins.pug** and then construct a custom template.

Available mixins are:

- `title`

	Adds title, to be used in `<head>`.

- `favicon`

	Adds favicon, to be used in `<head>`.

- `mobile`

	Adds mobile meta tag, to be used in `<head>`.

- `appMount(ids)`

	Adds a div tag for each supplied id  
	`@ids` can be an Array or a single id, if none supplied uses **appMountId**;  
	also accepts attributes to be added to div tags, `+appMount("id")(class="mount-point")`.

- `injectExtrasHead`

	Injects extra resources passed in `injectExtras.head` of `htmlWebpackPlugin.options`.

- `injectExtrasBody`

	Injects extra resources passed in `injectExtras.body` of `htmlWebpackPlugin.options`.

- `inline(filename, tag, searchWithin)`

	Inlines a resource in a tag
	`@filename` is a string or a RegExp to be compared against files passed in **HtmlWebpackPlugin** (`htmlWebpackPlugin.files`);  
	`@tag` if not provided is deduced from file extension  
	`@searchWithin` -- array of filenames to match against RegExp `@filename`,  
	equals to [...css, ...js] from `htmlWebpackPlugin.files` by default;  
	also accepts attributes to be added to style/script tags, `+inline(...)(attributes)`.

- `inject(filename, tag, searchWithin)`

	Injects a resource in a tag
	`@filename` is a string or a RegExp to be compared against `htmlWebpackPlugin.files`;  
	`@tag` if not provided is deduced from file extension  
	`@searchWithin` -- array of filenames to match against RegExp `@filename`,  
	equals to [...css, ...js] from `htmlWebpackPlugin.files` by default;  
	also accepts attributes to be added to link/script tags, `+inject(...)(attributes)`.

- `inlineCSS(cssList)`

	Inlines css resources from `htmlWebpackPlugin.files`, except for already inlined or injected resources;  
	`@cssList` can be a single filename string, RegExp or an array of them,  
	`cssList` strings starting with **"!"** are skipped;  
	by default `cssList` -- all css files that are supposed to be inlined according to `htmlWebpackPlugin.options`;
  also accepts attributes to be added to style tags, `+inlineCSS(...)(attributes)`.

- `injectCSS(cssList)`

	Injects css resources from `htmlWebpackPlugin.files`, except for already inlined or injected resources;  
	`@cssList` can be a single filename string, RegExp or an array of them,  
	`cssList` strings starting with **"!"** are skipped;  
	by default `cssList` -- all css files that are supposed to be injected according to `htmlWebpackPlugin.options`;
  also accepts attributes to be added to link tags, `+injectCSS(...)(attributes)`.

- `inlineJS(jsList)`

	Inlines js resources from `htmlWebpackPlugin.files`, except for already inlined or injected resources;  
	`@jsList` can be a single filename string, RegExp or an array of them,  
	`jsList` strings starting with **"!"** are skipped;  
	by default `jsList` -- all js files that are supposed to be inlined according to `htmlWebpackPlugin.options`;
  also accepts attributes to be added to script tags, `+inlineJS(...)(attributes)`.

- `injectJS(jsList)`

	Injects js resources from `htmlWebpackPlugin.files`, except for already inlined or injected resources;  
	`@jsList` can be a single filename string, RegExp or an array of them,  
	`jsList` strings starting with **"!"** are skipped;  
  by default `jsList` -- all js files that are supposed to be injected according to `htmlWebpackPlugin.options`;
  also accepts attributes to be added to script tags, `+injectJS(...)(attributes)`.

- `inlineChunk(chunkNames, type)`

	Inlines files of type `@type` from chunk with `@chunkName` name;  
	`@chunkName` - a valid chunk name from `htmlWebpackPlugin.files.chunks` or an array of names,  
	`@type` - can be **"css"** or **"js"**, which inlines css or js files respectively, otherwise inlines both types;
  also accepts attributes to be added to style/script tags, `+inlineChunk(...)(attributes)`.

- `injectChunk(chunkNames, type)`

	Injects files of type `@type` from chunk with `@chunkName` name;  
	`@chunkName` - a valid chunk name from `htmlWebpackPlugin.files.chunks` or an array of names,  
	`@type` - can be **"css"** or **"js"**, which injects css or js files respectively, otherwise injects both types;
  also accepts attributes to be added to link/script tags, `+injectChunk(...)(attributes)`.

- `CSS`

	Inlines css resources from chunks passed in `htmlWebpackPlugin.options.inline`  
  and injects the rest, in the order they appear `htmlWebpackPlugin.files`;
  also accepts attributes to be added to link/style tags, `+CSS(...)(attributes)`.

- `JS`

	Inlines js resources from chunks passed in `htmlWebpackPlugin.options.inline`  
  and injects the rest, in the order they appear `htmlWebpackPlugin.files`;
  also accepts attributes to be added to script tags, `+JS(...)(attributes)`.



`inline*`, `inject*`, `CSS` and `JS` mixins keep track of inlined and injected files, so no one file will appear twice. This allows for:

```pug
+inlineCSS("style.css")
//- style.css

//- ...

//- the rest
+CSS
```

However, `inline` and `inject` mixins allow duplicates.

To clarify usage of different parameters in `inlineCSS`, `injectCSS`, `inlineJS` and `injectJS`:

```pug
+inlineCSS
//- inlines all css resources passed in HtmlWebpackPlugin (htmlWebpackPlugin.files.css)

+inlineCSS("style.css")
//- inlines style.css

+inlineCSS(/\.css$/)
//- inlines all /\.css$/ matches in htmlWebpackPlugin.files.css

+inlineCSS("!style.css")
//- inlines all resources from htmlWebpackPlugin.files.css except for style.css

+inlineCSS(["style1.css", "style2.css"])
//- inlines style1.css and style2.css

+inlineCSS([/\.css$/, "!style2.css"])
//- inlines all /\.css$/ matches except for style2.css

+inlineCSS(["!style1.css", "!style2.css"])
//- inlines all resources from htmlWebpackPlugin.files.css except for style1.css and style2.css
```

A custom template can then look like this:

```pug
//- index.pug
//- include/extends ~%PATH% resolves to node_modules/%PATH%
include ~html-webpack-template-pug/mixins.pug

doctype html
html(lang='en')
	head
		meta(charset='utf-8')
		meta(http-equiv='X-UA-Compatible', content='IE=edge')
		base(href="../assets/page.html")
		
		+mobile
		+title
		//- injects all .css files
		+inject(/\.css$/)


	body
	
		+appMount
			
		//- injects all .js files
		+inject(/\.js$/)
```

### Example of advanced usage

An example of webpack configuration with a custom template including the default mixins:

```javascript
{
  // ...
  plugins: [
    new HtmlWebpackPlugin({
      // Required
      inject: false,
      template: '!!pug-loader!index.pug',      
      // Optional
      appMountId: 'app',
      mobile: true,
      title: 'My App'
      // Other options...
    })
  ]
}
```

# License

This software is licensed under [MIT](https://github.com/velenir/html-webpack-template-pug/blob/master/LICENSE).
