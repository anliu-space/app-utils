
/**
 * dkal-app-utils v1.0.1
 * (c) 1990-2023 anliu-space
 * Released under the MIT License.
 */

import { _ as _typeof, b as _createForOfIteratorHelper } from './dayjs-baf73ada.es.js';
import { m as monaco_editor_core_star } from './monaco-editor-0817b0de.es.js';

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

// src/basic-languages/liquid/liquid.ts
var EMPTY_ELEMENTS = ["area", "base", "br", "col", "embed", "hr", "img", "input", "keygen", "link", "menuitem", "meta", "param", "source", "track", "wbr"];
var conf = {
  wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g,
  brackets: [["<!--", "-->"], ["<", ">"], ["{{", "}}"], ["{%", "%}"], ["{", "}"], ["(", ")"]],
  autoClosingPairs: [{
    open: "{",
    close: "}"
  }, {
    open: "%",
    close: "%"
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
    open: "<",
    close: ">"
  }, {
    open: '"',
    close: '"'
  }, {
    open: "'",
    close: "'"
  }],
  onEnterRules: [{
    beforeText: new RegExp("<(?!(?:".concat(EMPTY_ELEMENTS.join("|"), "))(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$"), "i"),
    afterText: /^<\/(\w[\w\d]*)\s*>$/i,
    action: {
      indentAction: monaco_editor_core_exports.languages.IndentAction.IndentOutdent
    }
  }, {
    beforeText: new RegExp("<(?!(?:".concat(EMPTY_ELEMENTS.join("|"), "))(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$"), "i"),
    action: {
      indentAction: monaco_editor_core_exports.languages.IndentAction.Indent
    }
  }]
};
var language = {
  defaultToken: "",
  tokenPostfix: "",
  builtinTags: ["if", "else", "elseif", "endif", "render", "assign", "capture", "endcapture", "case", "endcase", "comment", "endcomment", "cycle", "decrement", "for", "endfor", "include", "increment", "layout", "raw", "endraw", "render", "tablerow", "endtablerow", "unless", "endunless"],
  builtinFilters: ["abs", "append", "at_least", "at_most", "capitalize", "ceil", "compact", "date", "default", "divided_by", "downcase", "escape", "escape_once", "first", "floor", "join", "json", "last", "lstrip", "map", "minus", "modulo", "newline_to_br", "plus", "prepend", "remove", "remove_first", "replace", "replace_first", "reverse", "round", "rstrip", "size", "slice", "sort", "sort_natural", "split", "strip", "strip_html", "strip_newlines", "times", "truncate", "truncatewords", "uniq", "upcase", "url_decode", "url_encode", "where"],
  constants: ["true", "false"],
  operators: ["==", "!=", ">", "<", ">=", "<="],
  symbol: /[=><!]+/,
  identifier: /[a-zA-Z_][\w]*/,
  tokenizer: {
    root: [[/\{\%\s*comment\s*\%\}/, "comment.start.liquid", "@comment"], [/\{\{/, {
      token: "@rematch",
      switchTo: "@liquidState.root"
    }], [/\{\%/, {
      token: "@rematch",
      switchTo: "@liquidState.root"
    }], [/(<)([\w\-]+)(\/>)/, ["delimiter.html", "tag.html", "delimiter.html"]], [/(<)([:\w]+)/, ["delimiter.html", {
      token: "tag.html",
      next: "@otherTag"
    }]], [/(<\/)([\w\-]+)/, ["delimiter.html", {
      token: "tag.html",
      next: "@otherTag"
    }]], [/</, "delimiter.html"], [/\{/, "delimiter.html"], [/[^<{]+/]],
    comment: [[/\{\%\s*endcomment\s*\%\}/, "comment.end.liquid", "@pop"], [/./, "comment.content.liquid"]],
    otherTag: [[/\{\{/, {
      token: "@rematch",
      switchTo: "@liquidState.otherTag"
    }], [/\{\%/, {
      token: "@rematch",
      switchTo: "@liquidState.otherTag"
    }], [/\/?>/, "delimiter.html", "@pop"], [/"([^"]*)"/, "attribute.value"], [/'([^']*)'/, "attribute.value"], [/[\w\-]+/, "attribute.name"], [/=/, "delimiter"], [/[ \t\r\n]+/]],
    liquidState: [[/\{\{/, "delimiter.output.liquid"], [/\}\}/, {
      token: "delimiter.output.liquid",
      switchTo: "@$S2.$S3"
    }], [/\{\%/, "delimiter.tag.liquid"], [/raw\s*\%\}/, "delimiter.tag.liquid", "@liquidRaw"], [/\%\}/, {
      token: "delimiter.tag.liquid",
      switchTo: "@$S2.$S3"
    }], {
      include: "liquidRoot"
    }],
    liquidRaw: [[/^(?!\{\%\s*endraw\s*\%\}).+/], [/\{\%/, "delimiter.tag.liquid"], [/@identifier/], [/\%\}/, {
      token: "delimiter.tag.liquid",
      next: "@root"
    }]],
    liquidRoot: [[/\d+(\.\d+)?/, "number.liquid"], [/"[^"]*"/, "string.liquid"], [/'[^']*'/, "string.liquid"], [/\s+/], [/@symbol/, {
      cases: {
        "@operators": "operator.liquid",
        "@default": ""
      }
    }], [/\./], [/@identifier/, {
      cases: {
        "@constants": "keyword.liquid",
        "@builtinFilters": "predefined.liquid",
        "@builtinTags": "predefined.liquid",
        "@default": "variable.liquid"
      }
    }], [/[^}|%]/, "variable.liquid"]]
  }
};

export { conf, language };
//# sourceMappingURL=liquid-941f1d63.es.js.map
