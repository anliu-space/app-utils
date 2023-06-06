
/**
 * dkal-app-utils v1.0.1
 * (c) 1990-2023 anliu-space
 * Released under the MIT License.
 */

import { initialize } from '../../editor/editor.worker.js';
import { R as Range, P as Position, h as html_beautify, r as repeat, c as createScanner, T as TokenType, s as startsWith, U as URI, D as DocumentHighlightKind, L as Location, S as SymbolKind, F as FoldingRangeKind, i as isVoidElement, a as SelectionRange, p as parse, H as HTMLDataManager, b as HTMLHover, d as HTMLCompletion, e as TextDocument } from '../../../../../dataManager-417255f2.es.js';
import '../../../../../editorSimpleWorker-bc140aa4.es.js';

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function format(document, range, options) {
    var value = document.getText();
    var includesEnd = true;
    var initialIndentLevel = 0;
    var tabSize = options.tabSize || 4;
    if (range) {
        var startOffset = document.offsetAt(range.start);
        // include all leading whitespace iff at the beginning of the line
        var extendedStart = startOffset;
        while (extendedStart > 0 && isWhitespace(value, extendedStart - 1)) {
            extendedStart--;
        }
        if (extendedStart === 0 || isEOL(value, extendedStart - 1)) {
            startOffset = extendedStart;
        }
        else {
            // else keep at least one whitespace
            if (extendedStart < startOffset) {
                startOffset = extendedStart + 1;
            }
        }
        // include all following whitespace until the end of the line
        var endOffset = document.offsetAt(range.end);
        var extendedEnd = endOffset;
        while (extendedEnd < value.length && isWhitespace(value, extendedEnd)) {
            extendedEnd++;
        }
        if (extendedEnd === value.length || isEOL(value, extendedEnd)) {
            endOffset = extendedEnd;
        }
        range = Range.create(document.positionAt(startOffset), document.positionAt(endOffset));
        // Do not modify if substring starts in inside an element
        // Ending inside an element is fine as it doesn't cause formatting errors
        var firstHalf = value.substring(0, startOffset);
        if (new RegExp(/.*[<][^>]*$/).test(firstHalf)) {
            //return without modification
            value = value.substring(startOffset, endOffset);
            return [{
                    range: range,
                    newText: value
                }];
        }
        includesEnd = endOffset === value.length;
        value = value.substring(startOffset, endOffset);
        if (startOffset !== 0) {
            var startOfLineOffset = document.offsetAt(Position.create(range.start.line, 0));
            initialIndentLevel = computeIndentLevel(document.getText(), startOfLineOffset, options);
        }
    }
    else {
        range = Range.create(Position.create(0, 0), document.positionAt(value.length));
    }
    var htmlOptions = {
        indent_size: tabSize,
        indent_char: options.insertSpaces ? ' ' : '\t',
        indent_empty_lines: getFormatOption(options, 'indentEmptyLines', false),
        wrap_line_length: getFormatOption(options, 'wrapLineLength', 120),
        unformatted: getTagsFormatOption(options, 'unformatted', void 0),
        content_unformatted: getTagsFormatOption(options, 'contentUnformatted', void 0),
        indent_inner_html: getFormatOption(options, 'indentInnerHtml', false),
        preserve_newlines: getFormatOption(options, 'preserveNewLines', true),
        max_preserve_newlines: getFormatOption(options, 'maxPreserveNewLines', 32786),
        indent_handlebars: getFormatOption(options, 'indentHandlebars', false),
        end_with_newline: includesEnd && getFormatOption(options, 'endWithNewline', false),
        extra_liners: getTagsFormatOption(options, 'extraLiners', void 0),
        wrap_attributes: getFormatOption(options, 'wrapAttributes', 'auto'),
        wrap_attributes_indent_size: getFormatOption(options, 'wrapAttributesIndentSize', void 0),
        eol: '\n'
    };
    var result = html_beautify(trimLeft(value), htmlOptions);
    if (initialIndentLevel > 0) {
        var indent = options.insertSpaces ? repeat(' ', tabSize * initialIndentLevel) : repeat('\t', initialIndentLevel);
        result = result.split('\n').join('\n' + indent);
        if (range.start.character === 0) {
            result = indent + result; // keep the indent
        }
    }
    return [{
            range: range,
            newText: result
        }];
}
function trimLeft(str) {
    return str.replace(/^\s+/, '');
}
function getFormatOption(options, key, dflt) {
    if (options && options.hasOwnProperty(key)) {
        var value = options[key];
        if (value !== null) {
            return value;
        }
    }
    return dflt;
}
function getTagsFormatOption(options, key, dflt) {
    var list = getFormatOption(options, key, null);
    if (typeof list === 'string') {
        if (list.length > 0) {
            return list.split(',').map(function (t) { return t.trim().toLowerCase(); });
        }
        return [];
    }
    return dflt;
}
function computeIndentLevel(content, offset, options) {
    var i = offset;
    var nChars = 0;
    var tabSize = options.tabSize || 4;
    while (i < content.length) {
        var ch = content.charAt(i);
        if (ch === ' ') {
            nChars++;
        }
        else if (ch === '\t') {
            nChars += tabSize;
        }
        else {
            break;
        }
        i++;
    }
    return Math.floor(nChars / tabSize);
}
function isEOL(text, offset) {
    return '\r\n'.indexOf(text.charAt(offset)) !== -1;
}
function isWhitespace(text, offset) {
    return ' \t'.indexOf(text.charAt(offset)) !== -1;
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function normalizeRef(url) {
    var first = url[0];
    var last = url[url.length - 1];
    if (first === last && (first === '\'' || first === '\"')) {
        url = url.substr(1, url.length - 2);
    }
    return url;
}
function validateRef(url, languageId) {
    if (!url.length) {
        return false;
    }
    if (languageId === 'handlebars' && /{{.*}}/.test(url)) {
        return false;
    }
    return /\b(w[\w\d+.-]*:\/\/)?[^\s()<>]+(?:\([\w\d]+\)|([^[:punct:]\s]|\/?))/.test(url);
}
function getWorkspaceUrl(documentUri, tokenContent, documentContext, base) {
    if (/^\s*javascript\:/i.test(tokenContent) || /[\n\r]/.test(tokenContent)) {
        return undefined;
    }
    tokenContent = tokenContent.replace(/^\s*/g, '');
    if (/^https?:\/\//i.test(tokenContent) || /^file:\/\//i.test(tokenContent)) {
        // Absolute link that needs no treatment
        return tokenContent;
    }
    if (/^\#/i.test(tokenContent)) {
        return documentUri + tokenContent;
    }
    if (/^\/\//i.test(tokenContent)) {
        // Absolute link (that does not name the protocol)
        var pickedScheme = startsWith(documentUri, 'https://') ? 'https' : 'http';
        return pickedScheme + ':' + tokenContent.replace(/^\s*/g, '');
    }
    if (documentContext) {
        return documentContext.resolveReference(tokenContent, base || documentUri);
    }
    return tokenContent;
}
function createLink(document, documentContext, attributeValue, startOffset, endOffset, base) {
    var tokenContent = normalizeRef(attributeValue);
    if (!validateRef(tokenContent, document.languageId)) {
        return undefined;
    }
    if (tokenContent.length < attributeValue.length) {
        startOffset++;
        endOffset--;
    }
    var workspaceUrl = getWorkspaceUrl(document.uri, tokenContent, documentContext, base);
    if (!workspaceUrl || !isValidURI(workspaceUrl)) {
        return undefined;
    }
    return {
        range: Range.create(document.positionAt(startOffset), document.positionAt(endOffset)),
        target: workspaceUrl
    };
}
function isValidURI(uri) {
    try {
        URI.parse(uri);
        return true;
    }
    catch (e) {
        return false;
    }
}
function findDocumentLinks(document, documentContext) {
    var newLinks = [];
    var scanner = createScanner(document.getText(), 0);
    var token = scanner.scan();
    var lastAttributeName = undefined;
    var afterBase = false;
    var base = void 0;
    var idLocations = {};
    while (token !== TokenType.EOS) {
        switch (token) {
            case TokenType.StartTag:
                if (!base) {
                    var tagName = scanner.getTokenText().toLowerCase();
                    afterBase = tagName === 'base';
                }
                break;
            case TokenType.AttributeName:
                lastAttributeName = scanner.getTokenText().toLowerCase();
                break;
            case TokenType.AttributeValue:
                if (lastAttributeName === 'src' || lastAttributeName === 'href') {
                    var attributeValue = scanner.getTokenText();
                    if (!afterBase) { // don't highlight the base link itself
                        var link = createLink(document, documentContext, attributeValue, scanner.getTokenOffset(), scanner.getTokenEnd(), base);
                        if (link) {
                            newLinks.push(link);
                        }
                    }
                    if (afterBase && typeof base === 'undefined') {
                        base = normalizeRef(attributeValue);
                        if (base && documentContext) {
                            base = documentContext.resolveReference(base, document.uri);
                        }
                    }
                    afterBase = false;
                    lastAttributeName = undefined;
                }
                else if (lastAttributeName === 'id') {
                    var id = normalizeRef(scanner.getTokenText());
                    idLocations[id] = scanner.getTokenOffset();
                }
                break;
        }
        token = scanner.scan();
    }
    // change local links with ids to actual positions
    for (var _i = 0, newLinks_1 = newLinks; _i < newLinks_1.length; _i++) {
        var link = newLinks_1[_i];
        var localWithHash = document.uri + '#';
        if (link.target && startsWith(link.target, localWithHash)) {
            var target = link.target.substr(localWithHash.length);
            var offset = idLocations[target];
            if (offset !== undefined) {
                var pos = document.positionAt(offset);
                link.target = "" + localWithHash + (pos.line + 1) + "," + (pos.character + 1);
            }
        }
    }
    return newLinks;
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function findDocumentHighlights(document, position, htmlDocument) {
    var offset = document.offsetAt(position);
    var node = htmlDocument.findNodeAt(offset);
    if (!node.tag) {
        return [];
    }
    var result = [];
    var startTagRange = getTagNameRange(TokenType.StartTag, document, node.start);
    var endTagRange = typeof node.endTagStart === 'number' && getTagNameRange(TokenType.EndTag, document, node.endTagStart);
    if (startTagRange && covers(startTagRange, position) || endTagRange && covers(endTagRange, position)) {
        if (startTagRange) {
            result.push({ kind: DocumentHighlightKind.Read, range: startTagRange });
        }
        if (endTagRange) {
            result.push({ kind: DocumentHighlightKind.Read, range: endTagRange });
        }
    }
    return result;
}
function isBeforeOrEqual(pos1, pos2) {
    return pos1.line < pos2.line || (pos1.line === pos2.line && pos1.character <= pos2.character);
}
function covers(range, position) {
    return isBeforeOrEqual(range.start, position) && isBeforeOrEqual(position, range.end);
}
function getTagNameRange(tokenType, document, startOffset) {
    var scanner = createScanner(document.getText(), startOffset);
    var token = scanner.scan();
    while (token !== TokenType.EOS && token !== tokenType) {
        token = scanner.scan();
    }
    if (token !== TokenType.EOS) {
        return { start: document.positionAt(scanner.getTokenOffset()), end: document.positionAt(scanner.getTokenEnd()) };
    }
    return null;
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function findDocumentSymbols(document, htmlDocument) {
    var symbols = [];
    htmlDocument.roots.forEach(function (node) {
        provideFileSymbolsInternal(document, node, '', symbols);
    });
    return symbols;
}
function provideFileSymbolsInternal(document, node, container, symbols) {
    var name = nodeToName(node);
    var location = Location.create(document.uri, Range.create(document.positionAt(node.start), document.positionAt(node.end)));
    var symbol = {
        name: name,
        location: location,
        containerName: container,
        kind: SymbolKind.Field
    };
    symbols.push(symbol);
    node.children.forEach(function (child) {
        provideFileSymbolsInternal(document, child, name, symbols);
    });
}
function nodeToName(node) {
    var name = node.tag;
    if (node.attributes) {
        var id = node.attributes['id'];
        var classes = node.attributes['class'];
        if (id) {
            name += "#" + id.replace(/[\"\']/g, '');
        }
        if (classes) {
            name += classes.replace(/[\"\']/g, '').split(/\s+/).map(function (className) { return "." + className; }).join('');
        }
    }
    return name || '?';
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function doRename(document, position, newName, htmlDocument) {
    var _a;
    var offset = document.offsetAt(position);
    var node = htmlDocument.findNodeAt(offset);
    if (!node.tag) {
        return null;
    }
    if (!isWithinTagRange(node, offset, node.tag)) {
        return null;
    }
    var edits = [];
    var startTagRange = {
        start: document.positionAt(node.start + '<'.length),
        end: document.positionAt(node.start + '<'.length + node.tag.length)
    };
    edits.push({
        range: startTagRange,
        newText: newName
    });
    if (node.endTagStart) {
        var endTagRange = {
            start: document.positionAt(node.endTagStart + '</'.length),
            end: document.positionAt(node.endTagStart + '</'.length + node.tag.length)
        };
        edits.push({
            range: endTagRange,
            newText: newName
        });
    }
    var changes = (_a = {},
        _a[document.uri.toString()] = edits,
        _a);
    return {
        changes: changes
    };
}
function isWithinTagRange(node, offset, nodeTag) {
    // Self-closing tag
    if (node.endTagStart) {
        if (node.endTagStart + '</'.length <= offset && offset <= node.endTagStart + '</'.length + nodeTag.length) {
            return true;
        }
    }
    return node.start + '<'.length <= offset && offset <= node.start + '<'.length + nodeTag.length;
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function findMatchingTagPosition(document, position, htmlDocument) {
    var offset = document.offsetAt(position);
    var node = htmlDocument.findNodeAt(offset);
    if (!node.tag) {
        return null;
    }
    if (!node.endTagStart) {
        return null;
    }
    // Within open tag, compute close tag
    if (node.start + '<'.length <= offset && offset <= node.start + '<'.length + node.tag.length) {
        var mirrorOffset = (offset - '<'.length - node.start) + node.endTagStart + '</'.length;
        return document.positionAt(mirrorOffset);
    }
    // Within closing tag, compute open tag
    if (node.endTagStart + '</'.length <= offset && offset <= node.endTagStart + '</'.length + node.tag.length) {
        var mirrorOffset = (offset - '</'.length - node.endTagStart) + node.start + '<'.length;
        return document.positionAt(mirrorOffset);
    }
    return null;
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function findOnTypeRenameRanges(document, position, htmlDocument) {
    var offset = document.offsetAt(position);
    var node = htmlDocument.findNodeAt(offset);
    var tagLength = node.tag ? node.tag.length : 0;
    if (!node.endTagStart) {
        return null;
    }
    if (
    // Within open tag, compute close tag
    (node.start + '<'.length <= offset && offset <= node.start + '<'.length + tagLength) ||
        // Within closing tag, compute open tag
        node.endTagStart + '</'.length <= offset && offset <= node.endTagStart + '</'.length + tagLength) {
        return [
            Range.create(document.positionAt(node.start + '<'.length), document.positionAt(node.start + '<'.length + tagLength)),
            Range.create(document.positionAt(node.endTagStart + '</'.length), document.positionAt(node.endTagStart + '</'.length + tagLength))
        ];
    }
    return null;
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function limitRanges(ranges, rangeLimit) {
    ranges = ranges.sort(function (r1, r2) {
        var diff = r1.startLine - r2.startLine;
        if (diff === 0) {
            diff = r1.endLine - r2.endLine;
        }
        return diff;
    });
    // compute each range's nesting level in 'nestingLevels'.
    // count the number of ranges for each level in 'nestingLevelCounts'
    var top = void 0;
    var previous = [];
    var nestingLevels = [];
    var nestingLevelCounts = [];
    var setNestingLevel = function (index, level) {
        nestingLevels[index] = level;
        if (level < 30) {
            nestingLevelCounts[level] = (nestingLevelCounts[level] || 0) + 1;
        }
    };
    // compute nesting levels and sanitize
    for (var i = 0; i < ranges.length; i++) {
        var entry = ranges[i];
        if (!top) {
            top = entry;
            setNestingLevel(i, 0);
        }
        else {
            if (entry.startLine > top.startLine) {
                if (entry.endLine <= top.endLine) {
                    previous.push(top);
                    top = entry;
                    setNestingLevel(i, previous.length);
                }
                else if (entry.startLine > top.endLine) {
                    do {
                        top = previous.pop();
                    } while (top && entry.startLine > top.endLine);
                    if (top) {
                        previous.push(top);
                    }
                    top = entry;
                    setNestingLevel(i, previous.length);
                }
            }
        }
    }
    var entries = 0;
    var maxLevel = 0;
    for (var i = 0; i < nestingLevelCounts.length; i++) {
        var n = nestingLevelCounts[i];
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
function getFoldingRanges(document, context) {
    var scanner = createScanner(document.getText());
    var token = scanner.scan();
    var ranges = [];
    var stack = [];
    var lastTagName = null;
    var prevStart = -1;
    function addRange(range) {
        ranges.push(range);
        prevStart = range.startLine;
    }
    while (token !== TokenType.EOS) {
        switch (token) {
            case TokenType.StartTag: {
                var tagName = scanner.getTokenText();
                var startLine = document.positionAt(scanner.getTokenOffset()).line;
                stack.push({ startLine: startLine, tagName: tagName });
                lastTagName = tagName;
                break;
            }
            case TokenType.EndTag: {
                lastTagName = scanner.getTokenText();
                break;
            }
            case TokenType.StartTagClose:
                if (!lastTagName || !isVoidElement(lastTagName)) {
                    break;
                }
            // fallthrough
            case TokenType.EndTagClose:
            case TokenType.StartTagSelfClose: {
                var i = stack.length - 1;
                while (i >= 0 && stack[i].tagName !== lastTagName) {
                    i--;
                }
                if (i >= 0) {
                    var stackElement = stack[i];
                    stack.length = i;
                    var line = document.positionAt(scanner.getTokenOffset()).line;
                    var startLine = stackElement.startLine;
                    var endLine = line - 1;
                    if (endLine > startLine && prevStart !== startLine) {
                        addRange({ startLine: startLine, endLine: endLine });
                    }
                }
                break;
            }
            case TokenType.Comment: {
                var startLine = document.positionAt(scanner.getTokenOffset()).line;
                var text = scanner.getTokenText();
                var m = text.match(/^\s*#(region\b)|(endregion\b)/);
                if (m) {
                    if (m[1]) { // start pattern match
                        stack.push({ startLine: startLine, tagName: '' }); // empty tagName marks region
                    }
                    else {
                        var i = stack.length - 1;
                        while (i >= 0 && stack[i].tagName.length) {
                            i--;
                        }
                        if (i >= 0) {
                            var stackElement = stack[i];
                            stack.length = i;
                            var endLine = startLine;
                            startLine = stackElement.startLine;
                            if (endLine > startLine && prevStart !== startLine) {
                                addRange({ startLine: startLine, endLine: endLine, kind: FoldingRangeKind.Region });
                            }
                        }
                    }
                }
                else {
                    var endLine = document.positionAt(scanner.getTokenOffset() + scanner.getTokenLength()).line;
                    if (startLine < endLine) {
                        addRange({ startLine: startLine, endLine: endLine, kind: FoldingRangeKind.Comment });
                    }
                }
                break;
            }
        }
        token = scanner.scan();
    }
    var rangeLimit = context && context.rangeLimit || Number.MAX_VALUE;
    if (ranges.length > rangeLimit) {
        return limitRanges(ranges, rangeLimit);
    }
    return ranges;
}

/**
 * Until SelectionRange lands in LSP, we'll return Range from server and convert it to
 * SelectionRange on client side
 */
function getSelectionRanges(document, positions) {
    function getSelectionRange(position) {
        var applicableRanges = getApplicableRanges(document, position);
        var prev = undefined;
        var current = undefined;
        for (var index = applicableRanges.length - 1; index >= 0; index--) {
            var range = applicableRanges[index];
            if (!prev || range[0] !== prev[0] || range[1] !== prev[1]) {
                current = SelectionRange.create(Range.create(document.positionAt(applicableRanges[index][0]), document.positionAt(applicableRanges[index][1])), current);
            }
            prev = range;
        }
        if (!current) {
            current = SelectionRange.create(Range.create(position, position));
        }
        return current;
    }
    return positions.map(getSelectionRange);
}
function getApplicableRanges(document, position) {
    var htmlDoc = parse(document.getText());
    var currOffset = document.offsetAt(position);
    var currNode = htmlDoc.findNodeAt(currOffset);
    var result = getAllParentTagRanges(currNode);
    // Self-closing or void elements
    if (currNode.startTagEnd && !currNode.endTagStart) {
        // THe rare case of unmatching tag pairs like <div></div1>
        if (currNode.startTagEnd !== currNode.end) {
            return [[currNode.start, currNode.end]];
        }
        var closeRange = Range.create(document.positionAt(currNode.startTagEnd - 2), document.positionAt(currNode.startTagEnd));
        var closeText = document.getText(closeRange);
        // Self-closing element
        if (closeText === '/>') {
            result.unshift([currNode.start + 1, currNode.startTagEnd - 2]);
        }
        // Void element
        else {
            result.unshift([currNode.start + 1, currNode.startTagEnd - 1]);
        }
        var attributeLevelRanges = getAttributeLevelRanges(document, currNode, currOffset);
        result = attributeLevelRanges.concat(result);
        return result;
    }
    if (!currNode.startTagEnd || !currNode.endTagStart) {
        return result;
    }
    /**
     * For html like
     * `<div class="foo">bar</div>`
     */
    result.unshift([currNode.start, currNode.end]);
    /**
     * Cursor inside `<div class="foo">`
     */
    if (currNode.start < currOffset && currOffset < currNode.startTagEnd) {
        result.unshift([currNode.start + 1, currNode.startTagEnd - 1]);
        var attributeLevelRanges = getAttributeLevelRanges(document, currNode, currOffset);
        result = attributeLevelRanges.concat(result);
        return result;
    }
    /**
     * Cursor inside `bar`
     */
    else if (currNode.startTagEnd <= currOffset && currOffset <= currNode.endTagStart) {
        result.unshift([currNode.startTagEnd, currNode.endTagStart]);
        return result;
    }
    /**
     * Cursor inside `</div>`
     */
    else {
        // `div` inside `</div>`
        if (currOffset >= currNode.endTagStart + 2) {
            result.unshift([currNode.endTagStart + 2, currNode.end - 1]);
        }
        return result;
    }
}
function getAllParentTagRanges(initialNode) {
    var currNode = initialNode;
    var getNodeRanges = function (n) {
        if (n.startTagEnd && n.endTagStart && n.startTagEnd < n.endTagStart) {
            return [
                [n.startTagEnd, n.endTagStart],
                [n.start, n.end]
            ];
        }
        return [
            [n.start, n.end]
        ];
    };
    var result = [];
    while (currNode.parent) {
        currNode = currNode.parent;
        getNodeRanges(currNode).forEach(function (r) { return result.push(r); });
    }
    return result;
}
function getAttributeLevelRanges(document, currNode, currOffset) {
    var currNodeRange = Range.create(document.positionAt(currNode.start), document.positionAt(currNode.end));
    var currNodeText = document.getText(currNodeRange);
    var relativeOffset = currOffset - currNode.start;
    /**
     * Tag level semantic selection
     */
    var scanner = createScanner(currNodeText);
    var token = scanner.scan();
    /**
     * For text like
     * <div class="foo">bar</div>
     */
    var positionOffset = currNode.start;
    var result = [];
    var isInsideAttribute = false;
    var attrStart = -1;
    while (token !== TokenType.EOS) {
        switch (token) {
            case TokenType.AttributeName: {
                if (relativeOffset < scanner.getTokenOffset()) {
                    isInsideAttribute = false;
                    break;
                }
                if (relativeOffset <= scanner.getTokenEnd()) {
                    // `class`
                    result.unshift([scanner.getTokenOffset(), scanner.getTokenEnd()]);
                }
                isInsideAttribute = true;
                attrStart = scanner.getTokenOffset();
                break;
            }
            case TokenType.AttributeValue: {
                if (!isInsideAttribute) {
                    break;
                }
                var valueText = scanner.getTokenText();
                if (relativeOffset < scanner.getTokenOffset()) {
                    // `class="foo"`
                    result.push([attrStart, scanner.getTokenEnd()]);
                    break;
                }
                if (relativeOffset >= scanner.getTokenOffset() && relativeOffset <= scanner.getTokenEnd()) {
                    // `"foo"`
                    result.unshift([scanner.getTokenOffset(), scanner.getTokenEnd()]);
                    // `foo`
                    if ((valueText[0] === "\"" && valueText[valueText.length - 1] === "\"") || (valueText[0] === "'" && valueText[valueText.length - 1] === "'")) {
                        if (relativeOffset >= scanner.getTokenOffset() + 1 && relativeOffset <= scanner.getTokenEnd() - 1) {
                            result.unshift([scanner.getTokenOffset() + 1, scanner.getTokenEnd() - 1]);
                        }
                    }
                    // `class="foo"`
                    result.push([attrStart, scanner.getTokenEnd()]);
                }
                break;
            }
        }
        token = scanner.scan();
    }
    return result.map(function (pair) {
        return [pair[0] + positionOffset, pair[1] + positionOffset];
    });
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var defaultLanguageServiceOptions = {};
function getLanguageService(options) {
    if (options === void 0) { options = defaultLanguageServiceOptions; }
    var dataManager = new HTMLDataManager(options);
    var htmlHover = new HTMLHover(options, dataManager);
    var htmlCompletion = new HTMLCompletion(options, dataManager);
    return {
        setDataProviders: dataManager.setDataProviders.bind(dataManager),
        createScanner: createScanner,
        parseHTMLDocument: function (document) { return parse(document.getText()); },
        doComplete: htmlCompletion.doComplete.bind(htmlCompletion),
        doComplete2: htmlCompletion.doComplete2.bind(htmlCompletion),
        setCompletionParticipants: htmlCompletion.setCompletionParticipants.bind(htmlCompletion),
        doHover: htmlHover.doHover.bind(htmlHover),
        format: format,
        findDocumentHighlights: findDocumentHighlights,
        findDocumentLinks: findDocumentLinks,
        findDocumentSymbols: findDocumentSymbols,
        getFoldingRanges: getFoldingRanges,
        getSelectionRanges: getSelectionRanges,
        doTagComplete: htmlCompletion.doTagComplete.bind(htmlCompletion),
        doRename: doRename,
        findMatchingTagPosition: findMatchingTagPosition,
        findOnTypeRenameRanges: findOnTypeRenameRanges
    };
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __assign = (self && self.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var HTMLWorker = /** @class */ (function () {
    function HTMLWorker(ctx, createData) {
        this._ctx = ctx;
        this._languageSettings = createData.languageSettings;
        this._languageId = createData.languageId;
        this._languageService = getLanguageService();
    }
    HTMLWorker.prototype.doValidation = function (uri) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // not yet suported
                return [2 /*return*/, Promise.resolve([])];
            });
        });
    };
    HTMLWorker.prototype.doComplete = function (uri, position) {
        return __awaiter(this, void 0, void 0, function () {
            var document, htmlDocument;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                htmlDocument = this._languageService.parseHTMLDocument(document);
                return [2 /*return*/, Promise.resolve(this._languageService.doComplete(document, position, htmlDocument, this._languageSettings && this._languageSettings.suggest))];
            });
        });
    };
    HTMLWorker.prototype.format = function (uri, range, options) {
        return __awaiter(this, void 0, void 0, function () {
            var document, formattingOptions, textEdits;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                formattingOptions = __assign(__assign({}, this._languageSettings.format), options);
                textEdits = this._languageService.format(document, range, formattingOptions);
                return [2 /*return*/, Promise.resolve(textEdits)];
            });
        });
    };
    HTMLWorker.prototype.doHover = function (uri, position) {
        return __awaiter(this, void 0, void 0, function () {
            var document, htmlDocument, hover;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                htmlDocument = this._languageService.parseHTMLDocument(document);
                hover = this._languageService.doHover(document, position, htmlDocument);
                return [2 /*return*/, Promise.resolve(hover)];
            });
        });
    };
    HTMLWorker.prototype.findDocumentHighlights = function (uri, position) {
        return __awaiter(this, void 0, void 0, function () {
            var document, htmlDocument, highlights;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                htmlDocument = this._languageService.parseHTMLDocument(document);
                highlights = this._languageService.findDocumentHighlights(document, position, htmlDocument);
                return [2 /*return*/, Promise.resolve(highlights)];
            });
        });
    };
    HTMLWorker.prototype.findDocumentLinks = function (uri) {
        return __awaiter(this, void 0, void 0, function () {
            var document, links;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                links = this._languageService.findDocumentLinks(document, null);
                return [2 /*return*/, Promise.resolve(links)];
            });
        });
    };
    HTMLWorker.prototype.findDocumentSymbols = function (uri) {
        return __awaiter(this, void 0, void 0, function () {
            var document, htmlDocument, symbols;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                htmlDocument = this._languageService.parseHTMLDocument(document);
                symbols = this._languageService.findDocumentSymbols(document, htmlDocument);
                return [2 /*return*/, Promise.resolve(symbols)];
            });
        });
    };
    HTMLWorker.prototype.getFoldingRanges = function (uri, context) {
        return __awaiter(this, void 0, void 0, function () {
            var document, ranges;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                ranges = this._languageService.getFoldingRanges(document, context);
                return [2 /*return*/, Promise.resolve(ranges)];
            });
        });
    };
    HTMLWorker.prototype.getSelectionRanges = function (uri, positions) {
        return __awaiter(this, void 0, void 0, function () {
            var document, ranges;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                ranges = this._languageService.getSelectionRanges(document, positions);
                return [2 /*return*/, Promise.resolve(ranges)];
            });
        });
    };
    HTMLWorker.prototype.doRename = function (uri, position, newName) {
        return __awaiter(this, void 0, void 0, function () {
            var document, htmlDocument, renames;
            return __generator(this, function (_a) {
                document = this._getTextDocument(uri);
                htmlDocument = this._languageService.parseHTMLDocument(document);
                renames = this._languageService.doRename(document, position, newName, htmlDocument);
                return [2 /*return*/, Promise.resolve(renames)];
            });
        });
    };
    HTMLWorker.prototype._getTextDocument = function (uri) {
        var models = this._ctx.getMirrorModels();
        for (var _i = 0, models_1 = models; _i < models_1.length; _i++) {
            var model = models_1[_i];
            if (model.uri.toString() === uri) {
                return TextDocument.create(uri, this._languageId, model.version, model.getValue());
            }
        }
        return null;
    };
    return HTMLWorker;
}());

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
self.onmessage = function () {
    // ignore the first message
    initialize(function (ctx, createData) {
        return new HTMLWorker(ctx, createData);
    });
};
//# sourceMappingURL=html.worker.js.map
