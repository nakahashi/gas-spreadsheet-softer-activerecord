import cleanup from 'rollup-plugin-cleanup';
import prettier from 'rollup-plugin-prettier';
import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'src/main.ts',
  output: {
    dir: 'dist',
    format: 'esm',
  },
  plugins: [
    nodeResolve({
      extensions: ['.ts', '.js'],
    }),
    typescript({ tsconfig: 'tsconfig.json' }),
    cleanup({ comments: 'none', extensions: ['.ts'] }),
    prettier({ parser: 'typescript' }),
  ],
  context: 'this',
};
