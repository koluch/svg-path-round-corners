// @flow
export type TPoint = {x: number, y: number}

export type TAbsoluteCommand =
    | { command: 'M', x: number, y: number }
    | { command: 'Z'}
    | { command: 'L', x: number, y: number}
    | { command: 'C', x1: number, y1: number, x2: number, y2: number, x: number, y: number}
    | { command: 'S', x2: number, y2: number, x: number, y: number}
    | { command: 'Q', x1: number, y1: number, x: number, y: number}
    | { command: 'T', x: number, y: number}
    | { command: 'A', rx: number, ry: number, xAxisRotation: number, largeArcFlag: number, sweepFlag: number, x: number, y: number}

export type TRelativeCommand =
    | { command: 'm', dx: number, dy: number}
    | { command: 'z'}
    | { command: 'l', dx: number, dy: number}
    | { command: 'H', x: number}
    | { command: 'V', y: number}
    | { command: 'h', dx: number}
    | { command: 'v', dy: number}
    | { command: 'c', dx1: number, dy1: number, dx2: number, dy2: number, dx: number, dy: number}
    | { command: 's', dx2: number, dy2: number, dx: number, dy: number}
    | { command: 'q', dx1: number, dy1: number, dx: number, dy: number}
    | { command: 't', dx: number, dy: number}
    | { command: 'a', rx: number, ry: number, xAxisRotation: number, largeArcFlag: number, sweepFlag: number, dx: number, dy: number}

export type TCommand = TAbsoluteCommand | TRelativeCommand

export type TAbsoluteData = $ReadOnlyArray<TAbsoluteCommand>
export type TRelativeData = $ReadOnlyArray<TRelativeCommand>
export type TData = $ReadOnlyArray<TCommand>

export type TSubPath = TAbsoluteData

// // @flow
// export type TAbsoluteCommand = { command: 'M', x: number }
// export type TCommand = { command: 'M', x: number } | { command: 'm', dx: number}
//
// export type TAbsoluteData = Array<TAbsoluteCommand>
// export type TData = Array<TCommand>
//
// const c1: TAbsoluteCommand = {command: 'M', x: 0, y: 0} // ok
// const c2: TCommand = {command: 'M', x: 0, y: 0} // ok
// const c3: TCommand = c1  // ok
//
// const d1: TAbsoluteData = [{command: 'M', x: 0, y: 0}] // ok
// const d2: TData = [{command: 'M', x: 0, y: 0}] // ok
// const d3: TData = d1  // error!
//
