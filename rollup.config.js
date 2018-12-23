import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';
import {eslint} from 'rollup-plugin-eslint';
import {terser} from 'rollup-plugin-terser';
import pkg from './package.json';

export default {
    input: 'src/index.ts',
    output: {file: pkg.main, format: 'es', sourcemap: true},
    external: [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
    ],
    watch: {
        include: 'src/**'
    },
    plugins: [
        eslint(),
        resolve({
            jsnext: true,
            main: true,
            browser: true
        }),
        commonjs(),
        typescript({
            typescript: require('typescript'),
            rollupCommonJSResolveHack: true
        }),
        sourceMaps(),
        terser(),
    ]
};
