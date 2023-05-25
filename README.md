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
    "test": "jest",
    "build": "rollup -c"
  },
  "main": "dist/ts-utils.cjs.js",
  "module": "dist/ts-utils.esm.js",
  "browser": "dist/ts-utils.umd.js",
  "types": "src/index.d.ts",
  "type": "module",
  "files": [
    "src",
    "dist/*.js"
  ],
  "devDependencies": {
    "@babel/core": "^7.21.8",
    "@babel/preset-env": "^7.21.5",
    "@babel/preset-typescript": "^7.21.5",
    "@rollup/plugin-node-resolve": "^15.0.2",
    "@rollup/plugin-typescript": "^11.1.1",
    "@types/jest": "^29.5.1",
    "@types/node": "^20.2.3",
    "babel-jest": "^29.5.0",
    "jest": "^29.5.0",
    "rollup": "^3.23.0",
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



创建配置文件`.js`：

```js
// rollup.config.js
import { defineConfig } from 'rollup';

export default defineConfig({
	/* 你的配置 */
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
        "useUnknownInCatchVariables": false
    }
}

```





## 4.3 安装配置`jest`

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



创建配置文件`.eslintrc.json`：

```json
{
  
}
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





