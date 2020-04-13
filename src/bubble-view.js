import RasteredData from './rastered-data.js';
import { easeInOutQuad as easing } from './easing.js';
import Palettes from './palettes.js';
import './style.css';

const DAY_LENGTH = 60; // frames
const LOGICAL_SIZE = 1024;
const BUBBLE_SCALE = 10;
const EXPAND_RATE = 0.01; // % per frame
const FADE_RATE = 2; // frames
const OFFSET_RANGE = 0.4; // % from beginning and end of range
const CITY_TEXT_SIZE = 100; // px
const CITY_LINE_HEIGHT = 2 * CITY_TEXT_SIZE; // px

const invert = ([ r, g, b ]) => [
  255 - r,
  255 - g,
  255 - b
];

const BubbleView = async (loader, resolution) => {

  let paletteIndex;
  const nextPalette = () => {
    if (paletteIndex == null) {
      paletteIndex = Math.floor(Math.random() * Palettes.length);
    }
    else {
      if (++paletteIndex >= Palettes.length) {
        paletteIndex = 0;
      }
    }
    const palette = Palettes[paletteIndex];
    document.body.style.backgroundColor = `rgb(${palette.bg.join(',')})`;
    document.body.style.color = `rgb(${invert(palette.bg).join(',')})`;
  };

  nextPalette();
  addLoader();

  const input = await loader;

  document.body.innerHTML = '';

  const { data, cities } = RasteredData(input, resolution);
  const dates = [...data.keys()].sort((a, b) => parseInt(a) - parseInt(b));

  const canvas = document.createElement('canvas');
  document.body.appendChild(canvas);

  const gridToView = (col, row) => ({
    x: (LOGICAL_SIZE / (resolution + 1)) * (col + 1),
    y: (LOGICAL_SIZE / (resolution + 1)) * (row + 1)
  });

  const viewToGrid = ({ x, y }) => { 
    if (x > LOGICAL_SIZE || y > LOGICAL_SIZE || x < 0 || y < 0) {
      return null;
    }
    return {
      col: Math.floor(x / (LOGICAL_SIZE / resolution)),
      row: Math.floor(y / (LOGICAL_SIZE / resolution))
    };
  };

  const [ ctx, centerPoint, toViewCoords ] = scale(canvas);
  let currentDay = -1;
  let background = ctx.getImageData(0, 0, canvas.width, canvas.height);;
  let framesLeftInDay;
  let dayBubbles;

  const updateDay = () => {
    if (++currentDay >= dates.length) {
      nextPalette();
      currentDay = 0;
    }
    framesLeftInDay = DAY_LENGTH;
    dayBubbles = computeBubbles(
      data.get(dates[currentDay]).total, 
      Palettes[paletteIndex]
    );
  };
  updateDay();

  const onClick = e => {
    const colour = invert(Palettes[paletteIndex].bg);
    const viewPoint = toViewCoords(e.clientX, e.clientY);
    const gridPos = viewToGrid(viewPoint);
    const currentCities = cities[gridPos.col][gridPos.row];
    if (currentCities.size == 0) {
      return;
    }
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = background.width;
    tempCanvas.height = background.height;
    const ctx = tempCanvas.getContext('2d');
    ctx.putImageData(background, 0, 0);
    ctx.globalCompositeOperation = 'difference';
    ctx.font = `bold ${CITY_TEXT_SIZE}px sans-serif`;

    let y = (tempCanvas.height - currentCities.size * CITY_LINE_HEIGHT) / 2 + (CITY_LINE_HEIGHT - CITY_TEXT_SIZE) / 2; 
    for (let c of currentCities) {
      const text = c.toUpperCase();
      const { width } = ctx.measureText(text);
      ctx.fillStyle = `rgb(${colour.join(',')})`;
      ctx.fillText(text, (tempCanvas.width - width) / 2, y);
      y += CITY_LINE_HEIGHT;
    }

    background = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
  };

  document.addEventListener('click', onClick);
  document.addEventListener('keydown', e => { if (e.keyCode === 32) nextPalette(); });
  document.body.className = 'with-transition';

  const nextFrame = () => {
    ctx.globalCompositeOperation = 'difference';
    ctx.clearRect(0, 0, LOGICAL_SIZE, LOGICAL_SIZE);

    fade(background);
    ctx.putImageData(background, 0, 0);

    if (framesLeftInDay <= 0) {
      updateDay();
    }

    const dayProgress = 1 - (framesLeftInDay / DAY_LENGTH);

    for (let bubble of dayBubbles) {
      const bubbleProgress = easing(mapProgressRange(bubble.start, bubble.end, dayProgress));
      const bubbleAlpha = dayProgress > bubble.end ? 1 - (dayProgress - bubble.end) : 1;
      const size = bubble.size * BUBBLE_SCALE * bubbleProgress;
      if (size <= 0) { continue; }
      const p = centerPoint(gridToView(bubble.col, bubble.row));
      ctx.beginPath();
      ctx.arc(p.x, p.y, size / 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${bubble.colour.join(',')}, ${bubbleAlpha})`;
      ctx.fill();
      ctx.closePath();
    }

    if (--framesLeftInDay <= 0) {
      background = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

  };

  return {
    nextFrame
  };
};

function addLoader() {
  const loader = document.createElement('div');
  loader.className = 'loader';
  loader.innerText = "Fetching recent data...";
  const spinner = document.createElement('div');
  spinner.className='lds-ring';
  spinner.innerHTML = '<div></div><div></div><div></div><div></div>';
  loader.appendChild(spinner);
  document.body.appendChild(loader);
}

function mapProgressRange(start, end, p) {
  if (p <= start) {
    return 0;
  }
  if (p >= end) {
    return 1;
  }
  return (p - start) * 1 / (end - start);
}

function computeBubbles(frame, palette) {
  const bubbles = [];
  for (let c in frame) {
    for (let r in frame[c]) {
      if (frame[c][r] <= 0) { continue; }
      bubbles.push({
        row: parseInt(r),
        col: parseInt(c),
        colour: palette.fg[Math.floor(Math.random() * palette.fg.length)],
        start: Math.random() * OFFSET_RANGE,
        end: 1 - (Math.random() * OFFSET_RANGE),
        size: frame[c][r]
      });
    }
  }
  return bubbles;
}

function fade(imageData) {
  const data = imageData.data;
  for (let i = 3; i < data.length; i += 4) {
    data[i] -= FADE_RATE;
  }
}

function scale(canvas) {

  const ctx = canvas.getContext('2d');
  let scale = 1;
  const sizeCanvas = () => {
    const boundingDimension = Math.min(window.innerHeight, window.innerWidth);
    const dpr = window.devicePixelRatio || 1;
    scale = boundingDimension / LOGICAL_SIZE;

    canvas.style.height = `${window.innerHeight}px`;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.height = window.innerHeight * dpr;
    canvas.width = window.innerWidth * dpr;
    
    ctx.scale(scale * dpr, scale * dpr);
  };

  const xPad = () => ((window.innerWidth / scale) - LOGICAL_SIZE) / 2;
  const yPad = () => ((window.innerHeight / scale) - LOGICAL_SIZE) / 2;

  const centerPoint = ({ x, y }) => ({
    x: x + xPad(),
    y: y + yPad(),
  });

  const toViewCoords = (x, y) => ({
    x: x / scale - xPad(),
    y: y / scale - yPad()
  });

  sizeCanvas();

  window.addEventListener('resize', sizeCanvas);

  return [ ctx, centerPoint, toViewCoords ];
}

export default BubbleView;