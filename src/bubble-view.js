import RasteredData from './rastered-data.js';
import jss from 'jss';

const { classes } = jss.createStyleSheet({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }
}).attach();

const BubbleView = (input, resolution) => {
  const data = RasteredData(input, resolution);
  const dates = [...data.keys()].sort((a, b) => new Date(a) - new Date(b));
  let currentFrame = 0;

  const container = document.createElement('div');
  container.className = classes.container;
  document.body.appendChild(container);

  return {
    nextFrame: () => {
      if (++currentFrame >= dates.length) {
        currentFrame = 0;
      }
      const rows = data.get(dates[currentFrame]).total;
      // TODO
    }
  };
};

export default BubbleView;