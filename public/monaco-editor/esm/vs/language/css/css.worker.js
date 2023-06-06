
/**
 * dkal-app-utils v1.0.1
 * (c) 1990-2023 anliu-space
 * Released under the MIT License.
 */

import { initialize } from '../../editor/editor.worker.js';
import { T as TokenType, S as Scanner, L as LESSScanner, a as SCSSScanner, I as InterpolationFunction, b as SelectionRange, R as Range, N as NodeType, C as CSSDataManager, c as CSSNavigation, d as CSSHover, e as CSSCompletion, P as Parser, f as SCSSNavigation, g as SCSSCompletion, h as SCSSParser, i as LESSCompletion, j as LESSParser, k as CSSValidation, l as CSSCodeActions, m as TextDocument } from '../../../../../scssNavigation-83424fba.es.js';
import '../../../../../editorSimpleWorker-bc140aa4.es.js';

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function getFoldingRanges(document, context) {
    var ranges = computeFoldingRanges(document);
    return limitFoldingRanges(ranges, context);
}
function computeFoldingRanges(document) {
    function getStartLine(t) {
        return document.positionAt(t.offset).line;
    }
    function getEndLine(t) {
        return document.positionAt(t.offset + t.len).line;
    }
    function getScanner() {
        switch (document.languageId) {
            case 'scss':
                return new SCSSScanner();
            case 'less':
                return new LESSScanner();
            default:
                return new Scanner();
        }
    }
    function tokenToRange(t, kind) {
        var startLine = getStartLine(t);
        var endLine = getEndLine(t);
        if (startLine !== endLine) {
            return {
                startLine: startLine,
                endLine: endLine,
                kind: kind
            };
        }
        else {
            return null;
        }
    }
    var ranges = [];
    var delimiterStack = [];
    var scanner = getScanner();
    scanner.ignoreComment = false;
    scanner.setSource(document.getText());
    var token = scanner.scan();
    var prevToken = null;
    var _loop_1 = function () {
        switch (token.type) {
            case TokenType.CurlyL:
            case InterpolationFunction:
                {
                    delimiterStack.push({ line: getStartLine(token), type: 'brace', isStart: true });
                    break;
                }
            case TokenType.CurlyR: {
                if (delimiterStack.length !== 0) {
                    var prevDelimiter = popPrevStartDelimiterOfType(delimiterStack, 'brace');
                    if (!prevDelimiter) {
                        break;
                    }
                    var endLine = getEndLine(token);
                    if (prevDelimiter.type === 'brace') {
                        /**
                         * Other than the case when curly brace is not on a new line by itself, for example
                         * .foo {
                         *   color: red; }
                         * Use endLine minus one to show ending curly brace
                         */
                        if (prevToken && getEndLine(prevToken) !== endLine) {
                            endLine--;
                        }
                        if (prevDelimiter.line !== endLine) {
                            ranges.push({
                                startLine: prevDelimiter.line,
                                endLine: endLine,
                                kind: undefined
                            });
                        }
                    }
                }
                break;
            }
            /**
             * In CSS, there is no single line comment prefixed with //
             * All comments are marked as `Comment`
             */
            case TokenType.Comment: {
                var commentRegionMarkerToDelimiter_1 = function (marker) {
                    if (marker === '#region') {
                        return { line: getStartLine(token), type: 'comment', isStart: true };
                    }
                    else {
                        return { line: getEndLine(token), type: 'comment', isStart: false };
                    }
                };
                var getCurrDelimiter = function (token) {
                    var matches = token.text.match(/^\s*\/\*\s*(#region|#endregion)\b\s*(.*?)\s*\*\//);
                    if (matches) {
                        return commentRegionMarkerToDelimiter_1(matches[1]);
                    }
                    else if (document.languageId === 'scss' || document.languageId === 'less') {
                        var matches_1 = token.text.match(/^\s*\/\/\s*(#region|#endregion)\b\s*(.*?)\s*/);
                        if (matches_1) {
                            return commentRegionMarkerToDelimiter_1(matches_1[1]);
                        }
                    }
                    return null;
                };
                var currDelimiter = getCurrDelimiter(token);
                // /* */ comment region folding
                // All #region and #endregion cases
                if (currDelimiter) {
                    if (currDelimiter.isStart) {
                        delimiterStack.push(currDelimiter);
                    }
                    else {
                        var prevDelimiter = popPrevStartDelimiterOfType(delimiterStack, 'comment');
                        if (!prevDelimiter) {
                            break;
                        }
                        if (prevDelimiter.type === 'comment') {
                            if (prevDelimiter.line !== currDelimiter.line) {
                                ranges.push({
                                    startLine: prevDelimiter.line,
                                    endLine: currDelimiter.line,
                                    kind: 'region'
                                });
                            }
                        }
                    }
                }
                // Multiline comment case
                else {
                    var range = tokenToRange(token, 'comment');
                    if (range) {
                        ranges.push(range);
                    }
                }
                break;
            }
        }
        prevToken = token;
        token = scanner.scan();
    };
    while (token.type !== TokenType.EOF) {
        _loop_1();
    }
    return ranges;
}
function popPrevStartDelimiterOfType(stack, type) {
    if (stack.length === 0) {
        return null;
    }
    for (var i = stack.length - 1; i >= 0; i--) {
        if (stack[i].type === type && stack[i].isStart) {
            return stack.splice(i, 1)[0];
        }
    }
    return null;
}
/**
 * - Sort regions
 * - Remove invalid regions (intersections)
 * - If limit exceeds, only return `rangeLimit` amount of ranges
 */
function limitFoldingRanges(ranges, context) {
    var maxRanges = context && context.rangeLimit || Number.MAX_VALUE;
    var sortedRanges = ranges.sort(function (r1, r2) {
        var diff = r1.startLine - r2.startLine;
        if (diff === 0) {
            diff = r1.endLine - r2.endLine;
        }
        return diff;
    });
    var validRanges = [];
    var prevEndLine = -1;
    sortedRanges.forEach(function (r) {
        if (!(r.startLine < prevEndLine && prevEndLine < r.endLine)) {
            validRanges.push(r);
            prevEndLine = r.endLine;
        }
    });
    if (validRanges.length < maxRanges) {
        return validRanges;
    }
    else {
        return validRanges.slice(0, maxRanges);
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function getSelectionRanges(document, positions, stylesheet) {
    function getSelectionRange(position) {
        var applicableRanges = getApplicableRanges(position);
        var current = undefined;
        for (var index = applicableRanges.length - 1; index >= 0; index--) {
            current = SelectionRange.create(Range.create(document.positionAt(applicableRanges[index][0]), document.positionAt(applicableRanges[index][1])), current);
        }
        if (!current) {
            current = SelectionRange.create(Range.create(position, position));
        }
        return current;
    }
    return positions.map(getSelectionRange);
    function getApplicableRanges(position) {
        var offset = document.offsetAt(position);
        var currNode = stylesheet.findChildAtOffset(offset, true);
        if (!currNode) {
            return [];
        }
        var result = [];
        while (currNode) {
            if (currNode.parent &&
                currNode.offset === currNode.parent.offset &&
                currNode.end === currNode.parent.end) {
                currNode = currNode.parent;
                continue;
            }
            // The `{ }` part of `.a { }`
            if (currNode.type === NodeType.Declarations) {
                if (offset > currNode.offset && offset < currNode.end) {
                    // Return `{ }` and the range inside `{` and `}`
                    result.push([currNode.offset + 1, currNode.end - 1]);
                }
            }
            result.push([currNode.offset, currNode.end]);
            currNode = currNode.parent;
        }
        return result;
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function createFacade(parser, completion, hover, navigation, codeActions, validation, cssDataManager) {
    return {
        configure: function (settings) {
            validation.configure(settings);
            completion.configure(settings);
        },
        setDataProviders: cssDataManager.setDataProviders.bind(cssDataManager),
        doValidation: validation.doValidation.bind(validation),
        parseStylesheet: parser.parseStylesheet.bind(parser),
        doComplete: completion.doComplete.bind(completion),
        doComplete2: completion.doComplete2.bind(completion),
        setCompletionParticipants: completion.setCompletionParticipants.bind(completion),
        doHover: hover.doHover.bind(hover),
        findDefinition: navigation.findDefinition.bind(navigation),
        findReferences: navigation.findReferences.bind(navigation),
        findDocumentHighlights: navigation.findDocumentHighlights.bind(navigation),
        findDocumentLinks: navigation.findDocumentLinks.bind(navigation),
        findDocumentLinks2: navigation.findDocumentLinks2.bind(navigation),
        findDocumentSymbols: navigation.findDocumentSymbols.bind(navigation),
        doCodeActions: codeActions.doCodeActions.bind(codeActions),
        doCodeActions2: codeActions.doCodeActions2.bind(codeActions),
        findColorSymbols: function (d, s) { return navigation.findDocumentColors(d, s).map(function (s) { return s.range; }); },
        findDocumentColors: navigation.findDocumentColors.bind(navigation),
        getColorPresentations: navigation.getColorPresentations.bind(navigation),
        doRename: navigation.doRename.bind(navigation),
        getFoldingRanges: getFoldingRanges,
        getSelectionRanges: getSelectionRanges
    };
}
var defaultLanguageServiceOptions = {};
function getCSSLanguageService(options) {
    if (options === void 0) { options = defaultLanguageServiceOptions; }
    var cssDataManager = new CSSDataManager(options);
    return createFacade(new Parser(), new CSSCompletion(null, options, cssDataManager), new CSSHover(options && options.clientCapabilities, cssDataManager), new CSSNavigation(options && options.fileSystemProvider), new CSSCodeActions(cssDataManager), new CSSValidation(cssDataManager), cssDataManager);
}
function getSCSSLanguageService(options) {
    if (options === void 0) { options = defaultLanguageServiceOptions; }
    var cssDataManager = new CSSDataManager(options);
    return createFacade(new SCSSParser(), new SCSSCompletion(options, cssDataManager), new CSSHover(options && options.clientCapabilities, cssDataManager), new SCSSNavigation(options && options.fileSystemProvider), new CSSCodeActions(cssDataManager), new CSSValidation(cssDataManager), cssDataManager);
}
function getLESSLanguageService(options) {
    if (options === void 0) { options = defaultLanguageServiceOptions; }
    var cssDataManager = new CSSDataManager(options);
    return createFacade(new LESSParser(), new LESSCompletion(options, cssDataManager), new CSSHover(options && options.clientCapabilities, cssDataManager), new CSSNavigation(options && options.fileSystemProvider), new CSSCodeActions(cssDataManager), new CSSValidation(cssDataManager), cssDataManager);
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
var CSSWorker = /** @class */ (function () {
    function CSSWorker(ctx, createData) {
        this._ctx = ctx;
        this._languageSettings = createData.languageSettings;
        this._languageId = createData.languageId;
        switch (this._languageId) {
            case 'css':
                this._languageService = getCSSLanguageService();
                break;
            case 'less':
                this._languageService = getLESSLanguageService();
                break;
            case 'scss':
                this._languageService = getSCSSLanguageService();
                break;
            default:
                throw new Error('Invalid language id: ' + this._languageId);
        }
        this._languageService.configure(this._languageSettings);
    }
    // --- language service host ---------------
    CSSWorker.prototype.doValidation = function (uri) {
        return __awaiter(this, void 0, void 0, function () {
            var document, stylesheet, diagnostics;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                if (document) {
                    stylesheet = this._languageService.parseStylesheet(document);
                    diagnostics = this._languageService.doValidation(document, stylesheet);
                    return [2 /*return*/, Promise.resolve(diagnostics)];
                }
                return [2 /*return*/, Promise.resolve([])];
            });
        });
    };
    CSSWorker.prototype.doComplete = function (uri, position) {
        return __awaiter(this, void 0, void 0, function () {
            var document, stylesheet, completions;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                stylesheet = this._languageService.parseStylesheet(document);
                completions = this._languageService.doComplete(document, position, stylesheet);
                return [2 /*return*/, Promise.resolve(completions)];
            });
        });
    };
    CSSWorker.prototype.doHover = function (uri, position) {
        return __awaiter(this, void 0, void 0, function () {
            var document, stylesheet, hover;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                stylesheet = this._languageService.parseStylesheet(document);
                hover = this._languageService.doHover(document, position, stylesheet);
                return [2 /*return*/, Promise.resolve(hover)];
            });
        });
    };
    CSSWorker.prototype.findDefinition = function (uri, position) {
        return __awaiter(this, void 0, void 0, function () {
            var document, stylesheet, definition;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                stylesheet = this._languageService.parseStylesheet(document);
                definition = this._languageService.findDefinition(document, position, stylesheet);
                return [2 /*return*/, Promise.resolve(definition)];
            });
        });
    };
    CSSWorker.prototype.findReferences = function (uri, position) {
        return __awaiter(this, void 0, void 0, function () {
            var document, stylesheet, references;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                stylesheet = this._languageService.parseStylesheet(document);
                references = this._languageService.findReferences(document, position, stylesheet);
                return [2 /*return*/, Promise.resolve(references)];
            });
        });
    };
    CSSWorker.prototype.findDocumentHighlights = function (uri, position) {
        return __awaiter(this, void 0, void 0, function () {
            var document, stylesheet, highlights;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                stylesheet = this._languageService.parseStylesheet(document);
                highlights = this._languageService.findDocumentHighlights(document, position, stylesheet);
                return [2 /*return*/, Promise.resolve(highlights)];
            });
        });
    };
    CSSWorker.prototype.findDocumentSymbols = function (uri) {
        return __awaiter(this, void 0, void 0, function () {
            var document, stylesheet, symbols;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                stylesheet = this._languageService.parseStylesheet(document);
                symbols = this._languageService.findDocumentSymbols(document, stylesheet);
                return [2 /*return*/, Promise.resolve(symbols)];
            });
        });
    };
    CSSWorker.prototype.doCodeActions = function (uri, range, context) {
        return __awaiter(this, void 0, void 0, function () {
            var document, stylesheet, actions;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                stylesheet = this._languageService.parseStylesheet(document);
                actions = this._languageService.doCodeActions(document, range, context, stylesheet);
                return [2 /*return*/, Promise.resolve(actions)];
            });
        });
    };
    CSSWorker.prototype.findDocumentColors = function (uri) {
        return __awaiter(this, void 0, void 0, function () {
            var document, stylesheet, colorSymbols;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                stylesheet = this._languageService.parseStylesheet(document);
                colorSymbols = this._languageService.findDocumentColors(document, stylesheet);
                return [2 /*return*/, Promise.resolve(colorSymbols)];
            });
        });
    };
    CSSWorker.prototype.getColorPresentations = function (uri, color, range) {
        return __awaiter(this, void 0, void 0, function () {
            var document, stylesheet, colorPresentations;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                stylesheet = this._languageService.parseStylesheet(document);
                colorPresentations = this._languageService.getColorPresentations(document, stylesheet, color, range);
                return [2 /*return*/, Promise.resolve(colorPresentations)];
            });
        });
    };
    CSSWorker.prototype.getFoldingRanges = function (uri, context) {
        return __awaiter(this, void 0, void 0, function () {
            var document, ranges;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                ranges = this._languageService.getFoldingRanges(document, context);
                return [2 /*return*/, Promise.resolve(ranges)];
            });
        });
    };
    CSSWorker.prototype.getSelectionRanges = function (uri, positions) {
        return __awaiter(this, void 0, void 0, function () {
            var document, stylesheet, ranges;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                stylesheet = this._languageService.parseStylesheet(document);
                ranges = this._languageService.getSelectionRanges(document, positions, stylesheet);
                return [2 /*return*/, Promise.resolve(ranges)];
            });
        });
    };
    CSSWorker.prototype.doRename = function (uri, position, newName) {
        return __awaiter(this, void 0, void 0, function () {
            var document, stylesheet, renames;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                stylesheet = this._languageService.parseStylesheet(document);
                renames = this._languageService.doRename(document, position, newName, stylesheet);
                return [2 /*return*/, Promise.resolve(renames)];
            });
        });
    };
    CSSWorker.prototype._getTextDocument = function (uri) {
        var models = this._ctx.getMirrorModels();
        for (var _i = 0, models_1 = models; _i < models_1.length; _i++) {
            var model = models_1[_i];
            if (model.uri.toString() === uri) {
                return TextDocument.create(uri, this._languageId, model.version, model.getValue());
            }
        }
        return null;
    };
    return CSSWorker;
}());

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
self.onmessage = function () {
    // ignore the first message
    initialize(function (ctx, createData) {
        return new CSSWorker(ctx, createData);
    });
};
//# sourceMappingURL=css.worker.js.map
