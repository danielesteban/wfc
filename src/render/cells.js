import Atlas from './atlas.js';

const Shader = ({ stride }) => `
@group(0) @binding(0) var<uniform> camera : mat4x4<f32>;
@group(0) @binding(1) var atlas : texture_2d_array<f32>;
@group(0) @binding(2) var atlasSampler : sampler;

struct VertexInput {
  @builtin(vertex_index) index : u32,
  @builtin(instance_index) instance: u32,
  @location(0) texture : u32,
}

struct VertexOutput {
  @builtin(position) position : vec4<f32>,
  @location(0) @interpolate(flat) texture : u32,
  @location(1) uv : vec2<f32>,
}

const quad = array<vec4<f32>, 6>(
  vec4<f32>(0, 0, 0, 1), vec4<f32>(1, 0, 1, 1), vec4<f32>(0, 1, 0, 0),
  vec4<f32>(0, 1, 0, 0), vec4<f32>(1, 0, 1, 1), vec4<f32>(1, 1, 1, 0)
);

@vertex
fn vertex(vertex : VertexInput) -> VertexOutput {
  var out : VertexOutput;
  out.position = camera * vec4<f32>(vec2<f32>(f32(vertex.instance % ${stride}), f32(vertex.instance / ${stride}) * -1 - 1) + quad[vertex.index].xy, 0, 1);
  out.texture = vertex.texture;
  out.uv = quad[vertex.index].zw;
  return out;
}

struct FragmentInput {
  @location(0) @interpolate(flat) texture : u32,
  @location(1) uv : vec2<f32>,
}

@fragment
fn fragment(fragment : FragmentInput) -> @location(0) vec4<f32> {
  return textureSample(atlas, atlasSampler, fragment.uv, i32(fragment.texture));
}
`;

class Cells {
  constructor({ renderer: { camera, device, format }, size, setup }) {
    const module = device.createShaderModule({
      code: Shader({ stride: size[0] }),
    });
    this.pipeline = device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        buffers: [
          {
            arrayStride: 1 * Float32Array.BYTES_PER_ELEMENT,
            stepMode: 'instance',
            attributes: [
              {
                shaderLocation: 0,
                offset: 0,
                format: 'uint32',
              },
            ],
          },
        ],
        entryPoint: 'vertex',
        module,
      },
      fragment: {
        entryPoint: 'fragment',
        module,
        targets: [{ format }],
      },
      primitive: {
        topology: 'triangle-list',
      },
    });
    this.bindings = device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: { buffer: camera.buffer },
        },
        {
          binding: 1,
          resource: Atlas(device),
        },
        {
          binding: 2,
          resource: device.createSampler({
            magFilter: 'linear',
            minFilter: 'linear',
          }),
        },
      ],
    });
    this.count = size[0] * size[1];
    this.instances = device.createBuffer({
      mappedAtCreation: true,
      size: this.count * Uint32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX,
    });
    setup(new Uint32Array(this.instances.getMappedRange()), size);
    this.instances.unmap();
  }

  render(pass) {
    const { bindings, count, instances, pipeline } = this;
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindings);
    pass.setVertexBuffer(0, instances);
    pass.draw(6, count);
  }
}

export default Cells;
