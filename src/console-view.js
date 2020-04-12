import RasteredData from './rastered-data.js';

function centerPad(s, num) {
  return s.padStart((num - s.length) / 2 + s.length).padEnd(num);
}

const ConsoleView = (input, resolution) => {
  const data = RasteredData(input, resolution);
  const dates = [...data.keys()].sort((a, b) => new Date(a) - new Date(b));
  let currentFrame = 0;

  return {
    nextFrame: () => {
      if (++currentFrame >= dates.length) {
        currentFrame = 0;
      }
      const rows = data.get(dates[currentFrame]).total;
      console.clear();
      console.log(rows.map(cols => cols.map(c => centerPad(String(c), 5)).join('')).join('\n'));
    }
  };
};

export default ConsoleView;