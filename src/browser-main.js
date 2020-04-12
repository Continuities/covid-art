import { getData } from './data-provider.js';
import View from './bubble-view.js';

const RESOLUTION = 15;

(async () => {
  const data = await getData();
  const view = View(data, RESOLUTION);
  setInterval(view.nextFrame, 200);
})();