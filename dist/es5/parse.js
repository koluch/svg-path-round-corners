'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var ERROR_MAX_STRING_LENGTH = 15;
/* eslint-disable no-magic-numbers */

var error = function error(msg, string, i) {
    var textBefore = string.substr(0, i);
    var char = string.charAt(i);
    var textAfter = string.length - i > ERROR_MAX_STRING_LENGTH ? string.substr(i + 1, ERROR_MAX_STRING_LENGTH) + '...' : string.substr(i + 1);
    return Error(msg + '; context (' + i + '): ' + textBefore + '[' + char + ']' + textAfter + ' ');
};

var makeNumber = function makeNumber(numberString, string, i) {
    //todo: check format
    var result = Number(numberString);
    if (Number.isNaN(result)) {
        throw error('Bad number format: "' + numberString + '"', string, i);
    }
    return result;
};

var parseArguments = function parseArguments(string, i) {
    var result = [];
    var nextI = i;
    var number = '';
    while (nextI < string.length) {
        var char = string[nextI];
        //todo: parse \n too
        if (/\s/.test(char) || char === ',') {
            if (number !== '') {
                result.push(makeNumber(number, string, nextI));
                number = '';
            }
        }
        // todo: ged rid of regexp
        else if (/\d/.test(char)) {
                number += char;
            } else if (char === '-') {
                if (number === '-') {
                    throw error('Minus symbol in an unexpected place', string, nextI);
                } else if (number !== '') {
                    result.push(makeNumber(number, string, nextI));
                    number = '-';
                } else {
                    number += char;
                }
            } else if (char === '.') {
                number += char;
            } else {
                break;
            }
        nextI++;
    }
    if (number !== '') {
        result.push(makeNumber(number, string, nextI));
    }
    return [result, nextI];
};

var parseArgumentsGeneral = function parseArgumentsGeneral(string, i, perCommand) {
    var _parseArguments = parseArguments(string, i),
        _parseArguments2 = _slicedToArray(_parseArguments, 2),
        args = _parseArguments2[0],
        nextI = _parseArguments2[1];

    if (perCommand === 0) {
        if (args.length !== 0) {
            throw error('Wrong parameters count (' + args.length + '), should be ' + perCommand + ' per command', string, i);
        }
    } else {
        if (args.length === 0) {
            throw error('Wrong parameters count (' + args.length + '), should be ' + perCommand + ' per command', string, i);
        }
        if (args.length % perCommand !== 0) {
            throw error('Wrong parameters count (' + args.length + '), should be ' + perCommand + ' per command', string, i);
        }
    }

    var argGroups = [];
    for (var _i = 0; _i < args.length; _i += perCommand) {
        var group = [];
        for (var j = 0; j < perCommand; j++) {
            group.push(args[_i + j]);
        }
        argGroups.push(group);
    }
    return [argGroups, nextI];
};

var parseMove = function parseMove(string, i) {
    var relative = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var _parseArgumentsGenera = parseArgumentsGeneral(string, i, 2),
        _parseArgumentsGenera2 = _slicedToArray(_parseArgumentsGenera, 2),
        argGroups = _parseArgumentsGenera2[0],
        nextI = _parseArgumentsGenera2[1];

    var commands = [];
    for (var _i2 = 0; _i2 < argGroups.length; ++_i2) {
        if (relative) {
            commands.push({ c: 'm', dx: argGroups[_i2][0], dy: argGroups[_i2][1] });
        } else {
            commands.push({ c: 'M', x: argGroups[_i2][0], y: argGroups[_i2][1] });
        }
    }
    return [commands, nextI];
};

var parseClose = function parseClose(string, i) {
    var relative = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var _parseArgumentsGenera3 = parseArgumentsGeneral(string, i, 0),
        _parseArgumentsGenera4 = _slicedToArray(_parseArgumentsGenera3, 2),
        _ = _parseArgumentsGenera4[0],
        nextI = _parseArgumentsGenera4[1];

    return [[relative ? { c: 'z' } : { c: 'Z' }], nextI];
};

var parseLine = function parseLine(string, i) {
    var relative = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var _parseArgumentsGenera5 = parseArgumentsGeneral(string, i, 2),
        _parseArgumentsGenera6 = _slicedToArray(_parseArgumentsGenera5, 2),
        argGroups = _parseArgumentsGenera6[0],
        nextI = _parseArgumentsGenera6[1];

    var commands = [];
    for (var _i3 = 0; _i3 < argGroups.length; ++_i3) {
        if (relative) {
            commands.push({ c: 'l', dx: argGroups[_i3][0], dy: argGroups[_i3][1] });
        } else {
            commands.push({ c: 'L', x: argGroups[_i3][0], y: argGroups[_i3][1] });
        }
    }
    return [commands, nextI];
};

