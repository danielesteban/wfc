import './main.css';
import { vec2 } from 'gl-matrix';
import Camera from './render/camera.js';
import Chunk from './compute/chunk.js';
import Cells from './render/cells.js';
import Input from './compute/input.js';
import Renderer from './render/renderer.js';
// import EditRules from './compute/editor.js';

const Main = ({ adapter, device }) => {
  const camera = new Camera({ device });
  const renderer = new Renderer({
    adapter,
    camera,
    device,
    pixelRatio: Math.max(window.devicePixelRatio || 1, 1.5),
  });
  document.getElementById('renderer').appendChild(renderer.canvas);
  renderer.setSize(window.innerWidth, window.innerHeight);

  const chunks = {
    data: new Map(),
    render: [],
    size: vec2.fromValues(32, 32),
  };

  const cells = new Cells({ renderer, chunks: chunks.render, size: chunks.size });
  renderer.scene.push(cells);

  const input = new Input({ camera, target: renderer.canvas });

  const time = new Float32Array(1);
  const animate = () => {
    requestAnimationFrame(animate);
    if (input.update()) {
      updateViewport();
    }

    time[0] = performance.now() / 1000;
    device.queue.writeBuffer(renderer.time, 0, time);
    const command = device.createCommandEncoder();
    renderer.render(command);
    device.queue.submit([command.finish()]);
  };

  requestAnimationFrame(animate);

  const offsets = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  const load = (position) => {
    const key = `${position[0]}:${position[1]}`;
    let chunk = chunks.data.get(key);
    if (!chunk) {
      const neighbors = offsets.map((offset) => (
        chunks.data.get(`${position[0] + offset[0]}:${position[1] + offset[1]}`)
      ));
      chunk = new Chunk({ device, neighbors, position, size: chunks.size });
      chunks.data.set(key, chunk);
    }
    return chunk;
  };

  const viewport = [vec2.create(), vec2.create()];
  const updateViewport = () => {
    viewport.forEach((corner, i) => {
      vec2.set(corner, i === 0 ? -1 : 1, i === 0 ? -1 : 1);
      vec2.transformMat4(corner, corner, camera.matrixInverse);
      vec2.divide(corner, corner, chunks.size);
      vec2.floor(corner, corner);
    });
    chunks.render.length = 0;
    for (let y = viewport[0][1]; y <= viewport[1][1]; y++) {
      for (let x = viewport[0][0]; x <= viewport[1][0]; x++) {
        chunks.render.push(load(vec2.fromValues(x, y)));
      }
    }
  };
  updateViewport();

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    updateViewport();
  }, false);
};

const GPU = async () => {
  if (!navigator.gpu) {
    throw new Error('WebGPU support');
  }
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw new Error('WebGPU adapter');
  }
  const device = await adapter.requestDevice();
  return { adapter, device };
};

GPU()
  // .then(EditRules)
  .then(Main)
  .catch((e) => {
    console.error(e);
    document.getElementById('support').classList.add('enabled');
  })
  .finally(() => document.getElementById('loading').classList.remove('enabled'));
