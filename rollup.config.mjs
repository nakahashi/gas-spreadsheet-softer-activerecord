import cleanup from 'rollup-plugin-cleanup';
import prettier from 'rollup-plugin-prettier';
import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'esm',
  },
  plugins: [
    typescript({
      tsconfig: 'tsconfig.json',
      tsconfigOverride: {
        compilerOptions: {
          declaration: true,
          declarationDir: 'dist',
        },
      },
    }),
    cleanup({ comments: 'none', extensions: ['.ts'] }),
    prettier({ parser: 'typescript' }),
  ],
  external: [
    // Google Apps Script global objects are external
  ],
  context: 'this',
};
