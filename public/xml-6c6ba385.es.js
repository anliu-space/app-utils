
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

// src/basic-languages/xml/xml.ts
var conf = {
  comments: {
    blockComment: ["<!--", "-->"]
  },
  brackets: [["<", ">"]],
  autoClosingPairs: [{
    open: "<",
    close: ">"
  }, {
    open: "'",
    close: "'"
  }, {
    open: '"',
    close: '"'
  }],
  surroundingPairs: [{
    open: "<",
    close: ">"
  }, {
    open: "'",
    close: "'"
  }, {
    open: '"',
    close: '"'
  }],
  onEnterRules: [{
    beforeText: new RegExp("<([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)[^<]*$", "i"),
    afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>$/i,
    action: {
      indentAction: monaco_editor_core_exports.languages.IndentAction.IndentOutdent
    }
  }, {
    beforeText: new RegExp("<(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$", "i"),
    action: {
      indentAction: monaco_editor_core_exports.languages.IndentAction.Indent
    }
  }]
};
var language = {
  defaultToken: "",
  tokenPostfix: ".xml",
  ignoreCase: true,
  qualifiedName: /(?:[\w\.\-]+:)?[\w\.\-]+/,
  tokenizer: {
    root: [[/[^<&]+/, ""], {
      include: "@whitespace"
    }, [/(<)(@qualifiedName)/, [{
      token: "delimiter"
    }, {
      token: "tag",
      next: "@tag"
    }]], [/(<\/)(@qualifiedName)(\s*)(>)/, [{
      token: "delimiter"
    }, {
      token: "tag"
    }, "", {
      token: "delimiter"
    }]], [/(<\?)(@qualifiedName)/, [{
      token: "delimiter"
    }, {
      token: "metatag",
      next: "@tag"
    }]], [/(<\!)(@qualifiedName)/, [{
      token: "delimiter"
    }, {
      token: "metatag",
      next: "@tag"
    }]], [/<\!\[CDATA\[/, {
      token: "delimiter.cdata",
      next: "@cdata"
    }], [/&\w+;/, "string.escape"]],
    cdata: [[/[^\]]+/, ""], [/\]\]>/, {
      token: "delimiter.cdata",
      next: "@pop"
    }], [/\]/, ""]],
    tag: [[/[ \t\r\n]+/, ""], [/(@qualifiedName)(\s*=\s*)("[^"]*"|'[^']*')/, ["attribute.name", "", "attribute.value"]], [/(@qualifiedName)(\s*=\s*)("[^">?\/]*|'[^'>?\/]*)(?=[\?\/]\>)/, ["attribute.name", "", "attribute.value"]], [/(@qualifiedName)(\s*=\s*)("[^">]*|'[^'>]*)/, ["attribute.name", "", "attribute.value"]], [/@qualifiedName/, "attribute.name"], [/\?>/, {
      token: "delimiter",
      next: "@pop"
    }], [/(\/)(>)/, [{
      token: "tag"
    }, {
      token: "delimiter",
      next: "@pop"
    }]], [/>/, {
      token: "delimiter",
      next: "@pop"
    }]],
    whitespace: [[/[ \t\r\n]+/, ""], [/<!--/, {
      token: "comment",
      next: "@comment"
    }]],
    comment: [[/[^<\-]+/, "comment.content"], [/-->/, {
      token: "comment",
      next: "@pop"
    }], [/<!--/, "comment.content.invalid"], [/[<\-]/, "comment.content"]]
  }
};

export { conf, language };
//# sourceMappingURL=xml-6c6ba385.es.js.map
