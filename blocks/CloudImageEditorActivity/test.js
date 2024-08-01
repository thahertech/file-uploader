import { ifRef } from '../../utils/ifRef.js';
import * as blocks from '../../index.js';

ifRef(() => {
  blocks.registerFileUploader(blocks);
  document.querySelector(blocks.CloudImageEditorBlock.is)?.addEventListener('apply', (e) => {
    console.log(e);
  });
});
