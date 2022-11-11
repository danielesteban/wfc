class Renderer {
  constructor({ adapter, camera, device }) {
    this.camera = camera;
    this.device = device;
    this.format = navigator.gpu.getPreferredCanvasFormat(adapter);
    this.canvas = document.createElement('canvas');
    {
      // I have no idea why but if I don't do this, sometimes it crashes with:
      // D3D12 reset command allocator failed with E_FAIL
      this.canvas.width = Math.floor(window.innerWidth * (window.devicePixelRatio || 1));
      this.canvas.height = Math.floor(window.innerHeight * (window.devicePixelRatio || 1));
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
    this.scene = [];
    this.textures = new Map();
  }

  render(command) {
    const { context, descriptor, scene } = this;
    descriptor.colorAttachments[0].view = context.getCurrentTexture().createView();
    const pass = command.beginRenderPass(descriptor);
    scene.forEach((object) => object.render(pass));
    pass.end();
  }

  setSize(width, height) {
    const { camera, canvas } = this;
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    camera.aspect = width / height;
  }
}

export default Renderer;
