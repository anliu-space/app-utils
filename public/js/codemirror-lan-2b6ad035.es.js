
/**
 * dkal-app-utils v1.0.1
 * (c) 1990-2023 anliu-space
 * Released under the MIT License.
 */

(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
import { _ as _createClass, d as _classCallCheck, b as _inherits, c as _createSuper, a as _createForOfIteratorHelper, h as _toConsumableArray, g as _slicedToArray, i as _typeof } from './dayjs-19c6a114.es.js';
import { N as NodeProp, T as Tree, a as NodeSet, b as NodeType, D as DefaultBufferLength, P as Parser, I as IterMode, s as styleTags, t as tags, L as LanguageSupport, i as ifNotIn, c as completeFromList, E as EditorView, d as syntaxTree, e as EditorSelection, f as LRLanguage, g as indentNodeProp, h as continuedIndent, j as flatIndent, k as delimitedIndent, l as foldNodeProp, m as foldInside, n as sublanguageProp, o as snippetCompletion, p as defineLanguageFacet, q as NodeWeakMap } from './codemirror-b829ae8b.es.js';

/// A parse stack. These are used internally by the parser to track
/// parsing progress. They also provide some properties and methods
/// that external code such as a tokenizer can use to get information
/// about the parse state.
var Stack = /*#__PURE__*/function () {
  /// @internal
  function Stack(
  /// The parse that this stack is part of @internal
  p,
  /// Holds state, input pos, buffer index triplets for all but the
  /// top state @internal
  stack,
  /// The current parse state @internal
  state,
  // The position at which the next reduce should take place. This
  // can be less than `this.pos` when skipped expressions have been
  // added to the stack (which should be moved outside of the next
  // reduction)
  /// @internal
  reducePos,
  /// The input position up to which this stack has parsed.
  pos,
  /// The dynamic score of the stack, including dynamic precedence
  /// and error-recovery penalties
  /// @internal
  score,
  // The output buffer. Holds (type, start, end, size) quads
  // representing nodes created by the parser, where `size` is
  // amount of buffer array entries covered by this node.
  /// @internal
  buffer,
  // The base offset of the buffer. When stacks are split, the split
  // instance shared the buffer history with its parent up to
  // `bufferBase`, which is the absolute offset (including the
  // offset of previous splits) into the buffer at which this stack
  // starts writing.
  /// @internal
  bufferBase,
  /// @internal
  curContext) {
    var lookAhead = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : 0;
    var
    // A parent stack from which this was split off, if any. This is
    // set up so that it always points to a stack that has some
    // additional buffer content, never to a stack with an equal
    // `bufferBase`.
    /// @internal
    parent = arguments.length > 10 ? arguments[10] : undefined;
    _classCallCheck(this, Stack);
    this.p = p;
    this.stack = stack;
    this.state = state;
    this.reducePos = reducePos;
    this.pos = pos;
    this.score = score;
    this.buffer = buffer;
    this.bufferBase = bufferBase;
    this.curContext = curContext;
    this.lookAhead = lookAhead;
    this.parent = parent;
  }
  /// @internal
  _createClass(Stack, [{
    key: "toString",
    value: function toString() {
      return "[".concat(this.stack.filter(function (_, i) {
        return i % 3 == 0;
      }).concat(this.state), "]@").concat(this.pos).concat(this.score ? "!" + this.score : "");
    }
    // Start an empty stack
    /// @internal
  }, {
    key: "context",
    get:
    /// The stack's current [context](#lr.ContextTracker) value, if
    /// any. Its type will depend on the context tracker's type
    /// parameter, or it will be `null` if there is no context
    /// tracker.
    function get() {
      return this.curContext ? this.curContext.context : null;
    }
    // Push a state onto the stack, tracking its start position as well
    // as the buffer base at that point.
    /// @internal
  }, {
    key: "pushState",
    value: function pushState(state, start) {
      this.stack.push(this.state, start, this.bufferBase + this.buffer.length);
      this.state = state;
    }
    // Apply a reduce action
    /// @internal
  }, {
    key: "reduce",
    value: function reduce(action) {
      var _a;
      var depth = action >> 19 /* Action.ReduceDepthShift */,
        type = action & 65535 /* Action.ValueMask */;
      var parser = this.p.parser;
      var dPrec = parser.dynamicPrecedence(type);
      if (dPrec) this.score += dPrec;
      if (depth == 0) {
        this.pushState(parser.getGoto(this.state, type, true), this.reducePos);
        // Zero-depth reductions are a special case—they add stuff to
        // the stack without popping anything off.
        if (type < parser.minRepeatTerm) this.storeNode(type, this.reducePos, this.reducePos, 4, true);
        this.reduceContext(type, this.reducePos);
        return;
      }
      // Find the base index into `this.stack`, content after which will
      // be dropped. Note that with `StayFlag` reductions we need to
      // consume two extra frames (the dummy parent node for the skipped
      // expression and the state that we'll be staying in, which should
      // be moved to `this.state`).
      var base = this.stack.length - (depth - 1) * 3 - (action & 262144 /* Action.StayFlag */ ? 6 : 0);
      var start = base ? this.stack[base - 2] : this.p.ranges[0].from,
        size = this.reducePos - start;
      // This is a kludge to try and detect overly deep left-associative
      // trees, which will not increase the parse stack depth and thus
      // won't be caught by the regular stack-depth limit check.
      if (size >= 2000 /* Recover.MinBigReduction */ && !((_a = this.p.parser.nodeSet.types[type]) === null || _a === void 0 ? void 0 : _a.isAnonymous)) {
        if (start == this.p.lastBigReductionStart) {
          this.p.bigReductionCount++;
          this.p.lastBigReductionSize = size;
        } else if (this.p.lastBigReductionSize < size) {
          this.p.bigReductionCount = 1;
          this.p.lastBigReductionStart = start;
          this.p.lastBigReductionSize = size;
        }
      }
      var bufferBase = base ? this.stack[base - 1] : 0,
        count = this.bufferBase + this.buffer.length - bufferBase;
      // Store normal terms or `R -> R R` repeat reductions
      if (type < parser.minRepeatTerm || action & 131072 /* Action.RepeatFlag */) {
        var pos = parser.stateFlag(this.state, 1 /* StateFlag.Skipped */) ? this.pos : this.reducePos;
        this.storeNode(type, start, pos, count + 4, true);
      }
      if (action & 262144 /* Action.StayFlag */) {
        this.state = this.stack[base];
      } else {
        var baseStateID = this.stack[base - 3];
        this.state = parser.getGoto(baseStateID, type, true);
      }
      while (this.stack.length > base) this.stack.pop();
      this.reduceContext(type, start);
    }
    // Shift a value into the buffer
    /// @internal
  }, {
    key: "storeNode",
    value: function storeNode(term, start, end) {
      var size = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 4;
      var isReduce = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
      if (term == 0 /* Term.Err */ && (!this.stack.length || this.stack[this.stack.length - 1] < this.buffer.length + this.bufferBase)) {
        // Try to omit/merge adjacent error nodes
        var cur = this,
          top = this.buffer.length;
        if (top == 0 && cur.parent) {
          top = cur.bufferBase - cur.parent.bufferBase;
          cur = cur.parent;
        }
        if (top > 0 && cur.buffer[top - 4] == 0 /* Term.Err */ && cur.buffer[top - 1] > -1) {
          if (start == end) return;
          if (cur.buffer[top - 2] >= start) {
            cur.buffer[top - 2] = end;
            return;
          }
        }
      }
      if (!isReduce || this.pos == end) {
        // Simple case, just append
        this.buffer.push(term, start, end, size);
      } else {
        // There may be skipped nodes that have to be moved forward
        var index = this.buffer.length;
        if (index > 0 && this.buffer[index - 4] != 0 /* Term.Err */) while (index > 0 && this.buffer[index - 2] > end) {
          // Move this record forward
          this.buffer[index] = this.buffer[index - 4];
          this.buffer[index + 1] = this.buffer[index - 3];
          this.buffer[index + 2] = this.buffer[index - 2];
          this.buffer[index + 3] = this.buffer[index - 1];
          index -= 4;
          if (size > 4) size -= 4;
        }
        this.buffer[index] = term;
        this.buffer[index + 1] = start;
        this.buffer[index + 2] = end;
        this.buffer[index + 3] = size;
      }
    }
    // Apply a shift action
    /// @internal
  }, {
    key: "shift",
    value: function shift(action, next, nextEnd) {
      var start = this.pos;
      if (action & 131072 /* Action.GotoFlag */) {
        this.pushState(action & 65535 /* Action.ValueMask */, this.pos);
      } else if ((action & 262144 /* Action.StayFlag */) == 0) {
        // Regular shift
        var nextState = action,
          parser = this.p.parser;
        if (nextEnd > this.pos || next <= parser.maxNode) {
          this.pos = nextEnd;
          if (!parser.stateFlag(nextState, 1 /* StateFlag.Skipped */)) this.reducePos = nextEnd;
        }
        this.pushState(nextState, start);
        this.shiftContext(next, start);
        if (next <= parser.maxNode) this.buffer.push(next, start, nextEnd, 4);
      } else {
        // Shift-and-stay, which means this is a skipped token
        this.pos = nextEnd;
        this.shiftContext(next, start);
        if (next <= this.p.parser.maxNode) this.buffer.push(next, start, nextEnd, 4);
      }
    }
    // Apply an action
    /// @internal
  }, {
    key: "apply",
    value: function apply(action, next, nextEnd) {
      if (action & 65536 /* Action.ReduceFlag */) this.reduce(action);else this.shift(action, next, nextEnd);
    }
    // Add a prebuilt (reused) node into the buffer.
    /// @internal
  }, {
    key: "useNode",
    value: function useNode(value, next) {
      var index = this.p.reused.length - 1;
      if (index < 0 || this.p.reused[index] != value) {
        this.p.reused.push(value);
        index++;
      }
      var start = this.pos;
      this.reducePos = this.pos = start + value.length;
      this.pushState(next, start);
      this.buffer.push(index, start, this.reducePos, -1 /* size == -1 means this is a reused value */);
      if (this.curContext) this.updateContext(this.curContext.tracker.reuse(this.curContext.context, value, this, this.p.stream.reset(this.pos - value.length)));
    }
    // Split the stack. Due to the buffer sharing and the fact
    // that `this.stack` tends to stay quite shallow, this isn't very
    // expensive.
    /// @internal
  }, {
    key: "split",
    value: function split() {
      var parent = this;
      var off = parent.buffer.length;
      // Because the top of the buffer (after this.pos) may be mutated
      // to reorder reductions and skipped tokens, and shared buffers
      // should be immutable, this copies any outstanding skipped tokens
      // to the new buffer, and puts the base pointer before them.
      while (off > 0 && parent.buffer[off - 2] > parent.reducePos) off -= 4;
      var buffer = parent.buffer.slice(off),
        base = parent.bufferBase + off;
      // Make sure parent points to an actual parent with content, if there is such a parent.
      while (parent && base == parent.bufferBase) parent = parent.parent;
      return new Stack(this.p, this.stack.slice(), this.state, this.reducePos, this.pos, this.score, buffer, base, this.curContext, this.lookAhead, parent);
    }
    // Try to recover from an error by 'deleting' (ignoring) one token.
    /// @internal
  }, {
    key: "recoverByDelete",
    value: function recoverByDelete(next, nextEnd) {
      var isNode = next <= this.p.parser.maxNode;
      if (isNode) this.storeNode(next, this.pos, nextEnd, 4);
      this.storeNode(0 /* Term.Err */, this.pos, nextEnd, isNode ? 8 : 4);
      this.pos = this.reducePos = nextEnd;
      this.score -= 190 /* Recover.Delete */;
    }
    /// Check if the given term would be able to be shifted (optionally
    /// after some reductions) on this stack. This can be useful for
    /// external tokenizers that want to make sure they only provide a
    /// given token when it applies.
  }, {
    key: "canShift",
    value: function canShift(term) {
      for (var sim = new SimulatedStack(this);;) {
        var action = this.p.parser.stateSlot(sim.state, 4 /* ParseState.DefaultReduce */) || this.p.parser.hasAction(sim.state, term);
        if (action == 0) return false;
        if ((action & 65536 /* Action.ReduceFlag */) == 0) return true;
        sim.reduce(action);
      }
    }
    // Apply up to Recover.MaxNext recovery actions that conceptually
    // inserts some missing token or rule.
    /// @internal
  }, {
    key: "recoverByInsert",
    value: function recoverByInsert(next) {
      if (this.stack.length >= 300 /* Recover.MaxInsertStackDepth */) return [];
      var nextStates = this.p.parser.nextStates(this.state);
      if (nextStates.length > 4 /* Recover.MaxNext */ << 1 || this.stack.length >= 120 /* Recover.DampenInsertStackDepth */) {
        var best = [];
        for (var i = 0, s; i < nextStates.length; i += 2) {
          if ((s = nextStates[i + 1]) != this.state && this.p.parser.hasAction(s, next)) best.push(nextStates[i], s);
        }
        if (this.stack.length < 120 /* Recover.DampenInsertStackDepth */) {
          var _loop = function _loop() {
            var s = nextStates[_i + 1];
            if (!best.some(function (v, i) {
              return i & 1 && v == s;
            })) best.push(nextStates[_i], s);
          };
          for (var _i = 0; best.length < 4 /* Recover.MaxNext */ << 1 && _i < nextStates.length; _i += 2) {
            _loop();
          }
        }
        nextStates = best;
      }
      var result = [];
      for (var _i2 = 0; _i2 < nextStates.length && result.length < 4 /* Recover.MaxNext */; _i2 += 2) {
        var _s = nextStates[_i2 + 1];
        if (_s == this.state) continue;
        var stack = this.split();
        stack.pushState(_s, this.pos);
        stack.storeNode(0 /* Term.Err */, stack.pos, stack.pos, 4, true);
        stack.shiftContext(nextStates[_i2], this.pos);
        stack.score -= 200 /* Recover.Insert */;
        result.push(stack);
      }
      return result;
    }
    // Force a reduce, if possible. Return false if that can't
    // be done.
    /// @internal
  }, {
    key: "forceReduce",
    value: function forceReduce() {
      var parser = this.p.parser;
      var reduce = parser.stateSlot(this.state, 5 /* ParseState.ForcedReduce */);
      if ((reduce & 65536 /* Action.ReduceFlag */) == 0) return false;
      if (!parser.validAction(this.state, reduce)) {
        var depth = reduce >> 19 /* Action.ReduceDepthShift */,
          term = reduce & 65535 /* Action.ValueMask */;
        var target = this.stack.length - depth * 3;
        if (target < 0 || parser.getGoto(this.stack[target], term, false) < 0) {
          var backup = this.findForcedReduction();
          if (backup == null) return false;
          reduce = backup;
        }
        this.storeNode(0 /* Term.Err */, this.reducePos, this.reducePos, 4, true);
        this.score -= 100 /* Recover.Reduce */;
      }

      this.reducePos = this.pos;
      this.reduce(reduce);
      return true;
    }
    /// Try to scan through the automaton to find some kind of reduction
    /// that can be applied. Used when the regular ForcedReduce field
    /// isn't a valid action. @internal
  }, {
    key: "findForcedReduction",
    value: function findForcedReduction() {
      var _this = this;
      var parser = this.p.parser,
        seen = [];
      var explore = function explore(state, depth) {
        if (seen.includes(state)) return;
        seen.push(state);
        return parser.allActions(state, function (action) {
          if (action & (262144 /* Action.StayFlag */ | 131072 /* Action.GotoFlag */)) ;else if (action & 65536 /* Action.ReduceFlag */) {
            var rDepth = (action >> 19 /* Action.ReduceDepthShift */) - depth;
            if (rDepth > 1) {
              var term = action & 65535 /* Action.ValueMask */,
                target = _this.stack.length - rDepth * 3;
              if (target >= 0 && parser.getGoto(_this.stack[target], term, false) >= 0) return rDepth << 19 /* Action.ReduceDepthShift */ | 65536 /* Action.ReduceFlag */ | term;
            }
          } else {
            var found = explore(action, depth + 1);
            if (found != null) return found;
          }
        });
      };
      return explore(this.state, 0);
    }
    /// @internal
  }, {
    key: "forceAll",
    value: function forceAll() {
      while (!this.p.parser.stateFlag(this.state, 2 /* StateFlag.Accepting */)) {
        if (!this.forceReduce()) {
          this.storeNode(0 /* Term.Err */, this.pos, this.pos, 4, true);
          break;
        }
      }
      return this;
    }
    /// Check whether this state has no further actions (assumed to be a direct descendant of the
    /// top state, since any other states must be able to continue
    /// somehow). @internal
  }, {
    key: "deadEnd",
    get: function get() {
      if (this.stack.length != 3) return false;
      var parser = this.p.parser;
      return parser.data[parser.stateSlot(this.state, 1 /* ParseState.Actions */)] == 65535 /* Seq.End */ && !parser.stateSlot(this.state, 4 /* ParseState.DefaultReduce */);
    }
    /// Restart the stack (put it back in its start state). Only safe
    /// when this.stack.length == 3 (state is directly below the top
    /// state). @internal
  }, {
    key: "restart",
    value: function restart() {
      this.state = this.stack[0];
      this.stack.length = 0;
    }
    /// @internal
  }, {
    key: "sameState",
    value: function sameState(other) {
      if (this.state != other.state || this.stack.length != other.stack.length) return false;
      for (var i = 0; i < this.stack.length; i += 3) if (this.stack[i] != other.stack[i]) return false;
      return true;
    }
    /// Get the parser used by this stack.
  }, {
    key: "parser",
    get: function get() {
      return this.p.parser;
    }
    /// Test whether a given dialect (by numeric ID, as exported from
    /// the terms file) is enabled.
  }, {
    key: "dialectEnabled",
    value: function dialectEnabled(dialectID) {
      return this.p.parser.dialect.flags[dialectID];
    }
  }, {
    key: "shiftContext",
    value: function shiftContext(term, start) {
      if (this.curContext) this.updateContext(this.curContext.tracker.shift(this.curContext.context, term, this, this.p.stream.reset(start)));
    }
  }, {
    key: "reduceContext",
    value: function reduceContext(term, start) {
      if (this.curContext) this.updateContext(this.curContext.tracker.reduce(this.curContext.context, term, this, this.p.stream.reset(start)));
    }
    /// @internal
  }, {
    key: "emitContext",
    value: function emitContext() {
      var last = this.buffer.length - 1;
      if (last < 0 || this.buffer[last] != -3) this.buffer.push(this.curContext.hash, this.pos, this.pos, -3);
    }
    /// @internal
  }, {
    key: "emitLookAhead",
    value: function emitLookAhead() {
      var last = this.buffer.length - 1;
      if (last < 0 || this.buffer[last] != -4) this.buffer.push(this.lookAhead, this.pos, this.pos, -4);
    }
  }, {
    key: "updateContext",
    value: function updateContext(context) {
      if (context != this.curContext.context) {
        var newCx = new StackContext(this.curContext.tracker, context);
        if (newCx.hash != this.curContext.hash) this.emitContext();
        this.curContext = newCx;
      }
    }
    /// @internal
  }, {
    key: "setLookAhead",
    value: function setLookAhead(lookAhead) {
      if (lookAhead > this.lookAhead) {
        this.emitLookAhead();
        this.lookAhead = lookAhead;
      }
    }
    /// @internal
  }, {
    key: "close",
    value: function close() {
      if (this.curContext && this.curContext.tracker.strict) this.emitContext();
      if (this.lookAhead > 0) this.emitLookAhead();
    }
  }], [{
    key: "start",
    value: function start(p, state) {
      var pos = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var cx = p.parser.context;
      return new Stack(p, [], state, pos, pos, 0, [], 0, cx ? new StackContext(cx, cx.start) : null, 0, null);
    }
  }]);
  return Stack;
}();
var StackContext = /*#__PURE__*/_createClass(function StackContext(tracker, context) {
  _classCallCheck(this, StackContext);
  this.tracker = tracker;
  this.context = context;
  this.hash = tracker.strict ? tracker.hash(context) : 0;
});
var Recover;
(function (Recover) {
  Recover[Recover["Insert"] = 200] = "Insert";
  Recover[Recover["Delete"] = 190] = "Delete";
  Recover[Recover["Reduce"] = 100] = "Reduce";
  Recover[Recover["MaxNext"] = 4] = "MaxNext";
  Recover[Recover["MaxInsertStackDepth"] = 300] = "MaxInsertStackDepth";
  Recover[Recover["DampenInsertStackDepth"] = 120] = "DampenInsertStackDepth";
  Recover[Recover["MinBigReduction"] = 2000] = "MinBigReduction";
})(Recover || (Recover = {}));
// Used to cheaply run some reductions to scan ahead without mutating
// an entire stack
var SimulatedStack = /*#__PURE__*/function () {
  function SimulatedStack(start) {
    _classCallCheck(this, SimulatedStack);
    this.start = start;
    this.state = start.state;
    this.stack = start.stack;
    this.base = this.stack.length;
  }
  _createClass(SimulatedStack, [{
    key: "reduce",
    value: function reduce(action) {
      var term = action & 65535 /* Action.ValueMask */,
        depth = action >> 19 /* Action.ReduceDepthShift */;
      if (depth == 0) {
        if (this.stack == this.start.stack) this.stack = this.stack.slice();
        this.stack.push(this.state, 0, 0);
        this.base += 3;
      } else {
        this.base -= (depth - 1) * 3;
      }
      var _goto = this.start.p.parser.getGoto(this.stack[this.base - 3], term, true);
      this.state = _goto;
    }
  }]);
  return SimulatedStack;
}(); // This is given to `Tree.build` to build a buffer, and encapsulates
// the parent-stack-walking necessary to read the nodes.
var StackBufferCursor = /*#__PURE__*/function () {
  function StackBufferCursor(stack, pos, index) {
    _classCallCheck(this, StackBufferCursor);
    this.stack = stack;
    this.pos = pos;
    this.index = index;
    this.buffer = stack.buffer;
    if (this.index == 0) this.maybeNext();
  }
  _createClass(StackBufferCursor, [{
    key: "maybeNext",
    value: function maybeNext() {
      var next = this.stack.parent;
      if (next != null) {
        this.index = this.stack.bufferBase - next.bufferBase;
        this.stack = next;
        this.buffer = next.buffer;
      }
    }
  }, {
    key: "id",
    get: function get() {
      return this.buffer[this.index - 4];
    }
  }, {
    key: "start",
    get: function get() {
      return this.buffer[this.index - 3];
    }
  }, {
    key: "end",
    get: function get() {
      return this.buffer[this.index - 2];
    }
  }, {
    key: "size",
    get: function get() {
      return this.buffer[this.index - 1];
    }
  }, {
    key: "next",
    value: function next() {
      this.index -= 4;
      this.pos -= 4;
      if (this.index == 0) this.maybeNext();
    }
  }, {
    key: "fork",
    value: function fork() {
      return new StackBufferCursor(this.stack, this.pos, this.index);
    }
  }], [{
    key: "create",
    value: function create(stack) {
      var pos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : stack.bufferBase + stack.buffer.length;
      return new StackBufferCursor(stack, pos, pos - stack.bufferBase);
    }
  }]);
  return StackBufferCursor;
}(); // See lezer-generator/src/encode.ts for comments about the encoding
// used here
function decodeArray(input) {
  var Type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Uint16Array;
  if (typeof input != "string") return input;
  var array = null;
  for (var pos = 0, out = 0; pos < input.length;) {
    var value = 0;
    for (;;) {
      var next = input.charCodeAt(pos++),
        stop = false;
      if (next == 126 /* Encode.BigValCode */) {
        value = 65535 /* Encode.BigVal */;
        break;
      }
      if (next >= 92 /* Encode.Gap2 */) next--;
      if (next >= 34 /* Encode.Gap1 */) next--;
      var digit = next - 32 /* Encode.Start */;
      if (digit >= 46 /* Encode.Base */) {
        digit -= 46 /* Encode.Base */;
        stop = true;
      }
      value += digit;
      if (stop) break;
      value *= 46 /* Encode.Base */;
    }

    if (array) array[out++] = value;else array = new Type(value);
  }
  return array;
}
var CachedToken = /*#__PURE__*/_createClass(function CachedToken() {
  _classCallCheck(this, CachedToken);
  this.start = -1;
  this.value = -1;
  this.end = -1;
  this.extended = -1;
  this.lookAhead = 0;
  this.mask = 0;
  this.context = 0;
});
var nullToken = new CachedToken();
/// [Tokenizers](#lr.ExternalTokenizer) interact with the input
/// through this interface. It presents the input as a stream of
/// characters, tracking lookahead and hiding the complexity of
/// [ranges](#common.Parser.parse^ranges) from tokenizer code.
var InputStream = /*#__PURE__*/function () {
  /// @internal
  function InputStream(
  /// @internal
  input,
  /// @internal
  ranges) {
    _classCallCheck(this, InputStream);
    this.input = input;
    this.ranges = ranges;
    /// @internal
    this.chunk = "";
    /// @internal
    this.chunkOff = 0;
    /// Backup chunk
    this.chunk2 = "";
    this.chunk2Pos = 0;
    /// The character code of the next code unit in the input, or -1
    /// when the stream is at the end of the input.
    this.next = -1;
    /// @internal
    this.token = nullToken;
    this.rangeIndex = 0;
    this.pos = this.chunkPos = ranges[0].from;
    this.range = ranges[0];
    this.end = ranges[ranges.length - 1].to;
    this.readNext();
  }
  /// @internal
  _createClass(InputStream, [{
    key: "resolveOffset",
    value: function resolveOffset(offset, assoc) {
      var range = this.range,
        index = this.rangeIndex;
      var pos = this.pos + offset;
      while (pos < range.from) {
        if (!index) return null;
        var next = this.ranges[--index];
        pos -= range.from - next.to;
        range = next;
      }
      while (assoc < 0 ? pos > range.to : pos >= range.to) {
        if (index == this.ranges.length - 1) return null;
        var _next = this.ranges[++index];
        pos += _next.from - range.to;
        range = _next;
      }
      return pos;
    }
    /// @internal
  }, {
    key: "clipPos",
    value: function clipPos(pos) {
      if (pos >= this.range.from && pos < this.range.to) return pos;
      var _iterator = _createForOfIteratorHelper(this.ranges),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var range = _step.value;
          if (range.to > pos) return Math.max(pos, range.from);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return this.end;
    }
    /// Look at a code unit near the stream position. `.peek(0)` equals
    /// `.next`, `.peek(-1)` gives you the previous character, and so
    /// on.
    ///
    /// Note that looking around during tokenizing creates dependencies
    /// on potentially far-away content, which may reduce the
    /// effectiveness incremental parsing—when looking forward—or even
    /// cause invalid reparses when looking backward more than 25 code
    /// units, since the library does not track lookbehind.
  }, {
    key: "peek",
    value: function peek(offset) {
      var idx = this.chunkOff + offset,
        pos,
        result;
      if (idx >= 0 && idx < this.chunk.length) {
        pos = this.pos + offset;
        result = this.chunk.charCodeAt(idx);
      } else {
        var resolved = this.resolveOffset(offset, 1);
        if (resolved == null) return -1;
        pos = resolved;
        if (pos >= this.chunk2Pos && pos < this.chunk2Pos + this.chunk2.length) {
          result = this.chunk2.charCodeAt(pos - this.chunk2Pos);
        } else {
          var i = this.rangeIndex,
            range = this.range;
          while (range.to <= pos) range = this.ranges[++i];
          this.chunk2 = this.input.chunk(this.chunk2Pos = pos);
          if (pos + this.chunk2.length > range.to) this.chunk2 = this.chunk2.slice(0, range.to - pos);
          result = this.chunk2.charCodeAt(0);
        }
      }
      if (pos >= this.token.lookAhead) this.token.lookAhead = pos + 1;
      return result;
    }
    /// Accept a token. By default, the end of the token is set to the
    /// current stream position, but you can pass an offset (relative to
    /// the stream position) to change that.
  }, {
    key: "acceptToken",
    value: function acceptToken(token) {
      var endOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var end = endOffset ? this.resolveOffset(endOffset, -1) : this.pos;
      if (end == null || end < this.token.start) throw new RangeError("Token end out of bounds");
      this.token.value = token;
      this.token.end = end;
    }
  }, {
    key: "getChunk",
    value: function getChunk() {
      if (this.pos >= this.chunk2Pos && this.pos < this.chunk2Pos + this.chunk2.length) {
        var chunk = this.chunk,
          chunkPos = this.chunkPos;
        this.chunk = this.chunk2;
        this.chunkPos = this.chunk2Pos;
        this.chunk2 = chunk;
        this.chunk2Pos = chunkPos;
        this.chunkOff = this.pos - this.chunkPos;
      } else {
        this.chunk2 = this.chunk;
        this.chunk2Pos = this.chunkPos;
        var nextChunk = this.input.chunk(this.pos);
        var end = this.pos + nextChunk.length;
        this.chunk = end > this.range.to ? nextChunk.slice(0, this.range.to - this.pos) : nextChunk;
        this.chunkPos = this.pos;
        this.chunkOff = 0;
      }
    }
  }, {
    key: "readNext",
    value: function readNext() {
      if (this.chunkOff >= this.chunk.length) {
        this.getChunk();
        if (this.chunkOff == this.chunk.length) return this.next = -1;
      }
      return this.next = this.chunk.charCodeAt(this.chunkOff);
    }
    /// Move the stream forward N (defaults to 1) code units. Returns
    /// the new value of [`next`](#lr.InputStream.next).
  }, {
    key: "advance",
    value: function advance() {
      var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      this.chunkOff += n;
      while (this.pos + n >= this.range.to) {
        if (this.rangeIndex == this.ranges.length - 1) return this.setDone();
        n -= this.range.to - this.pos;
        this.range = this.ranges[++this.rangeIndex];
        this.pos = this.range.from;
      }
      this.pos += n;
      if (this.pos >= this.token.lookAhead) this.token.lookAhead = this.pos + 1;
      return this.readNext();
    }
  }, {
    key: "setDone",
    value: function setDone() {
      this.pos = this.chunkPos = this.end;
      this.range = this.ranges[this.rangeIndex = this.ranges.length - 1];
      this.chunk = "";
      return this.next = -1;
    }
    /// @internal
  }, {
    key: "reset",
    value: function reset(pos, token) {
      if (token) {
        this.token = token;
        token.start = pos;
        token.lookAhead = pos + 1;
        token.value = token.extended = -1;
      } else {
        this.token = nullToken;
      }
      if (this.pos != pos) {
        this.pos = pos;
        if (pos == this.end) {
          this.setDone();
          return this;
        }
        while (pos < this.range.from) this.range = this.ranges[--this.rangeIndex];
        while (pos >= this.range.to) this.range = this.ranges[++this.rangeIndex];
        if (pos >= this.chunkPos && pos < this.chunkPos + this.chunk.length) {
          this.chunkOff = pos - this.chunkPos;
        } else {
          this.chunk = "";
          this.chunkOff = 0;
        }
        this.readNext();
      }
      return this;
    }
    /// @internal
  }, {
    key: "read",
    value: function read(from, to) {
      if (from >= this.chunkPos && to <= this.chunkPos + this.chunk.length) return this.chunk.slice(from - this.chunkPos, to - this.chunkPos);
      if (from >= this.chunk2Pos && to <= this.chunk2Pos + this.chunk2.length) return this.chunk2.slice(from - this.chunk2Pos, to - this.chunk2Pos);
      if (from >= this.range.from && to <= this.range.to) return this.input.read(from, to);
      var result = "";
      var _iterator2 = _createForOfIteratorHelper(this.ranges),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var r = _step2.value;
          if (r.from >= to) break;
          if (r.to > from) result += this.input.read(Math.max(r.from, from), Math.min(r.to, to));
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      return result;
    }
  }]);
  return InputStream;
}(); /// @internal
var TokenGroup = /*#__PURE__*/function () {
  function TokenGroup(data, id) {
    _classCallCheck(this, TokenGroup);
    this.data = data;
    this.id = id;
  }
  _createClass(TokenGroup, [{
    key: "token",
    value: function token(input, stack) {
      var parser = stack.p.parser;
      readToken(this.data, input, stack, this.id, parser.data, parser.tokenPrecTable);
    }
  }]);
  return TokenGroup;
}();
TokenGroup.prototype.contextual = TokenGroup.prototype.fallback = TokenGroup.prototype.extend = false;
/// @hide
var LocalTokenGroup = /*#__PURE__*/function () {
  function LocalTokenGroup(data, precTable, elseToken) {
    _classCallCheck(this, LocalTokenGroup);
    this.precTable = precTable;
    this.elseToken = elseToken;
    this.data = typeof data == "string" ? decodeArray(data) : data;
  }
  _createClass(LocalTokenGroup, [{
    key: "token",
    value: function token(input, stack) {
      var start = input.pos,
        skipped = 0;
      for (;;) {
        readToken(this.data, input, stack, 0, this.data, this.precTable);
        if (input.token.value > -1) break;
        if (this.elseToken == null) return;
        if (input.next < 0) break;
        input.advance();
        input.reset(input.pos, input.token);
        skipped++;
      }
      if (skipped) {
        input.reset(start, input.token);
        input.acceptToken(this.elseToken, skipped);
      }
    }
  }]);
  return LocalTokenGroup;
}();
LocalTokenGroup.prototype.contextual = TokenGroup.prototype.fallback = TokenGroup.prototype.extend = false;
/// `@external tokens` declarations in the grammar should resolve to
/// an instance of this class.
var ExternalTokenizer = /*#__PURE__*/_createClass(
/// Create a tokenizer. The first argument is the function that,
/// given an input stream, scans for the types of tokens it
/// recognizes at the stream's position, and calls
/// [`acceptToken`](#lr.InputStream.acceptToken) when it finds
/// one.
function ExternalTokenizer(
/// @internal
token) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  _classCallCheck(this, ExternalTokenizer);
  this.token = token;
  this.contextual = !!options.contextual;
  this.fallback = !!options.fallback;
  this.extend = !!options.extend;
}); // Tokenizer data is stored a big uint16 array containing, for each
// state:
//
//  - A group bitmask, indicating what token groups are reachable from
//    this state, so that paths that can only lead to tokens not in
//    any of the current groups can be cut off early.
//
//  - The position of the end of the state's sequence of accepting
//    tokens
//
//  - The number of outgoing edges for the state
//
//  - The accepting tokens, as (token id, group mask) pairs
//
//  - The outgoing edges, as (start character, end character, state
//    index) triples, with end character being exclusive
//
// This function interprets that data, running through a stream as
// long as new states with the a matching group mask can be reached,
// and updating `input.token` when it matches a token.
function readToken(data, input, stack, group, precTable, precOffset) {
  var state = 0,
    groupMask = 1 << group,
    dialect = stack.p.parser.dialect;
  scan: for (;;) {
    if ((groupMask & data[state]) == 0) break;
    var accEnd = data[state + 1];
    // Check whether this state can lead to a token in the current group
    // Accept tokens in this state, possibly overwriting
    // lower-precedence / shorter tokens
    for (var i = state + 3; i < accEnd; i += 2) if ((data[i + 1] & groupMask) > 0) {
      var term = data[i];
      if (dialect.allows(term) && (input.token.value == -1 || input.token.value == term || overrides(term, input.token.value, precTable, precOffset))) {
        input.acceptToken(term);
        break;
      }
    }
    var next = input.next,
      low = 0,
      high = data[state + 2];
    // Special case for EOF
    if (input.next < 0 && high > low && data[accEnd + high * 3 - 3] == 65535 /* Seq.End */ && data[accEnd + high * 3 - 3] == 65535 /* Seq.End */) {
      state = data[accEnd + high * 3 - 1];
      continue scan;
    }
    // Do a binary search on the state's edges
    for (; low < high;) {
      var mid = low + high >> 1;
      var index = accEnd + mid + (mid << 1);
      var from = data[index],
        to = data[index + 1] || 0x10000;
      if (next < from) high = mid;else if (next >= to) low = mid + 1;else {
        state = data[index + 2];
        input.advance();
        continue scan;
      }
    }
    break;
  }
}
function findOffset(data, start, term) {
  for (var i = start, next; (next = data[i]) != 65535 /* Seq.End */; i++) if (next == term) return i - start;
  return -1;
}
function overrides(token, prev, tableData, tableOffset) {
  var iPrev = findOffset(tableData, tableOffset, prev);
  return iPrev < 0 || findOffset(tableData, tableOffset, token) < iPrev;
}

