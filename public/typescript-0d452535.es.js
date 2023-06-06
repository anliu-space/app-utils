
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

// src/basic-languages/typescript/typescript.ts
var conf = {
  wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
  comments: {
    lineComment: "//",
    blockComment: ["/*", "*/"]
  },
  brackets: [["{", "}"], ["[", "]"], ["(", ")"]],
  onEnterRules: [{
    beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
    afterText: /^\s*\*\/$/,
    action: {
      indentAction: monaco_editor_core_exports.languages.IndentAction.IndentOutdent,
      appendText: " * "
    }
  }, {
    beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
    action: {
      indentAction: monaco_editor_core_exports.languages.IndentAction.None,
      appendText: " * "
    }
  }, {
    beforeText: /^(\t|(\ \ ))*\ \*(\ ([^\*]|\*(?!\/))*)?$/,
    action: {
      indentAction: monaco_editor_core_exports.languages.IndentAction.None,
      appendText: "* "
    }
  }, {
    beforeText: /^(\t|(\ \ ))*\ \*\/\s*$/,
    action: {
      indentAction: monaco_editor_core_exports.languages.IndentAction.None,
      removeText: 1
    }
  }],
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
    close: '"',
    notIn: ["string"]
  }, {
    open: "'",
    close: "'",
    notIn: ["string", "comment"]
  }, {
    open: "`",
    close: "`",
    notIn: ["string", "comment"]
  }, {
    open: "/**",
    close: " */",
    notIn: ["string"]
  }],
  folding: {
    markers: {
      start: new RegExp("^\\s*//\\s*#?region\\b"),
      end: new RegExp("^\\s*//\\s*#?endregion\\b")
    }
  }
};
var language = {
  defaultToken: "invalid",
  tokenPostfix: ".ts",
  keywords: ["abstract", "any", "as", "asserts", "bigint", "boolean", "break", "case", "catch", "class", "continue", "const", "constructor", "debugger", "declare", "default", "delete", "do", "else", "enum", "export", "extends", "false", "finally", "for", "from", "function", "get", "if", "implements", "import", "in", "infer", "instanceof", "interface", "is", "keyof", "let", "module", "namespace", "never", "new", "null", "number", "object", "out", "package", "private", "protected", "public", "override", "readonly", "require", "global", "return", "satisfies", "set", "static", "string", "super", "switch", "symbol", "this", "throw", "true", "try", "type", "typeof", "undefined", "unique", "unknown", "var", "void", "while", "with", "yield", "async", "await", "of"],
  operators: ["<=", ">=", "==", "!=", "===", "!==", "=>", "+", "-", "**", "*", "/", "%", "++", "--", "<<", "</", ">>", ">>>", "&", "|", "^", "!", "~", "&&", "||", "??", "?", ":", "=", "+=", "-=", "*=", "**=", "/=", "%=", "<<=", ">>=", ">>>=", "&=", "|=", "^=", "@"],
  symbols: /[=><!~?:&|+\-*\/\^%]+/,
  escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
  digits: /\d+(_+\d+)*/,
  octaldigits: /[0-7]+(_+[0-7]+)*/,
  binarydigits: /[0-1]+(_+[0-1]+)*/,
  hexdigits: /[[0-9a-fA-F]+(_+[0-9a-fA-F]+)*/,
  regexpctl: /[(){}\[\]\$\^|\-*+?\.]/,
  regexpesc: /\\(?:[bBdDfnrstvwWn0\\\/]|@regexpctl|c[A-Z]|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4})/,
  tokenizer: {
    root: [[/[{}]/, "delimiter.bracket"], {
      include: "common"
    }],
    common: [[/[a-z_$][\w$]*/, {
      cases: {
        "@keywords": "keyword",
        "@default": "identifier"
      }
    }], [/[A-Z][\w\$]*/, "type.identifier"], {
      include: "@whitespace"
    }, [/\/(?=([^\\\/]|\\.)+\/([dgimsuy]*)(\s*)(\.|;|,|\)|\]|\}|$))/, {
      token: "regexp",
      bracket: "@open",
      next: "@regexp"
    }], [/[()\[\]]/, "@brackets"], [/[<>](?!@symbols)/, "@brackets"], [/!(?=([^=]|$))/, "delimiter"], [/@symbols/, {
      cases: {
        "@operators": "delimiter",
        "@default": ""
      }
    }], [/(@digits)[eE]([\-+]?(@digits))?/, "number.float"], [/(@digits)\.(@digits)([eE][\-+]?(@digits))?/, "number.float"], [/0[xX](@hexdigits)n?/, "number.hex"], [/0[oO]?(@octaldigits)n?/, "number.octal"], [/0[bB](@binarydigits)n?/, "number.binary"], [/(@digits)n?/, "number"], [/[;,.]/, "delimiter"], [/"([^"\\]|\\.)*$/, "string.invalid"], [/'([^'\\]|\\.)*$/, "string.invalid"], [/"/, "string", "@string_double"], [/'/, "string", "@string_single"], [/`/, "string", "@string_backtick"]],
    whitespace: [[/[ \t\r\n]+/, ""], [/\/\*\*(?!\/)/, "comment.doc", "@jsdoc"], [/\/\*/, "comment", "@comment"], [/\/\/.*$/, "comment"]],
    comment: [[/[^\/*]+/, "comment"], [/\*\//, "comment", "@pop"], [/[\/*]/, "comment"]],
    jsdoc: [[/[^\/*]+/, "comment.doc"], [/\*\//, "comment.doc", "@pop"], [/[\/*]/, "comment.doc"]],
    regexp: [[/(\{)(\d+(?:,\d*)?)(\})/, ["regexp.escape.control", "regexp.escape.control", "regexp.escape.control"]], [/(\[)(\^?)(?=(?:[^\]\\\/]|\\.)+)/, ["regexp.escape.control", {
      token: "regexp.escape.control",
      next: "@regexrange"
    }]], [/(\()(\?:|\?=|\?!)/, ["regexp.escape.control", "regexp.escape.control"]], [/[()]/, "regexp.escape.control"], [/@regexpctl/, "regexp.escape.control"], [/[^\\\/]/, "regexp"], [/@regexpesc/, "regexp.escape"], [/\\\./, "regexp.invalid"], [/(\/)([dgimsuy]*)/, [{
      token: "regexp",
      bracket: "@close",
      next: "@pop"
    }, "keyword.other"]]],
    regexrange: [[/-/, "regexp.escape.control"], [/\^/, "regexp.invalid"], [/@regexpesc/, "regexp.escape"], [/[^\]]/, "regexp"], [/\]/, {
      token: "regexp.escape.control",
      next: "@pop",
      bracket: "@close"
    }]],
    string_double: [[/[^\\"]+/, "string"], [/@escapes/, "string.escape"], [/\\./, "string.escape.invalid"], [/"/, "string", "@pop"]],
    string_single: [[/[^\\']+/, "string"], [/@escapes/, "string.escape"], [/\\./, "string.escape.invalid"], [/'/, "string", "@pop"]],
    string_backtick: [[/\$\{/, {
      token: "delimiter.bracket",
      next: "@bracketCounting"
    }], [/[^\\`$]+/, "string"], [/@escapes/, "string.escape"], [/\\./, "string.escape.invalid"], [/`/, "string", "@pop"]],
    bracketCounting: [[/\{/, "delimiter.bracket", "@bracketCounting"], [/\}/, "delimiter.bracket", "@pop"], {
      include: "common"
    }]
  }
};

export { conf, language };
//# sourceMappingURL=typescript-0d452535.es.js.map