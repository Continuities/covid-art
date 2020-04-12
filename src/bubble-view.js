import RasteredData from './rastered-data.js';
import jss from 'jss';

const DAY_LENGTH = 100; // ms
const LOGICAL_SIZE = 1024;
const BUBBLE_SCALE = 10;

const { classes } = jss.createStyleSheet({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'center'
  },
  canvas: {

  }
}).attach();

const BubbleView = (input, resolution) => {
  const data = RasteredData(input, resolution);
  const dates = [...data.keys()].sort((a, b) => new Date(a) - new Date(b));

  const container = document.createElement('div');
  container.className = classes.container;
  document.body.appendChild(container);

  const canvas = document.createElement('canvas');
  canvas.className = classes.canvas;
  container.appendChild(canvas);

  const toViewCoords = (col, row) => ({
    x: (LOGICAL_SIZE / (resolution + 1)) * col,
    y: (LOGICAL_SIZE / (resolution + 1)) * row
  });

  const ctx = getScaledContext(canvas);
  ctx.globalCompositeOperation = 'difference';
  let currentDay = 0;
  let lastDay = null;
  const nextFrame = () => {

    if (lastDay == null) {
      lastDay = Date.now();
    }
    else if (Date.now() > lastDay + DAY_LENGTH) {
      if (++currentDay >= dates.length) {
        currentDay = 0;
      }
      lastDay = Date.now();
    }

    const frame = data.get(dates[currentDay]).total;

    ctx.clearRect(0, 0, LOGICAL_SIZE, LOGICAL_SIZE);

    // TODO: An enumerable list of hot cells would probably be better
    for (let c in frame) {
      for (let r in frame[c]) {
        const size = frame[c][r] * BUBBLE_SCALE;
        if (size <= 0) { continue; }
        const p = toViewCoords(c, r);
        ctx.beginPath();
        ctx.arc(p.x, p.y, size / 2, 0, Math.PI * 2);
        ctx.fillStyle = '#FF4136';
        ctx.fill();
      }
    }
  };

  return {
    nextFrame
  };
};

function getScaledContext(canvas) {

  const ctx = canvas.getContext('2d');
  const sizeCanvas = () => {
    const size = Math.min(window.innerHeight, window.innerWidth);
    canvas.style.height = canvas.style.width = `${size}px`;

    const scale = size / LOGICAL_SIZE;
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = canvas.height = size * dpr;
    // Scale all drawing operations by the dpr, so you
    // don't have to worry about the difference.
    ctx.scale(scale * dpr, scale * dpr);
  };

  sizeCanvas();

  window.addEventListener('resize', sizeCanvas);

  return ctx;
}

export default BubbleView;