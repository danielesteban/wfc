import fs from 'fs';
import path from 'path';
import html from '@rollup/plugin-html';
import livereload from 'rollup-plugin-livereload';
import postcss from 'rollup-plugin-postcss';
import resolve from '@rollup/plugin-node-resolve';
import serve from 'rollup-plugin-serve';
import { terser } from 'rollup-plugin-terser';
import url from '@rollup/plugin-url';

const outputPath = path.resolve(__dirname, 'dist');
const production = !process.env.ROLLUP_WATCH;
const token = production ? (
  'AoJyP33eVnFyfG8OXYUVDKzfrO+awquBDHkWKJFW91Pc0AMbQw0yvQ/4Imm5g/ELfI269P7ut9kCU21Iai7AkQwAAABPeyJvcmlnaW4iOiJodHRwczovL3dmYy5nYXR1bmVzLmNvbTo0NDMiLCJmZWF0dXJlIjoiV2ViR1BVIiwiZXhwaXJ5IjoxNjc1MjA5NTk5fQ=='
) : (
  'AkoE8+yWvZMfOjxrWIWvq/aMz5KEEkAlww7Bx2CAzx3UG3J1wdvOGTgLm48isIN9VbQbJjo0AKfKDVktsf4q7AoAAABJeyJvcmlnaW4iOiJodHRwOi8vbG9jYWxob3N0OjgwODAiLCJmZWF0dXJlIjoiV2ViR1BVIiwiZXhwaXJ5IjoxNjc1MjA5NTk5fQ=='
);

export default {
  input: path.join(__dirname, 'src', 'main.js'),
  output: {
    dir: outputPath,
    format: 'iife',
  },
  plugins: [
    postcss({
      extract: 'main.css',
      minimize: production,
    }),
    resolve({
      browser: true,
    }),
    html({
      template: ({ files }) => (
        fs.readFileSync(path.join(__dirname, 'src', 'index.html'), 'utf8')
          .replace('__TOKEN__', token)
          .replace(
            '<link rel="stylesheet">',
            (files.css || [])
              .map(({ fileName }) => `<link rel="stylesheet" href="/${fileName}">`)
              .join('\n')
          )
          .replace(
            '<script></script>',
            (files.js || [])
              .map(({ fileName }) => `<script defer src="/${fileName}"></script>`)
              .join('\n')
          )
      ),
    }),
    url({
      limit: 0,
      include: ['**/*.png'],
    }),
    ...(production ? [
      terser({ format: { comments: false } }),
      {
        name: 'cname',
        writeBundle() {
          fs.writeFileSync(path.join(outputPath, 'CNAME'), 'wfc.gatunes.com');
        },
      },
    ] : [
      serve({
        contentBase: outputPath,
        port: 8080,
      }),
      livereload(outputPath),
    ]),
  ],
  watch: { clearScreen: false },
};
