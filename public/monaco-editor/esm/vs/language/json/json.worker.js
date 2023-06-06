
/**
 * dkal-app-utils v1.0.1
 * (c) 1990-2023 anliu-space
 * Released under the MIT License.
 */

import { initialize } from '../../editor/editor.worker.js';
import { c as createScanner, F as FoldingRangeKind, P as Position, S as SelectionRange, R as Range, J as JSONSchemaService, s as schemaContributions, a as JSONCompletion, b as JSONHover, p as parse, n as newJSONDocument, f as format, T as TextEdit, d as JSONDocumentSymbols, e as JSONValidation, g as TextDocument, U as URI } from '../../../../../configuration-767f8aa2.es.js';
import '../../../../../editorSimpleWorker-bc140aa4.es.js';

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function getFoldingRanges(document, context) {
    var ranges = [];
    var nestingLevels = [];
    var stack = [];
    var prevStart = -1;
    var scanner = createScanner(document.getText(), false);
    var token = scanner.scan();
    function addRange(range) {
        ranges.push(range);
        nestingLevels.push(stack.length);
    }
    while (token !== 17 /* EOF */) {
        switch (token) {
            case 1 /* OpenBraceToken */:
            case 3 /* OpenBracketToken */: {
                var startLine = document.positionAt(scanner.getTokenOffset()).line;
                var range = { startLine: startLine, endLine: startLine, kind: token === 1 /* OpenBraceToken */ ? 'object' : 'array' };
                stack.push(range);
                break;
            }
            case 2 /* CloseBraceToken */:
            case 4 /* CloseBracketToken */: {
                var kind = token === 2 /* CloseBraceToken */ ? 'object' : 'array';
                if (stack.length > 0 && stack[stack.length - 1].kind === kind) {
                    var range = stack.pop();
                    var line = document.positionAt(scanner.getTokenOffset()).line;
                    if (range && line > range.startLine + 1 && prevStart !== range.startLine) {
                        range.endLine = line - 1;
                        addRange(range);
                        prevStart = range.startLine;
                    }
                }
                break;
            }
            case 13 /* BlockCommentTrivia */: {
                var startLine = document.positionAt(scanner.getTokenOffset()).line;
                var endLine = document.positionAt(scanner.getTokenOffset() + scanner.getTokenLength()).line;
                if (scanner.getTokenError() === 1 /* UnexpectedEndOfComment */ && startLine + 1 < document.lineCount) {
                    scanner.setPosition(document.offsetAt(Position.create(startLine + 1, 0)));
                }
                else {
                    if (startLine < endLine) {
                        addRange({ startLine: startLine, endLine: endLine, kind: FoldingRangeKind.Comment });
                        prevStart = startLine;
                    }
                }
                break;
            }
            case 12 /* LineCommentTrivia */: {
                var text = document.getText().substr(scanner.getTokenOffset(), scanner.getTokenLength());
                var m = text.match(/^\/\/\s*#(region\b)|(endregion\b)/);
                if (m) {
                    var line = document.positionAt(scanner.getTokenOffset()).line;
                    if (m[1]) { // start pattern match
                        var range = { startLine: line, endLine: line, kind: FoldingRangeKind.Region };
                        stack.push(range);
                    }
                    else {
                        var i = stack.length - 1;
                        while (i >= 0 && stack[i].kind !== FoldingRangeKind.Region) {
                            i--;
                        }
                        if (i >= 0) {
                            var range = stack[i];
                            stack.length = i;
                            if (line > range.startLine && prevStart !== range.startLine) {
                                range.endLine = line;
                                addRange(range);
                                prevStart = range.startLine;
                            }
                        }
                    }
                }
                break;
            }
        }
        token = scanner.scan();
    }
    var rangeLimit = context && context.rangeLimit;
    if (typeof rangeLimit !== 'number' || ranges.length <= rangeLimit) {
        return ranges;
    }
    if (context && context.onRangeLimitExceeded) {
        context.onRangeLimitExceeded(document.uri);
    }
    var counts = [];
    for (var _i = 0, nestingLevels_1 = nestingLevels; _i < nestingLevels_1.length; _i++) {
        var level = nestingLevels_1[_i];
        if (level < 30) {
            counts[level] = (counts[level] || 0) + 1;
        }
    }
    var entries = 0;
    var maxLevel = 0;
    for (var i = 0; i < counts.length; i++) {
        var n = counts[i];
        if (n) {
            if (n + entries > rangeLimit) {
                maxLevel = i;
                break;
            }
            entries += n;
        }
    }
    var result = [];
    for (var i = 0; i < ranges.length; i++) {
        var level = nestingLevels[i];
        if (typeof level === 'number') {
            if (level < maxLevel || (level === maxLevel && entries++ < rangeLimit)) {
                result.push(ranges[i]);
            }
        }
    }
    return result;
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function getSelectionRanges(document, positions, doc) {
    function getSelectionRange(position) {
        var offset = document.offsetAt(position);
        var node = doc.getNodeFromOffset(offset, true);
        var result = [];
        while (node) {
            switch (node.type) {
                case 'string':
                case 'object':
                case 'array':
                    // range without ", [ or {
                    var cStart = node.offset + 1, cEnd = node.offset + node.length - 1;
                    if (cStart < cEnd && offset >= cStart && offset <= cEnd) {
                        result.push(newRange(cStart, cEnd));
                    }
                    result.push(newRange(node.offset, node.offset + node.length));
                    break;
                case 'number':
                case 'boolean':
                case 'null':
                case 'property':
                    result.push(newRange(node.offset, node.offset + node.length));
                    break;
            }
            if (node.type === 'property' || node.parent && node.parent.type === 'array') {
                var afterCommaOffset = getOffsetAfterNextToken(node.offset + node.length, 5 /* CommaToken */);
                if (afterCommaOffset !== -1) {
                    result.push(newRange(node.offset, afterCommaOffset));
                }
            }
            node = node.parent;
        }
        var current = undefined;
        for (var index = result.length - 1; index >= 0; index--) {
            current = SelectionRange.create(result[index], current);
        }
        if (!current) {
            current = SelectionRange.create(Range.create(position, position));
        }
        return current;
    }
    function newRange(start, end) {
        return Range.create(document.positionAt(start), document.positionAt(end));
    }
    var scanner = createScanner(document.getText(), true);
    function getOffsetAfterNextToken(offset, expectedToken) {
        scanner.setPosition(offset);
        var token = scanner.scan();
        if (token === expectedToken) {
            return scanner.getTokenOffset() + scanner.getTokenLength();
        }
        return -1;
    }
    return positions.map(getSelectionRange);
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function findDefinition(document, position, doc) {
    var offset = document.offsetAt(position);
    var node = doc.getNodeFromOffset(offset, true);
    if (!node || !isRef(node)) {
        return Promise.resolve([]);
    }
    var propertyNode = node.parent;
    var valueNode = propertyNode.valueNode;
    var path = valueNode.value;
    var targetNode = findTargetNode(doc, path);
    if (!targetNode) {
        return Promise.resolve([]);
    }
    var definition = {
        targetUri: document.uri,
        originSelectionRange: createRange(document, valueNode),
        targetRange: createRange(document, targetNode),
        targetSelectionRange: createRange(document, targetNode)
    };
    return Promise.resolve([definition]);
}
function createRange(document, node) {
    return Range.create(document.positionAt(node.offset), document.positionAt(node.offset + node.length));
}
function isRef(node) {
    return node.type === 'string' &&
        node.parent &&
        node.parent.type === 'property' &&
        node.parent.valueNode === node &&
        node.parent.keyNode.value === "$ref" ||
        false;
}
function findTargetNode(doc, path) {
    var tokens = parseJSONPointer(path);
    if (!tokens) {
        return null;
    }
    return findNode(tokens, doc.root);
}
function findNode(pointer, node) {
    if (!node) {
        return null;
    }
    if (pointer.length === 0) {
        return node;
    }
    var token = pointer.shift();
    if (node && node.type === 'object') {
        var propertyNode = node.properties.find(function (propertyNode) { return propertyNode.keyNode.value === token; });
        if (!propertyNode) {
            return null;
        }
        return findNode(pointer, propertyNode.valueNode);
    }
    else if (node && node.type === 'array') {
        if (token.match(/^(0|[1-9][0-9]*)$/)) {
            var index = Number.parseInt(token);
            var arrayItem = node.items[index];
            if (!arrayItem) {
                return null;
            }
            return findNode(pointer, arrayItem);
        }
    }
    return null;
}
function parseJSONPointer(path) {
    if (path === "#") {
        return [];
    }
    if (path[0] !== '#' || path[1] !== '/') {
        return null;
    }
    return path.substring(2).split(/\//).map(unescape);
}
function unescape(str) {
    return str.replace(/~1/g, '/').replace(/~0/g, '~');
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function getLanguageService(params) {
    var promise = params.promiseConstructor || Promise;
    var jsonSchemaService = new JSONSchemaService(params.schemaRequestService, params.workspaceContext, promise);
    jsonSchemaService.setSchemaContributions(schemaContributions);
    var jsonCompletion = new JSONCompletion(jsonSchemaService, params.contributions, promise, params.clientCapabilities);
    var jsonHover = new JSONHover(jsonSchemaService, params.contributions, promise);
    var jsonDocumentSymbols = new JSONDocumentSymbols(jsonSchemaService);
    var jsonValidation = new JSONValidation(jsonSchemaService, promise);
    return {
        configure: function (settings) {
            jsonSchemaService.clearExternalSchemas();
            if (settings.schemas) {
                settings.schemas.forEach(function (settings) {
                    jsonSchemaService.registerExternalSchema(settings.uri, settings.fileMatch, settings.schema);
                });
            }
            jsonValidation.configure(settings);
        },
        resetSchema: function (uri) { return jsonSchemaService.onResourceChange(uri); },
        doValidation: jsonValidation.doValidation.bind(jsonValidation),
        parseJSONDocument: function (document) { return parse(document, { collectComments: true }); },
        newJSONDocument: function (root, diagnostics) { return newJSONDocument(root, diagnostics); },
        getMatchingSchemas: jsonSchemaService.getMatchingSchemas.bind(jsonSchemaService),
        doResolve: jsonCompletion.doResolve.bind(jsonCompletion),
        doComplete: jsonCompletion.doComplete.bind(jsonCompletion),
        findDocumentSymbols: jsonDocumentSymbols.findDocumentSymbols.bind(jsonDocumentSymbols),
        findDocumentSymbols2: jsonDocumentSymbols.findDocumentSymbols2.bind(jsonDocumentSymbols),
        findColorSymbols: function (d, s) { return jsonDocumentSymbols.findDocumentColors(d, s).then(function (s) { return s.map(function (s) { return s.range; }); }); },
        findDocumentColors: jsonDocumentSymbols.findDocumentColors.bind(jsonDocumentSymbols),
        getColorPresentations: jsonDocumentSymbols.getColorPresentations.bind(jsonDocumentSymbols),
        doHover: jsonHover.doHover.bind(jsonHover),
        getFoldingRanges: getFoldingRanges,
        getSelectionRanges: getSelectionRanges,
        findDefinition: findDefinition,
        format: function (d, r, o) {
            var range = undefined;
            if (r) {
                var offset = d.offsetAt(r.start);
                var length = d.offsetAt(r.end) - offset;
                range = { offset: offset, length: length };
            }
            var options = { tabSize: o ? o.tabSize : 4, insertSpaces: o ? o.insertSpaces : true, eol: '\n' };
            return format(d.getText(), range, options).map(function (e) {
                return TextEdit.replace(Range.create(d.positionAt(e.offset), d.positionAt(e.offset + e.length)), e.content);
            });
        }
    };
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __awaiter = (self && self.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (self && self.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var defaultSchemaRequestService;
if (typeof fetch !== 'undefined') {
    defaultSchemaRequestService = function (url) {
        return fetch(url).then(function (response) { return response.text(); });
    };
}
var JSONWorker = /** @class */ (function () {
    function JSONWorker(ctx, createData) {
        this._ctx = ctx;
        this._languageSettings = createData.languageSettings;
        this._languageId = createData.languageId;
        this._languageService = getLanguageService({
            workspaceContext: {
                resolveRelativePath: function (relativePath, resource) {
                    var base = resource.substr(0, resource.lastIndexOf('/') + 1);
                    return resolvePath(base, relativePath);
                }
            },
            schemaRequestService: createData.enableSchemaRequest && defaultSchemaRequestService
        });
        this._languageService.configure(this._languageSettings);
    }
    JSONWorker.prototype.doValidation = function (uri) {
        return __awaiter(this, void 0, void 0, function () {
            var document, jsonDocument;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                if (document) {
                    jsonDocument = this._languageService.parseJSONDocument(document);
                    return [2 /*return*/, this._languageService.doValidation(document, jsonDocument)];
                }
                return [2 /*return*/, Promise.resolve([])];
            });
        });
    };
    JSONWorker.prototype.doComplete = function (uri, position) {
        return __awaiter(this, void 0, void 0, function () {
            var document, jsonDocument;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                jsonDocument = this._languageService.parseJSONDocument(document);
                return [2 /*return*/, this._languageService.doComplete(document, position, jsonDocument)];
            });
        });
    };
    JSONWorker.prototype.doResolve = function (item) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._languageService.doResolve(item)];
            });
        });
    };
    JSONWorker.prototype.doHover = function (uri, position) {
        return __awaiter(this, void 0, void 0, function () {
            var document, jsonDocument;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                jsonDocument = this._languageService.parseJSONDocument(document);
                return [2 /*return*/, this._languageService.doHover(document, position, jsonDocument)];
            });
        });
    };
    JSONWorker.prototype.format = function (uri, range, options) {
        return __awaiter(this, void 0, void 0, function () {
            var document, textEdits;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                textEdits = this._languageService.format(document, range, options);
                return [2 /*return*/, Promise.resolve(textEdits)];
            });
        });
    };
    JSONWorker.prototype.resetSchema = function (uri) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Promise.resolve(this._languageService.resetSchema(uri))];
            });
        });
    };
    JSONWorker.prototype.findDocumentSymbols = function (uri) {
        return __awaiter(this, void 0, void 0, function () {
            var document, jsonDocument, symbols;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                jsonDocument = this._languageService.parseJSONDocument(document);
                symbols = this._languageService.findDocumentSymbols(document, jsonDocument);
                return [2 /*return*/, Promise.resolve(symbols)];
            });
        });
    };
    JSONWorker.prototype.findDocumentColors = function (uri) {
        return __awaiter(this, void 0, void 0, function () {
            var document, jsonDocument, colorSymbols;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                jsonDocument = this._languageService.parseJSONDocument(document);
                colorSymbols = this._languageService.findDocumentColors(document, jsonDocument);
                return [2 /*return*/, Promise.resolve(colorSymbols)];
            });
        });
    };
    JSONWorker.prototype.getColorPresentations = function (uri, color, range) {
        return __awaiter(this, void 0, void 0, function () {
            var document, jsonDocument, colorPresentations;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                jsonDocument = this._languageService.parseJSONDocument(document);
                colorPresentations = this._languageService.getColorPresentations(document, jsonDocument, color, range);
                return [2 /*return*/, Promise.resolve(colorPresentations)];
            });
        });
    };
    JSONWorker.prototype.getFoldingRanges = function (uri, context) {
        return __awaiter(this, void 0, void 0, function () {
            var document, ranges;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                ranges = this._languageService.getFoldingRanges(document, context);
                return [2 /*return*/, Promise.resolve(ranges)];
            });
        });
    };
    JSONWorker.prototype.getSelectionRanges = function (uri, positions) {
        return __awaiter(this, void 0, void 0, function () {
            var document, jsonDocument, ranges;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                jsonDocument = this._languageService.parseJSONDocument(document);
                ranges = this._languageService.getSelectionRanges(document, positions, jsonDocument);
                return [2 /*return*/, Promise.resolve(ranges)];
            });
        });
    };
    JSONWorker.prototype._getTextDocument = function (uri) {
        var models = this._ctx.getMirrorModels();
        for (var _i = 0, models_1 = models; _i < models_1.length; _i++) {
            var model = models_1[_i];
            if (model.uri.toString() === uri) {
                return TextDocument.create(uri, this._languageId, model.version, model.getValue());
            }
        }
        return null;
    };
    return JSONWorker;
}());
// URI path utilities, will (hopefully) move to vscode-uri
var Slash = '/'.charCodeAt(0);
var Dot = '.'.charCodeAt(0);
function isAbsolutePath(path) {
    return path.charCodeAt(0) === Slash;
}
function resolvePath(uriString, path) {
    if (isAbsolutePath(path)) {
        var uri = URI.parse(uriString);
        var parts = path.split('/');
        return uri.with({ path: normalizePath(parts) }).toString();
    }
    return joinPath(uriString, path);
}
function normalizePath(parts) {
    var newParts = [];
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
        var part = parts_1[_i];
        if (part.length === 0 || (part.length === 1 && part.charCodeAt(0) === Dot)) ;
        else if (part.length === 2 && part.charCodeAt(0) === Dot && part.charCodeAt(1) === Dot) {
            newParts.pop();
        }
        else {
            newParts.push(part);
        }
    }
    if (parts.length > 1 && parts[parts.length - 1].length === 0) {
        newParts.push('');
    }
    var res = newParts.join('/');
    if (parts[0].length === 0) {
        res = '/' + res;
    }
    return res;
}
function joinPath(uriString) {
    var paths = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        paths[_i - 1] = arguments[_i];
    }
    var uri = URI.parse(uriString);
    var parts = uri.path.split('/');
    for (var _a = 0, paths_1 = paths; _a < paths_1.length; _a++) {
        var path = paths_1[_a];
        parts.push.apply(parts, path.split('/'));
    }
    return uri.with({ path: normalizePath(parts) }).toString();
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
self.onmessage = function () {
    // ignore the first message
    initialize(function (ctx, createData) {
        return new JSONWorker(ctx, createData);
    });
};
//# sourceMappingURL=json.worker.js.map
