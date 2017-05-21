// @flow
import type {TData, TPoint, TCommand, TRelativeCommand, TRelativeData, TAbsoluteData, TAbsoluteCommand, TSubPath} from './types'

export const makeCommandRelative = (p: TPoint, c: TCommand): TRelativeCommand => {
    switch (c.c) {
        case 'M': return {c: 'm', dx: c.x - p.x, dy: c.y - p.y}
        case 'Z': return {c: 'z'}
        case 'L': return {c: 'l', dx: c.x - p.x, dy: c.y - p.y}
        case 'H': return {c: 'h', dx: c.x - p.x}
        case 'V': return {c: 'v', dy: c.y - p.y}
        case 'C': return {c: 'c', dx1: c.x1 - p.x, dy1: c.y1 - p.y, dx2: c.x2 - p.x, dy2: c.y2 - p.y, dx: c.x - p.x, dy: c.y - p.y}
        case 'S': return {c: 's', dx2: c.x2 - p.x, dy2: c.y2 - p.y, dx: c.x - p.x, dy: c.y - p.y}
        case 'Q': return {c: 'q', dx1: c.x1 - p.x, dy1: c.y1 - p.y, dx: c.x - p.x, dy: c.y - p.y}
        case 'T': return {c: 't', dx: c.x - p.x, dy: c.y - p.y}
        case 'A': return {c: 'a', rx: c.rx, ry: c.ry, xAxisRotation: c.xAxisRotation, largeArcFlag: c.largeArcFlag, sweepFlag: c.sweepFlag, dx: c.x - p.x, dy: c.y - p.y}
        default: return c
    }
}

export const makeCommandAbsolute = (p: TPoint, c: TCommand): TAbsoluteCommand => {
    switch (c.c) {
        case 'm': return {c: 'M', x: p.x + c.dx, y: p.y + c.dy}
        case 'z': return {c: 'Z'}
        case 'l': return {c: 'L', x: p.x + c.dx, y: p.y + c.dy}
        case 'h': return {c: 'L', x: p.x + c.dx, y: p.y}
        case 'v': return {c: 'L', y: p.y + c.dy, x: p.x}
        case 'H': return {c: 'L', x: c.x, y: p.y}
        case 'V': return {c: 'L', y: c.y, x: p.x}
        case 'c': return {c: 'C', x1: p.x + c.dx1, y1: p.y + c.dy1, x2: p.x + c.dx2, y2: p.y + c.dy2, x: p.x + c.dx, y: p.y + c.dy}
        case 's': return {c: 'S', x2: p.x + c.dx2, y2: p.y + c.dy2, x: p.x + c.dx, y: p.y + c.dy}
        case 'q': return {c: 'Q', x1: p.x + c.dx1, y1: p.y + c.dy1, x: p.x + c.dx, y: p.y + c.dy}
        case 't': return {c: 'T', x: p.x + c.dx, y: p.y + c.dy}
        case 'a': return {c: 'A', rx: c.rx, ry: c.ry, xAxisRotation: c.xAxisRotation, largeArcFlag: c.largeArcFlag, sweepFlag: c.sweepFlag, x: p.x + c.dx, y: p.y + c.dy}
        default: return c
    }
}

export const applyCommand = (position: TPoint, begin: TPoint, c: TCommand): TPoint => {
    let dif: {+dx: number, +dy: number} = {dx: 0, dy: 0}

    if (c.c === 'm') dif = c
    else if (c.c === 'l') dif = c
    else if (c.c === 'c') dif = c
    else if (c.c === 's') dif = c
    else if (c.c === 'q') dif = c
    else if (c.c === 't') dif = c
    else if (c.c === 'a') dif = c
    else if (c.c === 'h') dif = {dx: c.dx, dy: 0}
    else if (c.c === 'v') dif = {dx: 0, dy: c.dy}
    else if (c.c === 'z') dif = {dx: begin.x - position.x, dy: begin.y - position.y}

    else if (c.c === 'V') return {x: position.x, y: c.y}
    else if (c.c === 'H') return {x: c.x, y: position.y}
    else if (c.c === 'Z') return begin
    else {
        return c
    }

    return {x: position.x + dif.dx, y: position.y + dif.dy}
}


export const makeDataRelative = (d: TData): TRelativeData => {
    const begin = {x: 0, y: 0}
    let position = {x: 0, y: 0}
    const result = []
    for (let i = 0; i < d.length; i++) {
        const command = d[i]
        const relativeCommand = makeCommandRelative(position, command)
        result.push(relativeCommand)
        position = applyCommand(position, begin, relativeCommand)
    }
    return result
}

export const makeDataAbsolute = (d: TData): TAbsoluteData => {
    let begin = {x: 0, y: 0}
    let position = {x: 0, y: 0}
    const result = []
    for (let i = 0; i < d.length; i++) {
        const command = d[i]
        const relativeCommand = makeCommandAbsolute(position, command)
        result.push(relativeCommand)
        position = applyCommand(position, begin, relativeCommand)

        if (command.c === 'M') {
            begin = command
        }
        else if (command.c === 'm') {
            begin = applyCommand(position, begin, relativeCommand)
        }
    }
    return result
}

export const getSubPaths = (d: TAbsoluteData): Array<TSubPath> => {
    if (d.length === 0) {
        return []
    }
    else if (d[0].c !== 'M' && d[0].c !== 'm') {
        throw new Error(`Path must start with an "M" or "m" command, not "${d[0].c}" `)
    }

    const result = []
    let nextSubPath = []
    let lastM = {c: 'M', x: 0, y: 0}
    d.forEach((command) => {
        if (command.c === 'M') {
            if (nextSubPath.length > 0) {
                result.push(nextSubPath)
            }
            nextSubPath = [command]
            lastM = command
        }
        else if (command.c === 'Z') {
            nextSubPath.push(command)
            result.push(nextSubPath)
            nextSubPath = []
        }
        else {
            if (nextSubPath.length === 0) {
                nextSubPath.push(lastM)
            }
            nextSubPath.push(command)
        }
    })
    if (nextSubPath.length > 0) {
        result.push(nextSubPath)
    }

    return result
}

export const isSubPathClosed = (begin: TPoint, d: TSubPath): boolean => {
    if (d.length < 2) {
        return true
    }
    const lastCommand = d[d.length - 1]
    if (lastCommand.c === 'Z') {
        return true
    }
    return lastCommand.x === begin.x && lastCommand.y === begin.y
}