// Environment variable used to control console output
var verbose = typeof process != "undefined" && process.env && /\bparse\b/.test(process.env.LOG);
var stackIDs = null;
var Safety;
(function (Safety) {
  Safety[Safety["Margin"] = 25] = "Margin";
})(Safety || (Safety = {}));
function cutAt(tree, pos, side) {
  var cursor = tree.cursor(IterMode.IncludeAnonymous);
  cursor.moveTo(pos);
  for (;;) {
    if (!(side < 0 ? cursor.childBefore(pos) : cursor.childAfter(pos))) for (;;) {
      if ((side < 0 ? cursor.to < pos : cursor.from > pos) && !cursor.type.isError) return side < 0 ? Math.max(0, Math.min(cursor.to - 1, pos - 25 /* Safety.Margin */)) : Math.min(tree.length, Math.max(cursor.from + 1, pos + 25 /* Safety.Margin */));
      if (side < 0 ? cursor.prevSibling() : cursor.nextSibling()) break;
      if (!cursor.parent()) return side < 0 ? 0 : tree.length;
    }
  }
}
var FragmentCursor = /*#__PURE__*/function () {
  function FragmentCursor(fragments, nodeSet) {
    _classCallCheck(this, FragmentCursor);
    this.fragments = fragments;
    this.nodeSet = nodeSet;
    this.i = 0;
    this.fragment = null;
    this.safeFrom = -1;
    this.safeTo = -1;
    this.trees = [];
    this.start = [];
    this.index = [];
    this.nextFragment();
  }
  _createClass(FragmentCursor, [{
    key: "nextFragment",
    value: function nextFragment() {
      var fr = this.fragment = this.i == this.fragments.length ? null : this.fragments[this.i++];
      if (fr) {
        this.safeFrom = fr.openStart ? cutAt(fr.tree, fr.from + fr.offset, 1) - fr.offset : fr.from;
        this.safeTo = fr.openEnd ? cutAt(fr.tree, fr.to + fr.offset, -1) - fr.offset : fr.to;
        while (this.trees.length) {
          this.trees.pop();
          this.start.pop();
          this.index.pop();
        }
        this.trees.push(fr.tree);
        this.start.push(-fr.offset);
        this.index.push(0);
        this.nextStart = this.safeFrom;
      } else {
        this.nextStart = 1e9;
      }
    }
    // `pos` must be >= any previously given `pos` for this cursor
  }, {
    key: "nodeAt",
    value: function nodeAt(pos) {
      if (pos < this.nextStart) return null;
      while (this.fragment && this.safeTo <= pos) this.nextFragment();
      if (!this.fragment) return null;
      for (;;) {
        var last = this.trees.length - 1;
        if (last < 0) {
          // End of tree
          this.nextFragment();
          return null;
        }
        var top = this.trees[last],
          index = this.index[last];
        if (index == top.children.length) {
          this.trees.pop();
          this.start.pop();
          this.index.pop();
          continue;
        }
        var next = top.children[index];
        var start = this.start[last] + top.positions[index];
        if (start > pos) {
          this.nextStart = start;
          return null;
        }
        if (next instanceof Tree) {
          if (start == pos) {
            if (start < this.safeFrom) return null;
            var end = start + next.length;
            if (end <= this.safeTo) {
              var lookAhead = next.prop(NodeProp.lookAhead);
              if (!lookAhead || end + lookAhead < this.fragment.to) return next;
            }
          }
          this.index[last]++;
          if (start + next.length >= Math.max(this.safeFrom, pos)) {
            // Enter this node
            this.trees.push(next);
            this.start.push(start);
            this.index.push(0);
          }
        } else {
          this.index[last]++;
          this.nextStart = start + next.length;
        }
      }
    }
  }]);
  return FragmentCursor;
}();
var TokenCache = /*#__PURE__*/function () {
  function TokenCache(parser, stream) {
    _classCallCheck(this, TokenCache);
    this.stream = stream;
    this.tokens = [];
    this.mainToken = null;
    this.actions = [];
    this.tokens = parser.tokenizers.map(function (_) {
      return new CachedToken();
    });
  }
  _createClass(TokenCache, [{
    key: "getActions",
    value: function getActions(stack) {
      var actionIndex = 0;
      var main = null;
      var parser = stack.p.parser,
        tokenizers = parser.tokenizers;
      var mask = parser.stateSlot(stack.state, 3 /* ParseState.TokenizerMask */);
      var context = stack.curContext ? stack.curContext.hash : 0;
      var lookAhead = 0;
      for (var i = 0; i < tokenizers.length; i++) {
        if ((1 << i & mask) == 0) continue;
        var tokenizer = tokenizers[i],
          token = this.tokens[i];
        if (main && !tokenizer.fallback) continue;
        if (tokenizer.contextual || token.start != stack.pos || token.mask != mask || token.context != context) {
          this.updateCachedToken(token, tokenizer, stack);
          token.mask = mask;
          token.context = context;
        }
        if (token.lookAhead > token.end + 25 /* Safety.Margin */) lookAhead = Math.max(token.lookAhead, lookAhead);
        if (token.value != 0 /* Term.Err */) {
          var startIndex = actionIndex;
          if (token.extended > -1) actionIndex = this.addActions(stack, token.extended, token.end, actionIndex);
          actionIndex = this.addActions(stack, token.value, token.end, actionIndex);
          if (!tokenizer.extend) {
            main = token;
            if (actionIndex > startIndex) break;
          }
        }
      }
      while (this.actions.length > actionIndex) this.actions.pop();
      if (lookAhead) stack.setLookAhead(lookAhead);
      if (!main && stack.pos == this.stream.end) {
        main = new CachedToken();
        main.value = stack.p.parser.eofTerm;
        main.start = main.end = stack.pos;
        actionIndex = this.addActions(stack, main.value, main.end, actionIndex);
      }
      this.mainToken = main;
      return this.actions;
    }
  }, {
    key: "getMainToken",
    value: function getMainToken(stack) {
      if (this.mainToken) return this.mainToken;
      var main = new CachedToken(),
        pos = stack.pos,
        p = stack.p;
      main.start = pos;
      main.end = Math.min(pos + 1, p.stream.end);
      main.value = pos == p.stream.end ? p.parser.eofTerm : 0 /* Term.Err */;
      return main;
    }
  }, {
    key: "updateCachedToken",
    value: function updateCachedToken(token, tokenizer, stack) {
      var start = this.stream.clipPos(stack.pos);
      tokenizer.token(this.stream.reset(start, token), stack);
      if (token.value > -1) {
        var parser = stack.p.parser;
        for (var i = 0; i < parser.specialized.length; i++) if (parser.specialized[i] == token.value) {
          var result = parser.specializers[i](this.stream.read(token.start, token.end), stack);
          if (result >= 0 && stack.p.parser.dialect.allows(result >> 1)) {
            if ((result & 1) == 0 /* Specialize.Specialize */) token.value = result >> 1;else token.extended = result >> 1;
            break;
          }
        }
      } else {
        token.value = 0 /* Term.Err */;
        token.end = this.stream.clipPos(start + 1);
      }
    }
  }, {
    key: "putAction",
    value: function putAction(action, token, end, index) {
      // Don't add duplicate actions
      for (var i = 0; i < index; i += 3) if (this.actions[i] == action) return index;
      this.actions[index++] = action;
      this.actions[index++] = token;
      this.actions[index++] = end;
      return index;
    }
  }, {
    key: "addActions",
    value: function addActions(stack, token, end, index) {
      var state = stack.state,
        parser = stack.p.parser,
        data = parser.data;
      for (var set = 0; set < 2; set++) {
        for (var i = parser.stateSlot(state, set ? 2 /* ParseState.Skip */ : 1 /* ParseState.Actions */);; i += 3) {
          if (data[i] == 65535 /* Seq.End */) {
            if (data[i + 1] == 1 /* Seq.Next */) {
              i = pair(data, i + 2);
            } else {
              if (index == 0 && data[i + 1] == 2 /* Seq.Other */) index = this.putAction(pair(data, i + 2), token, end, index);
              break;
            }
          }
          if (data[i] == token) index = this.putAction(pair(data, i + 1), token, end, index);
        }
      }
      return index;
    }
  }]);
  return TokenCache;
}();
var Rec;
(function (Rec) {
  Rec[Rec["Distance"] = 5] = "Distance";
  Rec[Rec["MaxRemainingPerStep"] = 3] = "MaxRemainingPerStep";
  // When two stacks have been running independently long enough to
  // add this many elements to their buffers, prune one.
  Rec[Rec["MinBufferLengthPrune"] = 500] = "MinBufferLengthPrune";
  Rec[Rec["ForceReduceLimit"] = 10] = "ForceReduceLimit";
  // Once a stack reaches this depth (in .stack.length) force-reduce
  // it back to CutTo to avoid creating trees that overflow the stack
  // on recursive traversal.
  Rec[Rec["CutDepth"] = 15000] = "CutDepth";
  Rec[Rec["CutTo"] = 9000] = "CutTo";
  Rec[Rec["MaxLeftAssociativeReductionCount"] = 300] = "MaxLeftAssociativeReductionCount";
  // The maximum number of non-recovering stacks to explore (to avoid
  // getting bogged down with exponentially multiplying stacks in
  // ambiguous content)
  Rec[Rec["MaxStackCount"] = 12] = "MaxStackCount";
})(Rec || (Rec = {}));
var Parse = /*#__PURE__*/function () {
  function Parse(parser, input, fragments, ranges) {
    _classCallCheck(this, Parse);
    this.parser = parser;
    this.input = input;
    this.ranges = ranges;
    this.recovering = 0;
    this.nextStackID = 0x2654; // ♔, ♕, ♖, ♗, ♘, ♙, ♠, ♡, ♢, ♣, ♤, ♥, ♦, ♧
    this.minStackPos = 0;
    this.reused = [];
    this.stoppedAt = null;
    this.lastBigReductionStart = -1;
    this.lastBigReductionSize = 0;
    this.bigReductionCount = 0;
    this.stream = new InputStream(input, ranges);
    this.tokens = new TokenCache(parser, this.stream);
    this.topTerm = parser.top[1];
    var from = ranges[0].from;
    this.stacks = [Stack.start(this, parser.top[0], from)];
    this.fragments = fragments.length && this.stream.end - from > parser.bufferLength * 4 ? new FragmentCursor(fragments, parser.nodeSet) : null;
  }
  _createClass(Parse, [{
    key: "parsedPos",
    get: function get() {
      return this.minStackPos;
    }
    // Move the parser forward. This will process all parse stacks at
    // `this.pos` and try to advance them to a further position. If no
    // stack for such a position is found, it'll start error-recovery.
    //
    // When the parse is finished, this will return a syntax tree. When
    // not, it returns `null`.
  }, {
    key: "advance",
    value: function advance() {
      var stacks = this.stacks,
        pos = this.minStackPos;
      // This will hold stacks beyond `pos`.
      var newStacks = this.stacks = [];
      var stopped, stoppedTokens;
      // If a large amount of reductions happened with the same start
      // position, force the stack out of that production in order to
      // avoid creating a tree too deep to recurse through.
      // (This is an ugly kludge, because unfortunately there is no
      // straightforward, cheap way to check for this happening, due to
      // the history of reductions only being available in an
      // expensive-to-access format in the stack buffers.)
      if (this.bigReductionCount > 300 /* Rec.MaxLeftAssociativeReductionCount */ && stacks.length == 1) {
        var _stacks = _slicedToArray(stacks, 1),
          s = _stacks[0];
        while (s.forceReduce() && s.stack.length && s.stack[s.stack.length - 2] >= this.lastBigReductionStart) {}
        this.bigReductionCount = this.lastBigReductionSize = 0;
      }
      // Keep advancing any stacks at `pos` until they either move
      // forward or can't be advanced. Gather stacks that can't be
      // advanced further in `stopped`.
      for (var i = 0; i < stacks.length; i++) {
        var stack = stacks[i];
        for (;;) {
          this.tokens.mainToken = null;
          if (stack.pos > pos) {
            newStacks.push(stack);
          } else if (this.advanceStack(stack, newStacks, stacks)) {
            continue;
          } else {
            if (!stopped) {
              stopped = [];
              stoppedTokens = [];
            }
            stopped.push(stack);
            var tok = this.tokens.getMainToken(stack);
            stoppedTokens.push(tok.value, tok.end);
          }
          break;
        }
      }
      if (!newStacks.length) {
        var finished = stopped && findFinished(stopped);
        if (finished) return this.stackToTree(finished);
        if (this.parser.strict) {
          if (verbose && stopped) console.log("Stuck with token " + (this.tokens.mainToken ? this.parser.getName(this.tokens.mainToken.value) : "none"));
          throw new SyntaxError("No parse at " + pos);
        }
        if (!this.recovering) this.recovering = 5 /* Rec.Distance */;
      }

      if (this.recovering && stopped) {
        var _finished = this.stoppedAt != null && stopped[0].pos > this.stoppedAt ? stopped[0] : this.runRecovery(stopped, stoppedTokens, newStacks);
        if (_finished) return this.stackToTree(_finished.forceAll());
      }
      if (this.recovering) {
        var maxRemaining = this.recovering == 1 ? 1 : this.recovering * 3 /* Rec.MaxRemainingPerStep */;
        if (newStacks.length > maxRemaining) {
          newStacks.sort(function (a, b) {
            return b.score - a.score;
          });
          while (newStacks.length > maxRemaining) newStacks.pop();
        }
        if (newStacks.some(function (s) {
          return s.reducePos > pos;
        })) this.recovering--;
      } else if (newStacks.length > 1) {
        // Prune stacks that are in the same state, or that have been
        // running without splitting for a while, to avoid getting stuck
        // with multiple successful stacks running endlessly on.
        outer: for (var _i3 = 0; _i3 < newStacks.length - 1; _i3++) {
          var _stack = newStacks[_i3];
          for (var j = _i3 + 1; j < newStacks.length; j++) {
            var other = newStacks[j];
            if (_stack.sameState(other) || _stack.buffer.length > 500 /* Rec.MinBufferLengthPrune */ && other.buffer.length > 500 /* Rec.MinBufferLengthPrune */) {
              if ((_stack.score - other.score || _stack.buffer.length - other.buffer.length) > 0) {
                newStacks.splice(j--, 1);
              } else {
                newStacks.splice(_i3--, 1);
                continue outer;
              }
            }
          }
        }
        if (newStacks.length > 12 /* Rec.MaxStackCount */) newStacks.splice(12 /* Rec.MaxStackCount */, newStacks.length - 12 /* Rec.MaxStackCount */);
      }

      this.minStackPos = newStacks[0].pos;
      for (var _i4 = 1; _i4 < newStacks.length; _i4++) if (newStacks[_i4].pos < this.minStackPos) this.minStackPos = newStacks[_i4].pos;
      return null;
    }
  }, {
    key: "stopAt",
    value: function stopAt(pos) {
      if (this.stoppedAt != null && this.stoppedAt < pos) throw new RangeError("Can't move stoppedAt forward");
      this.stoppedAt = pos;
    }
    // Returns an updated version of the given stack, or null if the
    // stack can't advance normally. When `split` and `stacks` are
    // given, stacks split off by ambiguous operations will be pushed to
    // `split`, or added to `stacks` if they move `pos` forward.
  }, {
    key: "advanceStack",
    value: function advanceStack(stack, stacks, split) {
      var start = stack.pos,
        parser = this.parser;
      var base = verbose ? this.stackID(stack) + " -> " : "";
      if (this.stoppedAt != null && start > this.stoppedAt) return stack.forceReduce() ? stack : null;
      if (this.fragments) {
        var strictCx = stack.curContext && stack.curContext.tracker.strict,
          cxHash = strictCx ? stack.curContext.hash : 0;
        for (var cached = this.fragments.nodeAt(start); cached;) {
          var match = this.parser.nodeSet.types[cached.type.id] == cached.type ? parser.getGoto(stack.state, cached.type.id) : -1;
          if (match > -1 && cached.length && (!strictCx || (cached.prop(NodeProp.contextHash) || 0) == cxHash)) {
            stack.useNode(cached, match);
            if (verbose) console.log(base + this.stackID(stack) + " (via reuse of ".concat(parser.getName(cached.type.id), ")"));
            return true;
          }
          if (!(cached instanceof Tree) || cached.children.length == 0 || cached.positions[0] > 0) break;
          var inner = cached.children[0];
          if (inner instanceof Tree && cached.positions[0] == 0) cached = inner;else break;
        }
      }
      var defaultReduce = parser.stateSlot(stack.state, 4 /* ParseState.DefaultReduce */);
      if (defaultReduce > 0) {
        stack.reduce(defaultReduce);
        if (verbose) console.log(base + this.stackID(stack) + " (via always-reduce ".concat(parser.getName(defaultReduce & 65535 /* Action.ValueMask */), ")"));
        return true;
      }
      if (stack.stack.length >= 15000 /* Rec.CutDepth */) {
        while (stack.stack.length > 9000 /* Rec.CutTo */ && stack.forceReduce()) {}
      }
      var actions = this.tokens.getActions(stack);
      for (var i = 0; i < actions.length;) {
        var action = actions[i++],
          term = actions[i++],
          end = actions[i++];
        var last = i == actions.length || !split;
        var localStack = last ? stack : stack.split();
        localStack.apply(action, term, end);
        if (verbose) console.log(base + this.stackID(localStack) + " (via ".concat((action & 65536 /* Action.ReduceFlag */) == 0 ? "shift" : "reduce of ".concat(parser.getName(action & 65535 /* Action.ValueMask */)), " for ").concat(parser.getName(term), " @ ").concat(start).concat(localStack == stack ? "" : ", split", ")"));
        if (last) return true;else if (localStack.pos > start) stacks.push(localStack);else split.push(localStack);
      }
      return false;
    }
    // Advance a given stack forward as far as it will go. Returns the
    // (possibly updated) stack if it got stuck, or null if it moved
    // forward and was given to `pushStackDedup`.
  }, {
    key: "advanceFully",
    value: function advanceFully(stack, newStacks) {
      var pos = stack.pos;
      for (;;) {
        if (!this.advanceStack(stack, null, null)) return false;
        if (stack.pos > pos) {
          pushStackDedup(stack, newStacks);
          return true;
        }
      }
    }
  }, {
    key: "runRecovery",
    value: function runRecovery(stacks, tokens, newStacks) {
      var finished = null,
        restarted = false;
      for (var i = 0; i < stacks.length; i++) {
        var stack = stacks[i],
          token = tokens[i << 1],
          tokenEnd = tokens[(i << 1) + 1];
        var base = verbose ? this.stackID(stack) + " -> " : "";
        if (stack.deadEnd) {
          if (restarted) continue;
          restarted = true;
          stack.restart();
          if (verbose) console.log(base + this.stackID(stack) + " (restarted)");
          var done = this.advanceFully(stack, newStacks);
          if (done) continue;
        }
        var force = stack.split(),
          forceBase = base;
        for (var j = 0; force.forceReduce() && j < 10 /* Rec.ForceReduceLimit */; j++) {
          if (verbose) console.log(forceBase + this.stackID(force) + " (via force-reduce)");
          var _done = this.advanceFully(force, newStacks);
          if (_done) break;
          if (verbose) forceBase = this.stackID(force) + " -> ";
        }
        var _iterator3 = _createForOfIteratorHelper(stack.recoverByInsert(token)),
          _step3;
        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var insert = _step3.value;
            if (verbose) console.log(base + this.stackID(insert) + " (via recover-insert)");
            this.advanceFully(insert, newStacks);
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }
        if (this.stream.end > stack.pos) {
          if (tokenEnd == stack.pos) {
            tokenEnd++;
            token = 0 /* Term.Err */;
          }

          stack.recoverByDelete(token, tokenEnd);
          if (verbose) console.log(base + this.stackID(stack) + " (via recover-delete ".concat(this.parser.getName(token), ")"));
          pushStackDedup(stack, newStacks);
        } else if (!finished || finished.score < stack.score) {
          finished = stack;
        }
      }
      return finished;
    }
    // Convert the stack's buffer to a syntax tree.
  }, {
    key: "stackToTree",
    value: function stackToTree(stack) {
      stack.close();
      return Tree.build({
        buffer: StackBufferCursor.create(stack),
        nodeSet: this.parser.nodeSet,
        topID: this.topTerm,
        maxBufferLength: this.parser.bufferLength,
        reused: this.reused,
        start: this.ranges[0].from,
        length: stack.pos - this.ranges[0].from,
        minRepeatType: this.parser.minRepeatTerm
      });
    }
  }, {
    key: "stackID",
    value: function stackID(stack) {
      var id = (stackIDs || (stackIDs = new WeakMap())).get(stack);
      if (!id) stackIDs.set(stack, id = String.fromCodePoint(this.nextStackID++));
      return id + stack;
    }
  }]);
  return Parse;
}();
function pushStackDedup(stack, newStacks) {
  for (var i = 0; i < newStacks.length; i++) {
    var other = newStacks[i];
    if (other.pos == stack.pos && other.sameState(stack)) {
      if (newStacks[i].score < stack.score) newStacks[i] = stack;
      return;
    }
  }
  newStacks.push(stack);
}
var Dialect = /*#__PURE__*/function () {
  function Dialect(source, flags, disabled) {
    _classCallCheck(this, Dialect);
    this.source = source;
    this.flags = flags;
    this.disabled = disabled;
  }
  _createClass(Dialect, [{
    key: "allows",
    value: function allows(term) {
      return !this.disabled || this.disabled[term] == 0;
    }
  }]);
  return Dialect;
}();
var id = function id(x) {
  return x;
};
/// Context trackers are used to track stateful context (such as
/// indentation in the Python grammar, or parent elements in the XML
/// grammar) needed by external tokenizers. You declare them in a
/// grammar file as `@context exportName from "module"`.
///
/// Context values should be immutable, and can be updated (replaced)
/// on shift or reduce actions.
///
/// The export used in a `@context` declaration should be of this
/// type.
var ContextTracker = /*#__PURE__*/_createClass(
/// Define a context tracker.
function ContextTracker(spec) {
  _classCallCheck(this, ContextTracker);
  this.start = spec.start;
  this.shift = spec.shift || id;
  this.reduce = spec.reduce || id;
  this.reuse = spec.reuse || id;
  this.hash = spec.hash || function () {
    return 0;
  };
  this.strict = spec.strict !== false;
}); /// Holds the parse tables for a given grammar, as generated by
/// `lezer-generator`, and provides [methods](#common.Parser) to parse
/// content with.
var LRParser = /*#__PURE__*/function (_Parser) {
  _inherits(LRParser, _Parser);
  var _super = _createSuper(LRParser);
  /// @internal
  function LRParser(spec) {
    var _this2$nodeSet;
    var _this2;
    _classCallCheck(this, LRParser);
    _this2 = _super.call(this);
    /// @internal
    _this2.wrappers = [];
    if (spec.version != 14 /* File.Version */) throw new RangeError("Parser version (".concat(spec.version, ") doesn't match runtime version (", 14 /* File.Version */, ")"));
    var nodeNames = spec.nodeNames.split(" ");
    _this2.minRepeatTerm = nodeNames.length;
    for (var i = 0; i < spec.repeatNodeCount; i++) nodeNames.push("");
    var topTerms = Object.keys(spec.topRules).map(function (r) {
      return spec.topRules[r][1];
    });
    var nodeProps = [];
    for (var _i5 = 0; _i5 < nodeNames.length; _i5++) nodeProps.push([]);
    function setProp(nodeID, prop, value) {
      nodeProps[nodeID].push([prop, prop.deserialize(String(value))]);
    }
    if (spec.nodeProps) {
      var _iterator4 = _createForOfIteratorHelper(spec.nodeProps),
        _step4;
      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var propSpec = _step4.value;
          var prop = propSpec[0];
          if (typeof prop == "string") prop = NodeProp[prop];
          for (var _i6 = 1; _i6 < propSpec.length;) {
            var next = propSpec[_i6++];
            if (next >= 0) {
              setProp(next, prop, propSpec[_i6++]);
            } else {
              var value = propSpec[_i6 + -next];
              for (var j = -next; j > 0; j--) setProp(propSpec[_i6++], prop, value);
              _i6++;
            }
          }
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
    }
    _this2.nodeSet = new NodeSet(nodeNames.map(function (name, i) {
      return NodeType.define({
        name: i >= _this2.minRepeatTerm ? undefined : name,
        id: i,
        props: nodeProps[i],
        top: topTerms.indexOf(i) > -1,
        error: i == 0,
        skipped: spec.skippedNodes && spec.skippedNodes.indexOf(i) > -1
      });
    }));
    if (spec.propSources) _this2.nodeSet = (_this2$nodeSet = _this2.nodeSet).extend.apply(_this2$nodeSet, _toConsumableArray(spec.propSources));
    _this2.strict = false;
    _this2.bufferLength = DefaultBufferLength;
    var tokenArray = decodeArray(spec.tokenData);
    _this2.context = spec.context;
    _this2.specializerSpecs = spec.specialized || [];
    _this2.specialized = new Uint16Array(_this2.specializerSpecs.length);
    for (var _i7 = 0; _i7 < _this2.specializerSpecs.length; _i7++) _this2.specialized[_i7] = _this2.specializerSpecs[_i7].term;
    _this2.specializers = _this2.specializerSpecs.map(getSpecializer);
    _this2.states = decodeArray(spec.states, Uint32Array);
    _this2.data = decodeArray(spec.stateData);
    _this2["goto"] = decodeArray(spec["goto"]);
    _this2.maxTerm = spec.maxTerm;
    _this2.tokenizers = spec.tokenizers.map(function (value) {
      return typeof value == "number" ? new TokenGroup(tokenArray, value) : value;
    });
    _this2.topRules = spec.topRules;
    _this2.dialects = spec.dialects || {};
    _this2.dynamicPrecedences = spec.dynamicPrecedences || null;
    _this2.tokenPrecTable = spec.tokenPrec;
    _this2.termNames = spec.termNames || null;
    _this2.maxNode = _this2.nodeSet.types.length - 1;
    _this2.dialect = _this2.parseDialect();
    _this2.top = _this2.topRules[Object.keys(_this2.topRules)[0]];
    return _this2;
  }
  _createClass(LRParser, [{
    key: "createParse",
    value: function createParse(input, fragments, ranges) {
      var parse = new Parse(this, input, fragments, ranges);
      var _iterator5 = _createForOfIteratorHelper(this.wrappers),
        _step5;
      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var w = _step5.value;
          parse = w(parse, input, fragments, ranges);
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }
      return parse;
    }
    /// Get a goto table entry @internal
  }, {
    key: "getGoto",
    value: function getGoto(state, term) {
      var loose = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var table = this["goto"];
      if (term >= table[0]) return -1;
      for (var pos = table[term + 1];;) {
        var groupTag = table[pos++],
          last = groupTag & 1;
        var target = table[pos++];
        if (last && loose) return target;
        for (var end = pos + (groupTag >> 1); pos < end; pos++) if (table[pos] == state) return target;
        if (last) return -1;
      }
    }
    /// Check if this state has an action for a given terminal @internal
  }, {
    key: "hasAction",
    value: function hasAction(state, terminal) {
      var data = this.data;
      for (var set = 0; set < 2; set++) {
        for (var i = this.stateSlot(state, set ? 2 /* ParseState.Skip */ : 1 /* ParseState.Actions */), next;; i += 3) {
          if ((next = data[i]) == 65535 /* Seq.End */) {
            if (data[i + 1] == 1 /* Seq.Next */) next = data[i = pair(data, i + 2)];else if (data[i + 1] == 2 /* Seq.Other */) return pair(data, i + 2);else break;
          }
          if (next == terminal || next == 0 /* Term.Err */) return pair(data, i + 1);
        }
      }
      return 0;
    }
    /// @internal
  }, {
    key: "stateSlot",
    value: function stateSlot(state, slot) {
      return this.states[state * 6 /* ParseState.Size */ + slot];
    }
    /// @internal
  }, {
    key: "stateFlag",
    value: function stateFlag(state, flag) {
      return (this.stateSlot(state, 0 /* ParseState.Flags */) & flag) > 0;
    }
    /// @internal
  }, {
    key: "validAction",
    value: function validAction(state, action) {
      return !!this.allActions(state, function (a) {
        return a == action ? true : null;
      });
    }
    /// @internal
  }, {
    key: "allActions",
    value: function allActions(state, action) {
      var deflt = this.stateSlot(state, 4 /* ParseState.DefaultReduce */);
      var result = deflt ? action(deflt) : undefined;
      for (var i = this.stateSlot(state, 1 /* ParseState.Actions */); result == null; i += 3) {
        if (this.data[i] == 65535 /* Seq.End */) {
          if (this.data[i + 1] == 1 /* Seq.Next */) i = pair(this.data, i + 2);else break;
        }
        result = action(pair(this.data, i + 1));
      }
      return result;
    }
    /// Get the states that can follow this one through shift actions or
    /// goto jumps. @internal
  }, {
    key: "nextStates",
    value: function nextStates(state) {
      var _this3 = this;
      var result = [];
      var _loop2 = function _loop2(_i8) {
        if (_this3.data[_i8] == 65535 /* Seq.End */) {
          if (_this3.data[_i8 + 1] == 1 /* Seq.Next */) _i8 = pair(_this3.data, _i8 + 2);else {
            i = _i8;
            return "break";
          }
        }
        if ((_this3.data[_i8 + 2] & 65536 /* Action.ReduceFlag */ >> 16) == 0) {
          var value = _this3.data[_i8 + 1];
          if (!result.some(function (v, i) {
            return i & 1 && v == value;
          })) result.push(_this3.data[_i8], value);
        }
        i = _i8;
      };
      for (var i = this.stateSlot(state, 1 /* ParseState.Actions */);; i += 3) {
        var _ret = _loop2(i);
        if (_ret === "break") break;
      }
      return result;
    }
    /// Configure the parser. Returns a new parser instance that has the
    /// given settings modified. Settings not provided in `config` are
    /// kept from the original parser.
  }, {
    key: "configure",
    value: function configure(config) {
      var _this$nodeSet;
      // Hideous reflection-based kludge to make it easy to create a
      // slightly modified copy of a parser.
      var copy = Object.assign(Object.create(LRParser.prototype), this);
      if (config.props) copy.nodeSet = (_this$nodeSet = this.nodeSet).extend.apply(_this$nodeSet, _toConsumableArray(config.props));
      if (config.top) {
        var info = this.topRules[config.top];
        if (!info) throw new RangeError("Invalid top rule name ".concat(config.top));
        copy.top = info;
      }
      if (config.tokenizers) copy.tokenizers = this.tokenizers.map(function (t) {
        var found = config.tokenizers.find(function (r) {
          return r.from == t;
        });
        return found ? found.to : t;
      });
      if (config.specializers) {
        copy.specializers = this.specializers.slice();
        copy.specializerSpecs = this.specializerSpecs.map(function (s, i) {
          var found = config.specializers.find(function (r) {
            return r.from == s.external;
          });
          if (!found) return s;
          var spec = Object.assign(Object.assign({}, s), {
            external: found.to
          });
          copy.specializers[i] = getSpecializer(spec);
          return spec;
        });
      }
      if (config.contextTracker) copy.context = config.contextTracker;
      if (config.dialect) copy.dialect = this.parseDialect(config.dialect);
      if (config.strict != null) copy.strict = config.strict;
      if (config.wrap) copy.wrappers = copy.wrappers.concat(config.wrap);
      if (config.bufferLength != null) copy.bufferLength = config.bufferLength;
      return copy;
    }
    /// Tells you whether any [parse wrappers](#lr.ParserConfig.wrap)
    /// are registered for this parser.
  }, {
    key: "hasWrappers",
    value: function hasWrappers() {
      return this.wrappers.length > 0;
    }
    /// Returns the name associated with a given term. This will only
    /// work for all terms when the parser was generated with the
    /// `--names` option. By default, only the names of tagged terms are
    /// stored.
  }, {
    key: "getName",
    value: function getName(term) {
      return this.termNames ? this.termNames[term] : String(term <= this.maxNode && this.nodeSet.types[term].name || term);
    }
    /// The eof term id is always allocated directly after the node
    /// types. @internal
  }, {
    key: "eofTerm",
    get: function get() {
      return this.maxNode + 1;
    }
    /// The type of top node produced by the parser.
  }, {
    key: "topNode",
    get: function get() {
      return this.nodeSet.types[this.top[1]];
    }
    /// @internal
  }, {
    key: "dynamicPrecedence",
    value: function dynamicPrecedence(term) {
      var prec = this.dynamicPrecedences;
      return prec == null ? 0 : prec[term] || 0;
    }
    /// @internal
  }, {
    key: "parseDialect",
    value: function parseDialect(dialect) {
      var values = Object.keys(this.dialects),
        flags = values.map(function () {
          return false;
        });
      if (dialect) {
        var _iterator6 = _createForOfIteratorHelper(dialect.split(" ")),
          _step6;
        try {
          for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
            var part = _step6.value;
            var _id = values.indexOf(part);
            if (_id >= 0) flags[_id] = true;
          }
        } catch (err) {
          _iterator6.e(err);
        } finally {
          _iterator6.f();
        }
      }
      var disabled = null;
      for (var i = 0; i < values.length; i++) if (!flags[i]) {
        for (var j = this.dialects[values[i]], _id2; (_id2 = this.data[j++]) != 65535 /* Seq.End */;) (disabled || (disabled = new Uint8Array(this.maxTerm + 1)))[_id2] = 1;
      }
      return new Dialect(dialect, flags, disabled);
    }
    /// Used by the output of the parser generator. Not available to
    /// user code. @hide
  }], [{
    key: "deserialize",
    value: function deserialize(spec) {
      return new LRParser(spec);
    }
  }]);
  return LRParser;
}(Parser);
function pair(data, off) {
  return data[off] | data[off + 1] << 16;
}
function findFinished(stacks) {
  var best = null;
  var _iterator7 = _createForOfIteratorHelper(stacks),
    _step7;
  try {
    for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
      var stack = _step7.value;
      var stopped = stack.p.stoppedAt;
      if ((stack.pos == stack.p.stream.end || stopped != null && stack.pos > stopped) && stack.p.parser.stateFlag(stack.state, 2 /* StateFlag.Accepting */) && (!best || best.score < stack.score)) best = stack;
    }
  } catch (err) {
    _iterator7.e(err);
  } finally {
    _iterator7.f();
  }
  return best;
}
function getSpecializer(spec) {
  if (spec.external) {
    var mask = spec.extend ? 1 /* Specialize.Extend */ : 0 /* Specialize.Specialize */;
    return function (value, stack) {
      return spec.external(value, stack) << 1 | mask;
    };
  }
  return spec.get;
}

