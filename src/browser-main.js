import { initAnalytics } from './analytics.js';
import { getData } from './data-provider.js';
import View from './bubble-view.js';
import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/brands';

const RESOLUTION = 15;

initAnalytics();

(async () => {
  const view = await View(getData(), RESOLUTION);

  document.body.appendChild(makeAttribution());

  (function frame() {
    requestAnimationFrame(frame);
    view.nextFrame();
  })();

})();

const makeAttribution = () => {
  const wrap = document.createElement('div');
  wrap.className = 'credits';
  wrap.innerHTML = `
    <div class="title">nineteen.</div>
    <a target="_blank" href="http://www.itsmichael.info" class="author">by Michael Townsend</a>
    <div class="social">
      <a target="_blank" href="https://github.com/Continuities/nineteen"><i class="fab fa-github"></i></a>
      <a target="_blank" href="https://www.instagram.com/continuous_michael/"><i class="fab fa-instagram"></i></a>
      <a target="_blank" href="https://twitter.com/continuities"><i class="fab fa-twitter"></i></a>
    </div>
  `;
  return wrap;
};