
/**
 * dkal-app-utils v1.0.1
 * (c) 1990-2023 anliu-space
 * Released under the MIT License.
 */

/*!-----------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Version: 0.38.0(0e330ae453813de4e6cf272460fb79c7117073d0)
 * Released under the MIT license
 * https://github.com/microsoft/monaco-editor/blob/main/LICENSE.txt
 *-----------------------------------------------------------------------------*/

// src/basic-languages/bicep/bicep.ts
var bounded = function bounded(text) {
  return "\\b".concat(text, "\\b");
};
var identifierStart = "[_a-zA-Z]";
var identifierContinue = "[_a-zA-Z0-9]";
var identifier = bounded("".concat(identifierStart).concat(identifierContinue, "*"));
var keywords = ["targetScope", "resource", "module", "param", "var", "output", "for", "in", "if", "existing"];
var namedLiterals = ["true", "false", "null"];
var nonCommentWs = "[ \\t\\r\\n]";
var numericLiteral = "[0-9]+";
var conf = {
  comments: {
    lineComment: "//",
    blockComment: ["/*", "*/"]
  },
  brackets: [["{", "}"], ["[", "]"], ["(", ")"]],
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
    open: "'",
    close: "'"
  }, {
    open: "'''",
    close: "'''"
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
    open: "'",
    close: "'",
    notIn: ["string", "comment"]
  }, {
    open: "'''",
    close: "'''",
    notIn: ["string", "comment"]
  }],
  autoCloseBefore: ":.,=}])' \n	",
  indentationRules: {
    increaseIndentPattern: new RegExp("^((?!\\/\\/).)*(\\{[^}\"'`]*|\\([^)\"'`]*|\\[[^\\]\"'`]*)$"),
    decreaseIndentPattern: new RegExp("^((?!.*?\\/\\*).*\\*/)?\\s*[\\}\\]].*$")
  }
};
var language = {
  defaultToken: "",
  tokenPostfix: ".bicep",
  brackets: [{
    open: "{",
    close: "}",
    token: "delimiter.curly"
  }, {
    open: "[",
    close: "]",
    token: "delimiter.square"
  }, {
    open: "(",
    close: ")",
    token: "delimiter.parenthesis"
  }],
  symbols: /[=><!~?:&|+\-*/^%]+/,
  keywords: keywords,
  namedLiterals: namedLiterals,
  escapes: "\\\\(u{[0-9A-Fa-f]+}|n|r|t|\\\\|'|\\${)",
  tokenizer: {
    root: [{
      include: "@expression"
    }, {
      include: "@whitespace"
    }],
    stringVerbatim: [{
      regex: "(|'|'')[^']",
      action: {
        token: "string"
      }
    }, {
      regex: "'''",
      action: {
        token: "string.quote",
        next: "@pop"
      }
    }],
    stringLiteral: [{
      regex: "\\${",
      action: {
        token: "delimiter.bracket",
        next: "@bracketCounting"
      }
    }, {
      regex: "[^\\\\'$]+",
      action: {
        token: "string"
      }
    }, {
      regex: "@escapes",
      action: {
        token: "string.escape"
      }
    }, {
      regex: "\\\\.",
      action: {
        token: "string.escape.invalid"
      }
    }, {
      regex: "'",
      action: {
        token: "string",
        next: "@pop"
      }
    }],
    bracketCounting: [{
      regex: "{",
      action: {
        token: "delimiter.bracket",
        next: "@bracketCounting"
      }
    }, {
      regex: "}",
      action: {
        token: "delimiter.bracket",
        next: "@pop"
      }
    }, {
      include: "expression"
    }],
    comment: [{
      regex: "[^\\*]+",
      action: {
        token: "comment"
      }
    }, {
      regex: "\\*\\/",
      action: {
        token: "comment",
        next: "@pop"
      }
    }, {
      regex: "[\\/*]",
      action: {
        token: "comment"
      }
    }],
    whitespace: [{
      regex: nonCommentWs
    }, {
      regex: "\\/\\*",
      action: {
        token: "comment",
        next: "@comment"
      }
    }, {
      regex: "\\/\\/.*$",
      action: {
        token: "comment"
      }
    }],
    expression: [{
      regex: "'''",
      action: {
        token: "string.quote",
        next: "@stringVerbatim"
      }
    }, {
      regex: "'",
      action: {
        token: "string.quote",
        next: "@stringLiteral"
      }
    }, {
      regex: numericLiteral,
      action: {
        token: "number"
      }
    }, {
      regex: identifier,
      action: {
        cases: {
          "@keywords": {
            token: "keyword"
          },
          "@namedLiterals": {
            token: "keyword"
          },
          "@default": {
            token: "identifier"
          }
        }
      }
    }]
  }
};

export { conf, language };
//# sourceMappingURL=bicep-0b4fd945.es.js.map