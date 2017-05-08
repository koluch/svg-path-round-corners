// @flow

export type TDataCommand = {
    command: 'M',
    x: number,
    y: number,
} | {
    command: 'm',
    dx: number,
    dy: number,
} | {
    command: 'Z',
} | {
    command: 'z',
} | {
    command: 'L',
    x: number,
    y: number,
} | {
    command: 'l',
    dx: number,
    dy: number,
} | {
    command: 'H',
    x: number,
} | {
    command: 'h',
    dx: number,
} | {
    command: 'V',
    y: number,
} | {
    command: 'v',
    dy: number,
} | {
    command: 'C',
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x: number,
    y: number,
} | {
    command: 'c',
    dx1: number,
    dy1: number,
    dx2: number,
    dy2: number,
    dx: number,
    dy: number,
} | {
    command: 'S',
    x2: number,
    y2: number,
    x: number,
    y: number,
} | {
    command: 's',
    dx2: number,
    dy2: number,
    dx: number,
    dy: number,
} | {
    command: 'Q',
    x1: number,
    y1: number,
    x: number,
    y: number,
} | {
    command: 'q',
    dx1: number,
    dy1: number,
    dx: number,
    dy: number,
} | {
    command: 'T',
    x: number,
    y: number,
} | {
    command: 't',
    dx: number,
    dy: number,
} | {
    command: 'A',
    rx: number,
    ry: number,
    xAxisRotation: number,
    largeArcFlag: number,
    sweepFlag: number,
    x: number,
    y: number,
} | {
    command: 'a',
    rx: number,
    ry: number,
    xAxisRotation: number,
    largeArcFlag: number,
    sweepFlag: number,
    dx: number,
    dy: number,
}

export type TData = Array<TDataCommand>
