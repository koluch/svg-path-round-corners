// @flow
/* eslint-disable no-magic-numbers */

// // Function for scaling vectors, keeping it's origin coordinates
// function scaleVector(p1, p2, factor) {
//     const { x: x1, y: y1 } = p1;
//     const { x: x2, y: y2 } = p2;
//     const x = x2 - x1;
//     const y = y2 - y1;
//     const dx = x - (x * factor);
//     const dy = y - (y * factor);
//
//     return {
//         x: x2 - dx,
//         y: y2 - dy,
//     };
// }
//
// function makeBezierPoints(p1, p2, p3, radius) {
//     // Angle between lines
//     const { PI, abs, sqrt, pow, acos, tan } = Math;
//     const { x: x1, y: y1 } = p1;
//     const { x: x2, y: y2 } = p2;
//     const { x: x3, y: y3 } = p3;
//     const a = sqrt(pow(abs(x2 - x1), 2) + pow(abs(y2 - y1), 2));
//     const b = sqrt(pow(abs(x3 - x2), 2) + pow(abs(y3 - y2), 2));
//     const c = sqrt(pow(abs(x3 - x1), 2) + pow(abs(y3 - y1), 2));
//     const angle = acos((pow(a, 2) + (pow(b, 2) - pow(c, 2))) / (2 * a * b)); // cos theoreme
//
//     // Angle between any side and line from circle center to angle vertex
//     const angle2 = (PI / 2) - (angle / 2);
//
//     // Distance between angle vertex and point where circle touches any side
//     const side = radius * tan(angle2);
//
//     // How much new sides becomes shorter
//     const aCoef = (a - side) / a;
//     const bCoef = (b - side) / b;
//
//     return [
//         scaleVector(p1, p2, aCoef),
//         scaleVector(p3, p2, bCoef),
//     ];
// }
//
// function buildData(path, radius) {
//     const result = [];
//
//     for (let i = 0; i < path.length; i += 1) {
//         const p1 = path[i % path.length];
//         const p2 = path[(i + 1) % path.length];
//         const p3 = path[(i + 2) % path.length];
//
//         const [c1, c2] = makeBezierPoints(p1, p2, p3, radius);
//
//         if (i === 0) {
//             result.push(
//                 ['M', c1.x, c1.y]
//             );
//         }
//
//         result.push(
//             ['L', c1.x, c1.y],
//             ['Q', p2.x, p2.y, c2.x, c2.y], // bottom-left radius
//         );
//     }
//
//     return result;
// }

// const data = buildData(path, radius / 2);


import type {TData, TDataCommand} from './types'

const ERROR_MAX_STRING_LENGTH = 15
const error = (msg: string, string: string, i: number) => {
    const textBefore = string.substr(0, i)
    const char = string.charAt(i)
    const textAfter = (string.length - i) > ERROR_MAX_STRING_LENGTH
        ? string.substr(i + 1, ERROR_MAX_STRING_LENGTH) + '...'
        : string.substr(i + 1)
    return Error(`${msg}; context (${i}): ${textBefore}[${char}]${textAfter} `)
}

const makeNumber = (numberString: string, string, i): number => {
    //todo: check format
    const result = Number(numberString)
    if (Number.isNaN(result)) {
        throw error(`Bad number format: "${numberString}"`, string, i)
    }
    return result
}

const parseArguments = (string, i): [number[], number] => {
    const result = []
    let nextI = i
    let number = ''
    while (nextI < string.length) {
        const char = string[nextI]
        //todo: parse \n too
        if (/\s/.test(char) || char === ',') {
            if (number !== '') {
                result.push(makeNumber(number, string, nextI));
                number = ''
            }
        }
        // todo: ged rid of regexp
        else if (/\d/.test(char)) {
            number += char
        }
        else if (char === '-') {
            if (number === '-') {
                throw error('Minus symbol in an unexpected place', string, nextI)
            }
            else if (number !== '') {
                result.push(makeNumber(number, string, nextI))
                number = '-'
            }
            else {
                number += char
            }
        }
        else if (char === '.') {
            number += char
        }
        else {
            break
        }
        nextI++
    }
    if (number !== '') {
        result.push(makeNumber(number, string, nextI))
    }
    return [result, nextI]
}


