import './main.css';
import Camera from './render/camera.js';
import Cells from './render/cells.js';
import Renderer from './render/renderer.js';
import WFC from './compute/wfc.js';

const Main = ({ adapter, device }) => {
  const camera = new Camera({ device });
  const renderer = new Renderer({ adapter, camera, device });
  document.getElementById('renderer').appendChild(renderer.canvas);
  renderer.setSize(window.innerWidth, window.innerHeight);
  window.addEventListener('resize', () => (
    renderer.setSize(window.innerWidth, window.innerHeight)
  ), false);

  const size = new Uint32Array([300, 160]);
  const cells = new Cells({ renderer, size, setup: WFC });
  renderer.scene.push(cells);

  const animate = () => {
    requestAnimationFrame(animate);

    const time = performance.now() / 1000;
    const d = size[1] * 0.3;
    const t = time * 0.2;
    camera.position[0] = size[0] * 0.5 + Math.sin(t) * d;
    camera.position[1] = size[1] * -0.5 - Math.cos(t) * d;
    camera.zoom = 60 + Math.sin(t) * 20;
    camera.update();

    const command = device.createCommandEncoder();
    renderer.render(command);
    device.queue.submit([command.finish()]);
  };

  requestAnimationFrame(animate);
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
  .then(Main)
  .catch((e) => {
    console.error(e);
    document.getElementById('support').classList.add('enabled');
  })
  .finally(() => document.getElementById('loading').classList.remove('enabled'));