// This file was generated by lezer-generator. You probably shouldn't edit it.
var noSemi = 302,
  incdec = 1,
  incdecPrefix = 2,
  insertSemi = 303,
  spaces = 305,
  newline = 306,
  LineComment = 3,
  BlockComment = 4;

/* Hand-written tokenizers for JavaScript tokens that can't be
   expressed by lezer's built-in tokenizer. */

var space = [9, 10, 11, 12, 13, 32, 133, 160, 5760, 8192, 8193, 8194, 8195, 8196, 8197, 8198, 8199, 8200, 8201, 8202, 8232, 8233, 8239, 8287, 12288];
var braceR = 125,
  semicolon = 59,
  slash = 47,
  star = 42,
  plus = 43,
  minus = 45;
var trackNewline = new ContextTracker({
  start: false,
  shift: function shift(context, term) {
    return term == LineComment || term == BlockComment || term == spaces ? context : term == newline;
  },
  strict: false
});
var insertSemicolon = new ExternalTokenizer(function (input, stack) {
  var next = input.next;
  if ((next == braceR || next == -1 || stack.context) && stack.canShift(insertSemi)) input.acceptToken(insertSemi);
}, {
  contextual: true,
  fallback: true
});
var noSemicolon = new ExternalTokenizer(function (input, stack) {
  var next = input.next,
    after;
  if (space.indexOf(next) > -1) return;
  if (next == slash && ((after = input.peek(1)) == slash || after == star)) return;
  if (next != braceR && next != semicolon && next != -1 && !stack.context && stack.canShift(noSemi)) input.acceptToken(noSemi);
}, {
  contextual: true
});
var incdecToken = new ExternalTokenizer(function (input, stack) {
  var next = input.next;
  if (next == plus || next == minus) {
    input.advance();
    if (next == input.next) {
      input.advance();
      var mayPostfix = !stack.context && stack.canShift(incdec);
      input.acceptToken(mayPostfix ? incdec : incdecPrefix);
    }
  }
}, {
  contextual: true
});
var jsHighlight = styleTags({
  "get set async static": tags.modifier,
  "for while do if else switch try catch finally return throw break continue default case": tags.controlKeyword,
  "in of await yield void typeof delete instanceof": tags.operatorKeyword,
  "let var const function class extends": tags.definitionKeyword,
  "import export from": tags.moduleKeyword,
  "with debugger as new": tags.keyword,
  TemplateString: tags.special(tags.string),
  "super": tags.atom,
  BooleanLiteral: tags.bool,
  "this": tags.self,
  "null": tags["null"],
  Star: tags.modifier,
  VariableName: tags.variableName,
  "CallExpression/VariableName TaggedTemplateExpression/VariableName": tags["function"](tags.variableName),
  VariableDefinition: tags.definition(tags.variableName),
  Label: tags.labelName,
  PropertyName: tags.propertyName,
  PrivatePropertyName: tags.special(tags.propertyName),
  "CallExpression/MemberExpression/PropertyName": tags["function"](tags.propertyName),
  "FunctionDeclaration/VariableDefinition": tags["function"](tags.definition(tags.variableName)),
  "ClassDeclaration/VariableDefinition": tags.definition(tags.className),
  PropertyDefinition: tags.definition(tags.propertyName),
  PrivatePropertyDefinition: tags.definition(tags.special(tags.propertyName)),
  UpdateOp: tags.updateOperator,
  LineComment: tags.lineComment,
  BlockComment: tags.blockComment,
  Number: tags.number,
  String: tags.string,
  Escape: tags.escape,
  ArithOp: tags.arithmeticOperator,
  LogicOp: tags.logicOperator,
  BitOp: tags.bitwiseOperator,
  CompareOp: tags.compareOperator,
  RegExp: tags.regexp,
  Equals: tags.definitionOperator,
  Arrow: tags["function"](tags.punctuation),
  ": Spread": tags.punctuation,
  "( )": tags.paren,
  "[ ]": tags.squareBracket,
  "{ }": tags.brace,
  "InterpolationStart InterpolationEnd": tags.special(tags.brace),
  ".": tags.derefOperator,
  ", ;": tags.separator,
  "@": tags.meta,
  TypeName: tags.typeName,
  TypeDefinition: tags.definition(tags.typeName),
  "type enum interface implements namespace module declare": tags.definitionKeyword,
  "abstract global Privacy readonly override": tags.modifier,
  "is keyof unique infer": tags.operatorKeyword,
  JSXAttributeValue: tags.attributeValue,
  JSXText: tags.content,
  "JSXStartTag JSXStartCloseTag JSXSelfCloseEndTag JSXEndTag": tags.angleBracket,
  "JSXIdentifier JSXNameSpacedName": tags.tagName,
  "JSXAttribute/JSXIdentifier JSXAttribute/JSXNameSpacedName": tags.attributeName,
  "JSXBuiltin/JSXIdentifier": tags.standard(tags.tagName)
});

