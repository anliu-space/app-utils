// rollup.config.js
import { defineConfig } from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
// import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import eslint from '@rollup/plugin-eslint';
import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import clear from 'rollup-plugin-clear';
import postcss from 'rollup-plugin-postcss';
import postcssUrl from 'postcss-url';
import monaco from 'rollup-plugin-monaco-editor';
import fs from 'fs-extra';

// Node 17.5+，你可以使用导入断言
// import pkg from './package.json' assert { type: 'json' };
// Node 旧版本
import { createRequire } from 'node:module';
import path from 'path';
const require = createRequire(import.meta.url);
const pkg = require('./package.json');

const pkgName = pkg.name
const banner = `
/**
 * ${pkg.name} v${pkg.version}
 * (c) 1990-${new Date().getFullYear()} ${pkg.author}
 * Released under the MIT License.
 */
`

export default defineConfig({
    input: './src/index.ts', // 入口文件
    output: [
        // {
        //     format: 'cjs', // 打包为commonjs格式
        //     name: 'dkalAppUtils', // 打包后的默认导出文件名称
        //     // file: `dist/${pkgName}.cjs.js`, // 打包后的文件路径名称
        //     dir: 'dist',
        //     entryFileNames: `${pkgName}.[format].js`,
        //     chunkFileNames: "[name]-[hash].[format].js",
        //     manualChunks: {
        //         dayjs: ['dayjs'],
        //         // 'monaco-editor': ['monaco-editor'],
        //     },
        //     // plugins: [terser()]
        // },
        {
            format: 'esm', // 打包为esm格式
            name: 'dkalAppUtils',
            // file: `dist/${pkgName}.esm.js`,
            dir: 'dist',
            entryFileNames: `${pkgName}.[format].js`,
            chunkFileNames: "[name]-[hash].[format].js",
            manualChunks: {
                dayjs: ['dayjs'],
                // 'monaco-editor': ['monaco-editor'],
            },
            // plugins: [terser()]
        },
        // {
        //     format: 'umd', // 打包为umd通用格式
        //     name: 'dkalAppUtils',
        //     // file: `dist/${pkgName}.umd.js`,
        //     dir: 'dist',
        //     entryFileNames: `${pkgName}.[format].js`,
        //     minifyInternalExports: true,
        //     // plugins: [terser()]
        // },
        // 打包给public展示demo目录使用
        {
            format: 'es',
            name: 'dkalAppUtils',
            // file: `public/${pkgName}.min.js`,
            dir: 'public',
            entryFileNames: `${pkgName}.[format].js`,
            chunkFileNames: "[name]-[hash].[format].js",
            sourcemap: true,
            manualChunks: {
                dayjs: ['dayjs'],
                // 'monaco-editor': ['monaco-editor'],
            },
            banner,
            // plugins: [terser()]
        }
    ],
    plugins: [
        // 将CommonJS的模块转为ES模块
        commonjs({
            exclude: 'node_modules/monaco-editor/**'
        }),
        // 在commonjs之后
        // babel({
        //     babelHelpers: 'bundled',
        //     // babel不转换外部依赖
        //     exclude: ['node_modules/**'],
        // }),
        clear({
            targets: ['dist'],
        }),
        typescript({ tsconfig: './tsconfig.json' }),
        json(),
        nodeResolve(),
        // 编译css插件
        postcss({
            plugins: [
                postcssUrl({
                    url: (asset) => {
                        if (!/\.ttf$/.test(asset.url)) return asset.url;
                        // eslint-disable-next-line no-undef
                        const distPath = path.join(process.cwd(), 'dist');
                        const distFontsPath = path.join(distPath, 'fonts');
                        fs.ensureDirSync(distFontsPath);
                        const targetFontPath = path.join(distFontsPath, asset.pathname);
                        fs.copySync(asset.absolutePath, targetFontPath);
                        // eslint-disable-next-line no-undef
                        const relativePath = path.relative(process.cwd(), targetFontPath);
                        const publicPath = '/';
                        return `${publicPath}${relativePath}`;
                    },
                }),
            ],
        }),
        monaco({
            // languages: ['json'],
            pathPrefix: './dist',
        }),
        eslint({
            // throwOnError: true, // 抛出异常并阻止打包
            include: ['src/**'],
            exclude: ['node_modules/**']
        }),
    ],
    // 视为外部依赖（不打入包内）
    // external: ['lodash']
    // external: ['monaco-editor']
});
