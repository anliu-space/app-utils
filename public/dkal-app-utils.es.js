self["MonacoEnvironment"] = (function (paths) {
            function stripTrailingSlash(str) {
              return str.replace(/\/$/, '');
            }
            return {
              getWorkerUrl: function (moduleId, label) {
                var pathPrefix = "./dist";
                var result = (pathPrefix ? stripTrailingSlash(pathPrefix) + '/' : '') + paths[label];
                if (/^((http:)|(https:)|(file:)|(\/\/))/.test(result)) {
                  var currentUrl = String(window.location);
                  var currentOrigin = currentUrl.substr(0, currentUrl.length - window.location.hash.length - window.location.search.length - window.location.pathname.length);
                  if (result.substring(0, currentOrigin.length) !== currentOrigin) {
                    var js = '/*' + label + '*/importScripts("' + result + '");';
                    var blob = new Blob([js], { type: 'application/javascript' });
                    return URL.createObjectURL(blob);
                  }
                }
                return result;
              }
            };
          })({
  "editorWorkerService": "monaco-editor/esm/vs/editor/editor.worker.js",
  "css": "monaco-editor/esm/vs/language/css/css.worker.js",
  "html": "monaco-editor/esm/vs/language/html/html.worker.js",
  "json": "monaco-editor/esm/vs/language/json/json.worker.js",
  "typescript": "monaco-editor/esm/vs/language/typescript/ts.worker.js"
});

/**
 * dkal-app-utils v1.0.1
 * (c) 1990-2023 anliu-space
 * Released under the MIT License.
 */

export { c as arrayFirst, d as arrayJoin, n as dateFormat, o as dateParse, f as listAdd, g as listDelete, h as lowerCase, m as mathAdd, k as mathDivision, i as mathReduce, j as mathTake, p as pluginInfo, r as replaceAll, s as stringLength, t as testFoo, b as testMonaco, q as timeDiff, u as upperCase } from './index-0290230e.es.js';
import './dayjs-224d6dea.es.js';
import './editorSimpleWorker-bc140aa4.es.js';
//# sourceMappingURL=dkal-app-utils.es.js.map