// This file was generated by lezer-generator. You probably shouldn't edit it.
var spec_identifier = {
  __proto__: null,
  "export": 14,
  as: 19,
  from: 27,
  "default": 30,
  async: 35,
  "function": 36,
  "extends": 46,
  "this": 50,
  "true": 58,
  "false": 58,
  "null": 70,
  "void": 74,
  "typeof": 78,
  "super": 96,
  "new": 130,
  "delete": 146,
  "yield": 155,
  "await": 159,
  "class": 164,
  "public": 221,
  "private": 221,
  "protected": 221,
  readonly: 223,
  "instanceof": 242,
  satisfies: 245,
  "in": 246,
  "const": 248,
  "import": 280,
  keyof: 335,
  unique: 339,
  infer: 345,
  is: 381,
  "abstract": 401,
  "implements": 403,
  type: 405,
  "let": 408,
  "var": 410,
  "interface": 417,
  "enum": 421,
  namespace: 427,
  module: 429,
  declare: 433,
  global: 437,
  "for": 456,
  of: 465,
  "while": 468,
  "with": 472,
  "do": 476,
  "if": 480,
  "else": 482,
  "switch": 486,
  "case": 492,
  "try": 498,
  "catch": 502,
  "finally": 506,
  "return": 510,
  "throw": 514,
  "break": 518,
  "continue": 522,
  "debugger": 526
};
var spec_word = {
  __proto__: null,
  async: 117,
  get: 119,
  set: 121,
  declare: 181,
  "public": 183,
  "private": 183,
  "protected": 183,
  "static": 185,
  "abstract": 187,
  override: 189,
  readonly: 195,
  accessor: 197,
  "new": 385
};
var spec_LessThan = {
  __proto__: null,
  "<": 137
};
var parser = LRParser.deserialize({
  version: 14,
  states: "$6[O`QUOOO%QQUOOO'TQWOOP(bOSOOO*pQ(CjO'#CfO*wOpO'#CgO+VO!bO'#CgO+eO07`O'#DZO-vQUO'#DaO.WQUO'#DlO%QQUO'#DvO0[QUO'#EOOOQ(CY'#EW'#EWO0uQSO'#ETOOQO'#Ei'#EiOOQO'#Ib'#IbO0}QSO'#GkO1YQSO'#EhO1_QSO'#EhO3aQ(CjO'#JcO6QQ(CjO'#JdO6nQSO'#FWO6sQ#tO'#FoOOQ(CY'#F`'#F`O7OO&jO'#F`O7^Q,UO'#FvO8tQSO'#FuOOQ(CY'#Jd'#JdOOQ(CW'#Jc'#JcOOQQ'#KO'#KOO8yQSO'#IOO9OQ(C[O'#IPOOQQ'#JP'#JPOOQQ'#IT'#ITQ`QUOOO%QQUO'#DnO9WQUO'#DzO%QQUO'#D|O9_QSO'#GkO9dQ,UO'#ClO9rQSO'#EgO9}QSO'#ErO:SQ,UO'#F_O:qQSO'#GkO:vQSO'#GoO;RQSO'#GoO;aQSO'#GrO;aQSO'#GsO;aQSO'#GuO9_QSO'#GxO<QQSO'#G{O=cQSO'#CbO=sQSO'#HXO={QSO'#H_O={QSO'#HaO`QUO'#HcO={QSO'#HeO={QSO'#HhO>QQSO'#HnO>VQ(C]O'#HtO%QQUO'#HvO>bQ(C]O'#HxO>mQ(C]O'#HzO9OQ(C[O'#H|O>xQ(CjO'#CfO?zQWO'#DfQOQSOOO@bQSO'#EPO9dQ,UO'#EgO@mQSO'#EgO@xQ`O'#F_OOQQ'#Cd'#CdOOQ(CW'#Dk'#DkOOQ(CW'#Jg'#JgO%QQUO'#JgOOQO'#Jk'#JkOOQO'#I_'#I_OAxQWO'#E`OOQ(CW'#E_'#E_OBtQ(C`O'#E`OCOQWO'#ESOOQO'#Jj'#JjOCdQWO'#JkODqQWO'#ESOCOQWO'#E`PEOO?MpO'#C`POOO)CDn)CDnOOOO'#IU'#IUOEZOpO,59ROOQ(CY,59R,59ROOOO'#IV'#IVOEiO!bO,59RO%QQUO'#D]OOOO'#IX'#IXOEwO07`O,59uOOQ(CY,59u,59uOFVQUO'#IYOFjQSO'#JeOHlQbO'#JeO+sQUO'#JeOHsQSO,59{OIZQSO'#EiOIhQSO'#JsOIsQSO'#JrOIsQSO'#JrOI{QSO,5;VOJQQSO'#JqOOQ(CY,5:W,5:WOJXQUO,5:WOLYQ(CjO,5:bOLyQSO,5:jOMdQ(C[O'#JpOMkQSO'#JoO:vQSO'#JoONPQSO'#JoONXQSO,5;UON^QSO'#JoO!!fQbO'#JdOOQ(CY'#Cf'#CfO%QQUO'#EOO!#UQ`O,5:oOOQO'#Jl'#JlOOQO-E<`-E<`O9_QSO,5=VO!#lQSO,5=VO!#qQUO,5;SO!%tQ,UO'#EdO!'XQSO,5;SO!(qQ,UO'#DpO!(xQUO'#DuO!)SQWO,5;]O!)[QWO,5;]O%QQUO,5;]OOQQ'#FO'#FOOOQQ'#FQ'#FQO%QQUO,5;^O%QQUO,5;^O%QQUO,5;^O%QQUO,5;^O%QQUO,5;^O%QQUO,5;^O%QQUO,5;^O%QQUO,5;^O%QQUO,5;^O%QQUO,5;^O%QQUO,5;^OOQQ'#FU'#FUO!)jQUO,5;oOOQ(CY,5;t,5;tOOQ(CY,5;u,5;uO!+mQSO,5;uOOQ(CY,5;v,5;vO%QQUO'#IfO!+uQ(C[O,5<cO!%tQ,UO,5;^O!,dQ,UO,5;^O%QQUO,5;rO!,kQ#tO'#FeO!-hQ#tO'#JwO!-SQ#tO'#JwO!-oQ#tO'#JwOOQO'#Jw'#JwO!.TQ#tO,5;}OOOO,5<Z,5<ZO!.fQUO'#FqOOOO'#Ie'#IeO7OO&jO,5;zO!.mQ#tO'#FsOOQ(CY,5;z,5;zO!/^Q7[O'#CrOOQ(CY'#Cv'#CvO!/qQSO'#CvO!/vO07`O'#CzO!0dQ,UO,5<`O!0kQSO,5<bO!2QQMhO'#GQO!2_QSO'#GRO!2dQSO'#GRO!2iQMhO'#GVO!3hQWO'#GZO!4ZQ7[O'#J^OOQ(CY'#J^'#J^O!4eQSO'#J]O!4sQSO'#J[O!4{QSO'#CqOOQ(CY'#Ct'#CtOOQ(CY'#DO'#DOOOQ(CY'#DQ'#DQO0xQSO'#DSO!'^Q,UO'#FxO!'^Q,UO'#FzO!5TQSO'#F|O!5YQSO'#F}O!2dQSO'#GTO!'^Q,UO'#GYO!5_QSO'#EjO!5|QSO,5<aO`QUO,5>jOOQQ'#JX'#JXOOQQ,5>k,5>kOOQQ-E<R-E<RO!7{Q(CjO,5:YO!:iQ(CjO,5:fO%QQUO,5:fO!=SQ(CjO,5:hOOQ(CW'#Co'#CoO!=sQ,UO,5=VO!>RQ(C[O'#JYO8tQSO'#JYO!>dQ(C[O,59WO!>oQWO,59WO!>wQ,UO,59WO9dQ,UO,59WO!?SQSO,5;SO!?[QSO'#HWO!?mQSO'#KSO%QQUO,5;wO!?uQWO,5;yO!?zQSO,5=qO!@PQSO,5=qO!@UQSO,5=qO9OQ(C[O,5=qO!@dQSO'#EkO!A^QWO'#ElOOQ(CW'#Jq'#JqO!AeQ(C[O'#KPO9OQ(C[O,5=ZO;aQSO,5=aOOQO'#Cr'#CrO!ApQWO,5=^O!AxQ,UO,5=_O!BTQSO,5=aO!BYQ`O,5=dO>QQSO'#G}O9_QSO'#HPO!BbQSO'#HPO9dQ,UO'#HRO!BgQSO'#HROOQQ,5=g,5=gO!BlQSO'#HSO!BtQSO'#ClO!ByQSO,58|O!CTQSO,58|O!E]QUO,58|OOQQ,58|,58|O!EjQ(C[O,58|O%QQUO,58|O!EuQUO'#HZOOQQ'#H['#H[OOQQ'#H]'#H]O`QUO,5=sO!FVQSO,5=sO`QUO,5=yO`QUO,5={O!F[QSO,5=}O`QUO,5>PO!FaQSO,5>SO!FfQUO,5>YOOQQ,5>`,5>`O%QQUO,5>`O9OQ(C[O,5>bOOQQ,5>d,5>dO!JmQSO,5>dOOQQ,5>f,5>fO!JmQSO,5>fOOQQ,5>h,5>hO!JrQWO'#DXO%QQUO'#JgO!KaQWO'#JgO!LOQWO'#DgO!LaQWO'#DgO!NrQUO'#DgO!NyQSO'#JfO# RQSO,5:QO# WQSO'#EmO# fQSO'#JtO# nQSO,5;WO# sQWO'#DgO#!QQWO'#EROOQ(CY,5:k,5:kO%QQUO,5:kO#!XQSO,5:kO>QQSO,5;RO!>oQWO,5;RO!>wQ,UO,5;RO9dQ,UO,5;RO#!aQSO,5@RO#!fQ!LQO,5:oOOQO-E<]-E<]O##lQ(C`O,5:zOCOQWO,5:nO##vQWO,5:nOCOQWO,5:zO!>dQ(C[O,5:nOOQ(CW'#Ec'#EcOOQO,5:z,5:zO%QQUO,5:zO#$TQ(C[O,5:zO#$`Q(C[O,5:zO!>oQWO,5:nOOQO,5;Q,5;QO#$nQ(C[O,5:zPOOO'#IS'#ISP#%SO?MpO,58zPOOO,58z,58zOOOO-E<S-E<SOOQ(CY1G.m1G.mOOOO-E<T-E<TO#%_Q`O,59wOOOO-E<V-E<VOOQ(CY1G/a1G/aO#%dQbO,5>tO+sQUO,5>tOOQO,5>z,5>zO#%nQUO'#IYOOQO-E<W-E<WO#%{QSO,5@PO#&TQbO,5@PO#&[QSO,5@^OOQ(CY1G/g1G/gO%QQUO,5@_O#&dQSO'#I`OOQO-E<^-E<^O#&[QSO,5@^OOQ(CW1G0q1G0qOOQ(CY1G/r1G/rOOQ(CY1G0U1G0UO%QQUO,5@[O#&xQ(C[O,5@[O#'ZQ(C[O,5@[O#'bQSO,5@ZO:vQSO,5@ZO#'jQSO,5@ZO#'xQSO'#IcO#'bQSO,5@ZOOQ(CW1G0p1G0pO!)SQWO,5:qO!)_QWO,5:qOOQO,5:s,5:sO#(jQSO,5:sO#(rQ,UO1G2qO9_QSO1G2qOOQ(CY1G0n1G0nO#)QQ(CjO1G0nO#*VQ(ChO,5;OOOQ(CY'#GP'#GPO#*sQ(CjO'#J^O!#qQUO1G0nO#,{Q,UO'#JhO#-VQSO,5:[O#-[QbO'#JiO%QQUO'#JiO#-fQSO,5:aOOQ(CY'#DX'#DXOOQ(CY1G0w1G0wO%QQUO1G0wOOQ(CY1G1a1G1aO#-kQSO1G0wO#0SQ(CjO1G0xO#0ZQ(CjO1G0xO#2tQ(CjO1G0xO#2{Q(CjO1G0xO#5VQ(CjO1G0xO#5mQ(CjO1G0xO#8gQ(CjO1G0xO#8nQ(CjO1G0xO#;XQ(CjO1G0xO#;`Q(CjO1G0xO#=WQ(CjO1G0xO#@WQ$IUO'#CfO#BUQ$IUO1G1ZO#B]Q$IUO'#JdO!+pQSO1G1aO#BmQ(CjO,5?QOOQ(CW-E<d-E<dO#CaQ(CjO1G0xOOQ(CY1G0x1G0xO#ElQ(CjO1G1^O#F`Q#tO,5<RO#FhQ#tO,5<SO#FpQ#tO'#FjO#GXQSO'#FiOOQO'#Jx'#JxOOQO'#Id'#IdO#G^Q#tO1G1iOOQ(CY1G1i1G1iOOOO1G1t1G1tO#GoQ$IUO'#JcO#GyQSO,5<]O!)jQUO,5<]OOOO-E<c-E<cOOQ(CY1G1f1G1fO#HOQWO'#JwOOQ(CY,5<_,5<_O#HWQWO,5<_OOQ(CY,59b,59bO!%tQ,UO'#C|OOOO'#IW'#IWO#H]O07`O,59fOOQ(CY,59f,59fO%QQUO1G1zO!5YQSO'#IhO#HhQSO,5<sOOQ(CY,5<p,5<pOOQO'#Gf'#GfO!'^Q,UO,5=POOQO'#Gh'#GhO!'^Q,UO,5=RO!%tQ,UO,5=TOOQO1G1|1G1|O#HvQ`O'#CoO#IZQ`O,5<lO#IbQSO'#J{O9_QSO'#J{O#IpQSO,5<nO!'^Q,UO,5<mO#IuQSO'#GSO#JQQSO,5<mO#JVQ`O'#GPO#JdQ`O'#J|O#JnQSO'#J|O!%tQ,UO'#J|O#JsQSO,5<qO#JxQWO'#G[O!3cQWO'#G[O#KZQSO'#G^O#K`QSO'#G`O!2dQSO'#GcO#KeQ(C[O'#IjO#KpQWO,5<uOOQ(CY,5<u,5<uO#KwQWO'#G[O#LVQWO'#G]O#L_QWO'#G]OOQ(CY,5=U,5=UO!'^Q,UO,5?wO!'^Q,UO,5?wO#LdQSO'#IkO#LoQSO,5?vO#LwQSO,59]O#MhQ,UO,59nOOQ(CY,59n,59nO#NZQ,UO,5<dO#N|Q,UO,5<fO?rQSO,5<hOOQ(CY,5<i,5<iO$ WQSO,5<oO$ ]Q,UO,5<tO$ mQSO'#JoO!#qQUO1G1{O$ rQSO1G1{OOQQ1G4U1G4UOOQ(CY1G/t1G/tO!+mQSO1G/tO$#qQ(CjO1G0QOOQQ1G2q1G2qO!%tQ,UO1G2qO%QQUO1G2qO$$bQSO1G2qO$$mQ,UO'#EdOOQ(CW,5?t,5?tO$$wQ(C[O,5?tOOQQ1G.r1G.rO!>dQ(C[O1G.rO!>oQWO1G.rO!>wQ,UO1G.rO$%YQSO1G0nO$%_QSO'#CfO$%jQSO'#KTO$%rQSO,5=rO$%wQSO'#KTO$%|QSO'#KTO$&XQSO'#IsO$&gQSO,5@nO$&oQbO1G1cOOQ(CY1G1e1G1eO9_QSO1G3]O?rQSO1G3]O$&vQSO1G3]O$&{QSO1G3]OOQQ1G3]1G3]O:vQSO'#JrO:vQSO'#EmO%QQUO'#EmO:vQSO'#ImO$'QQ(C[O,5@kOOQQ1G2u1G2uO!BTQSO1G2{O!%tQ,UO1G2xO$']QSO1G2xOOQQ1G2y1G2yO!%tQ,UO1G2yO$'bQSO1G2yO$'jQWO'#GwOOQQ1G2{1G2{O!3cQWO'#IoO!BYQ`O1G3OOOQQ1G3O1G3OOOQQ,5=i,5=iO$'rQ,UO,5=kO9_QSO,5=kO#K`QSO,5=mO8tQSO,5=mO!>oQWO,5=mO!>wQ,UO,5=mO9dQ,UO,5=mO$(QQSO'#KRO$(]QSO,5=nOOQQ1G.h1G.hO$(bQ(C[O1G.hO?rQSO1G.hO$(mQSO1G.hO9OQ(C[O1G.hO$*rQbO,5@pO$+SQSO,5@pO$+_QUO,5=uO$+fQSO,5=uO:vQSO,5@pOOQQ1G3_1G3_O`QUO1G3_OOQQ1G3e1G3eOOQQ1G3g1G3gO={QSO1G3iO$+kQUO1G3kO$/lQUO'#HjOOQQ1G3n1G3nO$/yQSO'#HpO>QQSO'#HrOOQQ1G3t1G3tO$0RQUO1G3tO9OQ(C[O1G3zOOQQ1G3|1G3|OOQ(CW'#GW'#GWO9OQ(C[O1G4OO9OQ(C[O1G4QO$4VQSO,5@RO!)jQUO,5;XO:vQSO,5;XO>QQSO,5:RO!)jQUO,5:RO!>oQWO,5:RO$4[Q$IUO,5:ROOQO,5;X,5;XO$4fQWO'#IZO$4|QSO,5@QOOQ(CY1G/l1G/lO$5UQWO'#IaO$5`QSO,5@`OOQ(CW1G0r1G0rO!LaQWO,5:ROOQO'#I^'#I^O$5hQWO,5:mOOQ(CY,5:m,5:mO#![QSO1G0VOOQ(CY1G0V1G0VO%QQUO1G0VOOQ(CY1G0m1G0mO>QQSO1G0mO!>oQWO1G0mO!>wQ,UO1G0mOOQ(CW1G5m1G5mO!>dQ(C[O1G0YOOQO1G0f1G0fO%QQUO1G0fO$5oQ(C[O1G0fO$5zQ(C[O1G0fO!>oQWO1G0YOCOQWO1G0YO$6YQ(C[O1G0fOOQO1G0Y1G0YO$6nQ(CjO1G0fPOOO-E<Q-E<QPOOO1G.f1G.fOOOO1G/c1G/cO$6xQ`O,5<cO$7QQbO1G4`OOQO1G4f1G4fO%QQUO,5>tO$7[QSO1G5kO$7dQSO1G5xO$7lQbO1G5yO:vQSO,5>zO$7vQ(CjO1G5vO%QQUO1G5vO$8WQ(C[O1G5vO$8iQSO1G5uO$8iQSO1G5uO:vQSO1G5uO$8qQSO,5>}O:vQSO,5>}OOQO,5>},5>}O$9VQSO,5>}O$ mQSO,5>}OOQO-E<a-E<aOOQO1G0]1G0]OOQO1G0_1G0_O!+pQSO1G0_OOQQ7+(]7+(]O!%tQ,UO7+(]O%QQUO7+(]O$9eQSO7+(]O$9pQ,UO7+(]O$:OQ(CjO,59nO$<WQ(CjO,5<dO$>cQ(CjO,5<fO$@nQ(CjO,5<tOOQ(CY7+&Y7+&YO$CPQ(CjO7+&YO$CsQ,UO'#I[O$C}QSO,5@SOOQ(CY1G/v1G/vO$DVQUO'#I]O$DdQSO,5@TO$DlQbO,5@TOOQ(CY1G/{1G/{O$DvQSO7+&cOOQ(CY7+&c7+&cO$D{Q$IUO,5:bO%QQUO7+&uO$EVQ$IUO,5:YO$EdQ$IUO,5:fO$EnQ$IUO,5:hOOQ(CY7+&{7+&{OOQO1G1m1G1mOOQO1G1n1G1nO$ExQ#tO,5<UO!)jQUO,5<TOOQO-E<b-E<bOOQ(CY7+'T7+'TOOOO7+'`7+'`OOOO1G1w1G1wO$FTQSO1G1wOOQ(CY1G1y1G1yO$FYQ`O,59hOOOO-E<U-E<UOOQ(CY1G/Q1G/QO$FaQ(CjO7+'fOOQ(CY,5?S,5?SO$GTQSO,5?SOOQ(CY1G2_1G2_P$GYQSO'#IhPOQ(CY-E<f-E<fO$G|Q,UO1G2kO$HoQ,UO1G2mO$HyQ`O1G2oOOQ(CY1G2W1G2WO$IQQSO'#IgO$I`QSO,5@gO$I`QSO,5@gO$IhQSO,5@gO$IsQSO,5@gOOQO1G2Y1G2YO$JRQ,UO1G2XO!'^Q,UO1G2XO$JcQMhO'#IiO$JsQSO,5@hO!%tQ,UO,5@hO$J{Q`O,5@hOOQ(CY1G2]1G2]OOQ(CW,5<v,5<vOOQ(CW,5<w,5<wO$ mQSO,5<wOBoQSO,5<wO!>oQWO,5<vOOQO'#G_'#G_O$KVQSO,5<xOOQ(CW,5<z,5<zO$ mQSO,5<}OOQO,5?U,5?UOOQO-E<h-E<hOOQ(CY1G2a1G2aO!3cQWO,5<vO$K_QSO,5<wO#KZQSO,5<xO!3cQWO,5<wO$KjQ,UO1G5cO$KtQ,UO1G5cOOQO,5?V,5?VOOQO-E<i-E<iOOQO1G.w1G.wO!?uQWO,59pO%QQUO,59pO$LRQSO1G2SO!'^Q,UO1G2ZO$LWQ(CjO7+'gOOQ(CY7+'g7+'gO!#qQUO7+'gOOQ(CY7+%`7+%`O$LzQ`O'#J}O#![QSO7+(]O$MUQbO7+(]O$9hQSO7+(]O$M]Q(ChO'#CfO$MpQ(ChO,5<{O$NbQSO,5<{OOQ(CW1G5`1G5`OOQQ7+$^7+$^O!>dQ(C[O7+$^O!>oQWO7+$^O!#qQUO7+&YO$NgQSO'#IrO$N{QSO,5@oOOQO1G3^1G3^O9_QSO,5@oO$N{QSO,5@oO% TQSO,5@oOOQO,5?_,5?_OOQO-E<q-E<qOOQ(CY7+&}7+&}O% YQSO7+(wO9OQ(C[O7+(wO9_QSO7+(wO?rQSO7+(wO% _QSO,5;XOOQ(CW,5?X,5?XOOQ(CW-E<k-E<kOOQQ7+(g7+(gO% dQ(ChO7+(dO!%tQ,UO7+(dO% nQ`O7+(eOOQQ7+(e7+(eO!%tQ,UO7+(eO% uQSO'#KQO%!QQSO,5=cOOQO,5?Z,5?ZOOQO-E<m-E<mOOQQ7+(j7+(jO%#aQWO'#HQOOQQ1G3V1G3VO!%tQ,UO1G3VO%QQUO1G3VO%#hQSO1G3VO%#sQ,UO1G3VO9OQ(C[O1G3XO#K`QSO1G3XO8tQSO1G3XO!>oQWO1G3XO!>wQ,UO1G3XO%$RQSO'#IqO%$^QSO,5@mO%$fQWO,5@mOOQ(CW1G3Y1G3YOOQQ7+$S7+$SO?rQSO7+$SO9OQ(C[O7+$SO%$qQSO7+$SO%QQUO1G6[O%QQUO1G6]O%$vQUO1G3aO%$}QSO1G3aO%%SQUO1G3aO%%ZQ(C[O1G6[OOQQ7+(y7+(yO9OQ(C[O7+)TO`QUO7+)VOOQQ'#KW'#KWOOQQ'#It'#ItO%%eQUO,5>UOOQQ,5>U,5>UO%QQUO'#HkO%%rQSO'#HmOOQQ,5>[,5>[O:vQSO,5>[OOQQ,5>^,5>^OOQQ7+)`7+)`OOQQ7+)f7+)fOOQQ7+)j7+)jOOQQ7+)l7+)lO%%wQWO1G5mO%&]Q$IUO1G0sO%&gQSO1G0sOOQO1G/m1G/mO%&rQ$IUO1G/mO>QQSO1G/mO!)jQUO'#DgOOQO,5>u,5>uOOQO-E<X-E<XOOQO,5>{,5>{OOQO-E<_-E<_O!>oQWO1G/mOOQO-E<[-E<[OOQ(CY1G0X1G0XOOQ(CY7+%q7+%qO#![QSO7+%qOOQ(CY7+&X7+&XO>QQSO7+&XO!>oQWO7+&XOOQO7+%t7+%tO$6nQ(CjO7+&QOOQO7+&Q7+&QO%QQUO7+&QO%&|Q(C[O7+&QO!>dQ(C[O7+%tO!>oQWO7+%tO%'XQ(C[O7+&QO%'gQ(CjO7++bO%QQUO7++bO%'wQSO7++aO%'wQSO7++aOOQO1G4i1G4iO:vQSO1G4iO%(PQSO1G4iOOQO7+%y7+%yO#![QSO<<KwO$MUQbO<<KwO%(_QSO<<KwOOQQ<<Kw<<KwO!%tQ,UO<<KwO%QQUO<<KwO%(gQSO<<KwO%(rQ(CjO1G2kO%*}Q(CjO1G2mO%-YQ(CjO1G2XO%/kQ,UO,5>vOOQO-E<Y-E<YO%/uQbO,5>wO%QQUO,5>wOOQO-E<Z-E<ZO%0PQSO1G5oOOQ(CY<<I}<<I}O%0XQ$IUO1G0nO%2cQ$IUO1G0xO%2jQ$IUO1G0xO%4nQ$IUO1G0xO%4uQ$IUO1G0xO%6jQ$IUO1G0xO%7QQ$IUO1G0xO%9eQ$IUO1G0xO%9lQ$IUO1G0xO%;pQ$IUO1G0xO%;wQ$IUO1G0xO%=oQ$IUO1G0xO%>SQ(CjO<<JaO%?XQ$IUO1G0xO%@}Q$IUO'#J^O%CQQ$IUO1G1^O%C_Q$IUO1G0QO!)jQUO'#FlOOQO'#Jy'#JyOOQO1G1p1G1pO%CiQSO1G1oO%CnQ$IUO,5?QOOOO7+'c7+'cOOOO1G/S1G/SOOQ(CY1G4n1G4nO!'^Q,UO7+(ZO%CxQSO,5?RO9_QSO,5?ROOQO-E<e-E<eO%DWQSO1G6RO%DWQSO1G6RO%D`QSO1G6RO%DkQ,UO7+'sO%D{Q`O,5?TO%EVQSO,5?TO!%tQ,UO,5?TOOQO-E<g-E<gO%E[Q`O1G6SO%EfQSO1G6SOOQ(CW1G2c1G2cO$ mQSO1G2cOOQ(CW1G2b1G2bO%EnQSO1G2dO!%tQ,UO1G2dOOQ(CW1G2i1G2iO!>oQWO1G2bOBoQSO1G2cO%EsQSO1G2dO%E{QSO1G2cO!'^Q,UO7+*}OOQ(CY1G/[1G/[O%FWQSO1G/[OOQ(CY7+'n7+'nO%F]Q,UO7+'uO%FmQ(CjO<<KROOQ(CY<<KR<<KRO!%tQ,UO'#IlO%GaQSO,5@iO!%tQ,UO1G2gOOQQ<<Gx<<GxO!>dQ(C[O<<GxO%GiQ(CjO<<ItOOQ(CY<<It<<ItOOQO,5?^,5?^O%H]QSO,5?^O$%|QSO,5?^OOQO-E<p-E<pO%HbQSO1G6ZO%HbQSO1G6ZO9_QSO1G6ZO?rQSO<<LcOOQQ<<Lc<<LcO%HjQSO<<LcO9OQ(C[O<<LcO%HoQSO1G0sOOQQ<<LO<<LOO% dQ(ChO<<LOOOQQ<<LP<<LPO% nQ`O<<LPO%HtQWO'#InO%IPQSO,5@lO!)jQUO,5@lOOQQ1G2}1G2}O%IXQUO'#JgOOQO'#Ip'#IpO9OQ(C[O'#IpO%IcQWO,5=lOOQQ,5=l,5=lO%IjQWO'#E`O%JOQSO7+(qO%JTQSO7+(qOOQQ7+(q7+(qO!%tQ,UO7+(qO%QQUO7+(qO%J]QSO7+(qOOQQ7+(s7+(sO9OQ(C[O7+(sO#K`QSO7+(sO8tQSO7+(sO!>oQWO7+(sO%JhQSO,5?]OOQO-E<o-E<oOOQO'#HT'#HTO%JsQSO1G6XO9OQ(C[O<<GnOOQQ<<Gn<<GnO?rQSO<<GnO%J{QSO7++vO%KQQSO7++wOOQQ7+({7+({O%KVQSO7+({O%K[QUO7+({O%KcQSO7+({O%QQUO7++vO%QQUO7++wOOQQ<<Lo<<LoOOQQ<<Lq<<LqOOQQ-E<r-E<rOOQQ1G3p1G3pO%KhQSO,5>VOOQQ,5>X,5>XO%KmQSO1G3vO:vQSO7+&_O!)jQUO7+&_OOQO7+%X7+%XO%KrQ$IUO1G5yO>QQSO7+%XOOQ(CY<<I]<<I]OOQ(CY<<Is<<IsO>QQSO<<IsOOQO<<Il<<IlO$6nQ(CjO<<IlO%QQUO<<IlOOQO<<I`<<I`O!>dQ(C[O<<I`O%K|Q(C[O<<IlO%LXQ(CjO<<N|O%LiQSO<<N{OOQO7+*T7+*TO:vQSO7+*TOOQQANAcANAcO%LqQSOANAcO!%tQ,UOANAcO#![QSOANAcO$MUQbOANAcO%QQUOANAcO%LyQ(CjO7+'sO& [Q(CjO7+'uO&#mQbO1G4cO&#wQ$IUO7+&YO&$UQ$IUO,59nO&&XQ$IUO,5<dO&([Q$IUO,5<fO&*_Q$IUO,5<tO&,TQ$IUO7+'fO&,bQ$IUO7+'gO&,oQSO,5<WOOQO7+'Z7+'ZO&,tQ,UO<<KuOOQO1G4m1G4mO&,{QSO1G4mO&-WQSO1G4mO&-fQSO7++mO&-fQSO7++mO!%tQ,UO1G4oO&-nQ`O1G4oO&-xQSO7++nOOQ(CW7+'}7+'}O$ mQSO7+(OO&.QQ`O7+(OOOQ(CW7+'|7+'|O$ mQSO7+'}O&.XQSO7+(OO!%tQ,UO7+(OOBoQSO7+'}O&.^Q,UO<<NiOOQ(CY7+$v7+$vO&.hQ`O,5?WOOQO-E<j-E<jO&.rQ(ChO7+(ROOQQAN=dAN=dO9_QSO1G4xOOQO1G4x1G4xO&/SQSO1G4xO&/XQSO7++uO&/XQSO7++uO9OQ(C[OANA}O?rQSOANA}OOQQANA}ANA}OOQQANAjANAjOOQQANAkANAkO&/aQSO,5?YOOQO-E<l-E<lO&/lQ$IUO1G6WO&1|QbO'#CfOOQO,5?[,5?[OOQO-E<n-E<nOOQQ1G3W1G3WO%IXQUO,5<xOOQQ<<L]<<L]O!%tQ,UO<<L]O%JOQSO<<L]O&2WQSO<<L]O%QQUO<<L]OOQQ<<L_<<L_O9OQ(C[O<<L_O#K`QSO<<L_O8tQSO<<L_O&2`QWO1G4wO&2kQSO7++sOOQQAN=YAN=YO9OQ(C[OAN=YOOQQ<= b<= bOOQQ<= c<= cOOQQ<<Lg<<LgO&2sQSO<<LgO&2xQUO<<LgO&3PQSO<= bO&3UQSO<= cOOQQ1G3q1G3qO>QQSO7+)bO&3ZQSO<<IyO&3fQ$IUO<<IyOOQO<<Hs<<HsOOQ(CYAN?_AN?_OOQOAN?WAN?WO$6nQ(CjOAN?WOOQOAN>zAN>zO%QQUOAN?WOOQO<<Mo<<MoOOQQG26}G26}O!%tQ,UOG26}O#![QSOG26}O&3pQSOG26}O$MUQbOG26}O&3xQ$IUO<<JaO&4VQ$IUO1G2XO&5{Q$IUO1G2kO&8OQ$IUO1G2mO&:RQ$IUO<<KRO&:`Q$IUO<<ItOOQO1G1r1G1rO!'^Q,UOANAaOOQO7+*X7+*XO&:mQSO7+*XO&:xQSO<= XO&;QQ`O7+*ZOOQ(CW<<Kj<<KjO$ mQSO<<KjOOQ(CW<<Ki<<KiO&;[Q`O<<KjO$ mQSO<<KiOOQO7+*d7+*dO9_QSO7+*dO&;cQSO<= aOOQQG27iG27iO9OQ(C[OG27iO!)jQUO1G4tO&;kQSO7++rO%JOQSOANAwOOQQANAwANAwO!%tQ,UOANAwO&;sQSOANAwOOQQANAyANAyO9OQ(C[OANAyO#K`QSOANAyOOQO'#HU'#HUOOQO7+*c7+*cOOQQG22tG22tOOQQANBRANBRO&;{QSOANBROOQQAND|AND|OOQQAND}AND}OOQQ<<L|<<L|O!)jQUOAN?eOOQOG24rG24rO$6nQ(CjOG24rO#![QSOLD,iOOQQLD,iLD,iO!%tQ,UOLD,iO&<QQSOLD,iO&<YQ$IUO7+'sO&>OQ$IUO7+'uO&?tQ,UOG26{OOQO<<Ms<<MsOOQ(CWANAUANAUO$ mQSOANAUOOQ(CWANATANATOOQO<<NO<<NOOOQQLD-TLD-TO&@UQ$IUO7+*`OOQQG27cG27cO%JOQSOG27cO!%tQ,UOG27cOOQQG27eG27eO9OQ(C[OG27eOOQQG27mG27mO&@`Q$IUOG25POOQOLD*^LD*^OOQQ!$(!T!$(!TO#![QSO!$(!TO!%tQ,UO!$(!TO&@jQ(CjOG26{OOQ(CWG26pG26pOOQQLD,}LD,}O%JOQSOLD,}OOQQLD-PLD-POOQQ!)9Eo!)9EoO#![QSO!)9EoOOQQ!$(!i!$(!iOOQQ!.K;Z!.K;ZO&B{Q$IUOG26{O!)jQUO'#DvO0uQSO'#ETO&DqQbO'#JcO!)jQUO'#DnO&DxQUO'#DzO!)jQUO'#D|O&EPQbO'#CfO&GgQbO'#CfO&GwQUO,5;SO!)jQUO,5;^O!)jQUO,5;^O!)jQUO,5;^O!)jQUO,5;^O!)jQUO,5;^O!)jQUO,5;^O!)jQUO,5;^O!)jQUO,5;^O!)jQUO,5;^O!)jQUO,5;^O!)jQUO,5;^O!)jQUO'#IfO&IzQSO,5<cO&JSQ,UO,5;^O&KgQ,UO,5;^O!)jQUO,5;rO0xQSO'#DSO0xQSO'#DSO!%tQ,UO'#FxO&JSQ,UO'#FxO!%tQ,UO'#FzO&JSQ,UO'#FzO!%tQ,UO'#GYO&JSQ,UO'#GYO!)jQUO,5:fO!)jQUO,5@_O&GwQUO1G0nO&KnQ$IUO'#CfO!)jQUO1G1zO!%tQ,UO,5=PO&JSQ,UO,5=PO!%tQ,UO,5=RO&JSQ,UO,5=RO!%tQ,UO,5<mO&JSQ,UO,5<mO&GwQUO1G1{O!)jQUO7+&uO!%tQ,UO1G2XO&JSQ,UO1G2XO!%tQ,UO1G2ZO&JSQ,UO1G2ZO&GwQUO7+'gO&GwQUO7+&YO!%tQ,UOANAaO&JSQ,UOANAaO&KxQSO'#EhO&K}QSO'#EhO&LVQSO'#FWO&L[QSO'#ErO&LaQSO'#JsO&LlQSO'#JqO&LwQSO,5;SO&L|Q,UO,5<`O&MTQSO'#GRO&MYQSO'#GRO&M_QSO,5<aO&MgQSO,5;SO&MoQ$IUO1G1ZO&MvQSO,5<mO&M{QSO,5<mO&NQQSO,5<oO&NVQSO,5<oO&N[QSO1G1{O&NaQSO1G0nO&NfQ,UO<<KuO&NmQ,UO<<KuO7^Q,UO'#FvO8tQSO'#FuO@mQSO'#EgO!)jQUO,5;oO!2dQSO'#GRO!2dQSO'#GRO!2dQSO'#GTO!2dQSO'#GTO!'^Q,UO7+(ZO!'^Q,UO7+(ZO$HyQ`O1G2oO$HyQ`O1G2oO!%tQ,UO,5=TO!%tQ,UO,5=T",
  stateData: "' v~O'mOS'nOSROS'oRQ~OPYOQYOV!TO^pOaxObwOikOkYOlkOmkOskOuYOwYO|WO!QkO!RkO!XXO!csO!hZO!kYO!lYO!mYO!otO!quO!tvO!x]O#p}O$QzO$UfO%`{O%b!OO%d|O%e|O%h!PO%j!QO%m!RO%n!RO%p!SO%|!UO&S!VO&U!WO&W!XO&Y!YO&]!ZO&c![O&i!]O&k!^O&m!_O&o!`O&q!aO'tSO'vTO'yUO(RVO(a[O(niO~OPYOQYOa!gOb!fOikOkYOlkOmkOskOuYOwYO|WO!QkO!RkO!X!cO!csO!hZO!kYO!lYO!mYO!otO!quO!t!eO$Q!hO$UfO't!bO'vTO'yUO(RVO(a[O(niO~O^!sOl!kO|!lO![!uO!]!rO!^!rO!x9mO!|!mO!}!mO#O!tO#P!mO#Q!mO#T!vO#U!vO'u!iO'vTO'yUO(U!jO(a!pO~O'o!wO~OPYXXYX^YXkYXyYXzYX|YX!VYX!eYX!fYX!hYX!lYX#XYX#dcX#gYX#hYX#iYX#jYX#kYX#lYX#mYX#nYX#oYX#qYX#sYX#uYX#vYX#{YX'kYX(RYX(bYX(iYX(jYX~O!a$zX~P(gO[!yO'v!{O'w!yO'x!{O~O[!|O'x!{O'y!{O'z!|O~Oq#OO!O#PO(S#PO(T#RO~OPYOQYOa!gOb!fOikOkYOlkOmkOskOuYOwYO|WO!QkO!RkO!X!cO!csO!hZO!kYO!lYO!mYO!otO!quO!t!eO$Q!hO$UfO't9rO'vTO'yUO(RVO(a[O(niO~O!U#VO!V#SO!S(XP!S(fP~P+sO!W#_O~P`OPYOQYOa!gOb!fOkYOlkOmkOskOuYOwYO|WO!QkO!RkO!X!cO!csO!hZO!kYO!lYO!mYO!otO!quO!t!eO$Q!hO$UfO'vTO'yUO(RVO(a[O(niO~Oi#iO!U#eO!x]O#b#hO#c#eO't9sO!g(cP~P._O!h#kO't#jO~O!t#oO!x]O%`#pO~O#d#qO~O!a#rO#d#qO~OP$YOX$aOk#}Oy#vOz#wO|#xO!V$^O!e$PO!f#tO!h#uO!l$YO#g#{O#h#|O#i#|O#j#|O#k$OO#l$PO#m$PO#n$`O#o$PO#q$QO#s$SO#u$UO#v$VO(RVO(b$WO(i#yO(j#zO~O^(VX'k(VX'i(VX!g(VX!S(VX!X(VX%a(VX!a(VX~P1gO#X$bO#{$bOP(WXX(WXk(WXy(WXz(WX|(WX!V(WX!e(WX!h(WX!l(WX#g(WX#h(WX#i(WX#j(WX#k(WX#l(WX#m(WX#n(WX#o(WX#q(WX#s(WX#u(WX#v(WX(R(WX(b(WX(i(WX(j(WX!X(WX%a(WX~O^(WX!f(WX'k(WX'i(WX!S(WX!g(WXo(WX!a(WX~P3}O#X$bO~O$W$dO$Y$cO$a$iO~O!X$jO$UfO$d$kO$f$mO~Oi%POk$qOl$pOm$pOs%QOu%ROw%SO|$xO!X$yO!c%XO!h$uO#c%YO$Q%VO$m%TO$o%UO$r%WO't$oO'vTO'yUO'}%OO(R$rOd(OP~O!h%ZO~O!a%]O~O^%^O'k%^O~O'u!iO~P%QO't%eO~O!h%ZO't%eO'u!iO'}%OO~Ob%lO!h%ZO't%eO~O#o$PO~Oy%qO!X%nO!h%pO%b%tO't%eO'u!iO'vTO'yUO](vP~O!t#oO~O|%vO!X%wO't%eO~O|%vO!X%wO%j%{O't%eO~O't%|O~O#p}O%b!OO%d|O%e|O%h!PO%j!QO%m!RO%n!RO~Oa&VOb&UO!t&SO%`&TO%r&RO~P;fOa&YObwO!X&XO!tvO!x]O#p}O%`{O%d|O%e|O%h!PO%j!QO%m!RO%n!RO%p!SO~O_&]O#X&`O%b&ZO'u!iO~P<eO!h&aO!q&eO~O!h#kO~O!XXO~O^%^O'j&mO'k%^O~O^%^O'j&pO'k%^O~O^%^O'j&rO'k%^O~O'iYX!SYXoYX!gYX&QYX!XYX%aYX!aYX~P(gO!['PO!]&xO!^&xO'u!iO'vTO'yUO~Ol&vO|&uO!U&yO(U&tO!W(YP!W(hP~P?fOg'SO!X'QO't%eO~Ob'XO!h%ZO't%eO~Oy%qO!h%pO~Ol!kO|!lO!x9mO!|!mO!}!mO#P!mO#Q!mO'u!iO'vTO'yUO(U!jO(a!pO~O!['_O!]'^O!^'^O#O!mO#T'`O#U'`O~PAQO^%^O!a#rO!h%ZO'k%^O'}%OO(b'bO~O!l'fO#X'dO~PB`Ol!kO|!lO'vTO'yUO(U!jO(a!pO~O!XXOl(_X|(_X![(_X!](_X!^(_X!x(_X!|(_X!}(_X#O(_X#P(_X#Q(_X#T(_X#U(_X'u(_X'v(_X'y(_X(U(_X(a(_X~O!]'^O!^'^O'u!iO~PCOO'p'jO'q'jO'r'lO~O[!yO'v'nO'w!yO'x'nO~O[!|O'x'nO'y'nO'z!|O~Oq#OO!O#PO(S#PO(T'rO~O!U'tO!S&|X!S'SX!V&|X!V'SX~P+sO!V'vO!S(XX~OP$YOX$aOk#}Oy#vOz#wO|#xO!V'vO!e$PO!f#tO!h#uO!l$YO#g#{O#h#|O#i#|O#j#|O#k$OO#l$PO#m$PO#n$`O#o$PO#q$QO#s$SO#u$UO#v$VO(RVO(b$WO(i#yO(j#zO~O!S(XX~PFrO!S'{O~O!S(eX!V(eX!a(eX!g(eX(b(eX~O#X(eX#d#]X!W(eX~PHxO#X'|O!S(gX!V(gX~O!V'}O!S(fX~O!S(QO~O#X$bO~PHxO!W(RO~P`Oy#vOz#wO|#xO!f#tO!h#uO(RVOP!jaX!jak!ja!V!ja!e!ja!l!ja#g!ja#h!ja#i!ja#j!ja#k!ja#l!ja#m!ja#n!ja#o!ja#q!ja#s!ja#u!ja#v!ja(b!ja(i!ja(j!ja~O^!ja'k!ja'i!ja!S!ja!g!jao!ja!X!ja%a!ja!a!ja~PJ`O!g(SO~O!a#rO#X(TO(b'bO!V(dX^(dX'k(dX~O!g(dX~PMOO|%vO!X%wO!x]O#b(YO#c(XO't%eO~O!V(ZO!g(cX~O!g(]O~O|%vO!X%wO#c(XO't%eO~OP(WXX(WXk(WXy(WXz(WX|(WX!V(WX!e(WX!f(WX!h(WX!l(WX#g(WX#h(WX#i(WX#j(WX#k(WX#l(WX#m(WX#n(WX#o(WX#q(WX#s(WX#u(WX#v(WX(R(WX(b(WX(i(WX(j(WX~O!a#rO!g(WX~PNlOy(^Oz(_O!f#tO!h#uO!x!wa|!wa~O!t!wa%`!wa!X!wa#b!wa#c!wa't!wa~P!!pO!t(cO~OPYOQYOa!gOb!fOikOkYOlkOmkOskOuYOwYO|WO!QkO!RkO!XXO!csO!hZO!kYO!lYO!mYO!otO!quO!t!eO$Q!hO$UfO't!bO'vTO'yUO(RVO(a[O(niO~Oi%POk$qOl$pOm$pOs%QOu%ROw:VO|$xO!X$yO!c;aO!h$uO#c:]O$Q%VO$m:XO$o:ZO$r%WO't(gO'vTO'yUO'}%OO(R$rO~O#d(iO~Oi%POk$qOl$pOm$pOs%QOu%ROw%SO|$xO!X$yO!c%XO!h$uO#c%YO$Q%VO$m%TO$o%UO$r%WO't(gO'vTO'yUO'}%OO(R$rO~Od([P~P!'^O!U(mO!g(]P~P%QO(U(oO(a[O~O|(qO!h#uO(U(oO(a[O~OP9lOQ9lOa;]Ob!fOikOk9lOlkOmkOskOu9lOw9lO|WO!QkO!RkO!X!cO!c9oO!hZO!k9lO!l9lO!m9lO!o9pO!q9qO!t!eO$Q!hO$UfO't)PO'vTO'yUO(RVO(a[O(n;ZO~Oz)SO!h#uO~O!V$^O^$ka'k$ka'i$ka!g$ka!S$ka!X$ka%a$ka!a$ka~O#p)WO~P!%tOy)ZO!a)YO!X$XX$T$XX$W$XX$Y$XX$a$XX~O!a)YO!X(kX$T(kX$W(kX$Y(kX$a(kX~Oy)ZO~P!-SOy)ZO!X(kX$T(kX$W(kX$Y(kX$a(kX~O!X)]O$T)aO$W)[O$Y)[O$a)bO~O!U)eO~P!)jO$W$dO$Y$cO$a)iO~Og$sXy$sX|$sX!f$sX(i$sX(j$sX~OdfXd$sXgfX!VfX#XfX~P!.xOl)kO~Oq)lO(S)mO(T)oO~Og)xOy)qO|)rO(i)tO(j)vO~Od)pO~P!0ROd)yO~Oi%POk$qOl$pOm$pOs%QOu%ROw:VO|$xO!X$yO!c;aO!h$uO#c:]O$Q%VO$m:XO$o:ZO$r%WO'vTO'yUO'}%OO(R$rO~O!U)}O't)zO!g(oP~P!0pO#d*PO~O!h*QO~O!U*VO't*SO!S(pP~P!0pOk*cO|*ZO![*aO!]*YO!^*YO!h*QO#T*bO%W*]O'u!iO(U!jO~O!W*`O~P!2vO!f#tOg(QXy(QX|(QX(i(QX(j(QX!V(QX#X(QX~Od(QX#y(QX~P!3oOg*fO#X*eOd(PX!V(PX~O!V*gOd(OX~O't%|Od(OP~O!h*nO~O't(gO~Oi*rO|%vO!U#eO!X%wO!x]O#b#hO#c#eO't%eO!g(cP~O!a#rO#d*sO~OP$YOX$aOk#}Oy#vOz#wO|#xO!e$PO!f#tO!h#uO!l$YO#g#{O#h#|O#i#|O#j#|O#k$OO#l$PO#m$PO#n$`O#o$PO#q$QO#s$SO#u$UO#v$VO(RVO(b$WO(i#yO(j#zO~O^!ba!V!ba'k!ba'i!ba!S!ba!g!bao!ba!X!ba%a!ba!a!ba~P!6UOy#vOz#wO|#xO!f#tO!h#uO(RVOP!naX!nak!na!V!na!e!na!l!na#g!na#h!na#i!na#j!na#k!na#l!na#m!na#n!na#o!na#q!na#s!na#u!na#v!na(b!na(i!na(j!na~O^!na'k!na'i!na!S!na!g!nao!na!X!na%a!na!a!na~P!8oOy#vOz#wO|#xO!f#tO!h#uO(RVOP!paX!pak!pa!V!pa!e!pa!l!pa#g!pa#h!pa#i!pa#j!pa#k!pa#l!pa#m!pa#n!pa#o!pa#q!pa#s!pa#u!pa#v!pa(b!pa(i!pa(j!pa~O^!pa'k!pa'i!pa!S!pa!g!pao!pa!X!pa%a!pa!a!pa~P!;YOg*{O!X'QO%a*zO'}%OO~O!a*}O^'|X!X'|X'k'|X!V'|X~O^%^O!XXO'k%^O~O!h%ZO'}%OO~O!h%ZO't%eO'}%OO~O!a#rO#d(iO~O%b+ZO't+VO'vTO'yUO!W(wP~O!V+[O](vX~O(U(oO~OX+`O~O]+aO~O!X%nO't%eO'u!iO](vP~O|%vO!U+eO!V'}O!X%wO't%eO!S(fP~Ol&|O|+gO!U+fO'vTO'yUO(U(oO~O!W(hP~P!@xO!V+hO^(sX'k(sX~O#X+lO'}%OO~Og+oO!X$yO'}%OO~O!X+qO~Oy+sO!XXO~O!t+xO~Ob+}O~O't#jO!W(uP~Ob%lO~O%b!OO't%|O~P<eOX,TO],SO~OPYOQYOaxObwOikOkYOlkOmkOskOuYOwYO|WO!QkO!RkO!csO!hZO!kYO!lYO!mYO!otO!quO!tvO!x]O$UfO%`{O'vTO'yUO(RVO(a[O(niO~O!X!cO$Q!hO't!bO~P!C]O],SO^%^O'k%^O~O^,XO#p,ZO%d,ZO%e,ZO~P%QO!h&aO~O&S,`O~O!X,bO~O&e,dO&g,eOP&baQ&baV&ba^&baa&bab&bai&bak&bal&bam&bas&bau&baw&ba|&ba!Q&ba!R&ba!X&ba!c&ba!h&ba!k&ba!l&ba!m&ba!o&ba!q&ba!t&ba!x&ba#p&ba$Q&ba$U&ba%`&ba%b&ba%d&ba%e&ba%h&ba%j&ba%m&ba%n&ba%p&ba%|&ba&S&ba&U&ba&W&ba&Y&ba&]&ba&c&ba&i&ba&k&ba&m&ba&o&ba&q&ba'i&ba't&ba'v&ba'y&ba(R&ba(a&ba(n&ba!W&ba&Z&ba_&ba&`&ba~O't,jO~O!V{X!V!_X!W{X!W!_X!a{X!a!_X!h!_X#X{X'}!_X~O!a,oO#X,nO!V#aX!V(ZX!W#aX!W(ZX!a(ZX!h(ZX'}(ZX~O!a,qO!h%ZO'}%OO!V!ZX!W!ZX~Ol!kO|!lO'vTO'yUO(U!jO~OP9lOQ9lOa;]Ob!fOikOk9lOlkOmkOskOu9lOw9lO|WO!QkO!RkO!X!cO!c9oO!hZO!k9lO!l9lO!m9lO!o9pO!q9qO!t!eO$Q!hO$UfO'vTO'yUO(RVO(a[O(n;ZO~O't:bO~P!LrO!V,uO!W(YX~O!W,wO~O!a,oO#X,nO!V#aX!W#aX~O!V,xO!W(hX~O!W,zO~O!],{O!^,{O'u!iO~P!LaO!W-OO~P'TOg-RO!X'QO~O!S-WO~Ol!wa![!wa!]!wa!^!wa!|!wa!}!wa#O!wa#P!wa#Q!wa#T!wa#U!wa'u!wa'v!wa'y!wa(U!wa(a!wa~P!!pO!l-]O#X-ZO~PB`O!]-_O!^-_O'u!iO~PCOO^%^O#X-ZO'k%^O~O^%^O!a#rO#X-ZO'k%^O~O^%^O!a#rO!l-]O#X-ZO'k%^O(b'bO~O'p'jO'q'jO'r-dO~Oo-eO~O!S&|a!V&|a~P!6UO!U-iO!S&|X!V&|X~P%QO!V'vO!S(Xa~O!S(Xa~PFrO!V'}O!S(fa~O|%vO!U-mO!X%wO't%eO!S'SX!V'SX~O#X-oO!V(da!g(da^(da'k(da~O!a#rO~P#&xO!V(ZO!g(ca~O|%vO!X%wO#c-sO't%eO~Oi-xO|%vO!U-uO!X%wO!x]O#b-wO#c-uO't%eO!V'VX!g'VX~Oz-|O!h#uO~Og.PO!X'QO%a.OO'}%OO~O^#[i!V#[i'k#[i'i#[i!S#[i!g#[io#[i!X#[i%a#[i!a#[i~P!6UOg;gOy)qO|)rO(i)tO(j)vO~O#d#Wa^#Wa#X#Wa'k#Wa!V#Wa!g#Wa!X#Wa!S#Wa~P#)tO#d(QXP(QXX(QX^(QXk(QXz(QX!e(QX!h(QX!l(QX#g(QX#h(QX#i(QX#j(QX#k(QX#l(QX#m(QX#n(QX#o(QX#q(QX#s(QX#u(QX#v(QX'k(QX(R(QX(b(QX!g(QX!S(QX'i(QXo(QX!X(QX%a(QX!a(QX~P!3oO!V.YOd([X~P!0ROd.[O~O!V.]O!g(]X~P!6UO!g.`O~O!S.bO~OP$YOy#vOz#wO|#xO!f#tO!h#uO!l$YO(RVOX#fi^#fik#fi!V#fi!e#fi#h#fi#i#fi#j#fi#k#fi#l#fi#m#fi#n#fi#o#fi#q#fi#s#fi#u#fi#v#fi'k#fi(b#fi(i#fi(j#fi'i#fi!S#fi!g#fio#fi!X#fi%a#fi!a#fi~O#g#fi~P#-pO#g#{O~P#-pOP$YOy#vOz#wO|#xO!f#tO!h#uO!l$YO#g#{O#h#|O#i#|O#j#|O(RVOX#fi^#fi!V#fi!e#fi#k#fi#l#fi#m#fi#n#fi#o#fi#q#fi#s#fi#u#fi#v#fi'k#fi(b#fi(i#fi(j#fi'i#fi!S#fi!g#fio#fi!X#fi%a#fi!a#fi~Ok#fi~P#0bOk#}O~P#0bOP$YOk#}Oy#vOz#wO|#xO!f#tO!h#uO!l$YO#g#{O#h#|O#i#|O#j#|O#k$OO(RVO^#fi!V#fi#q#fi#s#fi#u#fi#v#fi'k#fi(b#fi(i#fi(j#fi'i#fi!S#fi!g#fio#fi!X#fi%a#fi!a#fi~OX#fi!e#fi#l#fi#m#fi#n#fi#o#fi~P#3SOX$aO!e$PO#l$PO#m$PO#n$`O#o$PO~P#3SOP$YOX$aOk#}Oy#vOz#wO|#xO!e$PO!f#tO!h#uO!l$YO#g#{O#h#|O#i#|O#j#|O#k$OO#l$PO#m$PO#n$`O#o$PO#q$QO(RVO^#fi!V#fi#s#fi#u#fi#v#fi'k#fi(b#fi(j#fi'i#fi!S#fi!g#fio#fi!X#fi%a#fi!a#fi~O(i#fi~P#6TO(i#yO~P#6TOP$YOX$aOk#}Oy#vOz#wO|#xO!e$PO!f#tO!h#uO!l$YO#g#{O#h#|O#i#|O#j#|O#k$OO#l$PO#m$PO#n$`O#o$PO#q$QO#s$SO(RVO(i#yO^#fi!V#fi#u#fi#v#fi'k#fi(b#fi'i#fi!S#fi!g#fio#fi!X#fi%a#fi!a#fi~O(j#fi~P#8uO(j#zO~P#8uOP$YOX$aOk#}Oy#vOz#wO|#xO!e$PO!f#tO!h#uO!l$YO#g#{O#h#|O#i#|O#j#|O#k$OO#l$PO#m$PO#n$`O#o$PO#q$QO#s$SO#u$UO(RVO(i#yO(j#zO~O^#fi!V#fi#v#fi'k#fi(b#fi'i#fi!S#fi!g#fio#fi!X#fi%a#fi!a#fi~P#;gOPYXXYXkYXyYXzYX|YX!eYX!fYX!hYX!lYX#XYX#dcX#gYX#hYX#iYX#jYX#kYX#lYX#mYX#nYX#oYX#qYX#sYX#uYX#vYX#{YX(RYX(bYX(iYX(jYX!VYX!WYX~O#yYX~P#>QOP$YOX:TOk9wOy#vOz#wO|#xO!e9yO!f#tO!h#uO!l$YO#g9uO#h9vO#i9vO#j9vO#k9xO#l9yO#m9yO#n:SO#o9yO#q9zO#s9|O#u:OO#v:PO(RVO(b$WO(i#yO(j#zO~O#y.dO~P#@_O#X:UO#{:UO#y(WX!W(WX~PNlO^'Ya!V'Ya'k'Ya'i'Ya!g'Ya!S'Yao'Ya!X'Ya%a'Ya!a'Ya~P!6UOP#fiX#fi^#fik#fiz#fi!V#fi!e#fi!f#fi!h#fi!l#fi#g#fi#h#fi#i#fi#j#fi#k#fi#l#fi#m#fi#n#fi#o#fi#q#fi#s#fi#u#fi#v#fi'k#fi(R#fi(b#fi'i#fi!S#fi!g#fio#fi!X#fi%a#fi!a#fi~P#)tO^#zi!V#zi'k#zi'i#zi!S#zi!g#zio#zi!X#zi%a#zi!a#zi~P!6UO$W.iO$Y.iO~O$W.jO$Y.jO~O!a)YO#X.kO!X$^X$T$^X$W$^X$Y$^X$a$^X~O!U.lO~O!X)]O$T.nO$W)[O$Y)[O$a.oO~O!V:QO!W(VX~P#@_O!W.pO~O!a)YO$a(kX~O$a.rO~Oq)lO(S)mO(T.uO~Ol.xO!S.yO'vTO'yUO~O!VcX!acX!gcX!g$sX(bcX~P!.xO!g/PO~P#)tO!V/QO!a#rO(b'bO!g(oX~O!g/VO~O!U)}O't%eO!g(oP~O#d/XO~O!S$sX!V$sX!a$zX~P!.xO!V/YO!S(pX~P#)tO!a/[O~O!S/^O~Ok/bO!a#rO!h%ZO'}%OO(b'bO~O't/dO~O!a*}O~O^%^O!V/hO'k%^O~O!W/jO~P!2vO!]/kO!^/kO'u!iO(U!jO~O|/mO(U!jO~O#T/nO~O't%|Od'_X!V'_X~O!V*gOd(Oa~Od/sO~Oy/tOz/tO|/uOgva(iva(jva!Vva#Xva~Odva#yva~P#L|Oy)qO|)rOg$la(i$la(j$la!V$la#X$la~Od$la#y$la~P#MrOy)qO|)rOg$na(i$na(j$na!V$na#X$na~Od$na#y$na~P#NeO#d/wO~Od$|a!V$|a#X$|a#y$|a~P!0RO!a#rO~O#d/zO~Oy#vOz#wO|#xO!f#tO!h#uO(RVOP!niX!nik!ni!V!ni!e!ni!l!ni#g!ni#h!ni#i!ni#j!ni#k!ni#l!ni#m!ni#n!ni#o!ni#q!ni#s!ni#u!ni#v!ni(b!ni(i!ni(j!ni~O^!ni'k!ni'i!ni!S!ni!g!nio!ni!X!ni%a!ni!a!ni~P$ wOg.PO!X'QO%a.OO~Oi0RO't0QO~P!0sO!a*}O^'|a!X'|a'k'|a!V'|a~O#d0XO~OXYX!VcX!WcX~O!V0YO!W(wX~O!W0[O~OX0]O~O't+VO'vTO'yUO~O!X%nO't%eO]'gX!V'gX~O!V+[O](va~O!g0bO~P!6UOX0eO~O]0fO~O!V+hO^(sa'k(sa~O#X0lO~Og0oO!X$yO~O(U(oO!W(tP~Og0xO!X0uO%a0wO'}%OO~OX1SO!V1QO!W(uX~O!W1TO~O]1VO^%^O'k%^O~O't#jO'vTO'yUO~O#X$bO#{$bOP(WXX(WXk(WXy(WXz(WX|(WX!V(WX!e(WX!h(WX!l(WX#g(WX#h(WX#i(WX#j(WX#k(WX#l(WX#m(WX#n(WX#q(WX#s(WX#u(WX#v(WX(R(WX(b(WX(i(WX(j(WX~O#o1YO&Q1ZO^(WX!f(WX~P$(xO#X$bO#o1YO&Q1ZO~O^1[O~P%QO^1^O~O&Z1bOP&XiQ&XiV&Xi^&Xia&Xib&Xii&Xik&Xil&Xim&Xis&Xiu&Xiw&Xi|&Xi!Q&Xi!R&Xi!X&Xi!c&Xi!h&Xi!k&Xi!l&Xi!m&Xi!o&Xi!q&Xi!t&Xi!x&Xi#p&Xi$Q&Xi$U&Xi%`&Xi%b&Xi%d&Xi%e&Xi%h&Xi%j&Xi%m&Xi%n&Xi%p&Xi%|&Xi&S&Xi&U&Xi&W&Xi&Y&Xi&]&Xi&c&Xi&i&Xi&k&Xi&m&Xi&o&Xi&q&Xi'i&Xi't&Xi'v&Xi'y&Xi(R&Xi(a&Xi(n&Xi!W&Xi_&Xi&`&Xi~O_1hO!W1fO&`1gO~P`O!XXO!h1jO~O&g,eOP&biQ&biV&bi^&bia&bib&bii&bik&bil&bim&bis&biu&biw&bi|&bi!Q&bi!R&bi!X&bi!c&bi!h&bi!k&bi!l&bi!m&bi!o&bi!q&bi!t&bi!x&bi#p&bi$Q&bi$U&bi%`&bi%b&bi%d&bi%e&bi%h&bi%j&bi%m&bi%n&bi%p&bi%|&bi&S&bi&U&bi&W&bi&Y&bi&]&bi&c&bi&i&bi&k&bi&m&bi&o&bi&q&bi'i&bi't&bi'v&bi'y&bi(R&bi(a&bi(n&bi!W&bi&Z&bi_&bi&`&bi~O!S1pO~O!V!Za!W!Za~P#@_Ol!kO|!lO!U1vO(U!jO!V&}X!W&}X~P?fO!V,uO!W(Ya~O!V'TX!W'TX~P!@xO!V,xO!W(ha~O!W1}O~P'TO^%^O#X2WO'k%^O~O^%^O!a#rO#X2WO'k%^O~O^%^O!a#rO!l2[O#X2WO'k%^O(b'bO~O^%^O'k%^O~P!6UO!V$^Oo$ka~O!S&|i!V&|i~P!6UO!V'vO!S(Xi~O!V'}O!S(fi~O!S(gi!V(gi~P!6UO!V(di!g(di^(di'k(di~P!6UO#X2^O!V(di!g(di^(di'k(di~O!V(ZO!g(ci~O|%vO!X%wO!x]O#b2cO#c2bO't%eO~O|%vO!X%wO#c2bO't%eO~Og2jO!X'QO%a2iO~Og2jO!X'QO%a2iO'}%OO~O#dvaPvaXva^vakva!eva!fva!hva!lva#gva#hva#iva#jva#kva#lva#mva#nva#ova#qva#sva#uva#vva'kva(Rva(bva!gva!Sva'ivaova!Xva%ava!ava~P#L|O#d$laP$laX$la^$lak$laz$la!e$la!f$la!h$la!l$la#g$la#h$la#i$la#j$la#k$la#l$la#m$la#n$la#o$la#q$la#s$la#u$la#v$la'k$la(R$la(b$la!g$la!S$la'i$lao$la!X$la%a$la!a$la~P#MrO#d$naP$naX$na^$nak$naz$na!e$na!f$na!h$na!l$na#g$na#h$na#i$na#j$na#k$na#l$na#m$na#n$na#o$na#q$na#s$na#u$na#v$na'k$na(R$na(b$na!g$na!S$na'i$nao$na!X$na%a$na!a$na~P#NeO#d$|aP$|aX$|a^$|ak$|az$|a!V$|a!e$|a!f$|a!h$|a!l$|a#g$|a#h$|a#i$|a#j$|a#k$|a#l$|a#m$|a#n$|a#o$|a#q$|a#s$|a#u$|a#v$|a'k$|a(R$|a(b$|a!g$|a!S$|a'i$|a#X$|ao$|a!X$|a%a$|a!a$|a~P#)tO^#[q!V#[q'k#[q'i#[q!S#[q!g#[qo#[q!X#[q%a#[q!a#[q~P!6UOd'OX!V'OX~P!'^O!V.YOd([a~O!U2rO!V'PX!g'PX~P%QO!V.]O!g(]a~O!V.]O!g(]a~P!6UO!S2uO~O#y!ja!W!ja~PJ`O#y!ba!V!ba!W!ba~P#@_O#y!na!W!na~P!8oO#y!pa!W!pa~P!;YO!X3XO$UfO$_3YO~O!W3^O~Oo3_O~P#)tO^$hq!V$hq'k$hq'i$hq!S$hq!g$hqo$hq!X$hq%a$hq!a$hq~P!6UO!S3`O~Ol.xO'vTO'yUO~Oy)qO|)rO(j)vOg%Xi(i%Xi!V%Xi#X%Xi~Od%Xi#y%Xi~P$GeOy)qO|)rOg%Zi(i%Zi(j%Zi!V%Zi#X%Zi~Od%Zi#y%Zi~P$HWO(b$WO~P#)tO!U3cO't%eO!V'ZX!g'ZX~O!V/QO!g(oa~O!V/QO!a#rO!g(oa~O!V/QO!a#rO(b'bO!g(oa~Od$ui!V$ui#X$ui#y$ui~P!0RO!U3kO't*SO!S']X!V']X~P!0pO!V/YO!S(pa~O!V/YO!S(pa~P#)tO!a#rO#o3sO~Ok3vO!a#rO(b'bO~Od(Pi!V(Pi~P!0RO#X3yOd(Pi!V(Pi~P!0RO!g3|O~O^$iq!V$iq'k$iq'i$iq!S$iq!g$iqo$iq!X$iq%a$iq!a$iq~P!6UO!V4QO!X(qX~P#)tO!f#tO~P3}O^$sX!X$sX%UYX'k$sX!V$sX~P!.xO%U4SO^hXghXyhX|hX!XhX'khX(ihX(jhX!VhX~O%U4SO~O%b4ZO't+VO'vTO'yUO!V'fX!W'fX~O!V0YO!W(wa~OX4_O~O]4`O~O!S4dO~O^%^O'k%^O~P#)tO!X$yO~P#)tO!V4iO#X4kO!W(tX~O!W4lO~Ol!kO|4mO![!uO!]!rO!^!rO!x9mO!|!mO!}!mO#O!mO#P!mO#Q!mO#T4rO#U!vO'u!iO'vTO'yUO(U!jO(a!pO~O!W4qO~P%!VOg4wO!X0uO%a4vO~Og4wO!X0uO%a4vO'}%OO~O't#jO!V'eX!W'eX~O!V1QO!W(ua~O'vTO'yUO(U5QO~O]5UO~O!g5XO~P%QO^5ZO~O^5ZO~P%QO#o5]O&Q5^O~PMOO_1hO!W5bO&`1gO~P`O!a5dO~O!a5fO!V(Zi!W(Zi!a(Zi!h(Zi'}(Zi~O!V#ai!W#ai~P#@_O#X5gO!V#ai!W#ai~O!V!Zi!W!Zi~P#@_O^%^O#X5pO'k%^O~O^%^O!a#rO#X5pO'k%^O~O!V(dq!g(dq^(dq'k(dq~P!6UO!V(ZO!g(cq~O|%vO!X%wO#c5wO't%eO~O!X'QO%a5zO~Og5}O!X'QO%a5zO~O#d%XiP%XiX%Xi^%Xik%Xiz%Xi!e%Xi!f%Xi!h%Xi!l%Xi#g%Xi#h%Xi#i%Xi#j%Xi#k%Xi#l%Xi#m%Xi#n%Xi#o%Xi#q%Xi#s%Xi#u%Xi#v%Xi'k%Xi(R%Xi(b%Xi!g%Xi!S%Xi'i%Xio%Xi!X%Xi%a%Xi!a%Xi~P$GeO#d%ZiP%ZiX%Zi^%Zik%Ziz%Zi!e%Zi!f%Zi!h%Zi!l%Zi#g%Zi#h%Zi#i%Zi#j%Zi#k%Zi#l%Zi#m%Zi#n%Zi#o%Zi#q%Zi#s%Zi#u%Zi#v%Zi'k%Zi(R%Zi(b%Zi!g%Zi!S%Zi'i%Zio%Zi!X%Zi%a%Zi!a%Zi~P$HWO#d$uiP$uiX$ui^$uik$uiz$ui!V$ui!e$ui!f$ui!h$ui!l$ui#g$ui#h$ui#i$ui#j$ui#k$ui#l$ui#m$ui#n$ui#o$ui#q$ui#s$ui#u$ui#v$ui'k$ui(R$ui(b$ui!g$ui!S$ui'i$ui#X$uio$ui!X$ui%a$ui!a$ui~P#)tOd'Oa!V'Oa~P!0RO!V'Pa!g'Pa~P!6UO!V.]O!g(]i~O#y#[i!V#[i!W#[i~P#@_OP$YOy#vOz#wO|#xO!f#tO!h#uO!l$YO(RVOX#fik#fi!e#fi#h#fi#i#fi#j#fi#k#fi#l#fi#m#fi#n#fi#o#fi#q#fi#s#fi#u#fi#v#fi#y#fi(b#fi(i#fi(j#fi!V#fi!W#fi~O#g#fi~P%0fO#g9uO~P%0fOP$YOy#vOz#wO|#xO!f#tO!h#uO!l$YO#g9uO#h9vO#i9vO#j9vO(RVOX#fi!e#fi#k#fi#l#fi#m#fi#n#fi#o#fi#q#fi#s#fi#u#fi#v#fi#y#fi(b#fi(i#fi(j#fi!V#fi!W#fi~Ok#fi~P%2qOk9wO~P%2qOP$YOk9wOy#vOz#wO|#xO!f#tO!h#uO!l$YO#g9uO#h9vO#i9vO#j9vO#k9xO(RVO#q#fi#s#fi#u#fi#v#fi#y#fi(b#fi(i#fi(j#fi!V#fi!W#fi~OX#fi!e#fi#l#fi#m#fi#n#fi#o#fi~P%4|OX:TO!e9yO#l9yO#m9yO#n:SO#o9yO~P%4|OP$YOX:TOk9wOy#vOz#wO|#xO!e9yO!f#tO!h#uO!l$YO#g9uO#h9vO#i9vO#j9vO#k9xO#l9yO#m9yO#n:SO#o9yO#q9zO(RVO#s#fi#u#fi#v#fi#y#fi(b#fi(j#fi!V#fi!W#fi~O(i#fi~P%7hO(i#yO~P%7hOP$YOX:TOk9wOy#vOz#wO|#xO!e9yO!f#tO!h#uO!l$YO#g9uO#h9vO#i9vO#j9vO#k9xO#l9yO#m9yO#n:SO#o9yO#q9zO#s9|O(RVO(i#yO#u#fi#v#fi#y#fi(b#fi!V#fi!W#fi~O(j#fi~P%9sO(j#zO~P%9sOP$YOX:TOk9wOy#vOz#wO|#xO!e9yO!f#tO!h#uO!l$YO#g9uO#h9vO#i9vO#j9vO#k9xO#l9yO#m9yO#n:SO#o9yO#q9zO#s9|O#u:OO(RVO(i#yO(j#zO~O#v#fi#y#fi(b#fi!V#fi!W#fi~P%<OO^#wy!V#wy'k#wy'i#wy!S#wy!g#wyo#wy!X#wy%a#wy!a#wy~P!6UOg;hOy)qO|)rO(i)tO(j)vO~OP#fiX#fik#fiz#fi!e#fi!f#fi!h#fi!l#fi#g#fi#h#fi#i#fi#j#fi#k#fi#l#fi#m#fi#n#fi#o#fi#q#fi#s#fi#u#fi#v#fi#y#fi(R#fi(b#fi!V#fi!W#fi~P%>vO!f#tOP(QXX(QXg(QXk(QXy(QXz(QX|(QX!e(QX!h(QX!l(QX#g(QX#h(QX#i(QX#j(QX#k(QX#l(QX#m(QX#n(QX#o(QX#q(QX#s(QX#u(QX#v(QX#y(QX(R(QX(b(QX(i(QX(j(QX!V(QX!W(QX~O#y#zi!V#zi!W#zi~P#@_O#y!ni!W!ni~P$ wO!W6ZO~O!V'Ya!W'Ya~P#@_O!a#rO(b'bO!V'Za!g'Za~O!V/QO!g(oi~O!V/QO!a#rO!g(oi~Od$uq!V$uq#X$uq#y$uq~P!0RO!S']a!V']a~P#)tO!a6bO~O!V/YO!S(pi~P#)tO!V/YO!S(pi~O!S6fO~O!a#rO#o6kO~Ok6lO!a#rO(b'bO~O!S6nO~Od$wq!V$wq#X$wq#y$wq~P!0RO^$iy!V$iy'k$iy'i$iy!S$iy!g$iyo$iy!X$iy%a$iy!a$iy~P!6UO!V4QO!X(qa~O^#[y!V#[y'k#[y'i#[y!S#[y!g#[yo#[y!X#[y%a#[y!a#[y~P!6UOX6sO~O!V0YO!W(wi~O]6yO~O!a5fO~O(U(oO!V'bX!W'bX~O!V4iO!W(ta~OikO't7QO~P._O!W7TO~P%!VOl!kO|7UO'vTO'yUO(U!jO(a!pO~O!X0uO~O!X0uO%a7WO~Og7ZO!X0uO%a7WO~OX7`O!V'ea!W'ea~O!V1QO!W(ui~O!g7dO~O!g7eO~O!g7fO~O!g7fO~P%QO^7hO~O!a7kO~O!g7lO~O!V(gi!W(gi~P#@_O^%^O#X7tO'k%^O~O!V(dy!g(dy^(dy'k(dy~P!6UO!V(ZO!g(cy~O!X'QO%a7wO~O#d$uqP$uqX$uq^$uqk$uqz$uq!V$uq!e$uq!f$uq!h$uq!l$uq#g$uq#h$uq#i$uq#j$uq#k$uq#l$uq#m$uq#n$uq#o$uq#q$uq#s$uq#u$uq#v$uq'k$uq(R$uq(b$uq!g$uq!S$uq'i$uq#X$uqo$uq!X$uq%a$uq!a$uq~P#)tO#d$wqP$wqX$wq^$wqk$wqz$wq!V$wq!e$wq!f$wq!h$wq!l$wq#g$wq#h$wq#i$wq#j$wq#k$wq#l$wq#m$wq#n$wq#o$wq#q$wq#s$wq#u$wq#v$wq'k$wq(R$wq(b$wq!g$wq!S$wq'i$wq#X$wqo$wq!X$wq%a$wq!a$wq~P#)tO!V'Pi!g'Pi~P!6UO#y#[q!V#[q!W#[q~P#@_Oy/tOz/tO|/uOPvaXvagvakva!eva!fva!hva!lva#gva#hva#iva#jva#kva#lva#mva#nva#ova#qva#sva#uva#vva#yva(Rva(bva(iva(jva!Vva!Wva~Oy)qO|)rOP$laX$lag$lak$laz$la!e$la!f$la!h$la!l$la#g$la#h$la#i$la#j$la#k$la#l$la#m$la#n$la#o$la#q$la#s$la#u$la#v$la#y$la(R$la(b$la(i$la(j$la!V$la!W$la~Oy)qO|)rOP$naX$nag$nak$naz$na!e$na!f$na!h$na!l$na#g$na#h$na#i$na#j$na#k$na#l$na#m$na#n$na#o$na#q$na#s$na#u$na#v$na#y$na(R$na(b$na(i$na(j$na!V$na!W$na~OP$|aX$|ak$|az$|a!e$|a!f$|a!h$|a!l$|a#g$|a#h$|a#i$|a#j$|a#k$|a#l$|a#m$|a#n$|a#o$|a#q$|a#s$|a#u$|a#v$|a#y$|a(R$|a(b$|a!V$|a!W$|a~P%>vO#y$hq!V$hq!W$hq~P#@_O#y$iq!V$iq!W$iq~P#@_O!W8RO~O#y8SO~P!0RO!a#rO!V'Zi!g'Zi~O!a#rO(b'bO!V'Zi!g'Zi~O!V/QO!g(oq~O!S']i!V']i~P#)tO!V/YO!S(pq~O!S8YO~P#)tO!S8YO~Od(Py!V(Py~P!0RO!V'`a!X'`a~P#)tO^%Tq!X%Tq'k%Tq!V%Tq~P#)tOX8_O~O!V0YO!W(wq~O#X8cO!V'ba!W'ba~O!V4iO!W(ti~P#@_OPYXXYXkYXyYXzYX|YX!SYX!VYX!eYX!fYX!hYX!lYX#XYX#dcX#gYX#hYX#iYX#jYX#kYX#lYX#mYX#nYX#oYX#qYX#sYX#uYX#vYX#{YX(RYX(bYX(iYX(jYX~O!a%RX#o%RX~P&/vO!X0uO%a8gO~O'vTO'yUO(U8lO~O!V1QO!W(uq~O!g8oO~O!g8oO~P%QO!g8qO~O!g8rO~O#X8tO!V#ay!W#ay~O!V#ay!W#ay~P#@_O!X'QO%a8yO~O#y#wy!V#wy!W#wy~P#@_OP$uiX$uik$uiz$ui!e$ui!f$ui!h$ui!l$ui#g$ui#h$ui#i$ui#j$ui#k$ui#l$ui#m$ui#n$ui#o$ui#q$ui#s$ui#u$ui#v$ui#y$ui(R$ui(b$ui!V$ui!W$ui~P%>vOy)qO|)rO(j)vOP%XiX%Xig%Xik%Xiz%Xi!e%Xi!f%Xi!h%Xi!l%Xi#g%Xi#h%Xi#i%Xi#j%Xi#k%Xi#l%Xi#m%Xi#n%Xi#o%Xi#q%Xi#s%Xi#u%Xi#v%Xi#y%Xi(R%Xi(b%Xi(i%Xi!V%Xi!W%Xi~Oy)qO|)rOP%ZiX%Zig%Zik%Ziz%Zi!e%Zi!f%Zi!h%Zi!l%Zi#g%Zi#h%Zi#i%Zi#j%Zi#k%Zi#l%Zi#m%Zi#n%Zi#o%Zi#q%Zi#s%Zi#u%Zi#v%Zi#y%Zi(R%Zi(b%Zi(i%Zi(j%Zi!V%Zi!W%Zi~O#y$iy!V$iy!W$iy~P#@_O#y#[y!V#[y!W#[y~P#@_O!a#rO!V'Zq!g'Zq~O!V/QO!g(oy~O!S']q!V']q~P#)tO!S9QO~P#)tO!V0YO!W(wy~O!V4iO!W(tq~O!X0uO%a9XO~O!g9[O~O!X'QO%a9aO~OP$uqX$uqk$uqz$uq!e$uq!f$uq!h$uq!l$uq#g$uq#h$uq#i$uq#j$uq#k$uq#l$uq#m$uq#n$uq#o$uq#q$uq#s$uq#u$uq#v$uq#y$uq(R$uq(b$uq!V$uq!W$uq~P%>vOP$wqX$wqk$wqz$wq!e$wq!f$wq!h$wq!l$wq#g$wq#h$wq#i$wq#j$wq#k$wq#l$wq#m$wq#n$wq#o$wq#q$wq#s$wq#u$wq#v$wq#y$wq(R$wq(b$wq!V$wq!W$wq~P%>vOd%]!Z!V%]!Z#X%]!Z#y%]!Z~P!0RO!V'bq!W'bq~P#@_O!V#a!Z!W#a!Z~P#@_O#d%]!ZP%]!ZX%]!Z^%]!Zk%]!Zz%]!Z!V%]!Z!e%]!Z!f%]!Z!h%]!Z!l%]!Z#g%]!Z#h%]!Z#i%]!Z#j%]!Z#k%]!Z#l%]!Z#m%]!Z#n%]!Z#o%]!Z#q%]!Z#s%]!Z#u%]!Z#v%]!Z'k%]!Z(R%]!Z(b%]!Z!g%]!Z!S%]!Z'i%]!Z#X%]!Zo%]!Z!X%]!Z%a%]!Z!a%]!Z~P#)tOP%]!ZX%]!Zk%]!Zz%]!Z!e%]!Z!f%]!Z!h%]!Z!l%]!Z#g%]!Z#h%]!Z#i%]!Z#j%]!Z#k%]!Z#l%]!Z#m%]!Z#n%]!Z#o%]!Z#q%]!Z#s%]!Z#u%]!Z#v%]!Z#y%]!Z(R%]!Z(b%]!Z!V%]!Z!W%]!Z~P%>vOo(VX~P1gO'u!iO~P!)jO!ScX!VcX#XcX~P&/vOPYXXYXkYXyYXzYX|YX!VYX!VcX!eYX!fYX!hYX!lYX#XYX#XcX#dcX#gYX#hYX#iYX#jYX#kYX#lYX#mYX#nYX#oYX#qYX#sYX#uYX#vYX#{YX(RYX(bYX(iYX(jYX~O!acX!gYX!gcX(bcX~P&E^OP9lOQ9lOa;]Ob!fOikOk9lOlkOmkOskOu9lOw9lO|WO!QkO!RkO!XXO!c9oO!hZO!k9lO!l9lO!m9lO!o9pO!q9qO!t!eO$Q!hO$UfO't)PO'vTO'yUO(RVO(a[O(n;ZO~O!V:QO!W$ka~Oi%POk$qOl$pOm$pOs%QOu%ROw:WO|$xO!X$yO!c;bO!h$uO#c:^O$Q%VO$m:YO$o:[O$r%WO't(gO'vTO'yUO'}%OO(R$rO~O#p)WO~P&JSO!WYX!WcX~P&E^O#d9tO~O!a#rO#d9tO~O#X:UO~O#o9yO~O#X:`O!V(gX!W(gX~O#X:UO!V(eX!W(eX~O#d:aO~Od:cO~P!0RO#d:hO~O#d:iO~O!a#rO#d:jO~O!a#rO#d:aO~O#y:kO~P#@_O#d:lO~O#d:mO~O#d:nO~O#d:oO~O#d:pO~O#d:qO~O#y:rO~P!0RO#y:sO~P!0RO$U~!f!|!}#P#Q#T#b#c#n(n$m$o$r%U%`%a%b%h%j%m%n%p%r~'oR$U(n#h!R'm'u#il#g#jky'n(U'n't$W$Y$W~",
  "goto": "$%Z({PPPP(|P)PP)aP*p.rPPPP5SPP5iP;d>iP>|P>|PPP>|P@lP>|P>|P>|P@pPP@uPA`PFUPPPFYPPPPFYIXPPPI_JYPFYPLgPPPPNuFYPPPFYPFYP!#TFYP!&g!'i!'rP!(e!(i!(ePPPPP!+r!'iPP!,`!-YP!/|FYFY!0R!3Z!7n!7n!;cPPP!;jFYPPPPPPPPPPP!>uP!@WPPFY!AePFYPFYFYFYFYPFY!BwPP!E}P!IPP!IT!I_!Ic!IcP!EzP!Ig!IgP!LiP!LmFYFY!Ls# t>|P>|P>|>|P##O>|>|#$x>|#'V>|#(y>|>|#)g#+c#+c#+g#+o#+c#+wP#+cP>|#,a>|#-i>|>|5SPPP#.tPP#/^#/^P#/^P#/s#/^PP#/yP#/pP#/p#0]#/p#0w#0}5P)P#1Q)PP#1X#1X#1XP)PP)PP)PP)PPP)PP#1_#1bP#1b)PP#1fP#1iP)PP)PP)PP)PP)PP)P)PPP#1o#1u#2P#2V#2]#2c#2i#2w#2}#3T#3_#3e#3o#4O#4U#4u#5X#5_#5e#5s#6Y#7j#7x#8O#8U#8[#8b#8l#8r#8x#9S#9f#9lPPPPPPPPPP#9rPPPPPPP#:f#=mP#>|#?T#?]PPPP#Cg#F]#Lr#Lu#Lx#Mq#Mt#Mw#NO#NWPP#N^#Nb$ Z$!Z$!_$!sPP$!w$!}$#RP$#U$#Y$#]$$R$$i$$n$$q$$t$$z$$}$%R$%VR!xRmpOXr!X#`%]&d&f&g&i,],b1b1eY!rQ'Q,}0u4pQ%ctQ%kwQ%rzQ&[!TS&x!c,uQ'W!fS'^!o!uS*Y$y*_Q+T%lQ+b%tQ+|&UQ,{'PQ-V'XQ-_'_Q/k*aQ1P+}R:_9p$zdOPWXYZrstu!X!^!l#O#S#V#`#k#q#u#x#{#|#}$O$P$Q$R$S$T$U$V$^$b%]%c%p&]&`&d&f&g&i&m&u'S'd't'v'|(T(i(m(q)p*s+g,X,],b-R-Z-i-o.].d/u/z0X0x1Y1Z1[1^1b1e1g2W2^2r4m4w5Z5]5^5p7U7Z7h7tS#m]9m!r)R$X$j&y)e,n,q.l1v3X4k5g8c8t9l9o9p9q9t9u9v9w9x9y9z9{9|9}:O:P:Q:U:_:`:a:c:j:k:p:q;^Q*j%SQ+Y%nQ,O&XQ,V&aQ.S:VQ0O*{Q0S*}Q0_+ZQ1X,TQ2f.PQ4Y0YQ5O1QQ5|2jQ6S:WQ6u4ZR7z5}&xkOPWXYZrstu!X!^!l#O#S#V#`#k#q#u#x#{#|#}$O$P$Q$R$S$T$U$V$X$^$b$j%]%c%p&]&`&a&d&f&g&i&m&u&y'S'd't'v'|(T(i(m(q)e)p*s*{+g,X,],b,n,q-R-Z-i-o.P.].d.l/u/z0X0x1Y1Z1[1^1b1e1g1v2W2^2j2r3X4k4m4w5Z5]5^5g5p5}7U7Z7h7t8c8t9l9o9p9q9t9u9v9w9x9y9z9{9|9}:O:P:Q:U:_:`:a:c:j:k:p:q;^t!kQ!o!r!u!v&x'P'Q'^'_'`,u,{,}-_0u4p4r$Y$pi#r#t$`$a$u$x%T%U%Y)l)u)w)x*P*V*e*f*z*}+l+o.O.Y/X/Y/[/w0l0o0w2i3a3k3s3y4Q4S4v5z6b6k7W7w8S8g8y9X9a:S:T:X:Y:Z:[:]:^:d:e:f:g:h:i:l:m:n:o:r:s;Z;c;d;g;hQ%uzQ&v!cS&|%w,xQ+Y%nS.x)r.zQ/v*nQ0_+ZQ0d+aQ1W,SQ1X,TQ4Y0YQ4c0fQ5R1SQ5S1VQ6u4ZQ6x4`Q7c5UQ8b6yR8m7`pmOXr!T!X#`%]&Z&d&f&g&i,],b1b1eR,Q&]&r^OPXYrstux!X!^!g!l#O#`#k#q#u#x#{#|#}$O$P$Q$R$S$T$U$V$X$^$b$j%]%c%p&]&`&a&d&f&g&i&m&u'S'd'v'|(T(i(m(q)e)p*s*{+g,X,],b,n,q-R-Z-i-o.P.].d.l/u/z0X0x1Y1Z1[1^1b1e1g1v2W2^2j2r3X4k4m4w5Z5]5^5g5p5}7U7Z7h7t8c8t9l9o9p9q9t9u9v9w9x9y9z9{9|9}:O:P:Q:U:_:`:a:c:j:k:p:q;];^[#XWZ#S#V&y'tQ%fvQ%jwS%oz%t!U%x|}#d#e#h%Z%v'}(X(Y(Z+e+f+h,Z,o-m-s-t-u-w1j2b2c5f5wQ&Q!RQ'T!eQ'V!fQ(b#oS)|$u*QS+S%k%lQ+W%nQ+w&SQ+{&US-U'W'XQ.R(cQ/U)}Q0W+TQ0^+ZQ0`+[Q0c+`Q0z+xS1O+|+}Q2S-VQ3b/QQ4X0YQ4]0]Q4b0eQ4}1PQ6_3cQ6t4ZQ6w4_Q8^6sR9S8_v$wi#t%T%U%Y)u)w*P*e*f.Y/X/w3a3y8S;Z;c;d!S%hw!f!q%j%k%l&w'V'W'X']'g*X+S+T,r-U-V-^/c0W1{2S2Z3uQ*|%fQ+m%}Q+p&OQ+z&UQ.Q(bQ0y+wU0}+{+|+}Q2k.RQ4x0zS4|1O1PQ7_4}!z;_#r$`$a$u$x)l)x*V*z*}+l+o.O/Y/[0l0o0w2i3k3s4Q4S4v5z6b6k7W7w8g8y9X9a:X:Z:]:d:f:h:l:n:r;g;hg;`:S:T:Y:[:^:e:g:i:m:o:sW$|i%O*g;ZS%}!O&ZQ&O!PQ&P!QR+k%{$Z${i#r#t$`$a$u$x%T%U%Y)l)u)w)x*P*V*e*f*z*}+l+o.O.Y/X/Y/[/w0l0o0w2i3a3k3s3y4Q4S4v5z6b6k7W7w8S8g8y9X9a:S:T:X:Y:Z:[:]:^:d:e:f:g:h:i:l:m:n:o:r:s;Z;c;d;g;hT)m$r)nV*k%S:V:WU&|!c%w,xS(p#v#wQ+_%qS-z(^(_Q0p+qQ3z/tR6}4i&xkOPWXYZrstu!X!^!l#O#S#V#`#k#q#u#x#{#|#}$O$P$Q$R$S$T$U$V$X$^$b$j%]%c%p&]&`&a&d&f&g&i&m&u&y'S'd't'v'|(T(i(m(q)e)p*s*{+g,X,],b,n,q-R-Z-i-o.P.].d.l/u/z0X0x1Y1Z1[1^1b1e1g1v2W2^2j2r3X4k4m4w5Z5]5^5g5p5}7U7Z7h7t8c8t9l9o9p9q9t9u9v9w9x9y9z9{9|9}:O:P:Q:U:_:`:a:c:j:k:p:q;^$i$]c#U#a%a%b%d's'y(e(l(t(u(v(w(x(y(z({(|(})O)Q)T)X)c*x+^,s-b-g-l-n.X._.c.e.f.g.v/x1q1t2U2]2q2v2w2x2y2z2{2|2}3O3P3Q3R3S3V3W3]4O4V5i5o5t6Q6R6W6X7P7n7r7{8P8Q8v9U9]9n;QT#PV#Q&ykOPWXYZrstu!X!^!l#O#S#V#`#k#q#u#x#{#|#}$O$P$Q$R$S$T$U$V$X$^$b$j%]%c%p&]&`&a&d&f&g&i&m&u&y'S'd't'v'|(T(i(m(q)e)p*s*{+g,X,],b,n,q-R-Z-i-o.P.].d.l/u/z0X0x1Y1Z1[1^1b1e1g1v2W2^2j2r3X4k4m4w5Z5]5^5g5p5}7U7Z7h7t8c8t9l9o9p9q9t9u9v9w9x9y9z9{9|9}:O:P:Q:U:_:`:a:c:j:k:p:q;^Q&z!cR1w,uv!kQ!c!o!r!u!v&x'P'Q'^'_'`,u,{,}-_0u4p4rS*X$y*_S/c*Y*aQ/l*bQ0r+sQ3u/kR3x/nlpOXr!X#`%]&d&f&g&i,],b1b1eQ&k![Q'h!tS(d#q9tQ+Q%iQ+u&QQ+v&RQ-S'UQ-a'aS.W(i:aS/y*s:jQ0U+RQ0t+tQ1i,dQ1k,eQ1s,pQ2Q-TQ2T-XS4P/z:pQ4T0VS4W0X:qQ5h1uQ5l2RQ5q2YQ6r4UQ7o5jQ7p5mQ7s5rR8s7l$d$[c#U#a%b%d's'y(e(l(t(u(v(w(x(y(z({(|(})O)Q)T)X)c*x+^,s-b-g-l-n.X._.c.f.g.v/x1q1t2U2]2q2v2w2x2y2z2{2|2}3O3P3Q3R3S3V3W3]4O4V5i5o5t6Q6R6W6X7P7n7r7{8P8Q8v9U9]9n;QS(a#l'ZU*d$z(h3US*w%a.eQ2g0OQ5y2fQ7y5|R8z7z$d$Zc#U#a%b%d's'y(e(l(t(u(v(w(x(y(z({(|(})O)Q)T)X)c*x+^,s-b-g-l-n.X._.c.f.g.v/x1q1t2U2]2q2v2w2x2y2z2{2|2}3O3P3Q3R3S3V3W3]4O4V5i5o5t6Q6R6W6X7P7n7r7{8P8Q8v9U9]9n;QS(`#l'ZS(r#w$[S*v%a.eS-{(_(aQ.h)SQ/{*wR2d-|&xkOPWXYZrstu!X!^!l#O#S#V#`#k#q#u#x#{#|#}$O$P$Q$R$S$T$U$V$X$^$b$j%]%c%p&]&`&a&d&f&g&i&m&u&y'S'd't'v'|(T(i(m(q)e)p*s*{+g,X,],b,n,q-R-Z-i-o.P.].d.l/u/z0X0x1Y1Z1[1^1b1e1g1v2W2^2j2r3X4k4m4w5Z5]5^5g5p5}7U7Z7h7t8c8t9l9o9p9q9t9u9v9w9x9y9z9{9|9}:O:P:Q:U:_:`:a:c:j:k:p:q;^S#m]9mQ&f!VQ&g!WQ&i!YQ&j!ZR1a,`Q'R!eQ*y%fQ-Q'TS-}(b*|Q2O-PW2h.Q.R/}0PQ5k2PU5x2e2g2kS7v5y5{S8x7x7yS9_8w8zQ9g9`R9j9hU!sQ'Q,}T4n0u4p!O_OXZ`r!T!X#`#d%Z%]&Z&]&d&f&g&i(Z,],b-t1b1e]!mQ!o'Q,}0u4pT#m]9m%UyOPWXYZrstu!X!^!l#O#S#V#`#k#q#u#x#{#|#}$O$P$Q$R$S$T$U$V$^$b%]%c%p&]&`&a&d&f&g&i&m&u'S'd't'v'|(T(i(m(q)p*s*{+g,X,],b-R-Z-i-o.P.].d/u/z0X0x1Y1Z1[1^1b1e1g2W2^2j2r4m4w5Z5]5^5p5}7U7Z7h7tS(p#v#wS-z(^(_!s:w$X$j&y)e,n,q.l1v3X4k5g8c8t9l9o9p9q9t9u9v9w9x9y9z9{9|9}:O:P:Q:U:_:`:a:c:j:k:p:q;^Y!qQ'Q,}0u4pQ']!oS'g!r!uS'i!v4rS-^'^'_Q-`'`R2Z-_Q'f!qS(V#c1_S-]']'iQ/T)|Q/a*XQ2[-`Q3g/US3p/b/lQ6^3bS6i3v3xQ8U6_R8]6lQ#sbQ'e!qS(U#c1_S(W#i*rQ*t%[Q+O%gQ+U%mU-[']'f'iQ-p(VQ/S)|Q/`*XQ/f*[Q0T+PQ0{+yS2X-]-`Q2a-xS3f/T/US3o/a/lQ3r/eQ3t/gQ4z0|Q5s2[Q6]3bQ6a3gS6e3p3xQ6j3wQ7]4{S8T6^6_Q8X6fQ8Z6iQ8j7^Q9O8UQ9P8YQ9R8]Q9Z8kQ9c9QQ:z:uQ;V;OR;W;PV!sQ'Q,}%UaOPWXYZrstu!X!^!l#O#S#V#`#k#q#u#x#{#|#}$O$P$Q$R$S$T$U$V$^$b%]%c%p&]&`&a&d&f&g&i&m&u'S'd't'v'|(T(i(m(q)p*s*{+g,X,],b-R-Z-i-o.P.].d/u/z0X0x1Y1Z1[1^1b1e1g2W2^2j2r4m4w5Z5]5^5p5}7U7Z7h7tS#sx!g!r:t$X$j&y)e,n,q.l1v3X4k5g8c8t9l9o9p9q9t9u9v9w9x9y9z9{9|9}:O:P:Q:U:_:`:a:c:j:k:p:q;^R:z;]%UbOPWXYZrstu!X!^!l#O#S#V#`#k#q#u#x#{#|#}$O$P$Q$R$S$T$U$V$^$b%]%c%p&]&`&a&d&f&g&i&m&u'S'd't'v'|(T(i(m(q)p*s*{+g,X,],b-R-Z-i-o.P.].d/u/z0X0x1Y1Z1[1^1b1e1g2W2^2j2r4m4w5Z5]5^5p5}7U7Z7h7tQ%[j!S%gw!f!q%j%k%l&w'V'W'X']'g*X+S+T,r-U-V-^/c0W1{2S2Z3uS%mx!gQ+P%hQ+y&UW0|+z+{+|+}U4{0}1O1PS7^4|4}Q8k7_!r:u$X$j&y)e,n,q.l1v3X4k5g8c8t9l9o9p9q9t9u9v9w9x9y9z9{9|9}:O:P:Q:U:_:`:a:c:j:k:p:q;^Q;O;[R;P;]$xeOPXYrstu!X!^!l#O#`#k#q#u#x#{#|#}$O$P$Q$R$S$T$U$V$^$b%]%c%p&]&`&d&f&g&i&m&u'S'd'v'|(T(i(m(q)p*s*{+g,X,],b-R-Z-i-o.P.].d/u/z0X0x1Y1Z1[1^1b1e1g2W2^2j2r4m4w5Z5]5^5p5}7U7Z7h7tY#^WZ#S#V't!U%x|}#d#e#h%Z%v'}(X(Y(Z+e+f+h,Z,o-m-s-t-u-w1j2b2c5f5wQ,W&a!p:v$X$j)e,n,q.l1v3X4k5g8c8t9l9o9p9q9t9u9v9w9x9y9z9{9|9}:O:P:Q:U:_:`:a:c:j:k:p:q;^R:y&yS&}!c%wR1y,x$zdOPWXYZrstu!X!^!l#O#S#V#`#k#q#u#x#{#|#}$O$P$Q$R$S$T$U$V$^$b%]%c%p&]&`&d&f&g&i&m&u'S'd't'v'|(T(i(m(q)p*s+g,X,],b-R-Z-i-o.].d/u/z0X0x1Y1Z1[1^1b1e1g2W2^2r4m4w5Z5]5^5p7U7Z7h7t!r)R$X$j&y)e,n,q.l1v3X4k5g8c8t9l9o9p9q9t9u9v9w9x9y9z9{9|9}:O:P:Q:U:_:`:a:c:j:k:p:q;^Q,V&aQ0O*{Q2f.PQ5|2jR7z5}!f$Rc#U%a's'y(e(l({(|(})O)T)X+^-b-g-l-n.X._.v/x2U2]2q3S4O4V5o5t6Q7r8v9n!T9{)Q)c,s.e1q1t2v3O3P3Q3R3V3]5i6R6W6X7P7n7{8P8Q9U9];Q!b$Tc#U%a's'y(e(l(})O)T)X+^-b-g-l-n.X._.v/x2U2]2q3S4O4V5o5t6Q7r8v9n!P9})Q)c,s.e1q1t2v3Q3R3V3]5i6R6W6X7P7n7{8P8Q9U9];Q!^$Xc#U%a's'y(e(l)T)X+^-b-g-l-n.X._.v/x2U2]2q3S4O4V5o5t6Q7r8v9nQ3a/Oz;^)Q)c,s.e1q1t2v3V3]5i6R6W6X7P7n7{8P8Q9U9];QQ;c;eR;d;f&xkOPWXYZrstu!X!^!l#O#S#V#`#k#q#u#x#{#|#}$O$P$Q$R$S$T$U$V$X$^$b$j%]%c%p&]&`&a&d&f&g&i&m&u&y'S'd't'v'|(T(i(m(q)e)p*s*{+g,X,],b,n,q-R-Z-i-o.P.].d.l/u/z0X0x1Y1Z1[1^1b1e1g1v2W2^2j2r3X4k4m4w5Z5]5^5g5p5}7U7Z7h7t8c8t9l9o9p9q9t9u9v9w9x9y9z9{9|9}:O:P:Q:U:_:`:a:c:j:k:p:q;^S$kh$lR3Y.k'PgOPWXYZhrstu!X!^!l#O#S#V#`#k#q#u#x#{#|#}$O$P$Q$R$S$T$U$V$X$^$b$j$l%]%c%p&]&`&a&d&f&g&i&m&u&y'S'd't'v'|(T(i(m(q)e)p*s*{+g,X,],b,n,q-R-Z-i-o.P.].d.k.l/u/z0X0x1Y1Z1[1^1b1e1g1v2W2^2j2r3X4k4m4w5Z5]5^5g5p5}7U7Z7h7t8c8t9l9o9p9q9t9u9v9w9x9y9z9{9|9}:O:P:Q:U:_:`:a:c:j:k:p:q;^T$gf$mQ$efS)[$h)`R)h$mT$ff$mT)^$h)`'PhOPWXYZhrstu!X!^!l#O#S#V#`#k#q#u#x#{#|#}$O$P$Q$R$S$T$U$V$X$^$b$j$l%]%c%p&]&`&a&d&f&g&i&m&u&y'S'd't'v'|(T(i(m(q)e)p*s*{+g,X,],b,n,q-R-Z-i-o.P.].d.k.l/u/z0X0x1Y1Z1[1^1b1e1g1v2W2^2j2r3X4k4m4w5Z5]5^5g5p5}7U7Z7h7t8c8t9l9o9p9q9t9u9v9w9x9y9z9{9|9}:O:P:Q:U:_:`:a:c:j:k:p:q;^T$kh$lQ$nhR)g$l%UjOPWXYZrstu!X!^!l#O#S#V#`#k#q#u#x#{#|#}$O$P$Q$R$S$T$U$V$^$b%]%c%p&]&`&a&d&f&g&i&m&u'S'd't'v'|(T(i(m(q)p*s*{+g,X,],b-R-Z-i-o.P.].d/u/z0X0x1Y1Z1[1^1b1e1g2W2^2j2r4m4w5Z5]5^5p5}7U7Z7h7t!s;[$X$j&y)e,n,q.l1v3X4k5g8c8t9l9o9p9q9t9u9v9w9x9y9z9{9|9}:O:P:Q:U:_:`:a:c:j:k:p:q;^#alOPXZr!X!^!l#O#`#k#x$j%]&]&`&a&d&f&g&i&m&u'S(q)e*{+g,X,],b-R.P.l/u0x1Y1Z1[1^1b1e1g2j3X4m4w5Z5]5^5}7U7Z7hv$zi#t%T%U%Y)u)w*P*e*f.Y/X/w3a3y8S;Z;c;d!z(h#r$`$a$u$x)l)x*V*z*}+l+o.O/Y/[0l0o0w2i3k3s4Q4S4v5z6b6k7W7w8g8y9X9a:X:Z:]:d:f:h:l:n:r;g;hQ*o%WQ.w)qg3U:S:T:Y:[:^:e:g:i:m:o:sv$vi#t%T%U%Y)u)w*P*e*f.Y/X/w3a3y8S;Z;c;dQ*R$wS*[$y*_Q*p%XQ/g*]!z:|#r$`$a$u$x)l)x*V*z*}+l+o.O/Y/[0l0o0w2i3k3s4Q4S4v5z6b6k7W7w8g8y9X9a:X:Z:]:d:f:h:l:n:r;g;hf:}:S:T:Y:[:^:e:g:i:m:o:sQ;R;_Q;S;`Q;T;aR;U;bv$zi#t%T%U%Y)u)w*P*e*f.Y/X/w3a3y8S;Z;c;d!z(h#r$`$a$u$x)l)x*V*z*}+l+o.O/Y/[0l0o0w2i3k3s4Q4S4v5z6b6k7W7w8g8y9X9a:X:Z:]:d:f:h:l:n:r;g;hg3U:S:T:Y:[:^:e:g:i:m:o:slnOXr!X#`%]&d&f&g&i,],b1b1eQ*U$xQ,k&pQ,l&rR3j/Y$Y${i#r#t$`$a$u$x%T%U%Y)l)u)w)x*P*V*e*f*z*}+l+o.O.Y/X/Y/[/w0l0o0w2i3a3k3s3y4Q4S4v5z6b6k7W7w8S8g8y9X9a:S:T:X:Y:Z:[:]:^:d:e:f:g:h:i:l:m:n:o:r:s;Z;c;d;g;hQ+n&OQ0n+pQ4g0mR6|4hT*^$y*_S*^$y*_T4o0u4pS/e*Z4mT3w/m7UQ+O%gQ/f*[Q0T+PQ0{+yQ4z0|Q7]4{Q8j7^R9Z8kn)u$s(j*q/W/o/p2o3h3}6[6m8}:{;X;Y!W:d(f)V){*T.V.s/O/]/|0k0m2n3i3m4f4h6O6P6c6g6o6q8W8[9b;e;f]:e3T6V7|8{8|9kp)w$s(j*q.|/W/o/p2o3h3}6[6m8}:{;X;Y!Y:f(f)V){*T.V.s/O/]/|0k0m2l2n3i3m4f4h6O6P6c6g6o6q8W8[9b;e;f_:g3T6V7|7}8{8|9kpmOXr!T!X#`%]&Z&d&f&g&i,],b1b1eQ&W!SR,X&apmOXr!T!X#`%]&Z&d&f&g&i,],b1b1eR&W!SQ+r&PR0j+kqmOXr!T!X#`%]&Z&d&f&g&i,],b1b1eQ0v+wS4u0y0zU7V4s4t4xS8f7X7YS9V8e8hQ9d9WR9i9eQ&_!TR,R&ZR5R1SS%oz%tR0`+[Q&d!UR,]&eR,c&jT1c,b1eR,g&kQ,f&kR1l,gQ'k!wR-c'kQrOQ#`XT%`r#`Q!zTR'm!zQ!}UR'o!}Q)n$rR.t)nQ#QVR'q#QQ#TWU'w#T'x-jQ'x#UR-j'yQ,v&zR1x,vQ.Z(jR2p.ZQ.^(lS2s.^2tR2t._Q,}'QR1|,}Y!oQ'Q,}0u4pR'[!oS#ZW%vU(O#Z(P-kQ(P#[R-k'zQ,y&}R1z,yr`OXr!T!X#`%]&Z&]&d&f&g&i,],b1b1eS#dZ%ZU#n`#d-tR-t(ZQ([#fQ-q(WW-y([-q2_5uQ2_-rR5u2`Q)`$hR.m)`Q$lhR)f$lQ$_cU)U$_-f:RQ-f9nR:R)cQ/R)|W3d/R3e6`8VU3e/S/T/US6`3f3gR8V6a#m)s$s(f(j)V){*T*l*m*q.T.U.V.s.|.}/O/W/]/o/p/|0k0m2l2m2n2o3T3h3i3m3}4f4h6O6P6T6U6V6[6c6g6m6o6q7|7}8O8W8[8{8|8}9b9k:{;X;Y;e;fQ/Z*TU3l/Z3n6dQ3n/]R6d3mQ*_$yR/i*_Q*h$}R/r*hQ4R/|R6p4RQ+i%yR0i+iQ4j0pS7O4j8dR8d7PQ+t&QR0s+tQ4p0uR7S4pQ1R,OS5P1R7aR7a5RQ0Z+WW4[0Z4^6v8`Q4^0^Q6v4]R8`6wQ+]%oR0a+]Q1e,bR5a1eWqOXr#`Q&h!XQ*u%]Q,[&dQ,^&fQ,_&gQ,a&iQ1`,]S1c,b1eR5`1bQ%_oQ&l!]Q&o!_Q&q!`Q&s!aQ'c!qQ+Q%iQ+d%uQ+j%zQ,Q&_Q,i&nW-Y']'e'f'iQ-a'aQ/h*^Q0U+RS1U,R,UQ1m,hQ1n,kQ1o,lQ2T-XW2V-[-]-`-bQ4T0VQ4a0dQ4e0kQ4y0{Q5T1WQ5_1aU5n2U2X2[Q5q2YQ6r4UQ6z4cQ6{4fQ7R4oQ7[4zQ7b5SS7q5o5sQ7s5rQ8a6xQ8i7]Q8n7cQ8u7rQ9T8bQ9Y8jQ9^8vR9f9ZQ%iwQ'U!fQ'a!qU+R%j%k%lQ,p&wU-T'V'W'XS-X']'gQ/_*XS0V+S+TQ1u,rS2R-U-VQ2Y-^Q3q/cQ4U0WQ5j1{Q5m2SQ5r2ZR6h3uS$ti;ZR*i%OU$}i%O;ZR/q*gQ$siS(f#r*}Q(j#tS)V$`$aQ){$uQ*T$xQ*l%TQ*m%UQ*q%YQ.T:XQ.U:ZQ.V:]Q.s)lQ.|)uQ.})wQ/O)xQ/W*PQ/]*VQ/o*eQ/p*fh/|*z.O0w2i4v5z7W7w8g8y9X9aQ0k+lQ0m+oQ2l:dQ2m:fQ2n:hQ2o.YS3T:S:TQ3h/XQ3i/YQ3m/[Q3}/wQ4f0lQ4h0oQ6O:lQ6P:nQ6T:YQ6U:[Q6V:^Q6[3aQ6c3kQ6g3sQ6m3yQ6o4QQ6q4SQ7|:iQ7}:eQ8O:gQ8W6bQ8[6kQ8{:mQ8|:oQ8}8SQ9b:rQ9k:sQ:{;ZQ;X;cQ;Y;dQ;e;gR;f;hloOXr!X#`%]&d&f&g&i,],b1b1eQ!dPS#bZ#kQ&n!^U'Y!l4m7UQ'p#OQ(s#xQ)d$jS,U&]&`Q,Y&aQ,h&mQ,m&uQ-P'SQ.a(qQ.q)eQ0P*{Q0g+gQ1],XQ2P-RQ2g.PQ3[.lQ3{/uQ4t0xQ5V1YQ5W1ZQ5Y1[Q5[1^Q5c1gQ5y2jQ6Y3XQ7Y4wQ7g5ZQ7i5]Q7j5^Q7y5}Q8h7ZR8p7h#UcOPXZr!X!^!l#`#k#x%]&]&`&a&d&f&g&i&m&u'S(q*{+g,X,],b-R.P/u0x1Y1Z1[1^1b1e1g2j4m4w5Z5]5^5}7U7Z7hQ#UWQ#aYQ%asQ%btQ%duS's#S'vQ'y#VQ(e#qQ(l#uQ(t#{Q(u#|Q(v#}Q(w$OQ(x$PQ(y$QQ(z$RQ({$SQ(|$TQ(}$UQ)O$VQ)Q$XQ)T$^Q)X$bW)c$j)e.l3XQ*x%cQ+^%pS,s&y1vQ-b'dS-g't-iQ-l'|Q-n(TQ.X(iQ._(mQ.c9lQ.e9oQ.f9pQ.g9qQ.v)pQ/x*sQ1q,nQ1t,qQ2U-ZQ2]-oQ2q.]Q2v9tQ2w9uQ2x9vQ2y9wQ2z9xQ2{9yQ2|9zQ2}9{Q3O9|Q3P9}Q3Q:OQ3R:PQ3S.dQ3V:UQ3W:_Q3]:QQ4O/zQ4V0XQ5i:`Q5o2WQ5t2^Q6Q2rQ6R:aQ6W:cQ6X:jQ7P4kQ7n5gQ7r5pQ7{:kQ8P:pQ8Q:qQ8v7tQ9U8cQ9]8tQ9n#OR;Q;^R#WWR&{!cY!qQ'Q,}0u4pS&w!c,uQ']!oS'g!r!uS'i!v4rS,r&x'PS-^'^'_Q-`'`Q1{,{R2Z-_R(k#tR(n#uQ!dQT,|'Q,}]!nQ!o'Q,}0u4pQ#l]R'Z9mT#gZ%ZS#fZ%ZU%y|},ZU(W#d#e#hS-r(X(YQ-v(ZQ0h+hQ2`-sU2a-t-u-wS5v2b2cR7u5w`#YW#S#V%v't'}+e-mt#cZ|}#d#e#h%Z(X(Y(Z+h-s-t-u-w2b2c5wQ1_,ZQ1r,oQ5e1jQ7m5fT:x&y+fT#]W%vS#[W%vS'u#S'}S'z#V+eS,t&y+fT-h't-mT'O!c%wQ$hfR)j$mT)_$h)`R3Z.kT*O$u*QR*W$xQ/}*zQ2e.OQ4s0wQ5{2iQ7X4vQ7x5zQ8e7WQ8w7wQ9W8gQ9`8yQ9e9XR9h9alpOXr!X#`%]&d&f&g&i,],b1b1eQ&^!TR,Q&ZV%z|},ZR0q+qR,P&XQ%szR+c%tR+X%nT&b!U&eT&c!U&eT1d,b1e",
  nodeNames: "⚠ ArithOp ArithOp LineComment BlockComment Script ExportDeclaration export Star as VariableName String Escape from ; default FunctionDeclaration async function VariableDefinition > TypeParamList TypeDefinition extends ThisType this LiteralType ArithOp Number BooleanLiteral TemplateType InterpolationEnd Interpolation InterpolationStart NullType null VoidType void TypeofType typeof MemberExpression . ?. PropertyName [ TemplateString Escape Interpolation super RegExp ] ArrayExpression Spread , } { ObjectExpression Property async get set PropertyDefinition Block : NewExpression new TypeArgList CompareOp < ) ( ArgList UnaryExpression delete LogicOp BitOp YieldExpression yield AwaitExpression await ParenthesizedExpression ClassExpression class ClassBody MethodDeclaration Decorator @ MemberExpression PrivatePropertyName CallExpression declare Privacy static abstract override PrivatePropertyDefinition PropertyDeclaration readonly accessor Optional TypeAnnotation Equals StaticBlock FunctionExpression ArrowFunction ParamList ParamList ArrayPattern ObjectPattern PatternProperty Privacy readonly Arrow MemberExpression BinaryExpression ArithOp ArithOp ArithOp ArithOp BitOp CompareOp instanceof satisfies in const CompareOp BitOp BitOp BitOp LogicOp LogicOp ConditionalExpression LogicOp LogicOp AssignmentExpression UpdateOp PostfixExpression CallExpression TaggedTemplateExpression DynamicImport import ImportMeta JSXElement JSXSelfCloseEndTag JSXStartTag JSXSelfClosingTag JSXIdentifier JSXBuiltin JSXIdentifier JSXNamespacedName JSXMemberExpression JSXSpreadAttribute JSXAttribute JSXAttributeValue JSXEscape JSXEndTag JSXOpenTag JSXFragmentTag JSXText JSXEscape JSXStartCloseTag JSXCloseTag PrefixCast ArrowFunction TypeParamList SequenceExpression KeyofType keyof UniqueType unique ImportType InferredType infer TypeName ParenthesizedType FunctionSignature ParamList NewSignature IndexedType TupleType Label ArrayType ReadonlyType ObjectType MethodType PropertyType IndexSignature PropertyDefinition CallSignature TypePredicate is NewSignature new UnionType LogicOp IntersectionType LogicOp ConditionalType ParameterizedType ClassDeclaration abstract implements type VariableDeclaration let var TypeAliasDeclaration InterfaceDeclaration interface EnumDeclaration enum EnumBody NamespaceDeclaration namespace module AmbientDeclaration declare GlobalDeclaration global ClassDeclaration ClassBody AmbientFunctionDeclaration ExportGroup VariableName VariableName ImportDeclaration ImportGroup ForStatement for ForSpec ForInSpec ForOfSpec of WhileStatement while WithStatement with DoStatement do IfStatement if else SwitchStatement switch SwitchBody CaseLabel case DefaultLabel TryStatement try CatchClause catch FinallyClause finally ReturnStatement return ThrowStatement throw BreakStatement break ContinueStatement continue DebuggerStatement debugger LabeledStatement ExpressionStatement SingleExpression SingleClassItem",
  maxTerm: 364,
  context: trackNewline,
  nodeProps: [["group", -26, 6, 14, 16, 62, 199, 203, 206, 207, 209, 212, 215, 225, 227, 233, 235, 237, 239, 242, 248, 254, 256, 258, 260, 262, 264, 265, "Statement", -32, 10, 11, 25, 28, 29, 35, 45, 48, 49, 51, 56, 64, 72, 76, 78, 80, 81, 103, 104, 113, 114, 131, 134, 136, 137, 138, 139, 141, 142, 162, 163, 165, "Expression", -23, 24, 26, 30, 34, 36, 38, 166, 168, 170, 171, 173, 174, 175, 177, 178, 179, 181, 182, 183, 193, 195, 197, 198, "Type", -3, 84, 96, 102, "ClassItem"], ["openedBy", 31, "InterpolationStart", 50, "[", 54, "{", 69, "(", 143, "JSXStartTag", 155, "JSXStartTag JSXStartCloseTag"], ["closedBy", 33, "InterpolationEnd", 44, "]", 55, "}", 70, ")", 144, "JSXSelfCloseEndTag JSXEndTag", 160, "JSXEndTag"]],
  propSources: [jsHighlight],
  skippedNodes: [0, 3, 4, 268],
  repeatNodeCount: 33,
  tokenData: "$>y(CSR!bOX%ZXY+gYZ-yZ[+g[]%Z]^.c^p%Zpq+gqr/mrs3cst:_tu>PuvBavwDxwxGgxyMvyz! Qz{!![{|!%O|}!&]}!O!%O!O!P!'g!P!Q!1w!Q!R#0t!R![#3T![!]#@T!]!^#Aa!^!_#Bk!_!`#GS!`!a#In!a!b#N{!b!c$$z!c!}>P!}#O$&U#O#P$'`#P#Q$,w#Q#R$.R#R#S>P#S#T$/`#T#o$0j#o#p$4z#p#q$5p#q#r$7Q#r#s$8^#s$f%Z$f$g+g$g#BY>P#BY#BZ$9h#BZ$IS>P$IS$I_$9h$I_$I|>P$I|$I}$<s$I}$JO$<s$JO$JT>P$JT$JU$9h$JU$KV>P$KV$KW$9h$KW&FU>P&FU&FV$9h&FV;'S>P;'S;=`BZ<%l?HT>P?HT?HU$9h?HUO>P(n%d_$d&j'wp'z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z&j&hT$d&jO!^&c!_#o&c#p;'S&c;'S;=`&w<%lO&c&j&zP;=`<%l&c'|'U]$d&j'z!bOY&}YZ&cZw&}wx&cx!^&}!^!_'}!_#O&}#O#P&c#P#o&}#o#p'}#p;'S&};'S;=`(l<%lO&}!b(SU'z!bOY'}Zw'}x#O'}#P;'S'};'S;=`(f<%lO'}!b(iP;=`<%l'}'|(oP;=`<%l&}'[(y]$d&j'wpOY(rYZ&cZr(rrs&cs!^(r!^!_)r!_#O(r#O#P&c#P#o(r#o#p)r#p;'S(r;'S;=`*a<%lO(rp)wU'wpOY)rZr)rs#O)r#P;'S)r;'S;=`*Z<%lO)rp*^P;=`<%l)r'[*dP;=`<%l(r#S*nX'wp'z!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g#S+^P;=`<%l*g(n+dP;=`<%l%Z(CS+rq$d&j'wp'z!b'm(;dOX%ZXY+gYZ&cZ[+g[p%Zpq+gqr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p$f%Z$f$g+g$g#BY%Z#BY#BZ+g#BZ$IS%Z$IS$I_+g$I_$JT%Z$JT$JU+g$JU$KV%Z$KV$KW+g$KW&FU%Z&FU&FV+g&FV;'S%Z;'S;=`+a<%l?HT%Z?HT?HU+g?HUO%Z(CS.ST'x#S$d&j'n(;dO!^&c!_#o&c#p;'S&c;'S;=`&w<%lO&c(CS.n_$d&j'wp'z!b'n(;dOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#`/x`$d&j!l$Ip'wp'z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`0z!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#S1V`#q$Id$d&j'wp'z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`2X!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#S2d_#q$Id$d&j'wp'z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$2b3l_'v$(n$d&j'z!bOY4kYZ5qZr4krs7nsw4kwx5qx!^4k!^!_8p!_#O4k#O#P5q#P#o4k#o#p8p#p;'S4k;'S;=`:X<%lO4k*r4r_$d&j'z!bOY4kYZ5qZr4krs7nsw4kwx5qx!^4k!^!_8p!_#O4k#O#P5q#P#o4k#o#p8p#p;'S4k;'S;=`:X<%lO4k)`5vX$d&jOr5qrs6cs!^5q!^!_6y!_#o5q#o#p6y#p;'S5q;'S;=`7h<%lO5q)`6jT$_#t$d&jO!^&c!_#o&c#p;'S&c;'S;=`&w<%lO&c#t6|TOr6yrs7]s;'S6y;'S;=`7b<%lO6y#t7bO$_#t#t7eP;=`<%l6y)`7kP;=`<%l5q*r7w]$_#t$d&j'z!bOY&}YZ&cZw&}wx&cx!^&}!^!_'}!_#O&}#O#P&c#P#o&}#o#p'}#p;'S&};'S;=`(l<%lO&}%W8uZ'z!bOY8pYZ6yZr8prs9hsw8pwx6yx#O8p#O#P6y#P;'S8p;'S;=`:R<%lO8p%W9oU$_#t'z!bOY'}Zw'}x#O'}#P;'S'};'S;=`(f<%lO'}%W:UP;=`<%l8p*r:[P;=`<%l4k#%|:hg$d&j'wp'z!bOY%ZYZ&cZr%Zrs&}st%Ztu<Puw%Zwx(rx!^%Z!^!_*g!_!c%Z!c!}<P!}#O%Z#O#P&c#P#R%Z#R#S<P#S#T%Z#T#o<P#o#p*g#p$g%Z$g;'S<P;'S;=`=y<%lO<P#%|<[i$d&j(a!L^'wp'z!bOY%ZYZ&cZr%Zrs&}st%Ztu<Puw%Zwx(rx!Q%Z!Q![<P![!^%Z!^!_*g!_!c%Z!c!}<P!}#O%Z#O#P&c#P#R%Z#R#S<P#S#T%Z#T#o<P#o#p*g#p$g%Z$g;'S<P;'S;=`=y<%lO<P#%|=|P;=`<%l<P(CS>`k$d&j'wp'z!b(U!LY't&;d$W#tOY%ZYZ&cZr%Zrs&}st%Ztu>Puw%Zwx(rx}%Z}!O@T!O!Q%Z!Q![>P![!^%Z!^!_*g!_!c%Z!c!}>P!}#O%Z#O#P&c#P#R%Z#R#S>P#S#T%Z#T#o>P#o#p*g#p$g%Z$g;'S>P;'S;=`BZ<%lO>P+d@`k$d&j'wp'z!b$W#tOY%ZYZ&cZr%Zrs&}st%Ztu@Tuw%Zwx(rx}%Z}!O@T!O!Q%Z!Q![@T![!^%Z!^!_*g!_!c%Z!c!}@T!}#O%Z#O#P&c#P#R%Z#R#S@T#S#T%Z#T#o@T#o#p*g#p$g%Z$g;'S@T;'S;=`BT<%lO@T+dBWP;=`<%l@T(CSB^P;=`<%l>P%#SBl`$d&j'wp'z!b#i$IdOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Cn!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#SCy_$d&j#{$Id'wp'z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%DfETa(j%<v$d&j'wp'z!bOY%ZYZ&cZr%Zrs&}sv%ZvwFYwx(rx!^%Z!^!_*g!_!`Cn!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#SFe`$d&j#u$Id'wp'z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Cn!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$2bGp_'y$)`$d&j'wpOYHoYZIuZrHorsIuswHowxKVx!^Ho!^!_LX!_#OHo#O#PIu#P#oHo#o#pLX#p;'SHo;'S;=`Mp<%lOHo*QHv_$d&j'wpOYHoYZIuZrHorsIuswHowxKVx!^Ho!^!_LX!_#OHo#O#PIu#P#oHo#o#pLX#p;'SHo;'S;=`Mp<%lOHo)`IzX$d&jOwIuwx6cx!^Iu!^!_Jg!_#oIu#o#pJg#p;'SIu;'S;=`KP<%lOIu#tJjTOwJgwx7]x;'SJg;'S;=`Jy<%lOJg#tJ|P;=`<%lJg)`KSP;=`<%lIu*QK`]$_#t$d&j'wpOY(rYZ&cZr(rrs&cs!^(r!^!_)r!_#O(r#O#P&c#P#o(r#o#p)r#p;'S(r;'S;=`*a<%lO(r$fL^Z'wpOYLXYZJgZrLXrsJgswLXwxMPx#OLX#O#PJg#P;'SLX;'S;=`Mj<%lOLX$fMWU$_#t'wpOY)rZr)rs#O)r#P;'S)r;'S;=`*Z<%lO)r$fMmP;=`<%lLX*QMsP;=`<%lHo(*QNR_!h(!b$d&j'wp'z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z!'l! ]_!gM|$d&j'wp'z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'+h!!ib$d&j'wp'z!b'u#)d#j$IdOY%ZYZ&cZr%Zrs&}sw%Zwx(rxz%Zz{!#q{!^%Z!^!_*g!_!`Cn!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#S!#|`$d&j'wp'z!b#g$IdOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Cn!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z&-O!%Z`$d&j'wp'z!bk&%`OY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Cn!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z&C[!&h_!V&;l$d&j'wp'z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(CS!'rc$d&j'wp'z!by'<nOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!O%Z!O!P!(}!P!Q%Z!Q![!+g![!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z!'d!)Wa$d&j'wp'z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!O%Z!O!P!*]!P!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z!'d!*h_!UMt$d&j'wp'z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$/l!+rg$d&j'wp'z!bl$'|OY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![!+g![!^%Z!^!_*g!_!g%Z!g!h!-Z!h#O%Z#O#P&c#P#R%Z#R#S!+g#S#X%Z#X#Y!-Z#Y#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$/l!-dg$d&j'wp'z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx{%Z{|!.{|}%Z}!O!.{!O!Q%Z!Q![!0a![!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S!0a#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$/l!/Uc$d&j'wp'z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![!0a![!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S!0a#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$/l!0lc$d&j'wp'z!bl$'|OY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![!0a![!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S!0a#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(CS!2Sf$d&j'wp'z!b#h$IdOY!3hYZ&cZr!3hrs!4{sw!3hwx!C}xz!3hz{#$s{!P!3h!P!Q#&Y!Q!^!3h!^!_!Mh!_!`#-x!`!a#/_!a!}!3h!}#O##[#O#P!<w#P#o!3h#o#p!Mh#p;'S!3h;'S;=`#$m<%lO!3h(r!3sb$d&j'wp'z!b!RSOY!3hYZ&cZr!3hrs!4{sw!3hwx!C}x!P!3h!P!Q!Kh!Q!^!3h!^!_!Mh!_!}!3h!}#O##[#O#P!<w#P#o!3h#o#p!Mh#p;'S!3h;'S;=`#$m<%lO!3h(Q!5U`$d&j'z!b!RSOY!4{YZ&cZw!4{wx!6Wx!P!4{!P!Q!=o!Q!^!4{!^!_!?g!_!}!4{!}#O!Bn#O#P!<w#P#o!4{#o#p!?g#p;'S!4{;'S;=`!Cw<%lO!4{&n!6_^$d&j!RSOY!6WYZ&cZ!P!6W!P!Q!7Z!Q!^!6W!^!_!8g!_!}!6W!}#O!;U#O#P!<w#P#o!6W#o#p!8g#p;'S!6W;'S;=`!=i<%lO!6W&n!7ba$d&j!RSO!^&c!_#Z&c#Z#[!7Z#[#]&c#]#^!7Z#^#a&c#a#b!7Z#b#g&c#g#h!7Z#h#i&c#i#j!7Z#j#m&c#m#n!7Z#n#o&c#p;'S&c;'S;=`&w<%lO&cS!8lX!RSOY!8gZ!P!8g!P!Q!9X!Q!}!8g!}#O!9p#O#P!:o#P;'S!8g;'S;=`!;O<%lO!8gS!9^U!RS#Z#[!9X#]#^!9X#a#b!9X#g#h!9X#i#j!9X#m#n!9XS!9sVOY!9pZ#O!9p#O#P!:Y#P#Q!8g#Q;'S!9p;'S;=`!:i<%lO!9pS!:]SOY!9pZ;'S!9p;'S;=`!:i<%lO!9pS!:lP;=`<%l!9pS!:rSOY!8gZ;'S!8g;'S;=`!;O<%lO!8gS!;RP;=`<%l!8g&n!;Z[$d&jOY!;UYZ&cZ!^!;U!^!_!9p!_#O!;U#O#P!<P#P#Q!6W#Q#o!;U#o#p!9p#p;'S!;U;'S;=`!<q<%lO!;U&n!<UX$d&jOY!;UYZ&cZ!^!;U!^!_!9p!_#o!;U#o#p!9p#p;'S!;U;'S;=`!<q<%lO!;U&n!<tP;=`<%l!;U&n!<|X$d&jOY!6WYZ&cZ!^!6W!^!_!8g!_#o!6W#o#p!8g#p;'S!6W;'S;=`!=i<%lO!6W&n!=lP;=`<%l!6W(Q!=xi$d&j'z!b!RSOY&}YZ&cZw&}wx&cx!^&}!^!_'}!_#O&}#O#P&c#P#Z&}#Z#[!=o#[#]&}#]#^!=o#^#a&}#a#b!=o#b#g&}#g#h!=o#h#i&}#i#j!=o#j#m&}#m#n!=o#n#o&}#o#p'}#p;'S&};'S;=`(l<%lO&}!f!?nZ'z!b!RSOY!?gZw!?gwx!8gx!P!?g!P!Q!@a!Q!}!?g!}#O!Ap#O#P!:o#P;'S!?g;'S;=`!Bh<%lO!?g!f!@hb'z!b!RSOY'}Zw'}x#O'}#P#Z'}#Z#[!@a#[#]'}#]#^!@a#^#a'}#a#b!@a#b#g'}#g#h!@a#h#i'}#i#j!@a#j#m'}#m#n!@a#n;'S'};'S;=`(f<%lO'}!f!AuX'z!bOY!ApZw!Apwx!9px#O!Ap#O#P!:Y#P#Q!?g#Q;'S!Ap;'S;=`!Bb<%lO!Ap!f!BeP;=`<%l!Ap!f!BkP;=`<%l!?g(Q!Bu^$d&j'z!bOY!BnYZ&cZw!Bnwx!;Ux!^!Bn!^!_!Ap!_#O!Bn#O#P!<P#P#Q!4{#Q#o!Bn#o#p!Ap#p;'S!Bn;'S;=`!Cq<%lO!Bn(Q!CtP;=`<%l!Bn(Q!CzP;=`<%l!4{'`!DW`$d&j'wp!RSOY!C}YZ&cZr!C}rs!6Ws!P!C}!P!Q!EY!Q!^!C}!^!_!GQ!_!}!C}!}#O!JX#O#P!<w#P#o!C}#o#p!GQ#p;'S!C};'S;=`!Kb<%lO!C}'`!Eci$d&j'wp!RSOY(rYZ&cZr(rrs&cs!^(r!^!_)r!_#O(r#O#P&c#P#Z(r#Z#[!EY#[#](r#]#^!EY#^#a(r#a#b!EY#b#g(r#g#h!EY#h#i(r#i#j!EY#j#m(r#m#n!EY#n#o(r#o#p)r#p;'S(r;'S;=`*a<%lO(rt!GXZ'wp!RSOY!GQZr!GQrs!8gs!P!GQ!P!Q!Gz!Q!}!GQ!}#O!IZ#O#P!:o#P;'S!GQ;'S;=`!JR<%lO!GQt!HRb'wp!RSOY)rZr)rs#O)r#P#Z)r#Z#[!Gz#[#])r#]#^!Gz#^#a)r#a#b!Gz#b#g)r#g#h!Gz#h#i)r#i#j!Gz#j#m)r#m#n!Gz#n;'S)r;'S;=`*Z<%lO)rt!I`X'wpOY!IZZr!IZrs!9ps#O!IZ#O#P!:Y#P#Q!GQ#Q;'S!IZ;'S;=`!I{<%lO!IZt!JOP;=`<%l!IZt!JUP;=`<%l!GQ'`!J`^$d&j'wpOY!JXYZ&cZr!JXrs!;Us!^!JX!^!_!IZ!_#O!JX#O#P!<P#P#Q!C}#Q#o!JX#o#p!IZ#p;'S!JX;'S;=`!K[<%lO!JX'`!K_P;=`<%l!JX'`!KeP;=`<%l!C}(r!Ksk$d&j'wp'z!b!RSOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#Z%Z#Z#[!Kh#[#]%Z#]#^!Kh#^#a%Z#a#b!Kh#b#g%Z#g#h!Kh#h#i%Z#i#j!Kh#j#m%Z#m#n!Kh#n#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z#W!Mq]'wp'z!b!RSOY!MhZr!Mhrs!?gsw!Mhwx!GQx!P!Mh!P!Q!Nj!Q!}!Mh!}#O#!U#O#P!:o#P;'S!Mh;'S;=`##U<%lO!Mh#W!Nse'wp'z!b!RSOY*gZr*grs'}sw*gwx)rx#O*g#P#Z*g#Z#[!Nj#[#]*g#]#^!Nj#^#a*g#a#b!Nj#b#g*g#g#h!Nj#h#i*g#i#j!Nj#j#m*g#m#n!Nj#n;'S*g;'S;=`+Z<%lO*g#W#!]Z'wp'z!bOY#!UZr#!Urs!Apsw#!Uwx!IZx#O#!U#O#P!:Y#P#Q!Mh#Q;'S#!U;'S;=`##O<%lO#!U#W##RP;=`<%l#!U#W##XP;=`<%l!Mh(r##e`$d&j'wp'z!bOY##[YZ&cZr##[rs!Bnsw##[wx!JXx!^##[!^!_#!U!_#O##[#O#P!<P#P#Q!3h#Q#o##[#o#p#!U#p;'S##[;'S;=`#$g<%lO##[(r#$jP;=`<%l##[(r#$pP;=`<%l!3h(CS#%Qb$d&j'wp'z!b'o(;d!RSOY!3hYZ&cZr!3hrs!4{sw!3hwx!C}x!P!3h!P!Q!Kh!Q!^!3h!^!_!Mh!_!}!3h!}#O##[#O#P!<w#P#o!3h#o#p!Mh#p;'S!3h;'S;=`#$m<%lO!3h(CS#&e_$d&j'wp'z!bR(;dOY#&YYZ&cZr#&Yrs#'dsw#&Ywx#*tx!^#&Y!^!_#,s!_#O#&Y#O#P#(f#P#o#&Y#o#p#,s#p;'S#&Y;'S;=`#-r<%lO#&Y(Bb#'m]$d&j'z!bR(;dOY#'dYZ&cZw#'dwx#(fx!^#'d!^!_#)w!_#O#'d#O#P#(f#P#o#'d#o#p#)w#p;'S#'d;'S;=`#*n<%lO#'d(AO#(mX$d&jR(;dOY#(fYZ&cZ!^#(f!^!_#)Y!_#o#(f#o#p#)Y#p;'S#(f;'S;=`#)q<%lO#(f(;d#)_SR(;dOY#)YZ;'S#)Y;'S;=`#)k<%lO#)Y(;d#)nP;=`<%l#)Y(AO#)tP;=`<%l#(f(<v#*OW'z!bR(;dOY#)wZw#)wwx#)Yx#O#)w#O#P#)Y#P;'S#)w;'S;=`#*h<%lO#)w(<v#*kP;=`<%l#)w(Bb#*qP;=`<%l#'d(Ap#*}]$d&j'wpR(;dOY#*tYZ&cZr#*trs#(fs!^#*t!^!_#+v!_#O#*t#O#P#(f#P#o#*t#o#p#+v#p;'S#*t;'S;=`#,m<%lO#*t(<U#+}W'wpR(;dOY#+vZr#+vrs#)Ys#O#+v#O#P#)Y#P;'S#+v;'S;=`#,g<%lO#+v(<U#,jP;=`<%l#+v(Ap#,pP;=`<%l#*t(=h#,|Y'wp'z!bR(;dOY#,sZr#,srs#)wsw#,swx#+vx#O#,s#O#P#)Y#P;'S#,s;'S;=`#-l<%lO#,s(=h#-oP;=`<%l#,s(CS#-uP;=`<%l#&Y%#W#.Vb$d&j#{$Id'wp'z!b!RSOY!3hYZ&cZr!3hrs!4{sw!3hwx!C}x!P!3h!P!Q!Kh!Q!^!3h!^!_!Mh!_!}!3h!}#O##[#O#P!<w#P#o!3h#o#p!Mh#p;'S!3h;'S;=`#$m<%lO!3h+h#/lb$T#t$d&j'wp'z!b!RSOY!3hYZ&cZr!3hrs!4{sw!3hwx!C}x!P!3h!P!Q!Kh!Q!^!3h!^!_!Mh!_!}!3h!}#O##[#O#P!<w#P#o!3h#o#p!Mh#p;'S!3h;'S;=`#$m<%lO!3h$/l#1Pp$d&j'wp'z!bl$'|OY%ZYZ&cZr%Zrs&}sw%Zwx(rx!O%Z!O!P!+g!P!Q%Z!Q![#3T![!^%Z!^!_*g!_!g%Z!g!h!-Z!h#O%Z#O#P&c#P#R%Z#R#S#3T#S#U%Z#U#V#6_#V#X%Z#X#Y!-Z#Y#b%Z#b#c#5T#c#d#9g#d#l%Z#l#m#<i#m#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$/l#3`k$d&j'wp'z!bl$'|OY%ZYZ&cZr%Zrs&}sw%Zwx(rx!O%Z!O!P!+g!P!Q%Z!Q![#3T![!^%Z!^!_*g!_!g%Z!g!h!-Z!h#O%Z#O#P&c#P#R%Z#R#S#3T#S#X%Z#X#Y!-Z#Y#b%Z#b#c#5T#c#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$/l#5`_$d&j'wp'z!bl$'|OY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$/l#6hd$d&j'wp'z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q!R#7v!R!S#7v!S!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S#7v#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$/l#8Rf$d&j'wp'z!bl$'|OY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q!R#7v!R!S#7v!S!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S#7v#S#b%Z#b#c#5T#c#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$/l#9pc$d&j'wp'z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q!Y#:{!Y!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S#:{#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$/l#;We$d&j'wp'z!bl$'|OY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q!Y#:{!Y!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S#:{#S#b%Z#b#c#5T#c#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$/l#<rg$d&j'wp'z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![#>Z![!^%Z!^!_*g!_!c%Z!c!i#>Z!i#O%Z#O#P&c#P#R%Z#R#S#>Z#S#T%Z#T#Z#>Z#Z#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$/l#>fi$d&j'wp'z!bl$'|OY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![#>Z![!^%Z!^!_*g!_!c%Z!c!i#>Z!i#O%Z#O#P&c#P#R%Z#R#S#>Z#S#T%Z#T#Z#>Z#Z#b%Z#b#c#5T#c#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%Gh#@b_!a$b$d&j#y%<f'wp'z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z)[#Al_^l$d&j'wp'z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(CS#Bz^'}!*v!e'.r'wp'z!b$U)d(nSOY*gZr*grs'}sw*gwx)rx!P*g!P!Q#Cv!Q!^*g!^!_#Dl!_!`#F^!`#O*g#P;'S*g;'S;=`+Z<%lO*g(n#DPX$f&j'wp'z!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g$Kh#DuZ#k$Id'wp'z!bOY*gZr*grs'}sw*gwx)rx!_*g!_!`#Eh!`#O*g#P;'S*g;'S;=`+Z<%lO*g$Kh#EqX#{$Id'wp'z!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g$Kh#FgX#l$Id'wp'z!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g%Gh#G_a#X%?x$d&j'wp'z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`0z!`!a#Hd!a#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#W#Ho_#d$Ih$d&j'wp'z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%Gh#I}adBf#l$Id$a#|$d&j'wp'z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`#KS!`!a#L^!a#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#S#K__#l$Id$d&j'wp'z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#S#Lia#k$Id$d&j'wp'z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Cn!`!a#Mn!a#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#S#My`#k$Id$d&j'wp'z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Cn!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'+h$ Wc(b$Ip$d&j'wp'z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!O%Z!O!P$!c!P!^%Z!^!_*g!_!a%Z!a!b$#m!b#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'+`$!n_z'#p$d&j'wp'z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#S$#x`$d&j#v$Id'wp'z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Cn!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z#&^$%V_!x!Ln$d&j'wp'z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(@^$&a_|(8n$d&j'wp'z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(n$'eZ$d&jO!^$(W!^!_$(n!_#i$(W#i#j$(s#j#l$(W#l#m$*f#m#o$(W#o#p$(n#p;'S$(W;'S;=`$,q<%lO$(W(n$(_T[#S$d&jO!^&c!_#o&c#p;'S&c;'S;=`&w<%lO&c#S$(sO[#S(n$(x[$d&jO!Q&c!Q![$)n![!^&c!_!c&c!c!i$)n!i#T&c#T#Z$)n#Z#o&c#o#p$,U#p;'S&c;'S;=`&w<%lO&c(n$)sZ$d&jO!Q&c!Q![$*f![!^&c!_!c&c!c!i$*f!i#T&c#T#Z$*f#Z#o&c#p;'S&c;'S;=`&w<%lO&c(n$*kZ$d&jO!Q&c!Q![$+^![!^&c!_!c&c!c!i$+^!i#T&c#T#Z$+^#Z#o&c#p;'S&c;'S;=`&w<%lO&c(n$+cZ$d&jO!Q&c!Q![$(W![!^&c!_!c&c!c!i$(W!i#T&c#T#Z$(W#Z#o&c#p;'S&c;'S;=`&w<%lO&c#S$,XR!Q![$,b!c!i$,b#T#Z$,b#S$,eS!Q![$,b!c!i$,b#T#Z$,b#q#r$(n(n$,tP;=`<%l$(W!'l$-S_!SM|$d&j'wp'z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#S$.^`#s$Id$d&j'wp'z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Cn!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z&,v$/k_$d&j'wp'z!b(R&%WOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(CS$0yk$d&j'wp'z!b(U!LY't&;d$Y#tOY%ZYZ&cZr%Zrs&}st%Ztu$0juw%Zwx(rx}%Z}!O$2n!O!Q%Z!Q![$0j![!^%Z!^!_*g!_!c%Z!c!}$0j!}#O%Z#O#P&c#P#R%Z#R#S$0j#S#T%Z#T#o$0j#o#p*g#p$g%Z$g;'S$0j;'S;=`$4t<%lO$0j+d$2yk$d&j'wp'z!b$Y#tOY%ZYZ&cZr%Zrs&}st%Ztu$2nuw%Zwx(rx}%Z}!O$2n!O!Q%Z!Q![$2n![!^%Z!^!_*g!_!c%Z!c!}$2n!}#O%Z#O#P&c#P#R%Z#R#S$2n#S#T%Z#T#o$2n#o#p*g#p$g%Z$g;'S$2n;'S;=`$4n<%lO$2n+d$4qP;=`<%l$2n(CS$4wP;=`<%l$0j!5p$5TX!X!3l'wp'z!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g%Df$5{a(i%<v$d&j'wp'z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Cn!`#O%Z#O#P&c#P#o%Z#o#p*g#p#q$#m#q;'S%Z;'S;=`+a<%lO%Z%#`$7__!W$I`o`$d&j'wp'z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(r$8i_!mS$d&j'wp'z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(CS$9y|$d&j'wp'z!b'm(;d(U!LY't&;d$W#tOX%ZXY+gYZ&cZ[+g[p%Zpq+gqr%Zrs&}st%Ztu>Puw%Zwx(rx}%Z}!O@T!O!Q%Z!Q![>P![!^%Z!^!_*g!_!c%Z!c!}>P!}#O%Z#O#P&c#P#R%Z#R#S>P#S#T%Z#T#o>P#o#p*g#p$f%Z$f$g+g$g#BY>P#BY#BZ$9h#BZ$IS>P$IS$I_$9h$I_$JT>P$JT$JU$9h$JU$KV>P$KV$KW$9h$KW&FU>P&FU&FV$9h&FV;'S>P;'S;=`BZ<%l?HT>P?HT?HU$9h?HUO>P(CS$=Uk$d&j'wp'z!b'n(;d(U!LY't&;d$W#tOY%ZYZ&cZr%Zrs&}st%Ztu>Puw%Zwx(rx}%Z}!O@T!O!Q%Z!Q![>P![!^%Z!^!_*g!_!c%Z!c!}>P!}#O%Z#O#P&c#P#R%Z#R#S>P#S#T%Z#T#o>P#o#p*g#p$g%Z$g;'S>P;'S;=`BZ<%lO>P",
  tokenizers: [noSemicolon, incdecToken, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, insertSemicolon, new LocalTokenGroup("$S~RRtu[#O#Pg#S#T#|~_P#o#pb~gOq~~jVO#i!P#i#j!U#j#l!P#l#m!q#m;'S!P;'S;=`#v<%lO!P~!UO!O~~!XS!Q![!e!c!i!e#T#Z!e#o#p#Z~!hR!Q![!q!c!i!q#T#Z!q~!tR!Q![!}!c!i!}#T#Z!}~#QR!Q![!P!c!i!P#T#Z!P~#^R!Q![#g!c!i#g#T#Z#g~#jS!Q![#g!c!i#g#T#Z#g#q#r!P~#yP;=`<%l!P~$RO(T~~", 141, 326), new LocalTokenGroup("j~RQYZXz{^~^O'q~~aP!P!Qd~iO'r~~", 25, 308)],
  topRules: {
    "Script": [0, 5],
    "SingleExpression": [1, 266],
    "SingleClassItem": [2, 267]
  },
  dialects: {
    jsx: 12686,
    ts: 12688
  },
  dynamicPrecedences: {
    "76": 1,
    "78": 1,
    "163": 1,
    "191": 1
  },
  specialized: [{
    term: 312,
    get: function get(value) {
      return spec_identifier[value] || -1;
    }
  }, {
    term: 328,
    get: function get(value) {
      return spec_word[value] || -1;
    }
  }, {
    term: 67,
    get: function get(value) {
      return spec_LessThan[value] || -1;
    }
  }],
  tokenPrec: 12712
});

