import { name, version } from '../package.json';
import dayjs from 'dayjs';
import './style.css';

// 测试foo模块
const testFoo = ()=>{
    import("./foo").then(({default: foo})=>console.log(foo));
}

// 测试monaco插件
const testMonaco = (codeStr?: string) =>{
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const $root = document.getElementById('container')!;
    let editor;
    if(codeStr!=null){
        editor = (window as any).monaco.editor.create($root, {
            value: ['function xx() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
            language: 'javascript',
        });
    }else{
        editor = (window as any).monaco.editor.create($root, {
            value: '// 请输入javascript代码',
            language: 'javascript',
        });
    }

    console.log(editor.getValue());
    (window as any).eval(editor.getValue());
}

// 输出工具包名称
function pluginInfo():string {
    return `${name}(version: ${version})`;
}

// 工具方法开始 [->* start *<-]
// 将字符串转换为对象
const jsonConvertToObj = (data: string)=>{
    if(typeof data === "string"){
        try {
            return JSON.parse(data);
        }catch (e){
            return data;
        }
    }else{
        return data;
    }
}
// 获取数组第一个元素
const arrayFirst = (arr:string) =>{
    const tmpData = jsonConvertToObj(arr);
    return tmpData[0];
}

// 数组拼接
const arrayJoin = (arr:string, str:string) =>{
    const tmpData = jsonConvertToObj(arr);
    return tmpData.join(str);
}

// 数组添加元素
const listAdd = (arr:string, ele: string) =>{
    const tmpData = jsonConvertToObj(arr);
    tmpData.push(ele);
    return arr;
}

// 数组删除元素
const listDelete = (arr:string, index: string)=>{
    const tmpData = jsonConvertToObj(arr);
    const tmpI = jsonConvertToObj(index);
    tmpData.splice(index, tmpI);
    return tmpData;
}

// 字符串长度
const stringLength = (str: string)=>{
    return str.length;
}

// 转为大写
const upperCase = (str: string)=>{
    return str.toUpperCase();
}

// 转为小写
const lowerCase = (str: string)=>{
    return str.toLowerCase();
}

// 替换所有
const replaceAll = (str: string,sourceCharacter: string, targetCharacter: string)=>{
    return str.replaceAll(sourceCharacter, targetCharacter);
}

// 加
const mathAdd = (first: string, second: string)=>{
    const tmpFirst = jsonConvertToObj(first);
    const tmpSecond = jsonConvertToObj(second);
    return tmpFirst + tmpSecond;
}

// 减
const mathReduce = (first: string, second: string)=>{
    const tmpFirst = jsonConvertToObj(first);
    const tmpSecond = jsonConvertToObj(second);
    return tmpFirst - tmpSecond;
}

// 乘
const mathTake = (first: string, second: string)=>{
    const tmpFirst = jsonConvertToObj(first);
    const tmpSecond = jsonConvertToObj(second);
    return tmpFirst * tmpSecond;
}

// 除
const mathDivision = (first: string, second: string)=>{
    const tmpFirst = jsonConvertToObj(first);
    const tmpSecond = jsonConvertToObj(second);
    return tmpFirst / tmpSecond;
}

// 日期时间格式化
const dateFormat = (date: string, tpl: string)=>{
    let tmpTpl = tpl.replaceAll("y","Y");
    tmpTpl = tmpTpl.replaceAll("d","D");
    return dayjs(date).format(tmpTpl);
}

// 字符串日期转时间戳
const dateParse = (date: string)=>{
    return +dayjs(date);
}

// 时间差
const timeDiff = (first: string, second: string)=>{
    return Math.abs(+dayjs(first) - (+dayjs(second)));
}

/**
** 模板
    //
    const funName = ()=>{}
**/

// 工具方法开始 [->* end *<-]

export {
    testFoo,
    testMonaco,
    pluginInfo,
    arrayFirst,
    arrayJoin,
    listAdd,
    listDelete,
    stringLength,
    upperCase,
    lowerCase,
    replaceAll,
    mathAdd,
    mathReduce,
    mathTake,
    mathDivision,
    dateFormat,
    dateParse,
    timeDiff
}