var parseHorizontal = function parseHorizontal(string, i) {
    var relative = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var _parseArgumentsGenera7 = parseArgumentsGeneral(string, i, 1),
        _parseArgumentsGenera8 = _slicedToArray(_parseArgumentsGenera7, 2),
        argGroups = _parseArgumentsGenera8[0],
        nextI = _parseArgumentsGenera8[1];

    var commands = [];
    for (var _i4 = 0; _i4 < argGroups.length; ++_i4) {
        if (relative) {
            commands.push({ c: 'h', dx: argGroups[_i4][0] });
        } else {
            commands.push({ c: 'H', x: argGroups[_i4][0] });
        }
    }
    return [commands, nextI];
};

var parseVertical = function parseVertical(string, i) {
    var relative = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var _parseArgumentsGenera9 = parseArgumentsGeneral(string, i, 1),
        _parseArgumentsGenera10 = _slicedToArray(_parseArgumentsGenera9, 2),
        argGroups = _parseArgumentsGenera10[0],
        nextI = _parseArgumentsGenera10[1];

    var commands = [];
    for (var _i5 = 0; _i5 < argGroups.length; ++_i5) {
        if (relative) {
            commands.push({ c: 'v', dy: argGroups[_i5][0] });
        } else {
            commands.push({ c: 'V', y: argGroups[_i5][0] });
        }
    }
    return [commands, nextI];
};

var parseCurve = function parseCurve(string, i) {
    var relative = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var _parseArgumentsGenera11 = parseArgumentsGeneral(string, i, 6),
        _parseArgumentsGenera12 = _slicedToArray(_parseArgumentsGenera11, 2),
        argGroups = _parseArgumentsGenera12[0],
        nextI = _parseArgumentsGenera12[1];

    var commands = [];
    for (var _i6 = 0; _i6 < argGroups.length; ++_i6) {
        if (relative) {
            commands.push({
                c: 'c',
                dx1: argGroups[_i6][0],
                dy1: argGroups[_i6][1],
                dx2: argGroups[_i6][2],
                dy2: argGroups[_i6][3],
                dx: argGroups[_i6][4],
                dy: argGroups[_i6][5]
            });
        } else {
            commands.push({
                c: 'C',
                x1: argGroups[_i6][0],
                y1: argGroups[_i6][1],
                x2: argGroups[_i6][2],
                y2: argGroups[_i6][3],
                x: argGroups[_i6][4],
                y: argGroups[_i6][5]
            });
        }
    }
    return [commands, nextI];
};

var parseShortCurve = function parseShortCurve(string, i) {
    var relative = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var _parseArgumentsGenera13 = parseArgumentsGeneral(string, i, 4),
        _parseArgumentsGenera14 = _slicedToArray(_parseArgumentsGenera13, 2),
        argGroups = _parseArgumentsGenera14[0],
        nextI = _parseArgumentsGenera14[1];

    var commands = [];
    for (var _i7 = 0; _i7 < argGroups.length; ++_i7) {
        if (relative) {
            commands.push({
                c: 's',
                dx2: argGroups[_i7][0],
                dy2: argGroups[_i7][1],
                dx: argGroups[_i7][2],
                dy: argGroups[_i7][3]
            });
        } else {
            commands.push({
                c: 'S',
                x2: argGroups[_i7][0],
                y2: argGroups[_i7][1],
                x: argGroups[_i7][2],
                y: argGroups[_i7][3]
            });
        }
    }
    return [commands, nextI];
};

var parseQuadCurve = function parseQuadCurve(string, i) {
    var relative = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var _parseArgumentsGenera15 = parseArgumentsGeneral(string, i, 4),
        _parseArgumentsGenera16 = _slicedToArray(_parseArgumentsGenera15, 2),
        argGroups = _parseArgumentsGenera16[0],
        nextI = _parseArgumentsGenera16[1];

    var commands = [];
    for (var _i8 = 0; _i8 < argGroups.length; ++_i8) {
        if (relative) {
            commands.push({
                c: 'q',
                dx1: argGroups[_i8][0],
                dy1: argGroups[_i8][1],
                dx: argGroups[_i8][2],
                dy: argGroups[_i8][3]
            });
        } else {
            commands.push({
                c: 'Q',
                x1: argGroups[_i8][0],
                y1: argGroups[_i8][1],
                x: argGroups[_i8][2],
                y: argGroups[_i8][3]
            });
        }
    }
    return [commands, nextI];
};

