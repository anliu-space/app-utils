# app-utils
this package is an app-utils for "hc mobile web app"



# 1. 创建git项目

项目名称： `app-utils`

# 2. 本地初始化项目

```shell
> git clone "项目地址/app-utils"
> cd app-utils/
> pnpm init
```

编辑`package.json`文件

```json
{
  "name": "app-utils",
  "version": "1.0.0",
  "description": "this package is an app-utils for \"hc mobile web app\"",
  "keywords": [
    "app-utils",
    "utils"
  ],
  "author": "anliu-space",
  "license": "MIT",
  "scripts": {
    "build": "rollup -c",
    "watch": "rollup -c -w",
    "dev": "npm-run-all --parallel start watch",
    "start": "serve public",
    "lint": "eslint"
  },
  "main": "dist/app-utils.cjs.js",
  "module": "dist/app-utils.esm.js",
  "browser": "dist/app-utils.umd.js",
  "types": "src/index.d.ts",
  "type": "module",
  "files": [
    "src",
    "dist/*.js"
  ],
  "devDependencies": {
    "@babel/core": "^7.21.8",
    "@babel/preset-env": "^7.21.5",
    "@rollup/plugin-babel": "^6.0.3",
    "@rollup/plugin-commonjs": "^25.0.0",
    "@rollup/plugin-eslint": "^9.0.4",
    "@rollup/plugin-json": "^6.0.0",
    "@rollup/plugin-node-resolve": "^15.0.2",
    "@rollup/plugin-terser": "^0.4.3",
    "@rollup/plugin-typescript": "^11.1.1",
    "@types/node": "^20.2.3",
    "@typescript-eslint/eslint-plugin": "^5.59.7",
    "@typescript-eslint/parser": "^5.59.7",
    "npm-run-all": "^4.1.5",
    "rollup": "^3.23.0",
    "rollup-plugin-clear": "^2.0.7",
    "serve": "^14.2.0",
    "tslib": "^2.5.2"
  }
}

```



# 3. 项目目录

- app-utils/
  - dist/
  - example/
  - src/
  - test/
  - .gitignore
  - package.json



# 4. 项目框架

依赖：

- 🍭 使用`rollup`打包

- 🍭 使用`typescript`开发

- 🍭 使用`jest`单元测试

- 🍭 使用`eslint`代码校验

- 🍭 使用`babel`转换导出代码

## 4.1 安装配置`rollup`

安装依赖：

```shell
> pnpm add -D rollup

# 用于 Rollup 和 Typescript 之间无缝集成的 Rollup 插件
> pnpm add -D @rollup/plugin-typescript

# 支持正则表达式过滤掉包的引入
# 使用 Node 解析算法定位模块，以便在 node_modules 中使用第三方模块。
> pnpm add -D @rollup/plugin-node-resolve

# 用于使用 Terser 生成压缩的捆绑包
> pnpm add -D @rollup/plugin-terser
```



创建配置文件`rollup.config.js`：

```js
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

```





## 4.2 配置支持`typescript`

安装依赖：

```shell
# 支持TypeScript 运行时库，包含了所有 TypeScript 辅助函数。
> pnpm add -D tslib

# 支持node语法类型提示
> pnpm add -D @types/node
```



创建配置文件`tsconfig.json`：

```json
{
    "include": ["src/**/*/*.ts", "src/**/*.ts", "src/*.ts", "test/*.*.ts", "test/*/*.*.ts"],
    "output": "./dist/",
    "paths": {
        "src/*": ["src/*", "src/*/*"]
    },
    "compilerOptions": {
        "target": "es5",
        "moduleResolution": "node",
        "strict": true,
        "esModuleInterop": true,
        "useUnknownInCatchVariables": false,
        "resolveJsonModule": true
    }
}

```





## 4.3 安装配置`jest`(暂未用到，可以先不装)

安装依赖：

```shell
> pnpm add -D -D @types/jest babel-jest jest @babel/core @babel/preset-env @babel/preset-typescript
```



创建配置文件` jest.conf.js`：

```js
module.exports = {
  transform: {},
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['js', 'json', 'jsx', 'node', 'ts']
}
```





## 4.4 安装配置`eslint`

安装依赖：

```shell
> pnpm add -D @rollup/plugin-eslint 
> pnpm add -D @typescript-eslint/parser @typescript-eslint/eslint-plugin
```



创建配置文件`.eslintrc.cjs`：

```js
/* eslint-env node */
module.exports = {
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    root: true,
};

```





## 4.5 安装配置`babel`

安装依赖：

```shell
> pnpm add -D @rollup/plugin-babel
> pnpm add -D @babel/core @babel/preset-env
```



创建配置文件`babel.config.js`：

```js
module.exports = {
    presets: [
        ['@babel/preset-env', {
            // rollupjs 会处理模块，所以设置成 false
            modules: false
        }]
    ],
    plugins: [
    ]
}

```





