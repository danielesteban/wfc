class Renderer {
  constructor({ adapter, camera, device, pixelRatio = (window.devicePixelRatio || 1) }) {
    this.camera = camera;
    this.device = device;
    this.format = navigator.gpu.getPreferredCanvasFormat(adapter);
    this.canvas = document.createElement('canvas');
    {
      // I have no idea why but if I don't do this, sometimes it crashes with:
      // D3D12 reset command allocator failed with E_FAIL
      this.canvas.width = Math.floor(window.innerWidth * pixelRatio);
      this.canvas.height = Math.floor(window.innerHeight * pixelRatio);
    }
    this.context = this.canvas.getContext('webgpu');
    this.context.configure({ alphaMode: 'opaque', device, format: this.format });
    this.descriptor = {
      colorAttachments: [
        {
          clearValue: { r: 1, g: 1, b: 1, a: 1 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    };
    this.pixelRatio = pixelRatio;
    this.scene = [];
    this.time = device.createBuffer({
      size: Float32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
    });
  }

  render(command) {
    const { context, descriptor, scene } = this;
    descriptor.colorAttachments[0].view = context.getCurrentTexture().createView();
    const pass = command.beginRenderPass(descriptor);
    scene.forEach((object) => object.render(pass));
    pass.end();
  }

  setSize(width, height) {
    const { camera, canvas, pixelRatio } = this;
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    camera.aspect = width / height;
    camera.update();
  }
}

export default Renderer;
