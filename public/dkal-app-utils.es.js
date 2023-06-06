
/**
 * dkal-app-utils v1.0.1
 * (c) 1990-2023 anliu-space
 * Released under the MIT License.
 */

import { d as dayjs } from './dayjs-8eed0759.es.js';

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

var css_248z = "#container {\n    position: fixed;\n    top: 50%;\n    left: 50%;\n    transform: translate(-50%, -50%);\n}\n";
styleInject(css_248z);

// 测试foo模块
var testFoo = function () {
    import('./foo-5fd7f5d8.es.js').then(function (_a) {
        var foo = _a.default;
        return console.log(foo);
    });
};
// 测试monaco插件
var testMonaco = function (codeStr) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    var $root = document.getElementById('container');
    var editor;
    if (codeStr != null) {
        editor = window.monaco.editor.create($root, {
            value: ['function xx() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
            language: 'javascript',
        });
    }
    else {
        editor = window.monaco.editor.create($root, {
            value: '// 请输入javascript代码',
            language: 'javascript',
        });
    }
    console.log(editor.getValue());
    window.eval(editor.getValue());
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

export { arrayFirst, arrayJoin, dateFormat, dateParse, listAdd, listDelete, lowerCase, mathAdd, mathDivision, mathReduce, mathTake, pluginInfo, replaceAll, stringLength, testFoo, testMonaco, timeDiff, upperCase };
//# sourceMappingURL=dkal-app-utils.es.js.map