const parseArgumentsGeneral = (string: string, i: number, perCommand: number): [number[][], number] => {
    const [args, nextI] = parseArguments(string, i)

    if (perCommand === 0) {
        if (args.length !== 0) {
            throw error(`Wrong parameters count (${args.length}), should be ${perCommand} per command`, string, i)
        }
    }
    else {
        if (args.length === 0) {
            throw error(`Wrong parameters count (${args.length}), should be ${perCommand} per command`, string, i)
        }
        if (args.length % perCommand !== 0) {
            throw error(`Wrong parameters count (${args.length}), should be ${perCommand} per command`, string, i)
        }
    }

    const argGroups: number[][] = []
    for (let i = 0; i < args.length; i += perCommand) {
        const group = []
        for (let j = 0; j < perCommand; j++) {
            group.push(args[i + j])
        }
        argGroups.push(group)
    }
    return [argGroups, nextI]
}


const parseMove = (string, i, relative = false): [TDataCommand[], number] => {
    const [argGroups, nextI] = parseArgumentsGeneral(string, i, 2)
    const commands: TDataCommand[] = []
    for (let i = 0; i < argGroups.length; ++i) {
        if (relative) {
            commands.push({command: 'm', dx: argGroups[i][0], dy: argGroups[i][1]})
        }
        else {
            commands.push({command: 'M', x: argGroups[i][0], y: argGroups[i][1]})
        }
    }
    return [commands, nextI]
}

const parseClose = (string, i, relative = false): [TDataCommand[], number] => {
    const [_, nextI] = parseArgumentsGeneral(string, i, 0)
    return [[relative ? {command: 'z'} : {command: 'Z'}], nextI]
}

const parseLine = (string, i, relative = false): [TDataCommand[], number] => {
    const [argGroups, nextI] = parseArgumentsGeneral(string, i, 2)
    const commands: TDataCommand[] = []
    for (let i = 0; i < argGroups.length; ++i) {
        if (relative) {
            commands.push({command: 'l', dx: argGroups[i][0], dy: argGroups[i][1]})
        }
        else {
            commands.push({command: 'L', x: argGroups[i][0], y: argGroups[i][1]})
        }
    }
    return [commands, nextI]
}

const parseHorizontal = (string, i, relative = false): [TDataCommand[], number] => {
    const [argGroups, nextI] = parseArgumentsGeneral(string, i, 1)
    const commands: TDataCommand[] = []
    for (let i = 0; i < argGroups.length; ++i) {
        if (relative) {
            commands.push({command: 'h', dx: argGroups[i][0]})
        }
        else {
            commands.push({command: 'H', x: argGroups[i][0]})
        }
    }
    return [commands, nextI]
}

const parseVertical = (string, i, relative = false): [TDataCommand[], number] => {
    const [argGroups, nextI] = parseArgumentsGeneral(string, i, 1)
    const commands: TDataCommand[] = []
    for (let i = 0; i < argGroups.length; ++i) {
        if (relative) {
            commands.push({command: 'v', dy: argGroups[i][0]})
        }
        else {
            commands.push({command: 'V', y: argGroups[i][0]})
        }
    }
    return [commands, nextI]
}

const parseCurve = (string, i, relative = false): [TDataCommand[], number] => {
    const [argGroups, nextI] = parseArgumentsGeneral(string, i, 6)
    const commands: TDataCommand[] = []
    for (let i = 0; i < argGroups.length; ++i) {
        if (relative) {
            commands.push({
                command: 'c',
                dx1: argGroups[i][0],
                dy1: argGroups[i][1],
                dx2: argGroups[i][2],
                dy2: argGroups[i][3],
                dx: argGroups[i][4],
                dy: argGroups[i][5],
            })
        }
        else {
            commands.push({
                command: 'C',
                x1: argGroups[i][0],
                y1: argGroups[i][1],
                x2: argGroups[i][2],
                y2: argGroups[i][3],
                x: argGroups[i][4],
                y: argGroups[i][5],
            })
        }
    }
    return [commands, nextI]
}

