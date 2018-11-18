(function () {
    'use strict';

    var ready = function (fn) {
        if (document.readyState !== 'loading') {
            fn();
        }
        else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    };

    let template = document.createElement('template');
    template.innerHTML = `<style>
    :host{
      display: flex;
    }
    #content{
      display: flex;
      justify-content: center;
      width: 100%;
    }
    img{
      width: 100%;
      height: auto;
      vertical-align: top;
      float: left;
      object-fit: cover;
    }
  </style>
  <slot></slot>
  <div id="content"></div>
`;
    class lazyPicture extends HTMLElement {
        constructor() {
            super();
            this._active = undefined;
            this._img = null;
            this._picture = null;
            this.src = null;
            this.alt = null;
            this._observer = null;
            this._threshold = 0;
            this.offset = `100px`;
            this._content = null;
            let shadowRoot = this.attachShadow({ mode: 'open' });
            if (typeof ShadyCSS !== 'undefined') {
                ShadyCSS.prepareTemplate(template, 'lazy-picture');
                ShadyCSS.styleElement(this);
            }
            shadowRoot.appendChild(document.importNode(template.content, true));
            this._content = shadowRoot.querySelector('#content');
        }
        static get observedAttributes() {
            return ['active', 'threshold', 'offset', 'src', 'alt'];
        }
        attributeChangedCallback(attrName, oldVal, newVal) {
            if (oldVal === newVal)
                return;
            this[attrName] = newVal;
        }
        connectedCallback() {
            this._initialize();
            this._createObserver();
        }
        _initialize() {
            this._picture = document.createElement('picture');
            this._img = document.createElement('img');
            this._img.setAttribute('alt', this.alt);
            ready(() => {
                let nodes = Array.from(this.shadowRoot.querySelector('slot').assignedNodes());
                nodes.filter(node => node.nodeName === 'SOURCE')
                    .forEach((source) => {
                    this._picture.appendChild(source);
                });
                this._img.addEventListener('load', () => {
                    this.dispatchEvent(new CustomEvent('loaded', {
                        detail: {
                            src: this._img.currentSrc,
                            width: this._img.naturalWidth,
                            height: this._img.naturalHeight
                        }
                    }));
                });
                this._picture.appendChild(this._img);
                this._content.appendChild(this._picture);
            });
        }
        _loadImage() {
            this._img.setAttribute('src', this.src);
            this._destroyObserver();
        }
        _createObserver() {
            if (this._active !== undefined || typeof IntersectionObserver !== 'function')
                return;
            this._observer = new IntersectionObserver((changes) => {
                changes.forEach((change) => {
                    if (change.isIntersecting) {
                        change.target.setAttribute('active', 'true');
                    }
                });
            }, {
                rootMargin: this.offset,
                threshold: this._threshold
            });
            this._observer.observe(this);
        }
        _destroyObserver() {
            if (this._observer === null)
                return;
            this._observer.unobserve(this);
        }
        set active(active) {
            active = (active === 'true' || active === true).toString();
            if (this._active === active)
                return;
            this._active = active;
            this.setAttribute('active', this._active);
            this._loadImage();
        }
        set threshold(threshold) {
            threshold = parseFloat(parseFloat(threshold + '').toFixed(2));
            if (isNaN(threshold) || threshold > 1 || threshold < 0)
                threshold = 1;
            if (this._threshold === threshold)
                return;
            this._threshold = threshold;
        }
    }
    window.customElements.define('lazy-picture', lazyPicture);

}());
//# sourceMappingURL=lazyPicture.js.map
