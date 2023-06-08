
/**
 * dkal-app-utils v1.0.1
 * (c) 1990-2023 anliu-space
 * Released under the MIT License.
 */

(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
import { l as dayjs } from './dayjs-19c6a114.es.js';
import { E as EditorView, r as basicSetup } from './codemirror-b829ae8b.es.js';
import { j as javascript } from './codemirror-lan-2b6ad035.es.js';

var name = "dkal-app-utils";
var version = "1.0.1";

function styleInject(css, ref) {
  if (ref === void 0) ref = {};
  var insertAt = ref.insertAt;
  if (!css || typeof document === 'undefined') {
    return;
  }
  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';
  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }
  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z = "#coder-container {\n    position: fixed;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    flex-direction: column;\n    background-color: #fff;\n}\n#coder-editor {\n    width: 400px;\n    height: 400px;\n    border: 1px solid grey;\n}\n#coder-btn {\n    margin-top: 10px;\n}\n";
styleInject(css_248z);

// 测试foo模块
var testFoo = function () {
    import('./foo-9f5f2140.es.js').then(function (_a) {
        var foo = _a.default;
        return console.log(foo);
    });
};
// 测试monaco插件
// const testMonaco = (codeStr?: string) =>{
//     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//     const $root = document.getElementById('container')!;
//     let editor;
//     if(codeStr!=null){
//         editor = (window as any).monaco.editor.create($root, {
//             value: ['function xx() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
//             language: 'javascript',
//         });
//     }else{
//         editor = (window as any).monaco.editor.create($root, {
//             value: '// 请输入javascript代码',
//             language: 'javascript',
//         });
//     }
//
//     console.log(editor.getValue());
//     (window as any).eval(editor.getValue());
// }
// 存储编辑器的变量
var coderEditor;
var testCodemirror = function (code) {
    var $body = document.body;
    var $container = document.createElement("div");
    var $coder = document.createElement("div");
    var $btn = document.createElement("button");
    $container.id = "coder-container";
    $coder.id = "coder-editor";
    $btn.id = "coder-btn";
    $btn.textContent = "确定";
    $container.appendChild($coder);
    $container.appendChild($btn);
    $body.insertBefore($container, $body.firstChild);
    $btn.onclick = function () {
        console.log(getCode());
        $container.style.display = "none";
    };
    if (typeof code != 'string') {
        coderEditor = new EditorView({
            doc: "let a = 123;",
            extensions: [basicSetup, javascript()],
            parent: $coder
        });
    }
    else {
        coderEditor = new EditorView({
            doc: code,
            extensions: [basicSetup, javascript()],
            parent: $coder
        });
    }
};
// 返回代码
var getCode = function () {
    return coderEditor.state.doc.toString();
};
// 输出工具包名称
function pluginInfo() {
    return "".concat(name, "(version: ").concat(version, ")");
}
// 工具方法开始 [->* start *<-]
// 将字符串转换为对象
var jsonConvertToObj = function (data) {
    if (typeof data === "string") {
        try {
            return JSON.parse(data);
        }
        catch (e) {
            return data;
        }
    }
    else {
        return data;
    }
};
// 获取数组第一个元素
var arrayFirst = function (arr) {
    var tmpData = jsonConvertToObj(arr);
    return tmpData[0];
};
// 数组拼接
var arrayJoin = function (arr, str) {
    var tmpData = jsonConvertToObj(arr);
    return tmpData.join(str);
};
// 数组添加元素
var listAdd = function (arr, ele) {
    var tmpData = jsonConvertToObj(arr);
    tmpData.push(ele);
    return arr;
};
// 数组删除元素
var listDelete = function (arr, index) {
    var tmpData = jsonConvertToObj(arr);
    var tmpI = jsonConvertToObj(index);
    tmpData.splice(index, tmpI);
    return tmpData;
};
// 字符串长度
var stringLength = function (str) {
    return str.length;
};
// 转为大写
var upperCase = function (str) {
    return str.toUpperCase();
};
// 转为小写
var lowerCase = function (str) {
    return str.toLowerCase();
};
// 替换所有
var replaceAll = function (str, sourceCharacter, targetCharacter) {
    return str.replaceAll(sourceCharacter, targetCharacter);
};
// 加
var mathAdd = function (first, second) {
    var tmpFirst = jsonConvertToObj(first);
    var tmpSecond = jsonConvertToObj(second);
    return tmpFirst + tmpSecond;
};
// 减
var mathReduce = function (first, second) {
    var tmpFirst = jsonConvertToObj(first);
    var tmpSecond = jsonConvertToObj(second);
    return tmpFirst - tmpSecond;
};
// 乘
var mathTake = function (first, second) {
    var tmpFirst = jsonConvertToObj(first);
    var tmpSecond = jsonConvertToObj(second);
    return tmpFirst * tmpSecond;
};
// 除
var mathDivision = function (first, second) {
    var tmpFirst = jsonConvertToObj(first);
    var tmpSecond = jsonConvertToObj(second);
    return tmpFirst / tmpSecond;
};
// 日期时间格式化
var dateFormat = function (date, tpl) {
    var tmpTpl = tpl.replaceAll("y", "Y");
    tmpTpl = tmpTpl.replaceAll("d", "D");
    return dayjs(date).format(tmpTpl);
};
// 字符串日期转时间戳
var dateParse = function (date) {
    return +dayjs(date);
};
// 时间差
var timeDiff = function (first, second) {
    return Math.abs(+dayjs(first) - (+dayjs(second)));
};

export { arrayFirst, arrayJoin, dateFormat, dateParse, getCode, listAdd, listDelete, lowerCase, mathAdd, mathDivision, mathReduce, mathTake, pluginInfo, replaceAll, stringLength, testCodemirror, testFoo, timeDiff, upperCase };
//# sourceMappingURL=dkal-app-utils.es.js.map