/**
A collection of JavaScript-related
[snippets](https://codemirror.net/6/docs/ref/#autocomplete.snippet).
*/
var snippets = [/*@__PURE__*/snippetCompletion("function ${name}(${params}) {\n\t${}\n}", {
  label: "function",
  detail: "definition",
  type: "keyword"
}), /*@__PURE__*/snippetCompletion("for (let ${index} = 0; ${index} < ${bound}; ${index}++) {\n\t${}\n}", {
  label: "for",
  detail: "loop",
  type: "keyword"
}), /*@__PURE__*/snippetCompletion("for (let ${name} of ${collection}) {\n\t${}\n}", {
  label: "for",
  detail: "of loop",
  type: "keyword"
}), /*@__PURE__*/snippetCompletion("do {\n\t${}\n} while (${})", {
  label: "do",
  detail: "loop",
  type: "keyword"
}), /*@__PURE__*/snippetCompletion("while (${}) {\n\t${}\n}", {
  label: "while",
  detail: "loop",
  type: "keyword"
}), /*@__PURE__*/snippetCompletion("try {\n\t${}\n} catch (${error}) {\n\t${}\n}", {
  label: "try",
  detail: "/ catch block",
  type: "keyword"
}), /*@__PURE__*/snippetCompletion("if (${}) {\n\t${}\n}", {
  label: "if",
  detail: "block",
  type: "keyword"
}), /*@__PURE__*/snippetCompletion("if (${}) {\n\t${}\n} else {\n\t${}\n}", {
  label: "if",
  detail: "/ else block",
  type: "keyword"
}), /*@__PURE__*/snippetCompletion("class ${name} {\n\tconstructor(${params}) {\n\t\t${}\n\t}\n}", {
  label: "class",
  detail: "definition",
  type: "keyword"
}), /*@__PURE__*/snippetCompletion("import {${names}} from \"${module}\"\n${}", {
  label: "import",
  detail: "named",
  type: "keyword"
}), /*@__PURE__*/snippetCompletion("import ${name} from \"${module}\"\n${}", {
  label: "import",
  detail: "default",
  type: "keyword"
})];
var cache = /*@__PURE__*/new NodeWeakMap();
var ScopeNodes = /*@__PURE__*/new Set(["Script", "Block", "FunctionExpression", "FunctionDeclaration", "ArrowFunction", "MethodDeclaration", "ForStatement"]);
function defID(type) {
  return function (node, def) {
    var id = node.node.getChild("VariableDefinition");
    if (id) def(id, type);
    return true;
  };
}
var functionContext = ["FunctionDeclaration"];
var gatherCompletions = {
  FunctionDeclaration: /*@__PURE__*/defID("function"),
  ClassDeclaration: /*@__PURE__*/defID("class"),
  ClassExpression: function ClassExpression() {
    return true;
  },
  EnumDeclaration: /*@__PURE__*/defID("constant"),
  TypeAliasDeclaration: /*@__PURE__*/defID("type"),
  NamespaceDeclaration: /*@__PURE__*/defID("namespace"),
  VariableDefinition: function VariableDefinition(node, def) {
    if (!node.matchContext(functionContext)) def(node, "variable");
  },
  TypeDefinition: function TypeDefinition(node, def) {
    def(node, "type");
  },
  __proto__: null
};
function getScope(doc, node) {
  var cached = cache.get(node);
  if (cached) return cached;
  var completions = [],
    top = true;
  function def(node, type) {
    var name = doc.sliceString(node.from, node.to);
    completions.push({
      label: name,
      type: type
    });
  }
  node.cursor(IterMode.IncludeAnonymous).iterate(function (node) {
    if (top) {
      top = false;
    } else if (node.name) {
      var gather = gatherCompletions[node.name];
      if (gather && gather(node, def) || ScopeNodes.has(node.name)) return false;
    } else if (node.to - node.from > 8192) {
      // Allow caching for bigger internal nodes
      var _iterator = _createForOfIteratorHelper(getScope(doc, node.node)),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var c = _step.value;
          completions.push(c);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return false;
    }
  });
  cache.set(node, completions);
  return completions;
}
var Identifier = /^[\w$\xa1-\uffff][\w$\d\xa1-\uffff]*$/;
var dontComplete = ["TemplateString", "String", "RegExp", "LineComment", "BlockComment", "VariableDefinition", "TypeDefinition", "Label", "PropertyDefinition", "PropertyName", "PrivatePropertyDefinition", "PrivatePropertyName", ".", "?."];
/**
Completion source that looks up locally defined names in
JavaScript code.
*/
function localCompletionSource(context) {
  var inner = syntaxTree(context.state).resolveInner(context.pos, -1);
  if (dontComplete.indexOf(inner.name) > -1) return null;
  var isWord = inner.name == "VariableName" || inner.to - inner.from < 20 && Identifier.test(context.state.sliceDoc(inner.from, inner.to));
  if (!isWord && !context.explicit) return null;
  var options = [];
  for (var pos = inner; pos; pos = pos.parent) {
    if (ScopeNodes.has(pos.name)) options = options.concat(getScope(context.state.doc, pos));
  }
  return {
    options: options,
    from: isWord ? inner.from : context.pos,
    validFor: Identifier
  };
}

