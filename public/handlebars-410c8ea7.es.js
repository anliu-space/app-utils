
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

// src/basic-languages/handlebars/handlebars.ts
var EMPTY_ELEMENTS = ["area", "base", "br", "col", "embed", "hr", "img", "input", "keygen", "link", "menuitem", "meta", "param", "source", "track", "wbr"];
var conf = {
  wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g,
  comments: {
    blockComment: ["{{!--", "--}}"]
  },
  brackets: [["<!--", "-->"], ["<", ">"], ["{{", "}}"], ["{", "}"], ["(", ")"]],
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
  tokenizer: {
    root: [[/\{\{!--/, "comment.block.start.handlebars", "@commentBlock"], [/\{\{!/, "comment.start.handlebars", "@comment"], [/\{\{/, {
      token: "@rematch",
      switchTo: "@handlebarsInSimpleState.root"
    }], [/<!DOCTYPE/, "metatag.html", "@doctype"], [/<!--/, "comment.html", "@commentHtml"], [/(<)(\w+)(\/>)/, ["delimiter.html", "tag.html", "delimiter.html"]], [/(<)(script)/, ["delimiter.html", {
      token: "tag.html",
      next: "@script"
    }]], [/(<)(style)/, ["delimiter.html", {
      token: "tag.html",
      next: "@style"
    }]], [/(<)([:\w]+)/, ["delimiter.html", {
      token: "tag.html",
      next: "@otherTag"
    }]], [/(<\/)(\w+)/, ["delimiter.html", {
      token: "tag.html",
      next: "@otherTag"
    }]], [/</, "delimiter.html"], [/\{/, "delimiter.html"], [/[^<{]+/]],
    doctype: [[/\{\{/, {
      token: "@rematch",
      switchTo: "@handlebarsInSimpleState.comment"
    }], [/[^>]+/, "metatag.content.html"], [/>/, "metatag.html", "@pop"]],
    comment: [[/\}\}/, "comment.end.handlebars", "@pop"], [/./, "comment.content.handlebars"]],
    commentBlock: [[/--\}\}/, "comment.block.end.handlebars", "@pop"], [/./, "comment.content.handlebars"]],
    commentHtml: [[/\{\{/, {
      token: "@rematch",
      switchTo: "@handlebarsInSimpleState.comment"
    }], [/-->/, "comment.html", "@pop"], [/[^-]+/, "comment.content.html"], [/./, "comment.content.html"]],
    otherTag: [[/\{\{/, {
      token: "@rematch",
      switchTo: "@handlebarsInSimpleState.otherTag"
    }], [/\/?>/, "delimiter.html", "@pop"], [/"([^"]*)"/, "attribute.value"], [/'([^']*)'/, "attribute.value"], [/[\w\-]+/, "attribute.name"], [/=/, "delimiter"], [/[ \t\r\n]+/]],
    script: [[/\{\{/, {
      token: "@rematch",
      switchTo: "@handlebarsInSimpleState.script"
    }], [/type/, "attribute.name", "@scriptAfterType"], [/"([^"]*)"/, "attribute.value"], [/'([^']*)'/, "attribute.value"], [/[\w\-]+/, "attribute.name"], [/=/, "delimiter"], [/>/, {
      token: "delimiter.html",
      next: "@scriptEmbedded.text/javascript",
      nextEmbedded: "text/javascript"
    }], [/[ \t\r\n]+/], [/(<\/)(script\s*)(>)/, ["delimiter.html", "tag.html", {
      token: "delimiter.html",
      next: "@pop"
    }]]],
    scriptAfterType: [[/\{\{/, {
      token: "@rematch",
      switchTo: "@handlebarsInSimpleState.scriptAfterType"
    }], [/=/, "delimiter", "@scriptAfterTypeEquals"], [/>/, {
      token: "delimiter.html",
      next: "@scriptEmbedded.text/javascript",
      nextEmbedded: "text/javascript"
    }], [/[ \t\r\n]+/], [/<\/script\s*>/, {
      token: "@rematch",
      next: "@pop"
    }]],
    scriptAfterTypeEquals: [[/\{\{/, {
      token: "@rematch",
      switchTo: "@handlebarsInSimpleState.scriptAfterTypeEquals"
    }], [/"([^"]*)"/, {
      token: "attribute.value",
      switchTo: "@scriptWithCustomType.$1"
    }], [/'([^']*)'/, {
      token: "attribute.value",
      switchTo: "@scriptWithCustomType.$1"
    }], [/>/, {
      token: "delimiter.html",
      next: "@scriptEmbedded.text/javascript",
      nextEmbedded: "text/javascript"
    }], [/[ \t\r\n]+/], [/<\/script\s*>/, {
      token: "@rematch",
      next: "@pop"
    }]],
    scriptWithCustomType: [[/\{\{/, {
      token: "@rematch",
      switchTo: "@handlebarsInSimpleState.scriptWithCustomType.$S2"
    }], [/>/, {
      token: "delimiter.html",
      next: "@scriptEmbedded.$S2",
      nextEmbedded: "$S2"
    }], [/"([^"]*)"/, "attribute.value"], [/'([^']*)'/, "attribute.value"], [/[\w\-]+/, "attribute.name"], [/=/, "delimiter"], [/[ \t\r\n]+/], [/<\/script\s*>/, {
      token: "@rematch",
      next: "@pop"
    }]],
    scriptEmbedded: [[/\{\{/, {
      token: "@rematch",
      switchTo: "@handlebarsInEmbeddedState.scriptEmbedded.$S2",
      nextEmbedded: "@pop"
    }], [/<\/script/, {
      token: "@rematch",
      next: "@pop",
      nextEmbedded: "@pop"
    }]],
    style: [[/\{\{/, {
      token: "@rematch",
      switchTo: "@handlebarsInSimpleState.style"
    }], [/type/, "attribute.name", "@styleAfterType"], [/"([^"]*)"/, "attribute.value"], [/'([^']*)'/, "attribute.value"], [/[\w\-]+/, "attribute.name"], [/=/, "delimiter"], [/>/, {
      token: "delimiter.html",
      next: "@styleEmbedded.text/css",
      nextEmbedded: "text/css"
    }], [/[ \t\r\n]+/], [/(<\/)(style\s*)(>)/, ["delimiter.html", "tag.html", {
      token: "delimiter.html",
      next: "@pop"
    }]]],
    styleAfterType: [[/\{\{/, {
      token: "@rematch",
      switchTo: "@handlebarsInSimpleState.styleAfterType"
    }], [/=/, "delimiter", "@styleAfterTypeEquals"], [/>/, {
      token: "delimiter.html",
      next: "@styleEmbedded.text/css",
      nextEmbedded: "text/css"
    }], [/[ \t\r\n]+/], [/<\/style\s*>/, {
      token: "@rematch",
      next: "@pop"
    }]],
    styleAfterTypeEquals: [[/\{\{/, {
      token: "@rematch",
      switchTo: "@handlebarsInSimpleState.styleAfterTypeEquals"
    }], [/"([^"]*)"/, {
      token: "attribute.value",
      switchTo: "@styleWithCustomType.$1"
    }], [/'([^']*)'/, {
      token: "attribute.value",
      switchTo: "@styleWithCustomType.$1"
    }], [/>/, {
      token: "delimiter.html",
      next: "@styleEmbedded.text/css",
      nextEmbedded: "text/css"
    }], [/[ \t\r\n]+/], [/<\/style\s*>/, {
      token: "@rematch",
      next: "@pop"
    }]],
    styleWithCustomType: [[/\{\{/, {
      token: "@rematch",
      switchTo: "@handlebarsInSimpleState.styleWithCustomType.$S2"
    }], [/>/, {
      token: "delimiter.html",
      next: "@styleEmbedded.$S2",
      nextEmbedded: "$S2"
    }], [/"([^"]*)"/, "attribute.value"], [/'([^']*)'/, "attribute.value"], [/[\w\-]+/, "attribute.name"], [/=/, "delimiter"], [/[ \t\r\n]+/], [/<\/style\s*>/, {
      token: "@rematch",
      next: "@pop"
    }]],
    styleEmbedded: [[/\{\{/, {
      token: "@rematch",
      switchTo: "@handlebarsInEmbeddedState.styleEmbedded.$S2",
      nextEmbedded: "@pop"
    }], [/<\/style/, {
      token: "@rematch",
      next: "@pop",
      nextEmbedded: "@pop"
    }]],
    handlebarsInSimpleState: [[/\{\{\{?/, "delimiter.handlebars"], [/\}\}\}?/, {
      token: "delimiter.handlebars",
      switchTo: "@$S2.$S3"
    }], {
      include: "handlebarsRoot"
    }],
    handlebarsInEmbeddedState: [[/\{\{\{?/, "delimiter.handlebars"], [/\}\}\}?/, {
      token: "delimiter.handlebars",
      switchTo: "@$S2.$S3",
      nextEmbedded: "$S3"
    }], {
      include: "handlebarsRoot"
    }],
    handlebarsRoot: [[/"[^"]*"/, "string.handlebars"], [/[#/][^\s}]+/, "keyword.helper.handlebars"], [/else\b/, "keyword.helper.handlebars"], [/[\s]+/], [/[^}]/, "variable.parameter.handlebars"]]
  }
};

export { conf, language };
//# sourceMappingURL=handlebars-410c8ea7.es.js.map
