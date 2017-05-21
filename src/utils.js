// @flow
import type {TData, TPoint, TCommand, TRelativeCommand, TRelativeData, TAbsoluteData, TAbsoluteCommand, TSubPath} from './types'

export const makeCommandRelative = (p: TPoint, c: TCommand): TRelativeCommand => {
    switch (c.command) {
        case 'M': return {command: 'm', dx: c.x - p.x, dy: c.y - p.y}
        case 'Z': return {command: 'z'}
        case 'L': return {command: 'l', dx: c.x - p.x, dy: c.y - p.y}
        case 'H': return {command: 'h', dx: c.x - p.x}
        case 'V': return {command: 'v', dy: c.y - p.y}
        case 'C': return {command: 'c', dx1: c.x1 - p.x, dy1: c.y1 - p.y, dx2: c.x2 - p.x, dy2: c.y2 - p.y, dx: c.x - p.x, dy: c.y - p.y}
        case 'S': return {command: 's', dx2: c.x2 - p.x, dy2: c.y2 - p.y, dx: c.x - p.x, dy: c.y - p.y}
        case 'Q': return {command: 'q', dx1: c.x1 - p.x, dy1: c.y1 - p.y, dx: c.x - p.x, dy: c.y - p.y}
        case 'T': return {command: 't', dx: c.x - p.x, dy: c.y - p.y}
        case 'A': return {command: 'a', rx: c.rx, ry: c.ry, xAxisRotation: c.xAxisRotation, largeArcFlag: c.largeArcFlag, sweepFlag: c.sweepFlag, dx: c.x - p.x, dy: c.y - p.y}
        default: return c
    }
}

export const makeCommandAbsolute = (p: TPoint, c: TCommand): TAbsoluteCommand => {
    switch (c.command) {
        case 'm': return {command: 'M', x: p.x + c.dx, y: p.y + c.dy}
        case 'z': return {command: 'Z'}
        case 'l': return {command: 'L', x: p.x + c.dx, y: p.y + c.dy}
        case 'h': return {command: 'L', x: p.x + c.dx, y: p.y}
        case 'v': return {command: 'L', y: p.y + c.dy, x: p.x}
        case 'H': return {command: 'L', x: c.x, y: p.y}
        case 'V': return {command: 'L', y: c.y, x: p.x}
        case 'c': return {command: 'C', x1: p.x + c.dx1, y1: p.y + c.dy1, x2: p.x + c.dx2, y2: p.y + c.dy2, x: p.x + c.dx, y: p.y + c.dy}
        case 's': return {command: 'S', x2: p.x + c.dx2, y2: p.y + c.dy2, x: p.x + c.dx, y: p.y + c.dy}
        case 'q': return {command: 'Q', x1: p.x + c.dx1, y1: p.y + c.dy1, x: p.x + c.dx, y: p.y + c.dy}
        case 't': return {command: 'T', x: p.x + c.dx, y: p.y + c.dy}
        case 'a': return {command: 'A', rx: c.rx, ry: c.ry, xAxisRotation: c.xAxisRotation, largeArcFlag: c.largeArcFlag, sweepFlag: c.sweepFlag, x: p.x + c.dx, y: p.y + c.dy}
        default: return c
    }
}

export const applyCommand = (position: TPoint, begin: TPoint, c: TCommand): TPoint => {
    let dif: {+dx: number, +dy: number} = {dx: 0, dy: 0}

    if (c.command === 'm') dif = c
    else if (c.command === 'l') dif = c
    else if (c.command === 'c') dif = c
    else if (c.command === 's') dif = c
    else if (c.command === 'q') dif = c
    else if (c.command === 't') dif = c
    else if (c.command === 'a') dif = c
    else if (c.command === 'h') dif = {dx: c.dx, dy: 0}
    else if (c.command === 'v') dif = {dx: 0, dy: c.dy}
    else if (c.command === 'z') dif = {dx: begin.x - position.x, dy: begin.y - position.y}

    else if (c.command === 'V') return {x: position.x, y: c.y}
    else if (c.command === 'H') return {x: c.x, y: position.y}
    else if (c.command === 'Z') return begin
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

        if (command.command === 'M') {
            begin = command
        }
        else if (command.command === 'm') {
            begin = applyCommand(position, begin, relativeCommand)
        }
    }
    return result
}

export const getSubPaths = (d: TAbsoluteData): Array<TSubPath> => {
    if (d.length === 0) {
        return []
    }
    else if (d[0].command !== 'M' && d[0].command !== 'm') {
        throw new Error(`Path must start with an "M" or "m" command, not "${d[0].command}" `)
    }

    const result = []
    let nextSubPath = []
    let lastM = {command: 'M', x: 0, y: 0}
    d.forEach((command) => {
        if (command.command === 'M') {
            if (nextSubPath.length > 0) {
                result.push(nextSubPath)
            }
            nextSubPath = [command]
            lastM = command
        }
        else if (command.command === 'Z') {
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
    if (lastCommand.command === 'Z') {
        return true
    }
    return lastCommand.x === begin.x && lastCommand.y === begin.y
}
