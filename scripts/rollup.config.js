import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import alias from '@rollup/plugin-alias';

export default {
  input: 'src/main.ts',
  output: {
    file: 'dist/photo.js',
    format: 'es',
    inlineDynamicImports: true
  },
  plugins: [typescript(), nodeResolve(), commonjs(), json(),
    alias({
      entries: [
        { 
          find: '@', 
          replacement: './src'
        },
        { 
          find: 'config', 
          replacement: './conf/config.json' 
        }
      ]
    }),
  ],
};