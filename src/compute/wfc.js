import Rules from './rules.js';

const all = Array.from({ length: Rules.length }, (v, i) => i);
const offsets = [
  [0, 1],
  [-1, 0],
  [0, -1],
  [1, 0],
];

export default ({ neighbors, output, size }) => {
  const cells = Array.from({ length: size[0] * size[1] }, () => all.slice());
  let rollback = false;
  const propagate = (values, x, y) => (
    offsets.forEach((offset, rule) => {
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
          if (rollback && !rollback.has(neighbor)) {
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
  neighbors.forEach((neighbor, edge) => (
    neighbor && neighbor.edges[edge].forEach((value, i) => {
      let x;
      let y;
      switch (edge) {
        case 0:
          x = i;
          y = -1;
          break;
        case 1:
          x = size[0];
          y = i;
          break;
        case 2:
          x = i;
          y = size[1];
          break;
        case 3:
          x = -1;
          y = i;
          break;
      }
      try {
        propagate([value], x, y);
      } catch (e) {
        throw new Error('Failed to propagate neighbor state');
      }
    })
  ));
  rollback = new Map();
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
  cells.forEach(([value], i) => {
    output.cells[i] = value;
  });
  cells.length = 0;
  for (let x = 0; x < size[0]; x++) {
    output.edges[0][x] = output.cells[(size[1] - 1) * size[0] + x];
    output.edges[2][x] = output.cells[x];
  }
  for (let y = 0; y < size[1]; y++) {
    output.edges[1][y] = output.cells[y * size[0]];
    output.edges[3][y] = output.cells[y * size[0] + (size[0] - 1)];
  }
};