var parseShortQuadCurve = function parseShortQuadCurve(string, i) {
    var relative = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var _parseArgumentsGenera17 = parseArgumentsGeneral(string, i, 2),
        _parseArgumentsGenera18 = _slicedToArray(_parseArgumentsGenera17, 2),
        argGroups = _parseArgumentsGenera18[0],
        nextI = _parseArgumentsGenera18[1];

    var commands = [];
    for (var _i9 = 0; _i9 < argGroups.length; ++_i9) {
        if (relative) {
            commands.push({
                c: 't',
                dx: argGroups[_i9][0],
                dy: argGroups[_i9][1]
            });
        } else {
            commands.push({
                c: 'T',
                x: argGroups[_i9][0],
                y: argGroups[_i9][1]
            });
        }
    }
    return [commands, nextI];
};

var parseArc = function parseArc(string, i) {
    var relative = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var _parseArgumentsGenera19 = parseArgumentsGeneral(string, i, 7),
        _parseArgumentsGenera20 = _slicedToArray(_parseArgumentsGenera19, 2),
        argGroups = _parseArgumentsGenera20[0],
        nextI = _parseArgumentsGenera20[1];

    var commands = [];
    for (var _i10 = 0; _i10 < argGroups.length; ++_i10) {
        if (relative) {
            commands.push({
                c: 'a',
                rx: argGroups[_i10][0],
                ry: argGroups[_i10][1],
                xAxisRotation: argGroups[_i10][2],
                largeArcFlag: argGroups[_i10][3],
                sweepFlag: argGroups[_i10][4],
                dx: argGroups[_i10][5],
                dy: argGroups[_i10][6]
            });
        } else {
            commands.push({
                c: 'A',
                rx: argGroups[_i10][0],
                ry: argGroups[_i10][1],
                xAxisRotation: argGroups[_i10][2],
                largeArcFlag: argGroups[_i10][3],
                sweepFlag: argGroups[_i10][4],
                x: argGroups[_i10][5],
                y: argGroups[_i10][6]
            });
        }
    }
    return [commands, nextI];
};

var parseNextCommand = exports.parseNextCommand = function parseNextCommand(string, i) {
    var ch = string[i];
    var commandStartI = i + 1;
    switch (ch) {
        case 'M':
            return parseMove(string, commandStartI);
        case 'm':
            return parseMove(string, commandStartI, true);
        case 'Z':
            return parseClose(string, commandStartI);
        case 'z':
            return parseClose(string, commandStartI, true);
        case 'L':
            return parseLine(string, commandStartI);
        case 'l':
            return parseLine(string, commandStartI, true);
        case 'H':
            return parseHorizontal(string, commandStartI);
        case 'h':
            return parseHorizontal(string, commandStartI, true);
        case 'V':
            return parseVertical(string, commandStartI);
        case 'v':
            return parseVertical(string, commandStartI, true);
        case 'C':
            return parseCurve(string, commandStartI);
        case 'c':
            return parseCurve(string, commandStartI, true);
        case 'S':
            return parseShortCurve(string, commandStartI);
        case 's':
            return parseShortCurve(string, commandStartI, true);
        case 'Q':
            return parseQuadCurve(string, commandStartI);
        case 'q':
            return parseQuadCurve(string, commandStartI, true);
        case 'T':
            return parseShortQuadCurve(string, commandStartI);
        case 't':
            return parseShortQuadCurve(string, commandStartI, true);
        case 'A':
            return parseArc(string, commandStartI);
        case 'a':
            return parseArc(string, commandStartI, true);
        default:
            throw error('Unknown c: ' + ch, string, i);
    }
};

var parse = exports.parse = function parse(string) {
    var result = [];
    var i = 0;
    while (i < string.length) {
        var _parseNextCommand = parseNextCommand(string, i),
            _parseNextCommand2 = _slicedToArray(_parseNextCommand, 2),
            commands = _parseNextCommand2[0],
            nextI = _parseNextCommand2[1];

        result.push.apply(result, _toConsumableArray(commands));
        i = nextI;
    }
    return result;
};