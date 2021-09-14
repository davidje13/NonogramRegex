import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default {
	input: 'src/index.ts',
	output: [{ file: 'build/index.js', format: 'iife' }],
	plugins: [
		typescript(),
		nodeResolve({ browser: true }),
		terser({ format: { ascii_only: true } }),
	],
};
