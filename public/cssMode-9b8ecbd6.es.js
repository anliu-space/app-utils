
/**
 * dkal-app-utils v1.0.1
 * (c) 1990-2023 anliu-space
 * Released under the MIT License.
 */

import { e as editor, R as Range, l as languages, M as MarkerSeverity, U as Uri } from './index-0290230e.es.js';
import { n as InsertTextFormat, o as CompletionItemKind, F as FoldingRangeKind, D as DiagnosticSeverity, p as DocumentHighlightKind, q as SymbolKind } from './scssNavigation-83424fba.es.js';
import './dayjs-224d6dea.es.js';
import './editorSimpleWorker-bc140aa4.es.js';

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var STOP_WHEN_IDLE_FOR = 2 * 60 * 1000; // 2min
var WorkerManager = /** @class */ (function () {
    function WorkerManager(defaults) {
        var _this = this;
        this._defaults = defaults;
        this._worker = null;
        this._idleCheckInterval = window.setInterval(function () { return _this._checkIfIdle(); }, 30 * 1000);
        this._lastUsedTime = 0;
        this._configChangeListener = this._defaults.onDidChange(function () { return _this._stopWorker(); });
    }
    WorkerManager.prototype._stopWorker = function () {
        if (this._worker) {
            this._worker.dispose();
            this._worker = null;
        }
        this._client = null;
    };
    WorkerManager.prototype.dispose = function () {
        clearInterval(this._idleCheckInterval);
        this._configChangeListener.dispose();
        this._stopWorker();
    };
    WorkerManager.prototype._checkIfIdle = function () {
        if (!this._worker) {
            return;
        }
        var timePassedSinceLastUsed = Date.now() - this._lastUsedTime;
        if (timePassedSinceLastUsed > STOP_WHEN_IDLE_FOR) {
            this._stopWorker();
        }
    };
    WorkerManager.prototype._getClient = function () {
        this._lastUsedTime = Date.now();
        if (!this._client) {
            this._worker = editor.createWebWorker({
                // module that exports the create() method and returns a `CSSWorker` instance
                moduleId: 'vs/language/css/cssWorker',
                label: this._defaults.languageId,
                // passed in to the create() method
                createData: {
                    languageSettings: this._defaults.diagnosticsOptions,
                    languageId: this._defaults.languageId
                }
            });
            this._client = this._worker.getProxy();
        }
        return this._client;
    };
    WorkerManager.prototype.getLanguageServiceWorker = function () {
        var _this = this;
        var resources = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            resources[_i] = arguments[_i];
        }
        var _client;
        return this._getClient()
            .then(function (client) {
            _client = client;
        })
            .then(function (_) {
            return _this._worker.withSyncedResources(resources);
        })
            .then(function (_) { return _client; });
    };
    return WorkerManager;
}());

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// --- diagnostics --- ---
var DiagnosticsAdapter = /** @class */ (function () {
    function DiagnosticsAdapter(_languageId, _worker, defaults) {
        var _this = this;
        this._languageId = _languageId;
        this._worker = _worker;
        this._disposables = [];
        this._listener = Object.create(null);
        var onModelAdd = function (model) {
            var modeId = model.getModeId();
            if (modeId !== _this._languageId) {
                return;
            }
            var handle;
            _this._listener[model.uri.toString()] = model.onDidChangeContent(function () {
                window.clearTimeout(handle);
                handle = window.setTimeout(function () { return _this._doValidate(model.uri, modeId); }, 500);
            });
            _this._doValidate(model.uri, modeId);
        };
        var onModelRemoved = function (model) {
            editor.setModelMarkers(model, _this._languageId, []);
            var uriStr = model.uri.toString();
            var listener = _this._listener[uriStr];
            if (listener) {
                listener.dispose();
                delete _this._listener[uriStr];
            }
        };
        this._disposables.push(editor.onDidCreateModel(onModelAdd));
        this._disposables.push(editor.onWillDisposeModel(onModelRemoved));
        this._disposables.push(editor.onDidChangeModelLanguage(function (event) {
            onModelRemoved(event.model);
            onModelAdd(event.model);
        }));
        defaults.onDidChange(function (_) {
            editor.getModels().forEach(function (model) {
                if (model.getModeId() === _this._languageId) {
                    onModelRemoved(model);
                    onModelAdd(model);
                }
            });
        });
        this._disposables.push({
            dispose: function () {
                for (var key in _this._listener) {
                    _this._listener[key].dispose();
                }
            }
        });
        editor.getModels().forEach(onModelAdd);
    }
    DiagnosticsAdapter.prototype.dispose = function () {
        this._disposables.forEach(function (d) { return d && d.dispose(); });
        this._disposables = [];
    };
    DiagnosticsAdapter.prototype._doValidate = function (resource, languageId) {
        this._worker(resource)
            .then(function (worker) {
            return worker.doValidation(resource.toString());
        })
            .then(function (diagnostics) {
            var markers = diagnostics.map(function (d) { return toDiagnostics(resource, d); });
            var model = editor.getModel(resource);
            if (model.getModeId() === languageId) {
                editor.setModelMarkers(model, languageId, markers);
            }
        })
            .then(undefined, function (err) {
            console.error(err);
        });
    };
    return DiagnosticsAdapter;
}());
function toSeverity(lsSeverity) {
    switch (lsSeverity) {
        case DiagnosticSeverity.Error:
            return MarkerSeverity.Error;
        case DiagnosticSeverity.Warning:
            return MarkerSeverity.Warning;
        case DiagnosticSeverity.Information:
            return MarkerSeverity.Info;
        case DiagnosticSeverity.Hint:
            return MarkerSeverity.Hint;
        default:
            return MarkerSeverity.Info;
    }
}
function toDiagnostics(resource, diag) {
    var code = typeof diag.code === 'number' ? String(diag.code) : diag.code;
    return {
        severity: toSeverity(diag.severity),
        startLineNumber: diag.range.start.line + 1,
        startColumn: diag.range.start.character + 1,
        endLineNumber: diag.range.end.line + 1,
        endColumn: diag.range.end.character + 1,
        message: diag.message,
        code: code,
        source: diag.source
    };
}
// --- completion ------
function fromPosition(position) {
    if (!position) {
        return void 0;
    }
    return { character: position.column - 1, line: position.lineNumber - 1 };
}
function fromRange(range) {
    if (!range) {
        return void 0;
    }
    return {
        start: {
            line: range.startLineNumber - 1,
            character: range.startColumn - 1
        },
        end: { line: range.endLineNumber - 1, character: range.endColumn - 1 }
    };
}
function toRange(range) {
    if (!range) {
        return void 0;
    }
    return new Range(range.start.line + 1, range.start.character + 1, range.end.line + 1, range.end.character + 1);
}
function isInsertReplaceEdit(edit) {
    return (typeof edit.insert !== 'undefined' &&
        typeof edit.replace !== 'undefined');
}
function toCompletionItemKind(kind) {
    var mItemKind = languages.CompletionItemKind;
    switch (kind) {
        case CompletionItemKind.Text:
            return mItemKind.Text;
        case CompletionItemKind.Method:
            return mItemKind.Method;
        case CompletionItemKind.Function:
            return mItemKind.Function;
        case CompletionItemKind.Constructor:
            return mItemKind.Constructor;
        case CompletionItemKind.Field:
            return mItemKind.Field;
        case CompletionItemKind.Variable:
            return mItemKind.Variable;
        case CompletionItemKind.Class:
            return mItemKind.Class;
        case CompletionItemKind.Interface:
            return mItemKind.Interface;
        case CompletionItemKind.Module:
            return mItemKind.Module;
        case CompletionItemKind.Property:
            return mItemKind.Property;
        case CompletionItemKind.Unit:
            return mItemKind.Unit;
        case CompletionItemKind.Value:
            return mItemKind.Value;
        case CompletionItemKind.Enum:
            return mItemKind.Enum;
        case CompletionItemKind.Keyword:
            return mItemKind.Keyword;
        case CompletionItemKind.Snippet:
            return mItemKind.Snippet;
        case CompletionItemKind.Color:
            return mItemKind.Color;
        case CompletionItemKind.File:
            return mItemKind.File;
        case CompletionItemKind.Reference:
            return mItemKind.Reference;
    }
    return mItemKind.Property;
}
function toTextEdit(textEdit) {
    if (!textEdit) {
        return void 0;
    }
    return {
        range: toRange(textEdit.range),
        text: textEdit.newText
    };
}
var CompletionAdapter = /** @class */ (function () {
    function CompletionAdapter(_worker) {
        this._worker = _worker;
    }
    Object.defineProperty(CompletionAdapter.prototype, "triggerCharacters", {
        get: function () {
            return [' ', ':'];
        },
        enumerable: false,
        configurable: true
    });
    CompletionAdapter.prototype.provideCompletionItems = function (model, position, context, token) {
        var resource = model.uri;
        return this._worker(resource)
            .then(function (worker) {
            return worker.doComplete(resource.toString(), fromPosition(position));
        })
            .then(function (info) {
            if (!info) {
                return;
            }
            var wordInfo = model.getWordUntilPosition(position);
            var wordRange = new Range(position.lineNumber, wordInfo.startColumn, position.lineNumber, wordInfo.endColumn);
            var items = info.items.map(function (entry) {
                var item = {
                    label: entry.label,
                    insertText: entry.insertText || entry.label,
                    sortText: entry.sortText,
                    filterText: entry.filterText,
                    documentation: entry.documentation,
                    detail: entry.detail,
                    range: wordRange,
                    kind: toCompletionItemKind(entry.kind)
                };
                if (entry.textEdit) {
                    if (isInsertReplaceEdit(entry.textEdit)) {
                        item.range = {
                            insert: toRange(entry.textEdit.insert),
                            replace: toRange(entry.textEdit.replace)
                        };
                    }
                    else {
                        item.range = toRange(entry.textEdit.range);
                    }
                    item.insertText = entry.textEdit.newText;
                }
                if (entry.additionalTextEdits) {
                    item.additionalTextEdits = entry.additionalTextEdits.map(toTextEdit);
                }
                if (entry.insertTextFormat === InsertTextFormat.Snippet) {
                    item.insertTextRules = languages.CompletionItemInsertTextRule.InsertAsSnippet;
                }
                return item;
            });
            return {
                isIncomplete: info.isIncomplete,
                suggestions: items
            };
        });
    };
    return CompletionAdapter;
}());
function isMarkupContent(thing) {
    return (thing && typeof thing === 'object' && typeof thing.kind === 'string');
}
function toMarkdownString(entry) {
    if (typeof entry === 'string') {
        return {
            value: entry
        };
    }
    if (isMarkupContent(entry)) {
        if (entry.kind === 'plaintext') {
            return {
                value: entry.value.replace(/[\\`*_{}[\]()#+\-.!]/g, '\\$&')
            };
        }
        return {
            value: entry.value
        };
    }
    return { value: '```' + entry.language + '\n' + entry.value + '\n```\n' };
}
function toMarkedStringArray(contents) {
    if (!contents) {
        return void 0;
    }
    if (Array.isArray(contents)) {
        return contents.map(toMarkdownString);
    }
    return [toMarkdownString(contents)];
}
// --- hover ------
var HoverAdapter = /** @class */ (function () {
    function HoverAdapter(_worker) {
        this._worker = _worker;
    }
    HoverAdapter.prototype.provideHover = function (model, position, token) {
        var resource = model.uri;
        return this._worker(resource)
            .then(function (worker) {
            return worker.doHover(resource.toString(), fromPosition(position));
        })
            .then(function (info) {
            if (!info) {
                return;
            }
            return {
                range: toRange(info.range),
                contents: toMarkedStringArray(info.contents)
            };
        });
    };
    return HoverAdapter;
}());
// --- document highlights ------
function toDocumentHighlightKind(kind) {
    switch (kind) {
        case DocumentHighlightKind.Read:
            return languages.DocumentHighlightKind.Read;
        case DocumentHighlightKind.Write:
            return languages.DocumentHighlightKind.Write;
        case DocumentHighlightKind.Text:
            return languages.DocumentHighlightKind.Text;
    }
    return languages.DocumentHighlightKind.Text;
}
var DocumentHighlightAdapter = /** @class */ (function () {
    function DocumentHighlightAdapter(_worker) {
        this._worker = _worker;
    }
    DocumentHighlightAdapter.prototype.provideDocumentHighlights = function (model, position, token) {
        var resource = model.uri;
        return this._worker(resource)
            .then(function (worker) {
            return worker.findDocumentHighlights(resource.toString(), fromPosition(position));
        })
            .then(function (entries) {
            if (!entries) {
                return;
            }
            return entries.map(function (entry) {
                return {
                    range: toRange(entry.range),
                    kind: toDocumentHighlightKind(entry.kind)
                };
            });
        });
    };
    return DocumentHighlightAdapter;
}());
// --- definition ------
function toLocation(location) {
    return {
        uri: Uri.parse(location.uri),
        range: toRange(location.range)
    };
}
var DefinitionAdapter = /** @class */ (function () {
    function DefinitionAdapter(_worker) {
        this._worker = _worker;
    }
    DefinitionAdapter.prototype.provideDefinition = function (model, position, token) {
        var resource = model.uri;
        return this._worker(resource)
            .then(function (worker) {
            return worker.findDefinition(resource.toString(), fromPosition(position));
        })
            .then(function (definition) {
            if (!definition) {
                return;
            }
            return [toLocation(definition)];
        });
    };
    return DefinitionAdapter;
}());
// --- references ------
var ReferenceAdapter = /** @class */ (function () {
    function ReferenceAdapter(_worker) {
        this._worker = _worker;
    }
    ReferenceAdapter.prototype.provideReferences = function (model, position, context, token) {
        var resource = model.uri;
        return this._worker(resource)
            .then(function (worker) {
            return worker.findReferences(resource.toString(), fromPosition(position));
        })
            .then(function (entries) {
            if (!entries) {
                return;
            }
            return entries.map(toLocation);
        });
    };
    return ReferenceAdapter;
}());
// --- rename ------
function toWorkspaceEdit(edit) {
    if (!edit || !edit.changes) {
        return void 0;
    }
    var resourceEdits = [];
    for (var uri in edit.changes) {
        var _uri = Uri.parse(uri);
        // let edits: languages.TextEdit[] = [];
        for (var _i = 0, _a = edit.changes[uri]; _i < _a.length; _i++) {
            var e = _a[_i];
            resourceEdits.push({
                resource: _uri,
                edit: {
                    range: toRange(e.range),
                    text: e.newText
                }
            });
        }
    }
    return {
        edits: resourceEdits
    };
}
var RenameAdapter = /** @class */ (function () {
    function RenameAdapter(_worker) {
        this._worker = _worker;
    }
    RenameAdapter.prototype.provideRenameEdits = function (model, position, newName, token) {
        var resource = model.uri;
        return this._worker(resource)
            .then(function (worker) {
            return worker.doRename(resource.toString(), fromPosition(position), newName);
        })
            .then(function (edit) {
            return toWorkspaceEdit(edit);
        });
    };
    return RenameAdapter;
}());
// --- document symbols ------
function toSymbolKind(kind) {
    var mKind = languages.SymbolKind;
    switch (kind) {
        case SymbolKind.File:
            return mKind.Array;
        case SymbolKind.Module:
            return mKind.Module;
        case SymbolKind.Namespace:
            return mKind.Namespace;
        case SymbolKind.Package:
            return mKind.Package;
        case SymbolKind.Class:
            return mKind.Class;
        case SymbolKind.Method:
            return mKind.Method;
        case SymbolKind.Property:
            return mKind.Property;
        case SymbolKind.Field:
            return mKind.Field;
        case SymbolKind.Constructor:
            return mKind.Constructor;
        case SymbolKind.Enum:
            return mKind.Enum;
        case SymbolKind.Interface:
            return mKind.Interface;
        case SymbolKind.Function:
            return mKind.Function;
        case SymbolKind.Variable:
            return mKind.Variable;
        case SymbolKind.Constant:
            return mKind.Constant;
        case SymbolKind.String:
            return mKind.String;
        case SymbolKind.Number:
            return mKind.Number;
        case SymbolKind.Boolean:
            return mKind.Boolean;
        case SymbolKind.Array:
            return mKind.Array;
    }
    return mKind.Function;
}
var DocumentSymbolAdapter = /** @class */ (function () {
    function DocumentSymbolAdapter(_worker) {
        this._worker = _worker;
    }
    DocumentSymbolAdapter.prototype.provideDocumentSymbols = function (model, token) {
        var resource = model.uri;
        return this._worker(resource)
            .then(function (worker) { return worker.findDocumentSymbols(resource.toString()); })
            .then(function (items) {
            if (!items) {
                return;
            }
            return items.map(function (item) { return ({
                name: item.name,
                detail: '',
                containerName: item.containerName,
                kind: toSymbolKind(item.kind),
                tags: [],
                range: toRange(item.location.range),
                selectionRange: toRange(item.location.range)
            }); });
        });
    };
    return DocumentSymbolAdapter;
}());
var DocumentColorAdapter = /** @class */ (function () {
    function DocumentColorAdapter(_worker) {
        this._worker = _worker;
    }
    DocumentColorAdapter.prototype.provideDocumentColors = function (model, token) {
        var resource = model.uri;
        return this._worker(resource)
            .then(function (worker) { return worker.findDocumentColors(resource.toString()); })
            .then(function (infos) {
            if (!infos) {
                return;
            }
            return infos.map(function (item) { return ({
                color: item.color,
                range: toRange(item.range)
            }); });
        });
    };
    DocumentColorAdapter.prototype.provideColorPresentations = function (model, info, token) {
        var resource = model.uri;
        return this._worker(resource)
            .then(function (worker) {
            return worker.getColorPresentations(resource.toString(), info.color, fromRange(info.range));
        })
            .then(function (presentations) {
            if (!presentations) {
                return;
            }
            return presentations.map(function (presentation) {
                var item = {
                    label: presentation.label
                };
                if (presentation.textEdit) {
                    item.textEdit = toTextEdit(presentation.textEdit);
                }
                if (presentation.additionalTextEdits) {
                    item.additionalTextEdits = presentation.additionalTextEdits.map(toTextEdit);
                }
                return item;
            });
        });
    };
    return DocumentColorAdapter;
}());
var FoldingRangeAdapter = /** @class */ (function () {
    function FoldingRangeAdapter(_worker) {
        this._worker = _worker;
    }
    FoldingRangeAdapter.prototype.provideFoldingRanges = function (model, context, token) {
        var resource = model.uri;
        return this._worker(resource)
            .then(function (worker) { return worker.getFoldingRanges(resource.toString(), context); })
            .then(function (ranges) {
            if (!ranges) {
                return;
            }
            return ranges.map(function (range) {
                var result = {
                    start: range.startLine + 1,
                    end: range.endLine + 1
                };
                if (typeof range.kind !== 'undefined') {
                    result.kind = toFoldingRangeKind(range.kind);
                }
                return result;
            });
        });
    };
    return FoldingRangeAdapter;
}());
function toFoldingRangeKind(kind) {
    switch (kind) {
        case FoldingRangeKind.Comment:
            return languages.FoldingRangeKind.Comment;
        case FoldingRangeKind.Imports:
            return languages.FoldingRangeKind.Imports;
        case FoldingRangeKind.Region:
            return languages.FoldingRangeKind.Region;
    }
}
var SelectionRangeAdapter = /** @class */ (function () {
    function SelectionRangeAdapter(_worker) {
        this._worker = _worker;
    }
    SelectionRangeAdapter.prototype.provideSelectionRanges = function (model, positions, token) {
        var resource = model.uri;
        return this._worker(resource)
            .then(function (worker) { return worker.getSelectionRanges(resource.toString(), positions.map(fromPosition)); })
            .then(function (selectionRanges) {
            if (!selectionRanges) {
                return;
            }
            return selectionRanges.map(function (selectionRange) {
                var result = [];
                while (selectionRange) {
                    result.push({ range: toRange(selectionRange.range) });
                    selectionRange = selectionRange.parent;
                }
                return result;
            });
        });
    };
    return SelectionRangeAdapter;
}());

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function setupMode(defaults) {
    var disposables = [];
    var providers = [];
    var client = new WorkerManager(defaults);
    disposables.push(client);
    var worker = function () {
        var uris = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            uris[_i] = arguments[_i];
        }
        return client.getLanguageServiceWorker.apply(client, uris);
    };
    function registerProviders() {
        var languageId = defaults.languageId, modeConfiguration = defaults.modeConfiguration;
        disposeAll(providers);
        if (modeConfiguration.completionItems) {
            providers.push(languages.registerCompletionItemProvider(languageId, new CompletionAdapter(worker)));
        }
        if (modeConfiguration.hovers) {
            providers.push(languages.registerHoverProvider(languageId, new HoverAdapter(worker)));
        }
        if (modeConfiguration.documentHighlights) {
            providers.push(languages.registerDocumentHighlightProvider(languageId, new DocumentHighlightAdapter(worker)));
        }
        if (modeConfiguration.definitions) {
            providers.push(languages.registerDefinitionProvider(languageId, new DefinitionAdapter(worker)));
        }
        if (modeConfiguration.references) {
            providers.push(languages.registerReferenceProvider(languageId, new ReferenceAdapter(worker)));
        }
        if (modeConfiguration.documentSymbols) {
            providers.push(languages.registerDocumentSymbolProvider(languageId, new DocumentSymbolAdapter(worker)));
        }
        if (modeConfiguration.rename) {
            providers.push(languages.registerRenameProvider(languageId, new RenameAdapter(worker)));
        }
        if (modeConfiguration.colors) {
            providers.push(languages.registerColorProvider(languageId, new DocumentColorAdapter(worker)));
        }
        if (modeConfiguration.foldingRanges) {
            providers.push(languages.registerFoldingRangeProvider(languageId, new FoldingRangeAdapter(worker)));
        }
        if (modeConfiguration.diagnostics) {
            providers.push(new DiagnosticsAdapter(languageId, worker, defaults));
        }
        if (modeConfiguration.selectionRanges) {
            providers.push(languages.registerSelectionRangeProvider(languageId, new SelectionRangeAdapter(worker)));
        }
    }
    registerProviders();
    disposables.push(asDisposable(providers));
    return asDisposable(disposables);
}
function asDisposable(disposables) {
    return { dispose: function () { return disposeAll(disposables); } };
}
function disposeAll(disposables) {
    while (disposables.length) {
        disposables.pop().dispose();
    }
}

export { setupMode };
//# sourceMappingURL=cssMode-9b8ecbd6.es.js.map