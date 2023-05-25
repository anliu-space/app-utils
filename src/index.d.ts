
declare namespace appUtils {
    /**
     * 打印插件名称（版本号）
     * @returns string 类型
     */
    export function pluginName():string
}

declare module 'app-utils' {
    export = appUtils
}
