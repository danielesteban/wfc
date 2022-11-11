import Texture from './atlas.png';

export default (device) => {
  const count = 8;
  const width = 16;
  const height = 16;

  const texture = device.createTexture({
    dimension: '2d',
    format: 'rgba8unorm',
    size: [width, height, count],
    usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING,
  });

  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.addEventListener('load', () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height * count;
    ctx.drawImage(image, 0, 0);
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    device.queue.writeTexture(
      { texture },
      pixels.data.buffer,
      { bytesPerRow: width * 4, rowsPerImage: height },
      [width, height, count]
    );
  }, false);
  image.src = Texture;

  return texture.createView();
};
