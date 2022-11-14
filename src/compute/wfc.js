import Rules from './rules.js';

const all = Array.from({ length: Rules.length }, (v, i) => i);
const neighbors = [
  [0, 1],
  [-1, 0],
  [0, -1],
  [1, 0],
];

export default (output, size) => {
  console.time('wfc');
  const cells = Array.from({ length: size[0] * size[1] }, () => all.slice());
  const rollback = new Map();
  const propagate = (values, x, y) => (
    neighbors.forEach((offset, rule) => {
      const nx = x + offset[0];
      const ny = y + offset[1];
      if (
        nx < 0 || nx >= size[0]
        || ny < 0 || ny >= size[1]
      ) {
        return;
      }
      const neighbor = ny * size[0] + nx;
      const options = cells[neighbor];
      let needsPropagation = false;
      for (let i = 0, l = options.length; i < l; i++) {
        const option = options[i];
        if (Rules[option][rule].findIndex((value) => values.includes(value)) === -1) {
          if (!rollback.has(neighbor)) {
            rollback.set(neighbor, options.slice());
          }
          options.splice(i, 1);
          i--;
          l--;
          needsPropagation = true;
        }
      }
      if (options.length === 0) {
        throw new Error('FAIL');
      }
      if (needsPropagation) {
        propagateCell(neighbor);
      }
    })
  );
  const propagateCell = (cell) => (
    propagate(cells[cell], Math.floor(cell % size[0]), Math.floor(cell / size[0]))
  );
  try {
    for (let x = 0; x < size[0]; x++) {
      propagate([0], x, -1);
      propagate([0], x, size[1]);
    }
    for (let y = 0; y < size[1]; y++) {
      propagate([0], -1, y);
      propagate([0], size[0], y);
    }
  } catch (e) {
    throw new Error('Failed to propagate initial state');
  }
  const uncollapsed = Array.from({ length: cells.length }, (v, i) => i);
  while (uncollapsed.length) {
    const cell = uncollapsed.splice(Math.floor(Math.random() * uncollapsed.length), 1)[0];
    const options = cells[cell];
    if (options.length === 1) {
      continue;
    }
    while (options.length) {
      const option = options.splice(Math.floor(Math.random() * options.length), 1)[0];
      cells[cell] = [option];
      try {
        propagateCell(cell);
        break;
      } catch (e) {
        rollback.forEach((value, cell) => {
          cells[cell] = value;
        });
      } finally {
        rollback.clear();
      }
    }
  }
  console.timeEnd('wfc');
  cells.forEach(([value], i) => {
    output[i] = value;
  });
};