/**
A language provider based on the [Lezer JavaScript
parser](https://github.com/lezer-parser/javascript), extended with
highlighting and indentation information.
*/
var javascriptLanguage = /*@__PURE__*/LRLanguage.define({
  name: "javascript",
  parser: /*@__PURE__*/parser.configure({
    props: [/*@__PURE__*/indentNodeProp.add({
      IfStatement: /*@__PURE__*/continuedIndent({
        except: /^\s*({|else\b)/
      }),
      TryStatement: /*@__PURE__*/continuedIndent({
        except: /^\s*({|catch\b|finally\b)/
      }),
      LabeledStatement: flatIndent,
      SwitchBody: function SwitchBody(context) {
        var after = context.textAfter,
          closed = /^\s*\}/.test(after),
          isCase = /^\s*(case|default)\b/.test(after);
        return context.baseIndent + (closed ? 0 : isCase ? 1 : 2) * context.unit;
      },
      Block: /*@__PURE__*/delimitedIndent({
        closing: "}"
      }),
      ArrowFunction: function ArrowFunction(cx) {
        return cx.baseIndent + cx.unit;
      },
      "TemplateString BlockComment": function TemplateStringBlockComment() {
        return null;
      },
      "Statement Property": /*@__PURE__*/continuedIndent({
        except: /^{/
      }),
      JSXElement: function JSXElement(context) {
        var closed = /^\s*<\//.test(context.textAfter);
        return context.lineIndent(context.node.from) + (closed ? 0 : context.unit);
      },
      JSXEscape: function JSXEscape(context) {
        var closed = /\s*\}/.test(context.textAfter);
        return context.lineIndent(context.node.from) + (closed ? 0 : context.unit);
      },
      "JSXOpenTag JSXSelfClosingTag": function JSXOpenTagJSXSelfClosingTag(context) {
        return context.column(context.node.from) + context.unit;
      }
    }), /*@__PURE__*/foldNodeProp.add({
      "Block ClassBody SwitchBody EnumBody ObjectExpression ArrayExpression ObjectType": foldInside,
      BlockComment: function BlockComment(tree) {
        return {
          from: tree.from + 2,
          to: tree.to - 2
        };
      }
    })]
  }),
  languageData: {
    closeBrackets: {
      brackets: ["(", "[", "{", "'", '"', "`"]
    },
    commentTokens: {
      line: "//",
      block: {
        open: "/*",
        close: "*/"
      }
    },
    indentOnInput: /^\s*(?:case |default:|\{|\}|<\/)$/,
    wordChars: "$"
  }
});
var jsxSublanguage = {
  test: function test(node) {
    return /^JSX/.test(node.name);
  },
  facet: /*@__PURE__*/defineLanguageFacet({
    commentTokens: {
      block: {
        open: "{/*",
        close: "*/}"
      }
    }
  })
};
/**
A language provider for TypeScript.
*/
var typescriptLanguage = /*@__PURE__*/javascriptLanguage.configure({
  dialect: "ts"
}, "typescript");
/**
Language provider for JSX.
*/
var jsxLanguage = /*@__PURE__*/javascriptLanguage.configure({
  dialect: "jsx",
  props: [/*@__PURE__*/sublanguageProp.add(function (n) {
    return n.isTop ? [jsxSublanguage] : undefined;
  })]
});
/**
Language provider for JSX + TypeScript.
*/
var tsxLanguage = /*@__PURE__*/javascriptLanguage.configure({
  dialect: "jsx ts",
  props: [/*@__PURE__*/sublanguageProp.add(function (n) {
    return n.isTop ? [jsxSublanguage] : undefined;
  })]
}, "typescript");
var keywords = /*@__PURE__*/"break case const continue default delete export extends false finally in instanceof let new return static super switch this throw true typeof var yield".split(" ").map(function (kw) {
  return {
    label: kw,
    type: "keyword"
  };
});
/**
JavaScript support. Includes [snippet](https://codemirror.net/6/docs/ref/#lang-javascript.snippets)
completion.
*/
function javascript() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var lang = config.jsx ? config.typescript ? tsxLanguage : jsxLanguage : config.typescript ? typescriptLanguage : javascriptLanguage;
  return new LanguageSupport(lang, [javascriptLanguage.data.of({
    autocomplete: ifNotIn(dontComplete, completeFromList(snippets.concat(keywords)))
  }), javascriptLanguage.data.of({
    autocomplete: localCompletionSource
  }), config.jsx ? autoCloseTags : []]);
}
function findOpenTag(node) {
  for (;;) {
    if (node.name == "JSXOpenTag" || node.name == "JSXSelfClosingTag" || node.name == "JSXFragmentTag") return node;
    if (node.name == "JSXEscape" || !node.parent) return null;
    node = node.parent;
  }
}
function elementName(doc, tree) {
  var max = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : doc.length;
  for (var ch = tree === null || tree === void 0 ? void 0 : tree.firstChild; ch; ch = ch.nextSibling) {
    if (ch.name == "JSXIdentifier" || ch.name == "JSXBuiltin" || ch.name == "JSXNamespacedName" || ch.name == "JSXMemberExpression") return doc.sliceString(ch.from, Math.min(ch.to, max));
  }
  return "";
}
function isEndTag(node) {
  return node && (node.name == "JSXEndTag" || node.name == "JSXSelfCloseEndTag");
}
var android = (typeof navigator === "undefined" ? "undefined" : _typeof(navigator)) == "object" && /*@__PURE__*/ /Android\b/.test(navigator.userAgent);
/**
Extension that will automatically insert JSX close tags when a `>` or
`/` is typed.
*/
var autoCloseTags = /*@__PURE__*/EditorView.inputHandler.of(function (view, from, to, text) {
  if ((android ? view.composing : view.compositionStarted) || view.state.readOnly || from != to || text != ">" && text != "/" || !javascriptLanguage.isActiveAt(view.state, from, -1)) return false;
  var state = view.state;
  var changes = state.changeByRange(function (range) {
    var _a;
    var head = range.head,
      around = syntaxTree(state).resolveInner(head, -1),
      name;
    if (around.name == "JSXStartTag") around = around.parent;
    if (around.name == "JSXAttributeValue" && around.to > head) ;else if (text == ">" && around.name == "JSXFragmentTag") {
      return {
        range: EditorSelection.cursor(head + 1),
        changes: {
          from: head,
          insert: "></>"
        }
      };
    } else if (text == "/" && around.name == "JSXFragmentTag") {
      var empty = around.parent,
        base = empty === null || empty === void 0 ? void 0 : empty.parent;
      if (empty.from == head - 1 && ((_a = base.lastChild) === null || _a === void 0 ? void 0 : _a.name) != "JSXEndTag" && (name = elementName(state.doc, base === null || base === void 0 ? void 0 : base.firstChild, head))) {
        var insert = "/".concat(name, ">");
        return {
          range: EditorSelection.cursor(head + insert.length),
          changes: {
            from: head,
            insert: insert
          }
        };
      }
    } else if (text == ">") {
      var openTag = findOpenTag(around);
      if (openTag && !isEndTag(openTag.lastChild) && state.sliceDoc(head, head + 2) != "</" && (name = elementName(state.doc, openTag, head))) return {
        range: EditorSelection.cursor(head + 1),
        changes: {
          from: head,
          insert: "></".concat(name, ">")
        }
      };
    }
    return {
      range: range
    };
  });
  if (changes.changes.empty) return false;
  view.dispatch(changes, {
    userEvent: "input.type",
    scrollIntoView: true
  });
  return true;
});

export { javascript as j };
//# sourceMappingURL=codemirror-lan-2b6ad035.es.js.map
