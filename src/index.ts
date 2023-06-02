import { name, version } from '../package.json';
import _ from 'lodash';

// 测试foo模块
const testFoo = ()=>{
    import("./foo").then(({default: foo})=>console.log(foo));
    console.log(_.max([1,2]));
}

// 输出工具包名称
function pluginName():string {
    return `${name}(version: ${version})`;
}

// 获取数组第一个元素
function getArrFirstElement(arr: string[]|number[]) {
    return arr[0];
}


// 数组拼接
function concatArr(arr:string[], str:string) {
    return arr.concat(str);
}

// 数组添加数据
function addToArr(arr:string[], ele: string) {
    arr.push(ele);
    return arr;
}

export { testFoo, pluginName, getArrFirstElement, concatArr, addToArr, }