const parseShortCurve = (string, i, relative = false): [TDataCommand[], number] => {
    const [argGroups, nextI] = parseArgumentsGeneral(string, i, 4)
    const commands: TDataCommand[] = []
    for (let i = 0; i < argGroups.length; ++i) {
        if (relative) {
            commands.push({
                command: 's',
                dx2: argGroups[i][0],
                dy2: argGroups[i][1],
                dx: argGroups[i][2],
                dy: argGroups[i][3],
            })
        }
        else {
            commands.push({
                command: 'S',
                x2: argGroups[i][0],
                y2: argGroups[i][1],
                x: argGroups[i][2],
                y: argGroups[i][3],
            })
        }
    }
    return [commands, nextI]
}

const parseQuadCurve = (string, i, relative = false): [TDataCommand[], number] => {
    const [argGroups, nextI] = parseArgumentsGeneral(string, i, 4)
    const commands: TDataCommand[] = []
    for (let i = 0; i < argGroups.length; ++i) {
        if (relative) {
            commands.push({
                command: 'q',
                dx1: argGroups[i][0],
                dy1: argGroups[i][1],
                dx: argGroups[i][2],
                dy: argGroups[i][3],
            })
        }
        else {
            commands.push({
                command: 'Q',
                x1: argGroups[i][0],
                y1: argGroups[i][1],
                x: argGroups[i][2],
                y: argGroups[i][3],
            })
        }
    }
    return [commands, nextI]
}

const parseShortQuadCurve = (string, i, relative = false): [TDataCommand[], number] => {
    const [argGroups, nextI] = parseArgumentsGeneral(string, i, 2)
    const commands: TDataCommand[] = []
    for (let i = 0; i < argGroups.length; ++i) {
        if (relative) {
            commands.push({
                command: 't',
                dx: argGroups[i][0],
                dy: argGroups[i][1],
            })
        }
        else {
            commands.push({
                command: 'T',
                x: argGroups[i][0],
                y: argGroups[i][1],
            })
        }
    }
    return [commands, nextI]
}

const parseArc = (string, i, relative = false): [TDataCommand[], number] => {
    const [argGroups, nextI] = parseArgumentsGeneral(string, i, 7)
    const commands: TDataCommand[] = []
    for (let i = 0; i < argGroups.length; ++i) {
        if (relative) {
            commands.push({
                command: 'a',
                rx: argGroups[i][0],
                ry: argGroups[i][1],
                xAxisRotation: argGroups[i][2],
                largeArcFlag: argGroups[i][3],
                sweepFlag: argGroups[i][4],
                dx: argGroups[i][5],
                dy: argGroups[i][6],
            })
        }
        else {
            commands.push({
                command: 'A',
                rx: argGroups[i][0],
                ry: argGroups[i][1],
                xAxisRotation: argGroups[i][2],
                largeArcFlag: argGroups[i][3],
                sweepFlag: argGroups[i][4],
                x: argGroups[i][5],
                y: argGroups[i][6],
            })
        }
    }
    return [commands, nextI]
}

export const parseNextCommand = (string: string, i: number) => {
    const ch = string[i]
    const commandStartI = i + 1
    switch (ch) {
        case 'M': return parseMove(string, commandStartI)
        case 'm': return parseMove(string, commandStartI, true)
        case 'Z': return parseClose(string, commandStartI)
        case 'z': return parseClose(string, commandStartI, true)
        case 'L': return parseLine(string, commandStartI)
        case 'l': return parseLine(string, commandStartI, true)
        case 'H': return parseHorizontal(string, commandStartI)
        case 'h': return parseHorizontal(string, commandStartI, true)
        case 'V': return parseVertical(string, commandStartI)
        case 'v': return parseVertical(string, commandStartI, true)
        case 'C': return parseCurve(string, commandStartI)
        case 'c': return parseCurve(string, commandStartI, true)
        case 'S': return parseShortCurve(string, commandStartI)
        case 's': return parseShortCurve(string, commandStartI, true)
        case 'Q': return parseQuadCurve(string, commandStartI)
        case 'q': return parseQuadCurve(string, commandStartI, true)
        case 'T': return parseShortQuadCurve(string, commandStartI)
        case 't': return parseShortQuadCurve(string, commandStartI, true)
        case 'A': return parseArc(string, commandStartI)
        case 'a': return parseArc(string, commandStartI, true)
        default: throw error(`Unknown command: ${ch}`, string, i)
    }
}

export const parse = (string: string): TData => {
    const result = []
    let i = 0
    while (i < string.length) {
        const [commands, nextI] = parseNextCommand(string, i)
        result.push(...commands)
        i = nextI
    }
    return result
}
