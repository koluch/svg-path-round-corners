// @flow
import test from 'tape'
import {parse, } from '../src/parse'
import {serialize} from '../src/serialize'

//todo: test new lines

test('parse move command', (t) => {
    t.deepEquals(parse('M10 315'), [{c: 'M', x: 10, y: 315}])
    t.deepEquals(parse('M 10 315'), [{c: 'M', x: 10, y: 315}])
    t.deepEquals(parse('M10 315 43 17'), [{c: 'M', x: 10, y: 315}, {c: 'M', x: 43, y: 17}])
    t.deepEquals(parse('M 10 315 43 17 9 217'), [{c: 'M', x: 10, y: 315}, {c: 'M', x: 43, y: 17}, {c: 'M', x: 9, y: 217}])
    t.end()
})

test('bad move commands', (t) => {
    t.throws(() => parse('M 10 315 12'))
    t.end()
})

test('parse two moves command', (t) => {
    t.deepEquals(parse('M 10 315 M 78 35'), [{c: 'M', x: 10, y: 315}, {c: 'M', x: 78, y: 35}])
    t.end()
})

test('parse several commands with bezier curves', (t) => {
    t.deepEquals(parse('M100,200 C100,100 250,100 250,200 S400,300 400,200 z'), [
        {c: 'M', x: 100, y: 200},
        {c: 'C', x1: 100, y1: 100, x2: 250, y2: 100, x: 250, y: 200},
        {c: 'S', x2: 400, y2: 300, x: 400, y: 200},
        {c: 'z'},
    ])
    t.end()
})

test('parse command with negative coordinate', (t) => {
    t.deepEquals(parse('M10 -315 Z'), [{c: 'M', x: 10, y: -315}, {c: 'Z'}])
    t.deepEquals(parse('M -10 315 Z'), [{c: 'M', x: -10, y: 315}, {c: 'Z'}])
    t.deepEquals(parse('M-10 315 Z'), [{c: 'M', x: -10, y: 315}, {c: 'Z'}])
    t.deepEquals(parse('M 10-315 Z'), [{c: 'M', x: 10, y: -315}, {c: 'Z'}])
    t.deepEquals(parse('M-10-315 Z'), [{c: 'M', x: -10, y: -315}, {c: 'Z'}])
    t.deepEquals(parse('M -10 -315 Z'), [{c: 'M', x: -10, y: -315}, {c: 'Z'}])
    t.end()
})

test('parse command with decimal coordinate', (t) => {
    t.deepEquals(parse('M10.5 -315 Z'), [{c: 'M', x: 10.5, y: -315}, {c: 'Z'}])
    t.deepEquals(parse('M-10.5 -315 Z'), [{c: 'M', x: -10.5, y: -315}, {c: 'Z'}])
    t.end()
})

test('parse command with wrong coordinate format', (t) => {
    t.throws(() => parse('M10- Z'))
    t.throws(() => parse('M10--10 Z'))
    t.throws(() => parse('M10-- Z'))
    t.throws(() => parse('M-10.5.5 -315 Z'))
    t.end()
})

test('parse and serialize commands', (t) => {
    t.deepEquals(serialize(parse('M10 315')), 'M10 315')
    t.deepEquals(serialize(parse('M 10 315')), 'M10 315')
    t.deepEquals(serialize(parse('M 10-315')), 'M10-315')
    t.deepEquals(serialize(parse('M-10-315')), 'M-10-315')
    t.deepEquals(serialize(parse('M-10 -315')), 'M-10-315')
    t.deepEquals(serialize(parse('M -10 -315Z')), 'M-10-315Z')
    t.deepEquals(serialize(parse('M100,200 C100,100 250,100 250,200 S400,300 400,200 z')), 'M100 200C100 100 250 100 250 200S400 300 400 200z')
    t.end()
})

test('parse and serialize multiple same commands', (t) => {
    t.deepEquals(
        serialize(parse('m170.587487,323.440013l0,-129.374998l0,0c0,-55.573651 43.484345,-100.625008 97.125012,-100.625008l0,0l0,0c25.759147,0 50.463273,10.601535 68.677764,29.472382c18.214476,18.870847 28.44724,44.465213 28.44724,71.152626l0,14.375002l27.749981,0l-55.499969,57.500025l-55.500022,-57.500025l27.750003,0l0,-14.375002c0,-23.817276 -18.636157,-43.124991 -41.62499,-43.124991l0,0l0,0c-22.988863,0 -41.625005,19.307716 -41.625005,43.124991l0,129.374998l-55.500014,0z')),
        'm170.587487 323.440013l0-129.374998 0 0c0-55.573651 43.484345-100.625008 97.125012-100.625008l0 0 0 0c25.759147 0 50.463273 10.601535 68.677764 29.472382 18.214476 18.870847 28.44724 44.465213 28.44724 71.152626l0 14.375002 27.749981 0-55.499969 57.500025-55.500022-57.500025 27.750003 0 0-14.375002c0-23.817276-18.636157-43.124991-41.62499-43.124991l0 0 0 0c-22.988863 0-41.625005 19.307716-41.625005 43.124991l0 129.374998-55.500014 0z',
    )
    t.end()
})
