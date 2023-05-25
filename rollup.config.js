// rollup.config.js
import { defineConfig } from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import eslint from '@rollup/plugin-eslint';
import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import clear from 'rollup-plugin-clear';

const pkgName = 'app-utils'

export default defineConfig({
    input: './src/index.ts', // 入口文件
    output: [
        {
            format: 'cjs', // 打包为commonjs格式
            file: `dist/${pkgName}.cjs.js`, // 打包后的文件路径名称
            name: 'appUtils', // 打包后的默认导出文件名称
            plugins: [terser()]
        },
        {
            format: 'esm', // 打包为esm格式
            file: `dist/${pkgName}.esm.js`,
            name: 'appUtils',
            plugins: [terser()]
        },
        {
            format: 'umd', // 打包为umd通用格式
            file: `dist/${pkgName}.umd.js`,
            name: 'appUtils',
            minifyInternalExports: true,
            plugins: [terser()]
        },
        // 打包给public展示demo目录使用
        {
            name: 'appUtils',
            file: `public/${pkgName}.min.js`,
            format: 'iife',
            sourcemap: true,
            // plugins: [terser()]
        }
    ],
    plugins: [
        clear({
            targets: ['dist'],
        }),
        commonjs({
            include: 'node_modules/**'
        }),
        typescript({ tsconfig: './tsconfig.json' }),
        json(),
        nodeResolve(),
        eslint({
            // throwOnError: true, // 抛出异常并阻止打包
            include: ['src/**'],
            exclude: ['node_modules/**']
        }),
        babel({ babelHelpers: 'bundled' }),
    ]
});
