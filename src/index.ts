import { name, version } from '../package.json';

// 输出工具包名称
export function pluginName():string {
    return `${name}(version: ${version})`;
}
