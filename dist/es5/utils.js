'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var makeCommandAbsolute = exports.makeCommandAbsolute = function makeCommandAbsolute(p, c) {
    switch (c.c) {
        case 'm':
            return { c: 'M', x: p.x + c.dx, y: p.y + c.dy };
        case 'z':
            return { c: 'Z' };
        case 'l':
            return { c: 'L', x: p.x + c.dx, y: p.y + c.dy };
        case 'h':
            return { c: 'L', x: p.x + c.dx, y: p.y };
        case 'v':
            return { c: 'L', y: p.y + c.dy, x: p.x };
        case 'H':
            return { c: 'L', x: c.x, y: p.y };
        case 'V':
            return { c: 'L', y: c.y, x: p.x };
        case 'c':
            return { c: 'C', x1: p.x + c.dx1, y1: p.y + c.dy1, x2: p.x + c.dx2, y2: p.y + c.dy2, x: p.x + c.dx, y: p.y + c.dy };
        case 's':
            return { c: 'S', x2: p.x + c.dx2, y2: p.y + c.dy2, x: p.x + c.dx, y: p.y + c.dy };
        case 'q':
            return { c: 'Q', x1: p.x + c.dx1, y1: p.y + c.dy1, x: p.x + c.dx, y: p.y + c.dy };
        case 't':
            return { c: 'T', x: p.x + c.dx, y: p.y + c.dy };
        case 'a':
            return { c: 'A', rx: c.rx, ry: c.ry, xAxisRotation: c.xAxisRotation, largeArcFlag: c.largeArcFlag, sweepFlag: c.sweepFlag, x: p.x + c.dx, y: p.y + c.dy };
        default:
            return c;
    }
};
var applyCommand = exports.applyCommand = function applyCommand(position, begin, c) {
    var dif = { dx: 0, dy: 0 };

    if (c.c === 'm') dif = c;else if (c.c === 'l') dif = c;else if (c.c === 'c') dif = c;else if (c.c === 's') dif = c;else if (c.c === 'q') dif = c;else if (c.c === 't') dif = c;else if (c.c === 'a') dif = c;else if (c.c === 'h') dif = { dx: c.dx, dy: 0 };else if (c.c === 'v') dif = { dx: 0, dy: c.dy };else if (c.c === 'z') dif = { dx: begin.x - position.x, dy: begin.y - position.y };else if (c.c === 'V') return { x: position.x, y: c.y };else if (c.c === 'H') return { x: c.x, y: position.y };else if (c.c === 'Z') return begin;else {
        return c;
    }

    return { x: position.x + dif.dx, y: position.y + dif.dy };
};

var normalizeData = exports.normalizeData = function normalizeData(d) {
    var begin = { x: 0, y: 0 };
    var position = { x: 0, y: 0 };
    var result = [];
    for (var i = 0; i < d.length; i++) {
        var command = d[i];
        var absoluteCommand = makeCommandAbsolute(position, command);
        var newPosition = applyCommand(position, begin, absoluteCommand);

        // Filter line commands which doesn't change position
        var isLineCommand = absoluteCommand.c === 'L' || absoluteCommand.c === 'Z';
        if (!isLineCommand || !pointEquals(newPosition, position)) {
            result.push(absoluteCommand);
            position = newPosition;
        }

        if (absoluteCommand.c === 'M') {
            begin = absoluteCommand;
        } else if (absoluteCommand.c === 'm') {
            begin = applyCommand(position, begin, absoluteCommand);
        }
    }
    return result;
};

var getSubPaths = exports.getSubPaths = function getSubPaths(d) {
    if (d.length === 0) {
        return [];
    } else if (d[0].c !== 'M' && d[0].c !== 'm') {
        throw new Error('Path must start with an "M" or "m" command, not "' + d[0].c + '" ');
    }

    var result = [];
    var nextSubPath = [];
    var lastM = { c: 'M', x: 0, y: 0 };
    d.forEach(function (command) {
        if (command.c === 'M') {
            if (nextSubPath.length > 0) {
                result.push(nextSubPath);
            }
            nextSubPath = [command];
            lastM = command;
        } else if (command.c === 'Z') {
            nextSubPath.push(command);
            result.push(nextSubPath);
            nextSubPath = [];
        } else {
            if (nextSubPath.length === 0) {
                nextSubPath.push(lastM);
            }
            nextSubPath.push(command);
        }
    });
    if (nextSubPath.length > 0) {
        result.push(nextSubPath);
    }

    return result;
};

var isSubPathClosed = exports.isSubPathClosed = function isSubPathClosed(begin, d) {
    if (d.length < 2) {
        return true;
    }
    var lastCommand = d[d.length - 1];
    if (lastCommand.c === 'Z') {
        return true;
    }
    return lastCommand.x === begin.x && lastCommand.y === begin.y;
};

var pointEquals = exports.pointEquals = function pointEquals(p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
};