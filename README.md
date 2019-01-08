# Lazy Picture
[![Spec Custom Elements V1](https://img.shields.io/badge/spec-custom%20elements%20v1-F52757.svg?style=flat-square)](https://www.w3.org/TR/custom-elements/)
[![Build Status](https://img.shields.io/travis/nuclei/lazy-picture/master.svg?style=flat-square)](https://travis-ci.org/nuclei/lazy-picture) [![npm](https://img.shields.io/npm/v/@nuclei-components/lazy-picture.svg?style=flat-square)](https://www.npmjs.com/package/@nuclei-components/lazy-picture)
 [![npm](https://img.shields.io/npm/dt/@nuclei-components/lazy-picture.svg?style=flat-square)](https://www.npmjs.com/package/@nuclei-components/lazy-picture) [![license](https://img.shields.io/github/license/nuclei/lazy-picture.svg?style=flat-square)](https://github.com/nuclei/lazy-picture/blob/master/LICENSE)

## Installation
Simply install the lazy-picture component using npm.
```
$ npm i -S @nuclei-components/lazy-picture
```
## Usage
To use the webcomponent you need to load it into your page, either by bundling it into your js bundle or by simply loading it via a script tag.

```html
<script src="../dist/lazyPicture.js"></script>
```

As the support for webcomponents is already pretty good, if you need IE/Edge you will want to load a polyfill before loading the webcomponent.

I recommend the [webcomponentsjs](https://github.com/webcomponents/webcomponentsjs). To make sure the webcomponent is only loaded once the polyfill is done (when using the `webcomponents-loader.js`) you will want to wait for the `WebComponentsReady` event before loading the web component. This event is always fired, even in browser that fully support web components.

```html
<script type="text/javascript" async>
  window.addEventListener('WebComponentsReady', function () {
    let script = document.createElement('script')
    script.setAttribute('src', '../dist/lazyPicture.js')
    document.head.appendChild(script)
  })
</script>
```

### src
This is the default image source. When non of the `<source>` tags media queries fit, the browser will choose this image to display.

### alt
This is the alternative text that is added to the image in case it does not load or a user views this with a screen reader.

### Active
If `active` is set to true the image will be lazy-loaded immediately, even when not in view.

### Threshold
If you use the *load when in viewport* functionality, you can use the `threshold` property to define how much of the image needs to be visible in the viewport to trigger a load event. The default is `0`, so as soon as 1px of the the offset is in the viewport, the image will be loaded.

### Offset
The `offset` property defines at what distance from the visible viewport, the image will be loaded. The default offset of `100px` means that as soon as the images is within `100px` of the viewport, it will be loaded. Set the offset to `0` to disable it.

### Fit
The `fit` property allows you to set the `object-fit` css property on the image element.

## Events
### loaded
When an image is loaded the `loaded` event is fired. The event has the following details:

```
detail: {
  src: …, // the source of the image (either the default from the src attribute or any of the <source> tags)
  width: …, // the original width of the image
  height: … // the original height of the image
}
```

## Polyfill for IntersectionObserver
This packages uses the `IntersectionObserver` to detect if an image is in the viewport or not. If you want to use this in browsers that do [not support the `IntersectionObserver`](http://caniuse.com/#search=IntersectionObserver) you need to include a polyfill: https://github.com/WICG/IntersectionObserver/tree/gh-pages/polyfill

If you want to use this package just for its lazy-loading or if you build your own detection which triggers loading by setting `active` to true, you do not need to use the polyfill.
