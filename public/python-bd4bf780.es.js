
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

// src/basic-languages/python/python.ts
var conf = {
  comments: {
    lineComment: "#",
    blockComment: ["'''", "'''"]
  },
  brackets: [["{", "}"], ["[", "]"], ["(", ")"]],
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
  }],
  surroundingPairs: [{
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
  onEnterRules: [{
    beforeText: new RegExp("^\\s*(?:def|class|for|if|elif|else|while|try|with|finally|except|async|match|case).*?:\\s*$"),
    action: {
      indentAction: monaco_editor_core_exports.languages.IndentAction.Indent
    }
  }],
  folding: {
    offSide: true,
    markers: {
      start: new RegExp("^\\s*#region\\b"),
      end: new RegExp("^\\s*#endregion\\b")
    }
  }
};
var language = {
  defaultToken: "",
  tokenPostfix: ".python",
  keywords: ["False", "None", "True", "_", "and", "as", "assert", "async", "await", "break", "case", "class", "continue", "def", "del", "elif", "else", "except", "exec", "finally", "for", "from", "global", "if", "import", "in", "is", "lambda", "match", "nonlocal", "not", "or", "pass", "print", "raise", "return", "try", "while", "with", "yield", "int", "float", "long", "complex", "hex", "abs", "all", "any", "apply", "basestring", "bin", "bool", "buffer", "bytearray", "callable", "chr", "classmethod", "cmp", "coerce", "compile", "complex", "delattr", "dict", "dir", "divmod", "enumerate", "eval", "execfile", "file", "filter", "format", "frozenset", "getattr", "globals", "hasattr", "hash", "help", "id", "input", "intern", "isinstance", "issubclass", "iter", "len", "locals", "list", "map", "max", "memoryview", "min", "next", "object", "oct", "open", "ord", "pow", "print", "property", "reversed", "range", "raw_input", "reduce", "reload", "repr", "reversed", "round", "self", "set", "setattr", "slice", "sorted", "staticmethod", "str", "sum", "super", "tuple", "type", "unichr", "unicode", "vars", "xrange", "zip", "__dict__", "__methods__", "__members__", "__class__", "__bases__", "__name__", "__mro__", "__subclasses__", "__init__", "__import__"],
  brackets: [{
    open: "{",
    close: "}",
    token: "delimiter.curly"
  }, {
    open: "[",
    close: "]",
    token: "delimiter.bracket"
  }, {
    open: "(",
    close: ")",
    token: "delimiter.parenthesis"
  }],
  tokenizer: {
    root: [{
      include: "@whitespace"
    }, {
      include: "@numbers"
    }, {
      include: "@strings"
    }, [/[,:;]/, "delimiter"], [/[{}\[\]()]/, "@brackets"], [/@[a-zA-Z_]\w*/, "tag"], [/[a-zA-Z_]\w*/, {
      cases: {
        "@keywords": "keyword",
        "@default": "identifier"
      }
    }]],
    whitespace: [[/\s+/, "white"], [/(^#.*$)/, "comment"], [/'''/, "string", "@endDocString"], [/"""/, "string", "@endDblDocString"]],
    endDocString: [[/[^']+/, "string"], [/\\'/, "string"], [/'''/, "string", "@popall"], [/'/, "string"]],
    endDblDocString: [[/[^"]+/, "string"], [/\\"/, "string"], [/"""/, "string", "@popall"], [/"/, "string"]],
    numbers: [[/-?0x([abcdef]|[ABCDEF]|\d)+[lL]?/, "number.hex"], [/-?(\d*\.)?\d+([eE][+\-]?\d+)?[jJ]?[lL]?/, "number"]],
    strings: [[/'$/, "string.escape", "@popall"], [/'/, "string.escape", "@stringBody"], [/"$/, "string.escape", "@popall"], [/"/, "string.escape", "@dblStringBody"]],
    stringBody: [[/[^\\']+$/, "string", "@popall"], [/[^\\']+/, "string"], [/\\./, "string"], [/'/, "string.escape", "@popall"], [/\\$/, "string"]],
    dblStringBody: [[/[^\\"]+$/, "string", "@popall"], [/[^\\"]+/, "string"], [/\\./, "string"], [/"/, "string.escape", "@popall"], [/\\$/, "string"]]
  }
};

export { conf, language };
//# sourceMappingURL=python-bd4bf780.es.js.map
