import Rules from './rules.js';

export default (instances, size) => {
  console.time('wfc');
  const all = Object.keys(Rules).map((n) => parseInt(n, 10));
  const cells = [];
  const uncollapsed = [];
  for (let i = 0, y = 0; y < size[1]; y++) {
    for (let x = 0; x < size[0]; x++, i++) {
      uncollapsed.push(i);
      cells.push([...all]);
    }
  }
  const rollback = new Map();
  const neighbors = [
    [0, 1],
    [-1, 0],
    [0, -1],
    [1, 0],
  ];
  const propagate = (cell) => {
    const cx = Math.floor(cell % size[0]);
    const cy = Math.floor(cell / size[0]);
    neighbors.forEach((offset, rule) => {
      const nx = cx + offset[0];
      const ny = cy + offset[1];
      if (
        nx < 0 || nx >= size[0]
        || ny < 0 || ny >= size[1]
      ) {
        return;
      }
      const neighbor = ny * size[0] + nx;
      const options = cells[neighbor];
      if (options.length === 1) {
        return;
      }
      let needsPropagation = false;
      for (let i = 0, l = options.length; i < l; i++) {
        const option = options[i];
        if (Rules[option][rule].findIndex((value) => cells[cell].includes(value)) === -1) {
          if (!rollback.has(neighbor)) {
            rollback.set(neighbor, options.slice());
          }
          options.splice(i, 1);
          i--;
          l--;
          needsPropagation = true;
        }
      }
      if (!cells[neighbor].length) {
        throw new Error('FAIL');
      }
      if (needsPropagation) {
        propagate(neighbor);
      }
    });
  };
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
        propagate(cell);
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
  for (let i = 0, y = 0; y < size[1]; y++) {
    for (let x = 0; x < size[0]; x++, i++) {
      instances[i] = cells[i][0];
    }
  }
};
