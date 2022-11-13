import Texture from '../render/atlas.png';

const neighbors = [
  [0, 1],
  [-1, 0],
  [0, -1],
  [1, 0],
];

const opposite = [
  2,
  3,
  0,
  1,
];

export default () => {
  const ui = document.getElementById('renderer');
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 512;
  canvas.height = 512;
  ctx.imageSmoothingEnabled = false;
  ctx.translate(256, 256);
  ctx.scale(8, 8);
  ui.appendChild(canvas);

  const atlas = new Image();
  atlas.crossOrigin = 'anonymous';
  atlas.addEventListener('load', () => {
    const size = atlas.width;
    const count = atlas.height / atlas.width;
    
    let done = false;
    let optionA = 0;
    let optionB = 0;
    let rule = 0;

    const accepted = new Map();
    const rejected = new Map();

    const draw = () => {
      ctx.fillRect(canvas.width * -0.5, canvas.height * -0.5, canvas.width, canvas.height);
      ctx.drawImage(atlas, 0, optionA * size, size, size, size * -0.5, size * -0.5, size, size);
      ctx.drawImage(atlas, 0, optionB * size, size, size, size * -0.5 - size * neighbors[rule][0], size * -0.5 - size * neighbors[rule][1], size, size);
    };

    const next = (accept) => {
      const map = accept ? accepted : rejected;
      map.set(`${rule}:${optionA}:${optionB}`, true);
      map.set(`${opposite[rule]}:${optionB}:${optionA}`, true);
      if (++rule >= neighbors.length) {
        rule = 0;
        if (++optionB >= count) {
          optionB = 0;
          if (++optionA >= count) {
            done = true;
            output();
            return;
          }
        }
      }
      const key = `${rule}:${optionA}:${optionB}`;
      if (accepted.has(key) || rejected.has(key)) {
        next();
        return;
      }
      draw();
    };

    draw();

    window.addEventListener('keydown', ({ key, repeat }) => {
      if (done || repeat) {
        return;
      }
      switch (key.toUpperCase()) {
        case 'Y':
        case 'ENTER':
          next(true);
          break;
        case 'N':
        case 'ESCAPE':
          next(false);
          break;
      }
    });

    const output = () => {
      console.log(JSON.stringify(Array.from({ length: count }, (v, option) => (
        Array.from({ length: neighbors.length }, (v, rule) => {
          const neighbors = [];
          for (let i = 0; i < count; i++) {
            if (accepted.has(`${rule}:${option}:${i}`)) {
              neighbors.push(i);
            }
          }
          return neighbors;
        })
      ))));
    };

  }, false);
  atlas.src = Texture;
};
