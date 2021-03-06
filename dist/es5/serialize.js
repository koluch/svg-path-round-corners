'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var formatArguments = function formatArguments(args) {
    return args.map(function (x, i) {
        return x < 0 || i === 0 ? '' + x : ' ' + x;
    }).join('');
};

var getArgumentsList = function getArgumentsList(c) {
    switch (c.c) {
        case 'M':
            return [c.x, c.y];
        case 'm':
            return [c.dx, c.dy];
        case 'Z':
            return [];
        case 'z':
            return [];
        case 'L':
            return [c.x, c.y];
        case 'l':
            return [c.dx, c.dy];
        case 'H':
            return [c.x];
        case 'h':
            return [c.dx];
        case 'V':
            return [c.y];
        case 'v':
            return [c.dy];
        case 'C':
            return [c.x1, c.y1, c.x2, c.y2, c.x, c.y];
        case 'c':
            return [c.dx1, c.dy1, c.dx2, c.dy2, c.dx, c.dy];
        case 'S':
            return [c.x2, c.y2, c.x, c.y];
        case 's':
            return [c.dx2, c.dy2, c.dx, c.dy];
        case 'Q':
            return [c.x1, c.y1, c.x, c.y];
        case 'q':
            return [c.dx1, c.dy1, c.dx, c.dy];
        case 'T':
            return [c.x, c.y];
        case 't':
            return [c.dx, c.dy];
        case 'A':
            return [c.rx, c.ry, c.xAxisRotation, c.largeArcFlag, c.sweepFlag, c.x, c.y];
        case 'a':
            return [c.rx, c.ry, c.xAxisRotation, c.largeArcFlag, c.sweepFlag, c.dx, c.dy];
        default:
            throw new Error('Wrong c: ' + c.c);
    }
};

var serialize = exports.serialize = function serialize(d) {
    var result = '';
    for (var i = 0; i < d.length; i++) {
        var _ref;

        var command = d[i];
        result += command.c;
        var commandGroup = [command];
        while (i < d.length - 1 && d[i + 1].c === command.c) {
            commandGroup.push(d[i + 1]);
            i++;
        }
        var allArguments = (_ref = []).concat.apply(_ref, _toConsumableArray(commandGroup.map(getArgumentsList)));
        result += formatArguments(allArguments);
    }
    return result;
};