import { BaseComponent } from '@symbiotejs/symbiote';

export class Range extends BaseComponent {
  init$ = {
    cssLeft: '50%',
    barActive: false,
    value: 50,
    onChange: (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.$.value = parseFloat(this._range.value);
      this.dispatchEvent(new Event('change'));
    },
  };

  initCallback() {
    super.initCallback();
    /** @type {HTMLInputElement} */
    this._range = this.ref.range;
    [...this.attributes].forEach((attr) => {
      let exclude = ['style', 'ref'];
      if (!exclude.includes(attr.name)) {
        this.ref.range.setAttribute(attr.name, attr.value);
      }
    });
    this.sub('value', (val) => {
      let pcnt = (val / 100) * 100;
      this.$.cssLeft = `${pcnt}%`;
    });
    this.defineAccessor('value', (val) => {
      this.$.value = val;
    });
  }
}

Range.template = /*html*/ `
<div class="track-wrapper">
  <div
    class="track">
  </div>
  <div 
    class="bar" 
    set
    -style.width="cssLeft"
    -@active="barActive">
  </div>
  <div 
    class="slider" 
    set
    -style.left="cssLeft">
  </div>
</div>

<input
  type="range"
  ref="range"
  set
  -@value="value"
  -oninput="onChange" />
`;
