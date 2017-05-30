'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.roundCorners = exports.roundSubPath = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _utils = require('./utils');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

// Function for scaling vectors, keeping it's origin coordinates
var scaleVector = function scaleVector(p1, p2, factor) {
    var x1 = p1.x,
        y1 = p1.y;
    var x2 = p2.x,
        y2 = p2.y;

    var x = x2 - x1;
    var y = y2 - y1;
    var dx = x - x * factor;
    var dy = y - y * factor;

    return {
        x: x2 - dx,
        y: y2 - dy
    };
};

var makeBezierPoints = function makeBezierPoints(p1, p2, p3, radius) {
    // Angle between lines
    var PI = Math.PI,
        abs = Math.abs,
        sqrt = Math.sqrt,
        pow = Math.pow,
        acos = Math.acos,
        tan = Math.tan;
    var x1 = p1.x,
        y1 = p1.y;
    var x2 = p2.x,
        y2 = p2.y;
    var x3 = p3.x,
        y3 = p3.y;

    var a = sqrt(pow(abs(x2 - x1), 2) + pow(abs(y2 - y1), 2));
    var b = sqrt(pow(abs(x3 - x2), 2) + pow(abs(y3 - y2), 2));
    var c = sqrt(pow(abs(x3 - x1), 2) + pow(abs(y3 - y1), 2));
    var angle = acos((pow(a, 2) + (pow(b, 2) - pow(c, 2))) / (2 * a * b)); // cos theoreme

    // Angle between any side and line from circle center to angle vertex
    var angle2 = PI / 2 - angle / 2;

    // Distance between angle vertex and point where circle touches any side
    var side = radius * tan(angle2);

    // How much new sides becomes shorter
    var aCoef = (a - side) / a;
    var bCoef = (b - side) / b;

    return [scaleVector(p1, p2, aCoef), scaleVector(p3, p2, bCoef)];
};

var roundSubPath = exports.roundSubPath = function roundSubPath(subpath, radius) {
    if (subpath.length === 0) {
        throw new Error('Sub-path could not be empty (it should contain an M command at least');
    }

    // It's impossible to draw a corner if there are less then a 2 command
    if (subpath.length < 2) {
        return subpath;
    }

    // First command should always be an 'M' command
    var mCommand = subpath[0];
    if (mCommand.c !== 'M') {
        throw new Error('Wrong sub-path data, first command should always by an \'M\' command, not "' + mCommand.c + '"');
    }

    var begin = (0, _utils.applyCommand)({ x: 0, y: 0 }, { x: 0, y: 0 }, mCommand);
    subpath = subpath.slice(1);

    var isClosed = (0, _utils.isSubPathClosed)(begin, subpath);

    var result = [];
    var position = begin;
    for (var i = 0; i < subpath.length; i++) {
        var command1 = subpath[i];
        var command2 = subpath[(i + 1) % subpath.length];
        // const command3 = subpath[(i + 2) % subpath.length]
        var isLastCommand = i === subpath.length - 1;

        var isCorner = (command1.c === 'L' || command1.c === 'Z') && (command2.c === 'L' || command2.c === 'Z');

        if (!isCorner) {
            result.push(command1);
        } else if (isLastCommand && !isClosed) {
            result.push(command1);
        } else {
            var p1 = position;
            var p2 = null;
            var p3 = null;

            if (command1.c === 'L') {
                p2 = { x: command1.x, y: command1.y };
            } else if (command1.c === 'Z') {
                p2 = begin;
            }

            if (command2.c === 'L') {
                p3 = { x: command2.x, y: command2.y };
            } else if (command2.c === 'Z') {
                p3 = begin;
            }

            if (!p1 || !p2 || !p3) {
                throw new Error('Variables weren\'t initialized (some command combination cases weren\'t' + ' handled, this is an internal bug for sure)');
            }

            // Point should not be equals, because makeBezierPoints fails on zero-length triangle sides
            if ((0, _utils.pointEquals)(p1, p2) || (0, _utils.pointEquals)(p2, p3) || (0, _utils.pointEquals)(p1, p3)) {
                result.push(command1);
            } else {
                var _makeBezierPoints = makeBezierPoints(p1, p2, p3, radius),
                    _makeBezierPoints2 = _slicedToArray(_makeBezierPoints, 2),
                    q1 = _makeBezierPoints2[0],
                    q2 = _makeBezierPoints2[1];

                result.push({ c: 'L', x: q1.x, y: q1.y });
                result.push({
                    c: 'Q',
                    x1: p2.x,
                    y1: p2.y,
                    x: q2.x,
                    y: q2.y
                });
                if (isLastCommand) {
                    begin = q2;
                }
            }
        }
        position = (0, _utils.applyCommand)(position, begin, command1);
    }

    return [{ c: 'M', x: begin.x, y: begin.y }].concat(result);
};

var roundCorners = function roundCorners(d) {
    var _ref;

    var radius = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    var absD = (0, _utils.normalizeData)(d);
    var subPaths = (0, _utils.getSubPaths)(absD);

    var roundedSubPaths = subPaths.map(function (subPath) {
        return roundSubPath(subPath, radius);
    });

    var _a = { a: 12 },
        a = _a.a,
        rest = _objectWithoutProperties(_a, ['a']);

    return (_ref = []).concat.apply(_ref, _toConsumableArray(roundedSubPaths));
};
exports.roundCorners = roundCorners;