import WFC from './wfc.js';

class Chunk {
  constructor({ device, neighbors, position, size }) {
    this.edges = [new Uint32Array(size[0]), new Uint32Array(size[1]), new Uint32Array(size[0]), new Uint32Array(size[1])];

    this.cells = device.createBuffer({
      mappedAtCreation: true,
      size: size[0] * size[1] * Uint32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.VERTEX,
    });
    WFC({
      neighbors,
      output: {
        cells: new Uint32Array(this.cells.getMappedRange()),
        edges: this.edges,
      },
      size,
    });
    this.cells.unmap();

    this.position = device.createBuffer({
      mappedAtCreation: true,
      size: 2 * Float32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.UNIFORM,
    });
    new Float32Array(this.position.getMappedRange()).set([
      position[0] * size[0],
      position[1] * size[1] + size[1],
    ]);
    this.position.unmap();
  }
}

export default Chunk;
