import { BlockComponent } from '../BlockComponent/BlockComponent.js';

export class ModalWin extends BlockComponent {
  constructor() {
    super();
    this.initLocalState({
      closeClicked: () => {
        this.pub('external', 'modalActive', false);
      },
    });
    this.pauseRender = true;
  }

  initCallback() {
    this.addToExternalState({
      modalIcon: 'default',
      modalActive: false,
      modalCaption: 'Modal caption',
    });
    this.render();
    this.sub('external', 'modalActive', (val) => {
      val ? this.setAttribute('active', '') : this.removeAttribute('active');
    });
  }
}

ModalWin.template = /*html*/ `
<div dialog-el>
  <div heading-el>
    <uc-icon-ui ext="@name: modalIcon"></uc-icon-ui>
    <div caption-el loc="textContent: caption" ext="textContent: modalCaption"></div>
    <button close-btn loc="onclick: closeClicked">
      <uc-icon-ui name="close"></uc-icon-ui>
    </button>
  </div>
  <slot></slot>
</div>
`;
