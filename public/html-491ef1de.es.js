
/**
 * dkal-app-utils v1.0.1
 * (c) 1990-2023 anliu-space
 * Released under the MIT License.
 */

import { _ as _typeof, b as _createForOfIteratorHelper } from './dayjs-baf73ada.es.js';
import { m as monaco_editor_core_star } from './index-6ff10d2a.es.js';

/*!-----------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Version: 0.38.0(0e330ae453813de4e6cf272460fb79c7117073d0)
 * Released under the MIT license
 * https://github.com/microsoft/monaco-editor/blob/main/LICENSE.txt
 *-----------------------------------------------------------------------------*/

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = function __copyProps(to, from, except, desc) {
  if (from && _typeof(from) === "object" || typeof from === "function") {
    var _iterator = _createForOfIteratorHelper(__getOwnPropNames(from)),
      _step;
    try {
      var _loop = function _loop() {
        var key = _step.value;
        if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
          get: function get() {
            return from[key];
          },
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
      };
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        _loop();
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  }
  return to;
};
var __reExport = function __reExport(target, mod, secondTarget) {
  return __copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default");
};

// src/fillers/monaco-editor-core.ts
var monaco_editor_core_exports = {};
__reExport(monaco_editor_core_exports, monaco_editor_core_star);

// src/basic-languages/html/html.ts
var EMPTY_ELEMENTS = ["area", "base", "br", "col", "embed", "hr", "img", "input", "keygen", "link", "menuitem", "meta", "param", "source", "track", "wbr"];
var conf = {
  wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g,
  comments: {
    blockComment: ["<!--", "-->"]
  },
  brackets: [["<!--", "-->"], ["<", ">"], ["{", "}"], ["(", ")"]],
  autoClosingPairs: [{
    open: "{",
    close: "}"
  }, {
    open: "[",
    close: "]"
  }, {
    open: "(",
    close: ")"
  }, {
    open: '"',
    close: '"'
  }, {
    open: "'",
    close: "'"
  }],
  surroundingPairs: [{
    open: '"',
    close: '"'
  }, {
    open: "'",
    close: "'"
  }, {
    open: "{",
    close: "}"
  }, {
    open: "[",
    close: "]"
  }, {
    open: "(",
    close: ")"
  }, {
    open: "<",
    close: ">"
  }],
  onEnterRules: [{
    beforeText: new RegExp("<(?!(?:".concat(EMPTY_ELEMENTS.join("|"), "))([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)[^<]*$"), "i"),
    afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>$/i,
    action: {
      indentAction: monaco_editor_core_exports.languages.IndentAction.IndentOutdent
    }
  }, {
    beforeText: new RegExp("<(?!(?:".concat(EMPTY_ELEMENTS.join("|"), "))(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$"), "i"),
    action: {
      indentAction: monaco_editor_core_exports.languages.IndentAction.Indent
    }
  }],
  folding: {
    markers: {
      start: new RegExp("^\\s*<!--\\s*#region\\b.*-->"),
      end: new RegExp("^\\s*<!--\\s*#endregion\\b.*-->")
    }
  }
};
var language = {
  defaultToken: "",
  tokenPostfix: ".html",
  ignoreCase: true,
  tokenizer: {
    root: [[/<!DOCTYPE/, "metatag", "@doctype"], [/<!--/, "comment", "@comment"], [/(<)((?:[\w\-]+:)?[\w\-]+)(\s*)(\/>)/, ["delimiter", "tag", "", "delimiter"]], [/(<)(script)/, ["delimiter", {
      token: "tag",
      next: "@script"
    }]], [/(<)(style)/, ["delimiter", {
      token: "tag",
      next: "@style"
    }]], [/(<)((?:[\w\-]+:)?[\w\-]+)/, ["delimiter", {
      token: "tag",
      next: "@otherTag"
    }]], [/(<\/)((?:[\w\-]+:)?[\w\-]+)/, ["delimiter", {
      token: "tag",
      next: "@otherTag"
    }]], [/</, "delimiter"], [/[^<]+/]],
    doctype: [[/[^>]+/, "metatag.content"], [/>/, "metatag", "@pop"]],
    comment: [[/-->/, "comment", "@pop"], [/[^-]+/, "comment.content"], [/./, "comment.content"]],
    otherTag: [[/\/?>/, "delimiter", "@pop"], [/"([^"]*)"/, "attribute.value"], [/'([^']*)'/, "attribute.value"], [/[\w\-]+/, "attribute.name"], [/=/, "delimiter"], [/[ \t\r\n]+/]],
    script: [[/type/, "attribute.name", "@scriptAfterType"], [/"([^"]*)"/, "attribute.value"], [/'([^']*)'/, "attribute.value"], [/[\w\-]+/, "attribute.name"], [/=/, "delimiter"], [/>/, {
      token: "delimiter",
      next: "@scriptEmbedded",
      nextEmbedded: "text/javascript"
    }], [/[ \t\r\n]+/], [/(<\/)(script\s*)(>)/, ["delimiter", "tag", {
      token: "delimiter",
      next: "@pop"
    }]]],
    scriptAfterType: [[/=/, "delimiter", "@scriptAfterTypeEquals"], [/>/, {
      token: "delimiter",
      next: "@scriptEmbedded",
      nextEmbedded: "text/javascript"
    }], [/[ \t\r\n]+/], [/<\/script\s*>/, {
      token: "@rematch",
      next: "@pop"
    }]],
    scriptAfterTypeEquals: [[/"module"/, {
      token: "attribute.value",
      switchTo: "@scriptWithCustomType.text/javascript"
    }], [/'module'/, {
      token: "attribute.value",
      switchTo: "@scriptWithCustomType.text/javascript"
    }], [/"([^"]*)"/, {
      token: "attribute.value",
      switchTo: "@scriptWithCustomType.$1"
    }], [/'([^']*)'/, {
      token: "attribute.value",
      switchTo: "@scriptWithCustomType.$1"
    }], [/>/, {
      token: "delimiter",
      next: "@scriptEmbedded",
      nextEmbedded: "text/javascript"
    }], [/[ \t\r\n]+/], [/<\/script\s*>/, {
      token: "@rematch",
      next: "@pop"
    }]],
    scriptWithCustomType: [[/>/, {
      token: "delimiter",
      next: "@scriptEmbedded.$S2",
      nextEmbedded: "$S2"
    }], [/"([^"]*)"/, "attribute.value"], [/'([^']*)'/, "attribute.value"], [/[\w\-]+/, "attribute.name"], [/=/, "delimiter"], [/[ \t\r\n]+/], [/<\/script\s*>/, {
      token: "@rematch",
      next: "@pop"
    }]],
    scriptEmbedded: [[/<\/script/, {
      token: "@rematch",
      next: "@pop",
      nextEmbedded: "@pop"
    }], [/[^<]+/, ""]],
    style: [[/type/, "attribute.name", "@styleAfterType"], [/"([^"]*)"/, "attribute.value"], [/'([^']*)'/, "attribute.value"], [/[\w\-]+/, "attribute.name"], [/=/, "delimiter"], [/>/, {
      token: "delimiter",
      next: "@styleEmbedded",
      nextEmbedded: "text/css"
    }], [/[ \t\r\n]+/], [/(<\/)(style\s*)(>)/, ["delimiter", "tag", {
      token: "delimiter",
      next: "@pop"
    }]]],
    styleAfterType: [[/=/, "delimiter", "@styleAfterTypeEquals"], [/>/, {
      token: "delimiter",
      next: "@styleEmbedded",
      nextEmbedded: "text/css"
    }], [/[ \t\r\n]+/], [/<\/style\s*>/, {
      token: "@rematch",
      next: "@pop"
    }]],
    styleAfterTypeEquals: [[/"([^"]*)"/, {
      token: "attribute.value",
      switchTo: "@styleWithCustomType.$1"
    }], [/'([^']*)'/, {
      token: "attribute.value",
      switchTo: "@styleWithCustomType.$1"
    }], [/>/, {
      token: "delimiter",
      next: "@styleEmbedded",
      nextEmbedded: "text/css"
    }], [/[ \t\r\n]+/], [/<\/style\s*>/, {
      token: "@rematch",
      next: "@pop"
    }]],
    styleWithCustomType: [[/>/, {
      token: "delimiter",
      next: "@styleEmbedded.$S2",
      nextEmbedded: "$S2"
    }], [/"([^"]*)"/, "attribute.value"], [/'([^']*)'/, "attribute.value"], [/[\w\-]+/, "attribute.name"], [/=/, "delimiter"], [/[ \t\r\n]+/], [/<\/style\s*>/, {
      token: "@rematch",
      next: "@pop"
    }]],
    styleEmbedded: [[/<\/style/, {
      token: "@rematch",
      next: "@pop",
      nextEmbedded: "@pop"
    }], [/[^<]+/, ""]]
  }
};

export { conf, language };
//# sourceMappingURL=html-491ef1de.es.js.map
