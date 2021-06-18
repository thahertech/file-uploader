import { State } from '../../../symbiote/core/State.js';

export class AppComponent extends HTMLElement {
  static set template(html) {
    this.__tpl = document.createElement('template');
    this.__tpl.innerHTML = html;
  }

  /** @param {String | DocumentFragment} [template] */
  render(template) {
    while (this.firstChild) {
      this.firstChild.remove();
    }
    /** @type {DocumentFragment} */
    let fr;
    if (template?.constructor === DocumentFragment) {
      fr = template;
    } else if (template?.constructor === String) {
      let tpl = document.createElement('template');
      fr = document.importNode(tpl.content, true);
    } else {
      fr = document.importNode(this.constructor['__tpl'].content, true);
    }
    this.tplProcessors.forEach((fn) => {
      fn(fr);
    });
    this.appendChild(fr);
  }

  /** @param {(fr: DocumentFragment) => any} processorFn */
  addTemplateProcessor(processorFn) {
    this.tplProcessors.add(processorFn);
  }

  /** @param {Object<string, any>} init */
  initLocalState(init) {
    this.__localStateInitObj = init;
  }

  constructor() {
    super();
    /** @type {Set<(fr: DocumentFragment) => any>} */
    this.tplProcessors = new Set();
    /** @type {Object<string, HTMLElement>} */
    this.refs = Object.create(null);
    this.allSubs = new Set();
  }

  /**
   * @param {DocumentFragment} fr
   * @param {String} attr
   * @param {State} state
   * @param {Set} subs
   */
  static connectToState(fr, attr, state, subs) {
    [...fr.querySelectorAll(`[${attr}]`)].forEach((el) => {
      let subSr = el.getAttribute(attr);
      let keyValsArr = subSr.split(';');
      keyValsArr.forEach((keyValStr) => {
        if (!keyValStr) {
          return;
        }
        let kv = keyValStr.split(':').map((str) => str.trim());
        let prop = kv[0];
        let isAttr;
        if (prop.indexOf('@') === 0) {
          isAttr = true;
          prop = prop.replace('@', '');
        }
        if (!state.has(kv[1])) {
          state.add(kv[1], undefined);
        }
        subs.add(
          state.sub(kv[1], (val) => {
            if (isAttr) {
              if (val.constructor === Boolean) {
                val ? el.setAttribute(prop, '') : el.removeAttribute(prop);
              } else {
                el.setAttribute(prop, val);
              }
            } else {
              el[prop] = val;
            }
          })
        );
      });
      el.removeAttribute(attr);
    });
  }

  get ctxName() {
    return this.getAttribute('ctx-name');
  }

  /** @param {Object<string, any>} stateInit */
  addToAppState(stateInit) {
    if (!this.appState) {
      this.__appSateInit = stateInit;
      return;
    }
    for (let prop in stateInit) {
      if (!this.appState.has(prop)) {
        this.appState.add(prop, stateInit[prop]);
      }
    }
  }

  get appState() {
    return this.ctxName ? State.getNamedCtx(this.ctxName) || State.registerNamedCtx(this.ctxName, this.__appSateInit || {}) : null;
  }

  connectedCallback() {
    this.localState = State.registerLocalCtx(this.__localStateInitObj || {});
    this.addTemplateProcessor((fr) => {
      [...fr.querySelectorAll('[ref]')].forEach((/** @type {HTMLElement} */ el) => {
        let refName = el.getAttribute('ref');
        this.refs[refName] = el;
        el.removeAttribute('ref');
      });
    });
    this.addTemplateProcessor((fr) => {
      AppComponent.connectToState(fr, 'sub', this.localState, this.allSubs);
    });
    this.addTemplateProcessor((fr) => {
      AppComponent.connectToState(fr, 'app', this.appState, this.allSubs);
    });
  }

  disconnectedCallback() {
    this.allSubs.forEach((sub) => {
      sub.remove();
      this.allSubs.delete(sub);
    });
    this.tplProcessors.forEach((fn) => {
      this.tplProcessors.delete(fn);
    });
  }
}