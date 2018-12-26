import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import sourceMaps from 'rollup-plugin-sourcemaps';
import json from 'rollup-plugin-json';
import typescript from 'rollup-plugin-typescript2';
import {eslint} from 'rollup-plugin-eslint';
import {uglify} from 'rollup-plugin-uglify';
import {terser} from 'rollup-plugin-terser';
import pkg from './package.json';

const base = {
    input: 'src/index.ts',
    external: [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
    ],
    watch: {
        include: 'src/**'
    },
    plugins: [
        eslint(),
        json({compact: true}),
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
    ]
};

export default [
    {
        ...base,
        ...{
            output: {file: pkg.main, format: 'cjs', sourcemap: true},
            plugins: [...base.plugins, uglify()]
        }
    },
    {
        ...base,
        ...{
            output: {file: pkg.module, format: 'es', sourcemap: true},
            plugins: [...base.plugins, terser()]
        }
    }
];
