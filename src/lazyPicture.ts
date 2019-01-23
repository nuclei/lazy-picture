/* global HTMLElement IntersectionObserver CustomEvent */
'use strict'

import { ready } from '../node_modules/readyjs/dist/ready.js'

declare const ShadyCSS // eslint-disable-line no-unused-vars

let template: HTMLTemplateElement = document.createElement('template') as HTMLTemplateElement
template.innerHTML = `<style>
    :host{
      display: flex;
      --object-fit: var(--lazy-picture-object-fit, cover)
    }
    #content{
      display: flex;
      justify-content: center;
      width: 100%;
      height: 100%;
    }
    picture{
      width: 100%;
      height: auto;
    }
    img{
      width: 100%;
      height: 100%;
      vertical-align: top;
      float: left;
      object-fit: var(--object-fit);
    }
    :host([fit=cover]){
      --object-fit: cover;
    }
    :host([fit=contain]){
      --object-fit: contain;
    }
    :host([fit=fill]) img{
      --object-fit: fill;
    }
    :host([fit=none]) img{
      --object-fit: none;
    }
    :host([fit=scale-down]) img{
      --object-fit: scale-down;
    }
  </style>
  <slot></slot>
  <div id="content"></div>
`

class lazyPicture extends HTMLElement { // eslint-disable-line no-unused-vars
  /* Typescript: declare variables */
  private _active: string = undefined // eslint-disable-line no-undef
  private _img = null // eslint-disable-line no-undef
  private _picture = null // eslint-disable-line no-undef
  private src: string = null // eslint-disable-line no-undef
  private alt: string = null // eslint-disable-line no-undef
  private _observer = null // eslint-disable-line no-undef
  private _threshold: number = 0 // eslint-disable-line no-undef
  private offset: string = `100px` // eslint-disable-line no-undef
  private _content = null // eslint-disable-line no-undef

  constructor () {
    // If you define a ctor, always call super() first!
    // This is specific to CE and required by the spec.
    super()
    // create shadowRoot
    let shadowRoot = this.attachShadow({ mode: 'open' })
    // check if polyfill is used
    if (typeof ShadyCSS !== 'undefined') {
      ShadyCSS.prepareTemplate(template, 'lazy-picture') // eslint-disable-line no-undef
      // apply css polyfill
      ShadyCSS.styleElement(this) // eslint-disable-line no-undef
    }
    // add content to shadowRoot
    shadowRoot.appendChild(document.importNode(template.content, true))
    // get host element
    this._content = shadowRoot.querySelector('#content')
  }
  /**
   * @method observedAttributes
   * @description return attributes that should be watched for updates
   */
  static get observedAttributes () {
    return ['active', 'threshold', 'offset', 'src', 'alt']
  }
  /**
   * @method attributeChangedCallback
   * @description runs once an attribute is changed
  */
  attributeChangedCallback (attrName: string, oldVal, newVal) {
    if (oldVal === newVal) return

    this[attrName] = newVal
  }
  /**
   * @method connectedCallback
   * @description When element is added to DOM
   */
  connectedCallback () {
    this._initialize()
    this._createObserver()
  }
  /**
   * @method _initialize
   * @description prepare sources
   */
  private _initialize () {
    // create picture element
    this._picture = document.createElement('picture') as HTMLPictureElement
    // create image element & add attributes
    this._img = document.createElement('img') as HTMLImageElement
    this._img.setAttribute('alt', this.alt)
    // when document is ready
    ready(() => {
      // get nodes from slot
      let nodes = Array.from(this.shadowRoot.querySelector('slot').assignedNodes())
      // attach source nodes
      nodes.filter(node => node.nodeName === 'SOURCE')
        .forEach((source) => {
          this._picture.appendChild(source)
        })

      this._img.addEventListener('load', () => {
        this.dispatchEvent(new CustomEvent('loaded', {
          detail: {
            src: this._img.currentSrc,
            width: this._img.naturalWidth,
            height: this._img.naturalHeight
          }
        }))
      })
      // attach image to picture element
      this._picture.appendChild(this._img)
      // attach picture element to dom
      this._content.appendChild(this._picture)
    })
  }
  /**
   * @method _loadImage
   * @description prepare sources
   */
  private _loadImage () {
    this._img.setAttribute('src', this.src)
    // destroy observer once image is loaded
    this._destroyObserver()
  }
  /**
   * @method _createObserver
   * @description create the observer
   */
  private _createObserver () {
    if (this._active !== undefined || typeof IntersectionObserver !== 'function') return

    this._observer = new IntersectionObserver((changes) => {
      changes.forEach((change) => {
        if (change.isIntersecting) {
          change.target.setAttribute('active', 'true')
        }
      })
    }, {
      rootMargin: this.offset,
      threshold: this._threshold
    })
    this._observer.observe(this)
  }
  /**
   * @method _destroyObserver
   * @description destroy the observer
   */
  private _destroyObserver () {
    if (this._observer === null) return

    this._observer.unobserve(this)
  }
  /**
  * @method setter active
  * @description set the active property
   */
  set active (active: any) {
    active = (active === 'true' || active === true).toString()
    if (this._active === active) return
    this._active = active
    // set the attribute so its available for styling.
    this.setAttribute('active', this._active)
    this._loadImage()
  }
  /**
  * @method setter threshold
  * @description set the threshold property
   */
  set threshold (threshold: number) {
    // convert to float
    threshold = parseFloat(parseFloat(threshold + '').toFixed(2))
    if (isNaN(threshold) || threshold > 1 || threshold < 0) threshold = 1

    if (this._threshold === threshold) return
    this._threshold = threshold
  }
}

window.customElements.define('lazy-picture', lazyPicture)
